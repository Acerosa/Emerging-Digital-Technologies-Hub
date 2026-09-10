import { describe, expect, it } from "vitest";
import { accountPageAutoOpenAction } from "./account-auto-open";

describe("accountPageAutoOpenAction", () => {
  it("opens sign-in for signed-out account visits once", () => {
    expect(accountPageAutoOpenAction("account", "signed-out", false)).toBe("sign-in");
    expect(accountPageAutoOpenAction("account", "signed-out", true)).toBeNull();
  });

  it("ignores transitional auth states", () => {
    expect(accountPageAutoOpenAction("account", "signing-in", true)).toBeNull();
    expect(accountPageAutoOpenAction("account", "signed-out", true)).toBeNull();
  });

  it("opens Core onboarding only for true first-time Auth users", () => {
    expect(accountPageAutoOpenAction("account", "onboarding-required", false)).toBe("onboarding");
    expect(accountPageAutoOpenAction("account", "onboarding-required", false, "onboarding-required")).toBe("onboarding");
    expect(accountPageAutoOpenAction("account", "onboarding-required", true)).toBeNull();
  });

  it("does not open Core onboarding when learner is already linked", () => {
    expect(accountPageAutoOpenAction("account", "onboarding-required", false, "authenticated")).toBeNull();
  });

  it("ignores non-account views", () => {
    expect(accountPageAutoOpenAction("home", "signed-out", false)).toBeNull();
  });
});
