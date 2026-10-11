export type CellValue = 0 | string; // 0 = empty, string = color code

export type Board = CellValue[][]; // 8x8 grid

export interface Shape {
  id: string;
  pattern: number[][]; // 2D array of 0/1
  color: string;
}

export interface PlacedBlock {
  shape: Shape;
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  currentShapes: (Shape | null)[]; // 3 shapes in tray
  score: number;
  highScore: number;
  combo: number;
  gameOver: boolean;
}