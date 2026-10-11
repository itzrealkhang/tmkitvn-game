"use client";

import { useState, useEffect, useCallback } from "react";
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

  // ═══ INIT GAME ═══
  const initGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setShapes(getRandomShapes(3));
    setSelectedIdx(null);
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setClearingLines({ rows: [], cols: [] });
  }, []);

  // Load on mount
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

  // ═══ HANDLE CELL CLICK ═══
  const handleCellClick = (row: number, col: number) => {
    if (selectedIdx === null || gameOver) return;

    const shape = shapes[selectedIdx];
    if (!shape) return;

    if (!canPlaceShape(board, shape, row, col)) {
      return;
    }

    // Place shape
    let newBoard = placeShape(board, shape, row, col);

    // Find full lines
    const { rows, cols } = findFullLines(newBoard);

    // Update board immediately
    setBoard(newBoard);

    // Clear lines with animation
    if (rows.length > 0 || cols.length > 0) {
      setClearingLines({ rows, cols });

      // Calculate score
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

    // Remove used shape
    const newShapes = [...shapes];
    newShapes[selectedIdx] = null;

    // Refill if all used
    if (newShapes.every((s) => s === null)) {
      setShapes(getRandomShapes(3));
    } else {
      setShapes(newShapes);
    }

    setSelectedIdx(null);
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

        {/* COMBO */}
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
      <div className="relative mb-4">
        <Board
          board={board}
          selectedShape={selectedIdx !== null ? shapes[selectedIdx] : null}
          onPlace={handleCellClick}
          clearingLines={clearingLines}
        />

        {/* FLOATING SCORE */}
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
            Chọn khối để đặt
          </div>
          <div className="flex items-center justify-around min-h-[80px]">
            {shapes.map((shape, idx) => (
              <div
                key={idx}
                className={`flex-1 flex items-center justify-center transition-all ${
                  selectedIdx === idx ? "scale-110" : ""
                }`}
              >
                {shape ? (
                  <BlockPreview
                    shape={shape}
                    cellSize={22}
                    selected={selectedIdx === idx}
                    onClick={() => setSelectedIdx(idx)}
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
          ? "👇 Chọn khối bên trên để đặt"
          : "👇 Chạm vào ô trống trên bàn để đặt khối"}
      </div>

      {/* RESTART BUTTON */}
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

      {/* FOOTER */}
      <div className="mt-8 text-xs text-gray-600 text-center">
        Made with ❤️ by TMK
      </div>
    </main>
  );
}