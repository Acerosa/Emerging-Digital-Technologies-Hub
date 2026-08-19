import type { BreadcrumbItem } from "@learning-platform/ui";
import pkg from "../content/l2e-exploring-emerging-digital-technologies/package.json";
import { weekPageFromPackage } from "./curriculum/from-package";
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

export function pageHeader(context: PageContext): { title: string; subtitle: string } {
  if (/^week-\d+$/.test(context.page)) {
    const model = weekPageFromPackage(pkg, context.page);
    if (model) {
      return {
        title: `Week ${model.week.teachingWeek}: ${model.week.title}`,
        subtitle: model.week.subtitle
      };
    }
  }
  return PAGE_COPY[context.page] || PAGE_COPY.home;
}

export function breadcrumbs(context: PageContext): BreadcrumbItem[] {
  const home = { label: "Course home", path: "" };
  if (context.page === "home") return [home];
  const header = pageHeader(context);
  return [home, { label: header.title }];
}
