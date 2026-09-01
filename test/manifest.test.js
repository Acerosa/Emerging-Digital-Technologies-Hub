const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("hub config matches the canonical manifest", function () {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "learning-platform-hub.json"), "utf8"));
  const config = fs.readFileSync(path.join(root, "src/config.ts"), "utf8");
  const provenance = JSON.parse(fs.readFileSync(path.join(root, "docs/provenance.json"), "utf8"));
  assert.equal(manifest.hubId, "l2e-exploring-emerging-digital-technologies");
  assert.equal(manifest.name, "Exploring New and Emerging Digital Technologies");
  assert.equal(manifest.repositoryUrl, "https://github.com/Acerosa/Emerging-Digital-Technologies-Hub");
  assert.equal(manifest.deploymentUrl, "https://acerosa.github.io/Emerging-Digital-Technologies-Hub");
  assert.equal(manifest.courses[0], "gateway-level-2-digital-it-skills");
  assert.equal(manifest.compatibility.required.coreVersion, "0.2.5");
  assert.match(config, /hubId: "l2e-exploring-emerging-digital-technologies"/);
  assert.equal(manifest.certification.status, "not-certified");
  assert.equal(provenance.generator, "@learning-platform/cli");
  assert.equal(provenance.generatorVersion, "0.1.0");
  assert.equal(provenance.coreVersion, "0.2.5");
  assert.equal(provenance.uiVersion, "0.1.8");
  assert.equal(provenance.contentVersion, "0.1.2");
  assert.equal(provenance.useContentEngine, true);
  assert.equal(provenance.packages.core.tag, "v0.2.5");
});
