import { createAccountDialog } from "@learning-platform/core";
import { useEffect, useMemo, useState } from "react";
import type { LearnerSummary, ThemeControl, ThemePreference } from "@learning-platform/ui";
import { getContentEngine } from "../content/engine";
import { APP_CONFIG } from "../config";
import { createHubPlatform } from "../platform";

type AccountDialog = {
  element: HTMLElement;
  open: (trigger?: EventTarget | null) => void;
  destroy?: () => void;
};

export function useHubPlatform(root: string) {
  const platform = useMemo(() => createHubPlatform(root), [root]);
  const [learner, setLearner] = useState<LearnerSummary | null>(null);
  const [theme, setTheme] = useState<ThemeControl | null>(null);
  const [accountDialog, setAccountDialog] = useState<AccountDialog | null>(null);
  const [platformState, setPlatformState] = useState("loading");
  const [adaptersReady, setAdaptersReady] = useState(false);

  useEffect(() => {
    let dialog: AccountDialog | null = null;
    const unsubscribers: Array<() => void> = [];
    let cancelled = false;
    document.body.dataset.platformState = "loading";

    const stopAuth = platform.auth.subscribe?.((authState) => {
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
    });
    document.body.appendChild(dialog.element);
    setAccountDialog(dialog);
    window.LearningPlatform = { platform, coreVersion: APP_CONFIG.coreVersion };
    void (async () => {
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

  return { platform, learner, theme, accountDialog, platformState, adaptersReady };
}

export type { HubPlatform } from "../platform";
