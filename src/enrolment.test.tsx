/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JoinClassPanel } from "./components/JoinClassPanel";
import {
  EXPECTED_REGISTRATION_KEY,
  JOIN_CLASS_MESSAGE,
  JOIN_CLASS_PROMPT,
  SIGN_IN_TO_CONTINUE,
  canMarkActivity,
  markBlockedError,
  needsJoinClass,
  withEnrolmentGuardedMarking
} from "./enrolment";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("L2E normal learner enrolment", () => {
  it("guest requires sign-in before marking", () => {
    expect(needsJoinClass("signed-out")).toBe(false);
    expect(canMarkActivity("signed-out")).toBe(false);
    const error = markBlockedError("signed-out") as Error & { code?: string; learnerMessage?: string };
    expect(error?.code).toBe("AUTH_REQUIRED");
    expect(error?.learnerMessage).toBe(SIGN_IN_TO_CONTINUE);
  });

  it("authenticated learner with no group sees join-class prompt state", () => {
    expect(needsJoinClass("onboarding-required")).toBe(true);
    expect(needsJoinClass("no-enrolment")).toBe(true);
    expect(canMarkActivity("onboarding-required")).toBe(false);
    const error = markBlockedError("no-enrolment") as Error & { code?: string; learnerMessage?: string };
    expect(error?.code).toBe("JOIN_CLASS_REQUIRED");
    expect(error?.learnerMessage).toBe(JOIN_CLASS_MESSAGE);
  });

  it("enrolled learner does not see join prompt and can mark", () => {
    const enrolments = [{ status: "active", groupCode: "L2E-DELIVERY-A" }];
    expect(needsJoinClass("ready", { enrolments })).toBe(false);
    expect(canMarkActivity("ready", { enrolments })).toBe(true);
    expect(markBlockedError("ready", { enrolments })).toBeNull();
  });

  it("other-course ready state still requires L2E class join", () => {
    const enrolments = [{ status: "active", groupCode: "TLEVEL-DSD-Y2" }];
    expect(needsJoinClass("ready", { enrolments })).toBe(true);
    expect(canMarkActivity("ready", { enrolments })).toBe(false);
    const error = markBlockedError("ready", { enrolments }) as Error & { code?: string };
    expect(error?.code).toBe("JOIN_CLASS_REQUIRED");
  });

  it("does not call mark_formative_response before valid enrolment", async () => {
    const markBlock = vi.fn(async (_input?: Record<string, unknown>) => ({ complete: true }));
    const platform = withEnrolmentGuardedMarking(
      {
        marking: { markBlock },
        learner: { getState: () => ({ context: { enrolments: [] } }) }
      },
      () => "onboarding-required"
    );
    await expect(platform.marking.markBlock({ activityKey: "week-1-welcome" })).rejects.toMatchObject({
      code: "JOIN_CLASS_REQUIRED",
      learnerMessage: JOIN_CLASS_MESSAGE
    });
    expect(markBlock).not.toHaveBeenCalled();
  });

  it("blocks mark when platform is ready but only other-course enrolments exist", async () => {
    const markBlock = vi.fn(async () => ({ complete: true }));
    const platform = withEnrolmentGuardedMarking(
      {
        marking: { markBlock },
        learner: {
          getState: () => ({
            context: { enrolments: [{ status: "active", groupCode: "TLEVEL-DSD-Y2" }] }
          })
        }
      },
      () => "ready"
    );
    await expect(platform.marking.markBlock({ activityKey: "week-1-digital-technology" })).rejects.toMatchObject({
      code: "JOIN_CLASS_REQUIRED"
    });
    expect(markBlock).not.toHaveBeenCalled();
  });

  it("enrolled learner can immediately mark through the guarded platform", async () => {
    const markBlock = vi.fn(async (_input?: Record<string, unknown>) => ({ complete: true, correct: true }));
    const platform = withEnrolmentGuardedMarking(
      {
        marking: { markBlock },
        learner: {
          getState: () => ({
            context: { enrolments: [{ status: "active", groupCode: "L2E-DELIVERY-A" }] }
          })
        }
      },
      () => "ready"
    );
    await expect(platform.marking.markBlock({ activityKey: "week-1-welcome" })).resolves.toMatchObject({
      complete: true
    });
    expect(markBlock).toHaveBeenCalledTimes(1);
  });

  it("correct registration key creates enrolment via onboarding.complete and refreshes context", async () => {
    const complete = vi.fn(async () => ({ group_code: "L2E-DELIVERY-A", idempotent: false }));
    const refresh = vi.fn(async () => undefined);
    const onJoined = vi.fn();
    const platform = {
      onboarding: {
        getPending: () => ({
          firstName: "Normal",
          surname: "Learner",
          studentNumber: "STU-1"
        }),
        getRegistrationOptions: async () => [{
          registrationKey: EXPECTED_REGISTRATION_KEY,
          yearGroup: "Year 1",
          groupName: "L2E Gateway Delivery Group A",
          groupCode: "L2E-DELIVERY-A",
          courseTitle: "Gateway L2"
        }],
        complete
      },
      learner: {
        getState: () => ({ status: "onboarding-required", context: null }),
        refresh
      }
    };

    render(
      <JoinClassPanel
        platformState="onboarding-required"
        platform={platform}
        onJoined={onJoined}
      />
    );

    expect(screen.getByText(JOIN_CLASS_PROMPT)).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /L2E Gateway Delivery Group A/i })).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText(/Class registration key/i), {
      target: { value: EXPECTED_REGISTRATION_KEY }
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Join class" }));
    });

    await waitFor(() => {
      expect(complete).toHaveBeenCalledTimes(1);
    });
    expect(complete).toHaveBeenCalledWith(
      { firstName: "Normal", surname: "Learner", studentNumber: "STU-1" },
      EXPECTED_REGISTRATION_KEY
    );
    expect(onJoined).toHaveBeenCalledTimes(1);
    expect(complete.mock.calls).toHaveLength(1);
  });

  it("existing unenrolled account can join without recreating the account", async () => {
    const complete = vi.fn(async () => ({ group_code: "L2E-DELIVERY-A", idempotent: true }));
    const platform = {
      onboarding: {
        getPending: () => null,
        getRegistrationOptions: async () => [{
          registrationKey: EXPECTED_REGISTRATION_KEY,
          yearGroup: "Year 1",
          groupCode: "L2E-DELIVERY-A",
          groupName: "L2E Gateway Delivery Group A"
        }],
        complete
      },
      learner: {
        getState: () => ({
          status: "authenticated",
          context: {
            firstName: "Existing",
            surname: "Student",
            studentNumber: "STU-OLD",
            enrolments: []
          }
        })
      }
    };

    render(
      <JoinClassPanel
        platformState="no-enrolment"
        platform={platform}
      />
    );

    fireEvent.change(screen.getByLabelText(/Class registration key/i), {
      target: { value: EXPECTED_REGISTRATION_KEY }
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Join class" }));
    });
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
    expect(complete).toHaveBeenCalledWith(
      { firstName: "Existing", surname: "Student", studentNumber: "STU-OLD" },
      EXPECTED_REGISTRATION_KEY
    );
  });

  it("enrolled learner sees joined status instead of join prompt", () => {
    render(
      <JoinClassPanel
        platformState="ready"
        platform={{
          learner: {
            getState: () => ({
              status: "authenticated",
              context: {
                yearGroup: "Year 1",
                groupName: "L2E Gateway Delivery Group A",
                groupCode: "L2E-DELIVERY-A",
                enrolments: [{ status: "active", groupCode: "L2E-DELIVERY-A" }]
              }
            })
          }
        }}
      />
    );
    expect(screen.getByText(/You are joined to/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Join class" })).toBeNull();
  });
});
