"use client";

interface BlockProps {
  color: string;
  size?: number;
  preview?: boolean;
}

export default function Block({ color, size = 40, preview = false }: BlockProps) {
  return (
    <div
      className={`cell-base ${!preview ? "cell-filled" : "cell-preview"}`}
      style={{
        width: size,
        height: size,
        background: color,
      }}
    />
  );
}