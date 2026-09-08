import { EmptyState } from "@learning-platform/ui";
import { JoinClassPanel } from "../components/JoinClassPanel";
import { createSitePath } from "../paths";

export function ResourcesPage({ root }: { root: string }) {
  return (
    <section className="study-card" aria-labelledby="resources-heading">
      <h2 id="resources-heading">Course resources</h2>
      <p>References and supporting material for Exploring New and Emerging Digital Technologies will be added here.</p>
      <EmptyState
        heading="Resources will be added here"
        message="Course documents and templates are not in this hub component yet."
      />
      <div className="related-links">
        <a href={createSitePath(root, "course-guide/")}>Course Guide</a>
        <a href={createSitePath(root, "help/")}>Help</a>
      </div>
    </section>
  );
}

export function HelpPage() {
  return (
    <div className="study-stack">
      <section className="study-card" aria-labelledby="navigation-heading">
        <h2 id="navigation-heading">Finding a section</h2>
        <p>On a computer, use the Course sections menu beside the page. On a smaller screen, open the Menu button at the top.</p>
      </section>
      <section className="study-card" aria-labelledby="keyboard-heading">
        <h2 id="keyboard-heading">Keyboard access</h2>
        <p>Press Tab to move through links and controls. Use the skip link to move directly to the main content.</p>
      </section>
      <section className="study-card" aria-labelledby="account-heading">
        <h2 id="account-heading">Account and progress</h2>
        <p>Teaching pages remain readable without an account. Progress, enrolment and submissions require authentication. Passwords are sent only to Supabase Auth.</p>
      </section>
    </div>
  );
}

type AccountPageProps = {
  root?: string;
  platformState?: string;
  platform?: {
    onboarding?: unknown;
    learner?: {
      getState?: () => {
        status?: string;
        context?: {
          firstName?: string;
          surname?: string;
          studentNumber?: string;
          displayName?: string;
          fullName?: string;
          contactEmail?: string;
          groupName?: string;
          groupCode?: string;
          yearGroup?: string;
          enrolments?: unknown[];
        } | null;
      };
    };
  };
  onSignIn?: (trigger?: EventTarget | null) => void;
  onJoined?: () => void;
};

export function AccountPage({
  root = ".",
  platformState = "signed-out",
  platform,
  onSignIn,
  onJoined
}: AccountPageProps) {
  const context = platform?.learner?.getState?.()?.context;
  const name = context?.displayName || context?.fullName || [context?.firstName, context?.surname].filter(Boolean).join(" ");
  const groupLabel = [context?.yearGroup, context?.groupName || context?.groupCode].filter(Boolean).join(" — ");
  const enrolled = platformState === "ready" || platformState === "no-assignments";

  return (
    <div className="study-stack" data-lp-account-page="">
      <section className="study-card" aria-labelledby="account-overview-heading">
        <h2 id="account-overview-heading">Your account</h2>
        {platformState === "signed-out" ? (
          <p>You are signed out. Sign in to join your class and save checked answers to your learning record.</p>
        ) : (
          <dl className="account-summary">
            <div>
              <dt>Learner</dt>
              <dd data-account-learner-name="">{name || "Signed in"}</dd>
            </div>
            <div>
              <dt>Class group</dt>
              <dd data-account-group-status={enrolled ? "joined" : "not-joined"}>
                {enrolled ? (groupLabel || "Joined") : "Not joined yet"}
              </dd>
            </div>
            {context?.contactEmail ? (
              <div>
                <dt>Email</dt>
                <dd>{context.contactEmail}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </section>

      {platform ? (
        <JoinClassPanel
          platformState={platformState}
          platform={platform as never}
          root={root}
          onSignIn={onSignIn}
          onJoined={onJoined}
        />
      ) : (
        <section className="study-card">
          <h2>Sign in or register</h2>
          <p>Use the Sign in control in the header to create an account and join your class.</p>
        </section>
      )}
    </div>
  );
}
