"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Zap } from "lucide-react";
import { Board as BoardType, Shape } from "@/lib/types";
import {
  createEmptyBoard,
  canPlaceShape,
  placeShape,
  findFullLines,
  clearLines,
  canPlaceAnyShape,
  calculateScore,
  BOARD_SIZE,
} from "@/lib/gameLogic";
import { getRandomShapes } from "@/lib/shapes";
import Board from "@/components/Board";
import BlockPreview from "@/components/BlockPreview";
import GameOver from "@/components/GameOver";

export default function Home() {
  const [board, setBoard] = useState<BoardType>(createEmptyBoard);
  const [shapes, setShapes] = useState<(Shape | null)[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [clearingLines, setClearingLines] = useState<{
    rows: number[];
    cols: number[];
  }>({ rows: [], cols: [] });
  const [floatingScore, setFloatingScore] = useState<{
    value: number;
    id: number;
  } | null>(null);

  // Drag state
  const [dragPreview, setDragPreview] = useState<{ row: number; col: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);

  // ═══ INIT GAME ═══
  const initGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setShapes(getRandomShapes(3));
    setSelectedIdx(null);
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setClearingLines({ rows: [], cols: [] });
    setDragPreview(null);
    setIsDragging(false);
    setTouchPos(null);
  }, []);

  useEffect(() => {
    const savedHigh = localStorage.getItem("blockBlastHighScore");
    if (savedHigh) setHighScore(parseInt(savedHigh));
    initGame();
  }, [initGame]);

  // ═══ CHECK GAME OVER ═══
  useEffect(() => {
    if (shapes.length === 0) return;
    const hasShape = shapes.some((s) => s !== null);
    if (!hasShape) return;

    if (!canPlaceAnyShape(board, shapes)) {
      setTimeout(() => setGameOver(true), 500);
    }
  }, [board, shapes]);

  // ═══ HELPER: Lấy cell từ tọa độ screen ═══
  const getCellFromPoint = (x: number, y: number): { row: number; col: number } | null => {
    const boardEl = document.querySelector('[data-board="true"]');
    if (!boardEl) return null;

    const rect = boardEl.getBoundingClientRect();
    const padding = 12; // p-3 = 12px

    const relX = x - rect.left - padding;
    const relY = y - rect.top - padding;

    // Cell size tính từ board
    const cellWithGap = (rect.width - padding * 2) / BOARD_SIZE;
    const cellSize = cellWithGap - 1; // gap-1 = 4px

    const col = Math.floor(relX / cellWithGap);
    const row = Math.floor(relY / cellWithGap);

    if (row < 0 || row >= BOARD_SIZE) return null;
    if (col < 0 || col >= BOARD_SIZE) return null;

    return { row, col };
  };

  // ═══ HANDLE PLACE ═══
  const handlePlace = (row: number, col: number, shapeIdx?: number) => {
    const idx = shapeIdx !== undefined ? shapeIdx : selectedIdx;
    if (idx === null || gameOver) return;

    const shape = shapes[idx];
    if (!shape) return;

    if (!canPlaceShape(board, shape, row, col)) {
      return;
    }

    let newBoard = placeShape(board, shape, row, col);
    const { rows, cols } = findFullLines(newBoard);

    setBoard(newBoard);

    if (rows.length > 0 || cols.length > 0) {
      setClearingLines({ rows, cols });

      const newCombo = combo + 1;
      const earned = calculateScore(rows.length, cols.length, newCombo);

      setTimeout(() => {
        newBoard = clearLines(newBoard, rows, cols);
        setBoard(newBoard);
        setClearingLines({ rows: [], cols: [] });

        setScore((s) => {
          const newScore = s + earned;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("blockBlastHighScore", String(newScore));
          }
          return newScore;
        });

        setFloatingScore({ value: earned, id: Date.now() });
        setTimeout(() => setFloatingScore(null), 1000);
      }, 400);

      setCombo(newCombo);
    } else {
      setCombo(0);
    }

    const newShapes = [...shapes];
    newShapes[idx] = null;

    if (newShapes.every((s) => s === null)) {
      setShapes(getRandomShapes(3));
    } else {
      setShapes(newShapes);
    }

    setSelectedIdx(null);
    setDragPreview(null);
    setIsDragging(false);
  };

  // ═══ MOUSE DRAG (HTML5) ═══
  const handleDragStart = (idx: number) => (e: React.DragEvent) => {
    setSelectedIdx(idx);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));

    // Custom drag image (ẩn)
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  // Track mouse move over board
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const pos = getCellFromPoint(e.clientX, e.clientY);
    if (pos) setDragPreview(pos);
    else setDragPreview(null);
  };

  const handleDragLeave = () => {
    setDragPreview(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const idxStr = e.dataTransfer.getData("text/plain");
    const idx = parseInt(idxStr);

    const pos = getCellFromPoint(e.clientX, e.clientY);
    if (pos && !isNaN(idx)) {
      handlePlace(pos.row, pos.col, idx);
    }

    setDragPreview(null);
    setIsDragging(false);
  };

  // ═══ TOUCH DRAG (MOBILE) ═══
  const handleTouchStart = (idx: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    setSelectedIdx(idx);
    setIsDragging(true);

    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });

    const pos = getCellFromPoint(touch.clientX, touch.clientY);
    setDragPreview(pos);
  };

  // Global touch move
  useEffect(() => {
    if (!isDragging) return;

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setTouchPos({ x: touch.clientX, y: touch.clientY });

      const pos = getCellFromPoint(touch.clientX, touch.clientY);
      setDragPreview(pos);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchPos) {
        const pos = getCellFromPoint(touchPos.x, touchPos.y);
        if (pos && selectedIdx !== null) {
          handlePlace(pos.row, pos.col, selectedIdx);
        }
      }

      setDragPreview(null);
      setIsDragging(false);
      setTouchPos(null);
    };

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, touchPos, selectedIdx]);

  // ═══ CLICK CELL (Fallback) ═══
  const handleCellClick = (row: number, col: number) => {
    if (isDragging) return;
    handlePlace(row, col);
  };

  // ═══ RENDER ═══
  return (
    <main className="min-h-screen flex flex-col items-center py-4 px-4">
      {/* HEADER */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between">
          <div className="glass rounded-2xl px-4 py-2">
            <div className="text-xs text-gray-400">Điểm</div>
            <div className="text-2xl font-bold gradient-text">{score}</div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold gradient-text">
            BLOCK BLAST
          </h1>

          <div className="glass rounded-2xl px-4 py-2">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Trophy size={12} /> Kỷ lục
            </div>
            <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
          </div>
        </div>

        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 text-center"
            >
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1">
                <Zap size={16} className="text-yellow-400" />
                <span className="font-bold text-yellow-400">
                  COMBO x{combo}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOARD */}
      <div
        className="relative mb-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Board
          board={board}
          selectedShape={selectedIdx !== null ? shapes[selectedIdx] : null}
          onPlace={handleCellClick}
          clearingLines={clearingLines}
          dragPreview={dragPreview}
        />

        <AnimatePresence>
          {floatingScore && (
            <motion.div
              key={floatingScore.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -80, scale: 1.5 }}
              exit={{ opacity: 0, y: -120 }}
              transition={{ duration: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="text-4xl font-bold text-yellow-400 drop-shadow-lg">
                +{floatingScore.value}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SHAPE TRAY */}
      <div className="w-full max-w-lg mb-4">
        <div className="glass rounded-2xl p-3">
          <div className="text-xs text-gray-400 mb-2 text-center">
            Kéo khối vào bàn hoặc chọn rồi chạm ô
          </div>
          <div className="flex items-center justify-around min-h-[80px]">
            {shapes.map((shape, idx) => (
              <div
                key={idx}
                className={`flex-1 flex items-center justify-center transition-all ${
                  selectedIdx === idx ? "scale-110" : ""
                } ${isDragging && selectedIdx === idx ? "opacity-30" : ""}`}
              >
                {shape ? (
                  <BlockPreview
                    shape={shape}
                    cellSize={22}
                    selected={selectedIdx === idx}
                    onSelect={() => setSelectedIdx(idx)}
                    onDragStart={handleDragStart(idx)}
                    onTouchStart={handleTouchStart(idx)}
                    index={idx}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HINT */}
      <div className="text-center text-xs text-gray-500 mb-4">
        {selectedIdx === null
          ? "🖱️ Kéo khối vào bàn chơi"
          : "👇 Chạm vào ô trống hoặc thả khối"}
      </div>

      {/* RESTART */}
      <button
        onClick={initGame}
        className="glass rounded-full px-6 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition-all"
      >
        <RotateCcw size={14} />
        Chơi lại
      </button>

      {/* GAME OVER */}
      <AnimatePresence>
        {gameOver && (
          <GameOver
            score={score}
            highScore={highScore}
            onRestart={initGame}
          />
        )}
      </AnimatePresence>

      {/* Floating shape khi kéo trên mobile */}
      {isDragging && selectedIdx !== null && touchPos && shapes[selectedIdx] && (
        <div
          className="fixed pointer-events-none z-50 opacity-70"
          style={{
            left: touchPos.x - 40,
            top: touchPos.y - 40,
            transform: "translate(-50%, -50%)",
          }}
        >
          <BlockPreview
            shape={shapes[selectedIdx]!}
            cellSize={28}
            disabled
          />
        </div>
      )}
    </main>
  );
}