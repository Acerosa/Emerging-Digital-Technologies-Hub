const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");

test("classification blocks render as drag-and-drop sort cards", function () {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://example.test/week-3/"
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Event = dom.window.Event;
  globalThis.LearningPlatformContent = {
    normaliseBlockType: function (type) { return type; },
    isInteractiveBlockType: function (type) {
      return type === "classification";
    },
    markBlock: function (block, response) {
      const items = (block.content && block.content.items) || [];
      const values = response || {};
      const answered = items.every((item) => values[item.id]);
      const allCorrect = answered && items.every((item) => values[item.id] === item.correctCategoryId);
      return {
        complete: answered,
        correct: answered ? allCorrect : null,
        itemResults: items.map((item) => ({
          id: item.id,
          correct: values[item.id] ? values[item.id] === item.correctCategoryId : null
        })),
        feedback: allCorrect ? "Those matches look right." : "Check the definition and try again."
      };
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
    },
    renderBlock: function () {
      return "<p>fallback</p>";
    }
  };

  require(path.join(root, "content/engine/interactive.js"));
  const ns = globalThis.LearningPlatformContent;

  const block = {
    id: "demo-class",
    type: "classification",
    content: {
      formative: true,
      questionId: "demo-class",
      prompt: "Classify each example.",
      categories: [
        { id: "saas", label: "SaaS" },
        { id: "iaas", label: "IaaS" }
      ],
      items: [
        { id: "i1", text: "Browser email", correctCategoryId: "saas" },
        { id: "i2", text: "Rented virtual server", correctCategoryId: "iaas" }
      ]
    }
  };

  const html = ns.renderBlock(block);
  assert.match(html, /lp-sort-board/);
  assert.match(html, /data-lp-sort-card="i1"/);
  assert.match(html, /Browser email/);
  assert.match(html, /data-lp-item="i1"/);

  const activity = {
    id: "demo-activity",
    version: "0.1.0",
    blocks: [block]
  };
  const rootEl = document.createElement("div");
  rootEl.innerHTML = '<article class="lp-activity" data-lp-activity="demo-activity">' +
    html +
    '<button type="button" data-lp-reset-activity="demo-activity">Reset</button>' +
    '<p data-lp-activity-status></p></article>';
  document.body.appendChild(rootEl);

  ns.bindInteractive(rootEl, { activities: [activity] });

  const board = rootEl.querySelector("[data-lp-sort-board]");
  const card = rootEl.querySelector('[data-lp-sort-card="i1"]');
  const saasColumn = rootEl.querySelector('[data-lp-sort-column="saas"]');
  assert.ok(board);
  assert.ok(card);
  assert.ok(saasColumn);

  card.click();
  saasColumn.click();

  const select = rootEl.querySelector('[data-lp-item="i1"]');
  assert.equal(select.value, "saas");
  assert.equal(
    card.parentElement.getAttribute("data-lp-sort-stack"),
    "saas"
  );

  delete require.cache[require.resolve(path.join(root, "content/engine/interactive.js"))];
  delete globalThis.LearningPlatformContent;
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.Event;
});
