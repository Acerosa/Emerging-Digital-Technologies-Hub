import { Callout, LoadingState, StatusBadge, WeekAccessLink } from "@learning-platform/ui";
import type { ContentPackage } from "../curriculum/from-package";
import { l2eRuntimeWeeks } from "../curriculum/runtime-weeks";
import { createSitePath } from "../paths";

const HOME_WEEK_COPY: Record<number, { description: string }> = {
  1: {
    description:
      "Introduction to new and emerging digital technologies: mobile, AI, IoT and cloud."
  },
  2: {
    description:
      "Internet of Things, RFID, NFC and wearables: connected devices and sector uses."
  },
  3: {
    description:
      "Cloud technology and related emerging technologies: SaaS, PaaS, IaaS, DaaS and more."
  }
};

function homeBadgeLabel(week: { available: boolean; status: string }) {
  if (week.available) return "Available";
  return week.status === "archived" ? "Archived" : "Planned";
}

export function HomePage({ root, livePackage }: { root: string; livePackage?: ContentPackage | null }) {
  const weeks = l2eRuntimeWeeks(livePackage);
  if (!weeks.length) {
    return <LoadingState message="Loading the weekly teaching sequence." />;
  }

  return (
    <div className="study-stack">
      <section className="study-card" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading">Welcome</h2>
        <p>
          Practice activities for Exploring New and Emerging Digital Technologies.
          Open an available week below to start.
        </p>
      </section>

      <section aria-labelledby="start-heading">
        <h2 id="start-heading">Where to start</h2>
        <div className="home-week-scroller" tabIndex={0} aria-label="Week cards">
          <div className="card-grid">
            {weeks.map((week) => {
              const copy = HOME_WEEK_COPY[week.teachingWeek];
              return (
                <article className="hub-card" key={week.id}>
                  <StatusBadge
                    status={week.available ? "available" : (week.status || "planned")}
                    label={homeBadgeLabel(week)}
                  />
                  <h3>{`Week ${week.teachingWeek}`}</h3>
                  <p>{copy?.description || week.title}</p>
                  <WeekAccessLink
                    week={week}
                    href={createSitePath(root, `week-${week.teachingWeek}/`)}
                    className="card-link"
                    lockedClassName="card-link card-link--locked"
                    renderLink={({ href, children, className }) => (
                      <a className={className} href={href}>{children}</a>
                    )}
                  >
                    {`Open Week ${week.teachingWeek}`}
                  </WeekAccessLink>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="study-card" aria-labelledby="organisation-heading">
        <h2 id="organisation-heading">How activities are organised</h2>
        <p>
          Each week has one session with the activities for that lesson. Open an available
          week from the cards above when your tutor has released it.
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
