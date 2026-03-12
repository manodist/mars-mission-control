import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Rocket, XCircle } from 'lucide-react';
import type { GameState, Badge } from '../../types/game';
import { MISSION_LABELS } from '../../constants/gameConstants';

interface GameMissionCompleteOverlayProps {
    state: GameState;
    retryLevel: () => void;
    nextMission: () => void;
    endMission: () => void;
}

// 미션 성공(레벨 클리어) 화면 컴포넌트
// 목표 지점에 도달했을 때 나타나며, 다음 미션으로 넘어가거나 현재 미션을 다시 도전할 수 있게 합니다.
export const GameMissionCompleteOverlay: React.FC<GameMissionCompleteOverlayProps> = ({
    state,
    retryLevel,
    nextMission,
    endMission
}) => {
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    // 배지 우선순위 정의 (높을수록 중요)
    const getBadgePriority = (badgeId: string): number => {
        // 전설/희귀 배지 (최고 우선순위)
        const legendary = ['immortal', 'one_percent', 'phoenix', 'void_walker', 'untouchable', 'time_lord', 'fortune_teller', 'last_breath', 'needle_thread'];
        if (legendary.includes(badgeId)) return 3;

        // 플레이 스타일 배지 (중간 우선순위)
        const playstyle = ['perfectionist', 'berserker', 'ghost', 'zen_master', 'speedrunner', 'clutch_king', 'ice_in_veins', 'thrill_seeker', 'sniper', 'pacifist', 'daredevil', 'tactician', 'hoarder', 'resource_king', 'glass_cannon', 'tank', 'balanced', 'chaos_agent', 'turtle', 'improviser'];
        if (playstyle.includes(badgeId)) return 2;

        // 기본 배지 (낮은 우선순위)
        return 1;
    };

    // 가장 대표적인 배지 3개 선정
    const topBadges = state.earnedBadges
        ? [...state.earnedBadges]
            .sort((a, b) => getBadgePriority(b.id) - getBadgePriority(a.id))
            .slice(0, 3)
        : [];
    return (
        <AnimatePresence>
            {state.missionComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="absolute inset-0 z-[150] flex flex-col items-center justify-center p-4 sm:p-8 py-8 sm:py-12 text-center bg-black/80 backdrop-blur-md overflow-y-auto overflow-x-hidden"
                >
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[min(400px,80vw)] h-[min(400px,80vw)] border-2 border-dashed border-cyan-500/20 rounded-full"
                    />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="z-10 w-full max-w-lg px-2"
                    >
                        <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tighter uppercase glow-text-orange">
                            {MISSION_LABELS[state.difficulty].split('(')[0]}
                        </h2>

                        <div className="text-lg sm:text-2xl font-black text-cyan-400 glow-text-cyan mb-6 uppercase tracking-wider sm:tracking-widest">
                            미션 성공 (임무 완료)
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`relative w-full max-w-[320px] mx-auto mb-6 rounded-2xl overflow-hidden border-2 shadow-[0_0_30px_rgba(34,211,238,0.2)] aspect-video bg-black flex items-center justify-center ${state.difficulty === 'low' ? 'border-white/40 shadow-white/10' :
                                state.difficulty === 'mid' ? 'border-orange-500/40 shadow-orange-500/20' :
                                    'border-cyan-500/30 shadow-cyan-500/20'
                                }`}
                        >
                            {state.difficulty === 'low' && (
                                <img src="/moon.webp" alt="Moon" className="w-full h-full object-cover" />
                            )}
                            {state.difficulty === 'mid' && (
                                <img src="/mars.jpg" alt="Mars" className="w-full h-full object-cover" />
                            )}
                            {state.difficulty === 'high' && (
                                <img src="/station.jpg" alt="Deep Space" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        </motion.div>



                        {/* 뱃지 섹션 */}
                        {/* 뱃지 섹션 */}
                        {state.earnedBadges && state.earnedBadges.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mb-8 w-full max-w-lg bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm"
                            >
                                <div className="text-xs font-bold text-yellow-400 mb-4 tracking-widest uppercase flex items-center justify-center gap-2 border-b border-white/10 pb-2">
                                    <span className="text-base">🏆</span> 대표 뱃지 ({topBadges.length}/{state.earnedBadges.length})
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center items-center">
                                    {topBadges.map((badge) => (
                                        <motion.button
                                            key={badge.id}
                                            whileHover={{ scale: 1.1, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedBadge(badge)}
                                            className="flex flex-col items-center group relative cursor-pointer min-w-[60px]"
                                        >
                                            <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center text-2xl shadow-lg border-2 border-white/20 z-10 relative overflow-hidden`}>
                                                <span className="relative z-10">{badge.icon}</span>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 animate-pulse">
                                    * 뱃지를 클릭하면 특별한 메시지를 볼 수 있어요!
                                </p>
                            </motion.div>
                        )}

                        {/* 뱃지 메시지 팝업 */}
                        <AnimatePresence>
                            {selectedBadge && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                                    onClick={() => setSelectedBadge(null)}
                                >
                                    <motion.div
                                        initial={{ scale: 0.8, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.8, y: 20 }}
                                        className="bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

                                        <div className={`w-16 h-16 mx-auto rounded-full ${selectedBadge.color} flex items-center justify-center text-3xl shadow-lg border-2 border-white/20 mb-4`}>
                                            {selectedBadge.icon}
                                        </div>

                                        <h3 className="text-xl font-black text-yellow-400 mb-2 uppercase tracking-tight">
                                            {selectedBadge.name}
                                        </h3>

                                        <p className="text-sm text-gray-300 mb-6 font-medium">
                                            {selectedBadge.description}
                                        </p>

                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 relative">
                                            <div className="absolute -top-3 left-4 text-3xl text-yellow-500/50 font-serif">"</div>
                                            <p className="text-white text-base font-medium leading-relaxed italic relative z-10">
                                                {selectedBadge.message || "당신의 멋진 비행이 우리에게 큰 영감을 주었어요!"}
                                            </p>
                                            <div className="absolute -bottom-3 right-4 text-3xl text-yellow-500/50 font-serif rotate-180">"</div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedBadge(null)}
                                            className="mt-6 px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors text-sm"
                                        >
                                            닫기
                                        </button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={retryLevel}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl border border-slate-500/50 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                                <RefreshCw className="w-4 h-4" /> 지금 단계 재도전
                            </motion.button>

                            {state.difficulty !== 'high' && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={nextMission}
                                    className="px-4 sm:px-6 py-3 sm:py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                                >
                                    <Rocket className="w-5 h-5 -rotate-45" /> 다음 미션 도전
                                </motion.button>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={endMission}
                                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-900/40 hover:bg-red-900/60 text-red-100 font-bold rounded-xl border border-red-500/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                            >
                                <XCircle className="w-4 h-4" /> 탐사 마치기
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
