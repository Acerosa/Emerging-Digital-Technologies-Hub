const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

test("learner pages render from the loaded curriculum package, not a static import", function () {
  assert.doesNotMatch(read("src/pages/WeekPage.tsx"), /package\.json/);
  assert.doesNotMatch(read("src/pages/HomePage.tsx"), /package\.json/);
  assert.doesNotMatch(read("src/pages/CourseGuidePage.tsx"), /package\.json/);
  assert.doesNotMatch(read("src/page-copy.ts"), /package\.json/);
  assert.match(read("src/pages/WeekPage.tsx"), /activeContentPackage/);
  assert.match(read("src/pages/WeekPage.tsx"), /useLayoutEffect/);
  assert.match(read("src/pages/WeekPage.tsx"), /Re-bind after every commit/);
  assert.match(read("src/main.tsx"), /createRoot\(root\)\.render\(<App/);
  assert.doesNotMatch(read("src/main.tsx"), /StrictMode/);
  assert.doesNotMatch(read("src/pages/WeekPage.tsx"), /\[engine, content, model\]/);
  assert.match(read("src/App.tsx"), /ContentPackageProvider/);
  assert.match(read("src/App.tsx"), /useLoadedContent/);
  assert.match(read("src/hooks/useContentPackage.ts"), /loadL2eCurriculum|loadLatest/);
});

test("activity check-answer is wired to the Unit 14 submission adapter", function () {
  assert.match(read("src/content/engine.ts"), /publication\.js/);
  assert.match(read("src/content/engine.ts"), /submit\.js/);
  assert.match(read("content/engine/interactive.js"), /submitActivityDraft/);
  assert.match(read("content/engine/interactive.js"), /data-lp-bound/);
  assert.match(read("content/engine/submit.js"), /platform\.submission\.submit/);
  assert.match(read("content/engine/submit.js"), /still saved on this device/);
  assert.doesNotMatch(read("content/engine/submit.js"), /learnerId\s*:|enrolmentId\s*:|assignmentId\s*:|attemptNumber\s*:/);
  assert.match(read("content/engine/publication.js"), /published_curriculum_package/);
  assert.match(read("content/engine/state.js"), /migrateGuestDrafts/);
  assert.match(read("src/hooks/useHubPlatform.ts"), /migrateGuestDrafts/);
  assert.match(read("src/platform.ts"), /L2E_CURRICULUM_RPC_FAILED/);
  assert.match(read("src/curriculum/apply-runtime.ts"), /L2E_CURRICULUM_FALLBACK/);
});
