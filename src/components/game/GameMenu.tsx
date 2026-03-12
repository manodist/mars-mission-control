import React from 'react';
import { motion } from 'framer-motion';
import { Baby, User, Trophy, ShieldAlert, Gamepad2, Flame, FileText, Settings } from 'lucide-react';
import { RocketShip } from './RocketShip';
import type { GameState } from '../../types/game';

interface GameMenuProps {
    state: GameState;
    setDifficulty: (diff: 'low' | 'mid' | 'high') => void;
    showStrategyModal: () => void;
    openLaunchpad: () => void;
}

// 게임 시작 화면 및 난이도 선택 메뉴 컴포넌트
// 플레이어가 게임을 시작하기 전에 난이도를 선택하고, 작전(매뉴얼)을 확인할 수 있는 메인 메뉴입니다.
export const GameMenu: React.FC<GameMenuProps> = ({ state, setDifficulty, showStrategyModal, openLaunchpad }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8 text-center bg-black/70 backdrop-blur-sm overflow-hidden">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="terminal-panel p-4 sm:p-8 w-full max-w-lg bg-black/80 border-orange-500/30 shadow-[0_0_50px_rgba(255,77,0,0.15)]"
            >
                <div className="flex justify-center mb-6">
                    <motion.div
                        className="relative group flex flex-col items-center"
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Rocket */}
                        <div className="relative z-10">
                            <RocketShip className="w-24 h-24 drop-shadow-[0_0_15px_rgba(226,232,240,0.5)]" color="#e2e8f0" />
                        </div>

                        {/* Engine Flame - Animated */}
                        <motion.div
                            className="absolute top-[65%] w-4 bg-gradient-to-b from-blue-300 via-cyan-200 to-transparent rounded-full blur-[1px]"
                            animate={{
                                height: ["30px", "50px", "30px"],
                                opacity: [0.5, 0.9, 0.5],
                            }}
                            transition={{
                                duration: 0.1,
                                repeat: Infinity,
                            }}
                            style={{ zIndex: 0 }}
                        />

                        {/* Ambient Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-slate-500/20 rounded-full blur-xl animate-pulse -z-10" />
                    </motion.div>
                </div>

                {/* ══════════════════════════════════════════════════
                    ✨ 커스텀 SVG 타이포그래피 타이틀
                    · 폰트: Black Han Sans (한글 포스터체) + Orbitron (SF 영문)
                    · 러너: 불꽃 그라디언트 + 3단 네온 글로우 + 섀도우
                    · SPACE RUNNER: Orbitron 워터마크 레이어
                    · 스페이스: Black Han Sans 넓은 트래킹, 아이스 블루
                ══════════════════════════════════════════════════ */}
                <div className="mb-6 sm:mb-8 relative overflow-visible text-center">
                    {/* 타이틀 하단 불꽃 글로우 펄스 */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-12 pointer-events-none"
                        animate={{ opacity: [0.18, 0.45, 0.18], scaleX: [0.8, 1.1, 0.8] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.6) 0%, transparent 65%)' }}
                    />

                    <motion.svg
                        viewBox="0 0 400 138"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full"
                        style={{ maxWidth: 400, display: 'block', margin: '0 auto', overflow: 'visible' }}
                        aria-label="스페이스 러너"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                        <defs>
                            {/* 불꽃 그라디언트: 크림 하이라이트 → 오렌지 → 다크 레드 */}
                            <linearGradient id="gtFire" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#fffbf5" />
                                <stop offset="20%"  stopColor="#fde68a" />
                                <stop offset="50%"  stopColor="#f97316" />
                                <stop offset="82%"  stopColor="#b91c1c" />
                                <stop offset="100%" stopColor="#7f1d1d" />
                            </linearGradient>

                            {/* 아이스 그라디언트: 스페이스 부제목 */}
                            <linearGradient id="gtIce" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#e0f2fe" />
                                <stop offset="55%"  stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#0284c7" />
                            </linearGradient>

                            {/* 구분선: 사이언↔오렌지↔사이언 */}
                            <linearGradient id="gtLine" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%"   stopColor="transparent" />
                                <stop offset="18%"  stopColor="#38bdf8" stopOpacity="0.5" />
                                <stop offset="50%"  stopColor="#fb923c" stopOpacity="0.8" />
                                <stop offset="82%"  stopColor="#38bdf8" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>

                            {/* 러너 3단 네온 글로우 */}
                            <filter id="gtNeon" x="-24%" y="-50%" width="148%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b3" />
                                <feGaussianBlur in="SourceGraphic" stdDeviation="4"  result="b2" />
                                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b1" />
                                {/* 외곽: 넓고 따뜻한 주황 헤일로 */}
                                <feColorMatrix in="b3" type="matrix"
                                    values="2 0 0 0 0.72  0 0.7 0 0 0.08  0 0 0 0 0  0 0 0 0.4 0" result="g3"/>
                                {/* 중간: 선명한 오렌지 */}
                                <feColorMatrix in="b2" type="matrix"
                                    values="2.8 0 0 0 0.95  0 1.2 0 0 0.22  0 0 0 0 0  0 0 0 0.7 0" result="g2"/>
                                {/* 코어: 밝고 날카로운 옐로-화이트 */}
                                <feColorMatrix in="b1" type="matrix"
                                    values="3 0 0 0 1.0  0 2.8 0 0 0.8  0 0 0 0 0  0 0 0 1 0" result="g1"/>
                                <feMerge>
                                    <feMergeNode in="g3" />
                                    <feMergeNode in="g2" />
                                    <feMergeNode in="g1" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            {/* 스페이스 사이언 글로우 */}
                            <filter id="gtCyan" x="-25%" y="-70%" width="150%" height="240%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                                <feColorMatrix in="blur" type="matrix"
                                    values="0 0 0 0 0.04  0 0.45 0 0 0.65  0 0 3 0 1  0 0 0 0.7 0" result="glow"/>
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>

                            {/* Orbitron 워터마크 블러 */}
                            <filter id="gtWater" x="-5%" y="-10%" width="110%" height="120%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                            </filter>
                        </defs>

                        {/* ── Orbitron 워터마크: "SPACE RUNNER" 흐릿하게 배경에 ── */}
                        <text x="200" y="110"
                            textAnchor="middle"
                            fontFamily="'Orbitron', sans-serif"
                            fontWeight="900"
                            fontSize="52"
                            letterSpacing="6"
                            fill="rgba(249,115,22,0.06)"
                            filter="url(#gtWater)"
                        >SPACE RUNNER</text>

                        {/* ── 좌측 속도선 ── */}
                        <g opacity="0.2">
                            <line x1="4"  y1="68" x2="44" y2="68" stroke="#f97316" strokeWidth="1.5" />
                            <line x1="9"  y1="76" x2="40" y2="76" stroke="#f97316" strokeWidth="0.8" />
                            <line x1="15" y1="84" x2="36" y2="84" stroke="#f97316" strokeWidth="0.4" />
                        </g>
                        {/* ── 우측 속도선 ── */}
                        <g opacity="0.2">
                            <line x1="356" y1="68" x2="396" y2="68" stroke="#f97316" strokeWidth="1.5" />
                            <line x1="360" y1="76" x2="391" y2="76" stroke="#f97316" strokeWidth="0.8" />
                            <line x1="364" y1="84" x2="385" y2="84" stroke="#f97316" strokeWidth="0.4" />
                        </g>

                        {/* ── HUD 코너 브라켓 (L자형 꺾임) ── */}
                        {/* 좌상 */}
                        <path d="M 58 12 L 46 12 L 46 30" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
                        {/* 우상 */}
                        <path d="M 342 12 L 354 12 L 354 30" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.4" />
                        {/* 좌하 */}
                        <path d="M 46 110 L 46 128 L 58 128" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.3" />
                        {/* 우하 */}
                        <path d="M 354 110 L 354 128 L 342 128" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.3" />

                        {/* ── 상단 다이아몬드 ── */}
                        <polygon points="200,5 207,13 200,21 193,13"
                            fill="#f97316" opacity="0.7" />
                        <polygon points="200,5 207,13 200,21 193,13"
                            fill="none" stroke="#fde68a" strokeWidth="0.9" opacity="1" />

                        {/* ── 스페이스 (Black Han Sans, 넓은 트래킹) ── */}
                        <text
                            x="200" y="41"
                            textAnchor="middle"
                            fontFamily="'Black Han Sans', sans-serif"
                            fontWeight="400"
                            fontSize="18"
                            letterSpacing="14"
                            fill="url(#gtIce)"
                            filter="url(#gtCyan)"
                        >스페이스</text>

                        {/* ── 상단 구분선 ── */}
                        <rect x="60" y="49" width="280" height="0.7" fill="url(#gtLine)" />

                        {/* ── 러너 그림자 레이어 (2단 섀도) ── */}
                        <text x="202" y="116" textAnchor="middle"
                            fontFamily="'Black Han Sans', sans-serif"
                            fontWeight="400" fontSize="64"
                            fill="rgba(90,22,0,0.6)">러너</text>
                        <text x="201" y="115" textAnchor="middle"
                            fontFamily="'Black Han Sans', sans-serif"
                            fontWeight="400" fontSize="64"
                            fill="rgba(115,30,0,0.45)">러너</text>

                        {/* ── 러너 메인 (Black Han Sans + 불꽃 + 네온 글로우) ── */}
                        <text x="200" y="113" textAnchor="middle"
                            fontFamily="'Black Han Sans', sans-serif"
                            fontWeight="400" fontSize="64"
                            fill="url(#gtFire)"
                            filter="url(#gtNeon)"
                        >러너</text>

                        {/* ── 하단 구분선 ── */}
                        <rect x="60" y="124" width="280" height="0.7" fill="url(#gtLine)" opacity="0.45" />

                        {/* ── 코너 닷 포인트 ── */}
                        <circle cx="60"  cy="124" r="1.8" fill="#38bdf8" opacity="0.7" />
                        <circle cx="340" cy="124" r="1.8" fill="#38bdf8" opacity="0.7" />

                        {/* ── 스캔 라인: 6초 주기로 타이틀을 스치는 빛 줄기 ── */}
                        <motion.rect
                            y="50" width="18" height="76"
                            fill="rgba(255,220,170,0.06)"
                            style={{ filter: 'blur(7px)' }}
                            animate={{ x: [-18, 418] }}
                            transition={{ duration: 2.6, delay: 1.8, repeat: Infinity, repeatDelay: 6.5, ease: [0.25, 0, 0.75, 1] }}
                        />
                    </motion.svg>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-left">
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => setDifficulty('low')}
                            className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between px-4 sm:px-6 transition-all ${state.difficulty === 'low' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <Baby className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="text-xs font-black uppercase flex items-center gap-2">
                                        초급 대원
                                        {state.completedMissions.low && (
                                            <span className="text-[10px] text-yellow-500 animate-pulse">● COMPLETE</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400">지구에서 달까지</div>
                                </div>
                            </div>
                            <ShieldAlert className={`w-5 h-5 ${state.difficulty === 'low' ? 'opacity-100' : 'opacity-20'}`} />
                        </button>
                        <button
                            onClick={() => setDifficulty('mid')}
                            className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between px-4 sm:px-6 transition-all ${state.difficulty === 'mid' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <User className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="text-xs font-black uppercase flex items-center gap-2">
                                        중급 대원
                                        {state.completedMissions.mid && (
                                            <span className="text-[10px] text-yellow-500 animate-pulse">● COMPLETE</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400">지구에서 화성까지</div>
                                </div>
                            </div>
                            <Gamepad2 className={`w-5 h-5 ${state.difficulty === 'mid' ? 'opacity-100' : 'opacity-20'}`} />
                        </button>
                        <button
                            onClick={() => setDifficulty('high')}
                            className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between px-4 sm:px-6 transition-all ${state.difficulty === 'high' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <Trophy className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="text-xs font-black uppercase flex items-center gap-2">
                                        특급 대원
                                        {state.completedMissions.high && (
                                            <span className="text-[10px] text-yellow-500 animate-pulse">● COMPLETE</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400">무한한 우주를 향해</div>
                                </div>
                            </div>
                            <Flame className={`w-5 h-5 ${state.difficulty === 'high' ? 'opacity-100' : 'opacity-20'}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={openLaunchpad}
                        className="py-5 glass-panel text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all border border-white/10 hover:border-blue-500/50 hover:bg-white/10 active:scale-95 flex flex-col items-center justify-center gap-2 group"
                    >
                        <Settings className="w-5 h-5 text-blue-400 group-hover:rotate-90 transition-transform" />
                        <span>발사대</span>
                    </button>

                    <button
                        onClick={showStrategyModal}
                        className="py-5 glass-panel text-white/80 font-black uppercase text-xs tracking-widest rounded-xl transition-all border border-white/10 hover:border-green-500/50 hover:bg-white/10 active:scale-95 flex flex-col items-center justify-center gap-2 group"
                    >
                        <FileText className="w-5 h-5 text-green-400" />
                        <span>작전</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

