import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import pkg from "../content/l2e-exploring-emerging-digital-technologies/package.json";
import { CourseSidebar } from "./components/CourseSidebar";
import { homeWeeksFromPackage, type ContentPackage } from "./curriculum/from-package";
import { configureBundledPackage } from "./curriculum/runtime-weeks";
import { HomePage } from "./pages/HomePage";
import { WeekPage, persistableResponse } from "./pages/WeekPage";
import { breadcrumbs } from "./page-copy";

const content = pkg as ContentPackage;

beforeAll(() => {
  configureBundledPackage(content);
});

afterEach(cleanup);

function expectReactTextBlock(root: HTMLElement, blockType: "short-response" | "reflection") {
  const block = root.querySelector(`[data-lp-block='${blockType}']`) as HTMLElement | null;
  expect(block).toBeTruthy();
  const field = block?.querySelector("textarea.lp-textarea[data-lp-response]") as HTMLTextAreaElement | null;
  expect(field).toBeTruthy();
  expect(field?.getAttribute("data-lp-min-chars")).toBeTruthy();
  expect(block?.querySelector("[data-lp-char-count]")).toBeTruthy();
  expect(block?.querySelector("[data-lp-char-count]")?.textContent).toMatch(/\d+ \/ \d+ characters minimum/);
  // HTML Content text uses a Check button; React TextResponse uses Save response.
  expect(within(block as HTMLElement).getByRole("button", { name: "Save response" })).toBeTruthy();
  expect(block?.querySelector("[data-lp-check]")).toBeNull();
}

describe("L2E presentation", () => {
  it("puts Weeks 1 to 3 on the home page as the teaching starting points", () => {
    render(<HomePage root="." livePackage={null} />);
    expect(screen.getByRole("link", { name: "Open Week 1" }).getAttribute("href")).toBe("./week-1/");
    expect(screen.getByRole("link", { name: "Open Week 2" }).getAttribute("href")).toBe("./week-2/");
    expect(screen.getByRole("link", { name: "Open Week 3" }).getAttribute("href")).toBe("./week-3/");
    expect(screen.queryByRole("link", { name: /Task 1/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Foundations/i })).toBeNull();
    expect(screen.getAllByText(/Gateway/i).length).toBeGreaterThan(0);
  });

  it("marks the current course section on the sidebar", () => {
    const { rerender } = render(<CourseSidebar currentPage="week-2" root=".." />);
    const nav = () => screen.getByRole("navigation", { name: "Course sections" });
    expect(within(nav()).getByRole("link", { name: /Week 2/ }).getAttribute("aria-current")).toBe("page");
    expect(within(nav()).getByText("Current").closest("a")?.textContent).toMatch(/Week 2/);
    expect(within(nav()).getByRole("link", { name: /Week 2/ }).textContent).toMatch(/IoT/);
    expect(within(nav()).getByRole("link", { name: /Week 3/ }).textContent).toMatch(/Cloud/);
    rerender(<CourseSidebar currentPage="course-guide" root=".." />);
    expect(within(nav()).getByRole("link", { name: /Course Guide/ }).getAttribute("aria-current")).toBe("page");
  });

  it("shows Gateway unit context on a week page and one session only", () => {
    const { container } = render(<WeekPage weekId="week-1" root=".." pkg={content} />);
    expect(screen.getByText("Gateway Level 2 Digital and IT Skills")).toBeTruthy();
    expect(screen.getAllByText(/M\/618\/3683/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Pearson/i)).toBeNull();
    expect(screen.queryByText(/T Level/i)).toBeNull();
    expect(screen.getByRole("heading", { name: "Week 1 session" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Lesson 2/i })).toBeNull();
    expect(screen.getByText(/Which of these is an example of an emerging digital technology/)).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Check answer" }).length).toBeGreaterThan(0);
    const panel = screen.getByRole("complementary", { name: "Practice progress" });
    expect(panel.getAttribute("data-lp-docked")).toBe("left");
    expect(panel.getAttribute("data-lp-collapsed")).toBe("true");
    expect(within(panel).getByText(/Practice progress/i)).toBeTruthy();
    expect(within(panel).getByText(/\d+ \/ \d+/)).toBeTruthy();
    expect(within(panel).queryByText(/practice feedback, not an official mark/i)).toBeNull();
    expect(panel.querySelector("progress.lp-progress")).toBeNull();
    expect(container.querySelector(".lp-week-progress-float")).toBeNull();
  });

  it("wires Check answer and Reset activity on the week page", async () => {
    const { container } = render(<WeekPage weekId="week-1" root=".." pkg={content} />);
    const article = await waitFor(() => {
      const node = container.querySelector('[data-lp-activity="week-1-welcome"]');
      expect(node?.getAttribute("data-lp-bound")).toBe("week-1-welcome");
      return node as HTMLElement;
    });

    fireEvent.click(within(article).getByRole("radio", { name: /Quantum computing/ }));
    fireEvent.click(within(article).getByRole("button", { name: "Check answer" }));

    await waitFor(() => {
      expect(within(article).getByText(/Quantum computing is still developing/i)).toBeTruthy();
    });

    fireEvent.click(within(article).getByRole("button", { name: "Reset activity" }));
    await waitFor(() => {
      const radio = within(article).getByRole("radio", { name: /Quantum computing/ }) as HTMLInputElement;
      expect(radio.checked).toBe(false);
    });
  });

  it("docks practice progress on the left and keeps exercises uncovered", () => {
    const { container } = render(<WeekPage weekId="week-1" root=".." pkg={content} />);
    const panel = screen.getByRole("complementary", { name: "Practice progress" });
    expect(panel.getAttribute("data-lp-docked")).toBe("left");
    expect(panel.getAttribute("data-lp-collapsed")).toBe("true");
    expect(within(panel).getByText("0 / 57")).toBeTruthy();
    expect(within(panel).getByText("0 of 57 correct")).toBeTruthy();
    expect(within(panel).queryByRole("progressbar")).toBeNull();
    expect(container.querySelector(".lp-week-progress-float")).toBeNull();
    expect(screen.getByRole("heading", { name: "Week 1 session" })).toBeTruthy();
  });

  it("opens CompletionModal with week badge and practice score after classification Check", async () => {
    const { container } = render(<WeekPage weekId="week-1" root=".." pkg={content} />);
    const classify = await waitFor(() => {
      const node = container.querySelector('[data-lp-activity="week-1-digital-technology"]');
      expect(node).toBeTruthy();
      return node as HTMLElement;
    });

    expect(screen.queryByRole("dialog", { name: /Practice complete/i })).toBeNull();

    const selects = within(classify).getAllByRole("combobox");
    expect(selects.length).toBeGreaterThan(1);
    for (const select of selects) {
      const options = within(select).getAllByRole("option").filter((option) => (option as HTMLOptionElement).value);
      fireEvent.change(select, { target: { value: (options[0] as HTMLOptionElement).value } });
    }
    fireEvent.click(within(classify).getByRole("button", { name: "Check types" }));

    const dialog = await waitFor(() => screen.getByRole("dialog", { name: /Practice complete/i }));
    expect(within(dialog).getByText(/Week 1:/i)).toBeTruthy();
    expect(within(dialog).getByText(/practice feedback, not an official mark/i)).toBeTruthy();
    expect(dialog.querySelector("[data-lp-progress-score]")).toBeTruthy();
    expect(classify.querySelector("[data-lp-sort-board]")).toBeNull();

    fireEvent.click(within(dialog).getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Practice complete/i })).toBeNull();
    });
  });

  it("renders Week 1 single-choice and classification through React, with React reflection", () => {
    const { container } = render(<WeekPage weekId="week-1" root=".." pkg={content} />);
    const welcome = container.querySelector('[data-lp-activity="week-1-welcome"]') as HTMLElement;
    const classify = container.querySelector('[data-lp-activity="week-1-digital-technology"]') as HTMLElement;
    const reflection = container.querySelector('[data-lp-activity="week-1-exit-ticket"]') as HTMLElement;

    expect(within(welcome).getByRole("radio", { name: /Quantum computing/ })).toBeTruthy();
    expect(welcome.querySelector("[data-lp-block='option-cards']")).toBeTruthy();
    expect(within(classify).getByRole("button", { name: "Check types" })).toBeTruthy();
    expect(classify.querySelector("[data-lp-block='classification']")).toBeTruthy();
    expect(classify.querySelector("[data-lp-sort-board]")).toBeNull();
    expectReactTextBlock(reflection, "reflection");
  });

  it("renders Week 2 single-choice and classification through React, with React short-response", () => {
    const { container } = render(<WeekPage weekId="week-2" root=".." pkg={content} />);
    const starter = container.querySelector('[data-lp-activity="week-2-starter"]') as HTMLElement;
    const classify = container.querySelector('[data-lp-activity="week-2-iot-sectors"]') as HTMLElement;
    const written = container.querySelector('[data-lp-activity="week-2-rfid"]') as HTMLElement;

    expect(within(starter).getAllByRole("radio").length).toBeGreaterThan(0);
    expect(starter.querySelector("[data-lp-block='option-cards']")).toBeTruthy();
    expect(within(classify).getByRole("button", { name: "Check types" })).toBeTruthy();
    expect(classify.querySelector("[data-lp-sort-board]")).toBeNull();
    expectReactTextBlock(written, "short-response");
  });

  it("renders Week 3 single-choice and classification through React, with React short-response", () => {
    const { container } = render(<WeekPage weekId="week-3" root=".." pkg={content} />);
    const starter = container.querySelector('[data-lp-activity="week-3-starter"]') as HTMLElement;
    const classify = container.querySelector('[data-lp-activity="week-3-local-vs-cloud"]') as HTMLElement;
    const written = container.querySelector('[data-lp-activity="week-3-benefits-risks"]') as HTMLElement;

    expect(starter.querySelector("[data-lp-block='option-cards']")).toBeTruthy();
    expect(classify.querySelector("[data-lp-block='classification']")).toBeTruthy();
    expect(classify.querySelector("[data-lp-sort-board]")).toBeNull();
    expect(within(classify).getByRole("button", { name: "Check types" })).toBeTruthy();
    expectReactTextBlock(written, "short-response");
  });

  it("persists React text results as trimmed strings, not empty objects", () => {
    expect(persistableResponse(
      { id: "note", type: "short-response" },
      { completed: true, correct: null, attempts: 1, responses: "  typed answer  " }
    )).toBe("typed answer");
    expect(persistableResponse(
      { id: "journal", type: "reflection" },
      { completed: true, correct: null, attempts: 1, responses: "reflection text" }
    )).toBe("reflection text");
    expect(persistableResponse(
      { id: "choice", type: "single-choice" },
      { completed: true, correct: true, attempts: 1, responses: { optionId: "a" } }
    )).toBe("a");
    expect(persistableResponse(
      { id: "sort", type: "classification" },
      { completed: true, correct: true, attempts: 1, responses: { one: "rfid" } }
    )).toEqual({ one: "rfid" });
  });

  it("blocks paste on React reflection fields and keeps unscored Save response", () => {
    const { container } = render(<WeekPage weekId="week-1" root=".." pkg={content} />);
    const reflection = container.querySelector('[data-lp-activity="week-1-exit-ticket"]') as HTMLElement;
    const field = reflection.querySelector("textarea[data-lp-response]") as HTMLTextAreaElement;
    fireEvent.paste(field, { clipboardData: { getData: () => "pasted" } });
    expect(reflection.querySelector("[data-lp-paste-notice]")?.textContent).toMatch(/Paste is disabled/i);
    expect(field.value).toBe("");
    expect(within(reflection).getByRole("button", { name: "Save response" })).toBeTruthy();
  });

  it("builds breadcrumbs for week pages from the content package", () => {
    const items = breadcrumbs({
      page: "week-1",
      section: "week-1",
      root: ".."
    }, content);
    expect(items.map((item) => item.label)).toEqual([
      "Course home",
      "Week 1: Introduction to New and Emerging Digital Technologies"
    ]);
    expect(homeWeeksFromPackage(content)[0].title).toBe("Introduction to New and Emerging Digital Technologies");
  });
});
