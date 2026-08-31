const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const dist = path.resolve(__dirname, "../../dist");
const routes = [
  "index.html",
  "week-1/index.html",
  "week-2/index.html",
  "week-3/index.html",
  "course-guide/index.html",
  "resources/index.html",
  "help/index.html",
  "account/index.html"
];

test("the Vite production build is a static GitHub Pages site", function () {
  assert.equal(fs.existsSync(path.join(dist, ".nojekyll")), true);
  routes.forEach(function (file) {
    assert.equal(fs.existsSync(path.join(dist, file)), true, file);
  });
  const home = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  assert.match(home, /type="module"/);
  assert.doesNotMatch(home, /express|next\/server|Server Actions/i);
  const assets = path.join(dist, "assets");
  const files = fs.readdirSync(assets).filter(function (name) { return name.endsWith(".js"); });
  assert.ok(files.length >= 1);
  const authoring = fs.readFileSync(path.resolve(__dirname, "../../content/l2e-exploring-emerging-digital-technologies/package.json"), "utf8");
  const bundled = fs.readFileSync(path.join(dist, "content/l2e-exploring-emerging-digital-technologies/package.json"), "utf8");
  assert.match(authoring, /"correctOptionId"/);
  assert.doesNotMatch(bundled, /"correctOptionId"\s*:/);
  files.forEach(function (name) {
    assert.doesNotMatch(fs.readFileSync(path.join(assets, name), "utf8"), /"correctOptionId"\s*:/);
  });
});
