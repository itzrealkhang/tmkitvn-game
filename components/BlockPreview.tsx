"use client";

import { Shape } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  shape: Shape;
  cellSize?: number;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export default function BlockPreview({
  shape,
  cellSize = 32,
  onClick,
  selected = false,
  disabled = false,
}: Props) {
  const rows = shape.pattern.length;
  const cols = shape.pattern[0].length;

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`p-2 rounded-xl transition-all ${
        selected ? "bg-white/20 ring-2 ring-white" : "hover:bg-white/10"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        }}
      >
        {shape.pattern.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: cellSize,
                height: cellSize,
                background: cell === 1 ? shape.color : "transparent",
                borderRadius: 6,
                boxShadow:
                  cell === 1
                    ? "inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.2)"
                    : "none",
              }}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}