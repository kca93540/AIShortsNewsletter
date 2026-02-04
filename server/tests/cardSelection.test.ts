import { describe, expect, it, vi } from "vitest";
import { selectNextCard } from "../src/utils/cardSelection";

describe("selectNextCard", () => {
  it("avoids recently seen cards", () => {
    const cards = [
      { id: "a" },
      { id: "b" },
      { id: "c" },
      { id: "d" }
    ];
    const recent = ["a", "b"];
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = selectNextCard(cards, recent);
    expect(["c", "d"]).toContain(next.id);
    vi.restoreAllMocks();
  });
});
