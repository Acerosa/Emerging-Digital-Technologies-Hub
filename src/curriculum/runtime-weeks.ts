import {
  overlayLiveWeekMetadata,
  weeksFromPublication,
  type RuntimeWeekRecord
} from "@learning-platform/core/curriculum-runtime";
import type { ContentPackage } from "./from-package";

export type { RuntimeWeekRecord };

let bundledPackage: ContentPackage | null = null;

export function configureBundledPackage(pkg: ContentPackage) {
  bundledPackage = pkg;
}

function requireBundled(): ContentPackage {
  if (!bundledPackage) {
    throw new Error("L2E bundled curriculum is not configured");
  }
  return bundledPackage;
}

export function runtimeContentPackage(live?: ContentPackage | null): ContentPackage {
  const bundled = requireBundled();
  if (!live) return bundled;
  const teaching: ContentPackage = {
    ...bundled,
    ...(live.version ? { version: live.version } : {}),
    ...(live.hub ? { hub: live.hub } : {}),
    ...(live.curriculum ? { curriculum: live.curriculum } : {}),
    activities: live.activities?.length ? live.activities : bundled.activities,
    sessions: live.sessions?.length ? live.sessions : bundled.sessions,
    learningOutcomes: live.learningOutcomes?.length ? live.learningOutcomes : bundled.learningOutcomes
  };
  return overlayLiveWeekMetadata(teaching, live) as ContentPackage;
}

export function l2eRuntimeWeeks(live?: ContentPackage | null): RuntimeWeekRecord[] {
  return weeksFromPublication(requireBundled(), live);
}

export function runtimeWeekForTeachingWeek(
  live: ContentPackage | null | undefined,
  teachingWeek: number
): RuntimeWeekRecord | null {
  return l2eRuntimeWeeks(live).find((week) => week.teachingWeek === teachingWeek) || null;
}

export function runtimeWeekForId(
  live: ContentPackage | null | undefined,
  weekId: string
): RuntimeWeekRecord | null {
  return l2eRuntimeWeeks(live).find((week) => week.id === weekId) || null;
}
