const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const requireFromHub = createRequire(path.join(root, "package.json"));

function resolveCoreRuntimeDist(coreRoot) {
  return path.join(coreRoot, "dist", "curriculum-runtime.esm.js");
}

test("reviewed Core ships curriculum-runtime before hub install", () => {
  const corePackagePath = requireFromHub.resolve("@learning-platform/core/package.json");
  const coreRoot = path.dirname(corePackagePath);
  const runtimeDist = resolveCoreRuntimeDist(coreRoot);

  assert.equal(
    fs.existsSync(runtimeDist),
    true,
    `missing ${runtimeDist}; build or check out reviewed Core before hub npm ci`
  );
});

test("linked UI installs Core where Vitest resolves external imports", () => {
  const uiPackagePath = requireFromHub.resolve("@learning-platform/ui/package.json");
  const uiRoot = path.dirname(uiPackagePath);
  const uiCoreLink = path.join(uiRoot, "node_modules", "@learning-platform", "core");

  assert.equal(
    fs.existsSync(uiCoreLink),
    true,
    "run npm ci in learning-platform-ui before hub tests so @learning-platform/core resolves from ../learning-platform-ui/dist/index.js"
  );

  const runtimeDist = resolveCoreRuntimeDist(uiCoreLink);
  assert.equal(
    fs.existsSync(runtimeDist),
    true,
    `missing ${runtimeDist} in UI node_modules`
  );
});

test("shared package exports resolve for L2E week visibility", async () => {
  const core = await import("@learning-platform/core/curriculum-runtime");

  assert.equal(typeof core.isWeekAvailable, "function");
  assert.equal(typeof core.overlayLiveWeekMetadata, "function");
  assert.equal(typeof core.weeksFromPublication, "function");

  const uiPackagePath = requireFromHub.resolve("@learning-platform/ui/package.json");
  const uiPackage = JSON.parse(fs.readFileSync(uiPackagePath, "utf8"));
  const uiTypesPath = path.join(path.dirname(uiPackagePath), "dist", "index.d.ts");
  const uiTypes = fs.readFileSync(uiTypesPath, "utf8");

  assert.match(uiPackage.version, /^0\.1\.(6|[7-9]|\d{2,})/);
  assert.match(uiTypes, /export \{ WeekAccessLink \}/);
  assert.match(uiTypes, /export \{ WeekAccessGuard \}/);
});

test("GitHub Actions installs UI peer dependencies before hub tests", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/pages.yml"), "utf8");
  assert.match(workflow, /test -f learning-platform-core\/dist\/curriculum-runtime\.esm\.js/);
  assert.match(workflow, /working-directory: learning-platform-ui/);
  assert.match(workflow, /npm ci/);
});
