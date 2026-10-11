"use client";

import { Shape } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  shape: Shape;
  cellSize?: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  onDragStart?: (e: any) => void;   // ← Đổi React.DragEvent → any
  onTouchStart?: (e: any) => void;  // ← Đổi React.TouchEvent → any
  index?: number;
}

export default function BlockPreview({
  shape,
  cellSize = 32,
  selected = false,
  disabled = false,
  onSelect,
  onDragStart,
  onTouchStart,
  index,
}: Props) {
  const rows = shape.pattern.length;
  const cols = shape.pattern[0].length;

  return (
    <motion.div
      draggable={!disabled}
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
      onMouseDown={onSelect}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`p-2 rounded-xl transition-all select-none ${
        selected ? "bg-white/20 ring-2 ring-white" : "hover:bg-white/10"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
      data-shape-index={index}
      style={{ touchAction: "none" }}
    >
      <div
        className="grid gap-[3px] pointer-events-none"
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