/**
 * Per-hub Auth storage means a Unit 3 / T Level session does not sign the
 * learner into ET. Detect sibling hub tokens so the guest Join panel can hint.
 */
const HUB_AUTH_TOKEN = /^sb-[^-]+-auth-token--.+/;

export function hasSiblingHubAuthSession(
  storage: Pick<Storage, "length" | "key"> | null | undefined,
  thisHubCode = "l2e-exploring-emerging-digital-technologies"
): boolean {
  if (!storage || typeof storage.key !== "function") return false;
  const suffix = `--${String(thisHubCode || "").trim()}`;
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (!key || !HUB_AUTH_TOKEN.test(key)) continue;
    if (suffix && key.endsWith(suffix)) continue;
    return true;
  }
  return false;
}
