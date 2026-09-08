import { createAccountDialog } from "@learning-platform/core";
import { useEffect, useMemo, useState } from "react";
import type { LearnerSummary, ThemeControl, ThemePreference } from "@learning-platform/ui";
import { getContentEngine } from "../content/engine";
import { APP_CONFIG } from "../config";
import { loadL2eCurriculum, type CurriculumRuntime } from "../curriculum/apply-runtime";
import type { ContentPackage } from "../curriculum/from-package";
import { createHubPlatform, type HubPlatform } from "../platform";

type AccountDialog = {
  element: HTMLElement;
  open: (trigger?: EventTarget | null) => void;
  showOnboarding?: () => void;
  destroy?: () => void;
};

export type LoadedCurriculum = {
  source: string;
  package: ContentPackage | null;
};

const EMPTY_CURRICULUM: LoadedCurriculum = { source: "none", package: null };

export function useHubPlatform(root: string) {
  const platform = useMemo(() => createHubPlatform(root), [root]);
  const [learner, setLearner] = useState<LearnerSummary | null>(null);
  const [theme, setTheme] = useState<ThemeControl | null>(null);
  const [accountDialog, setAccountDialog] = useState<AccountDialog | null>(null);
  const [platformState, setPlatformState] = useState("loading");
  const [authStatus, setAuthStatus] = useState("signed-out");
  const [adaptersReady, setAdaptersReady] = useState(false);
  const [curriculum, setCurriculum] = useState<LoadedCurriculum>(EMPTY_CURRICULUM);

  useEffect(() => {
    let dialog: AccountDialog | null = null;
    const unsubscribers: Array<() => void> = [];
    let cancelled = false;
    let promptedJoin = false;
    document.body.dataset.platformState = "loading";

    const stopAuth = platform.auth.subscribe?.((authState) => {
      setAuthStatus(authState.status);
      if (authState.status !== "authenticated" || !authState.session?.user?.id) return;
      try {
        getContentEngine().migrateGuestDrafts?.({
          learnerKey: `auth:${authState.session.user.id}`
        });
      } catch {
        // Draft migration must not block sign-in or lesson flow.
      }
    });
    if (stopAuth) unsubscribers.push(stopAuth);
    unsubscribers.push(platform.learner.subscribe((state) => {
      setLearner((state.context || null) as LearnerSummary | null);
    }));
    unsubscribers.push(platform.state.subscribe((snapshot) => {
      setPlatformState(snapshot.status);
      document.body.dataset.platformState = snapshot.status;
      if (
        !cancelled
        && !promptedJoin
        && (snapshot.status === "onboarding-required" || snapshot.status === "no-enrolment")
      ) {
        promptedJoin = true;
        // Existing Core dialog opens onboarding for onboarding-required; showOnboarding also covers no-enrolment.
        queueMicrotask(() => {
          if (typeof dialog?.showOnboarding === "function") dialog.showOnboarding();
          else dialog?.open();
        });
      }
      if (snapshot.status === "signed-out" || snapshot.status === "ready") promptedJoin = false;
    }));
    if (platform.theme) {
      unsubscribers.push(platform.theme.subscribe((snapshot) => {
        setTheme({
          modes: platform.theme.modes as ThemePreference[],
          preference: snapshot.preference as ThemePreference,
          onChange: (mode) => { platform.theme.setPreference(mode); }
        });
      }));
    }

    const rawDialog = createAccountDialog({
      authService: platform.auth,
      learnerContext: platform.learner,
      onboardingService: platform.onboarding
    });

    function learnerNeedsJoin() {
      const learnerState = platform.learner.getState?.() || { status: "", context: null };
      const platformStatus = platform.state.getState?.()?.status;
      const enrolments = (learnerState.context as { enrolments?: unknown[] } | null)?.enrolments;
      return learnerState.status === "onboarding-required"
        || platformStatus === "no-enrolment"
        || (learnerState.status === "authenticated" && Array.isArray(enrolments) && enrolments.length === 0);
    }

    function openNativeDialog(trigger?: EventTarget | null) {
      const el = rawDialog.element as HTMLDialogElement;
      if (trigger && "focus" in (trigger as HTMLElement)) {
        // Preserve return focus when possible; Core modal tracks this internally on open().
      }
      if (typeof el.showModal === "function") {
        if (!el.open) el.showModal();
      } else {
        el.setAttribute("open", "");
      }
    }

    dialog = {
      element: rawDialog.element,
      open(trigger) {
        if (platform.auth.isSignedIn?.() && learnerNeedsJoin() && typeof rawDialog.showOnboarding === "function") {
          rawDialog.showOnboarding();
          openNativeDialog(trigger);
          return;
        }
        rawDialog.open(trigger);
      },
      showOnboarding() {
        rawDialog.showOnboarding?.();
        openNativeDialog();
      },
      destroy: rawDialog.destroy
    };
    document.body.appendChild(dialog.element);
    setAccountDialog(dialog);
    window.LearningPlatform = { platform, coreVersion: APP_CONFIG.coreVersion };

    void (async () => {
      const runtime = await loadL2eCurriculum(platform) as CurriculumRuntime & {
        package?: ContentPackage | null;
      };
      if (cancelled) return;
      setCurriculum({
        source: runtime.source || "none",
        package: runtime.package || null
      });
      document.dispatchEvent(new CustomEvent("lp:content-ready", {
        detail: { package: runtime.package || null, publication: runtime.state }
      }));
      await platform.initialise();
      if (!cancelled) setAdaptersReady(true);
    })();

    return () => {
      cancelled = true;
      unsubscribers.forEach((stop) => stop());
      dialog?.element.remove();
      dialog?.destroy?.();
      platform.destroy();
    };
  }, [platform]);

  return {
    platform,
    learner,
    theme,
    accountDialog,
    platformState,
    authStatus,
    adaptersReady,
    curriculum
  };
}

export type { HubPlatform };
