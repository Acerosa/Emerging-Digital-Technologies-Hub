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
  assert.doesNotMatch(read("src/App.tsx"), /ContentPackageProvider/);
  assert.doesNotMatch(read("src/App.tsx"), /useLoadedContent/);
  assert.match(read("src/App.tsx"), /curriculum\.package/);
  assert.match(read("src/hooks/useHubPlatform.ts"), /loadL2eCurriculum\(platform\)/);
});

test("activity check-answer is wired to the Unit 14 submission adapter", function () {
  assert.match(read("src/content/engine.ts"), /publication\.js/);
  assert.match(read("src/content/engine.ts"), /submit\.js/);
  assert.match(read("content/engine/interactive.js"), /submitActivityDraft/);
  assert.match(read("content/engine/interactive.js"), /data-lp-bound/);
  assert.match(read("content/engine/interactive.js"), /minCharsFor/);
  assert.match(read("content/engine/interactive.js"), /Paste is disabled/);
  assert.match(read("content/engine/interactive.js"), /lp-sort-card/);
  assert.match(read("content/engine/interactive.js"), /data-lp-sort-board/);
  assert.match(read("css/hub.css"), /\.lp-sort-board/);
  assert.match(read("content/engine/submit.js"), /platform\.submission\.submit/);
  assert.match(read("content/engine/submit.js"), /still saved on this device/);
  assert.doesNotMatch(read("content/engine/submit.js"), /learnerId\s*:|enrolmentId\s*:|assignmentId\s*:|attemptNumber\s*:/);
  assert.match(read("content/engine/publication.js"), /published_curriculum_package/);
  assert.match(read("content/engine/state.js"), /migrateGuestDrafts/);
  assert.match(read("src/hooks/useHubPlatform.ts"), /migrateGuestDrafts/);
  assert.match(read("src/platform.ts"), /L2E_CURRICULUM_RPC_FAILED/);
  assert.match(read("src/platform.ts"), /new Headers\(init\?\.headers\)/);
  assert.match(read("src/curriculum/apply-runtime.ts"), /L2E_CURRICULUM_FALLBACK/);
});

test("platform hydrates published curriculum with learner-safe validation like T Level", function () {
  const platform = read("src/platform.ts");
  assert.match(platform, /validateLearnerSafePackage/);
  assert.match(platform, /validatePackage:\s*validateLearnerSafePackage/);
  assert.doesNotMatch(platform, /validatePackage,\s*$/m);
  assert.match(platform, /loadBundled/);
  assert.match(platform, /curriculumAwareFetch|published_curriculum_package/);
  assert.match(platform, /createSupabaseClient/);
  assert.match(platform, /hubCode:\s*APP_CONFIG\.hubId/);
});

test("hub platform uses Core hub-scoped Auth persistence", async function () {
  const source = read("src/platform.ts");
  assert.match(source, /createSupabaseClient/);
  assert.match(source, /hubCode:\s*APP_CONFIG\.hubId/);
  assert.doesNotMatch(source, /persistSession:\s*true/);
  const { createAuthStorageKey } = await import("@learning-platform/core/advanced");
  assert.equal(
    createAuthStorageKey("https://hubwpkrqndorznwzvaer.supabase.co", "l2e-exploring-emerging-digital-technologies"),
    "sb-hubwpkrqndorznwzvaer-auth-token--l2e-exploring-emerging-digital-technologies"
  );
  assert.equal(
    createAuthStorageKey("https://hubwpkrqndorznwzvaer.supabase.co", "tlevel-software-development"),
    "sb-hubwpkrqndorznwzvaer-auth-token--tlevel-software-development"
  );
});
