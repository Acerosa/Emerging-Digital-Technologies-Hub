const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

test("L2E hub lifecycle matches Unit 3: initialise in parallel with curriculum load", function () {
  const hook = read("src/hooks/useHubPlatform.ts");
  const app = read("src/App.tsx");
  const platform = read("src/platform.ts");

  assert.match(hook, /loadL2eCurriculum\(platform\)/);
  assert.match(hook, /const ready = platform\.initialise\(\)/);
  assert.match(hook, /await ready/);
  assert.match(hook, /setCurriculum\(/);
  assert.match(hook, /adaptersReady/);
  assert.match(read("src/platform.ts"), /L2E_PLATFORM_STARTUP/);
  assert.match(read("src/platform.ts"), /createAuthGatedFetch/);
  assert.match(read("src/platform.ts"), /recoverLearnerAfterAuthRestore/);
  // Auth/learner resolve must start before awaiting curriculum (Unit 3 parity).
  assert.ok(
    hook.indexOf("const ready = platform.initialise()") < hook.indexOf("loadL2eCurriculum(platform)"),
    "initialise must start before curriculum load awaits"
  );
  assert.doesNotMatch(hook, /void platform\.initialise\(\)/);

  assert.doesNotMatch(app, /ContentPackageProvider/);
  assert.doesNotMatch(app, /useLoadedContent|useContentPackage/);
  assert.match(app, /curriculum\.package/);
  assert.match(app, /adaptersReady/);
  assert.match(app, /shouldOpenCoreOnboarding/);
  assert.match(app, /openJoinClass/);

  assert.match(platform, /validateLearnerSafePackage/);
  assert.match(platform, /validatePackage:\s*validateLearnerSafePackage/);
});
