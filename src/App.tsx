import { LearnerHeader } from "@learning-platform/ui";
import { useEffect, useMemo, useRef } from "react";
import { accountPageAutoOpenAction } from "./account-auto-open";
import { CourseLayout } from "./components/CourseSidebar";
import { JoinClassPanel } from "./components/JoinClassPanel";
import { L2eHubShell } from "./components/L2eHubShell";
import { APP_CONFIG } from "./config";
import { liveContentPackage } from "./curriculum/apply-runtime";
import type { ContentPackage } from "./curriculum/from-package";
import {
  JOIN_CLASS_PROMPT,
  needsJoinClass,
  withEnrolmentGuardedMarking,
  type EnrolmentRow
} from "./enrolment";
import { useHubPlatform } from "./hooks/useHubPlatform";
import { currentIds, type PageContext } from "./page-context";
import { breadcrumbs, pageHeader } from "./page-copy";
import { AccountPage } from "./pages/AccountPage";
import { CourseGuidePage } from "./pages/CourseGuidePage";
import { HomePage } from "./pages/HomePage";
import { HelpPage, ResourcesPage } from "./pages/StaticPages";
import { WeekPage } from "./pages/WeekPage";
import { switchHubAccount } from "./switch-account";
import { buildL2eNavigation, buildL2eNavigationFallback, createSitePath } from "./paths";

function PageBody({
  context,
  platform,
  pkg,
  contentReady,
  platformState,
  onJoined,
  onOpenSignIn,
  onOpenCreateAccount,
  onSwitchAccount
}: {
  context: PageContext;
  platform?: unknown;
  pkg?: ContentPackage | null;
  contentReady: boolean;
  platformState: string;
  onJoined?: () => void;
  onOpenSignIn?: (trigger?: EventTarget | null) => void;
  onOpenCreateAccount?: (trigger?: EventTarget | null) => void;
  onSwitchAccount?: (trigger?: EventTarget | null) => void | Promise<void>;
}) {
  const enrolments = (platform as {
    learner?: { getState?: () => { context?: { enrolments?: EnrolmentRow[] } | null } };
  })?.learner?.getState?.()?.context?.enrolments;
  const joinGate = needsJoinClass(platformState, { enrolments }) || platformState === "signed-out";
  const showJoin = joinGate && (
    context.page === "home"
    || /^week-\d+$/.test(context.page)
    || (context.page === "account" && platformState !== "signed-out")
  );
  const joinPanel = showJoin ? (
    <JoinClassPanel
      compact
      root={context.root}
      platformState={platformState}
      platform={platform as never}
      onSignIn={(trigger) => onOpenSignIn?.(trigger)}
      onSwitchAccount={onSwitchAccount}
      onJoined={onJoined}
    />
  ) : null;

  if (context.page === "course-guide") return <CourseGuidePage root={context.root} pkg={pkg} />;
  if (/^week-\d+$/.test(context.page)) {
    return (
      <>
        {joinPanel}
        <WeekPage
          weekId={context.page}
          root={context.root}
          pkg={pkg}
          platform={platform}
          platformState={platformState}
        />
      </>
    );
  }
  if (context.page === "resources") return <ResourcesPage root={context.root} />;
  if (context.page === "help") return <HelpPage />;
  if (context.page === "account") {
    return (
      <AccountPage
        root={context.root}
        platformState={platformState}
        platform={platform as never}
        onSignIn={(trigger) => onOpenSignIn?.(trigger)}
        onCreateAccount={(trigger) => onOpenCreateAccount?.(trigger)}
        onSwitchAccount={onSwitchAccount}
        onJoined={onJoined}
      />
    );
  }
  return (
    <>
      {joinPanel}
      <HomePage root={context.root} livePackage={contentReady ? liveContentPackage() : null} />
    </>
  );
}

export function App({ context }: { context: PageContext }) {
  const {
    learner,
    theme,
    accountDialog,
    platform,
    adaptersReady,
    curriculum,
    platformState,
    authStatus
  } = useHubPlatform(context.root);
  const pkg = curriculum.package;
  const contentReady = Boolean(pkg) && curriculum.source !== "none" && adaptersReady;
  const header = pageHeader(context, pkg);
  const navigation = useMemo(
    () => (contentReady
      ? buildL2eNavigation(context.root, liveContentPackage())
      : buildL2eNavigationFallback(context.root)),
    [context.root, contentReady, curriculum.source]
  );
  const enrolments = (learner as { enrolments?: EnrolmentRow[] } | null)?.enrolments;
  const joinNeeded = needsJoinClass(platformState, { enrolments });
  const signedIn = authStatus === "authenticated" || Boolean(learner) || joinNeeded;
  const guardedPlatform = useMemo(
    () => withEnrolmentGuardedMarking(platform as never, () => platformState),
    [platform, platformState]
  );

  function openAccount(trigger?: EventTarget | null, options?: { mode?: "sign-in" | "register" }) {
    if (
      joinNeeded
      && options?.mode !== "register"
      && typeof accountDialog?.showOnboarding === "function"
    ) {
      accountDialog.showOnboarding();
      return;
    }
    accountDialog?.open(trigger, options);
  }

  /** Guest / post-sign-out: always open Core Sign in (never onboarding). */
  function openSignInDialog(trigger?: EventTarget | null) {
    accountDialog?.open(trigger, { mode: "sign-in" });
  }

  async function handleSwitchAccount(trigger?: EventTarget | null) {
    const onboarding = platform.onboarding as { clearPending?: () => void } | undefined;
    await switchHubAccount({
      clearPending: () => onboarding?.clearPending?.(),
      signOut: () => platform.auth.signOut(),
      openSignIn: openSignInDialog,
      trigger
    });
  }

  function activateCreateAccountTab() {
    const tab = Array.from(accountDialog?.element?.querySelectorAll('[role="tab"]') || [])
      .find((node) => node.textContent === "Create account");
    if (tab instanceof HTMLElement) tab.click();
  }

  function openCreateAccount(trigger?: EventTarget | null) {
    accountDialog?.open(trigger, { mode: "register" });
    activateCreateAccountTab();
  }

  const didAutoOpenAccount = useRef(false);

  useEffect(() => {
    if (context.page !== "account") {
      didAutoOpenAccount.current = false;
      return;
    }
    const action = accountPageAutoOpenAction(
      context.page,
      platformState,
      didAutoOpenAccount.current
    );
    if (!action || !accountDialog) return;
    didAutoOpenAccount.current = true;
    if (action === "onboarding" && typeof accountDialog.showOnboarding === "function") {
      accountDialog.showOnboarding();
      return;
    }
    if (action === "sign-in") accountDialog.open();
  }, [accountDialog, context.page, platformState]);

  async function refreshAfterJoin() {
    await platform.learner?.refresh?.();
  }

  return (
    <L2eHubShell
      brandTitle={APP_CONFIG.shortName}
      brandTagline={APP_CONFIG.qualification}
      navigation={navigation}
      currentId={context.section}
      currentIds={currentIds(context)}
      theme={theme}
      actions={(
        <div className="student-account" data-student-account="">
          {signedIn ? (
            <>
              <span className="student-account__name">
                {learner?.displayName || learner?.fullName || (joinNeeded ? "Finish joining your class" : "Learner")}
              </span>
              {joinNeeded ? (
                <button
                  className="lp-button"
                  type="button"
                  data-join-class-open=""
                  onClick={(event) => openAccount(event.currentTarget)}
                >
                  {JOIN_CLASS_PROMPT}
                </button>
              ) : null}
              <button
                className="lp-button lp-button--secondary"
                type="button"
                onClick={(event) => openAccount(event.currentTarget)}
              >
                Account
              </button>
            </>
          ) : (
            <button
              className="lp-button lp-button--secondary"
              type="button"
              data-student-sign-in=""
              onClick={(event) => accountDialog?.open(event.currentTarget)}
            >
              Sign in
            </button>
          )}
        </div>
      )}
      breadcrumbs={breadcrumbs(context, pkg)}
      resolveHref={(path) => createSitePath(context.root, path)}
      pageHeader={header}
      learnerHeader={(
        <LearnerHeader
          learner={learner}
          hubName={platform.config.hubName}
          accountHref={platform.config.accountPath}
          onSignOut={() => platform.auth.signOut()}
        />
      )}
      footer={{
        lines: [
          APP_CONFIG.siteName,
          APP_CONFIG.qualification,
          APP_CONFIG.currentPhase
        ]
      }}
    >
      <CourseLayout currentPage={context.section} root={context.root}>
        <PageBody
          context={context}
          platform={guardedPlatform}
          pkg={pkg}
          contentReady={contentReady}
          platformState={platformState}
          onJoined={() => { void refreshAfterJoin(); }}
          onOpenSignIn={platformState === "signed-out" ? openSignInDialog : openAccount}
          onOpenCreateAccount={openCreateAccount}
          onSwitchAccount={handleSwitchAccount}
        />
      </CourseLayout>
    </L2eHubShell>
  );
}
