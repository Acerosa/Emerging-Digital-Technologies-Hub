import { HubShell, LearnerHeader } from "@learning-platform/ui";
import { CourseLayout } from "./components/CourseSidebar";
import { APP_CONFIG } from "./config";
import { ContentPackageProvider, useLoadedContent } from "./content/ContentPackageProvider";
import { useHubPlatform } from "./hooks/useHubPlatform";
import { currentIds, type PageContext } from "./page-context";
import { breadcrumbs, pageHeader } from "./page-copy";
import { CourseGuidePage } from "./pages/CourseGuidePage";
import { HomePage } from "./pages/HomePage";
import { AccountPage, HelpPage, ResourcesPage } from "./pages/StaticPages";
import { WeekPage } from "./pages/WeekPage";
import { createSitePath, navigationItems } from "./paths";

function PageBody({ context }: { context: PageContext }) {
  const { pkg } = useLoadedContent();
  if (context.page === "course-guide") return <CourseGuidePage root={context.root} pkg={pkg} />;
  if (/^week-\d+$/.test(context.page)) {
    return <WeekPage weekId={context.page} root={context.root} pkg={pkg} />;
  }
  if (context.page === "resources") return <ResourcesPage root={context.root} />;
  if (context.page === "help") return <HelpPage />;
  if (context.page === "account") return <AccountPage />;
  return <HomePage root={context.root} pkg={pkg} />;
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
  const { pkg, publicationHtml } = useLoadedContent();
  const { learner, theme, accountDialog, platform } = hub;
  const header = pageHeader(context, pkg);

  return (
    <HubShell
      brandTitle={APP_CONFIG.shortName}
      brandTagline={APP_CONFIG.qualification}
      navigation={navigationItems([...APP_CONFIG.navigation], context.root)}
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
      notice={publicationHtml
        ? <div data-publication-status="" dangerouslySetInnerHTML={{ __html: publicationHtml }} />
        : <div data-publication-status="" />}
      footer={{
        lines: [
          APP_CONFIG.siteName,
          APP_CONFIG.qualification,
          APP_CONFIG.currentPhase
        ]
      }}
    >
      <CourseLayout currentPage={context.section} root={context.root}>
        <PageBody context={context} />
      </CourseLayout>
    </HubShell>
  );
}
