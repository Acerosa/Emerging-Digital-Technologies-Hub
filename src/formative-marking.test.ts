import { createFormativeMarkingService } from "@learning-platform/core/advanced";
import { createMarkResponseHandler, SERVER_CHECK_FAILED_MESSAGE } from "@learning-platform/ui";
import { afterEach, describe, expect, it, vi } from "vitest";
import pkg from "../content/l2e-exploring-emerging-digital-technologies/package.json";
import type { ContentPackage } from "./curriculum/from-package";
const content = pkg as ContentPackage;

function activity(id: string) {
  const found = content.activities?.find((entry) => entry.id === id);
  if (!found) throw new Error(`missing activity ${id}`);
  return found;
}

function classificationBlock(activityId: string, blockId: string) {
  const block = activity(activityId).blocks?.find((entry) => entry.id === blockId);
  if (!block) throw new Error(`missing block ${blockId}`);
  return block;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("L2E formative marking integration", () => {
  it("sends the hosted classification mapping for week-1-digital-match", async () => {
    const calls: unknown[] = [];
    const marking = createFormativeMarkingService({
      auth: { isSignedIn: () => true },
      api: {
        markFormativeResponse: async (payload: unknown) => {
          calls.push(payload);
          const responses = (payload as { p_responses: Array<{ question_id: string }> }).p_responses;
          return responses.map((item) => ({
            question_id: item.question_id,
            awarded_score: 1,
            max_score: 1,
            is_correct: true,
            requires_review: false,
            marking_source: "server",
            can_retry: true,
            check_number: 1
          }));
        }
      }
    });

    const block = classificationBlock("week-1-digital-technology", "week-1-digital-match");
    const result = await marking.markBlock({
      activityKey: "week-1-digital-technology",
      activityVersion: "0.1.0",
      block,
      responses: {
        "d-iot": "iot",
        "d-ai": "ai",
        "d-cloud": "cloud",
        "d-mobile": "mobile"
      },
      sourcePage: "/Emerging-Digital-Technologies-Hub/week-1/"
    });

    expect(calls).toHaveLength(1);
    const payload = calls[0] as {
      p_activity_key: string;
      p_activity_version: string;
      p_responses: Array<{ question_id: string; response_type: string; response_payload: Record<string, string> }>;
    };
    expect(payload.p_activity_key).toBe("week-1-digital-technology");
    expect(payload.p_activity_version).toBe("0.1.0");
    expect(payload.p_responses).toEqual([
      {
        question_id: "week-1-digital-match:d-iot",
        response_type: "classification",
        response_payload: { categoryId: "iot", itemId: "d-iot" }
      },
      {
        question_id: "week-1-digital-match:d-ai",
        response_type: "classification",
        response_payload: { categoryId: "ai", itemId: "d-ai" }
      },
      {
        question_id: "week-1-digital-match:d-cloud",
        response_type: "classification",
        response_payload: { categoryId: "cloud", itemId: "d-cloud" }
      },
      {
        question_id: "week-1-digital-match:d-mobile",
        response_type: "classification",
        response_payload: { categoryId: "mobile", itemId: "d-mobile" }
      }
    ]);
    expect(JSON.stringify(payload)).not.toMatch(/correctCategoryId/);
    expect(result.correct).toBe(true);
    expect(result.status).toBe("correct");
  });

  it("maps an incorrect classification mark without inventing local correctness", async () => {
    const marking = createFormativeMarkingService({
      auth: { isSignedIn: () => true },
      api: {
        markFormativeResponse: async (payload: unknown) => {
          const responses = (payload as { p_responses: Array<{ question_id: string }> }).p_responses;
          return responses.map((item) => ({
            question_id: item.question_id,
            awarded_score: 0,
            max_score: 1,
            is_correct: false,
            requires_review: false,
            marking_source: "server",
            can_retry: true,
            check_number: 1
          }));
        }
      }
    });

    const block = classificationBlock("week-1-digital-technology", "week-1-digital-match");
    const result = await marking.markBlock({
      activityKey: "week-1-digital-technology",
      activityVersion: "0.1.0",
      block,
      responses: {
        "d-iot": "ai",
        "d-ai": "iot",
        "d-cloud": "mobile",
        "d-mobile": "cloud"
      }
    });

    expect(result.correct).toBe(false);
    expect(result.status).toBe("incorrect");
    expect(result.score).toEqual({ correct: 0, total: 4 });
  });

  it("wires InteractiveActivity mark handlers through platform.marking.markBlock", async () => {
    const markBlock = vi.fn(async () => ({
      completed: true,
      correct: true,
      status: "correct" as const,
      requiresReview: false
    }));
    const platform = { marking: { markBlock } };
    const doc = activity("week-1-digital-technology");
    const handler = createMarkResponseHandler(platform, doc as never);
    expect(handler).toBeTypeOf("function");

    await handler?.({
      activityId: doc.id,
      activityVersion: "0.1.0",
      block: classificationBlock("week-1-digital-technology", "week-1-digital-match") as never,
      responses: { "d-iot": "iot", "d-ai": "ai", "d-cloud": "cloud", "d-mobile": "mobile" }
    });

    expect(markBlock).toHaveBeenCalledTimes(1);
    const firstCall = markBlock.mock.calls[0] as unknown as [Record<string, unknown>];
    const arg = firstCall[0] as {
      activityKey: string;
      activityVersion: string;
      responses: Record<string, string>;
      block: { content?: Record<string, unknown> };
    };
    expect(arg.activityKey).toBe("week-1-digital-technology");
    expect(arg.activityVersion).toBe("0.1.0");
    expect(arg.responses).toEqual({
      "d-iot": "iot",
      "d-ai": "ai",
      "d-cloud": "cloud",
      "d-mobile": "mobile"
    });
    expect(JSON.stringify(arg.block)).not.toMatch(/correctCategoryId/);
  });

  it("fails closed when platform marking is unavailable", async () => {
    const handler = createMarkResponseHandler({}, activity("week-1-welcome") as never);
    await expect(handler?.({
      activityId: "week-1-welcome",
      activityVersion: "0.1.0",
      block: activity("week-1-welcome").blocks?.[0] as never,
      responses: { optionId: "a" }
    })).rejects.toMatchObject({
      learnerMessage: SERVER_CHECK_FAILED_MESSAGE
    });
  });

  it("sends single-choice optionId with the authored activity version", async () => {
    const calls: unknown[] = [];
    const marking = createFormativeMarkingService({
      auth: { isSignedIn: () => true },
      api: {
        markFormativeResponse: async (payload: unknown) => {
          calls.push(payload);
          return [{
            question_id: "week-1-welcome-q1",
            awarded_score: 1,
            max_score: 1,
            is_correct: true,
            requires_review: false,
            marking_source: "server"
          }];
        }
      }
    });

    const welcome = activity("week-1-welcome");
    const block = welcome.blocks?.find((entry) => entry.type === "single-choice");
    const result = await marking.markBlock({
      activityKey: welcome.id,
      activityVersion: welcome.version || "0.1.0",
      block,
      responses: { optionId: "quantum" }
    });

    expect((calls[0] as { p_activity_version: string }).p_activity_version).toBe("0.1.0");
    expect((calls[0] as { p_responses: unknown[] }).p_responses).toEqual([{
      question_id: "week-1-welcome-q1",
      response_type: "single-choice",
      response_payload: { optionId: "quantum" }
    }]);
    expect(result.correct).toBe(true);
  });
});
