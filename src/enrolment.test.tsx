/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JoinClassPanel } from "./components/JoinClassPanel";
import {
  EXPECTED_GROUP_CODE,
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

describe("L2E hub-bound enrolment", () => {
  it("guest requires sign-in before marking", () => {
    expect(needsJoinClass("signed-out")).toBe(false);
    expect(canMarkActivity("signed-out")).toBe(false);
    const error = markBlockedError("signed-out") as Error & { code?: string; learnerMessage?: string };
    expect(error?.code).toBe("AUTH_REQUIRED");
    expect(error?.learnerMessage).toBe(SIGN_IN_TO_CONTINUE);
  });

  it("authenticated learner without L2E enrolment cannot mark until resolver enrols", () => {
    expect(needsJoinClass("onboarding-required")).toBe(true);
    expect(needsJoinClass("no-enrolment")).toBe(true);
    expect(canMarkActivity("onboarding-required")).toBe(false);
    const error = markBlockedError("no-enrolment") as Error & { code?: string; learnerMessage?: string };
    expect(error?.code).toBe("JOIN_CLASS_REQUIRED");
    expect(error?.learnerMessage).toBe(JOIN_CLASS_MESSAGE);
  });

  it("enrolled learner does not see join prompt and can mark", () => {
    expect(needsJoinClass("ready")).toBe(false);
    expect(canMarkActivity("ready")).toBe(true);
    expect(markBlockedError("ready")).toBeNull();
  });

  it("does not call mark_formative_response before valid enrolment", async () => {
    const markBlock = vi.fn(async (_input?: Record<string, unknown>) => ({ complete: true }));
    const platform = withEnrolmentGuardedMarking(
      { marking: { markBlock } },
      () => "onboarding-required"
    );
    await expect(platform.marking.markBlock({ activityKey: "week-1-welcome" })).rejects.toMatchObject({
      code: "JOIN_CLASS_REQUIRED",
      learnerMessage: JOIN_CLASS_MESSAGE
    });
    expect(markBlock).not.toHaveBeenCalled();
  });

  it("enrolled learner can immediately mark through the guarded platform", async () => {
    const markBlock = vi.fn(async (_input?: Record<string, unknown>) => ({ complete: true, correct: true }));
    const platform = withEnrolmentGuardedMarking(
      { marking: { markBlock } },
      () => "ready"
    );
    await expect(platform.marking.markBlock({ activityKey: "week-1-welcome" })).resolves.toMatchObject({
      complete: true
    });
    expect(markBlock).toHaveBeenCalledTimes(1);
  });

  it("signup and join UI never expose a year, group, or registration-option picker", () => {
    const complete = vi.fn();
    const joinClass = vi.fn();
    render(
      <JoinClassPanel
        platformState="onboarding-required"
        platform={{
          onboarding: { complete, joinClass, getRegistrationOptions: async () => [{ registrationKey: "other-open-group" }] },
          learner: { getState: () => ({ status: "onboarding-required", context: null }) }
        }}
        onSignIn={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: JOIN_CLASS_PROMPT })).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByLabelText(/registration key/i)).toBeNull();
    expect(screen.queryByLabelText(/year and group/i)).toBeNull();
    expect(screen.queryByRole("option")).toBeNull();
    expect(complete).not.toHaveBeenCalled();
    expect(joinClass).not.toHaveBeenCalled();
  });

  it("needs-join panel opens account setup instead of treating a class key as authority", () => {
    const onSignIn = vi.fn();
    const complete = vi.fn();
    render(
      <JoinClassPanel
        platformState="no-enrolment"
        platform={{
          onboarding: { complete },
          learner: {
            getState: () => ({
              status: "authenticated",
              context: { firstName: "Existing", surname: "Student", studentNumber: "STU-OLD", enrolments: [] }
            })
          }
        }}
        onSignIn={onSignIn}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: JOIN_CLASS_PROMPT }));
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(complete).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Join class" })).toBeNull();
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
                groupCode: EXPECTED_GROUP_CODE
              }
            })
          }
        }}
      />
    );
    expect(screen.getByText(/You are joined to/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: JOIN_CLASS_PROMPT })).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
