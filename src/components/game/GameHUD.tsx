import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldAlert, Gauge, Magnet, Sparkles, Rocket, Zap, AlertTriangle } from 'lucide-react';
import type { GameState } from '../../types/game';
import { getHighDifficultyMissionLevel } from '../../constants/gameConstants';

interface GameHUDProps {
    state: GameState;
}

// 🚀 성능 최적화: React.memo 적용
// HUD는 점수, 연료 등이 매 프레임 변할 수 있지만, 프레임 레이트 안정화를 위해 메모이제이션합니다.
export const GameHUD = React.memo(({ state }: GameHUDProps) => {
    const isHighDifficulty = state.difficulty === 'high';
    const totalDistance = state.distance + state.distanceToTarget;
    const progress = !isHighDifficulty && state.distanceToTarget < Infinity
        ? (state.distance / totalDistance) * 100
        : 0;

    // 특급 모드 위협 레벨 계산 (spawnObstacle과 동일한 로직)
    // Phase1(0~10분): S-Curve 점진 상승 / Phase2(10분+): 비조화 사인파 동적 변동 (Lv4~10)
    const threatLevel = isHighDifficulty ? getHighDifficultyMissionLevel(state.time) : 0;

    // 위협 레벨별 글로우 색상 (1~3: 초록, 4~6: 주황, 7~10: 빨강)
    const threatGlow = threatLevel <= 3
        ? 'rgba(34,197,94,0.6)'
        : threatLevel <= 6
            ? 'rgba(249,115,22,0.6)'
            : 'rgba(239,68,68,0.8)';

    // 경과 시간 포맷 (MM:SS)
    const elapsedMin = Math.floor(state.time / 60);
    const elapsedSec = Math.floor(state.time % 60);
    const elapsedStr = `${elapsedMin}:${String(elapsedSec).padStart(2, '0')}`;

    const isInfinite = !isHighDifficulty && state.distanceToTarget === Infinity;

    return (
        <div className="absolute top-0 left-0 right-0 z-50 px-2 pt-0 pb-2 sm:px-4 sm:pb-4 md:px-6 md:pb-6 pointer-events-none">
            <div className="max-w-7xl mx-auto flex flex-col gap-2 md:gap-4">
                {/* 상단 바: 특급 → 위협 레벨 바 / 초급·중급 → 미션 진행률 바 */}
                {isHighDifficulty ? (
                    // 특급 모드: 위협 레벨 표시 바
                    <div className="flex items-center gap-2 sm:gap-3 px-1 mb-2 w-full">
                        <div className="flex items-center gap-1 shrink-0">
                            <AlertTriangle className={`w-3 h-3 sm:w-4 sm:h-4 ${threatLevel >= 7 ? 'text-red-400 animate-pulse' : threatLevel >= 4 ? 'text-orange-400' : 'text-green-400'}`} />
                            <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">위협</span>
                        </div>

                        {/* 10칸 위협 레벨 세그먼트 바 */}
                        <div className="flex-1 flex gap-0.5 h-2 sm:h-2.5">
                            {[...Array(10)].map((_, i) => {
                                const filled = i < threatLevel;
                                const segColor = i < 3
                                    ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.8)]'
                                    : i < 6
                                        ? 'bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.8)]'
                                        : 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.8)]';
                                return (
                                    <motion.div
                                        key={i}
                                        className={`flex-1 rounded-sm transition-all duration-300 ${filled ? segColor : 'bg-white/10'}`}
                                        animate={filled && i === threatLevel - 1 ? { opacity: [1, 0.7, 1] } : {}}
                                        transition={{ duration: 1.2, repeat: Infinity }}
                                    />
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <span
                                className="text-[9px] sm:text-[11px] font-black tabular-nums"
                                style={{ color: `rgb(${threatLevel <= 3 ? '74,222,128' : threatLevel <= 6 ? '251,146,60' : '248,113,113'})`, textShadow: `0 0 8px ${threatGlow}` }}
                            >
                                Lv.{threatLevel}
                            </span>
                            {threatLevel >= 6 && (
                                <motion.span
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="text-[7px] sm:text-[8px] font-black text-red-400 uppercase tracking-wide"
                                >
                                    {threatLevel >= 6 && threatLevel < 8 ? '⚫블랙홀' : '☠ 극위험'}
                                </motion.span>
                            )}
                        </div>
                    </div>
                ) : !isInfinite ? (
                    // 초급·중급 모드: 미션 진행률 바
                    <div className="flex items-center gap-2 sm:gap-4 px-1 mb-2 w-full">
                        <div className="relative shrink-0">
                            <img src="/earth.jpg" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] object-cover" alt="Earth" />
                        </div>

                        <div className="flex-1 h-1 sm:h-1.5 bg-gray-800 rounded-full relative overflow-hidden border border-white/5 shadow-inner">
                            {/* 경로 표시 눈금 */}
                            <div className="absolute inset-0 flex justify-between px-2 opacity-10">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="w-0.5 h-full bg-white" />
                                ))}
                            </div>
                            {/* 진행률 채우기 애니메이션 */}
                            <motion.div
                                className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                                style={{ willChange: 'width' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 1 }}
                            />
                            {/* 현재 위치 로켓 아이콘 */}
                            <motion.div
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                                style={{ willChange: 'left' }}
                                animate={{ left: `${progress}%` }}
                                transition={{ type: 'spring', bounce: 0, duration: 1 }}
                            >
                                <Rocket className="w-3 h-3 sm:w-4 sm:h-4 text-white rotate-90 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                            </motion.div>
                        </div>

                        <div className="relative shrink-0">
                            <img
                                src={state.difficulty === 'low' ? "/moon.webp" : "/mars.jpg"}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] object-cover"
                                alt="Target"
                            />
                        </div>
                    </div>
                ) : null}

                {/* 자동항법 표시기 (최상단 밀착 배치) */}
                {state.isAutoPilot && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ willChange: 'transform, opacity' }}
                            className="flex items-center gap-1.5 px-3 py-0.5 sm:py-1 bg-cyan-700/30 border-x border-b border-cyan-500/40 rounded-b-xl backdrop-blur-md shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
                        >
                            <motion.div
                                animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                            />
                            <span className="text-[8px] sm:text-[10px] font-black text-cyan-100 uppercase tracking-[0.2em] whitespace-nowrap drop-shadow-md">Autopilot Active</span>
                        </motion.div>
                    </div>
                )}

                {/* 상태 게이지 및 정보 표시줄 */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-center justify-between gap-2 sm:gap-6 min-w-0">
                        {/* 좌측: 내구도 및 연료 게이지 */}
                        <div className="flex items-center gap-2 sm:gap-6 shrink-0 relative">
                            <div className="space-y-1 w-20 sm:w-24 md:w-32">
                                <div className="flex justify-between items-center gap-2 px-1 flex-nowrap mt-0.5">
                                    <div className="text-[8px] sm:text-[9px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">내구도</div>
                                    {state.autoDodgesRemaining > 0 && (
                                        <motion.div
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="text-[7px] sm:text-[8px] font-black text-orange-400"
                                        >
                                            DODGE ×{state.autoDodgesRemaining}
                                        </motion.div>
                                    )}
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px] flex">
                                    {/* 기본 내구도 (5칸) */}
                                    <motion.div
                                        className="h-full relative border-r border-black/20 overflow-hidden"
                                        style={{ willChange: 'width' }}
                                        animate={{ width: `${(5 / (5 + state.upgrades.max_health)) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <motion.div
                                            animate={{ width: `${Math.min(100, (state.health / 5) * 100)}%` }}
                                            className={`h-full rounded-l-full transition-colors duration-500 ${state.health <= 1 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                                        />
                                    </motion.div>

                                    {/* 강화 장갑 (추가 내구도) */}
                                    {state.upgrades.max_health > 0 && (
                                        <motion.div
                                            className="h-full relative bg-white/5 overflow-hidden flex-1"
                                        >
                                            <motion.div
                                                style={{ willChange: 'width' }}
                                                animate={{ width: `${Math.max(0, ((state.health - 5) / state.upgrades.max_health) * 100)}%` }}
                                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-colors duration-500"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                                {/* 쉴드 게이지 (추가 보호막) */}
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[0.5px] mt-1">
                                    <motion.div
                                        style={{ willChange: 'width' }}
                                        animate={{ width: `${(state.shieldActive / 3) * 100}%` }}
                                        className={`h-full transition-all duration-300 ${state.shieldActive > 0
                                            ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                                            : 'bg-transparent'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 w-20 sm:w-24 md:w-32">
                                {/* 연료 라벨 + 10% 미만 시 긴급 경고 배지 */}
                                <div className="flex items-center justify-between px-1 mt-0.5">
                                    <div className="text-[8px] sm:text-[9px] font-black text-yellow-500 uppercase tracking-widest whitespace-nowrap">연료</div>
                                    {state.fuel < 10 && (
                                        <motion.div
                                            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.05, 1] }}
                                            transition={{ duration: 0.6, repeat: Infinity }}
                                            className="text-[7px] font-black text-red-400 uppercase tracking-wide whitespace-nowrap"
                                        >
                                            ⚠ 긴급
                                        </motion.div>
                                    )}
                                </div>
                                {/* 1열: 기본 연료 탱크 (최대 100) */}
                                <div className={`h-1.5 w-full bg-white/10 rounded-full overflow-hidden border p-[1px] transition-colors duration-300 ${state.fuel < 10 ? 'border-red-500/60 shadow-[0_0_6px_rgba(239,68,68,0.5)]' : 'border-white/5'}`}>
                                    <motion.div
                                        style={{ willChange: 'width' }}
                                        animate={{ width: `${Math.min(100, state.fuel)}%` }}
                                        className={`h-full rounded-full transition-colors duration-300 ${state.fuel < 10 ? 'bg-red-500 animate-pulse' : state.fuel < 20 ? 'bg-orange-400 animate-pulse' : 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'}`}
                                    />
                                </div>

                                {/* 2열: 보조 연료 탱크 (업그레이드 시 활성화) */}
                                <div className="h-1 md:h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px] mt-0.5">
                                    {state.upgrades.fuel_capacity > 0 && (
                                        <motion.div
                                            style={{ willChange: 'width' }}
                                            animate={{ width: `${Math.min(100, (Math.max(0, state.fuel - 100) / (state.upgrades.fuel_capacity * 20)) * 100)}%` }}
                                            className="h-full rounded-full bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.6)] transition-all duration-300"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 중앙: 점수 및 레벨 표시 */}
                        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-center shrink-0">
                            <div>
                                <div className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 mt-0.5">경험치</div>
                                <div className="text-sm sm:text-base md:text-xl font-black text-cyan-400 glow-text-cyan tracking-tighter tabular-nums leading-none">
                                    {state.score.toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 mt-0.5">레벨</div>
                                <div className="text-sm sm:text-base md:text-xl font-black text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)] tracking-tighter tabular-nums leading-none">
                                    {state.level}
                                </div>
                            </div>
                        </div>

                        {/* 우측: 남은 거리 및 보유 업그레이드 현황 */}
                        <div className="flex flex-col items-end gap-1 sm:gap-2 flex-1 min-w-0">
                            {/* 📈 실시간 FPS 표시기 (실장님 요청사항) */}
                            <div className="flex items-center gap-1 mb-[-4px] opacity-80">
                                <span className={`text-[7px] sm:text-[8px] font-black tracking-widest uppercase ${state.fps >= 55 ? 'text-cyan-400' : state.fps >= 30 ? 'text-yellow-400' : 'text-red-500 animate-pulse'
                                    }`}>
                                    FPS {state.fps}
                                </span>
                                <div className={`w-1 h-1 rounded-full ${state.fps >= 55 ? 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]' : state.fps >= 30 ? 'bg-yellow-400' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]'
                                    }`} />
                            </div>

                            <div className="flex items-center justify-end leading-tight">
                                {isHighDifficulty ? (
                                    // 특급 모드: 경과 시간 표시
                                    <div className="flex flex-col items-end">
                                        <div className="text-[7px] sm:text-[8px] font-black text-gray-500 uppercase tracking-widest">경과 시간</div>
                                        <span className="text-[11px] sm:text-sm font-black tabular-nums text-white">
                                            {elapsedStr}
                                        </span>
                                    </div>
                                ) : (
                                    // 초급·중급 모드: 남은 거리 표시
                                    <div className="flex items-center">
                                        <span className="text-[11px] sm:text-sm font-black tabular-nums text-white">
                                            {Math.floor(state.distanceToTarget).toLocaleString()}<span className="text-[8px] text-gray-500 ml-0.5">KM</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 획득한 업그레이드 아이콘 목록 */}
                            {Object.entries(state.upgrades).some(([, level]) => level > 0) && (
                                <div className="flex justify-end gap-1.5 origin-right scale-90">
                                    <div className="flex gap-2">
                                        {state.upgrades.max_health > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <Heart className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="text-[7px] font-black text-cyan-200">{state.upgrades.max_health}</span>
                                            </div>
                                        )}
                                        {state.upgrades.fuel_capacity > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <Gauge className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="text-[7px] font-black text-cyan-200">{state.upgrades.fuel_capacity}</span>
                                            </div>
                                        )}
                                        {state.upgrades.magnet > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <Magnet className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="text-[7px] font-black text-cyan-200">{state.upgrades.magnet}</span>
                                            </div>
                                        )}
                                        {state.upgrades.shield_boost > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <ShieldAlert className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="text-[7px] font-black text-cyan-200">{state.upgrades.shield_boost}</span>
                                            </div>
                                        )}
                                        {state.upgrades.luck > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="text-[7px] font-black text-cyan-200">{state.upgrades.luck}</span>
                                            </div>
                                        )}
                                        {state.upgrades.plasma_cannon > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <Zap className="w-2.5 h-2.5 text-cyan-400" />
                                                <span className="text-[7px] font-black text-cyan-200">{state.upgrades.plasma_cannon}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* 블랙홀 감지 경고는 스폰 시 3.5초 짧게 표시 (CosmicGame.tsx의 threatWarning에서 처리) */}
                </div>
            </div>
        </div>
    );
});

GameHUD.displayName = 'GameHUD';
