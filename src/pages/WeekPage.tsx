import {
  CompletionModal,
  InteractiveActivity,
  LoadingState,
  PracticeProgressPanel,
  WeekAccessGuard,
  WeekView,
  questionIdFor,
  type ActivityBlockDocument,
  type ActivityDocument,
  type ActivityResult,
  type ActivityScore
} from "@learning-platform/ui";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getContentEngine } from "../content/engine";
import { activeContentPackage, liveContentPackage } from "../curriculum/apply-runtime";
import { weekPageFromPackage, type ContentPackage } from "../curriculum/from-package";
import { runtimeWeekForId, runtimeWeekForTeachingWeek } from "../curriculum/runtime-weeks";
import { createSitePath } from "../paths";

function normaliseBlockType(value: string | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

function persistableResponse(block: ActivityBlockDocument, result: ActivityResult): unknown {
  const type = normaliseBlockType(block.type);
  const responses = result.responses;
  if (type === "single-choice" || type === "option-cards") {
    if (responses && typeof responses === "object" && !Array.isArray(responses) && "optionId" in responses) {
      const optionId = (responses as { optionId?: string | null }).optionId;
      return optionId == null ? "" : optionId;
    }
    return responses == null ? "" : responses;
  }
  if (type === "short-response" || type === "reflection") {
    if (typeof responses === "string") return responses.trim();
    if (responses == null) return "";
    return String(responses).trim();
  }
  return responses && typeof responses === "object" ? responses : {};
}

function isScorableReactBlock(block: ActivityBlockDocument): boolean {
  const type = normaliseBlockType(block.type);
  return type === "single-choice" || type === "option-cards" || type === "classification";
}

function blockScorableTotal(block: ActivityBlockDocument): number {
  const type = normaliseBlockType(block.type);
  if (type === "single-choice" || type === "option-cards") return 1;
  if (type === "classification") return ((block.content && block.content.items) || []).length;
  return 0;
}

function weekScorableTotal(content: ContentPackage, weekId: string): number {
  const model = weekPageFromPackage(content, weekId);
  if (!model) return 0;
  let total = 0;
  for (const session of model.sessions) {
    for (const item of session.activities) {
      const activity = content.activities?.find((entry) => entry.id === item.id) as ActivityDocument | undefined;
      for (const block of activity?.blocks || []) {
        total += blockScorableTotal(block as ActivityBlockDocument);
      }
    }
  }
  return total;
}

function sumScores(scores: Record<string, ActivityScore>): ActivityScore {
  return Object.values(scores).reduce(
    (total, score) => ({
      correct: total.correct + score.correct,
      total: total.total + score.total
    }),
    { correct: 0, total: 0 }
  );
}

function draftResponsesFor(activity: ActivityDocument): Record<string, unknown> {
  const engine = getContentEngine();
  if (!engine.createDraftStore) return {};
  try {
    const draft = engine.createDraftStore(activity).load();
    return draft?.responses && typeof draft.responses === "object" ? draft.responses : {};
  } catch {
    return {};
  }
}

function adjacentWeekLink(
  root: string,
  teachingWeek: number,
  livePackage: ReturnType<typeof liveContentPackage>
) {
  const record = runtimeWeekForTeachingWeek(livePackage, teachingWeek);
  if (!record?.available) return null;
  return {
    label: `Week ${teachingWeek}`,
    href: createSitePath(root, `week-${teachingWeek}/`)
  };
}

export function weekPageOpenable(
  weekId: string,
  livePackage: ReturnType<typeof liveContentPackage>
): boolean {
  return runtimeWeekForId(livePackage, weekId)?.available === true;
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
  const dismissedRef = useRef(false);
  const scoresRef = useRef<Record<string, ActivityScore>>({});
  const [practiceScore, setPracticeScore] = useState<ActivityScore>({ correct: 0, total: 0 });
  const [completionOpen, setCompletionOpen] = useState(false);
  const livePackage = liveContentPackage();
  const content = activeContentPackage(pkg);
  const runtimeWeek = useMemo(
    () => runtimeWeekForId(livePackage, weekId),
    [livePackage, weekId]
  );
  const guardWeek = runtimeWeek || {
    id: weekId,
    teachingWeek: Number(weekId.replace("week-", "")) || 0,
    status: "",
    available: false,
    title: weekId
  };
  const model = useMemo(
    () => (content ? weekPageFromPackage(content, weekId) : null),
    [content, weekId]
  );
  const scorableTotal = useMemo(
    () => (content ? weekScorableTotal(content, weekId) : 0),
    [content, weekId]
  );

  useEffect(() => {
    scoresRef.current = {};
    dismissedRef.current = false;
    setPracticeScore({ correct: 0, total: 0 });
    setCompletionOpen(false);
  }, [weekId]);

  const recordPracticeResult = useCallback((result: ActivityResult, block: ActivityBlockDocument) => {
    if (!result.completed || !result.score || result.score.total <= 0) return;
    if (!isScorableReactBlock(block)) return;

    scoresRef.current = {
      ...scoresRef.current,
      [questionIdFor(block)]: result.score
    };
    const aggregate = sumScores(scoresRef.current);
    setPracticeScore(aggregate);

    const meaningful = result.score.total >= 2 || Object.keys(scoresRef.current).length >= 2;
    if (meaningful && aggregate.total > 0 && !dismissedRef.current) {
      setCompletionOpen(true);
    }
  }, []);

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
              initialResponses={draftResponsesFor(activity)}
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
                recordPracticeResult(result, block);
              }}
            />
          )
        };
      })
    }));
  }, [content, model, recordPracticeResult]);

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
  const weekBadge = `Week ${weekNumber}: ${model.week.title}`;
  const previousWeek = adjacentWeekLink(root, weekNumber - 1, livePackage);
  const nextWeek = adjacentWeekLink(root, weekNumber + 1, livePackage);
  const summaryScore = {
    correct: practiceScore.correct,
    total: Math.max(scorableTotal, practiceScore.total, 1)
  };
  const coverage = summaryScore.total > 0 ? practiceScore.total / summaryScore.total : 0;
  const practiceComplete = scorableTotal > 0 && practiceScore.total >= scorableTotal;

  function closeCompletion() {
    dismissedRef.current = true;
    setCompletionOpen(false);
  }

  return (
    <WeekAccessGuard week={guardWeek}>
      <div data-lp-mount="" data-lp-week-page="" ref={mountRef}>
        <WeekView
          week={{
            id: model.week.id,
            teachingWeek: weekNumber,
            title: model.week.title,
            subtitle: model.week.subtitle,
            status: guardWeek.status || model.week.status
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
              { label: "Week", value: weekBadge }
            ]
          }}
          features={{
            showTitle: false,
            showAssignmentContext: true,
            showProjectContext: false,
            showExamContext: false
          }}
          previousWeek={previousWeek}
          nextWeek={nextWeek}
          sessions={sessions}
        />
        <PracticeProgressPanel
          title="Practice progress"
          badge={weekBadge}
          score={summaryScore}
          progress={coverage}
          completed={practiceComplete}
          message="Check scored activities to update. Formative practice only."
          defaultCollapsed
        />
        <CompletionModal
          open={completionOpen && practiceScore.total > 0}
          title="Practice complete"
          badge={weekBadge}
          score={summaryScore}
          progress={coverage}
          message="Keep practising. This score is formative feedback for this week, not Gateway assignment evidence."
          onClose={closeCompletion}
          onNext={closeCompletion}
          nextLabel="Continue"
        />
      </div>
    </WeekAccessGuard>
  );
}

/** Exported for focused tests — mirrors the WeekPage draft payload mapping. */
export { persistableResponse };
