import { getContentEngine } from "../content/engine";
import { activityFromPackage, type ContentPackage } from "./from-package";
import { runtimeContentPackage } from "./runtime-weeks";

export type CurriculumRuntime = {
  source?: string;
  package?: ContentPackage | null;
  state?: { state?: string; message?: string; allowsSubmission?: boolean; reason?: string | null } | null;
  publication?: { version?: string; hub?: string; course?: string } | null;
};

export function applyL2eCurriculum(
  runtime: CurriculumRuntime,
  target: Window & typeof globalThis = window
) {
  const source = runtime.source || "none";
  const livePackage = source === "published" ? (runtime.package || null) : null;
  const pkg = livePackage
    ? runtimeContentPackage(livePackage)
    : (source === "bundled" ? runtimeContentPackage(null) : null);
  target.__lpLivePackage = livePackage || undefined;
  target.__lpPackage = pkg || undefined;
  target.__lpPublishedCurriculum = source === "published";
  if (target.document?.body) {
    target.document.body.dataset.curriculumSource = source;
    target.document.body.dataset.publicationState = runtime.state?.state || "ERROR";
  }
  try {
    getContentEngine().setPublicationState?.(runtime.state);
  } catch {
    // Content engine is optional for unit tests that only hydrate window.__lpPackage.
  }
  if (source !== "published") {
    console.warn("L2E_CURRICULUM_FALLBACK", {
      source,
      state: runtime.state?.state || "ERROR",
      reason: runtime.state?.reason || null,
      message: runtime.state?.message || null,
      hub: runtime.publication?.hub || null,
      course: runtime.publication?.course || null
    });
  }
  return { ...runtime, package: pkg, livePackage };
}

export function liveContentPackage(): ContentPackage | null {
  if (typeof window !== "undefined" && window.__lpLivePackage) {
    return window.__lpLivePackage as ContentPackage;
  }
  return null;
}

export function activeContentPackage(pkg?: ContentPackage | null): ContentPackage | null {
  if (pkg) return pkg;
  if (typeof window !== "undefined" && window.__lpPackage) {
    return window.__lpPackage as ContentPackage;
  }
  return null;
}

export function activityFromPublishedPackage(pkg: ContentPackage | null | undefined, activityId: string) {
  if (!pkg) return null;
  return activityFromPackage(pkg, activityId);
}

import { ensureBundledConfigured } from "../platform";

export async function loadL2eCurriculum(platform: {
  curriculum: {
    loadLatest: () => Promise<unknown>;
  };
}) {
  await ensureBundledConfigured();
  const runtime = await platform.curriculum.loadLatest() as CurriculumRuntime;
  return applyL2eCurriculum(runtime, window);
}
