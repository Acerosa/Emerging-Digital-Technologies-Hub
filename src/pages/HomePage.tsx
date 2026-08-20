import { Callout, LoadingState, StatusBadge } from "@learning-platform/ui";
import { activeContentPackage } from "../curriculum/apply-runtime";
import { homeWeeksFromPackage, type ContentPackage } from "../curriculum/from-package";
import { createSitePath } from "../paths";

export function HomePage({ root, pkg }: { root: string; pkg?: ContentPackage | null }) {
  const content = activeContentPackage(pkg);
  if (!content) {
    return <LoadingState message="Loading the weekly teaching sequence." />;
  }
  const weeks = homeWeeksFromPackage(content);

  return (
    <div className="study-stack">
      <section className="study-card" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading">Welcome</h2>
        <p>
          Practice activities for Exploring New and Emerging Digital Technologies.
          Open a week below to start.
        </p>
      </section>

      <section aria-labelledby="start-heading">
        <h2 id="start-heading">Where to start</h2>
        <div className="home-week-scroller" tabIndex={0} aria-label="Week cards">
          <div className="card-grid">
            {weeks.map((week) => (
              <article className="hub-card" key={week.id}>
                <StatusBadge
                  status="available"
                  label={week.current ? "Active" : "Available"}
                />
                <h3>{week.label}</h3>
                <p>{`${week.title}. ${week.description}`}</p>
                <a className="card-link" href={createSitePath(root, week.path)}>
                  {`Open ${week.label}`}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="study-card" aria-labelledby="organisation-heading">
        <h2 id="organisation-heading">How activities are organised</h2>
        <p>
          Each week has one session with the activities for that lesson. Weeks 1 to 3
          are ready to use now.
        </p>
        <a className="text-link" href={createSitePath(root, "course-guide/")}>Open Course Guide</a>
      </section>

      <Callout
        tone="info"
        title="Formative learning"
        message="These materials are for teaching and practice. They are not Gateway assignment evidence and do not produce a qualification grade."
      />
    </div>
  );
}
