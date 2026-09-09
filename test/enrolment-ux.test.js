const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

test("L2E has no learner-controlled group or year picker", () => {
  const join = read("src/components/JoinClassPanel.tsx");
  const enrolment = read("src/enrolment.ts");
  const app = read("src/App.tsx");
  const account = read("src/pages/StaticPages.tsx");
  const hook = read("src/hooks/useHubPlatform.ts");

  assert.doesNotMatch(join, /getRegistrationOptions/);
  assert.doesNotMatch(join, /registrationKey/);
  assert.doesNotMatch(join, /<select/);
  assert.doesNotMatch(join, /Choose a year and group/);
  assert.doesNotMatch(join, /onboarding\.complete/);
  assert.doesNotMatch(join, /joinClass/);
  assert.doesNotMatch(enrolment, /l2e-year-1-delivery/);
  assert.doesNotMatch(enrolment, /optionLabel/);
  assert.match(enrolment, /JOIN_CLASS_REQUIRED/);
  assert.match(enrolment, /withEnrolmentGuardedMarking/);
  assert.match(enrolment, /L2E-DELIVERY-A/);
  assert.match(app, /withEnrolmentGuardedMarking/);
  assert.match(app, /JoinClassPanel/);
  assert.match(app, /needsJoinClass/);
  assert.match(account, /data-account-group-status/);
  assert.match(account, /JoinClassPanel/);
  assert.match(app, /platform\.auth\.signOut/);
  assert.match(hook, /showOnboarding/);
  assert.match(hook, /no-enrolment/);
});

test("CI and runtime pin reviewed Core v0.2.14", () => {
  const workflow = read(".github/workflows/pages.yml");
  assert.match(workflow, /learning-platform-core[\s\S]*ref: v0\.2\.14/);
  assert.match(read("src/config.ts"), /coreVersion: "0\.2\.14"/);
  assert.match(read("src/platform.ts"), /createSupabaseClient/);
  assert.match(read("src/platform.ts"), /hubCode:\s*APP_CONFIG\.hubId/);
});
