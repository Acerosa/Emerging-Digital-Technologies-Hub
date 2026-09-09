/** Enrolment helpers for the L2E hub. Class membership is server-assigned via open_auto. */

export const SIGN_IN_TO_CONTINUE = "Sign in to continue.";
export const JOIN_CLASS_MESSAGE =
  "Finish setting up your account before this activity can be checked.";
export const JOIN_CLASS_PROMPT = "Finish setting up your account";
export const EXPECTED_GROUP_CODE = "L2E-DELIVERY-A";

export type EnrolmentAccess =
  | "guest"
  | "needs-join"
  | "enrolled"
  | "loading"
  | "other";

export function enrolmentAccessFor(platformState: string | null | undefined): EnrolmentAccess {
  const status = String(platformState || "").trim();
  if (!status || status === "loading" || status === "signing-in") return "loading";
  if (status === "signed-out") return "guest";
  if (status === "onboarding-required" || status === "no-enrolment") return "needs-join";
  if (status === "ready" || status === "no-assignments") return "enrolled";
  return "other";
}

export function needsJoinClass(platformState: string | null | undefined): boolean {
  return enrolmentAccessFor(platformState) === "needs-join";
}

export function canMarkActivity(platformState: string | null | undefined): boolean {
  return enrolmentAccessFor(platformState) === "enrolled";
}

export function markBlockedMessage(platformState: string | null | undefined): string | null {
  const access = enrolmentAccessFor(platformState);
  if (access === "guest") return SIGN_IN_TO_CONTINUE;
  if (access === "needs-join") return JOIN_CLASS_MESSAGE;
  return null;
}

export function markBlockedError(platformState: string | null | undefined): Error | null {
  const message = markBlockedMessage(platformState);
  if (!message) return null;
  const access = enrolmentAccessFor(platformState);
  const code = access === "guest" ? "AUTH_REQUIRED" : "JOIN_CLASS_REQUIRED";
  return Object.assign(new Error(message), { code, learnerMessage: message });
}

type MarkBlockFn = (input: Record<string, unknown>) => Promise<unknown>;

/**
 * Prevents mark_formative_response from running until the learner is enrolled.
 * Guests and unenrolled learners get actionable learnerMessage copy instead.
 */
export function withEnrolmentGuardedMarking<T extends { marking?: { markBlock?: MarkBlockFn } }>(
  platform: T,
  getPlatformState: () => string
): T {
  const marking = platform?.marking;
  if (!marking || typeof marking.markBlock !== "function") return platform;
  const original = marking.markBlock.bind(marking);
  return {
    ...platform,
    marking: {
      ...marking,
      markBlock(input: Record<string, unknown>) {
        const blocked = markBlockedError(getPlatformState());
        if (blocked) return Promise.reject(blocked);
        return original(input);
      }
    }
  };
}
