import { Callout, LoadingState } from "@learning-platform/ui";
import { activeContentPackage } from "../curriculum/apply-runtime";
import { homeWeeksFromPackage, type ContentPackage } from "../curriculum/from-package";
import { createSitePath } from "../paths";

export function CourseGuidePage({ root, pkg }: { root: string; pkg?: ContentPackage | null }) {
  const content = activeContentPackage(pkg);
  if (!content) {
    return <LoadingState message="Loading the course guide." />;
  }
  const weeks = homeWeeksFromPackage(content);

  return (
    <div className="study-stack">
      <section className="study-card" aria-labelledby="structure-heading">
        <h2 id="structure-heading">Course structure</h2>
        <p>
          Follow the weekly teaching sequence for L2 E Computing. Each week has one
          1.5-hour session.
        </p>
        <ul>
          {weeks.map((week) => (
            <li key={week.id}>{`${week.label}: ${week.title}`}</li>
          ))}
        </ul>
        <p>
          Later weeks stay in the scheme of learning until they are authored in this
          hub.
        </p>
      </section>
      <section className="study-card" aria-labelledby="start-heading">
        <h2 id="start-heading">Start the course</h2>
        <p>Week 1 is the current teaching week.</p>
        <a className="text-link" href={createSitePath(root, "week-1/")}>Open Week 1</a>
      </section>
      <Callout
        tone="info"
        title="How to use this hub"
        message="Use Course sections beside the page on a larger screen, or the Menu button at the top on a smaller screen."
      />
    </div>
  );
}
