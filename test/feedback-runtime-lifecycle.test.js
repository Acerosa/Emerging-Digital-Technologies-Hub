const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

test("L2E hub lifecycle matches T Level: load curriculum, apply, then initialise", function () {
  const hook = read("src/hooks/useHubPlatform.ts");
  const app = read("src/App.tsx");
  const platform = read("src/platform.ts");

  assert.match(hook, /loadL2eCurriculum\(platform\)/);
  assert.match(hook, /await platform\.initialise\(\)/);
  assert.match(hook, /setCurriculum\(/);
  assert.match(hook, /adaptersReady/);
  assert.ok(
    hook.indexOf("await platform.initialise()") > hook.indexOf("loadL2eCurriculum(platform)"),
    "initialise must run after curriculum load"
  );
  assert.doesNotMatch(hook, /void platform\.initialise\(\)/);

  assert.doesNotMatch(app, /ContentPackageProvider/);
  assert.doesNotMatch(app, /useLoadedContent|useContentPackage/);
  assert.match(app, /curriculum\.package/);
  assert.match(app, /adaptersReady/);

  assert.match(platform, /validateLearnerSafePackage/);
  assert.match(platform, /validatePackage:\s*validateLearnerSafePackage/);
});
