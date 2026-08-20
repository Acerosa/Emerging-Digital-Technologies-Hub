import { LoadingState, WeekView } from "@learning-platform/ui";
import { useEffect, useRef } from "react";
import pkg from "../../content/l2e-exploring-emerging-digital-technologies/package.json";
import { getContentEngine } from "../content/engine";
import { weekPageFromPackage } from "../curriculum/from-package";
import { createSitePath } from "../paths";

export function WeekPage({ weekId, root }: { weekId: string; root: string }) {
  const engine = getContentEngine();
  const mountRef = useRef<HTMLDivElement>(null);
  const model = weekPageFromPackage(pkg, weekId);

  useEffect(() => {
    if (!pkg || !mountRef.current) return;
    engine.bindInteractive(mountRef.current, pkg, {
      sourcePage: window.location.pathname
    });
  }, [engine, model]);

  if (!model) {
    return <LoadingState message="This week has not been published yet." />;
  }

  const weekNumber = model.week.teachingWeek;
  const sessions = model.sessions.map((session) => ({
    ...session,
    activities: session.activities.map((activity) => ({
      html: engine.renderActivity(
        pkg.activities.find((item) => item.id === activity.id)
      )
    }))
  }));

  return (
    <div data-lp-mount="" ref={mountRef}>
      <WeekView
        week={{
          id: model.week.id,
          teachingWeek: weekNumber,
          title: model.week.title,
          subtitle: model.week.subtitle,
          status: model.week.status
        }}
        learningOutcomes={model.learningOutcomes}
        context={{
          type: "assignment",
          contextType: "assignment",
          heading: "Teaching context",
          description: "Formative learning for Exploring New and Emerging Digital Technologies (M/618/3683). This is not Gateway assignment evidence.",
          items: [
            { label: "Qualification", value: "Gateway Level 2 Digital and IT Skills" },
            { label: "Unit", value: "Exploring New and Emerging Digital Technologies (M/618/3683)" },
            { label: "Week", value: `Week ${weekNumber}: ${model.week.title}` }
          ]
        }}
        features={{
          showTitle: false,
          showAssignmentContext: true,
          showProjectContext: false,
          showExamContext: false
        }}
        previousWeek={weekNumber > 1
          ? { label: `Week ${weekNumber - 1}`, href: createSitePath(root, `week-${weekNumber - 1}/`) }
          : null}
        nextWeek={weekNumber < 3
          ? { label: `Week ${weekNumber + 1}`, href: createSitePath(root, `week-${weekNumber + 1}/`) }
          : null}
        sessions={sessions}
      />
    </div>
  );
}
