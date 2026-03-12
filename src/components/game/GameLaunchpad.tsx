import React from 'react';
import { RocketShip } from './RocketShip';
import './GameLaunchpad.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ChevronLeft, ChevronRight, Shield, Zap, Atom, BookOpen, Gauge, UserCheck, User, Thermometer, Volume2, VolumeX } from 'lucide-react';
import { Howl, Howler } from 'howler';
import type { GameState, RocketCustomization } from '../../types/game';
import { TANK_COLORS } from '../../constants/gameConstants';

// 사운드 에셋 설정 (Mixkit의 무료 로열티 프리 사운드 활용)
const SOUND_ASSETS = {
    beep: '/sound2.wav',
    engine: 'https://assets.mixkit.co/active_storage/sfx/1718/1718-preview.mp3'
};

interface GameLaunchpadProps {
    state: GameState;
    onClose: () => void;
    onUpdateCustomization: (custom: RocketCustomization) => void;
    onLaunch: () => void;
}

const COLORS = [
    { name: 'Zenith White', value: '#f8fafc', class: 'rocket-color-zenith', textClass: 'rocket-text-zenith' },
    { name: 'Cyber Cyan', value: '#06b6d4', class: 'rocket-color-cyber', textClass: 'rocket-text-cyber' },
    { name: 'Emerald Green', value: '#10b981', class: 'rocket-color-emerald', textClass: 'rocket-text-emerald' },
    { name: 'Nebula Purple', value: '#a855f7', class: 'rocket-color-nebula', textClass: 'rocket-text-nebula' },
    { name: 'Rose Pink', value: '#f472b6', class: 'rocket-color-rose', textClass: 'rocket-text-rose' },
    { name: 'Solar Gold', value: '#fbbf24', class: 'bg-yellow-400', textClass: 'text-yellow-400' },
    { name: 'Lunar Silver', value: '#e2e8f0', class: 'bg-slate-300', textClass: 'text-slate-300' },
    { name: 'Mars Bronze', value: '#d97706', class: 'bg-amber-600', textClass: 'text-amber-600' },

    { name: 'Crimson Red', value: '#dc2626', class: 'bg-red-600', textClass: 'text-red-600' },
    { name: 'Deep Blue', value: '#1d4ed8', class: 'bg-blue-700', textClass: 'text-blue-700' },
];

const DECALS = ['DEEP', 'InblanQ', 'gritx', 'NASA', 'KOREA'];
const ENGINE_TYPES = [
    { id: 'standard', label: '화력 엔진', icon: Zap, color: 'text-orange-400' },
    { id: 'plasma', label: '플라즈마 엔진', icon: Atom, color: 'text-cyan-400' },
    { id: 'nuclear', label: '원자력 엔진', icon: Shield, color: 'text-green-400' }
];



const KNOWLEDGE_PAGES = [
    {
        category: "STRUCTURE DESIGN",
        title: "로켓의 구조와 설계",
        subtitle: "효율적인 무게 관리: 다단 로켓",
        content: "로켓은 발사대 구조물에서 솟아 오른 후 연료 탱크와 발사체를 단계별로 분리하며 무게를 줄이는 '다단 설계'를 사용합니다. 필요 없어진 부분을 버림으로써 적은 연료로 더 먼 우주까지 도달할 수 있습니다."
    },
    {
        category: "LAUNCH PRINCIPLE",
        title: "로켓 발사의 원리",
        subtitle: "뉴턴의 제3법칙: 작용-반작용",
        content: "로켓은 연료를 태워 가스를 아래로 강하게 뿜어내는 '작용'을 통해, 로켓을 반대 방향인 위로 밀어 올리는 '반작용'의 힘(추력)을 얻어 중력을 이겨내고 우주로 나아갑니다."
    },
    {
        category: "ORBITAL SCIENCE",
        title: "발사 이후의 여정",
        subtitle: "지구 탈출과 궤도 진입",
        content: "지구 중력을 벗어나기 위해 시속 약 4만 km의 '탈출 속도'가 필요합니다. 궤도에 진입하면 공기 저항이 없는 우주에서 관성의 힘으로 지구 주위를 영원히 공전하게 됩니다."
    },
    {
        category: "SPACE EVOLUTION",
        title: "우주 과학의 미래 가치",
        subtitle: "인류의 한계 확장과 지구 보호",
        content: "우주 과학의 발전은 화성 이주와 같은 새로운 삶의 터전 탐구뿐만 아니라, 기상 관측과 자원 탐사 등 지구의 문제를 해결하는 핵심 기술이 됩니다. 끝없는 도전은 인류의 지평을 넓히는 가장 위대한 도약입니다."
    },
    {
        category: "K-SPACE MISSION",
        title: "대한민국의 우주 도전",
        subtitle: "누리호에서 달, 그리고 화성까지",
        content: "대한민국은 독자 기술로 개발한 '누리호' 발사 성공을 통해 세계 7대 우주 강국에 진입했습니다. 이제 2032년 달 착륙선 발사, 2045년 화성 탐사를 목표로 인류의 우주 개척 역사에 당당히 이름을 올리고 있습니다."
    }
];

export const GameLaunchpad: React.FC<GameLaunchpadProps> = ({ state, onClose, onUpdateCustomization, onLaunch }) => {
    const { rocketCustomization } = state;
    const [countdown, setCountdown] = React.useState<number | null>(null);
    const [isLaunching, setIsLaunching] = React.useState(false);
    const [isAscending, setIsAscending] = React.useState(false);

    const boosterColorObj = TANK_COLORS.find(c => c.value === rocketCustomization.boosterColor) || TANK_COLORS[0];

    // 🚀 성능 최적화: 개별 수치 상태(0→100 반복 setState) 대신 CSS 트랜지션용 단일 boolean 사용
    const [gaugesReady, setGaugesReady] = React.useState(false);
    const [isMuted, setIsMuted] = React.useState(false);

    // 사운드 인스턴스 초기화
    const sounds = React.useMemo(() => ({
        countdown: new Howl({
            src: [SOUND_ASSETS.beep],
            volume: 1.0,
            html5: true,
            preload: true
        }),
        engine: new Howl({
            src: [SOUND_ASSETS.engine],
            volume: 0.8,
            loop: true,
            html5: true
        })
    }), []);

    // 컴포넌트 언마운트 시 사운드 중지 및 전역 뮤트 해제
    React.useEffect(() => {
        return () => {
            sounds.engine.stop();
            Howler.mute(false); // 컴포넌트를 나갈 때는 전역 뮤트 해제
        };
    }, [sounds]);

    // 뮤트 상태 업데이트
    React.useEffect(() => {
        Howler.mute(isMuted);
    }, [isMuted]);
    const [currentKnowledgePage, setCurrentKnowledgePage] = React.useState(0);

    // Booster Message Split Logic
    const leftManualMsg = rocketCustomization.boosterMessageLeft?.trim() || '';
    const rightManualMsg = rocketCustomization.boosterMessageRight?.trim() || '';
    const fullBoosterMsg = rocketCustomization.boosterMessage?.trim() || '';
    const boosterWords = fullBoosterMsg ? fullBoosterMsg.split(/\s+/) : [];
    const hasManualMsg = leftManualMsg.length > 0 || rightManualMsg.length > 0;
    let leftBoosterMsg = leftManualMsg;
    let rightBoosterMsg = rightManualMsg;

    if (!hasManualMsg) {
        leftBoosterMsg = fullBoosterMsg;
        rightBoosterMsg = fullBoosterMsg;

        // Auto split long messages across both boosters
        if (fullBoosterMsg.length > 10 || boosterWords.length >= 2) {
            if (boosterWords.length >= 2) {
                const mid = Math.ceil(boosterWords.length / 2);
                leftBoosterMsg = boosterWords.slice(0, mid).join(' ');
                rightBoosterMsg = boosterWords.slice(mid).join(' ');
            } else {
                const mid = Math.ceil(fullBoosterMsg.length / 2);
                leftBoosterMsg = fullBoosterMsg.slice(0, mid);
                rightBoosterMsg = fullBoosterMsg.slice(mid);
            }
        }
    }

    const updateBoosterMessages = (left: string, right: string) => {
        const combined = [left, right].filter(Boolean).join(' ');
        onUpdateCustomization({
            ...rocketCustomization,
            boosterMessageLeft: left,
            boosterMessageRight: right,
            boosterMessage: combined
        });
    };

    // 🚀 성능 최적화: setInterval(20ms) × 2 = 초당 ~100회 리렌더링 제거
    // CSS transition으로 교체하여 리렌더링 1회만 발생 (시각적 효과 동일)
    React.useEffect(() => {
        const timer = requestAnimationFrame(() => setGaugesReady(true));
        return () => cancelAnimationFrame(timer);
    }, []);

    const handleLaunchClick = () => {
        if (isLaunching) return;
        // 카운트다운 관련 모든 기존 소리 삭제 요청 반영 (click 사운드 제거)
        setIsLaunching(true);
        setCountdown(3); // 3초부터 카운트다운 시작
    };

    React.useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (countdown !== null) {
            if (countdown > 0) {
                // 3, 2, 1 시점: 총 3번의 비프음 (0시점에 4번째 비프음 연주 예정)
                sounds.countdown.stop(); // 연속 재생 시 소리 겹침 방지
                sounds.countdown.rate(1.0);
                sounds.countdown.play();
                timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            } else if (countdown === 0) {
                // LIFT OFF (0) 시점: 4번째 비프음 + 엔진 굉음 시작
                sounds.countdown.stop();
                sounds.countdown.rate(1.5); // 0시점은 피치를 높여 강조
                sounds.countdown.play();
                sounds.engine.play(); // 엔진 굉음 시작
                timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            } else {
                // 🚀 발사 애니메이션 시작 + 디졸브 전환 (실장님 요청사항)
                setIsAscending(true);
                // 발사체가 화면 밖으로 나가는 도중(y ≈ -800)에 게임 전환 시작
                // → 발사대 페이드아웃과 게임 페이드인이 겹쳐 자연스러운 디졸브 효과
                setTimeout(() => onLaunch(), 2500);
                // 엔진 소리 페이드 아웃
                setTimeout(() => {
                    sounds.engine.fade(0.6, 0, 1500);
                    setTimeout(() => sounds.engine.stop(), 1500);
                }, 2000);
            }
        }
        return () => clearTimeout(timer);
    }, [countdown, onLaunch, sounds]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-[60] flex flex-col items-center p-4 sm:p-8 bg-[#050508] overflow-y-auto overflow-x-hidden scrollbar-hide"
        >
            {/* Background Atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-orange-500/10 to-transparent blur-3xl opacity-50" />
                {/* Earth Horizon */}
                <div className="absolute bottom-[-30%] left-[-20%] right-[-20%] h-[80vh] rounded-t-[100%] bg-blue-900/10 border-t border-blue-400/20 shadow-[0_-20px_100px_rgba(59,130,246,0.05)]" />

                {/* Launch Tower Grid */}
                <div className="absolute bottom-0 left-1/2 -translate-x-[200%] w-0.5 h-full bg-white/5" />
                <div className="absolute bottom-0 left-1/2 -translate-x-[150%] w-0.5 h-full bg-white/5" />
                <div className="absolute bottom-[10%] left-1/2 -translate-x-full w-full h-0.5 bg-white/5" />
                <div className="absolute bottom-[30%] left-1/2 -translate-x-full w-full h-0.5 bg-white/5" />
            </div>

            {/* Header */}
            <header className="w-full max-w-6xl z-10 flex justify-between items-center mb-0 relative">
                <div className="flex flex-col">
                    <h2 className="text-3xl font-black tracking-tighter uppercase text-white flex items-center gap-3 glow-text-orange font-black">
                        <Rocket className="w-8 h-8 text-orange-500" /> 발사대
                    </h2>
                    <p className="text-[10px] text-gray-400 font-black tracking-widest pl-11 font-sans leading-none">꿈과 희망을 실은 나만의 로켓을 만들어 보세요</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        title={isMuted ? "Unmute Sound" : "Mute Sound"}
                        className={`p-3 border rounded-xl transition-all ${isMuted ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={onClose}
                        title="Close Launchpad"
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-white" />
                    </button>
                </div>
            </header>

            <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 z-10 items-stretch py-0 mt-0">
                {/* Left Panel: Status & Crew */}
                <section className="space-y-6 flex flex-col justify-center h-full">
                    {/* Multi-page Scientific Knowledge Section */}
                    <div className="glass-panel p-5 border-l-4 border-l-orange-500 bg-orange-500/5 relative min-h-[160px] flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-orange-400" />
                                <h3 className="text-[10px] font-black uppercase text-orange-200 tracking-widest">{KNOWLEDGE_PAGES[currentKnowledgePage].category}</h3>
                            </div>
                            <div className="flex gap-1">
                                {KNOWLEDGE_PAGES.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1 h-1 rounded-full transition-all ${idx === currentKnowledgePage ? 'bg-orange-500 w-3' : 'bg-orange-500/20'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentKnowledgePage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full"
                                >
                                    <h4 className="text-[12px] font-black text-white mb-1">{KNOWLEDGE_PAGES[currentKnowledgePage].title}</h4>
                                    <p className="text-[10px] text-orange-400/80 font-bold mb-2">"{KNOWLEDGE_PAGES[currentKnowledgePage].subtitle}"</p>
                                    <p className="text-[11px] leading-relaxed text-gray-400 font-medium">
                                        {KNOWLEDGE_PAGES[currentKnowledgePage].content}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setCurrentKnowledgePage(prev => (prev - 1 + KNOWLEDGE_PAGES.length) % KNOWLEDGE_PAGES.length)}
                                title="Previous Knowledge"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <ChevronLeft className="w-3 h-3 text-gray-500 group-hover:text-white" />
                            </button>
                            <button
                                onClick={() => setCurrentKnowledgePage(prev => (prev + 1) % KNOWLEDGE_PAGES.length)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-[9px] font-black text-orange-400 transition-all group"
                            >
                                다음 지식 보기 <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <div className="glass-panel p-6 border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-3 mb-6">
                            <UserCheck className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-black uppercase text-purple-200 tracking-wider">탑승 비행사 프로필</h3>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/30 flex items-center justify-center overflow-hidden">
                                    <User className="w-10 h-10 text-purple-400" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 block">대원 이름 (name)</label>
                                <input
                                    type="text"
                                    value={rocketCustomization.astronautName}
                                    onChange={(e) => onUpdateCustomization({ ...rocketCustomization, astronautName: e.target.value })}
                                    title="Astronaut Name"
                                    placeholder="이름을 입력하세요"
                                    className="bg-transparent border-b border-purple-500/30 text-white font-black text-xl w-full focus:outline-none focus:border-purple-400 transition-colors uppercase tracking-tighter"
                                />
                                <p className="text-[12px] text-white/60 font-medium font-sans mt-1">"꿈을 향해 출발할 준비가 됐어요!"</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
                        <div className="flex items-center gap-3 mb-6">
                            <Gauge className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-sm font-black uppercase text-cyan-200 tracking-wider">기체 메인 시스템</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
                                    <span className="text-gray-400">연료 충전 상태 (Fuel)</span>
                                    <span className="text-cyan-400 animate-pulse">{gaugesReady ? 100 : 0}% READY</span>
                                </div>
                                <div className="h-2 w-full bg-cyan-950 rounded-full overflow-hidden p-[1px] border border-cyan-500/20">
                                    {/* 🚀 성능 최적화: motion.div → CSS transition (리렌더링 0회) */}
                                    <div
                                        style={{ width: gaugesReady ? '100%' : '0%' }}
                                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-[width] duration-[2000ms] ease-out"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
                                    <span className="text-gray-400">생명 유지 장치 (OX)</span>
                                    <span className="text-green-400 animate-pulse">{gaugesReady ? 100 : 0}% OPTIMAL</span>
                                </div>
                                <div className="h-2 w-full bg-green-950 rounded-full overflow-hidden p-[1px] border border-green-500/20">
                                    {/* 🚀 성능 최적화: motion.div → CSS transition (리렌더링 0회) */}
                                    <div
                                        style={{ width: gaugesReady ? '100%' : '0%' }}
                                        className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-[width] duration-[3500ms] ease-out"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Center Panel: Rocket Visual */}
                <section className="relative flex flex-col items-center justify-center py-12 sm:py-24 min-h-[400px] sm:min-h-[600px] my-4 order-first lg:order-none">
                    {/* Steam effects - SCALING ON ASCEND */}
                    <AnimatePresence>
                        <motion.div
                            animate={isAscending ? {
                                opacity: [0.4, 0.9, 0],
                                scale: [1, 3, 6],
                                y: [-50, -200, -500],
                            } : {
                                opacity: [0.1, 0.3, 0.1],
                                scale: [0.8, 1.2, 0.8]
                            }}
                            transition={isAscending ? {
                                duration: 5,
                                ease: "easeOut",
                            } : {
                                repeat: Infinity,
                                duration: 3
                            }}
                            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-white/10 blur-[100px] rounded-full"
                        />
                        {/* Secondary steam layer for more volume */}
                        {isAscending && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{
                                    opacity: [0, 0.6, 0],
                                    scale: [0.5, 4, 8],
                                    y: [0, -300, -800],
                                }}
                                transition={{ duration: 7, ease: "easeOut" }}
                                className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 blur-[120px] rounded-full"
                            />
                        )}
                    </AnimatePresence>

                    <div className="relative z-10 flex flex-col items-center scale-90 sm:scale-100">
                        {/* Background Launch Tower Structure - FIXED: OUTSIDE FLOATING DIV */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-[180%] w-32 h-[120%] z-0 opacity-40">
                            {/* Main Tower Body */}
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 border-x border-white/10">
                                {/* Truss Patterns */}
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full h-16 border-b border-white/5 relative">
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.1)_50%,transparent_52%)]" />
                                        <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_48%,rgba(255,255,255,0.1)_50%,transparent_52%)]" />
                                    </div>
                                ))}
                                {/* Beacons */}
                                <div className="absolute top-10 left-0 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                                <div className="absolute top-1/2 right-0 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                            </div>
                            {/* Pipes and Cabling */}
                            <div className="absolute inset-y-0 left-1/2 -translate-x-[60px] w-1 bg-gray-600 border-x border-black/20" />
                            <div className="absolute inset-y-0 left-1/2 -translate-x-[50px] w-2 bg-gray-700 border-x border-black/20" />
                        </div>

                        {/* Rocket Animation Group */}
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative z-10 flex flex-col items-center"
                        >
                            {/* Full Scale Launch Vehicle with Boosters and Fuel Tanks */}
                            <motion.div
                                animate={isAscending ? {
                                    y: [0, -80, -400, -1200, -3000],
                                    transition: { duration: 5, times: [0, 0.15, 0.35, 0.6, 1], ease: "easeIn" }
                                } : {}}

                                className="relative w-64 sm:w-80 h-[450px] sm:h-[520px] flex flex-col items-center group"
                            >
                                {/* Umbilical Support Arms */}
                                <div className="absolute top-32 -left-16 w-12 h-1 bg-gray-600/30 border-y border-white/5 z-0" />
                                <div className="absolute top-64 -left-16 w-12 h-1 bg-gray-600/30 border-y border-white/5 z-0" />

                                {/* Side Boosters */}
                                <motion.div
                                    className={`absolute bottom-5 -left-0.5 w-10 sm:w-12 h-64 sm:h-72 rounded-t-full border-x-2 shadow-xl z-10 overflow-hidden ${boosterColorObj.class} ${boosterColorObj.borderClass}`}
                                >
                                    {/* Metallic Shine Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/20 to-black/20" />


                                    {/* Booster Message Display */}
                                    {leftBoosterMsg && (
                                        <div className="absolute inset-0 flex items-center justify-center p-1">
                                            <span className="text-[10px] sm:text-[12px] font-black text-black/75 uppercase whitespace-nowrap vertical-text tracking-tighter">
                                                {leftBoosterMsg}
                                            </span>
                                        </div>
                                    )}


                                </motion.div>
                                <motion.div
                                    className={`absolute bottom-5 -right-0.5 w-10 sm:w-12 h-64 sm:h-72 rounded-t-full border-x-2 shadow-xl z-10 overflow-hidden ${boosterColorObj.class} ${boosterColorObj.borderClass}`}
                                >
                                    {/* Metallic Shine Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-white/20 to-black/20" />


                                    {/* Booster Message Display */}
                                    {rightBoosterMsg && (
                                        <div className="absolute inset-0 flex items-center justify-center p-1">
                                            <span className="text-[10px] sm:text-[12px] font-black text-black/75 uppercase whitespace-nowrap vertical-text tracking-tighter">
                                                {rightBoosterMsg}
                                            </span>
                                        </div>
                                    )}


                                </motion.div>

                                {/* Main External Fuel Tank */}
                                <motion.div
                                    className={`tank-display ${TANK_COLORS.find(c => c.value === (rocketCustomization.tankColor || '#a84c24'))?.class || 'tank-color-orange'} ${TANK_COLORS.find(c => c.value === (rocketCustomization.tankColor || '#a84c24'))?.borderClass || 'tank-border-orange'}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
                                    <div className="absolute top-20 w-full h-px bg-black/10" />
                                    <div className="absolute top-40 w-full h-px bg-black/10" />
                                    <div className="absolute top-60 w-full h-px bg-black/10" />

                                    {/* Passenger Name Display (Between Decals) */}
                                    {rocketCustomization.astronautName && (
                                        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-[5px] w-full text-center z-[35] pointer-events-none">
                                            <span className="text-[12px] font-black text-white bg-black/60 px-2 py-0.5 rounded-sm uppercase tracking-[2px] whitespace-nowrap shadow-xl backdrop-blur-md border border-white/20 font-sans">
                                                {rocketCustomization.astronautName} 호
                                            </span>
                                        </div>
                                    )}

                                    {/* LARGE Decal on the Orange Tank */}
                                    {rocketCustomization.decal === 'DEEP' ? (
                                        <div className="absolute top-[78%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] w-full flex justify-center">
                                            <img src="/DEEP.png" alt="DEEP" className="w-32 sm:w-40 object-contain" />
                                        </div>
                                    ) : rocketCustomization.decal === 'InblanQ' ? (
                                        <div className="absolute top-[78%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] w-full flex justify-center">
                                            <img src="/inblanq.png" alt="InblanQ" className="w-32 sm:w-40 object-contain" />
                                        </div>
                                    ) : (
                                        rocketCustomization.decal !== 'none' && (
                                            <div className="absolute top-[78%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                                {rocketCustomization.decal === 'gritx' && (
                                                    <div className="w-32 sm:w-40 flex justify-center">
                                                        <img src="/gritx.png" alt="GRIT" className="w-full object-contain relative z-10" />
                                                    </div>
                                                )}
                                                {rocketCustomization.decal === 'NASA' && (
                                                    <div className="w-32 sm:w-40 flex justify-center">
                                                        <img src="/NASA.png" alt="NASA" className="w-full object-contain" />
                                                    </div>
                                                )}
                                                {rocketCustomization.decal === 'KOREA' && (
                                                    <div className="w-32 sm:w-40 flex justify-center">
                                                        <img src="/KOREA.webp" alt="KOREA" className="w-full object-contain" />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </motion.div>

                                {/* Payload Section (Top Fairing housing our inner rocket) */}
                                <div className="relative w-40 sm:w-48 h-[280px] sm:h-[340px] flex flex-col items-center z-20 mt-[-20px]">
                                    <div className="absolute inset-0 bg-transparent border-x-2 border-t-2 border-white/20 rounded-t-[100px] shadow-2xl overflow-hidden">
                                        {/* Glass Viewport inside the Fairing to see our customizable rocket */}
                                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[85%] h-[65%] bg-transparent border border-white/10 rounded-t-[80px] rounded-b-2xl backdrop-blur-sm">
                                            {/* THE GAME ROCKET (Visible inside the Fairing) */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 scale-90 sm:scale-100">
                                                <div className="relative flex flex-col items-center">
                                                    <div className="relative z-30 mb-[-10px] p-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-t-full">
                                                        <RocketShip
                                                            className="w-16 h-16 sm:w-20 sm:h-20"
                                                            color={rocketCustomization.color || "#e2e8f0"}
                                                        />
                                                    </div>
                                                    <div
                                                        className="w-16 sm:w-20 h-28 sm:h-32 relative border-x border-white/20 rounded-b-lg shadow-xl bg-[#f8fafc]"
                                                    >
                                                        {/* Decal on Inner Rocket Tank */}
                                                        {rocketCustomization.decal !== 'none' && (
                                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 scale-50">
                                                                {rocketCustomization.decal === 'DEEP' && <img src="/DEEP.png" alt="DEEP" className="w-12 h-12 object-contain" />}
                                                                {rocketCustomization.decal === 'InblanQ' && <img src="/inblanq.png" alt="InblanQ" className="w-12 h-12 object-contain" />}
                                                                {rocketCustomization.decal === 'gritx' && <img src="/gritx.png" alt="GRIT" className="w-10 h-10 object-contain relative z-10" />}
                                                                {rocketCustomization.decal === 'NASA' && <img src="/NASA.png" alt="NASA" className="w-10 h-10 object-contain" />}
                                                                {rocketCustomization.decal === 'KOREA' && <img src="/KOREA.webp" alt="KOREA" className="w-10 h-10 object-contain" />}
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-cyan-500 border border-white/30 shadow-inner">
                                                            <div className="w-full h-full bg-gradient-to-tr from-cyan-300 to-transparent animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Rocket Exhaust Plume */}
                                <div className="absolute top-[96%] left-1/2 -translate-x-1/2 w-48 h-20 pointer-events-none z-0">
                                    {/* Triple Flame Layout */}
                                    <div className="absolute inset-x-0 top-0 flex justify-center gap-4">
                                        {/* Left Sub Burner */}
                                        <div className="relative w-8 h-20 opacity-70 scale-90">
                                            <motion.div
                                                animate={{
                                                    height: isAscending ? [40, 100, 40] : [8, 20, 8],
                                                    opacity: [0.6, 0.9, 0.6],
                                                    width: isAscending ? ['24px', '32px', '24px'] : ['16px', '20px', '16px'],
                                                }}
                                                transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                                                className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[100%] blur-[1px] z-10 origin-top ${rocketCustomization.engineType === 'plasma' ? 'bg-gradient-to-b from-cyan-300 via-cyan-500 to-blue-600/10' :
                                                    rocketCustomization.engineType === 'nuclear' ? 'bg-gradient-to-b from-green-300 via-green-500 to-emerald-800/10' :
                                                        'bg-gradient-to-b from-orange-300 via-orange-500 to-red-600/10'
                                                    } `}
                                            />
                                        </div>

                                        {/* Center Main Burner */}
                                        <div className="relative w-12 h-20">
                                            <motion.div
                                                animate={{
                                                    height: isAscending ? [80, 200, 80] : [12, 28, 12],
                                                    opacity: [0.8, 1, 0.8],
                                                    width: isAscending ? ['40px', '56px', '40px'] : ['24px', '32px', '24px'],
                                                }}
                                                transition={{ repeat: Infinity, duration: 0.25, ease: "linear" }}
                                                className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[100%] blur-[1.5px] z-10 origin-top ${rocketCustomization.engineType === 'plasma' ? 'bg-gradient-to-b from-cyan-300 via-cyan-500 to-blue-600/10' :
                                                    rocketCustomization.engineType === 'nuclear' ? 'bg-gradient-to-b from-green-300 via-green-500 to-emerald-800/10' :
                                                        'bg-gradient-to-b from-orange-300 via-orange-500 to-red-600/10'
                                                    } `}
                                            />
                                        </div>

                                        {/* Right Sub Burner */}
                                        <div className="relative w-8 h-20 opacity-70 scale-90">
                                            <motion.div
                                                animate={{
                                                    height: isAscending ? [40, 100, 40] : [8, 20, 8],
                                                    opacity: [0.6, 0.9, 0.6],
                                                    width: isAscending ? ['24px', '32px', '24px'] : ['16px', '20px', '16px'],
                                                }}
                                                transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                                                className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[100%] blur-[1px] z-10 origin-top ${rocketCustomization.engineType === 'plasma' ? 'bg-gradient-to-b from-cyan-300 via-cyan-500 to-blue-600/10' :
                                                    rocketCustomization.engineType === 'nuclear' ? 'bg-gradient-to-b from-green-300 via-green-500 to-emerald-800/10' :
                                                        'bg-gradient-to-b from-orange-300 via-orange-500 to-red-600/10'
                                                    } `}
                                            />
                                        </div>
                                    </div>

                                    {/* Shared Diffusion Aura */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.15, 0.25, 0.15]
                                        }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-32 rounded-full blur-[30px] ${rocketCustomization.engineType === 'plasma' ? 'bg-cyan-400' :
                                            rocketCustomization.engineType === 'nuclear' ? 'bg-green-400' :
                                                'bg-orange-500'
                                            } `}
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                    <AnimatePresence>
                        {countdown !== null && countdown >= 0 && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                exit={{ scale: 2, opacity: 0 }}
                                key={countdown}
                                className="absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center justify-center w-full"
                            >
                                <span className={`font-black text-white glow-text-orange drop-shadow-[0_0_50px_rgba(234,88,12,0.8)] ${countdown === 0 ? "text-8xl" : "text-9xl"}`}>
                                    {countdown === 0 ? "LIFTOFF!" : countdown}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* LAUNCH BUTTON - OVERLAY IN FRONT OF ROCKET */}
                    <div className="absolute top-[82%] inset-x-0 flex justify-center z-[60]">
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: isLaunching ? 1 : [1, 1.1, 1],
                                borderColor: isLaunching ? "rgba(55, 65, 81, 0.5)" : [
                                    "rgba(59, 130, 246, 0.3)",
                                    "rgba(59, 130, 246, 0.9)",
                                    "rgba(59, 130, 246, 0.3)"
                                ],
                                boxShadow: isLaunching ? "0 0 0px rgba(59, 130, 246, 0)" : [
                                    "0 0 30px rgba(59, 130, 246, 0.3)",
                                    "0 0 60px rgba(59, 130, 246, 0.8)",
                                    "0 0 30px rgba(59, 130, 246, 0.3)"
                                ]
                            }}
                            transition={{
                                opacity: { duration: 0.5 },
                                y: { duration: 0.5 },
                                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                                borderColor: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                                boxShadow: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                            }}
                            disabled={isLaunching}
                            onClick={handleLaunchClick}
                            className={`px-12 py-4 rounded-2xl font-black text-xl uppercase tracking-[0.3em] transition-all relative overflow-hidden group border-2 whitespace-nowrap ${isLaunching
                                ? 'bg-gray-800/20 border-gray-700/50 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600/40 backdrop-blur-3xl text-white hover:border-blue-300 hover:bg-blue-500/50 hover:text-white active:scale-[0.95]'
                                }`}
                        >
                            {isLaunching ? (
                                <span className="flex items-center justify-center gap-4 animate-pulse">
                                    <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                                    SYSTEM READY...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-4">
                                    <Rocket className="w-6 h-6 group-hover:translate-y-[-4px] transition-transform" />
                                    발사 버튼
                                </span>
                            )}

                            {/* Scanning light animation */}
                            {!isLaunching && (
                                <motion.div
                                    animate={{
                                        x: ['-100%', '200%'],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "linear",
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent skew-x-12"
                                />
                            )}

                            {/* Constant pulse ring */}
                            {!isLaunching && (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2],
                                        opacity: [0.5, 0],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeOut",
                                    }}
                                    className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl pointer-events-none"
                                />
                            )}
                        </motion.button>
                    </div>
                </section>

                {/* Right Panel: Customization */}
                <section className="flex flex-col h-full pb-12 order-2 lg:order-none">
                    <div className="flex-1 flex flex-col justify-center mb-6">
                        <div className="glass-panel p-6">
                            <div className="flex items-center gap-3 mb-8">
                            </div>

                            {/* ... (rest of customization panel content remains same) ... */}

                            {/* Color Selector */}
                            <div className="mb-8">
                                <label className="text-[12px] font-bold text-gray-400 font-sans uppercase tracking-[0.2em] block mb-2">
                                    <span className="text-orange-500/80 mr-2">PAINT SCHEME</span>
                                    <br></br>나만의 색깔을 찾는 것이 중요해요!
                                </label>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-inner">
                                    <div className="grid grid-cols-10 gap-1">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => onUpdateCustomization({ ...rocketCustomization, color: c.value })}
                                                className={`w-full aspect-square transition-all transform hover:scale-110 relative group ${rocketCustomization.color === c.value ? 'scale-110 color-btn-glow' : 'opacity-70 hover:opacity-100 color-btn-shadow'}`}
                                            >
                                                <div
                                                    className={`absolute inset-0 ${c.class} opacity-75 backdrop-blur-[2px] clip-triangle`}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 pointer-events-none" />
                                                    <div className="absolute top-[20%] left-[25%] w-[50%] h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                                </div>

                                                {rocketCustomization.color === c.value && (
                                                    <div
                                                        className="absolute inset-[1px] bg-white/30 animate-pulse pointer-events-none z-10 clip-triangle overlay-blend"
                                                    />
                                                )}
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none border border-white/10">{c.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Fuel Tank Color Selector */}
                            <div className="mb-6">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-2">FUEL TANK COLOR (연료 탱크 색상)</label>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-inner">
                                    <div className="grid grid-cols-10 gap-1">
                                        {TANK_COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => onUpdateCustomization({ ...rocketCustomization, tankColor: c.value })}
                                                title={c.name}
                                                className={`h-6 w-full aspect-square rounded-sm border flex items-center justify-center transition-all group relative overflow-hidden shadow-lg ${rocketCustomization.tankColor === c.value ? 'border-white ring-1 ring-white/50 scale-110 z-10' : 'border-white/20 hover:border-white/50 hover:scale-110 hover:z-10'}`}
                                            >
                                                <div className={`w-full h-full ${c.class} opacity-75 relative overflow-hidden`}>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
                                                    <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-sm pointer-events-none" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Booster Color Selector */}
                            <div className="mb-6">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-2">BOOSTER COLOR (부스터 색상)</label>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-inner">
                                    <div className="grid grid-cols-10 gap-1">
                                        {TANK_COLORS.map(c => (
                                            <button
                                                key={`booster-${c.value}`}
                                                onClick={() => onUpdateCustomization({ ...rocketCustomization, boosterColor: c.value })}
                                                title={c.name}
                                                className={`h-6 w-full aspect-square rounded-full border flex items-center justify-center transition-all group relative overflow-hidden shadow-lg ${rocketCustomization.boosterColor === c.value ? 'border-white ring-1 ring-white/50 scale-110 z-10' : 'border-white/20 hover:border-white/50 hover:scale-110 hover:z-10'}`}
                                            >
                                                <div className={`w-full h-full ${c.class} opacity-75 relative overflow-hidden`}>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 pointer-events-none" />
                                                    <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full pointer-events-none" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Booster Message Input */}
                            <div className="mb-8">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-2">BOOSTER MESSAGE (LEFT / RIGHT)</label>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-inner">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block mb-1">LEFT</label>
                                            <input
                                                type="text"
                                                value={rocketCustomization.boosterMessageLeft || ""}
                                                onChange={(e) => updateBoosterMessages(e.target.value, rocketCustomization.boosterMessageRight || "")}
                                                placeholder="Left message"
                                                className="bg-transparent border-b border-white/10 text-white font-medium text-xs w-full focus:outline-none focus:border-orange-500/50 transition-colors py-1 px-1 font-sans"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] block mb-1">RIGHT</label>
                                            <input
                                                type="text"
                                                value={rocketCustomization.boosterMessageRight || ""}
                                                onChange={(e) => updateBoosterMessages(rocketCustomization.boosterMessageLeft || "", e.target.value)}
                                                placeholder="Right message"
                                                className="bg-transparent border-b border-white/10 text-white font-medium text-xs w-full focus:outline-none focus:border-orange-500/50 transition-colors py-1 px-1 font-sans"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decal Selector */}
                            <div className="mb-8">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4">MISSION DECAL (우주선 스티커)</label>
                                <div className="flex flex-wrap gap-2">
                                    {DECALS.map(decal => (
                                        <button
                                            key={decal}
                                            onClick={() => onUpdateCustomization({ ...rocketCustomization, decal })}
                                            className={`px-2 py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${rocketCustomization.decal === decal ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {decal === 'DEEP' ? <img src="/DEEP.png" alt="DEEP" className="w-8 h-4 object-contain" /> :
                                                decal === 'InblanQ' ? <img src="/inblanq.png" alt="InblanQ" className="w-10 h-4 object-contain" /> :
                                                    decal === 'gritx' ? <img src="/gritx.png" alt="GRIT" className="w-10 h-4 object-contain" /> :
                                                        decal === 'NASA' ? <img src="/NASA.png" alt="NASA" className="h-4 object-contain" /> :
                                                            decal === 'KOREA' ? <img src="/KOREA.webp" alt="KOREA" className="h-4 object-contain" /> : decal}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Engine Selector */}
                            <div className="mb-4">
                                <label className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4">엔진 추진장치</label>
                                <div className="flex gap-2">
                                    {ENGINE_TYPES.map(engine => (
                                        <button
                                            key={engine.id}
                                            onClick={() => onUpdateCustomization({ ...rocketCustomization, engineType: engine.id as RocketCustomization['engineType'] })}
                                            className={`flex-1 px-3 py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${rocketCustomization.engineType === engine.id ? 'bg-white/10 border-white/30' : 'bg-transparent border-white/5 opacity-50 hover:bg-white/5 hover:opacity-80'}`}
                                        >
                                            <div className={`p-2 rounded-lg bg-black/40 ${engine.color}`}>
                                                <engine.icon className="w-4 h-4" />
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-[8px] font-black uppercase tracking-widest ${rocketCustomization.engineType === engine.id ? 'text-white' : 'text-gray-400'}`}>{engine.label}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right sidebar and other sections are handled above */}
            </main>


            {/* Bottom Info Bar */}
            < footer className="w-full max-w-6xl z-10 mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-8 items-center justify-between" >
                <div className="flex gap-12 items-center">
                    <div className="flex items-center gap-3">
                        <Thermometer className="w-4 h-4 text-gray-500" />
                        <div>
                            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Ambient Temp</p>
                            <p className="text-xs font-mono font-bold text-green-400">22.4°C STABLE</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div>
                            <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Comms Link</p>
                            <p className="text-xs font-mono font-bold text-white">ESTABLISHED</p>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:block text-[9px] font-black text-white/20 uppercase tracking-[0.8em]">Antigravity Mission Control Alpha V4</div>
            </footer >
        </motion.div >
    );
};
