import type { L2eNavigationItem } from "./components/L2eNavigation";
import { APP_CONFIG } from "./config";
import type { ContentPackage } from "./curriculum/from-package";
import { l2eRuntimeWeeks } from "./curriculum/runtime-weeks";

export function createSitePath(root: string, path = ""): string {
  const cleanRoot = root || ".";
  return path ? `${cleanRoot}/${path}` : `${cleanRoot}/`;
}

export function navigationItems(
  items: Array<{ id: string; label: string; path: string }>,
  root: string
) {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    path: item.id === "home" ? createSitePath(root) : createSitePath(root, item.path)
  }));
}

/** Structural navigation only — safe before bundled curriculum is configured. */
export function buildL2eNavigationFallback(root: string): L2eNavigationItem[] {
  return APP_CONFIG.navigation.map((item) => ({
    id: item.id,
    label: item.label,
    path: item.id === "home" ? createSitePath(root) : createSitePath(root, item.path)
  }));
}

/** Structural navigation with runtime week access metadata from published curriculum. */
export function buildL2eNavigation(root: string, livePackage?: ContentPackage | null): L2eNavigationItem[] {
  const runtimeWeeks = l2eRuntimeWeeks(livePackage);
  const weekById = new Map(runtimeWeeks.map((week) => [week.id, week]));

  return APP_CONFIG.navigation.map((item) => {
    const teachingWeek = item.id.startsWith("week-") ? Number(item.id.replace("week-", "")) : 0;
    const runtimeWeek = item.id.startsWith("week-")
      ? weekById.get(item.id) || {
        id: item.id,
        teachingWeek,
        status: "",
        available: false,
        title: item.label
      }
      : undefined;
    return {
      id: item.id,
      label: item.label,
      path: item.id === "home" ? createSitePath(root) : createSitePath(root, item.path),
      runtimeWeek
    };
  });
}

export function buildL2eCourseSections(root: string, livePackage?: ContentPackage | null) {
  const weekById = new Map(l2eRuntimeWeeks(livePackage).map((week) => [week.id, week]));
  return navigationItems(
    APP_CONFIG.navigation.filter((item) => (APP_CONFIG.courseSectionIds as readonly string[]).includes(item.id)),
    root
  ).map((item) => ({
    ...item,
    runtimeWeek: item.id.startsWith("week-") ? weekById.get(item.id) || null : null
  }));
}
