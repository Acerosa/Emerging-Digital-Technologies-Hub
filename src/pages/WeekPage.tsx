import { LoadingState, WeekView } from "@learning-platform/ui";
import { useLayoutEffect, useMemo, useRef } from "react";
import { getContentEngine } from "../content/engine";
import { activeContentPackage } from "../curriculum/apply-runtime";
import { weekPageFromPackage, type ContentPackage } from "../curriculum/from-package";
import { createSitePath } from "../paths";

export function WeekPage({
  weekId,
  root,
  pkg,
  platform
}: {
  weekId: string;
  root: string;
  pkg?: ContentPackage | null;
  platform?: unknown;
}) {
  const engine = getContentEngine();
  const mountRef = useRef<HTMLDivElement>(null);
  const content = activeContentPackage(pkg);
  const model = useMemo(
    () => (content ? weekPageFromPackage(content, weekId) : null),
    [content, weekId]
  );

  const sessions = useMemo(() => {
    if (!content || !model) return [];
    return model.sessions.map((session) => ({
      ...session,
      activities: session.activities.map((activity) => ({
        html: engine.renderActivity(
          content.activities?.find((item) => item.id === activity.id)
        )
      }))
    }));
  }, [content, engine, model]);

  useLayoutEffect(() => {
    const rootEl = mountRef.current;
    if (!content || !rootEl || !sessions.length) return;

    const options = {
      sourcePage: window.location.pathname,
      platform: platform || (typeof window !== "undefined" ? window.LearningPlatform?.platform : undefined)
    };

    const bind = () => {
      const articles = rootEl.querySelectorAll("[data-lp-activity]");
      if (!articles.length) return;
      // Replace already-bound nodes so a later curriculum hydrate can re-attach listeners.
      articles.forEach((article) => {
        if (!article.getAttribute("data-lp-bound")) return;
        article.parentNode?.replaceChild(article.cloneNode(true), article);
      });
      engine.bindInteractive(rootEl, content, options);
    };

    bind();
    const frame = window.requestAnimationFrame(bind);
    const timer = window.setTimeout(bind, 0);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [engine, content, weekId, sessions, platform]);

  if (!content) {
    return <LoadingState message="Loading this week's sessions" />;
  }
  if (!model) {
    return <LoadingState message="This week has not been published yet." />;
  }

  const weekNumber = model.week.teachingWeek;

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
