const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

test("L2E JoinClass uses open_explicit class registration key gate", () => {
  const join = read("src/components/JoinClassPanel.tsx");
  const enrolment = read("src/enrolment.ts");
  const app = read("src/App.tsx");
  const accountPage = read("src/pages/AccountPage.tsx");
  const hook = read("src/hooks/useHubPlatform.ts");

  // JoinClassPanel must not expose a year/group picker.
  assert.doesNotMatch(join, /getRegistrationOptions/);
  assert.doesNotMatch(join, /<select/);
  assert.doesNotMatch(join, /Choose a year and group/);
  // JoinClassPanel is the class-key gate: it MUST show a registration key input and call joinClass.
  assert.match(join, /registrationKey/);
  assert.match(join, /joinClass/);
  assert.match(join, /shouldCompleteProfileBeforeJoin/);
  assert.doesNotMatch(enrolment, /l2e-year-1-delivery/);
  assert.match(enrolment, /JOIN_CLASS_REQUIRED/);
  assert.match(enrolment, /withEnrolmentGuardedMarking/);
  assert.match(enrolment, /L2E-DELIVERY-A/);
  assert.match(enrolment, /EXPECTED_REGISTRATION_KEY/);
  assert.match(enrolment, /nhc-et-26/);
  assert.match(app, /withEnrolmentGuardedMarking/);
  assert.match(app, /JoinClassPanel/);
  assert.match(app, /needsJoinClass/);
  assert.match(app, /switchHubAccount|handleSwitchAccount/);
  assert.match(accountPage, /data-account-group-status/);
  assert.match(accountPage, /JoinClassPanel/);
  assert.match(accountPage, /refreshHubSession/);
  assert.match(app, /platform\.auth\.signOut/);
  assert.match(hook, /createAccountDialog/);
});

test("CI and runtime pin reviewed Core v0.2.17", () => {
  const workflow = read(".github/workflows/pages.yml");
  assert.match(workflow, /learning-platform-core[\s\S]*ref: v0\.2\.17/);
  assert.match(read("src/config.ts"), /coreVersion: "0\.2\.17"/);
  assert.match(read("src/platform.ts"), /createSupabaseClient/);
  assert.match(read("src/platform.ts"), /hubCode:\s*APP_CONFIG\.hubId/);
});
