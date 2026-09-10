import { describe, expect, it } from "vitest";
import { hasSiblingHubAuthSession } from "./sibling-hub-session";

function storageFrom(keys: string[]) {
  return {
    length: keys.length,
    key: (i: number) => keys[i] ?? null
  };
}

describe("hasSiblingHubAuthSession", () => {
  it("detects Unit 3 / T Level tokens while ET is signed out", () => {
    expect(hasSiblingHubAuthSession(storageFrom([
      "sb-hubwpkrqndorznwzvaer-auth-token--unit-3-cyber-security"
    ]))).toBe(true);
  });

  it("ignores this hub's own token", () => {
    expect(hasSiblingHubAuthSession(storageFrom([
      "sb-hubwpkrqndorznwzvaer-auth-token--l2e-exploring-emerging-digital-technologies"
    ]))).toBe(false);
  });

  it("returns false for empty storage", () => {
    expect(hasSiblingHubAuthSession(storageFrom([]))).toBe(false);
    expect(hasSiblingHubAuthSession(null)).toBe(false);
  });
});
