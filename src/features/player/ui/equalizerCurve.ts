import { EQ_MAX_DB, EQ_MIN_DB } from "../engine/equalizer";

// the curve is drawn in a box this wide and stretched to the plot, so band x never depends on layout
export const EQ_CURVE_WIDTH = 1000;

const round = (n: number) => Math.round(n * 10) / 10;

export function eqCurveY(db: number, height: number): number {
  return ((EQ_MAX_DB - db) / (EQ_MAX_DB - EQ_MIN_DB)) * height;
}

// a smooth line through every band gain (each band centred in its own column),
// plus the same line closed along the bottom edge for the fill under it
export function eqCurvePaths(
  gains: number[],
  height: number,
): { line: string; area: string } {
  if (gains.length === 0) return { line: "", area: "" };

  const step = EQ_CURVE_WIDTH / gains.length;
  const points = gains.map(
    (db, i) => [(i + 0.5) * step, eqCurveY(db, height)] as const,
  );

  let line = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    // Catmull-Rom through the neighbours, written as a cubic bezier
    const before = points[i - 1] ?? points[i];
    const from = points[i];
    const to = points[i + 1];
    const after = points[i + 2] ?? to;
    line +=
      ` C${round(from[0] + (to[0] - before[0]) / 6)} ${round(from[1] + (to[1] - before[1]) / 6)}` +
      ` ${round(to[0] - (after[0] - from[0]) / 6)} ${round(to[1] - (after[1] - from[1]) / 6)}` +
      ` ${round(to[0])} ${round(to[1])}`;
  }

  const first = round(points[0][0]);
  const last = round(points[points.length - 1][0]);
  return { line, area: `${line} L${last} ${height} L${first} ${height} Z` };
}
