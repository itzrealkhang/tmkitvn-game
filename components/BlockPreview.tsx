"use client";

import { Shape } from "@/lib/types";

interface Props {
  shape: Shape;
  cellSize?: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
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
    <div
      draggable={!disabled}
      onDragStart={onDragStart}
      onTouchStart={onTouchStart}
      onMouseDown={onSelect}
      className={`p-2 rounded-xl transition-all select-none ${
        selected
          ? "bg-white/20 ring-2 ring-white scale-110"
          : "hover:bg-white/10 hover:scale-105"
      } ${
        disabled
          ? "opacity-30 cursor-not-allowed"
          : "cursor-grab active:cursor-grabbing active:scale-95"
      }`}
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
    </div>
  );
}