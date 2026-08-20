import { afterEach, describe, expect, it } from "vitest";
import pkg from "../content/l2e-exploring-emerging-digital-technologies/package.json";
import { getContentEngine } from "./content/engine";
import { applyL2eCurriculum } from "./curriculum/apply-runtime";
import type { ContentPackage } from "./curriculum/from-package";
import { weekPageFromPackage } from "./curriculum/from-package";

const bundled = pkg as ContentPackage;

afterEach(() => {
  delete window.__lpPackage;
  delete window.__lpPublishedCurriculum;
  document.body.removeAttribute("data-curriculum-source");
  document.body.removeAttribute("data-publication-state");
});

function publishedRow(overrides: Record<string, unknown> = {}) {
  return {
    hub_code: "l2e-exploring-emerging-digital-technologies",
    course_key: "gateway-level-2-digital-it-skills",
    package_version: "1.0.1",
    schema_version: "0.1.0",
    source_package_version: "0.1.0",
    published_at: "2026-08-20T12:00:00Z",
    content_hash: "abc123",
    package: bundled,
    ...overrides
  };
}

describe("published curriculum and learner submissions", () => {
  it("loads a published package from the curriculum RPC and stores it on window.__lpPackage", async () => {
    const engine = getContentEngine();
    const published = structuredClone(bundled);
    if (published.weeks?.[0]?.metadata) {
      published.weeks[0].metadata.title = "Published title v1.0.1";
    }
    const runtime = await engine.loadCurriculumRuntime({
      appConfig: {
        hubId: "l2e-exploring-emerging-digital-technologies",
        courseKey: "gateway-level-2-digital-it-skills",
        contentPackageVersion: "0.1.0"
      },
      config: {
        projectUrl: "https://example.supabase.co",
        publishableKey: "sb_publishable_example"
      },
      fetch: () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([publishedRow({ package: published, package_version: "1.0.1" })])
      }),
      loadBundled: () => bundled,
      validate: () => ({ valid: true }),
      storage: engine.createMemoryStorage?.()
    });
    applyL2eCurriculum({
      source: runtime.source,
      package: runtime.package as ContentPackage,
      state: runtime.state
    });
    expect(runtime.source).toBe("published");
    expect(runtime.state.state).toBe("PUBLISHED");
    expect(window.__lpPackage).toBe(runtime.package);
    expect(document.body.dataset.curriculumSource).toBe("published");
    expect((window.__lpPackage as ContentPackage).weeks?.[0]?.metadata?.title).toBe("Published title v1.0.1");
    expect(weekPageFromPackage(window.__lpPackage as ContentPackage, "week-1")?.week.title)
      .toBe("Published title v1.0.1");
  });

  it("falls back to the bundled package when publication lookup fails", async () => {
    const engine = getContentEngine();
    const runtime = await engine.loadCurriculumRuntime({
      appConfig: {
        hubId: "l2e-exploring-emerging-digital-technologies",
        courseKey: "gateway-level-2-digital-it-skills"
      },
      config: {
        projectUrl: "https://example.supabase.co",
        publishableKey: "sb_publishable_example"
      },
      fetch: () => Promise.resolve({ ok: false }),
      loadBundled: () => bundled,
      validate: () => ({ valid: true }),
      storage: engine.createMemoryStorage?.()
    });
    applyL2eCurriculum({
      source: runtime.source,
      package: runtime.package as ContentPackage,
      state: runtime.state
    });
    expect(runtime.source).toBe("bundled");
    expect(runtime.state.allowsSubmission).toBe(false);
    expect(window.__lpPackage).toBe(bundled);
    expect(document.body.dataset.curriculumSource).toBe("bundled");
  });

  it("submits complete activity results through platform.submission.submit when signed in", async () => {
    const engine = getContentEngine();
    const activity = bundled.activities?.find((item) => item.id === "week-1-welcome");
    const captured: Array<Record<string, unknown>> = [];
    const result = await engine.submitActivityDraft(activity, {
      responses: { "week-1-welcome-q1": "b" },
      startedAt: "2026-08-20T10:00:00.000Z",
      completedAt: "2026-08-20T10:05:00.000Z"
    }, {
      sourcePage: "/week-1/",
      platform: {
        auth: { isSignedIn: () => true },
        submission: {
          submit: (payload: Record<string, unknown>) => {
            captured.push(payload);
            return Promise.resolve({ ok: true });
          }
        }
      },
      publication: { allowsSubmission: true }
    });
    expect(result.status).toBe("submitted");
    expect(captured).toHaveLength(1);
    expect(captured[0].activityKey).toBe("week-1-welcome");
    expect(captured[0].activityVersion).toBe("0.1.0");
    expect(captured[0].learnerId).toBeUndefined();
    expect(captured[0].enrolmentId).toBeUndefined();
    expect(captured[0].assignmentId).toBeUndefined();
    expect(captured[0].score).toBeUndefined();
  });

  it("keeps drafts on the device for guests and restores them after reload", async () => {
    const engine = getContentEngine();
    const activity = bundled.activities?.find((item) => item.id === "week-1-welcome");
    if (!activity || !engine.createDraftStore || !engine.createMemoryStorage) {
      throw new Error("draft store unavailable");
    }
    const storage = engine.createMemoryStorage();
    const store = engine.createDraftStore(activity, { storage, learnerKey: "guest" });
    const draft = store.load();
    draft.responses["week-1-welcome-q1"] = "b";
    store.save(draft);

    const guest = await engine.submitActivityDraft(activity, {
      responses: { "week-1-welcome-q1": "b" }
    }, {
      platform: { auth: { isSignedIn: () => false } },
      publication: { allowsSubmission: true }
    });
    expect(guest.status).toBe("local");

    const restored = engine.createDraftStore(activity, { storage, learnerKey: "guest" }).load();
    expect(restored.responses["week-1-welcome-q1"]).toBe("b");
    expect(restored.activityId).toBe("week-1-welcome");
  });

  it("does not submit until every question in the activity has evidence", async () => {
    const engine = getContentEngine();
    const activity = bundled.activities?.find((item) => item.id === "week-1-knowledge-check");
    const captured: unknown[] = [];
    const result = await engine.submitActivityDraft(activity, {
      responses: { "week-1-kc-q1": "a" }
    }, {
      platform: {
        auth: { isSignedIn: () => true },
        submission: {
          submit: (payload: unknown) => {
            captured.push(payload);
            return Promise.resolve({ ok: true });
          }
        }
      },
      publication: { allowsSubmission: true }
    });
    expect(result.status).toBe("local");
    expect(captured).toHaveLength(0);
    expect(result.reason).toMatch(/Complete every question/i);
  });
});
