import { LearnerHeader } from "@learning-platform/ui";
import { useMemo } from "react";
import { CourseLayout } from "./components/CourseSidebar";
import { JoinClassPanel } from "./components/JoinClassPanel";
import { L2eHubShell } from "./components/L2eHubShell";
import { APP_CONFIG } from "./config";
import { liveContentPackage } from "./curriculum/apply-runtime";
import type { ContentPackage } from "./curriculum/from-package";
import {
  JOIN_CLASS_PROMPT,
  needsJoinClass,
  withEnrolmentGuardedMarking
} from "./enrolment";
import { useHubPlatform } from "./hooks/useHubPlatform";
import { currentIds, type PageContext } from "./page-context";
import { breadcrumbs, pageHeader } from "./page-copy";
import { CourseGuidePage } from "./pages/CourseGuidePage";
import { HomePage } from "./pages/HomePage";
import { AccountPage, HelpPage, ResourcesPage } from "./pages/StaticPages";
import { WeekPage } from "./pages/WeekPage";
import { buildL2eNavigation, buildL2eNavigationFallback, createSitePath } from "./paths";

function PageBody({
  context,
  platform,
  pkg,
  contentReady,
  platformState,
  accountDialog,
  onJoined
}: {
  context: PageContext;
  platform?: unknown;
  pkg?: ContentPackage | null;
  contentReady: boolean;
  platformState: string;
  accountDialog?: { open: (trigger?: EventTarget | null) => void; showOnboarding?: () => void } | null;
  onJoined?: () => void;
}) {
  if (context.page === "course-guide") return <CourseGuidePage root={context.root} pkg={pkg} />;
  if (/^week-\d+$/.test(context.page)) {
    const enrolments = (platform as { learner?: { getState?: () => { context?: { enrolments?: unknown[] } | null } } })
      ?.learner?.getState?.()?.context?.enrolments as import("./enrolment").EnrolmentRow[] | undefined;
    const joinGate = needsJoinClass(platformState, { enrolments }) || platformState === "signed-out";
    return (
      <>
        {joinGate ? (
          <JoinClassPanel
            compact
            root={context.root}
            platformState={platformState}
            platform={platform as never}
            onSignIn={(trigger) => accountDialog?.open(trigger)}
            onJoined={onJoined}
          />
        ) : null}
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
        onSignIn={(trigger) => accountDialog?.open(trigger)}
        onJoined={onJoined}
      />
    );
  }
  return <HomePage root={context.root} livePackage={contentReady ? liveContentPackage() : null} />;
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
  const enrolments = (learner as { enrolments?: import("./enrolment").EnrolmentRow[] } | null)?.enrolments;
  const signedIn = authStatus === "authenticated" || Boolean(learner) || needsJoinClass(platformState, { enrolments });
  const joinNeeded = needsJoinClass(platformState, { enrolments });
  const guardedPlatform = useMemo(
    () => withEnrolmentGuardedMarking(platform as never, () => platformState),
    [platform, platformState]
  );

  function openAccount(trigger?: EventTarget | null) {
    if (joinNeeded && typeof accountDialog?.showOnboarding === "function") {
      accountDialog.showOnboarding();
      return;
    }
    accountDialog?.open(trigger);
  }

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
          accountDialog={accountDialog}
          onJoined={() => { void refreshAfterJoin(); }}
        />
      </CourseLayout>
    </L2eHubShell>
  );
}
