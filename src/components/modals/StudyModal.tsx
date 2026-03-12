import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, History, Target, MessageCircle, Lightbulb } from 'lucide-react';
import type { LearningPage } from '../../data/learningProgram';

interface StudyModalProps {
    pages: LearningPage[] | null;
    initialPageIndex?: number;
    onClose: () => void;
    // 📝 onComplete: 미션 ID 완료 + 사용자 답변(Record<pageId, 답변텍스트>)을 함께 전달
    onComplete: (id: number, answers?: Record<number, string>) => void;
}

const StudyModal = ({ pages, initialPageIndex = 0, onClose, onComplete }: StudyModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialPageIndex);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    if (!pages || pages.length === 0) return null;

    const page = pages[currentIndex];
    const CategoryIcon = page.category === '소설' ? BookOpen : page.category === '역사' ? History : Target;
    const isLastPage = currentIndex === pages.length - 1;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-2xl"
        >
            <div className="absolute inset-0" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.9, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                className="relative w-full max-w-6xl h-[95vh] md:h-[90vh] overflow-hidden bg-[#0a0a0c] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col"
            >
                {/* Header - Fixed Height */}
                <div className="flex-shrink-0 z-10 px-6 py-4 md:px-10 md:py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border transition-all duration-500 shadow-2xl ${page.category === '소설' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                            page.category === '역사' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            }`}>
                            <CategoryIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-3">
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-[8px] md:text-[9px] font-black text-cyan-400 uppercase tracking-tighter shrink-0">
                                    {currentIndex + 1} / {pages.length} PAGES
                                </span>
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40 hidden sm:inline truncate leading-none">{page.category} 분석 로그</span>
                                <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:inline shrink-0" />
                                <span className="text-[9px] md:text-[10px] font-bold text-cyan-400 uppercase tracking-tight truncate leading-none">{page.location}</span>
                            </div>
                            <h2 className="text-lg md:text-2xl font-black text-white tracking-tight leading-tight mt-0.5 line-clamp-1">{page.title}</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="닫기"
                        className="p-1.5 md:p-2.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Content Area - Strictly Fitted with Min Padding */}
                <div className="flex-1 min-h-0 p-3 md:p-6 lg:p-8 flex flex-col overflow-hidden">
                    <div className="flex-1 min-h-0 bg-white/[0.01] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={page.id}
                                initial={{ opacity: 0, scale: 0.995 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.005 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="h-full flex flex-col lg:flex-row overflow-hidden"
                            >
                                {/* Left Side - Visual */}
                                <div className="w-full h-48 md:h-64 lg:h-full lg:w-[45%] xl:w-[40%] relative flex items-center justify-center bg-black/40 p-4 md:p-6 lg:p-8 overflow-hidden shrink-0">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={page.visual}
                                            alt={page.title}
                                            className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                                        />
                                    </div>
                                    <div className="absolute top-4 left-4 flex gap-2 opacity-30">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse [animation-delay:200ms]" />
                                    </div>
                                </div>

                                {/* Right Side - Text & Insight (Independent Scroll) */}
                                <div className="flex-1 min-h-0 flex flex-col bg-[#08080a] lg:border-l border-t lg:border-t-0 border-white/5 overflow-hidden">
                                    <div className="flex-1 flex flex-col p-5 md:p-6 lg:p-8 min-h-0 space-y-4 md:space-y-6 overflow-hidden">
                                        {/* Content Block (Scrollable) */}
                                        <div className="flex-1 min-h-0 flex flex-col space-y-3 md:space-y-4">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit shrink-0">
                                                <BookOpen className="w-3.5 h-3.5 fill-current animate-pulse" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">Primary Source Record</span>
                                            </div>

                                            <div className="flex-1 overflow-y-auto pr-2 sm:pr-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                                                <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
                                                    {page.content}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 📝 질문이 있는 페이지: 심층 분석 과제 + 답변 입력 */}
                                        {page.question && (
                                            <div className="flex-shrink-0 mt-auto relative p-5 md:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/[0.05] to-purple-500/[0.05] border border-white/[0.05] shadow-xl group/card">
                                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/5 blur-[50px] pointer-events-none" />

                                                <div className="relative z-10 space-y-2 md:space-y-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                                                            <MessageCircle className="w-3 h-3 font-black" />
                                                        </div>
                                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">심층 분석 과제</span>
                                                    </div>

                                                    <blockquote className="text-sm md:text-base font-normal text-white/70 leading-relaxed italic border-l-2 border-cyan-500/30 pl-4 mb-2">
                                                        "{page.question}"
                                                    </blockquote>

                                                    <textarea
                                                        className="w-full mt-3 bg-black/40 border border-white/10 rounded-xl p-3 md:p-4 text-[13px] md:text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.02] focus:ring-1 focus:ring-cyan-500/50 resize-none transition-all scrollbar-hide"
                                                        rows={2}
                                                        placeholder="질문에 대한 자신의 생각을 1~2줄로 간단히 적어보세요..."
                                                        value={answers[page.id] || ''}
                                                        onChange={(e) => {
                                                            setAnswers(prev => ({
                                                                ...prev,
                                                                [page.id]: e.target.value
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* 💡 질문 없는 페이지: 인사이트 카드 표시 */}
                                        {!page.question && page.insight && (
                                            <div className="flex-shrink-0 mt-auto relative p-5 md:p-6 rounded-2xl bg-gradient-to-br from-amber-500/[0.05] to-yellow-500/[0.03] border border-amber-500/10 shadow-xl">
                                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 blur-[50px] pointer-events-none" />
                                                <div className="relative z-10 flex items-start gap-3">
                                                    <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mt-0.5">
                                                        <Lightbulb className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 block mb-1.5">Key Insight</span>
                                                        <p className="text-[13px] md:text-sm text-white/70 leading-relaxed font-medium">
                                                            {page.insight}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer - Fixed Height */}
                <div className="flex-shrink-0 px-8 py-5 md:px-12 md:py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between backdrop-blur-xl">
                    <div className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] hidden sm:block opacity-50">
                        {`Protocol Step: ${currentIndex + 1} / ${pages.length}`}
                    </div>
                    <div className="flex gap-3 md:gap-4 w-full sm:w-auto">
                        {currentIndex > 0 && (
                            <button
                                onClick={() => setCurrentIndex(prev => prev - 1)}
                                className="flex-1 sm:flex-none px-6 py-3.5 border border-white/10 text-white text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all active:scale-95"
                            >
                                이전
                            </button>
                        )}
                        {!isLastPage ? (
                            <button
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                                className="flex-1 sm:flex-none px-10 py-3.5 bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all shadow-xl active:scale-95 duration-200"
                            >
                                다음 페이지
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    // 📝 각 페이지 완료 처리 시 사용자 답변도 함께 전달
                                    pages.forEach(p => onComplete(p.id, answers));
                                    onClose();
                                }}
                                className="flex-1 sm:flex-none px-10 py-3.5 bg-cyan-500 text-black text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)] active:scale-95 duration-200"
                            >
                                분석 완료
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default StudyModal;
