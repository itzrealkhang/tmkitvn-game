"use client";

import { useRef, useState, useEffect } from "react";
import { Board as BoardType, Shape } from "@/lib/types";
import { BOARD_SIZE } from "@/lib/gameLogic";
import { motion } from "framer-motion";

interface Props {
  board: BoardType;
  selectedShape: Shape | null;
  onPlace: (row: number, col: number) => void;
  clearingLines: { rows: number[]; cols: number[] };
  onCellHover?: (row: number, col: number) => void;
  dragPreview?: { row: number; col: number } | null;
}

export default function Board({
  board,
  selectedShape,
  onPlace,
  clearingLines,
  onCellHover,
  dragPreview,
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(40);
  const [previewPos, setPreviewPos] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    const calcSize = () => {
      const vw = Math.min(window.innerWidth - 32, 480);
      const size = Math.floor(vw / BOARD_SIZE) - 4;
      setCellSize(Math.max(28, Math.min(size, 52)));
    };
    calcSize();
    window.addEventListener("resize", calcSize);
    return () => window.removeEventListener("resize", calcSize);
  }, []);

  // Sync preview với dragPreview từ ngoài
  useEffect(() => {
    if (dragPreview) {
      setPreviewPos(dragPreview);
    } else {
      setPreviewPos(null);
    }
  }, [dragPreview]);

  const isClearing = (row: number, col: number) =>
    clearingLines.rows.includes(row) || clearingLines.cols.includes(col);

  const isPreview = (row: number, col: number) => {
    if (!selectedShape || !previewPos) return false;
    const { row: pr, col: pc } = previewPos;
    const pattern = selectedShape.pattern;
    const r = row - pr;
    const c = col - pc;
    if (r < 0 || r >= pattern.length) return false;
    if (c < 0 || c >= pattern[0].length) return false;
    return pattern[r][c] === 1;
  };

  const getPreviewColor = () => {
    if (!selectedShape) return "";
    return selectedShape.color;
  };

  // Mouse hover on cell
  const handleCellHover = (r: number, c: number) => {
    if (selectedShape && onCellHover) {
      onCellHover(r, c);
    }
  };

  return (
    <div
      ref={boardRef}
      className="relative p-3 rounded-2xl bg-[#1a1a2e] border border-white/10 shadow-2xl"
      style={{
        boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
      data-board="true"
    >
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const clearing = isClearing(r, c);
            const preview = isPreview(r, c);
            const filled = cell !== 0;

            return (
              <motion.div
                key={`${r}-${c}`}
                animate={
                  clearing
                    ? { scale: [1, 1.2, 0], opacity: [1, 1, 0] }
                    : { scale: 1, opacity: 1 }
                }
                transition={{ duration: 0.4 }}
                onClick={() => onPlace(r, c)}
                onMouseEnter={() => handleCellHover(r, c)}
                className="rounded-md cursor-pointer hover:brightness-110"
                data-row={r}
                data-col={c}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: filled
                    ? (cell as string)
                    : preview
                    ? getPreviewColor()
                    : "rgba(255,255,255,0.03)",
                  opacity: preview && !filled ? 0.4 : 1,
                  boxShadow: filled
                    ? "inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)"
                    : preview
                    ? "inset 0 2px 0 rgba(255,255,255,0.15)"
                    : "inset 0 1px 2px rgba(0,0,0,0.3)",
                  border: filled ? "none" : "1px solid rgba(255,255,255,0.03)",
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}