import { LearnerHeader } from "@learning-platform/ui";
import { useMemo } from "react";
import { CourseLayout } from "./components/CourseSidebar";
import { L2eHubShell } from "./components/L2eHubShell";
import { APP_CONFIG } from "./config";
import { ContentPackageProvider, useLoadedContent } from "./content/ContentPackageProvider";
import { liveContentPackage } from "./curriculum/apply-runtime";
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
  contentReady
}: {
  context: PageContext;
  platform?: unknown;
  contentReady: boolean;
}) {
  const { pkg } = useLoadedContent();
  if (context.page === "course-guide") return <CourseGuidePage root={context.root} pkg={pkg} />;
  if (/^week-\d+$/.test(context.page)) {
    return <WeekPage weekId={context.page} root={context.root} pkg={pkg} platform={platform} />;
  }
  if (context.page === "resources") return <ResourcesPage root={context.root} />;
  if (context.page === "help") return <HelpPage />;
  if (context.page === "account") return <AccountPage />;
  return <HomePage root={context.root} livePackage={contentReady ? liveContentPackage() : null} />;
}

export function App({ context }: { context: PageContext }) {
  const hub = useHubPlatform(context.root);
  return (
    <ContentPackageProvider platform={hub.platform}>
      <HubApp context={context} hub={hub} />
    </ContentPackageProvider>
  );
}

function HubApp({
  context,
  hub
}: {
  context: PageContext;
  hub: ReturnType<typeof useHubPlatform>;
}) {
  const { pkg, source } = useLoadedContent();
  const { learner, theme, accountDialog, platform } = hub;
  const contentReady = Boolean(pkg) && source !== "none";
  const header = pageHeader(context, pkg);
  const navigation = useMemo(
    () => (contentReady
      ? buildL2eNavigation(context.root, liveContentPackage())
      : buildL2eNavigationFallback(context.root)),
    [context.root, contentReady, source]
  );

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
          {learner ? (
            <>
              <span className="student-account__name">{learner.displayName || learner.fullName || "Learner"}</span>
              <button
                className="lp-button lp-button--secondary"
                type="button"
                onClick={(event) => accountDialog?.open(event.currentTarget)}
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
        <PageBody context={context} platform={platform} contentReady={contentReady} />
      </CourseLayout>
    </L2eHubShell>
  );
}
