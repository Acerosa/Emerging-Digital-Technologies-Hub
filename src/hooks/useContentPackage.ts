import { useEffect, useState } from "react";
import bundledPackage from "../../content/l2e-exploring-emerging-digital-technologies/package.json";
import { getContentEngine } from "../content/engine";
import {
  applyL2eCurriculum,
  loadL2eCurriculum,
  type CurriculumRuntime
} from "../curriculum/apply-runtime";
import type { ContentPackage } from "../curriculum/from-package";
import { configureBundledPackage } from "../curriculum/runtime-weeks";
import { ensureBundledConfigured } from "../platform";

type CurriculumHost = {
  curriculum?: {
    loadLatest: () => Promise<CurriculumRuntime | unknown>;
  };
};

async function loadBundledFallback(): Promise<CurriculumRuntime> {
  await ensureBundledConfigured();
  return applyL2eCurriculum({
    source: "bundled",
    package: bundledPackage as ContentPackage,
    state: { state: "FALLBACK" }
  });
}

export function useContentPackage(platform?: CurriculumHost | null) {
  const [pkg, setPackage] = useState<ContentPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("none");

  useEffect(() => {
    configureBundledPackage(bundledPackage as ContentPackage);
    const engine = getContentEngine();
    let cancelled = false;

    function applyRuntime(runtime: CurriculumRuntime) {
      const loaded = (runtime.package || null) as ContentPackage | null;
      if (loaded) {
        const validation = engine.validatePackage(loaded);
        if (!validation.valid && typeof console !== "undefined") {
          console.warn(engine.formatIssues(validation.issues));
        }
      }
      engine.setPublicationState?.(runtime.state);
      applyL2eCurriculum(runtime);
      setPackage(loaded);
      setSource(runtime.source || "none");
      document.dispatchEvent(new CustomEvent("lp:content-ready", {
        detail: { package: loaded, publication: runtime.state }
      }));
    }

    void (async () => {
      try {
        let runtime: CurriculumRuntime;
        if (platform?.curriculum?.loadLatest) {
          runtime = await loadL2eCurriculum({ curriculum: platform.curriculum });
        } else {
          runtime = await loadBundledFallback();
        }
        if (!runtime.package) runtime = await loadBundledFallback();
        if (!cancelled) applyRuntime(runtime);
      } catch (reason: unknown) {
        try {
          const runtime = await loadBundledFallback();
          if (!cancelled) applyRuntime(runtime);
        } catch (fallbackReason: unknown) {
          if (!cancelled) {
            setError(fallbackReason instanceof Error ? fallbackReason.message : String(reason));
          }
        }
      }
    })();

    function onPublication(event: Event) {
      const state = (event as CustomEvent).detail || engine.getPublicationState?.();
      if (state && state.state && document.body) {
        document.body.dataset.publicationState = state.state || "ERROR";
      }
    }
    document.addEventListener("lp:publication-resolved", onPublication);
    return () => {
      cancelled = true;
      document.removeEventListener("lp:publication-resolved", onPublication);
    };
  }, [platform]);

  return { pkg, error, source };
}
