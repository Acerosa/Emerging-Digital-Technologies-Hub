import "@learning-platform/content";
import "../../content/engine/state.js";
import "../../content/engine/interactive.js";

export type ContentEngine = {
  renderActivity: (activity: unknown, options?: { root?: string }) => string;
  bindInteractive: (root: ParentNode | null, pkg: unknown, options?: { sourcePage?: string }) => void;
};

export function getContentEngine(): ContentEngine {
  const engine = (globalThis as { LearningPlatformContent?: ContentEngine }).LearningPlatformContent;
  if (!engine) throw new Error("LEARNING_PLATFORM_CONTENT_UNAVAILABLE");
  return engine;
}
