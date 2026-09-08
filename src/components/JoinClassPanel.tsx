import { FormEvent, useEffect, useState } from "react";
import {
  EXPECTED_GROUP_CODE,
  EXPECTED_REGISTRATION_KEY,
  JOIN_CLASS_PROMPT,
  hasExpectedGroupEnrolment,
  needsJoinClass,
  normaliseRegistrationKey,
  optionLabel,
  type EnrolmentRow,
  type RegistrationOption
} from "../enrolment";
import { createSitePath } from "../paths";

type ProfileFields = {
  firstName: string;
  surname: string;
  studentNumber: string;
};

type OnboardingService = {
  getPending?: () => Partial<ProfileFields> & { registrationKey?: string } | null;
  getRegistrationOptions?: () => Promise<RegistrationOption[]>;
  complete?: (details: ProfileFields, registrationKey: string) => Promise<unknown>;
};

type JoinClassPanelProps = {
  platformState: string;
  platform: {
    onboarding?: OnboardingService;
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

function profileFromPlatform(platform: JoinClassPanelProps["platform"]): ProfileFields {
  const pending = platform.onboarding?.getPending?.() || null;
  const context = platform.learner?.getState?.()?.context;
  return {
    firstName: String(pending?.firstName || context?.firstName || "").trim(),
    surname: String(pending?.surname || context?.surname || "").trim(),
    studentNumber: String(pending?.studentNumber || context?.studentNumber || "").trim()
  };
}

export function JoinClassPanel({
  platformState,
  platform,
  root = ".",
  compact = false,
  onJoined,
  onSignIn
}: JoinClassPanelProps) {
  const context = platform.learner?.getState?.()?.context;
  const enrolments = (context?.enrolments || null) as EnrolmentRow[] | null;
  const accessNeedsJoin = needsJoinClass(platformState, { enrolments });
  const enrolled = (platformState === "ready" || platformState === "no-assignments")
    && hasExpectedGroupEnrolment(enrolments, EXPECTED_GROUP_CODE);
  const guest = platformState === "signed-out";
  const initial = profileFromPlatform(platform);

  const [firstName, setFirstName] = useState(initial.firstName);
  const [surname, setSurname] = useState(initial.surname);
  const [studentNumber, setStudentNumber] = useState(initial.studentNumber);
  const [registrationKey, setRegistrationKey] = useState(
    platform.onboarding?.getPending?.()?.registrationKey || EXPECTED_REGISTRATION_KEY
  );
  const [options, setOptions] = useState<RegistrationOption[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!accessNeedsJoin) return;
    let cancelled = false;
    void (async () => {
      try {
        const rows = await platform.onboarding?.getRegistrationOptions?.();
        if (!cancelled && Array.isArray(rows)) setOptions(rows);
      } catch {
        if (!cancelled) setOptions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [accessNeedsJoin, platform]);

  useEffect(() => {
    const next = profileFromPlatform(platform);
    if (next.firstName) setFirstName(next.firstName);
    if (next.surname) setSurname(next.surname);
    if (next.studentNumber) setStudentNumber(next.studentNumber);
  }, [platform, platformState]);

  if (guest) {
    return (
      <section className="join-class panel" data-lp-join-class="guest" aria-labelledby="join-class-heading">
        <h2 id="join-class-heading">{JOIN_CLASS_PROMPT}</h2>
        <p>Sign in to join your class and check answers against your learning record.</p>
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
    const groupLabel = [context?.yearGroup, context?.groupName || context?.groupCode]
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

  const needsProfileFields = !initial.firstName || !initial.surname || !initial.studentNumber
    || platformState === "onboarding-required";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    setStatus("Joining your class…");
    const key = normaliseRegistrationKey(registrationKey);
    const details = {
      firstName: firstName.trim(),
      surname: surname.trim(),
      studentNumber: studentNumber.trim()
    };
    try {
      if (!details.firstName || !details.surname || !details.studentNumber) {
        throw Object.assign(new Error("Enter your learner details."), {
          learnerMessage: "Enter your first name, surname and Student ID."
        });
      }
      if (!key) {
        throw Object.assign(new Error("Enter your class registration key."), {
          learnerMessage: "Enter the class registration key from your tutor."
        });
      }
      if (typeof platform.onboarding?.complete !== "function") {
        throw Object.assign(new Error("Join class is unavailable."), {
          learnerMessage: "Join class is unavailable right now. Try again shortly."
        });
      }
      await platform.onboarding.complete(details, key);
      setStatus("You have joined your class.");
      onJoined?.();
    } catch (failure) {
      setError(true);
      const message = failure && typeof failure === "object" && "learnerMessage" in failure
        ? String((failure as { learnerMessage?: string }).learnerMessage || "")
        : "";
      setStatus(message || "Could not join your class. Check the registration key and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={`join-class panel${compact ? " join-class--compact" : ""}`}
      data-lp-join-class="needs-join"
      aria-labelledby="join-class-heading"
    >
      <h2 id="join-class-heading">{JOIN_CLASS_PROMPT}</h2>
      <p>
        Enter the registration key from your tutor to join <strong>L2E Delivery Group A</strong>.
        Activities stay readable, but Check answer needs a class enrolment.
      </p>
      <form className="join-class__form lp-form" onSubmit={handleSubmit} noValidate>
        {needsProfileFields ? (
          <>
            <label className="lp-form__field">
              <span>First name</span>
              <input
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>
            <label className="lp-form__field">
              <span>Surname</span>
              <input
                name="surname"
                autoComplete="family-name"
                value={surname}
                onChange={(event) => setSurname(event.target.value)}
                required
              />
            </label>
            <label className="lp-form__field">
              <span>Student ID</span>
              <input
                name="studentNumber"
                autoComplete="off"
                value={studentNumber}
                onChange={(event) => setStudentNumber(event.target.value)}
                required
              />
            </label>
          </>
        ) : null}
        <label className="lp-form__field">
          <span>Class registration key</span>
          <input
            name="registrationKey"
            data-join-class-key=""
            autoComplete="off"
            spellCheck={false}
            value={registrationKey}
            onChange={(event) => setRegistrationKey(event.target.value)}
            placeholder={EXPECTED_REGISTRATION_KEY}
            required
          />
        </label>
        {options.length > 0 ? (
          <label className="lp-form__field">
            <span>Or choose an open class</span>
            <select
              data-join-class-option=""
              value={options.some((item) => item.registrationKey === registrationKey) ? registrationKey : ""}
              onChange={(event) => {
                if (event.target.value) setRegistrationKey(event.target.value);
              }}
            >
              <option value="">Choose a year and group</option>
              {options.map((option) => (
                <option key={option.registrationKey} value={option.registrationKey}>
                  {optionLabel(option)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <p
          className={error ? "join-class__status join-class__status--error" : "join-class__status"}
          role={error ? "alert" : "status"}
          aria-live="polite"
        >
          {status}
        </p>
        <div className="join-class__actions">
          <button className="lp-button" type="submit" disabled={busy} data-join-class-submit="">
            {busy ? "Joining…" : "Join class"}
          </button>
          <a className="lp-button lp-button--secondary" href={createSitePath(root, "account/")}>
            Account
          </a>
        </div>
      </form>
    </section>
  );
}
