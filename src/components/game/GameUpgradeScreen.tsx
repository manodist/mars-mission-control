import { AnimatePresence, motion } from 'framer-motion';
import { Gauge, Heart, Magnet, Rocket, ShieldAlert, Sparkles, Zap, type LucideIcon } from 'lucide-react';
import React from 'react';
import type { GameState, UpgradeType } from '../../types/game';

interface UpgradeOption {
    type: UpgradeType;
    name: string;
    description: string;
    icon: LucideIcon;
}

const upgradeOptions: UpgradeOption[] = [
    { type: 'max_health', name: '기체 강화', description: '최대 내구도 증가 (최대 +5)', icon: Heart },
    { type: 'fuel_capacity', name: '연료 탱크', description: '최대 연료량 증가 (최대 +100%)', icon: Gauge },
    { type: 'magnet', name: '자력 엔진', description: '아이템 흡수 범위 확대', icon: Magnet },
    { type: 'shield_boost', name: '보호막 효율', description: '아이템 획득 시 보호막 중첩', icon: ShieldAlert },
    { type: 'luck', name: '항법 보조', description: '특수 아이템 등장 확률 증가', icon: Sparkles },
    { type: 'plasma_cannon', name: '플라즈마 캐논', description: '함선 무장 강화 (자동 사격)', icon: Zap }
];

interface GameUpgradeScreenProps {
    state: GameState;
    onUpgrade: (type: UpgradeType) => void;
    onStart: () => void;
}

// 업그레이드 화면 컴포넌트
// 플레이어가 획득한 포인트로 기체 성능을 강화할 수 있는 UI를 제공합니다.
export const GameUpgradeScreen: React.FC<GameUpgradeScreenProps> = ({ state, onUpgrade, onStart }) => {
    return (
        <AnimatePresence>
            {state.showUpgradeScreen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-[70] bg-gradient-to-b from-purple-950/98 to-black/98 backdrop-blur-xl flex flex-col items-center justify-start md:justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar"
                >
                    {/* 상단 타이틀 영역 */}
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="text-center mb-4 md:mb-10 mt-4 md:mt-0 shrink-0"
                    >
                        <div className="relative inline-block mb-3 md:mb-6">
                            <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-cyan-400 animate-pulse" />
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-2xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter leading-none">
                            업그레이드
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-r from-transparent to-purple-500" />
                            <p className="text-purple-300 font-black uppercase tracking-[0.3em] text-[10px] md:text-sm">
                                남은 포인트: <span className="text-cyan-400 text-base md:text-xl ml-1">{state.upgradePoints}</span>
                            </p>
                            <div className="h-[1px] w-8 md:w-16 bg-gradient-to-l from-transparent to-purple-500" />
                        </div>
                    </motion.div>

                    {/* 업그레이드 옵션 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-5xl mb-8">
                        {upgradeOptions.map((upgrade) => {
                            const currentLevel = state.upgrades[upgrade.type];
                            const maxLevel = 5;
                            const isMaxed = currentLevel >= maxLevel;
                            const Icon = upgrade.icon;
                            const canAfford = state.upgradePoints > 0;

                            let description = upgrade.description;
                            // 플라즈마 캐논은 레벨에 따라 연사 속도가 빨라지므로 설명을 동적으로 변경
                            if (upgrade.type === 'plasma_cannon') {
                                const cooldownLabels = [3, 2, 1, 0.5, 0.25];
                                description = `연사: ${cooldownLabels[currentLevel] || 0.25}초 | 크기 & 파워 증가`;
                            }

                            return (
                                <motion.button
                                    key={upgrade.type}
                                    whileHover={isMaxed || !canAfford ? {} : { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    whileTap={isMaxed || !canAfford ? {} : { scale: 0.98 }}
                                    onClick={() => onUpgrade(upgrade.type)}
                                    disabled={isMaxed || !canAfford}
                                    className={`relative group p-3 md:p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 text-left ${isMaxed
                                        ? 'bg-black/40 border-yellow-500/20 opacity-80'
                                        : !canAfford
                                            ? 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
                                            : 'bg-white/5 border-white/10 hover:border-cyan-500/50 cursor-pointer shadow-lg hover:shadow-cyan-500/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg shrink-0 ${isMaxed ? 'bg-yellow-500/10' : 'bg-cyan-500/10'}`}>
                                            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isMaxed ? 'text-yellow-400' : 'text-cyan-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className={`text-xs md:text-sm font-black uppercase tracking-tight truncate text-left ${isMaxed ? 'text-yellow-400' : 'text-white'}`}>
                                                    {upgrade.name}
                                                </h3>
                                                <div className="flex gap-0.5 shrink-0">
                                                    {[...Array(maxLevel)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-500 ${i < currentLevel
                                                                ? isMaxed ? 'bg-yellow-400 shadow-[0_0_5px_#fbbf24]' : 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]'
                                                                : 'bg-white/10'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[10px] md:text-xs text-gray-400 font-medium leading-tight line-clamp-2 text-left">
                                                {description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* 마우스 오버 시 스캔라인 효과 */}
                                    {!isMaxed && canAfford && (
                                        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[200%] animate-scan -top-full" />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onStart}
                        className="group relative h-14 md:h-20 w-full max-w-sm mb-6 shrink-0"
                    >
                        {/* 사이버 펑크 스타일 버튼 형태 */}
                        <div className="absolute inset-0 bg-cyan-500 skew-x-[-12deg] group-hover:bg-white transition-colors duration-300" />
                        <div className="absolute inset-[2px] bg-black skew-x-[-12deg] z-0" />
                        <div className="absolute inset-[4px] bg-gradient-to-r from-cyan-950 to-purple-950 skew-x-[-12deg] group-hover:from-cyan-500 group-hover:to-cyan-400 transition-all duration-300 opacity-50 group-hover:opacity-100" />

                        <div className="relative z-10 flex items-center justify-center gap-4 text-white group-hover:text-black transition-colors duration-300">
                            <span className="text-lg md:text-2xl font-black uppercase tracking-[0.2em]">
                                {state.upgradePoints > 0 ? '출격 준비 완료' : '미션 시작하기'}
                            </span>
                            <Rocket className="w-5 h-5 md:w-8 md:h-8 animate-bounce" />
                        </div>

                        {/* 모서리 장식 포인트 */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
