import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, RefreshCw } from 'lucide-react';
import type { GameState } from '../../types/game';

interface GameGameOverOverlayProps {
    state: GameState;
    relaunch: () => void;
    getDifficultyLabel: (diff: 'low' | 'mid' | 'high') => string;
}

// 게임 오버 화면 컴포넌트
// 플레이어가 사망했을 때 나타나며, 사망 원인과 최종 점수를 보여주고 재시작을 유도합니다.
export const GameGameOverOverlay: React.FC<GameGameOverOverlayProps> = ({ state, relaunch, getDifficultyLabel }) => {
    return (
        <AnimatePresence>
            {state.gameOver && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-[60] bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 text-center overflow-hidden"
                >
                    <XCircle className="w-14 h-14 sm:w-20 sm:h-20 text-red-500 mb-4 sm:mb-6 animate-pulse" />
                    <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 uppercase tracking-tighter">통신 단절 (교신 불가)</h2>
                    <p className="text-red-300 font-bold mb-6 sm:mb-8 uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm px-2">
                        {state.gameOverReason === 'fuel' ? '에너지 고갈로 인한 우주 표류' :
                            state.gameOverReason === 'fireball' ? '화염 운석 충돌로 인한 기체 폭발' :
                                '기체 손상으로 인한 통신 시스템 단절'}
                    </p>

                    <div className="terminal-panel p-4 sm:p-6 w-full max-w-xs mb-8 sm:mb-10 bg-black/40 border-red-500/20">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">최종 획득 경험치</span>
                            <span className="text-2xl font-black text-white">{state.score.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">총 이동 거리</span>
                            <span className="text-lg font-black text-red-400">{(state.distance / 10).toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">선택 미션 등급</span>
                            <span className="text-xs font-black text-orange-400 uppercase">{getDifficultyLabel(state.difficulty)}</span>
                        </div>
                    </div>

                    <button
                        onClick={relaunch}
                        className="px-8 sm:px-12 py-3 sm:py-4 bg-white text-black font-black uppercase text-xs sm:text-sm tracking-widest rounded-lg hover:bg-gray-200 transition-all flex items-center gap-3"
                    >
                        <RefreshCw className="w-5 h-5" /> 다시 출격하기
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
