import { validatePackage } from "@learning-platform/content";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { activityFromPackage, homeWeeksFromPackage, weekPageFromPackage, type ContentPackage } from "./from-package";
import { applyL2eCurriculum } from "./apply-runtime";
import { configureBundledPackage, runtimeContentPackage } from "./runtime-weeks";
import pkg from "../../content/l2e-exploring-emerging-digital-technologies/package.json";

const bundled = pkg as ContentPackage;

beforeAll(() => {
  configureBundledPackage(bundled);
});

afterEach(() => {
  delete window.__lpPackage;
  delete window.__lpLivePackage;
  delete window.__lpPublishedCurriculum;
  document.body.removeAttribute("data-curriculum-source");
});

describe("L2E package hydration", () => {
  it("validates the combined content package", () => {
    const result = validatePackage(pkg);
    expect(result.valid).toBe(true);
  });

  it("exposes Weeks 1 to 4 for the learner home and week pages", () => {
    const weeks = homeWeeksFromPackage(pkg);
    expect(weeks.map((item) => item.label)).toEqual(["Week 1", "Week 2", "Week 3", "Week 4"]);
    expect(weeks.map((item) => item.path)).toEqual(["week-1/", "week-2/", "week-3/", "week-4/"]);
    expect(weeks[0].title).toBe("Introduction to New and Emerging Digital Technologies");
    expect(weeks[1].title).toBe("Internet of Things, RFID, NFC and Wearables");
    expect(weeks[2].title).toBe("Cloud Technology, SaaS, IaaS, PaaS and DaaS");
    expect(weeks[3].title).toBe("AI and Intelligent Computing: Smart Devices, Robots and Neural Networks");
    expect(weeks[0].current).toBe(true);
    const week1 = weekPageFromPackage(pkg, "week-1");
    expect(week1?.sessions.map((item) => item.id)).toEqual(["week-1-session"]);
    expect(week1?.sessions[0].activities.map((item) => item.id)).toEqual([
      "week-1-welcome",
      "week-1-digital-technology",
      "week-1-current-emerging",
      "week-1-mobile",
      "week-1-intelligent-computing",
      "week-1-iot",
      "week-1-cloud",
      "week-1-industry",
      "week-1-knowledge-check",
      "week-1-reflection",
      "week-1-exit-ticket"
    ]);
    const week2 = weekPageFromPackage(pkg, "week-2");
    expect(week2?.sessions[0].activities.map((item) => item.id)).toEqual([
      "week-2-starter",
      "week-2-iot",
      "week-2-iot-sectors",
      "week-2-rfid",
      "week-2-nfc",
      "week-2-rfid-vs-nfc",
      "week-2-wearables",
      "week-2-smart-settings",
      "week-2-benefits-risks",
      "week-2-privacy",
      "week-2-trends",
      "week-2-reflection",
      "week-2-exit"
    ]);
    const week3 = weekPageFromPackage(pkg, "week-3");
    expect(week3?.sessions[0].activities.map((item) => item.id)).toEqual([
      "week-3-starter",
      "week-3-cloud-outline",
      "week-3-local-vs-cloud",
      "week-3-saas",
      "week-3-iaas",
      "week-3-paas",
      "week-3-daas",
      "week-3-models-match",
      "week-3-responsibility",
      "week-3-scenarios",
      "week-3-benefits-risks",
      "week-3-org-example",
      "week-3-extension",
      "week-3-profile",
      "week-3-exit"
    ]);
  });

  it("includes each supported interactive type in Weeks 1 to 3", () => {
    const required = ["single-choice", "classification", "short-response", "reflection"];
    for (const weekId of ["week-1", "week-2", "week-3"]) {
      const page = weekPageFromPackage(pkg, weekId);
      const types = new Set<string>();
      for (const activityId of page?.sessions[0]?.activities.map((item) => item.id) || []) {
        const activity = pkg.activities.find((item) => item.id === activityId);
        for (const block of activity?.blocks || []) {
          if (required.includes(String(block.type))) types.add(String(block.type));
        }
      }
      expect([...types].sort(), weekId).toEqual([...required].sort());
    }
  });

  it("wires the Week 4 AI session with unique ids and a mixed knowledge check before the exit", () => {
    const published = structuredClone(bundled);
    const week4 = published.weeks?.find((item) => item.id === "week-4");
    if (!week4?.metadata) throw new Error("missing week-4");
    week4.metadata.status = "available";
    const page = weekPageFromPackage(published, "week-4");
    const ids = page?.sessions[0]?.activities.map((item) => item.id) || [];
    expect(page?.sessions.map((item) => item.id)).toEqual(["week-4-session"]);
    expect(ids).toEqual([
      "week-4-starter",
      "week-4-ai-intro",
      "week-4-ai-examples",
      "week-4-ai-or-not",
      "week-4-smart-devices",
      "week-4-smart-flow",
      "week-4-iot-and-ai",
      "week-4-robots",
      "week-4-robot-parts",
      "week-4-automation-vs-ai",
      "week-4-robot-types",
      "week-4-neural-networks",
      "week-4-nn-flow",
      "week-4-nn-training",
      "week-4-nn-applications",
      "week-4-benefits-limitations",
      "week-4-limitations-check",
      "week-4-game-npc",
      "week-4-smart-gaming",
      "week-4-warehouse-robot",
      "week-4-image-recognition",
      "week-4-knowledge-check",
      "week-4-reflection",
      "week-4-exit"
    ]);

    const activities = ids.map((id) => pkg.activities.find((item) => item.id === id));
    expect(activities.every(Boolean)).toBe(true);
    const extensions = activities.filter((activity) => activity?.metadata?.activityType === "Extension");
    expect(extensions.map((activity) => activity?.id)).toEqual([
      "week-4-robot-types",
      "week-4-nn-applications",
      "week-4-limitations-check",
      "week-4-smart-gaming",
      "week-4-reflection"
    ]);
    expect(extensions.every((activity) => activity?.metadata?.title?.startsWith("Extension: "))).toBe(true);
    const types = new Set(activities.flatMap((activity) => (activity?.blocks || []).map((block) => String(block.type))));
    for (const type of ["single-choice", "classification", "short-response", "reflection"]) {
      expect(types.has(type), type).toBe(true);
    }
    for (const activity of activities) {
      for (const block of activity?.blocks || []) {
        const content = (block.content || {}) as { correctOptionId?: string; options?: Array<{ id: string }>; items?: Array<{ correctCategoryId: string }>; categories?: Array<{ id: string }> };
        if (block.type === "single-choice") {
          expect(content.options?.some((option) => option.id === content.correctOptionId), block.id).toBe(true);
        }
        if (block.type === "classification") {
          const categoryIds = new Set((content.categories || []).map((category) => category.id));
          expect(content.items?.every((item) => categoryIds.has(item.correctCategoryId)), block.id).toBe(true);
        }
      }
    }

    const allIds = pkg.activities.map((item) => item.id);
    expect(new Set(allIds).size).toBe(allIds.length);
    const questionIds = pkg.activities.flatMap((item) => (item.blocks || [])
      .map((block) => (block.content as { questionId?: string } | undefined)?.questionId)
      .filter(Boolean));
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  it("hides planned session content while keeping the session placeholder", () => {
    const edited = structuredClone(bundled);
    const session = edited.sessions?.find((item) => item.id === "week-2-session");
    if (!session?.metadata) throw new Error("missing week-2-session");
    session.metadata.status = "planned";
    const page = weekPageFromPackage(edited, "week-2");
    expect(page?.sessions[0].accessible).toBe(false);
    expect(page?.sessions[0].activities).toEqual([]);
    expect(page?.sessions[0].summary).toBe("Not released yet");
  });

  it("keeps a bundled available session when live publication omits session status", () => {
    const live = structuredClone(bundled);
    for (const session of live.sessions || []) {
      if (session.metadata) delete session.metadata.status;
    }
    const page = weekPageFromPackage(runtimeContentPackage(live), "week-1");
    expect(page?.sessions[0].accessible).toBe(true);
    expect(page?.sessions[0].activities.length).toBeGreaterThan(0);
  });

  it("does not expose an available session inside a planned week", () => {
    const edited = structuredClone(bundled);
    const week = edited.weeks?.find((item) => item.id === "week-2");
    if (!week?.metadata) throw new Error("missing week-2");
    week.metadata.status = "planned";
    const page = weekPageFromPackage(edited, "week-2");
    expect(page?.sessions[0].accessible).toBe(false);
    expect(page?.sessions[0].activities).toEqual([]);
  });

  it("restores Week 1 starter questions from published blocks", () => {
    const restored = activityFromPackage(pkg, "week-1-welcome");
    expect(restored?.title).toBe("Welcome and starter");
    const sections = restored?.sections as Array<{ questions?: Array<{ prompt?: string }> }> | undefined;
    expect(sections?.[0]?.questions?.[0]?.prompt).toMatch(/emerging digital technology/i);
  });

  it("applies a mutated published title without reading another hub", () => {
    const edited = structuredClone(bundled);
    const activity = edited.activities?.find((item) => item.id === "week-1-welcome");
    if (!activity?.metadata) throw new Error("missing activity");
    activity.metadata.title = "Admin edited retrieval title";
    applyL2eCurriculum({
      source: "published",
      package: edited,
      state: { state: "PUBLISHED" }
    }, window);
    expect(window.__lpPublishedCurriculum).toBe(true);
    expect(document.body.dataset.curriculumSource).toBe("published");
    expect(window.__lpLivePackage).toBe(edited);
    expect(activityFromPackage(window.__lpPackage as ContentPackage, "week-1-welcome")?.title)
      .toBe("Admin edited retrieval title");
    expect((window.__lpPackage as ContentPackage).hub?.id).toBe("l2e-exploring-emerging-digital-technologies");
  });
});
