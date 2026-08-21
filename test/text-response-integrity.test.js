const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");

test("text responses declare minChars in the curriculum package", function () {
  const pkg = JSON.parse(
    fs.readFileSync(
      path.join(root, "content/l2e-exploring-emerging-digital-technologies/package.json"),
      "utf8"
    )
  );
  const textBlocks = [];
  for (const activity of pkg.activities || []) {
    for (const block of activity.blocks || []) {
      if (block.type === "short-response" || block.type === "reflection") {
        textBlocks.push(block);
        assert.ok(
          Number(block.content && block.content.minChars) > 0,
          `${block.id} should set minChars`
        );
      }
    }
  }
  assert.ok(textBlocks.length >= 6);
  assert.equal(
    textBlocks.find((block) => block.id === "week-2-reflection-q").content.minChars,
    500
  );
  assert.equal(
    textBlocks.find((block) => block.id === "week-1-exit-q3").content.minChars,
    80
  );
});

test("interactive engine enforces minChars and blocks paste on textareas", function () {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://example.test/week-2/"
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Event = dom.window.Event;
  globalThis.LearningPlatformContent = {
    normaliseBlockType: function (type) { return type; },
    isInteractiveBlockType: function (type) {
      return type === "short-response" || type === "reflection";
    },
    markBlock: function () {
      return { complete: true, correct: null, feedback: "" };
    },
    createDraftStore: function () {
      return {
        load: function () {
          return { responses: {}, checked: {}, completed: false, submission: null };
        },
        save: function () {},
        reset: function () {
          return { responses: {}, checked: {}, completed: false, submission: null };
        }
      };
    },
    getPublicationState: function () { return { state: "FALLBACK" }; },
    submitActivityDraft: function () {
      return Promise.resolve({ status: "local", failed: false });
    }
  };

  require(path.join(root, "content/engine/interactive.js"));
  const ns = globalThis.LearningPlatformContent;

  const short = {
    id: "demo-short",
    type: "short-response",
    content: { questionId: "demo-short", minChars: 100, formative: true }
  };
  const shortFail = ns.markBlock(short, "too short");
  assert.equal(shortFail.complete, false);
  assert.match(shortFail.feedback, /100/);

  const shortPass = ns.markBlock(short, "x".repeat(100));
  assert.equal(shortPass.complete, true);

  const reflection = {
    id: "demo-reflection",
    type: "reflection",
    content: { questionId: "demo-reflection", formative: true }
  };
  const reflectionFail = ns.markBlock(reflection, "x".repeat(100));
  assert.equal(reflectionFail.complete, false);
  assert.match(reflectionFail.feedback, /500/);

  const article = document.createElement("article");
  article.setAttribute("data-lp-activity", "demo");
  article.innerHTML = `
    <div data-lp-block-id="demo-short">
      <textarea class="lp-textarea" data-lp-response></textarea>
      <button type="button" data-lp-check="demo-short">Save</button>
      <p data-lp-feedback></p>
    </div>
    <p data-lp-activity-status></p>
  `;
  document.body.appendChild(article);

  ns.bindInteractive(document.body, {
    activities: [{ id: "demo", blocks: [short] }]
  });

  const field = article.querySelector("[data-lp-response]");
  assert.equal(field.getAttribute("data-lp-min-chars"), "100");
  assert.ok(article.querySelector("[data-lp-char-count]"));

  const paste = new dom.window.Event("paste", { bubbles: true, cancelable: true });
  const blocked = !field.dispatchEvent(paste);
  assert.equal(blocked, true);
  assert.match(article.querySelector("[data-lp-paste-notice]").textContent, /Paste is disabled/i);

  delete require.cache[require.resolve(path.join(root, "content/engine/interactive.js"))];
  delete globalThis.LearningPlatformContent;
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.Event;
});
