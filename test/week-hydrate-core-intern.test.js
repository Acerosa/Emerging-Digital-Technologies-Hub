const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function memoryStorage() {
  const data = {};
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; }
  };
}

function loadEngine() {
  const context = { console, Date, JSON, Object, Promise };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(read("content/engine/version.js"), context);
  vm.runInContext(read("content/engine/state.js"), context);
  return context.LearningPlatformContent;
}

function coreInternPlatform() {
  const completed = new Set();
  const inflight = new Map();
  const reads = [];
  const platform = {
    auth: {
      isSignedIn() { return true; },
      getSession() { return { user: { id: "learner-1" } }; }
    },
    progress: {
      createStore({ activityKey }) {
        return {
          hydrate() {
            if (completed.has(activityKey)) {
              return Promise.resolve({ responses: { q1: "saved-evidence" }, checked: { q1: true } });
            }
            if (inflight.has(activityKey)) return inflight.get(activityKey);
            reads.push(activityKey);
            const pending = Promise.resolve({
              responses: { q1: "saved-evidence" },
              checked: { q1: true }
            }).then((value) => {
              completed.add(activityKey);
              inflight.delete(activityKey);
              return value;
            });
            inflight.set(activityKey, pending);
            return pending;
          }
        };
      }
    }
  };
  return { platform, reads };
}

async function hydrateWeek(ns, platform, activities, storage) {
  await Promise.all(activities.map((activity) => (
    ns.createDraftStore(activity, { platform, storage }).hydrate()
  )));
}

test("production pin remains Core v0.2.22 which already interns get_activity_state", () => {
  assert.match(read(".github/workflows/pages.yml"), /ref: v0\.2\.22/);
  assert.match(read("src/config.ts"), /coreVersion: "0\.2\.22"/);
  assert.doesNotMatch(read("content/engine/state.js"), /completedHydrates|inflightHydrates|resetDraftHydrateDedupe/);
  assert.match(read("content/engine/state.js"), /current\.hydrate\(load\(\)\)/);
  assert.doesNotMatch(read("content/engine/state.js"), /hydrate\(\s*\{\s*fresh/);
  assert.doesNotMatch(read("content/engine/state.js") + read("content/engine/interactive.js"), /questionId:\$\{gapId\}|questionId:gapId/);
  const coreIntern = fs.readFileSync(path.join(
    root,
    "node_modules/@learning-platform/core/src/core/progress/activity-state.js"
  ), "utf8");
  assert.match(coreIntern, /const completedReads = new Set\(\)/);
  assert.match(coreIntern, /else if \(completedReads\.has\(dedupeKey\)\)/);
});

test("opening a week with N activities hydrates each activity once via Core intern", async () => {
  const ns = loadEngine();
  const { platform, reads } = coreInternPlatform();
  const storage = memoryStorage();
  const activities = Array.from({ length: 5 }, (_, index) => ({
    id: "week-1-activity-" + (index + 1),
    version: "1.0.0"
  }));
  await hydrateWeek(ns, platform, activities, storage);
  assert.equal(reads.length, 5);
});

test("rerenders and interactive rebind issue 0 additional get_activity_state calls", async () => {
  const ns = loadEngine();
  const { platform, reads } = coreInternPlatform();
  const storage = memoryStorage();
  const activities = Array.from({ length: 5 }, (_, index) => ({
    id: "week-1-activity-" + (index + 1),
    version: "1.0.0"
  }));
  await hydrateWeek(ns, platform, activities, storage);
  await hydrateWeek(ns, platform, activities, storage);
  await ns.createDraftStore(activities[0], { platform, storage }).hydrate();
  assert.equal(reads.length, 5);
});

test("saved evidence still restores through Core-interned hydrate", async () => {
  const ns = loadEngine();
  const { platform } = coreInternPlatform();
  const draft = await ns.createDraftStore(
    { id: "fill-gap-practice", version: "1.0.0" },
    { platform, storage: memoryStorage() }
  ).hydrate();
  assert.equal(draft.responses.q1, "saved-evidence");
  assert.equal(draft.checked.q1, true);
});
