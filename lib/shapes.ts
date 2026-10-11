import { Shape } from "./types";

// ═══════════════════════════════════════════════════
//  COLORS
// ═══════════════════════════════════════════════════

export const COLORS = {
  red:    "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green:  "#22c55e",
  cyan:   "#06b6d4",
  blue:   "#3b82f6",
  purple: "#a855f7",
  pink:   "#ec4899",
};

const COLOR_LIST = Object.values(COLORS);

// ═══════════════════════════════════════════════════
//  SHAPES
// ═══════════════════════════════════════════════════

const PATTERNS: number[][][] = [
  // 1x1
  [[1]],

  // 1x2
  [[1, 1]],

  // 2x1
  [[1], [1]],

  // 1x3
  [[1, 1, 1]],

  // 3x1
  [[1], [1], [1]],

  // 1x4
  [[1, 1, 1, 1]],

  // 4x1
  [[1], [1], [1], [1]],

  // 2x2 square
  [[1, 1], [1, 1]],

  // 2x3
  [[1, 1, 1], [1, 1, 1]],

  // 3x2
  [[1, 1], [1, 1], [1, 1]],

  // 3x3 square
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],

  // L-shape small (2x2)
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1], [1, 0]],
  [[1, 1], [0, 1]],

  // L-shape 3x3
  [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
  [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1], [0, 0, 1]],

  // S/Z shapes
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],

  // T-shape
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 1], [1, 0]],
  [[0, 1], [1, 1], [0, 1]],
];

// ═══════════════════════════════════════════════════
//  GENERATE RANDOM SHAPE
// ═══════════════════════════════════════════════════

let shapeIdCounter = 0;

export function getRandomShape(): Shape {
  const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  const color = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];

  return {
    id: `shape_${shapeIdCounter++}_${Date.now()}`,
    pattern,
    color,
  };
}

export function getRandomShapes(count: number): Shape[] {
  return Array.from({ length: count }, () => getRandomShape());
}