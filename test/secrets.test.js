const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const banned = /service_role|SUPABASE_SERVICE|DATABASE_PASSWORD|BEGIN RSA PRIVATE KEY/i;

function walk(directory, acc) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach(function (entry) {
    if (entry.name === "node_modules" || entry.name === "dist") return;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  });
  return acc;
}

test("the hub does not embed privileged secrets", function () {
  walk(root, []).forEach(function (file) {
    if (path.basename(file) === "secrets.test.js") return;
    if (!/\.(ts|tsx|js|json|md|yml|html|env)$/i.test(file)) return;
    const text = fs.readFileSync(file, "utf8");
    assert.equal(banned.test(text), false, "privileged secret pattern in " + path.relative(root, file));
  });
});
