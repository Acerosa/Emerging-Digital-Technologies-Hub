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
  open: (trigger?: EventTarget | null, options?: { mode?: "sign-in" | "register" }) => void;
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

    dialog = createAccountDialog({
      authService: platform.auth,
      learnerContext: platform.learner,
      onboardingService: platform.onboarding
    }) as AccountDialog;
    document.body.appendChild(dialog.element);
    setAccountDialog(dialog);
    window.LearningPlatform = { platform, coreVersion: APP_CONFIG.coreVersion };

    // Match Unit 3 / T Level: start Auth+learner resolve immediately. Do not
    // block initialise on curriculum fetch (that delayed hub access and made
    // ET look like it needed identity onboarding after other hubs already worked).
    void (async () => {
      const ready = platform.initialise();
      try {
        const runtime = await loadL2eCurriculum(platform) as CurriculumRuntime & {
          package?: ContentPackage | null;
        };
        if (!cancelled) {
          setCurriculum({
            source: runtime.source || "none",
            package: runtime.package || null
          });
          document.dispatchEvent(new CustomEvent("lp:content-ready", {
            detail: { package: runtime.package || null, publication: runtime.state }
          }));
        }
      } finally {
        const snapshot = await ready;
        if (!cancelled) {
          const auth = platform.auth.getState?.();
          const learnerState = platform.learner.getState?.();
          console.info("L2E_PLATFORM_STARTUP", {
            coreVersion: APP_CONFIG.coreVersion,
            hubCode: APP_CONFIG.hubId,
            authUserId: auth?.session?.user?.id || null,
            authStatus: auth?.status || null,
            platformStatus: snapshot?.status || platform.state.getState?.()?.status || null,
            learnerStatus: learnerState?.status || null,
            studentNumber: learnerState?.context?.studentNumber || null,
            joinNeeded: learnerState?.status === "onboarding-required"
              || snapshot?.status === "no-enrolment"
              || snapshot?.status === "onboarding-required"
          });
          setAdaptersReady(true);
        }
      }
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
