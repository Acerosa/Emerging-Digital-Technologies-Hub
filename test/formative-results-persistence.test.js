const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const projectRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function memoryStorage() {
  const data = {};
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; }
  };
}

function oneQuestionActivity() {
  return {
    id: "week-1-welcome",
    version: "0.1.0",
    blocks: [{
      id: "week-1-welcome-q1",
      type: "single-choice",
      content: {
        questionId: "week-1-welcome-q1",
        prompt: "Pick one",
        options: [
          { id: "a", label: "A" },
          { id: "b", label: "B" }
        ]
      }
    }]
  };
}

function articleHtml(activity) {
  const block = activity.blocks[0];
  const options = block.content.options.map((option) => (
    `<label><input type="radio" name="${block.id}" data-lp-response value="${option.id}">${option.label}</label>`
  )).join("");
  return `<article data-lp-activity="${activity.id}">
    <div data-lp-block-id="${block.id}" data-lp-question="${block.content.questionId}" data-lp-block="single-choice">
      <fieldset>${options}</fieldset>
      <button type="button" data-lp-check="${block.id}">Check answer</button>
      <p data-lp-feedback></p>
    </div>
    <p data-lp-activity-status role="status"></p>
  </article>`;
}

function loadBoundEngine() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/" });
  const browserWindow = dom.window;
  browserWindow.localStorage = memoryStorage();
  const context = vm.createContext(browserWindow);
  browserWindow.globalThis = browserWindow;
  vm.runInContext(read("content/engine/version.js"), context, { filename: "content/engine/version.js" });
  vm.runInContext(read("content/engine/state.js"), context, { filename: "content/engine/state.js" });
  vm.runInContext(read("content/engine/interactive.js"), context, { filename: "content/engine/interactive.js" });
  const engine = browserWindow.LearningPlatformContent;
  engine.normaliseBlockType = function (type) { return type; };
  engine.isInteractiveBlockType = function () { return true; };
  engine.markBlock = function () { return { complete: true, feedback: "Checked." }; };
  engine.getPublicationState = function () { return { state: "PUBLISHED", allowsSubmission: true }; };
  engine.submitActivityDraft = function () {
    return Promise.resolve({ status: "submitted", fingerprint: "fp", reason: "Saved." });
  };
  return { engine, document: browserWindow.document };
}

test("empty draft includes results map", function () {
  const { engine } = loadBoundEngine();
  const draft = engine.createDraftStore(oneQuestionActivity(), { storage: memoryStorage() }).load();
  assert.equal(typeof draft.results, "object");
  assert.ok(draft.results);
  assert.equal(Object.keys(draft.results).length, 0);
});

test("React lp-block-result Check persists learner-safe results", function () {
  const activity = oneQuestionActivity();
  const storage = memoryStorage();
  const { engine, document } = loadBoundEngine();
  document.body.innerHTML = articleHtml(activity);
  engine.bindInteractive(document.body, { activities: [activity] }, { storage });
  const article = document.querySelector("[data-lp-activity]");
  const qid = "week-1-welcome-q1";
  article.dispatchEvent(new document.defaultView.CustomEvent("lp-block-result", {
    bubbles: true,
    detail: {
      questionId: qid,
      response: "a",
      completed: true,
      result: {
        correct: false,
        status: "incorrect",
        canRetry: true,
        correctOptionId: "b",
        score: { correct: 0, total: 1 }
      }
    }
  }));
  const draft = engine.createDraftStore(activity, { storage }).load();
  assert.equal(draft.checked[qid], true);
  assert.deepEqual(draft.results[qid], {
    correct: false,
    status: "incorrect",
    canRetry: true
  });
  assert.equal(Object.prototype.hasOwnProperty.call(draft.results[qid], "correctOptionId"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(draft.results[qid], "score"), false);
});

test("HTML Check does not invent Correct/Incorrect results", function () {
  const activity = oneQuestionActivity();
  const storage = memoryStorage();
  const { engine, document } = loadBoundEngine();
  document.body.innerHTML = articleHtml(activity);
  engine.bindInteractive(document.body, { activities: [activity] }, { storage });
  document.querySelector('input[value="a"]').checked = true;
  document.querySelector("[data-lp-check]").click();
  const draft = engine.createDraftStore(activity, { storage }).load();
  assert.equal(draft.checked["week-1-welcome-q1"], true);
  assert.equal(draft.results["week-1-welcome-q1"], undefined);
});

test("WeekPage hydrates initialChecked and initialResults", function () {
  const weekPage = read("src/pages/WeekPage.tsx");
  assert.match(weekPage, /initialChecked=\{draft\.checked\}/);
  assert.match(weekPage, /initialResults=\{draft\.results\}/);
  assert.match(weekPage, /correct:\s*result\.correct\s*\?\?\s*null/);
  assert.match(weekPage, /requiresReview:\s*result\.requiresReview/);
});
