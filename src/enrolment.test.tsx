/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JoinClassPanel } from "./components/JoinClassPanel";
import {
  EXPECTED_GROUP_CODE,
  EXPECTED_REGISTRATION_KEY,
  JOIN_CLASS_MESSAGE,
  JOIN_CLASS_PROMPT,
  SIGN_IN_TO_CONTINUE,
  canMarkActivity,
  isL2eRegistrationOption,
  markBlockedError,
  needsJoinClass,
  withEnrolmentGuardedMarking
} from "./enrolment";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("L2E hub-bound enrolment", () => {
  it("guest join panel asks the learner to sign in", () => {
    render(
      <JoinClassPanel
        platformState="signed-out"
        platform={{}}
        onSignIn={vi.fn()}
      />
    );
    expect(screen.getByText(SIGN_IN_TO_CONTINUE)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open Account" })).toBeTruthy();
  });

  it("guest requires sign-in before marking", () => {
    expect(needsJoinClass("signed-out")).toBe(false);
    expect(canMarkActivity("signed-out")).toBe(false);
    const error = markBlockedError("signed-out") as Error & { code?: string; learnerMessage?: string };
    expect(error?.code).toBe("AUTH_REQUIRED");
    expect(error?.learnerMessage).toBe(SIGN_IN_TO_CONTINUE);
  });

  it("authenticated learner without L2E enrolment cannot mark until they join with the class key", () => {
    expect(needsJoinClass("onboarding-required")).toBe(true);
    expect(needsJoinClass("no-enrolment")).toBe(true);
    expect(canMarkActivity("onboarding-required")).toBe(false);
    const error = markBlockedError("no-enrolment") as Error & { code?: string; learnerMessage?: string };
    expect(error?.code).toBe("JOIN_CLASS_REQUIRED");
    expect(error?.learnerMessage).toBe(JOIN_CLASS_MESSAGE);
  });

  it("enrolled L2E learner does not see join prompt and can mark", () => {
    const enrolments = [{ status: "active", groupCode: EXPECTED_GROUP_CODE }];
    expect(needsJoinClass("ready", { enrolments })).toBe(false);
    expect(canMarkActivity("ready", { enrolments })).toBe(true);
    expect(markBlockedError("ready", { enrolments })).toBeNull();
  });

  it("Cyber-only ready state does not count as L2E access", () => {
    const enrolments = [{ status: "active", groupCode: "CYBER-TEST-A" }];
    expect(needsJoinClass("ready", { enrolments })).toBe(true);
    expect(canMarkActivity("ready", { enrolments })).toBe(false);
  });

  it("T Level-only ready state does not count as L2E access", () => {
    const enrolments = [{ status: "active", groupCode: "TLEVEL-DSD-Y2" }];
    expect(canMarkActivity("ready", { enrolments })).toBe(false);
    expect(needsJoinClass("ready", { enrolments })).toBe(true);
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
    const markBlock = vi.fn(async (_input?: Record<string, unknown>) => ({ complete: true }));
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
    await expect(platform.marking.markBlock({ activityKey: "week-1-welcome" })).rejects.toMatchObject({
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
            context: { enrolments: [{ status: "active", groupCode: EXPECTED_GROUP_CODE }] }
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

  it("correct class key joins through onboarding.joinClass without a group picker", async () => {
    const complete = vi.fn(async () => ({ student_number: "STU-1" }));
    const joinClass = vi.fn(async () => ({ groupCode: EXPECTED_GROUP_CODE, status: "enrolled_created" }));
    const platform = {
      onboarding: {
        getPending: () => ({
          firstName: "Ada",
          surname: "Lovelace",
          studentNumber: "STU-1"
        }),
        complete,
        joinClass
      },
      learner: {
        getState: () => ({ status: "onboarding-required", context: null }),
        refresh: vi.fn(async () => undefined)
      }
    };

    render(
      <JoinClassPanel
        platformState="onboarding-required"
        platform={platform}
      />
    );

    expect(screen.getByRole("heading", { name: JOIN_CLASS_PROMPT })).toBeTruthy();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByLabelText(/year and group/i)).toBeNull();

    fireEvent.change(screen.getByLabelText(/Class registration key/i), {
      target: { value: EXPECTED_REGISTRATION_KEY }
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Join class" }));
    });
    await waitFor(() => expect(joinClass).toHaveBeenCalledTimes(1));
    expect(joinClass).toHaveBeenCalledWith(EXPECTED_REGISTRATION_KEY);
  });

  it("shows identity fields for true onboarding-required Auth users", () => {
    render(
      <JoinClassPanel
        platformState="onboarding-required"
        platform={{
          onboarding: { getPending: () => null, complete: vi.fn(), joinClass: vi.fn() },
          learner: { getState: () => ({ status: "onboarding-required", context: null }) }
        }}
      />
    );
    expect(screen.getByLabelText(/First name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Student ID/i)).toBeTruthy();
    expect(screen.getByLabelText(/Class registration key/i)).toBeTruthy();
  });

  it("keeps Switch account available for Student ID ownership conflicts", async () => {
    const joinClass = vi.fn(async () => {
      throw Object.assign(new Error("STUDENT_NUMBER_ALREADY_LINKED"), {
        code: "STUDENT_NUMBER_ALREADY_LINKED"
      });
    });
    const onSwitchAccount = vi.fn();
    render(
      <JoinClassPanel
        platformState="onboarding-required"
        onSwitchAccount={onSwitchAccount}
        platform={{
          onboarding: {
            getPending: () => null,
            complete: vi.fn(async () => ({})),
            joinClass
          },
          learner: { getState: () => ({ status: "onboarding-required", context: null }) }
        }}
      />
    );
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: "Ada" } });
    fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: "Lovelace" } });
    fireEvent.change(screen.getByLabelText(/Student ID/i), { target: { value: "999" } });
    fireEvent.change(screen.getByLabelText(/Class registration key/i), {
      target: { value: EXPECTED_REGISTRATION_KEY }
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Join class" }));
    });
    await waitFor(() => expect(screen.getByRole("button", { name: /Switch account/i })).toBeTruthy());
  });

    it("does not re-run complete for an already linked learner who only needs JoinClass", async () => {
    const complete = vi.fn(async () => ({ student_number: "123456" }));
    const joinClass = vi.fn(async () => ({ groupCode: EXPECTED_GROUP_CODE, status: "enrolled" }));
    render(
      <JoinClassPanel
        platformState="no-enrolment"
        platform={{
          onboarding: {
            getPending: () => null,
            complete,
            joinClass
          },
          learner: {
            getState: () => ({
              status: "authenticated",
              context: {
                firstName: "Linked",
                surname: "Learner",
                studentNumber: "123456",
                enrolments: [{ status: "active", groupCode: "TLEVEL-DSD-Y2" }]
              }
            })
          }
        }}
      />
    );
    expect(screen.queryByLabelText(/First name/i)).toBeNull();
    expect(screen.queryByLabelText(/Student ID/i)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Class registration key/i), {
      target: { value: EXPECTED_REGISTRATION_KEY }
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Join class" }));
    });
    await waitFor(() => expect(joinClass).toHaveBeenCalledTimes(1));
    expect(complete).not.toHaveBeenCalled();
  });

  it("returning learner with empty local profile fields still uses class-key only", async () => {
    const complete = vi.fn(async () => ({ student_number: "123456" }));
    const joinClass = vi.fn(async () => ({ groupCode: EXPECTED_GROUP_CODE, status: "enrolled_created" }));
    render(
      <JoinClassPanel
        platformState="no-enrolment"
        platform={{
          onboarding: { getPending: () => null, complete, joinClass },
          learner: {
            getState: () => ({
              status: "authenticated",
              context: { firstName: "", surname: "", studentNumber: "123456", enrolments: [] }
            })
          }
        }}
      />
    );
    expect(screen.queryByLabelText(/First name/i)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Class registration key/i), {
      target: { value: EXPECTED_REGISTRATION_KEY }
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Join class" }));
    });
    await waitFor(() => expect(joinClass).toHaveBeenCalledWith(EXPECTED_REGISTRATION_KEY));
    expect(complete).not.toHaveBeenCalled();
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
                groupCode: EXPECTED_GROUP_CODE,
                enrolments: [{
                  status: "active",
                  groupCode: EXPECTED_GROUP_CODE,
                  groupName: "L2E Gateway Delivery Group A",
                  yearGroup: "Year 1"
                }]
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

  it("recognises the L2E registration option by key or group code", () => {
    expect(isL2eRegistrationOption({
      registrationKey: EXPECTED_REGISTRATION_KEY,
      groupCode: EXPECTED_GROUP_CODE
    })).toBe(true);
    expect(isL2eRegistrationOption({
      registrationKey: "tlevel-year-2-test",
      groupCode: "TLEVEL-DSD-Y2"
    })).toBe(false);
  });
});
