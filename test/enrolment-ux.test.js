const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

test("L2E gates marking until enrolment and exposes join-class UX", () => {
  const app = read("src/App.tsx");
  const enrolment = read("src/enrolment.ts");
  const account = read("src/pages/StaticPages.tsx");
  const hook = read("src/hooks/useHubPlatform.ts");

  assert.match(enrolment, /JOIN_CLASS_REQUIRED/);
  assert.match(enrolment, /withEnrolmentGuardedMarking/);
  assert.match(enrolment, /l2e-year-1-delivery/);
  assert.match(app, /withEnrolmentGuardedMarking/);
  assert.match(app, /JoinClassPanel/);
  assert.match(app, /needsJoinClass/);
  assert.match(account, /data-account-group-status/);
  assert.match(account, /JoinClassPanel/);
  assert.match(hook, /showOnboarding/);
  assert.match(hook, /no-enrolment/);
});
