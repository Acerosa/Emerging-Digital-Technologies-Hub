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
  assert.match(read("src/App.tsx"), /ContentPackageProvider/);
  assert.match(read("src/App.tsx"), /useLoadedContent/);
  assert.match(read("src/hooks/useContentPackage.ts"), /loadL2eCurriculum|loadLatest/);
});

test("activity check-answer is wired to the Unit 14 submission adapter", function () {
  assert.match(read("src/content/engine.ts"), /publication\.js/);
  assert.match(read("src/content/engine.ts"), /submit\.js/);
  assert.match(read("content/engine/interactive.js"), /submitActivityDraft/);
  assert.match(read("content/engine/submit.js"), /platform\.submission\.submit/);
  assert.doesNotMatch(read("content/engine/submit.js"), /learnerId\s*:|enrolmentId\s*:|assignmentId\s*:|attemptNumber\s*:/);
  assert.match(read("content/engine/publication.js"), /published_curriculum_package/);
});
