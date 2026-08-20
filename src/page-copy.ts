import type { BreadcrumbItem } from "@learning-platform/ui";
import { activeContentPackage } from "./curriculum/apply-runtime";
import { weekPageFromPackage, type ContentPackage } from "./curriculum/from-package";
import type { PageContext } from "./page-context";

const PAGE_COPY: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: "Course home",
    subtitle: "Find the weekly teaching sequence and course guidance for L2 E Computing."
  },
  "course-guide": {
    title: "Course Guide",
    subtitle: "Use this page to understand the main sections of the hub."
  },
  resources: {
    title: "Resources",
    subtitle: "Reference material and course documents."
  },
  help: {
    title: "Help",
    subtitle: "Guidance for finding and using course materials."
  },
  account: {
    title: "Learner account",
    subtitle: "Sign in or create an account to use learner-specific platform features."
  }
};

export function pageHeader(
  context: PageContext,
  pkg?: ContentPackage | null
): { title: string; subtitle: string } {
  if (/^week-\d+$/.test(context.page)) {
    const content = activeContentPackage(pkg);
    const model = content ? weekPageFromPackage(content, context.page) : null;
    if (model) {
      return {
        title: `Week ${model.week.teachingWeek}: ${model.week.title}`,
        subtitle: model.week.subtitle
      };
    }
  }
  return PAGE_COPY[context.page] || PAGE_COPY.home;
}

export function breadcrumbs(context: PageContext, pkg?: ContentPackage | null): BreadcrumbItem[] {
  const home = { label: "Course home", path: "" };
  if (context.page === "home") return [home];
  const header = pageHeader(context, pkg);
  return [home, { label: header.title }];
}
