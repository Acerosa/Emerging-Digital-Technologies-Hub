const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(
  root,
  "content/l2e-exploring-emerging-digital-technologies/package.json"
), "utf8"));

function fillLikeBlocks() {
  const found = [];
  for (const activity of pkg.activities || []) {
    for (const block of activity.blocks || []) {
      const type = String(block.type || "").toLowerCase();
      if (type === "fill-gap" || type === "phrase-completion") {
        found.push({
          activityId: activity.id,
          version: activity.version,
          blockId: block.id,
          type,
          questionId: block.content && block.content.questionId,
          gapCount: Array.isArray(block.content && block.content.gaps) ? block.content.gaps.length : 0
        });
      }
    }
  }
  return found;
}

test("L2E packaged activities have no fill-gap or phrase-completion blocks", () => {
  assert.deepEqual(fillLikeBlocks(), []);
});

test("Core 0.2.26 fill-gap questionId:gapId cannot collide with existing L2E response keys", () => {
  const keys = new Set();
  for (const activity of pkg.activities || []) {
    for (const block of activity.blocks || []) {
      const type = String(block.type || "").toLowerCase();
      const questionId = String((block.content && block.content.questionId) || block.id || "").trim();
      if (questionId) keys.add(questionId);
      if (type === "classification") {
        for (const item of (block.content && block.content.items) || []) {
          if (item && item.id) keys.add(`${questionId}:${item.id}`);
        }
      }
    }
  }
  assert.ok(keys.size > 0);
  for (const key of keys) {
    assert.doesNotMatch(key, /:gap$/i);
    assert.equal(key.includes(":gap-"), false);
  }
});

test("completed-attempt restore rebuilds L2E classification nested mappings", async () => {
  const {
    reconstructCompletedAttemptState,
    pickLatestCompletedAttempt
  } = await import("@learning-platform/core/advanced");
  const attempt = {
    attempt_id: "l2e-attempt-1",
    activity_key: "week-1-digital-technology",
    activity_version: "0.1.0",
    status: "completed",
    received_at: "2026-09-20T10:00:00.000Z"
  };
  const state = reconstructCompletedAttemptState(attempt, [
    {
      attempt_id: "l2e-attempt-1",
      question_key: "week-1-digital-match:d-iot",
      response_payload: { categoryId: "iot", itemId: "d-iot" }
    },
    {
      attempt_id: "l2e-attempt-1",
      question_key: "week-1-digital-match:d-ai",
      response_payload: { categoryId: "ai", itemId: "d-ai" }
    }
  ]);
  assert.equal(pickLatestCompletedAttempt([attempt], "week-1-digital-technology", "0.1.0").attempt_id, "l2e-attempt-1");
  assert.equal(state.responses["week-1-digital-match"]["d-iot"], "iot");
  assert.equal(state.responses["week-1-digital-match"]["d-ai"], "ai");
  assert.equal(state.checked["week-1-digital-match"], true);
  assert.equal(state.restoreSource, "completed-attempt");
});

test("Core fill-gap evidence identity is unused by L2E Check because no fill-gap blocks exist", async () => {
  const { createFormativeMarkingService } = await import("@learning-platform/core/advanced");
  const calls = [];
  const marking = createFormativeMarkingService({
    auth: { isSignedIn: () => true },
    api: {
      markFormativeResponse: async (payload) => {
        calls.push(payload);
        return (payload.p_responses || []).map((item) => ({
          question_id: item.question_id,
          awarded_score: 1,
          max_score: 1,
          is_correct: true,
          requires_review: false,
          marking_source: "server"
        }));
      }
    }
  });
  const welcome = (pkg.activities || []).find((item) => item.id === "week-1-welcome");
  const block = (welcome.blocks || []).find((item) => item.type === "single-choice");
  await marking.markBlock({
    activityKey: welcome.id,
    activityVersion: welcome.version || "0.1.0",
    block,
    responses: { optionId: "quantum" }
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].p_responses[0].question_id.includes(":"), false);
  assert.deepEqual(fillLikeBlocks(), []);
});
