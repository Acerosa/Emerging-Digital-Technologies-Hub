export type PageContext = {
  page: string;
  section: string;
  root: string;
};

export function readPageContext(body: HTMLElement = document.body): PageContext {
  return {
    page: body.dataset.page || "home",
    section: body.dataset.section || body.dataset.page || "home",
    root: body.dataset.root || "."
  };
}

export function currentIds(context: PageContext): string[] {
  return context.page === context.section ? [context.page] : [context.page, context.section];
}
