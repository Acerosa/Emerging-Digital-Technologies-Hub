#!/usr/bin/env node
/**
 * Generic learner-package → marking-catalogue contract check.
 * Fails when available activities cannot produce a coherent authoritative
 * marking-spec manifest (ids, versions, question keys, block types).
 */

import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const SERVER_MARKED = new Set([
  "single-choice",
  "classification",
  "short-response",
  "reflection",
  "code-editor",
  "python-exercise",
  "drag-drop"
]);

const SUPPORTED = new Set([
  "heading",
  "paragraph",
  "callout",
  "hint",
  "teacher-note",
  "image",
  "list",
  "table",
  "video",
  "single-choice",
  "classification",
  "short-response",
  "reflection",
  "code-editor",
  "python-exercise",
  "drag-drop"
]);

function loadPackage() {
  const path = join(
    ROOT,
    "content/l2e-exploring-emerging-digital-technologies/package.json"
  );
  return JSON.parse(readFileSync(path, "utf8"));
}

function buildMarkingManifest(pkg) {
  const issues = [];
  const activities = Array.isArray(pkg.activities) ? pkg.activities : [];
  const activityKeys = new Map();
  const rows = [];

  for (const activity of activities) {
    const activityId = String(activity?.id || "").trim();
    const version = String(activity?.version || "").trim();
    if (!activityId || !version) {
      issues.push(`activity missing id/version: ${JSON.stringify({ id: activityId, version })}`);
      continue;
    }
    const pair = `${activityId}@${version}`;
    if (activityKeys.has(pair)) {
      issues.push(`duplicate activity/version pair: ${pair}`);
    }
    activityKeys.set(pair, true);

    const questionKeys = new Map();
    for (const block of activity.blocks || []) {
      const type = String(block?.type || "").trim();
      if (!type) {
        issues.push(`${pair}: block missing type`);
        continue;
      }
      if (!SUPPORTED.has(type)) {
        issues.push(`${pair}: unsupported block type '${type}'`);
      }
      if (!SERVER_MARKED.has(type)) continue;

      const content = block.content && typeof block.content === "object" ? block.content : {};
      const questionId = String(content.questionId || "").trim();
      if (!questionId) {
        issues.push(`${pair}: server-marked ${type} block missing questionId`);
        continue;
      }
      if (!/^[A-Za-z0-9._:-]+$/.test(questionId)) {
        issues.push(`${pair}: invalid questionId '${questionId}'`);
      }

      if (type === "classification" || type === "drag-drop") {
        const items = Array.isArray(content.items) ? content.items : [];
        if (items.length === 0) {
          issues.push(`${pair}: ${type} '${questionId}' has no items`);
        }
        for (const item of items) {
          const itemId = String(item?.id || "").trim();
          if (!itemId) {
            issues.push(`${pair}: ${type} '${questionId}' item missing id`);
            continue;
          }
          const key = `${questionId}:${itemId}`;
          if (questionKeys.has(key)) {
            issues.push(`${pair}: duplicate authoritative question key '${key}'`);
          }
          questionKeys.set(key, type);
          rows.push({
            activityId,
            version,
            questionId: key,
            blockType: type,
            serverMarked: true
          });
        }
      } else {
        if (questionKeys.has(questionId)) {
          issues.push(`${pair}: duplicate authoritative question key '${questionId}'`);
        }
        questionKeys.set(questionId, type);
        rows.push({
          activityId,
          version,
          questionId,
          blockType: type,
          serverMarked: true
        });
      }
    }
  }

  return { activities: activityKeys, rows, issues };
}

export function checkCatalogueAlignment(pkg = loadPackage()) {
  const { activities, rows, issues } = buildMarkingManifest(pkg);
  return {
    ok: issues.length === 0,
    activityCount: activities.size,
    markingQuestionCount: rows.length,
    issues,
    rows,
    activityIds: [...activities.keys()].map((k) => k.split("@")[0]).sort()
  };
}

function main() {
  // Prefer content package validate when available.
  try {
    const content = require("@learning-platform/content");
    if (typeof content.validatePackage === "function") {
      const validation = content.validatePackage(loadPackage());
      const list = Array.isArray(validation?.issues) ? validation.issues : [];
      if (list.length) {
        console.error("content package validation failed:");
        for (const issue of list.slice(0, 20)) {
          console.error(`- ${issue.code || issue.type || "ISSUE"}: ${issue.message || issue.path || issue}`);
        }
        process.exit(1);
      }
    }
  } catch {
    // validatePackage optional in older content builds
  }

  const result = checkCatalogueAlignment();
  if (!result.ok) {
    console.error("catalogue alignment check failed:");
    for (const issue of result.issues) console.error(`- ${issue}`);
    process.exit(1);
  }
  console.log(
    `catalogue alignment ok: ${result.activityCount} activities, ${result.markingQuestionCount} marking keys`
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
