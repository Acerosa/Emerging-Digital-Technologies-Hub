import { createAccountDialog, createPlatform } from "@learning-platform/core";
import { afterEach, describe, expect, it } from "vitest";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.has(key) ? values.get(key)! : null; },
    setItem(key: string, value: string) { values.set(key, String(value)); },
    removeItem(key: string) { values.delete(key); }
  };
}

function fakeClient({
  session = { access_token: "managed", user: { id: "auth-user" } },
  enrolments = [{ status: "active", group_code: "L2E-DELIVERY-A", year_group: "Year 1" }],
  assignments = [
    { activity_key: "week2-malware-symptoms" },
    { activity_key: "week-1-digital-technology" }
  ],
  access = { status: "enrolled", group_code: "L2E-DELIVERY-A", year_group: "Year 1" },
  hubAssignments = [{ activity_key: "week-1-digital-technology" }]
}: {
  session?: { access_token: string; user: { id: string } } | null;
  enrolments?: Array<Record<string, string>>;
  assignments?: Array<Record<string, string>>;
  access?: Record<string, unknown>;
  hubAssignments?: Array<Record<string, string>>;
} = {}) {
  const calls: Array<{ type: string; name?: string; payload?: unknown }> = [];
  return {
    calls,
    auth: {
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
      getSession() { return Promise.resolve({ data: { session }, error: null }); },
      signInWithPassword() { return Promise.resolve({ data: { session }, error: null }); },
      signUp() { return Promise.resolve({ data: { session: null, user: { id: "auth-user" } }, error: null }); },
      signOut(options?: { scope?: string }) {
        calls.push({ type: "sign-out", payload: options });
        return Promise.resolve({ error: null });
      }
    },
    schema() {
      return {
        from(view: string) {
          calls.push({ type: "view", name: view });
          const data = view === "my_profile"
            ? [{ student_number: "000123", first_name: "Ada", surname: "Lovelace" }]
            : view === "my_enrolments"
              ? enrolments
              : view === "my_assignments"
                ? assignments
                : [];
          return {
            select() { return this; },
            eq() { return this; },
            order() { return this; },
            then(resolve: (value: unknown) => unknown) {
              return Promise.resolve({ data, error: null }).then(resolve);
            }
          };
        },
        rpc(name: string, payload: unknown) {
          calls.push({ type: "rpc", name, payload });
          if (name === "resolve_learner_hub_access") {
            const groupCode = typeof access.group_code === "string" ? access.group_code : "";
            const yearGroup = typeof access.year_group === "string" ? access.year_group : "";
            if (
              (access.status === "enrolled_created" || access.status === "enrolled_reactivated")
              && groupCode
              && !enrolments.some((item) => item.group_code === groupCode && item.status === "active")
            ) {
              enrolments.push({ status: "active", group_code: groupCode, year_group: yearGroup });
            }
            return Promise.resolve({ data: [access], error: null });
          }
          if (name === "complete_learner_onboarding") {
            return Promise.resolve({ data: [{ ok: true }], error: null });
          }
          const data = name === "my_hub_assignments" ? hubAssignments : [];
          return Promise.resolve({ data, error: null });
        }
      };
    }
  };
}

const L2E_CONFIG = {
  hubCode: "l2e-exploring-emerging-digital-technologies",
  hubName: "Exploring New and Emerging Digital Technologies",
  courseKey: "gateway-level-2-digital-it-skills"
};

describe("L2E hub access", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("auto-enrols a T Level-enrolled learner into L2E-DELIVERY-A through open_auto", async () => {
    const client = fakeClient({
      enrolments: [{ status: "active", group_code: "TLEVEL-DSD-Y2", year_group: "Year 2" }],
      access: { status: "enrolled_created", group_code: "L2E-DELIVERY-A", year_group: "Year 1" },
      hubAssignments: [{ activity_key: "week-1-digital-technology" }]
    });
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage(),
      document: null,
      window: null
    });
    await platform.initialise();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(platform.state.getState().status).toBe("ready");
    expect(platform.learner.getContext()?.groupCode).toBe("L2E-DELIVERY-A");
    expect(client.calls.find((call) => call.type === "rpc" && call.name === "resolve_learner_hub_access")?.payload).toEqual({
      p_hub_code: "l2e-exploring-emerging-digital-technologies",
      p_course_key: "gateway-level-2-digital-it-skills"
    });
    expect(JSON.stringify(client.calls.find((call) => call.type === "rpc" && call.name === "resolve_learner_hub_access")?.payload)).not.toMatch(/group|year|registration/);
    expect(await platform.assignments?.getHubAssignments?.("l2e-exploring-emerging-digital-technologies")).toEqual([
      { activity_key: "week-1-digital-technology" }
    ]);
    platform.destroy();
  });

  it("auto-enrols a Cyber-enrolled learner into L2E-DELIVERY-A through open_auto", async () => {
    const client = fakeClient({
      enrolments: [{ status: "active", group_code: "CYBER-TEST-A", year_group: "Year 1" }],
      access: { status: "enrolled_created", group_code: "L2E-DELIVERY-A", year_group: "Year 1" },
      hubAssignments: [{ activity_key: "week-1-digital-technology" }]
    });
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage(),
      document: null,
      window: null
    });
    await platform.initialise();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(platform.state.getState().status).toBe("ready");
    expect(platform.learner.getContext()?.groupCode).toBe("L2E-DELIVERY-A");
    platform.destroy();
  });

  it("reload does not duplicate an existing L2E enrolment", async () => {
    const enrolments = [{ status: "active", group_code: "L2E-DELIVERY-A", year_group: "Year 1" }];
    const client = fakeClient({
      enrolments,
      access: { status: "enrolled", group_code: "L2E-DELIVERY-A", year_group: "Year 1", idempotent: true }
    });
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage(),
      document: null,
      window: null
    });
    await platform.initialise();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await platform.learner.refresh?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(enrolments.filter((row) => row.group_code === "L2E-DELIVERY-A" && row.status === "active")).toHaveLength(1);
    expect(platform.learner.getContext()?.groupCode).toBe("L2E-DELIVERY-A");
    platform.destroy();
  });

  it("loads only L2E hub assignments when the learner also has a T Level enrolment", async () => {
    const client = fakeClient({
      enrolments: [
        { status: "active", group_code: "L2E-DELIVERY-A", year_group: "Year 1" },
        { status: "active", group_code: "TLEVEL-DSD-Y2", year_group: "Year 2" }
      ]
    });
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage(),
      document: null,
      window: null
    });
    await platform.initialise();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(platform.state.getState().status).toBe("ready");
    expect(await platform.assignments?.getHubAssignments?.("l2e-exploring-emerging-digital-technologies")).toEqual([
      { activity_key: "week-1-digital-technology" }
    ]);
    expect(client.calls.some((call) => call.type === "rpc" && call.name === "my_hub_assignments")).toBe(true);
    platform.destroy();
  });

  it("does not treat another hub enrolment as L2E authority when the resolver denies L2E", async () => {
    const client = fakeClient({
      enrolments: [{ status: "active", group_code: "TLEVEL-DSD-Y2", year_group: "Year 2" }],
      access: { status: "no_enrolment" },
      hubAssignments: [{ activity_key: "foundations-requirements-classification" }]
    });
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage(),
      document: null,
      window: null
    });
    await platform.initialise();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(platform.state.getState().status).toBe("no-enrolment");
    expect(client.calls.some((call) => call.type === "rpc" && call.name === "my_hub_assignments")).toBe(false);
    platform.destroy();
  });

  it("does not show a year and group picker on L2E onboarding", async () => {
    const client = fakeClient({
      enrolments: [],
      access: {
        status: "profile_required",
        registration_option: "l2e-year-1-delivery",
        year_group: "Year 1",
        group_code: "L2E-DELIVERY-A",
        group_name: "L2E Gateway Delivery Group A",
        course_title: "Gateway Level 2 Digital and IT Skills"
      }
    });
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage()
    });
    await platform.initialise();
    const dialog = createAccountDialog({
      authService: platform.auth,
      learnerContext: platform.learner,
      onboardingService: platform.onboarding
    });
    document.body.append(dialog.element);
    dialog.showOnboarding?.();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(dialog.element.querySelector("#lp-registration-option")).toBeNull();
    expect(dialog.element.querySelector("select")).toBeNull();
    expect(dialog.element.textContent).toContain("Enter your learner details to finish setting up your account.");
    expect(dialog.element.textContent).not.toContain("Choose a year and group");
    expect(dialog.element.textContent).not.toContain("Class registration key");
    dialog.destroy?.();
    platform.destroy();
  });

  it("complete() then resolve() without a browser-chosen group", async () => {
    const client = fakeClient({
      enrolments: [],
      access: { status: "enrolled_created", group_code: "L2E-DELIVERY-A", year_group: "Year 1" }
    });
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage(),
      document: null,
      window: null
    });
    await platform.initialise();
    await platform.onboarding.complete({
      firstName: "Ada",
      surname: "Lovelace",
      studentNumber: "000123"
    });
    const completeCall = client.calls.find((call) => call.type === "rpc" && call.name === "complete_learner_onboarding");
    expect(completeCall?.payload).toMatchObject({
      p_first_name: "Ada",
      p_surname: "Lovelace",
      p_student_number: "000123",
      p_registration_option: ""
    });
    expect(client.calls.filter((call) => call.type === "rpc" && call.name === "resolve_learner_hub_access").length).toBeGreaterThanOrEqual(2);
    expect(platform.learner.getContext()?.groupCode).toBe("L2E-DELIVERY-A");
    platform.destroy();
  });

  it("local sign-out uses local Auth scope", async () => {
    const client = fakeClient();
    const platform = createPlatform(L2E_CONFIG, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage(),
      document: null,
      window: null
    });
    await platform.initialise();
    await platform.auth.signOut();
    expect(client.calls.some((call) => call.type === "sign-out" && (call.payload as { scope?: string } | undefined)?.scope === "local")).toBe(true);
    platform.destroy();
  });
});
