import { validatePackage } from "@learning-platform/content";
import { afterEach, describe, expect, it } from "vitest";
import { activityFromPackage, homeWeeksFromPackage, weekPageFromPackage } from "./from-package";
import { applyL2eCurriculum } from "./apply-runtime";
import pkg from "../../content/l2e-exploring-emerging-digital-technologies/package.json";

afterEach(() => {
  delete window.__lpPackage;
  delete window.__lpPublishedCurriculum;
  document.body.removeAttribute("data-curriculum-source");
});

describe("L2E package hydration", () => {
  it("validates the combined content package", () => {
    const result = validatePackage(pkg);
    expect(result.valid).toBe(true);
  });

  it("exposes Weeks 1 to 3 for the learner home and week pages", () => {
    const weeks = homeWeeksFromPackage(pkg);
    expect(weeks.map((item) => item.label)).toEqual(["Week 1", "Week 2", "Week 3"]);
    expect(weeks.map((item) => item.path)).toEqual(["week-1/", "week-2/", "week-3/"]);
    expect(weeks[0].title).toBe("Introduction to New and Emerging Digital Technologies");
    expect(weeks[1].title).toBe("Internet of Things, RFID, NFC and Wearables");
    expect(weeks[2].title).toBe("Cloud Technology, SaaS, IaaS, PaaS and DaaS");
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

  it("restores Week 1 starter questions from published blocks", () => {
    const restored = activityFromPackage(pkg, "week-1-welcome");
    expect(restored?.title).toBe("Welcome and starter");
    const sections = restored?.sections as Array<{ questions?: Array<{ prompt?: string }> }> | undefined;
    expect(sections?.[0]?.questions?.[0]?.prompt).toMatch(/emerging digital technology/i);
  });

  it("applies a mutated published title without reading another hub", () => {
    const edited = structuredClone(pkg);
    const activity = edited.activities.find((item) => item.id === "week-1-welcome");
    if (!activity) throw new Error("missing activity");
    activity.metadata.title = "Admin edited retrieval title";
    applyL2eCurriculum({
      source: "published",
      package: edited,
      state: { state: "PUBLISHED" }
    }, window);
    expect(window.__lpPublishedCurriculum).toBe(true);
    expect(document.body.dataset.curriculumSource).toBe("published");
    expect(window.__lpPackage).toBe(edited);
  });
});
