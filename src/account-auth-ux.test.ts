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

function fakeClient() {
  const calls: Array<{ type: string; credentials?: { email?: string; password?: string } }> = [];
  return {
    calls,
    auth: {
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
      getSession() { return Promise.resolve({ data: { session: null }, error: null }); },
      async signInWithPassword(credentials: { email?: string; password?: string }) {
        calls.push({ type: "sign-in", credentials });
        return { data: { session: { access_token: "test" } }, error: null };
      },
      async signUp(credentials: { email?: string; password?: string }) {
        calls.push({ type: "sign-up", credentials });
        return { data: { session: null, user: { id: "auth-user" } }, error: null };
      },
      signOut() { return Promise.resolve({ error: null }); }
    },
    schema() {
      return {
        from() {
          return {
            select() { return this; },
            eq() { return this; },
            order() { return this; },
            then(resolve: (value: unknown) => unknown) {
              return Promise.resolve({ data: [], error: null }).then(resolve);
            }
          };
        },
        rpc() { return Promise.resolve({ data: [], error: null }); }
      };
    }
  };
}

describe("EDT learner account dialog", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("labels sign-in as email and does not send a student ID to password auth", async () => {
    const client = fakeClient();
    const platform = createPlatform({
      hubCode: "l2e-exploring-emerging-digital-technologies",
      hubName: "Exploring New and Emerging Digital Technologies",
      supabase: {
        projectUrl: "https://example.supabase.co",
        publishableKey: "sb_publishable_example"
      }
    }, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage()
    });
    const dialog = createAccountDialog({
      authService: platform.auth,
      learnerContext: platform.learner,
      onboardingService: platform.onboarding
    });
    document.body.append(dialog.element);
    dialog.open();

    const labels = Array.from(dialog.element.querySelectorAll(".lp-form__field"))
      .filter((field) => !(field as HTMLElement).hidden)
      .map((field) => field.querySelector("label")?.textContent);
    expect(labels).toEqual(["Email", "Password"]);
    expect(dialog.element.textContent).toContain("Use the email address you used when creating your account.");
    expect(dialog.element.textContent).not.toContain("Username");

    const register = Array.from(dialog.element.querySelectorAll('[role="tab"]'))
      .find((tab) => tab.textContent === "Create account");
    register?.dispatchEvent(new Event("click", { bubbles: true }));
    expect(dialog.element.textContent).toContain("Use your college Student ID.");
    expect(dialog.element.textContent).toContain("Use this email to sign in later.");

    const signIn = Array.from(dialog.element.querySelectorAll('[role="tab"]'))
      .find((tab) => tab.textContent === "Sign in");
    signIn?.dispatchEvent(new Event("click", { bubbles: true }));

    const email = dialog.element.querySelector("#lp-account-email") as HTMLInputElement;
    const password = dialog.element.querySelector("#lp-account-password") as HTMLInputElement;
    email.value = "00012345";
    password.value = "password-123";
    dialog.element.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(client.calls.filter((call) => call.type === "sign-in")).toHaveLength(0);
    expect(dialog.element.querySelector(".lp-form__status")?.textContent).toBe("Enter a valid email address.");
    expect(dialog.element.querySelector("#lp-registration-option")).toBeNull();
    expect(dialog.element.querySelector("select")).toBeNull();
    platform.destroy();
  });

  it("signs an existing account in with email and password", async () => {
    const client = fakeClient();
    const platform = createPlatform({
      hubCode: "l2e-exploring-emerging-digital-technologies",
      hubName: "Exploring New and Emerging Digital Technologies"
    }, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage()
    });
    const dialog = createAccountDialog({
      authService: platform.auth,
      learnerContext: platform.learner,
      onboardingService: platform.onboarding
    });
    document.body.append(dialog.element);
    dialog.open();
    const email = dialog.element.querySelector("#lp-account-email") as HTMLInputElement;
    const password = dialog.element.querySelector("#lp-account-password") as HTMLInputElement;
    email.value = "existing@example.test";
    password.value = "password-123";
    dialog.element.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(client.calls.filter((call) => call.type === "sign-in")).toEqual([
      { type: "sign-in", credentials: { email: "existing@example.test", password: "password-123" } }
    ]);
    platform.destroy();
  });

  it("repeated signup for an existing email asks the learner to sign in", async () => {
    const client = fakeClient();
    client.auth.signUp = async (credentials: { email?: string; password?: string }) => {
      client.calls.push({ type: "sign-up", credentials });
      return {
        data: { session: null, user: { id: "auth-user", identities: [] } },
        error: null
      };
    };
    const platform = createPlatform({
      hubCode: "l2e-exploring-emerging-digital-technologies",
      hubName: "Exploring New and Emerging Digital Technologies"
    }, {
      supabaseClient: client,
      sessionStorage: memoryStorage(),
      localStorage: memoryStorage()
    });
    const dialog = createAccountDialog({
      authService: platform.auth,
      learnerContext: platform.learner,
      onboardingService: platform.onboarding
    });
    document.body.append(dialog.element);
    dialog.open();
    Array.from(dialog.element.querySelectorAll('[role="tab"]'))
      .find((tab) => tab.textContent === "Create account")
      ?.dispatchEvent(new Event("click", { bubbles: true }));
    (dialog.element.querySelector("#lp-register-first-name") as HTMLInputElement).value = "Ada";
    (dialog.element.querySelector("#lp-register-surname") as HTMLInputElement).value = "Lovelace";
    (dialog.element.querySelector("#lp-register-student-number") as HTMLInputElement).value = "000123";
    (dialog.element.querySelector("#lp-account-email") as HTMLInputElement).value = "existing@example.test";
    (dialog.element.querySelector("#lp-account-password") as HTMLInputElement).value = "password-123";
    dialog.element.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    const status = dialog.element.querySelector(".lp-form__status")?.textContent || "";
    expect(status).toMatch(/already created an account on another learning hub|sign in using the same email/i);
    expect(status).not.toMatch(/An account with this email already exists/i);
    platform.destroy();
  });
});
