import { describe, expect, it, vi } from "vitest";
import { focusJoinClassPanel, shouldOpenCoreOnboarding } from "./focus-join-class";

describe("shouldOpenCoreOnboarding", () => {
  it("is true only for onboarding-required without linked learner", () => {
    expect(shouldOpenCoreOnboarding("onboarding-required")).toBe(true);
    expect(shouldOpenCoreOnboarding("onboarding-required", "onboarding-required")).toBe(true);
    expect(shouldOpenCoreOnboarding("onboarding-required", "authenticated")).toBe(false);
    expect(shouldOpenCoreOnboarding("no-enrolment", "authenticated")).toBe(false);
    expect(shouldOpenCoreOnboarding("ready")).toBe(false);
  });
});

describe("focusJoinClassPanel", () => {
  it("focuses the class-key field when present", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <section data-lp-join-class="needs-join">
        <input data-join-class-key="" name="registrationKey" />
      </section>
    `;
    const input = root.querySelector("input") as HTMLInputElement;
    const focus = vi.spyOn(input, "focus");
    expect(focusJoinClassPanel(root)).toBe(true);
    expect(focus).toHaveBeenCalled();
  });

  it("returns false when JoinClass is absent", () => {
    expect(focusJoinClassPanel(document.createElement("div"))).toBe(false);
  });
});
