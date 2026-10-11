"use client";

import { motion } from "framer-motion";
import { RotateCcw, Trophy } from "lucide-react";

interface Props {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export default function GameOver({ score, highScore, onRestart }: Props) {
  const isNewRecord = score >= highScore && score > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="glass rounded-3xl p-8 max-w-sm w-full text-center"
      >
        {isNewRecord && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mb-4"
          >
            <Trophy className="w-16 h-16 mx-auto text-yellow-400" />
          </motion.div>
        )}

        <h2 className="text-3xl font-bold mb-2 gradient-text">
          {isNewRecord ? "Kỷ lục mới!" : "Game Over"}
        </h2>

        <p className="text-gray-400 mb-6">Không còn nước đi nào</p>

        <div className="space-y-4 mb-6">
          <div className="glass rounded-2xl p-4">
            <div className="text-sm text-gray-400 mb-1">Điểm của bạn</div>
            <div className="text-4xl font-bold gradient-text">{score}</div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-sm text-gray-400 mb-1">Kỷ lục</div>
            <div className="text-2xl font-bold text-yellow-400">
              {Math.max(score, highScore)}
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-2xl font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          <RotateCcw size={20} />
          Chơi lại
        </button>
      </motion.div>
    </motion.div>
  );
}