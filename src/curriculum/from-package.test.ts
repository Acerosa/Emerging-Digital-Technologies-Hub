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
    expect(weeks[0].title).toBe("Current and Emerging Technology, including Mobile");
    expect(weeks[1].title).toBe("Internet of Things, RFID, NFC and Wearables");
    expect(weeks[2].title).toBe("Cloud Technology, SaaS, IaaS, PaaS and DaaS");
    expect(weeks[0].current).toBe(true);
    const week1 = weekPageFromPackage(pkg, "week-1");
    expect(week1?.sessions.map((item) => item.id)).toEqual(["week-1-session"]);
    expect(week1?.sessions[0].activities.map((item) => item.activityType)).toEqual([
      "Guided learning",
      "Retrieval quiz",
      "Classification",
      "Reflection"
    ]);
  });

  it("restores Week 1 retrieval questions from published blocks", () => {
    const restored = activityFromPackage(pkg, "week-1-retrieval");
    expect(restored?.title).toBe("Week 1 retrieval");
    const questions = restored?.questions as Array<{ prompt?: string }> | undefined;
    expect(questions?.[0]?.prompt).toMatch(/emerging digital technology/i);
  });

  it("applies a mutated published title without reading another hub", () => {
    const edited = structuredClone(pkg);
    const activity = edited.activities.find((item) => item.id === "week-1-retrieval");
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
