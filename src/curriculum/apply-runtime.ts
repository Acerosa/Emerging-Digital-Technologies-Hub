import { getContentEngine } from "../content/engine";
import { activityFromPackage, type ContentPackage } from "./from-package";

export type CurriculumRuntime = {
  source?: string;
  package?: ContentPackage | null;
  state?: { state?: string; message?: string; allowsSubmission?: boolean; reason?: string | null } | null;
  publication?: { version?: string; hub?: string; course?: string } | null;
};

function bannerHost(doc: Document) {
  let host = doc.getElementById("lp-publication-status");
  if (!host) {
    host = doc.createElement("div");
    host.id = "lp-publication-status";
    doc.body.prepend(host);
  }
  return host;
}

export function applyL2eCurriculum(
  runtime: CurriculumRuntime,
  target: Window & typeof globalThis = window,
  renderStatus?: (state: unknown) => string
) {
  const pkg = runtime.package || null;
  const source = runtime.source || "none";
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
  if (runtime.state && target.document && typeof renderStatus === "function") {
    bannerHost(target.document).innerHTML = renderStatus(runtime.state);
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
  return runtime;
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

export async function loadL2eCurriculum(platform: {
  curriculum: {
    loadLatest: () => Promise<unknown>;
    renderStatus?: (state: unknown) => string;
  };
}) {
  const runtime = await platform.curriculum.loadLatest() as CurriculumRuntime;
  return applyL2eCurriculum(runtime, window, (state) => platform.curriculum.renderStatus?.(state) || "");
}
