import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RocketShip } from './RocketShip';
import type { GameState, Position } from '../../types/game';

interface GamePlayerProps {
    state: GameState;
    playerPosition: Position;
    launchPhase: string;
    speedMultiplier?: number;
    rocketScale?: number;
}

const TANK_COLORS = [
    { name: 'White', value: 'white', class: 'bg-slate-50', borderClass: 'border-slate-300' },
    { name: 'Deep Orange', value: 'orange', class: 'bg-orange-600', borderClass: 'border-orange-800' },
    { name: 'Titanium', value: 'titanium', class: 'bg-zinc-400', borderClass: 'border-zinc-500' },
    { name: 'Carbon Black', value: 'black', class: 'bg-zinc-900', borderClass: 'border-zinc-950' },
    { name: 'Navy Blue', value: 'navy', class: 'bg-blue-900', borderClass: 'border-blue-950' },
];

/**
 * 🚀 성능 최적화: GamePlayer 컴포넌트 메모이제이션
 * 
 * 주요 최적화 사항:
 * 1. React.memo 적용: props가 변경되지 않으면 리렌더링 방지
 * 2. translate3d 사용: GPU 가속을 통해 렌더링 성능 향상
 * 3. will-change 속성 추가: 브라우저에게 변화를 예고하여 페인팅 최적화
 */
export const GamePlayer = React.memo(({
    state,
    playerPosition,
    launchPhase,
    speedMultiplier = 1,
    rocketScale = 1
}: GamePlayerProps) => {
    // 🚀 필요한 상태값만 구조 분해 할당하여 사용
    const { rocketCustomization, gameStarted, isLanding, shieldActive, isDodgeFlashing, planetAbsorbing } = state;

    // 🎮 레벨 기반 로켓 응답성 배율: 레벨이 높을수록 마우스 추적이 더 민첩해짐 (최대 3배)
    // xpLevel(점수 기반)이 높을수록 조종이 즉각적이고 찰져짐
    const xpLevel = Math.floor(state.score / 1000) + 1;
    const levelResponseMultiplier = Math.min(3, 1 + (xpLevel - 1) * 0.15);

    // 📏 레벨 기반 로켓 크기 배율: 레벨당 4%씩 성장, 최대 50%까지 (레벨 13 이상)
    // 레벨1=1.0, 레벨5=1.16, 레벨10=1.36, 레벨13+=1.5 (캡)
    const levelSizeScale = Math.min(1.5, 1 + (xpLevel - 1) * 0.04);

    // 🔥 엔진 화염 동적 길이: 위로 이동(앞으로 나아감) 시 길게, 정지/아래로 이동 시 짧게
    const [flameHeight, setFlameHeight] = useState(2.5); // rem 단위 (Tailwind h-10 = 2.5rem)
    const prevPositionY = useRef(playerPosition.y);
    useEffect(() => {
        // dy > 0: 위로 이동(앞으로 나아감) → 화염 길어짐
        // dy < 0: 아래로 이동(뒤로) → 화염 짧아짐
        const dy = prevPositionY.current - playerPosition.y;
        prevPositionY.current = playerPosition.y;
        const targetH = Math.max(1, Math.min(6, 2.5 + dy * 2.0));
        // 급격한 변화 방지를 위해 lerp(부드러운 보간) 적용
        setFlameHeight(prev => prev * 0.75 + targetH * 0.25);
    }, [playerPosition.y]);

    const tankColorObj = TANK_COLORS.find(c => c.value === rocketCustomization.tankColor) || TANK_COLORS[1];
    const boosterColorObj = TANK_COLORS.find(c => c.value === rocketCustomization.boosterColor) || TANK_COLORS[0];

    // Booster Message Split Logic (정적 계산부)
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

    return (
        <>
            {gameStarted && (
                <motion.div
                    animate={{
                        left: `${playerPosition.x}%`,
                        top: `${playerPosition.y}%`,
                        x: '-50%',  // 🎯 framer-motion이 translate와 scale을 하나의 transform으로 합성
                        y: '-50%',  // 🎯 인라인 style의 transform은 framer-motion이 scale 적용 시 덮어쓰므로 여기서 관리
                        // 행성 흡수 시: 0으로 축소 + 투명, 착륙 시: 0.2로 축소, 평상시: 레벨 성장 크기 적용
                        scale: planetAbsorbing ? 0 : (isLanding ? 0.2 : rocketScale * levelSizeScale),
                        opacity: planetAbsorbing ? 0 : 1,
                    }}
                    transition={{
                        type: 'spring',
                        // 레벨이 높을수록 stiffness↑ → 로켓이 마우스를 더 민첩하게 추적
                        stiffness: 1200 * speedMultiplier * levelResponseMultiplier,
                        // damping도 sqrt 비율로 함께 올려 과진동(overshoot) 방지
                        damping: 35 * speedMultiplier * Math.sqrt(levelResponseMultiplier),
                        x: { type: false },  // translate는 즉시 적용 (spring 불필요)
                        y: { type: false },
                        // 흡수 시 빠르게 사라짐(0.5s), 착륙 시 천천히 축소(3s), 레벨업 성장은 1.2s
                        scale: planetAbsorbing
                            ? { duration: 0.5, ease: "easeIn" }
                            : isLanding
                                ? { duration: 3, ease: "easeInOut" }
                                : { duration: 1.2, ease: "easeOut" },
                        opacity: { duration: 0.5, ease: "easeIn" },
                    }}
                    className="absolute w-16 h-16 flex flex-col items-center z-40 pointer-events-none"
                    style={{
                        willChange: 'left, top' // GPU 가속 힌트 유지
                    }}
                >

                    <div className="relative">
                        {/* 쉴드 이펙트 */}
                        {shieldActive > 0 && (
                            <>
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute -inset-6 border-2 border-green-400 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)]"
                                />
                                <motion.div
                                    animate={{ scale: [1.2, 1.5, 1.2], opacity: [0.4, 0.1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -inset-8 border border-green-300 rounded-full"
                                />
                            </>
                        )}

                        {/* Staging Sequence Visuals */}
                        <AnimatePresence>
                            {(launchPhase === 'staging_initial' || launchPhase === 'staging_boosters_off') && (
                                <motion.div
                                    key="main-tank"
                                    initial={{ x: "-50%", y: 4, scale: 1, opacity: 1 }}
                                    animate={{ x: "-50%", y: 4, scale: 1, opacity: 1 }}
                                    exit={{ x: "-50%", y: 150, opacity: 0, transition: { duration: 1.5, ease: "easeIn" } }}
                                    className="absolute left-1/2 w-14 h-32 flex flex-col items-center mt-20 z-[15]"
                                >
                                    <div className={`w-full h-full rounded-t-xl rounded-b-md border-x shadow-[0_0_10px_rgba(0,0,0,0.3)] overflow-hidden relative ${tankColorObj.class} ${tankColorObj.borderClass}`}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-white/10 to-black/40" />
                                        <div className="absolute top-8 w-full h-px bg-black/20" />
                                        <div className="absolute top-16 w-full h-px bg-black/20" />
                                        <div className="absolute top-24 w-full h-px bg-black/20" />
                                        {rocketCustomization.astronautName && (
                                            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-[5px] w-full text-center pointer-events-none z-[35]">
                                                <span className="text-[6px] font-black text-white bg-black/60 px-1 rounded-xs uppercase tracking-[1px] whitespace-nowrap font-sans border border-white/20 shadow-md backdrop-blur-sm">
                                                    {rocketCustomization.astronautName} 호
                                                </span>
                                            </div>
                                        )}
                                        {rocketCustomization.decal !== 'none' && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 scale-75 drop-shadow-md">
                                                {rocketCustomization.decal === 'DEEP' && <img src="/DEEP.png" alt="DEEP" className="w-12 h-12 object-contain opacity-90" />}
                                                {rocketCustomization.decal === 'InblanQ' && <img src="/inblanq.png" alt="InblanQ" className="h-10 object-contain opacity-90" />}
                                                {rocketCustomization.decal === 'gritx' && <img src="/gritx.png" alt="GRIT" className="w-12 h-12 object-contain relative z-10" />}
                                                {rocketCustomization.decal === 'NASA' && <img src="/NASA.png" alt="NASA" className="w-12 h-12 object-contain" />}
                                                {rocketCustomization.decal === 'KOREA' && <img src="/KOREA.webp" alt="KOREA" className="w-12 h-12 object-contain" />}
                                            </div>
                                        )}
                                    </div>
                                    <motion.div
                                        animate={{ scaleY: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                                        transition={{ repeat: Infinity, duration: 0.15 }}
                                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-8 h-16 bg-gradient-to-b from-orange-300 via-red-500 to-transparent blur-md z-0"
                                    />
                                </motion.div>
                            )}

                            {(launchPhase === 'staging_initial' || launchPhase === 'staging_boosters_off' || launchPhase === 'staging_tank_off') && (
                                <motion.div
                                    key="payload-fairing"
                                    initial={{ x: "-50%", y: 4, scale: 1, opacity: 1 }}
                                    animate={{ x: "-50%", y: 4, scale: 1, opacity: 1 }}
                                    exit={{ x: "-50%", y: 400, scale: 0.2, opacity: 0, transition: { duration: 3, ease: "easeInOut" } }}
                                    className="absolute left-1/2 w-16 h-24 z-[25]"
                                >
                                    <div className="absolute inset-0 bg-slate-50 border-x border-t border-slate-200 rounded-t-[50px] shadow-lg overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-transparent to-black/5" />
                                        <div className="absolute top-10 left-0 w-full h-[1px] bg-slate-200" />
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-slate-200" />
                                    </div>
                                </motion.div>
                            )}

                            {(launchPhase === 'staging_initial') && (
                                <>
                                    <motion.div
                                        key="left-booster"
                                        initial={{ x: -60, y: 60, opacity: 0 }}
                                        animate={{ x: -28, y: 80, opacity: 1 }}
                                        exit={{ x: -140, y: 60, rotate: -30, opacity: 0, transition: { duration: 1 } }}
                                        className={`absolute right-1/2 w-5 h-20 rounded-full border-r-2 flex items-center justify-center -z-10 shadow-md mr-1 overflow-hidden ${boosterColorObj.class} ${boosterColorObj.borderClass}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/20 to-black/20 pointer-events-none" />
                                        {leftBoosterMsg && (
                                            <div className="absolute inset-0 flex items-center justify-center p-0.5">
                                                <span className="text-[5px] font-black text-black/80 uppercase whitespace-nowrap vertical-text tracking-tighter">
                                                    {leftBoosterMsg}
                                                </span>
                                            </div>
                                        )}
                                        <motion.div
                                            animate={{ scaleY: [1, 1.3, 1], opacity: [0.9, 1, 0.9] }}
                                            transition={{ repeat: Infinity, duration: 0.1 }}
                                            className="absolute top-[95%] left-1/2 -translate-x-1/2 w-3 h-10 bg-gradient-to-b from-yellow-200 via-orange-500 to-transparent blur-sm"
                                        />
                                    </motion.div>

                                    <motion.div
                                        key="right-booster"
                                        initial={{ x: 60, y: 60, opacity: 0 }}
                                        animate={{ x: 28, y: 80, opacity: 1 }}
                                        exit={{ x: 140, y: 60, rotate: 30, opacity: 0, transition: { duration: 1 } }}
                                        className={`absolute left-1/2 w-5 h-20 rounded-full border-l-2 flex items-center justify-center -z-10 shadow-md ml-1 overflow-hidden ${boosterColorObj.class} ${boosterColorObj.borderClass}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-white/20 to-black/20 pointer-events-none" />
                                        {rightBoosterMsg && (
                                            <div className="absolute inset-0 flex items-center justify-center p-0.5">
                                                <span className="text-[5px] font-black text-black/80 uppercase whitespace-nowrap vertical-text tracking-tighter">
                                                    {rightBoosterMsg}
                                                </span>
                                            </div>
                                        )}
                                        <motion.div
                                            animate={{ scaleY: [1, 1.3, 1], opacity: [0.9, 1, 0.9] }}
                                            transition={{ repeat: Infinity, duration: 0.1 }}
                                            className="absolute top-[95%] left-1/2 -translate-x-1/2 w-3 h-10 bg-gradient-to-b from-yellow-200 via-orange-500 to-transparent blur-sm"
                                        />
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        <div className="relative flex items-center justify-center">
                            <RocketShip
                                className={`w-14 h-14 transition-all duration-100 ${isDodgeFlashing ? 'drop-shadow-[0_0_15px_rgba(251,146,60,1)] scale-110' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}
                                color={rocketCustomization.color || "#e2e8f0"}
                                isDodgeFlashing={isDodgeFlashing}
                            />
                            {rocketCustomization.decal !== 'none' && !isDodgeFlashing && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="opacity-40 -rotate-45 flex items-center justify-center">
                                        {rocketCustomization.decal === 'DEEP' && <img src="/DEEP.png" alt="DEEP" className="w-8 h-8 object-contain opacity-60" />}
                                        {rocketCustomization.decal === 'gritx' && <img src="/gritx.png" alt="GRIT" className="w-6 h-6 object-contain relative z-10" />}
                                        {rocketCustomization.decal === 'NASA' && <img src="/NASA.png" alt="NASA" className="w-6 h-6 object-contain" />}
                                        {rocketCustomization.decal === 'KOREA' && <img src="/KOREA.webp" alt="KOREA" className="w-6 h-6 object-contain" />}
                                    </div>
                                </div>
                            )}
                        </div>
                        <motion.div
                            animate={{ scaleY: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ repeat: Infinity, duration: 0.1 }}
                            className={`absolute top-[80%] left-1/2 -translate-x-1/2 w-4 bg-gradient-to-b via-red-600 to-transparent blur-[2px] ${rocketCustomization.engineType === 'plasma' ? 'from-cyan-500 shadow-[0_5px_15px_rgba(34,211,238,0.5)]' :
                                rocketCustomization.engineType === 'nuclear' ? 'from-green-500 shadow-[0_5px_15px_rgba(34,197,94,0.5)]' : 'from-orange-500 shadow-[0_5px_15px_rgba(249,115,22,0.5)]'
                                }`}
                            // 이동 방향에 따라 화염 길이 동적 변경 (앞=길게, 뒤/정지=짧게)
                            style={{ height: `${flameHeight}rem` }}
                        />
                    </div>
                </motion.div >
            )}
        </>
    );
});

GamePlayer.displayName = 'GamePlayer';
