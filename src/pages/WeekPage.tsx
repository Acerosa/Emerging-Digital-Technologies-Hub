import {
  InteractiveActivity,
  LoadingState,
  WeekView,
  questionIdFor,
  type ActivityBlockDocument,
  type ActivityDocument,
  type ActivityResult
} from "@learning-platform/ui";
import { useLayoutEffect, useMemo, useRef } from "react";
import { getContentEngine } from "../content/engine";
import { activeContentPackage } from "../curriculum/apply-runtime";
import { weekPageFromPackage, type ContentPackage } from "../curriculum/from-package";
import { createSitePath } from "../paths";

function persistableResponse(block: ActivityBlockDocument, result: ActivityResult): unknown {
  const type = String(block.type || "").toLowerCase();
  const responses = result.responses;
  if (type === "single-choice" || type === "option-cards") {
    if (responses && typeof responses === "object" && !Array.isArray(responses) && "optionId" in responses) {
      const optionId = (responses as { optionId?: string | null }).optionId;
      return optionId == null ? "" : optionId;
    }
    return responses == null ? "" : responses;
  }
  return responses && typeof responses === "object" ? responses : {};
}

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
  const mountRef = useRef<HTMLDivElement>(null);
  const content = activeContentPackage(pkg);
  const model = useMemo(
    () => (content ? weekPageFromPackage(content, weekId) : null),
    [content, weekId]
  );

  const sessions = useMemo(() => {
    if (!content || !model) return [];
    const engine = getContentEngine();
    return model.sessions.map((session) => ({
      ...session,
      activities: session.activities.map((item) => {
        const activity = content.activities?.find((entry) => entry.id === item.id) as ActivityDocument | undefined;
        if (!activity) return { html: "" };
        return {
          children: (
            <InteractiveActivity
              activity={activity}
              renderFallback={(block) => (
                <div dangerouslySetInnerHTML={{ __html: engine.renderBlock(block) }} />
              )}
              onResult={(result: ActivityResult, block: ActivityBlockDocument) => {
                const article = mountRef.current?.querySelector(`[data-lp-activity="${activity.id}"]`);
                article?.dispatchEvent(new CustomEvent("lp-block-result", {
                  bubbles: true,
                  detail: {
                    questionId: questionIdFor(block),
                    response: persistableResponse(block, result),
                    completed: result.completed
                  }
                }));
              }}
            />
          )
        };
      })
    }));
  }, [content, model]);

  // Re-bind after every commit. React can rewrite dangerouslySetInnerHTML nodes on a
  // later render and wipe data-lp-bound / listeners without changing sessions identity.
  useLayoutEffect(() => {
    const rootEl = mountRef.current;
    if (!content || !rootEl || !sessions.length) return;

    getContentEngine().bindInteractive(rootEl, content, {
      sourcePage: window.location.pathname,
      platform: platform || (typeof window !== "undefined" ? window.LearningPlatform?.platform : undefined)
    });
  });

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
