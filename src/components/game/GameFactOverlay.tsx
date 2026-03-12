import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Rocket } from 'lucide-react';
import type { GameState } from '../../types/game';

interface GameFactOverlayProps {
    state: GameState;
    startGame: () => void;
}

// 로딩 화면 중 우주 상식(명언)을 보여주는 오버레이
// 게임 시작 전 짧은 대기 시간 동안 플레이어에게 흥미로운 우주 관련 정보를 제공합니다.
export const GameFactOverlay: React.FC<GameFactOverlayProps> = ({ state, startGame }) => {
    return (
        <AnimatePresence>
            {state.showFactScreen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="absolute inset-0 z-[70] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                    <Lightbulb className="w-16 h-16 text-yellow-400 mb-6 animate-pulse" />
                    <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-widest border-b-2 border-yellow-500/30 pb-2">우주 상식</h2>

                    <div className="max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 mb-12 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                        <p className="text-lg md:text-xl text-gray-200 font-medium leading-relaxed break-keep mb-6">
                            "{state.currentFact?.quote}"
                        </p>
                        <div className="border-t border-white/10 pt-6 mt-4">
                            <p className="text-sm md:text-base text-cyan-300 font-medium leading-relaxed break-keep">
                                💡 {state.currentFact?.insight}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="px-12 py-5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 backdrop-blur-xl border-2 border-cyan-400/50 text-white font-black uppercase text-base tracking-widest rounded-xl transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.6),0_0_80px_rgba(34,211,238,0.3)] hover:border-cyan-300 active:scale-95 flex items-center gap-3 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Rocket className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 group-hover:rotate-12 transition-all drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] -rotate-45" />
                        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-200">출격 확정</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
