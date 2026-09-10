import { useState } from "react";
import { JoinClassPanel } from "../components/JoinClassPanel";

type RefreshResult = {
  ok?: boolean;
  status?: string;
  requiresSignIn?: boolean;
  learnerMessage?: string;
};

type HubPlatform = {
  refreshHubSession?: () => Promise<RefreshResult | undefined>;
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

type AccountPageProps = {
  root?: string;
  platformState?: string;
  platform?: HubPlatform;
  onSignIn: (trigger?: EventTarget | null) => void;
  onCreateAccount?: (trigger?: EventTarget | null) => void;
  onSwitchAccount?: (trigger?: EventTarget | null) => void | Promise<void>;
  onJoined?: () => void;
};

export function AccountPage({
  root = ".",
  platformState = "signed-out",
  platform,
  onSignIn,
  onCreateAccount,
  onSwitchAccount,
  onJoined
}: AccountPageProps) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const context = platform?.learner?.getState?.()?.context;
  const name = context?.displayName || context?.fullName
    || [context?.firstName, context?.surname].filter(Boolean).join(" ");
  const groupLabel = [context?.yearGroup, context?.groupName || context?.groupCode].filter(Boolean).join(" — ");
  const enrolled = platformState === "ready" || platformState === "no-assignments";

  async function handleRefresh(event: React.MouseEvent<HTMLButtonElement>) {
    if (typeof platform?.refreshHubSession !== "function") return;
    setBusy(true);
    setError(false);
    setStatus("Refreshing your session…");
    try {
      const result = await platform.refreshHubSession();
      const message = result?.learnerMessage
        || (result?.ok ? "Session refreshed." : "Could not refresh session.");
      setStatus(message);
      setError(!result?.ok);
      if (result?.requiresSignIn) {
        onSignIn(event.currentTarget);
      }
    } catch (failure) {
      setError(true);
      const message = (failure && typeof failure === "object" && "learnerMessage" in failure)
        ? String((failure as { learnerMessage?: string }).learnerMessage || "")
        : "";
      setStatus(message || "Could not refresh session. Try signing in again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="study-stack" data-lp-account-page="">
      <section className="panel l2e-account" aria-labelledby="account-heading" data-l2e-account="core">
        <h2 id="account-heading">Learner account</h2>
        {platformState === "signed-out" ? (
          <>
            <p>
              Sign in or create an account to save your L2E progress.
              If you already created an account on another learning hub, sign in using
              the same email and password.
            </p>
            <p>
              Joining your L2E class is a separate step. After you are signed in,
              enter the class registration key from your tutor.
            </p>
          </>
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
        <div className="l2e-account__actions">
          <button
            className="lp-button"
            type="button"
            data-account-sign-in=""
            onClick={(event) => onSignIn(event.currentTarget)}
          >
            Sign in
          </button>
          {onCreateAccount ? (
            <button
              className="lp-button lp-button--secondary"
              type="button"
              data-account-create=""
              onClick={(event) => onCreateAccount(event.currentTarget)}
            >
              Create account
            </button>
          ) : null}
          {typeof platform?.refreshHubSession === "function" ? (
            <button
              className="lp-button lp-button--secondary"
              type="button"
              data-account-refresh-session=""
              disabled={busy}
              onClick={handleRefresh}
            >
              {busy ? "Refreshing…" : "Refresh session"}
            </button>
          ) : null}
        </div>
        {status ? (
          <p
            className={error ? "l2e-account__status l2e-account__status--error" : "l2e-account__status"}
            role={error ? "alert" : "status"}
            aria-live="polite"
            data-account-refresh-status=""
          >
            {status}
          </p>
        ) : null}
      </section>

      {platform ? (
        <JoinClassPanel
          platformState={platformState}
          platform={platform as never}
          root={root}
          onSignIn={onSignIn}
          onSwitchAccount={onSwitchAccount}
          onJoined={onJoined}
        />
      ) : null}
    </div>
  );
}
