const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
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

test("all GitHub Pages scaffold routes exist", function () {
  routes.forEach(function (route) {
    assert.equal(fs.existsSync(path.join(root, route)), true, "missing route " + route);
  });
});

test("routes are Vite HTML shells with relative module entries", function () {
  routes.forEach(function (route) {
    const html = fs.readFileSync(path.join(root, route), "utf8");
    assert.match(html, /lang="en-GB"/);
    assert.match(html, /id="root"/);
    assert.match(html, /type="module"/);
    assert.match(html, /src=".*src\/main\.tsx"/);
    assert.match(html, /data-root=/);
    assert.doesNotMatch(html, /#\//);
  });
});
