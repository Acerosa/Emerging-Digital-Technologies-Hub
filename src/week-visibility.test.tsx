import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import pkg from "../content/l2e-exploring-emerging-digital-technologies/package.json";
import { L2eNavigation } from "./components/L2eNavigation";
import type { ContentPackage } from "./curriculum/from-package";
import { configureBundledPackage, runtimeContentPackage } from "./curriculum/runtime-weeks";
import { HomePage } from "./pages/HomePage";
import { WeekPage } from "./pages/WeekPage";
import { buildL2eNavigation } from "./paths";

const bundled = pkg as ContentPackage;

beforeAll(() => {
  configureBundledPackage(bundled);
});

afterEach(() => {
  cleanup();
  delete window.__lpPackage;
  delete window.__lpLivePackage;
  delete window.__lpPublishedCurriculum;
});

function withWeekStatus(source: ContentPackage, updates: Record<string, string>): ContentPackage {
  const clone = structuredClone(source);
  for (const week of clone.weeks || []) {
    if (updates[week.id] && week.metadata) week.metadata.status = updates[week.id];
  }
  return clone;
}

function applyLiveCurriculum(live: ContentPackage) {
  window.__lpLivePackage = live;
  window.__lpPackage = runtimeContentPackage(live);
}

describe("L2E shared week visibility", () => {
  it("A — available week is linked in navigation, home and direct route", () => {
    const live = withWeekStatus(bundled, { "week-2": "available" });
    applyLiveCurriculum(live);

    render(<HomePage root="." livePackage={live} />);
    expect(screen.getByRole("link", { name: "Open Week 2" })).toBeTruthy();
    cleanup();

    render(<L2eNavigation items={buildL2eNavigation(".", live)} brandTitle="L2E" />);
    expect(within(screen.getByRole("navigation", { name: "Main navigation" })).getByRole("link", { name: /Week 2/ })).toBeTruthy();
    cleanup();

    render(<WeekPage weekId="week-2" root=".." pkg={runtimeContentPackage(live)} />);
    expect(screen.getByText("Teaching context")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Week not available yet" })).toBeNull();
  });

  it("B — planned week is locked in navigation, home and direct route", () => {
    const live = withWeekStatus(bundled, { "week-1": "planned" });
    applyLiveCurriculum(live);

    render(<HomePage root="." livePackage={live} />);
    expect(screen.queryByRole("link", { name: "Open Week 1" })).toBeNull();
    expect(screen.getByText("Week 1")).toBeTruthy();
    cleanup();

    render(<L2eNavigation items={buildL2eNavigation(".", live)} brandTitle="L2E" />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).queryByRole("link", { name: /Week 1/ })).toBeNull();
    expect(within(nav).getByText(/Week 1/)).toBeTruthy();
    cleanup();

    render(<WeekPage weekId="week-1" root=".." pkg={runtimeContentPackage(live)} />);
    expect(screen.getByRole("heading", { name: "Week not available yet" })).toBeTruthy();
  });

  it("C — make available unlocks navigation after runtime reload", () => {
    const planned = withWeekStatus(bundled, { "week-1": "planned" });
    const available = withWeekStatus(bundled, { "week-1": "available" });

    const { rerender } = render(<HomePage root="." livePackage={planned} />);
    expect(screen.queryByRole("link", { name: "Open Week 1" })).toBeNull();
    rerender(<HomePage root="." livePackage={available} />);
    expect(screen.getByRole("link", { name: "Open Week 1" })).toBeTruthy();
  });

  it("D — hide from learners locks navigation, home and direct route", () => {
    const available = withWeekStatus(bundled, { "week-3": "available" });
    const planned = withWeekStatus(bundled, { "week-3": "planned" });

    const { rerender: rerenderHome } = render(<HomePage root="." livePackage={available} />);
    expect(screen.getByRole("link", { name: "Open Week 3" })).toBeTruthy();
    rerenderHome(<HomePage root="." livePackage={planned} />);
    expect(screen.queryByRole("link", { name: "Open Week 3" })).toBeNull();
    cleanup();

    applyLiveCurriculum(planned);
    render(<WeekPage weekId="week-3" root=".." pkg={runtimeContentPackage(planned)} />);
    expect(screen.getByRole("heading", { name: "Week not available yet" })).toBeTruthy();
  });

  it("E — non-sequential availability matches hosted publication shape", () => {
    const live = withWeekStatus(bundled, {
      "week-1": "planned",
      "week-2": "available",
      "week-3": "available"
    });
    applyLiveCurriculum(live);

    render(<HomePage root="." livePackage={live} />);
    expect(screen.queryByRole("link", { name: "Open Week 1" })).toBeNull();
    expect(screen.getByRole("link", { name: "Open Week 2" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Week 3" })).toBeTruthy();
    cleanup();

    render(<L2eNavigation items={buildL2eNavigation(".", live)} brandTitle="L2E" />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).queryByRole("link", { name: /^Week 1/ })).toBeNull();
    expect(within(nav).getByRole("link", { name: /Week 2/ })).toBeTruthy();
    expect(within(nav).getByRole("link", { name: /Week 3/ })).toBeTruthy();
  });

  it("F — platform publication status overrides bundled fallback", () => {
    const livePlanned = withWeekStatus(bundled, { "week-2": "planned" });
    expect(runtimeContentPackage(livePlanned).weeks?.find((week) => week.id === "week-2")?.metadata?.status)
      .toBe("planned");

    render(<HomePage root="." livePackage={livePlanned} />);
    expect(screen.queryByRole("link", { name: "Open Week 2" })).toBeNull();
    cleanup();

    const liveAvailable = withWeekStatus(bundled, { "week-2": "available" });
    render(<HomePage root="." livePackage={liveAvailable} />);
    expect(screen.getByRole("link", { name: "Open Week 2" })).toBeTruthy();
  });

  it("H — Week 4 ships planned and stays locked until the publication makes it available", () => {
    expect(bundled.weeks?.find((week) => week.id === "week-4")?.metadata?.status).toBe("planned");
    const live = structuredClone(bundled);
    live.weeks = (live.weeks || []).filter((week) => week.id !== "week-4");
    applyLiveCurriculum(live);

    render(<HomePage root="." livePackage={live} />);
    expect(screen.queryByRole("link", { name: "Open Week 4" })).toBeNull();
    expect(screen.getByText("Week 4")).toBeTruthy();
    cleanup();

    render(<L2eNavigation items={buildL2eNavigation(".", live)} brandTitle="L2E" />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(within(nav).queryByRole("link", { name: /Week 4/ })).toBeNull();
    expect(within(nav).getByText(/Week 4/)).toBeTruthy();
    cleanup();

    render(<WeekPage weekId="week-4" root=".." pkg={runtimeContentPackage(live)} />);
    expect(screen.getByRole("heading", { name: "Week not available yet" })).toBeTruthy();
  });

  it("I — published Week 4 follows Week 3, loads its activities and gives formative feedback", async () => {
    const live = withWeekStatus(bundled, { "week-3": "available", "week-4": "available" });
    applyLiveCurriculum(live);

    render(<HomePage root="." livePackage={live} />);
    expect(screen.getByRole("link", { name: "Open Week 4" }).getAttribute("href")).toBe("./week-4/");
    cleanup();

    render(<L2eNavigation items={buildL2eNavigation(".", live)} brandTitle="L2E" />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    const weekLinks = within(nav).getAllByRole("link").map((link) => link.textContent || "").filter((text) => /Week \d/.test(text));
    expect(weekLinks.findIndex((text) => /Week 4/.test(text))).toBe(weekLinks.findIndex((text) => /Week 3/.test(text)) + 1);
    cleanup();

    const { container } = render(<WeekPage weekId="week-4" root=".." pkg={runtimeContentPackage(live)} />);
    expect(screen.queryByRole("heading", { name: "Week not available yet" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Week 4 session" })).toBeTruthy();
    expect(container.querySelectorAll("[data-lp-activity^='week-4-']").length).toBe(24);

    const article = await waitFor(() => {
      const node = container.querySelector('[data-lp-activity="week-4-ai-intro"]');
      expect(node?.getAttribute("data-lp-bound")).toBe("week-4-ai-intro");
      return node as HTMLElement;
    });
    fireEvent.click(within(article).getAllByRole("radio", { name: /Any program that runs on a computer/ })[0]);
    fireEvent.click(within(article).getAllByRole("button", { name: "Check answer" })[0]);
    await waitFor(() => {
      expect(within(article).getByText(/Not every program is AI/)).toBeTruthy();
    });
  });

  it("G — hub isolation: L2E package does not expose Unit 3 week ids", () => {
    expect(bundled.hub?.id).toBe("l2e-exploring-emerging-digital-technologies");
    expect(bundled.weeks?.every((week) => week.id.startsWith("week-"))).toBe(true);
    expect(bundled.weeks?.some((week) => /cyber|unit-3|ocr/i.test(String(week.metadata?.title)))).toBe(false);
  });
});
