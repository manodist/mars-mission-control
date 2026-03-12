import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Settings, Sliders, Volume2, Music } from 'lucide-react';
import type { GameTweaks, GameState } from '../../types/game';

interface GameSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tweaks: GameTweaks;
    setTweaks: (tweaks: GameTweaks) => void;
    bgmVolume: number;
    bgmTrack: string;
    setState: React.Dispatch<React.SetStateAction<GameState>>;
    autoDifficulty?: { speed: number; density: number }; // 자동 진행도 (읽기 전용 표시용)
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
    isOpen,
    onClose,
    tweaks,
    setTweaks,
    bgmVolume,
    bgmTrack,
    setState,
    autoDifficulty
}) => {

    const handleChange = (key: keyof GameTweaks, value: number) => {
        setTweaks({
            ...tweaks,
            [key]: value
        });
    };

    const handleVolumeChange = (volume: number) => {
        setState(prev => ({ ...prev, bgmVolume: volume }));
    };

    const handleTrackChange = (track: string) => {
        setState(prev => ({ ...prev, bgmTrack: track }));
    };

    const handleReset = () => {
        setTweaks({
            speedMultiplier: 1.0,
            obstacleDensity: 1.0,
            itemFrequency: 1.0,
            rocketScale: 1.0
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="terminal-panel max-w-lg w-full max-h-[90vh] flex flex-col bg-black/80 border-cyan-500/30 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-cyan-500/20 rounded-lg">
                                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tighter">게임 설정 (Tweak)</h2>
                                    <p className="text-[8px] sm:text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Protocol: Override_Alpha</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                title="Close Settings"
                                aria-label="Close Settings"
                                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors group"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 group-hover:text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">

                            {/* 자동 진행도 표시 (읽기 전용) */}
                            {autoDifficulty && (autoDifficulty.speed > 1.0 || autoDifficulty.density > 1.0) && (
                                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] sm:text-xs font-mono">
                                    <span className="text-gray-400 uppercase tracking-widest">자동 진행도</span>
                                    <div className="flex gap-3">
                                        <span className="text-cyan-400">속도 <span className="text-white font-bold">{autoDifficulty.speed.toFixed(1)}x</span></span>
                                        <span className="text-red-400">밀도 <span className="text-white font-bold">{autoDifficulty.density.toFixed(1)}x</span></span>
                                    </div>
                                </div>
                            )}

                            {/* Speed Multiplier */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="speed-multiplier" className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                                        <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> 게임 속도
                                    </label>
                                    <span className="text-cyan-400 font-mono font-bold text-sm">{tweaks.speedMultiplier.toFixed(1)}x</span>
                                </div>
                                <input
                                    id="speed-multiplier"
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={tweaks.speedMultiplier}
                                    title="Speed Multiplier"
                                    onChange={(e) => handleChange('speedMultiplier', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <div className="hidden sm:flex justify-between text-[9px] text-gray-500 font-mono">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>3.0x</span>
                                </div>
                            </div>

                            {/* Obstacle Density */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="obstacle-density" className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                                        <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> 장애물 밀도
                                    </label>
                                    <span className="text-red-400 font-mono font-bold text-sm">{tweaks.obstacleDensity.toFixed(1)}x</span>
                                </div>
                                <input
                                    id="obstacle-density"
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={tweaks.obstacleDensity}
                                    title="Obstacle Density"
                                    onChange={(e) => handleChange('obstacleDensity', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <div className="hidden sm:flex justify-between text-[9px] text-gray-500 font-mono">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>3.0x</span>
                                </div>
                            </div>

                            {/* Item Frequency */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="item-frequency" className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                                        <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" /> 아이템 빈도
                                    </label>
                                    <span className="text-yellow-400 font-mono font-bold text-sm">{tweaks.itemFrequency.toFixed(1)}x</span>
                                </div>
                                <input
                                    id="item-frequency"
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={tweaks.itemFrequency}
                                    title="Item Frequency"
                                    onChange={(e) => handleChange('itemFrequency', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                                <div className="hidden sm:flex justify-between text-[9px] text-gray-500 font-mono">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>3.0x</span>
                                </div>
                            </div>

                            {/* Rocket Scale */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="rocket-scale" className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                                        <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" /> 로켓 크기
                                    </label>
                                    <span className="text-purple-400 font-mono font-bold text-sm">{tweaks.rocketScale.toFixed(1)}x</span>
                                </div>
                                <input
                                    id="rocket-scale"
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={tweaks.rocketScale}
                                    title="Rocket Scale"
                                    onChange={(e) => handleChange('rocketScale', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                                <div className="hidden sm:flex justify-between text-[9px] text-gray-500 font-mono">
                                    <span>0.5x</span>
                                    <span>1.0x</span>
                                    <span>2.0x</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-white/10" />

                            {/* BGM Volume */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="bgm-volume" className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" /> BGM 볼륨
                                    </label>
                                    <span className="text-green-400 font-mono font-bold text-sm">{Math.round(bgmVolume * 100)}%</span>
                                </div>
                                <input
                                    id="bgm-volume"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={bgmVolume}
                                    title="BGM Volume"
                                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                                <div className="hidden sm:flex justify-between text-[9px] text-gray-500 font-mono">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* BGM Track Selection */}
                            <div className="space-y-2">
                                <label htmlFor="bgm-track" className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
                                    <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" /> BGM 트랙
                                </label>
                                <select
                                    id="bgm-track"
                                    value={bgmTrack}
                                    onChange={(e) => handleTrackChange(e.target.value)}
                                    className="w-full px-3 py-1.5 sm:py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs sm:text-sm"
                                >
                                    <option value="space opera.mp3">🎼 Space Opera</option>
                                    <option value="Space Ambient.mp3">🌌 Space Ambient</option>
                                    <option value="Space Arcade.mp3">🕹️ Space Arcade</option>
                                    <option value="space racer.mp3">🚀 Space Racer</option>
                                </select>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                            >
                                초기화
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                            >
                                닫기
                            </button>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
