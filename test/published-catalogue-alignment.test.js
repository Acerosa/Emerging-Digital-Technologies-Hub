const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const requireEsm = createRequire(__filename);

test("learner package produces a coherent marking-spec manifest", async function () {
  const { checkCatalogueAlignment } = await import(
    path.join(root, "scripts/check-catalogue-alignment.mjs")
  );
  const pkg = requireEsm(
    path.join(root, "content/l2e-exploring-emerging-digital-technologies/package.json")
  );
  const result = checkCatalogueAlignment(pkg);
  assert.equal(result.ok, true, result.issues.join("\n"));
  assert.ok(result.activityCount >= 39, `expected >=39 activities, got ${result.activityCount}`);
  assert.ok(result.markingQuestionCount > 50, "expected marking keys for interactive weeks");
});

test("expanded Weeks 2–3 activity ids are present with expected versions", async function () {
  const pkg = requireEsm(
    path.join(root, "content/l2e-exploring-emerging-digital-technologies/package.json")
  );
  const byId = new Map(pkg.activities.map((a) => [a.id, a]));

  assert.equal(byId.get("week-2-starter")?.version, "0.1.0");
  assert.equal(byId.get("week-2-iot-sectors")?.version, "0.1.0");
  assert.equal(byId.get("week-2-reflection")?.version, "0.1.1");
  assert.equal(byId.get("week-3-local-vs-cloud")?.version, "0.1.0");
  assert.equal(byId.get("week-3-models-match")?.version, "0.1.0");
  assert.equal(byId.get("week-3-starter")?.version, "0.1.0");
});

test("stale catalogue activity ids are not used by the learner package", function () {
  const pkg = requireEsm(
    path.join(root, "content/l2e-exploring-emerging-digital-technologies/package.json")
  );
  const ids = new Set(pkg.activities.map((a) => a.id));
  for (const stale of [
    "week-2-classify",
    "week-2-outline",
    "week-2-retrieval",
    "week-3-classify",
    "week-3-outline",
    "week-3-retrieval"
  ]) {
    assert.equal(ids.has(stale), false, `stale id still present: ${stale}`);
  }
});

test("classification items produce authoritative qid:item question keys", async function () {
  const { checkCatalogueAlignment } = await import(
    path.join(root, "scripts/check-catalogue-alignment.mjs")
  );
  const pkg = requireEsm(
    path.join(root, "content/l2e-exploring-emerging-digital-technologies/package.json")
  );
  const { rows } = checkCatalogueAlignment(pkg);
  const keys = new Set(rows.map((r) => r.questionId));

  assert.ok(keys.has("week-1-digital-match:d-iot"));
  assert.ok(keys.has("week-2-iot-sectors-q:s1"));
  assert.ok(keys.has("week-3-local-q:l1"));
  assert.ok(keys.has("week-3-models-q:m1"));
  assert.ok(keys.has("week-2-starter-q1"));
  assert.ok(keys.has("week-3-starter-q1"));
});

test("single-choice question ids remain unique within each activity version", async function () {
  const { checkCatalogueAlignment } = await import(
    path.join(root, "scripts/check-catalogue-alignment.mjs")
  );
  const pkg = requireEsm(
    path.join(root, "content/l2e-exploring-emerging-digital-technologies/package.json")
  );
  const { rows, issues } = checkCatalogueAlignment(pkg);
  assert.equal(issues.length, 0);
  const single = rows.filter((r) => r.blockType === "single-choice");
  assert.ok(single.some((r) => r.activityId === "week-2-starter"));
  assert.ok(single.some((r) => r.activityId === "week-3-starter"));
});
