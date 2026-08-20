import { Callout, StatusBadge } from "@learning-platform/ui";
import pkg from "../../content/l2e-exploring-emerging-digital-technologies/package.json";
import { homeWeeksFromPackage } from "../curriculum/from-package";
import { createSitePath } from "../paths";

const WEEKS = homeWeeksFromPackage(pkg);

export function HomePage({ root }: { root: string }) {
  return (
    <div className="study-stack">
      <section className="study-card" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading">Welcome</h2>
        <p>
          This hub supports formative teaching for Gateway Qualifications Level 2
          Certificate in Digital and IT Skills (603/6502/X), unit Exploring New and
          Emerging Digital Technologies (M/618/3683).
        </p>
        <p>
          L2 E Computing has one 1.5-hour session each week. Start with the current
          week overview. Interactive activities for that week are listed there so you
          can follow the teaching sequence without hunting across the site.
        </p>
      </section>

      <section aria-labelledby="start-heading">
        <h2 id="start-heading">Where to start</h2>
        <div className="home-week-scroller" tabIndex={0} aria-label="Week cards">
          <div className="card-grid">
            {WEEKS.map((week) => (
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
          Learning activities sit inside each week. Weeks 1 to 3 are authored in this
          first cut. Each week has one session, not three lessons.
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
