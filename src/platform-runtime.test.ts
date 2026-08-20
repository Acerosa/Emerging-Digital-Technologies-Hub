import { afterEach, describe, expect, it, vi } from "vitest";
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

  it("keeps the local draft and returns a retryable message when submit fails", async () => {
    const engine = getContentEngine();
    const activity = bundled.activities?.find((item) => item.id === "week-1-welcome");
    if (!activity || !engine.createDraftStore || !engine.createMemoryStorage) {
      throw new Error("draft store unavailable");
    }
    const storage = engine.createMemoryStorage();
    const store = engine.createDraftStore(activity, { storage, learnerKey: "auth:learner-1" });
    const draft = store.load();
    draft.responses["week-1-welcome-q1"] = "b";
    store.save(draft);

    const result = await engine.submitActivityDraft(activity, draft, {
      sourcePage: "/week-1/",
      platform: {
        auth: { isSignedIn: () => true },
        submission: {
          submit: () => Promise.reject(new Error("SUBMIT_ATTEMPT_FAILED"))
        }
      },
      publication: { allowsSubmission: true }
    });
    expect(result.status).toBe("local");
    expect(result.failed).toBe(true);
    expect(result.reason).toMatch(/still saved on this device/i);
    expect(result.reason).toMatch(/not been sent to your learning record/i);
    expect(store.load().responses["week-1-welcome-q1"]).toBe("b");
  });

  it("does not submit the same complete draft twice while a request is in flight", async () => {
    const engine = getContentEngine();
    const activity = bundled.activities?.find((item) => item.id === "week-1-welcome");
    let release: ((value: { ok: boolean }) => void) | undefined;
    const captured: unknown[] = [];
    const submit = () => {
      captured.push("call");
      return new Promise<{ ok: boolean }>((resolve) => {
        release = resolve;
      });
    };
    const draft = {
      responses: { "week-1-welcome-q1": "b" },
      startedAt: "2026-08-20T10:00:00.000Z"
    };
    const first = engine.submitActivityDraft(activity, draft, {
      platform: {
        auth: { isSignedIn: () => true },
        submission: { submit }
      },
      publication: { allowsSubmission: true }
    });
    const second = engine.submitActivityDraft(activity, draft, {
      platform: {
        auth: { isSignedIn: () => true },
        submission: { submit }
      },
      publication: { allowsSubmission: true }
    });
    expect(captured).toHaveLength(1);
    release?.({ ok: true });
    await expect(first).resolves.toMatchObject({ status: "submitted" });
    await expect(second).resolves.toMatchObject({ status: "submitted" });
    expect(captured).toHaveLength(1);
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

  it("loads a newer published version in place of the previous one", async () => {
    const engine = getContentEngine();
    async function loadVersion(title: string, version: string) {
      const published = structuredClone(bundled);
      if (published.weeks?.[0]?.metadata) published.weeks[0].metadata.title = title;
      return engine.loadCurriculumRuntime({
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
          json: () => Promise.resolve([publishedRow({
            package: published,
            package_version: version
          })])
        }),
        loadBundled: () => bundled,
        validate: () => ({ valid: true }),
        storage: engine.createMemoryStorage?.()
      });
    }
    const first = await loadVersion("Published title v1", "1.0.0");
    expect((first.package as ContentPackage).weeks?.[0]?.metadata?.title).toBe("Published title v1");
    const second = await loadVersion("Published title v2", "1.0.1");
    applyL2eCurriculum({
      source: second.source,
      package: second.package as ContentPackage,
      state: second.state
    });
    expect(second.source).toBe("published");
    expect((window.__lpPackage as ContentPackage).weeks?.[0]?.metadata?.title).toBe("Published title v2");
    expect((window.__lpPackage as ContentPackage).weeks?.[0]?.metadata?.title).not.toBe("Published title v1");
  });

  it("marks and submits every Week 1 interactive type without prohibited fields", async () => {
    const engine = getContentEngine();
    const week = weekPageFromPackage(bundled, "week-1");
    const activityIds = week?.sessions[0]?.activities.map((item) => item.id) || [];
    const seen = new Set<string>();
    const forbidden = ["learnerId", "enrolmentId", "assignmentId", "attemptNumber", "score", "learner", "studentId"];

    expect(activityIds).toContain("week-1-welcome");
    expect(activityIds).toContain("week-1-knowledge-check");
    expect(activityIds).toContain("week-1-reflection");
    expect(activityIds).toContain("week-1-exit-ticket");

    for (const activityId of activityIds) {
      const activity = bundled.activities?.find((item) => item.id === activityId);
      if (!activity) throw new Error(`missing ${activityId}`);
      const responses: Record<string, unknown> = {};
      for (const block of activity.blocks || []) {
        const type = String(block.type || "");
        const content = (block.content || {}) as Record<string, unknown>;
        if (type === "multiple-choice" || type === "multi-select" || type === "matching" || type === "fill-gap") {
          throw new Error(`${activityId} uses unimplemented block ${type}`);
        }
        if (!["single-choice", "classification", "short-response", "reflection"].includes(type)) continue;
        seen.add(type);
        const questionId = String(content.questionId || block.id);
        const marked = (engine as { markBlock?: (block: unknown, response: unknown) => { complete: boolean } }).markBlock;
        if (type === "single-choice") {
          const options = (content.options as Array<{ id: string }>) || [];
          responses[questionId] = String(content.correctOptionId || options[0]?.id || "a");
        } else if (type === "classification") {
          const selected: Record<string, string> = {};
          for (const item of (content.items as Array<{ id: string; correctCategoryId: string }>) || []) {
            selected[item.id] = item.correctCategoryId;
          }
          responses[questionId] = selected;
        } else {
          responses[questionId] = "A concise learner response for verification.";
        }
        if (typeof marked === "function") {
          const result = marked(block, responses[questionId]);
          expect(result.complete, `${activityId}:${questionId}`).toBe(true);
        }
      }
      const captured: Array<Record<string, unknown>> = [];
      const submitted = await engine.submitActivityDraft(activity, { responses }, {
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
      expect(submitted.status, activityId).toBe("submitted");
      expect(captured).toHaveLength(1);
      expect(captured[0].activityKey).toBe(activityId);
      expect(Array.isArray(captured[0].responses)).toBe(true);
      for (const field of forbidden) {
        expect(captured[0][field], `${activityId} ${field}`).toBeUndefined();
      }
    }
    expect([...seen].sort()).toEqual(["classification", "reflection", "short-response", "single-choice"]);
  });

  it("migrates guest drafts to the signed-in learner once without duplicating existing work", () => {
    const engine = getContentEngine();
    const welcome = bundled.activities?.find((item) => item.id === "week-1-welcome");
    const reflection = bundled.activities?.find((item) => item.id === "week-1-reflection");
    if (!welcome || !reflection || !engine.createDraftStore || !engine.createMemoryStorage || !engine.migrateGuestDrafts) {
      throw new Error("draft migration unavailable");
    }
    const storage = engine.createMemoryStorage();
    const guestWelcome = engine.createDraftStore(welcome, { storage, learnerKey: "guest" }).load();
    guestWelcome.responses["week-1-welcome-q1"] = "b";
    engine.createDraftStore(welcome, { storage, learnerKey: "guest" }).save(guestWelcome);

    const guestReflection = engine.createDraftStore(reflection, { storage, learnerKey: "guest" }).load();
    guestReflection.responses["week-1-ref-q"] = "Guest reflection.";
    engine.createDraftStore(reflection, { storage, learnerKey: "guest" }).save(guestReflection);

    const existing = engine.createDraftStore(reflection, { storage, learnerKey: "auth:learner-1" }).load();
    existing.responses["week-1-ref-q"] = "Already signed-in work.";
    engine.createDraftStore(reflection, { storage, learnerKey: "auth:learner-1" }).save(existing);

    const first = engine.migrateGuestDrafts({ storage, learnerKey: "auth:learner-1" });
    expect(first.migrated).toBe(1);
    expect(first.skipped).toBe(1);
    expect(engine.createDraftStore(welcome, { storage, learnerKey: "auth:learner-1" }).load().responses["week-1-welcome-q1"]).toBe("b");
    expect(engine.createDraftStore(welcome, { storage, learnerKey: "guest" }).load().responses["week-1-welcome-q1"]).toBeUndefined();
    expect(engine.createDraftStore(reflection, { storage, learnerKey: "auth:learner-1" }).load().responses["week-1-ref-q"]).toBe("Already signed-in work.");

    const second = engine.migrateGuestDrafts({ storage, learnerKey: "auth:learner-1" });
    expect(second.migrated).toBe(0);
  });

  it("shows a keep-draft notice after Check answer when the learning record rejects the attempt", async () => {
    const engine = getContentEngine();
    const activity = bundled.activities?.find((item) => item.id === "week-1-welcome");
    if (!activity || !engine.createMemoryStorage) throw new Error("engine unavailable");
    const storage = engine.createMemoryStorage();
    const root = document.createElement("div");
    root.innerHTML = engine.renderActivity(activity);
    document.body.appendChild(root);
    engine.setPublicationState?.({ state: "PUBLISHED", allowsSubmission: true });
    const captured: unknown[] = [];
    engine.bindInteractive(root, { activities: [activity] }, {
      storage,
      learnerKey: "auth:learner-1",
      platform: {
        auth: { isSignedIn: () => true },
        submission: {
          submit: () => {
            captured.push("submit");
            return Promise.reject(new Error("SUBMIT_ATTEMPT_FAILED"));
          }
        }
      }
    });
    const choice = root.querySelector('input[value="b"]') as HTMLInputElement | null;
    const check = root.querySelector("[data-lp-check]") as HTMLButtonElement | null;
    if (!choice || !check) throw new Error("activity controls missing");
    choice.checked = true;
    choice.dispatchEvent(new Event("change", { bubbles: true }));
    check.click();
    await vi.waitFor(() => {
      expect(root.querySelector("[data-lp-activity-status]")?.textContent).toMatch(/still saved on this device/i);
    });
    expect(captured).toHaveLength(1);
    expect(root.querySelector("[data-lp-feedback]")?.textContent).toBeTruthy();
    const draft = engine.createDraftStore?.(activity, { storage, learnerKey: "auth:learner-1" }).load();
    expect(draft?.responses["week-1-welcome-q1"]).toBe("b");
    engine.bindInteractive(root, { activities: [activity] }, {
      storage,
      learnerKey: "auth:learner-1",
      platform: {
        auth: { isSignedIn: () => true },
        submission: {
          submit: () => {
            captured.push("submit");
            return Promise.reject(new Error("SUBMIT_ATTEMPT_FAILED"));
          }
        }
      }
    });
    check.click();
    await vi.waitFor(() => {
      expect(captured.length).toBeGreaterThanOrEqual(2);
    });
    document.body.removeChild(root);
  });

  it("skips a second submit after a successful attempt with the same responses", async () => {
    const engine = getContentEngine();
    const activity = bundled.activities?.find((item) => item.id === "week-1-welcome");
    const captured: unknown[] = [];
    const draft: {
      responses: Record<string, string>;
      submission?: { status?: string; fingerprint?: string; reason?: string; failed?: boolean };
    } = { responses: { "week-1-welcome-q1": "b" } };
    const options = {
      platform: {
        auth: { isSignedIn: () => true },
        submission: {
          submit: () => {
            captured.push("submit");
            return Promise.resolve({ ok: true });
          }
        }
      },
      publication: { allowsSubmission: true }
    };
    const first = await engine.submitActivityDraft(activity, draft, options);
    draft.submission = first;
    const second = await engine.submitActivityDraft(activity, draft, options);
    expect(first.status).toBe("submitted");
    expect(second.status).toBe("submitted");
    expect(captured).toHaveLength(1);
  });

  it("warns with the fallback reason when published curriculum is unavailable", async () => {
    const engine = getContentEngine();
    const warnings: unknown[] = [];
    const original = console.warn;
    console.warn = (...args: unknown[]) => { warnings.push(args); };
    try {
      const runtime = await engine.loadCurriculumRuntime({
        appConfig: {
          hubId: "l2e-exploring-emerging-digital-technologies",
          courseKey: "gateway-level-2-digital-it-skills"
        },
        config: {
          projectUrl: "https://example.supabase.co",
          publishableKey: "sb_publishable_example"
        },
        fetch: () => Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ message: "HUB_NOT_FOUND" }) }),
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
      expect(warnings.some((entry) => Array.isArray(entry) && entry[0] === "L2E_CURRICULUM_FALLBACK")).toBe(true);
    } finally {
      console.warn = original;
    }
  });
});
