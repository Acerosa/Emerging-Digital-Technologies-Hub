/** Enrolment / join-class helpers for the L2E hub learner UX. */

export const SIGN_IN_TO_CONTINUE = "Sign in to continue.";
export const JOIN_CLASS_MESSAGE =
  "You need to join your class before this activity can be checked.";
export const JOIN_CLASS_PROMPT = "Join your class to continue";
export const EXPECTED_REGISTRATION_KEY = "l2e-year-1-delivery";
export const EXPECTED_GROUP_CODE = "L2E-DELIVERY-A";

export type EnrolmentAccess =
  | "guest"
  | "needs-join"
  | "enrolled"
  | "loading"
  | "other";

export type EnrolmentRow = {
  status?: string;
  groupCode?: string;
  courseTitle?: string;
};

export type EnrolmentAccessOptions = {
  enrolments?: EnrolmentRow[] | null;
};

/**
 * True when the learner has an active enrolment in this hub's delivery group.
 * Other-course enrolments (e.g. T Level) must not unlock L2E marking.
 */
export function hasExpectedGroupEnrolment(
  enrolments: EnrolmentRow[] | null | undefined,
  groupCode: string = EXPECTED_GROUP_CODE
): boolean {
  if (!Array.isArray(enrolments) || enrolments.length === 0) return false;
  const expected = String(groupCode || "").trim().toUpperCase();
  return enrolments.some((row) => {
    const status = String(row?.status || "").trim().toLowerCase();
    const code = String(row?.groupCode || "").trim().toUpperCase();
    return status === "active" && code === expected;
  });
}

export function enrolmentAccessFor(
  platformState: string | null | undefined,
  options: EnrolmentAccessOptions = {}
): EnrolmentAccess {
  const status = String(platformState || "").trim();
  if (!status || status === "loading" || status === "signing-in") return "loading";
  if (status === "signed-out") return "guest";
  if (status === "onboarding-required" || status === "no-enrolment") return "needs-join";

  // Platform "ready" can mean ready for a *different* hub's course. Require L2E group.
  if (status === "ready" || status === "no-assignments") {
    if (Object.prototype.hasOwnProperty.call(options, "enrolments")) {
      return hasExpectedGroupEnrolment(options.enrolments) ? "enrolled" : "needs-join";
    }
    return "enrolled";
  }
  return "other";
}

export function needsJoinClass(
  platformState: string | null | undefined,
  options: EnrolmentAccessOptions = {}
): boolean {
  return enrolmentAccessFor(platformState, options) === "needs-join";
}

export function canMarkActivity(
  platformState: string | null | undefined,
  options: EnrolmentAccessOptions = {}
): boolean {
  return enrolmentAccessFor(platformState, options) === "enrolled";
}

export function markBlockedMessage(
  platformState: string | null | undefined,
  options: EnrolmentAccessOptions = {}
): string | null {
  const access = enrolmentAccessFor(platformState, options);
  if (access === "guest") return SIGN_IN_TO_CONTINUE;
  if (access === "needs-join") return JOIN_CLASS_MESSAGE;
  return null;
}

export function markBlockedError(
  platformState: string | null | undefined,
  options: EnrolmentAccessOptions = {}
): Error | null {
  const message = markBlockedMessage(platformState, options);
  if (!message) return null;
  const access = enrolmentAccessFor(platformState, options);
  const code = access === "guest" ? "AUTH_REQUIRED" : "JOIN_CLASS_REQUIRED";
  return Object.assign(new Error(message), { code, learnerMessage: message });
}

type MarkBlockFn = (input: Record<string, unknown>) => Promise<unknown>;

type GuardedPlatform = {
  marking?: { markBlock?: MarkBlockFn };
  learner?: {
    getState?: () => {
      context?: { enrolments?: EnrolmentRow[] | null } | null;
    };
  };
};

/**
 * Prevents mark_formative_response from running until the learner is enrolled
 * in L2E-DELIVERY-A. Cross-hub enrolments alone are not enough.
 */
export function withEnrolmentGuardedMarking<T extends GuardedPlatform>(
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
        const enrolments = platform.learner?.getState?.()?.context?.enrolments ?? null;
        const blocked = markBlockedError(getPlatformState(), { enrolments });
        if (blocked) return Promise.reject(blocked);
        return original(input);
      }
    }
  };
}

export type RegistrationOption = {
  registrationKey: string;
  yearGroup?: string;
  groupName?: string;
  groupCode?: string;
  courseTitle?: string;
  academicYear?: string;
};

export function optionLabel(option: RegistrationOption): string {
  const group = option.groupName || option.groupCode || "Class group";
  const year = option.yearGroup || "";
  const course = option.courseTitle || "";
  return [year, group, course].filter(Boolean).join(" — ");
}

export function normaliseRegistrationKey(value: string): string {
  return String(value || "").trim().toLowerCase();
}
