/**
 * @vitest-environment jsdom
 */
import { validateLearnerSafePackage } from "@learning-platform/content";
import { InteractiveActivity } from "@learning-platform/ui";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import pkg from "../content/l2e-exploring-emerging-digital-technologies/package.json";
import { applyL2eCurriculum } from "./curriculum/apply-runtime";
import type { ContentPackage } from "./curriculum/from-package";
import { configureBundledPackage } from "./curriculum/runtime-weeks";

const content = pkg as ContentPackage;

function expectCorrectVisible() {
  expect(screen.getAllByText("Correct").length).toBeGreaterThan(0);
}

describe("L2E feedback runtime lifecycle (T Level equivalent)", () => {
  beforeEach(() => {
    configureBundledPackage(content);
    document.body.innerHTML = "";
    delete (window as { __lpPackage?: unknown }).__lpPackage;
    delete (window as { __lpLivePackage?: unknown }).__lpLivePackage;
    delete (window as { __lpPublishedCurriculum?: unknown }).__lpPublishedCurriculum;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("resolves curriculum before platform initialisation", async () => {
    const order: string[] = [];
    const loadLatest = vi.fn(async () => {
      order.push("loadLatest");
      return {
        source: "published",
        package: content,
        state: { state: "PUBLISHED" }
      };
    });
    const initialise = vi.fn(async () => {
      order.push("initialise");
    });

    order.push("before-load");
    const loaded = await loadLatest();
    applyL2eCurriculum(loaded as never);
    order.push("applied");
    await initialise();

    expect(order).toEqual(["before-load", "loadLatest", "applied", "initialise"]);
    expect(window.__lpPublishedCurriculum).toBe(true);
  });

  it("learner-safe package validation passes for the L2E content package", () => {
    const result = validateLearnerSafePackage(content);
    expect(result.valid).toBe(true);
  });

  it("InteractiveActivity keeps single-choice Correct feedback across rerender with one mark call", async () => {
    const markBlock = vi.fn(async () => ({
      complete: true,
      correct: true,
      status: "correct",
      feedback: "That is the emerging option.",
      canRetry: true
    }));

    applyL2eCurriculum({
      source: "published",
      package: content,
      state: { state: "PUBLISHED" }
    });

    const activity = {
      id: "week-1-welcome",
      version: "0.1.0",
      blocks: [{
        id: "week-1-welcome-q1",
        type: "single-choice",
        content: {
          questionId: "week-1-welcome-q1",
          prompt: "Which is emerging?",
          options: [
            { id: "a", label: "A common office PC" },
            { id: "b", label: "Quantum computing" }
          ],
          formative: true
        }
      }]
    };

    const platform = { marking: { markBlock } };
    const { rerender } = render(
      <InteractiveActivity activity={activity as never} platform={platform} />
    );

    fireEvent.click(screen.getByRole("radio", { name: /Quantum computing/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    });
    await waitFor(() => {
      expectCorrectVisible();
      expect(markBlock).toHaveBeenCalledTimes(1);
    });

    rerender(<InteractiveActivity activity={activity as never} platform={platform} />);

    expect(markBlock).toHaveBeenCalledTimes(1);
    expectCorrectVisible();
    const firstCall = markBlock.mock.calls.at(0)?.at(0) as
      | { activityKey?: string; activityVersion?: string }
      | undefined;
    expect(firstCall?.activityKey).toBe("week-1-welcome");
    expect(firstCall?.activityVersion).toBe("0.1.0");
  });

  it("InteractiveActivity keeps classification Correct feedback across rerender with one mark call", async () => {
    const markBlock = vi.fn(async () => ({
      complete: true,
      correct: true,
      status: "correct",
      feedback: "Those matches look right.",
      itemResults: [
        { id: "d-iot", correct: true },
        { id: "d-ai", correct: true }
      ],
      canRetry: true
    }));

    applyL2eCurriculum({
      source: "published",
      package: content,
      state: { state: "PUBLISHED" }
    });

    const activity = {
      id: "week-1-digital-technology",
      version: "0.1.0",
      blocks: [{
        id: "week-1-digital-match",
        type: "classification",
        content: {
          questionId: "week-1-digital-match",
          prompt: "Match each example",
          categories: [
            { id: "iot", label: "IoT" },
            { id: "ai", label: "AI" }
          ],
          items: [
            { id: "d-iot", label: "Smart thermostat" },
            { id: "d-ai", label: "Image recognition" }
          ],
          formative: true
        }
      }]
    };

    const platform = { marking: { markBlock } };
    const { rerender, container } = render(
      <InteractiveActivity activity={activity as never} platform={platform} />
    );

    const selects = screen.queryAllByRole("combobox");
    if (selects.length >= 2) {
      fireEvent.change(selects[0]!, { target: { value: "iot" } });
      fireEvent.change(selects[1]!, { target: { value: "ai" } });
    } else {
      fireEvent.click(screen.getByRole("button", { name: "Smart thermostat" }));
      fireEvent.click(screen.getByRole("button", { name: "Place in IoT" }));
      fireEvent.click(screen.getByRole("button", { name: "Image recognition" }));
      fireEvent.click(screen.getByRole("button", { name: "Place in AI" }));
    }

    const check = screen.getByRole("button", { name: /Check/i });
    await act(async () => {
      fireEvent.click(check);
    });

    await waitFor(() => {
      expectCorrectVisible();
      expect(markBlock).toHaveBeenCalledTimes(1);
    });

    rerender(<InteractiveActivity activity={activity as never} platform={platform} />);

    expect(markBlock).toHaveBeenCalledTimes(1);
    expectCorrectVisible();
    expect(container.querySelector("[data-lp-feedback-state='correct']")).toBeTruthy();
    const firstCall = markBlock.mock.calls.at(0)?.at(0) as
      | { activityKey?: string; activityVersion?: string }
      | undefined;
    expect(firstCall?.activityKey).toBe("week-1-digital-technology");
    expect(firstCall?.activityVersion).toBe("0.1.0");
  });

  it("published activity ids used by InteractiveActivity match the applied curriculum package", () => {
    applyL2eCurriculum({
      source: "published",
      package: content,
      state: { state: "PUBLISHED" }
    });
    const applied = window.__lpPackage as ContentPackage;
    expect(applied.activities?.some((a) => a.id === "week-1-digital-technology")).toBe(true);
    expect(applied.activities?.some((a) => a.id === "week-2-starter")).toBe(true);
    expect(applied.activities?.some((a) => a.id === "week-3-starter")).toBe(true);
  });
});
