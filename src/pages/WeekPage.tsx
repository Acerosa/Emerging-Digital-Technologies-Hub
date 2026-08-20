import { LoadingState, WeekView } from "@learning-platform/ui";
import { useEffect, useRef } from "react";
import { getContentEngine } from "../content/engine";
import { activeContentPackage } from "../curriculum/apply-runtime";
import { weekPageFromPackage, type ContentPackage } from "../curriculum/from-package";
import { createSitePath } from "../paths";

export function WeekPage({
  weekId,
  root,
  pkg
}: {
  weekId: string;
  root: string;
  pkg?: ContentPackage | null;
}) {
  const engine = getContentEngine();
  const mountRef = useRef<HTMLDivElement>(null);
  const content = activeContentPackage(pkg);
  const model = content ? weekPageFromPackage(content, weekId) : null;

  useEffect(() => {
    if (!content || !mountRef.current) return;
    engine.bindInteractive(mountRef.current, content, {
      sourcePage: window.location.pathname
    });
  }, [engine, content, model]);

  if (!content) {
    return <LoadingState message="Loading this week's sessions" />;
  }
  if (!model) {
    return <LoadingState message="This week has not been published yet." />;
  }

  const weekNumber = model.week.teachingWeek;
  const sessions = model.sessions.map((session) => ({
    ...session,
    activities: session.activities.map((activity) => ({
      html: engine.renderActivity(
        content.activities?.find((item) => item.id === activity.id)
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
