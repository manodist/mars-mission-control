import { ChevronLeft, FileText, Heart, Rocket, ShieldAlert, Trophy, Zap } from 'lucide-react';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameState } from '../../types/game';

interface GameStrategyModalProps {
    state: GameState;
    closeModal: () => void;
}

// 게임 조작법 및 전략 가이드(매뉴얼) 모달
// 게임 시작 전에 플레이어가 확인할 수 있는 도움말 화면입니다.
export const GameStrategyModal: React.FC<GameStrategyModalProps> = ({ state, closeModal }) => {
    return (
        <AnimatePresence>
            {state.showStrategyModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="terminal-panel max-w-2xl w-full max-h-[80vh] flex flex-col bg-black/80 border-cyan-500/30 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl my-8"
                    >
                        {/* Header - Fixed */}
                        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10 bg-black/40 backdrop-blur-md z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg hidden sm:block">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">전략실 (매뉴얼)</h2>
                                    <p className="text-[9px] md:text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Protocol: Strategy_Guide_Alpha</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                title="창 닫기"
                                aria-label="창 닫기"
                                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-500 group-hover:text-white" />
                            </button>
                        </div>

                        {/* Content area - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 md:space-y-10 custom-scrollbar">
                            <section>
                                <h3 className="text-xs md:text-sm font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Rocket className="w-4 h-4" /> 기본 함선 조작
                                </h3>
                                <div className="bg-white/5 rounded-xl p-4 md:p-5 border border-white/5 space-y-3">
                                    <p className="text-gray-300 text-[13px] md:text-sm leading-relaxed">
                                        커서나 터치를 따라가며 기동합니다. 연료가 소진되지 않게 지속적으로 노란색 충전 아이템을 획득하세요. 힘들면 우주정거장에서 잠시 휴식을 취하거나 자동 항법 시스템을 참고해도 좋습니다.                                   </p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs md:text-sm font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" /> 생존 및 방어 시스템
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                    <div className="bg-red-950/20 rounded-xl p-4 border border-red-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            <span className="text-xs font-bold text-white uppercase">내구도 관리</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed">충돌 시 손상을 입고, 0이 되면 기체가 파괴됩니다. 핑크색 수리 아이템으로 복구 가능합니다.</p>
                                    </div>
                                    <div className="bg-green-950/20 rounded-xl p-4 border border-green-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-4 h-4 text-green-500" />
                                            <span className="text-xs font-bold text-white uppercase">에너지 쉴드</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed">녹색 방패 아이템 획득 시 보호막이 생성됩니다. 충돌 피해 무효화로 전진을 돕습니다.</p>
                                    </div>
                                    <div className="bg-orange-950/20 rounded-xl p-4 border border-orange-500/20 sm:col-span-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap className="w-4 h-4 text-orange-500" />
                                            <span className="text-xs font-bold text-white uppercase">자동 회피 시스템</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed">
                                            레벨이 오를 때마다 자동 회피 가능 횟수가 증가합니다. 고속 상승으로 장애물을 뛰어넘습니다.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xs md:text-sm font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Trophy className="w-4 h-4" /> 레벨업 및 강화
                                </h3>
                                <div className="bg-purple-950/10 rounded-xl p-6 border border-purple-500/20">
                                    <p className="text-[13px] text-gray-300 leading-relaxed mb-4 text-left">
                                        앞으로 나아가는 것만으로도 푸르게 빛나는 광물과 별빛을 모으며 경험치를 쌓아 레벨업 할 수 있습니다.
                                    </p>
                                    <div className="pt-4 border-t border-purple-500/10 text-left">
                                        <p className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] uppercase tracking-tight">
                                            포기하지 않고 재도전 하면 더욱 강해질 수 있습니다. <br></br><br></br>"중요한 것은, 꺾이지 않는 마음"
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-4 md:p-6 bg-black/40 border-t border-white/10 backdrop-blur-md">
                            <button
                                onClick={closeModal}
                                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-[0_50px_rgba(8,145,178,0.3)]/0 active:scale-[0.98]"
                            >
                                확인 완료
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
