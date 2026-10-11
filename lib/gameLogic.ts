import { Board, Shape } from "./types";

export const BOARD_SIZE = 8;

// ═══════════════════════════════════════════════════
//  CREATE EMPTY BOARD
// ═══════════════════════════════════════════════════
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0)
  );
}

// ═══════════════════════════════════════════════════
//  CHECK IF SHAPE FITS AT POSITION
// ═══════════════════════════════════════════════════
export function canPlaceShape(
  board: Board,
  shape: Shape,
  row: number,
  col: number
): boolean {
  const pattern = shape.pattern;
  const rows = pattern.length;
  const cols = pattern[0].length;

  // Check bounds
  if (row < 0 || col < 0) return false;
  if (row + rows > BOARD_SIZE) return false;
  if (col + cols > BOARD_SIZE) return false;

  // Check each cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (pattern[r][c] === 1) {
        if (board[row + r][col + c] !== 0) {
          return false;
        }
      }
    }
  }

  return true;
}

// ═══════════════════════════════════════════════════
//  PLACE SHAPE ON BOARD
// ═══════════════════════════════════════════════════
export function placeShape(
  board: Board,
  shape: Shape,
  row: number,
  col: number
): Board {
  const newBoard = board.map((r) => [...r]);
  const pattern = shape.pattern;

  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      if (pattern[r][c] === 1) {
        newBoard[row + r][col + c] = shape.color;
      }
    }
  }

  return newBoard;
}

// ═══════════════════════════════════════════════════
//  FIND FULL ROWS AND COLUMNS
// ═══════════════════════════════════════════════════
export function findFullLines(board: Board): {
  rows: number[];
  cols: number[];
} {
  const rows: number[] = [];
  const cols: number[] = [];

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((cell) => cell !== 0)) {
      rows.push(r);
    }
  }

  // Check cols
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) cols.push(c);
  }

  return { rows, cols };
}

// ═══════════════════════════════════════════════════
//  CLEAR FULL LINES
// ═══════════════════════════════════════════════════
export function clearLines(board: Board, rows: number[], cols: number[]): Board {
  const newBoard = board.map((r) => [...r]);

  rows.forEach((r) => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[r][c] = 0;
    }
  });

  cols.forEach((c) => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][c] = 0;
    }
  });

  return newBoard;
}

// ═══════════════════════════════════════════════════
//  CHECK IF ANY SHAPE CAN BE PLACED
// ═══════════════════════════════════════════════════
export function canPlaceAnyShape(board: Board, shapes: (Shape | null)[]): boolean {
  for (const shape of shapes) {
    if (!shape) continue;

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlaceShape(board, shape, r, c)) {
          return true;
        }
      }
    }
  }

  return false;
}

// ═══════════════════════════════════════════════════
//  CALCULATE SCORE
// ═══════════════════════════════════════════════════
export function calculateScore(
  rowsCleared: number,
  colsCleared: number,
  combo: number
): number {
  const lines = rowsCleared + colsCleared;
  if (lines === 0) return 0;

  // Base score per line
  let base = lines * 10;

  // Bonus for multi-line
  if (lines === 2) base += 20;
  if (lines === 3) base += 60;
  if (lines >= 4) base += 150;

  // Combo multiplier
  const comboBonus = combo > 1 ? (combo - 1) * 20 : 0;

  return base + comboBonus;
}