import { describe, expect, it } from "vitest";
import { FLAT_EQ } from "../engine/equalizer";
import { eqCurvePaths, eqCurveY } from "./equalizerCurve";

describe("eqCurvePaths", () => {
  it("maps the dB range onto the plot height", () => {
    expect(eqCurveY(12, 300)).toBe(0);
    expect(eqCurveY(0, 300)).toBe(150);
    expect(eqCurveY(-12, 300)).toBe(300);
  });

  it("draws a flat curve along the centre line, one band per column", () => {
    const { line, area } = eqCurvePaths(FLAT_EQ, 300);
    expect(line.startsWith("M50 150")).toBe(true);
    expect(line.endsWith("950 150")).toBe(true);
    // every point and control point stays on the 0 dB line
    const numbers = line.match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(numbers).toHaveLength((1 + 9 * 3) * 2);
    expect(numbers.filter((_, i) => i % 2 === 1).every((y) => y === 150)).toBe(
      true,
    );
    expect(area).toBe(`${line} L950 300 L50 300 Z`);
  });

  it("passes through each band's gain", () => {
    const gains = [12, 0, -12, 0, 6, 0, 0, 0, 0, 0];
    const { line } = eqCurvePaths(gains, 240);
    expect(line.startsWith("M50 0")).toBe(true);
    expect(line).toContain(" 250 240");
    expect(line).toContain(" 450 60");
  });

  it("returns nothing for no bands", () => {
    expect(eqCurvePaths([], 300)).toEqual({ line: "", area: "" });
  });
});
