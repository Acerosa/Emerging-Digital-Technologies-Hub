import { EXPECTED_GROUP_CODE, JOIN_CLASS_PROMPT, SIGN_IN_TO_CONTINUE, needsJoinClass } from "../enrolment";
import { createSitePath } from "../paths";

type JoinClassPanelProps = {
  platformState: string;
  platform: {
    onboarding?: unknown;
    learner?: {
      getState?: () => {
        status?: string;
        context?: {
          firstName?: string;
          surname?: string;
          studentNumber?: string;
          groupName?: string;
          groupCode?: string;
          yearGroup?: string;
          enrolments?: unknown[];
        } | null;
      };
    };
  };
  root?: string;
  compact?: boolean;
  onJoined?: () => void;
  onSignIn?: (trigger?: EventTarget | null) => void;
};

export function JoinClassPanel({
  platformState,
  platform,
  root = ".",
  compact = false,
  onSignIn
}: JoinClassPanelProps) {
  const accessNeedsJoin = needsJoinClass(platformState);
  const enrolled = platformState === "ready" || platformState === "no-assignments";
  const guest = platformState === "signed-out";
  const context = platform.learner?.getState?.()?.context;

  if (guest) {
    return (
      <section className="join-class panel" data-lp-join-class="guest" aria-labelledby="join-class-heading">
        <h2 id="join-class-heading">{SIGN_IN_TO_CONTINUE}</h2>
        <p>Sign in with the same email and password you use on other learning hubs.</p>
        <div className="join-class__actions">
          <button
            className="lp-button"
            type="button"
            data-join-class-sign-in=""
            onClick={(event) => onSignIn?.(event.currentTarget)}
          >
            Sign in
          </button>
          <a className="lp-button lp-button--secondary" href={createSitePath(root, "account/")}>
            Open Account
          </a>
        </div>
      </section>
    );
  }

  if (enrolled) {
    const groupLabel = [context?.yearGroup, context?.groupName || context?.groupCode || EXPECTED_GROUP_CODE]
      .filter(Boolean)
      .join(" — ") || "Your class";
    return (
      <section className="join-class panel" data-lp-join-class="enrolled" aria-labelledby="join-class-heading">
        <h2 id="join-class-heading">Your class</h2>
        <p data-join-class-status="joined">You are joined to <strong>{groupLabel}</strong>.</p>
        {!compact ? (
          <p className="join-class__hint">You can check answers for assigned activities on this hub.</p>
        ) : null}
      </section>
    );
  }

  if (!accessNeedsJoin) return null;

  return (
    <section
      className={`join-class panel${compact ? " join-class--compact" : ""}`}
      data-lp-join-class="needs-join"
      aria-labelledby="join-class-heading"
    >
      <h2 id="join-class-heading">{JOIN_CLASS_PROMPT}</h2>
      <p>
        Your L2E class is assigned automatically. Finish your learner details if asked,
        then this hub will enrol you into <strong>L2E Delivery Group A</strong>.
      </p>
      <div className="join-class__actions">
        <button
          className="lp-button"
          type="button"
          data-join-class-setup=""
          onClick={(event) => onSignIn?.(event.currentTarget)}
        >
          {JOIN_CLASS_PROMPT}
        </button>
        <a className="lp-button lp-button--secondary" href={createSitePath(root, "account/")}>
          Account
        </a>
      </div>
    </section>
  );
}
