import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface SpaceFact {
    title: string;
    quote: string;
    insight: string;
    content: string;
    category: "Cosmos" | "History" | "Science" | "Human";
    year?: string;
}

interface ArchiveViewProps {
    isArchiveOpen: boolean;
    setIsArchiveOpen: (open: boolean) => void;
    archivePageIndex: number;
    setArchivePageIndex: (index: number) => void;
    direction: number;
    setDirection: (dir: number) => void;
    readPages: number[];
    setReadPages: (pages: number[] | ((prev: number[]) => number[])) => void;
    isDesktop: boolean;
    spaceFacts: SpaceFact[];
}

function ArchiveFactCard({ fact }: { fact: SpaceFact }) {
    return (
        <div className="flex-1 flex flex-col p-3 md:p-8 h-full overflow-hidden">
            <div className="space-y-3 md:space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[8px] md:text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                        {fact.category}
                    </span>
                    {fact.year && (
                        <span className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            • {fact.year}
                        </span>
                    )}
                </div>

                <h3 className="text-base md:text-2xl font-black text-white leading-tight break-keep">
                    {fact.title}
                </h3>

                <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    <p className="text-[11px] md:text-sm text-gray-300 font-medium leading-relaxed italic">
                        "{fact.quote}"
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                    <p className="text-[10px] md:text-sm text-gray-400 leading-relaxed font-medium whitespace-pre-line">
                        {fact.content}
                    </p>
                </div>
            </div>

            <div className="mt-2 md:mt-4 pt-4 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-2 text-cyan-500/40 mb-1.5">
                    <div className="h-[1px] w-4 bg-current" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">Technical Analysis</span>
                    <div className="h-[1px] flex-1 bg-current" />
                </div>
                <p className="text-[9px] md:text-xs text-cyan-400 font-bold leading-relaxed opacity-70">
                    {fact.insight}
                </p>
            </div>
        </div>
    );
}

const leftPageVariants = {
    enter: (direction: number) => ({
        rotateY: direction < 0 ? 120 : 0,
        opacity: 1,
        zIndex: 1,
    }),
    center: {
        rotateY: 0,
        opacity: 1,
        zIndex: 5,
    },
    exit: (direction: number) => ({
        rotateY: direction < 0 ? 120 : 0,
        opacity: direction > 0 ? 0 : 1,
        zIndex: direction < 0 ? 30 : 5,
    }),
};

const rightPageVariants = {
    enter: (direction: number) => ({
        rotateY: direction > 0 ? -120 : 0,
        opacity: 1,
        zIndex: 1,
    }),
    center: {
        rotateY: 0,
        opacity: 1,
        zIndex: 5,
    },
    exit: (direction: number) => ({
        rotateY: direction > 0 ? -180 : 0,
        opacity: direction < 0 ? 0 : 1,
        zIndex: direction > 0 ? 30 : 5,
    }),
};

const ArchiveView = ({
    isArchiveOpen,
    setIsArchiveOpen,
    archivePageIndex,
    setArchivePageIndex,
    direction,
    setDirection,
    readPages,
    setReadPages,
    isDesktop,
    spaceFacts
}: ArchiveViewProps) => {
    return (
        <motion.div
            key="archive"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-full flex flex-col p-4 sm:p-10 lg:p-16 max-w-[2000px] mx-auto overflow-hidden"
        >
            <AnimatePresence mode="wait">
                {!isArchiveOpen ? (
                    <motion.div
                        key="cover"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="relative group cursor-pointer" onClick={() => setIsArchiveOpen(true)}>
                            <div className="absolute -inset-10 bg-cyan-500/20 rounded-full blur-[60px] group-hover:bg-cyan-500/30 transition-all animate-pulse" />
                            <div className="w-48 h-64 sm:w-64 sm:h-80 bg-[#1a1a1e] border-2 border-cyan-500/30 rounded-r-3xl rounded-l-md shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,209,255,0.1)] flex flex-col items-center justify-center p-8 relative overflow-hidden group-hover:border-cyan-500/60 transition-all transform group-hover:-rotate-3 group-hover:-translate-y-2">
                                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-black/40" />
                                <BookOpen className="w-16 h-16 sm:w-24 sm:h-24 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none mb-2">COSMIC</h3>
                                <h3 className="text-xl sm:text-2xl font-black text-cyan-500 tracking-tighter leading-none">ARCHIVE</h3>
                                <div className="mt-8 pt-8 border-t border-white/10 w-full">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Mission BP-08</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 max-w-md">
                            <h2 className="text-2xl sm:text-3xl text-white uppercase tracking-widest font-bold">융합독서 아카이브</h2>
                            <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed">
                                인문-과학 통합 데이터베이스입니다.<br />
                                우주 공학 데이터를 기반으로 한 글쓰기 자료를 제공합니다.
                            </p>
                            <button
                                onClick={() => {
                                    setIsArchiveOpen(true);
                                    setReadPages(prev => {
                                        const newlyRead = [archivePageIndex];
                                        if (isDesktop && archivePageIndex + 1 < spaceFacts.length) newlyRead.push(archivePageIndex + 1);
                                        return [...new Set([...prev, ...newlyRead])];
                                    });
                                }}
                                className="px-10 py-4 bg-cyan-500 text-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(0,209,255,0.4)] active:scale-95"
                            >
                                아카이브 열람
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsArchiveOpen(false)}
                                    aria-label="커버로 돌아가기"
                                    title="커버로 돌아가기"
                                    className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all font-sans"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-xs md:text-sm font-black text-gray-300 tracking-[0.2em] uppercase">
                                        딥리딩 아카이브 (COSMIC KNOWLEDGE)
                                    </h2>
                                    <div className="text-[10px] text-cyan-500/60 font-bold uppercase tracking-widest">
                                        {isDesktop ? (
                                            <>Documenting the Infinite... Pages {archivePageIndex + 1}-{Math.min(archivePageIndex + 2, spaceFacts.length)} of {spaceFacts.length} ({readPages.length} READ)</>
                                        ) : (
                                            <>Documenting the Infinite... Page {archivePageIndex + 1} of {spaceFacts.length} ({readPages.length} READ)</>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const prevIdx = Math.max(0, archivePageIndex - (isDesktop ? 2 : 1));
                                        setDirection(-1);
                                        setArchivePageIndex(prevIdx);
                                        setReadPages(prev => {
                                            const newlyRead = [prevIdx];
                                            if (isDesktop && prevIdx + 1 < spaceFacts.length) newlyRead.push(prevIdx + 1);
                                            return [...new Set([...prev, ...newlyRead])];
                                        });
                                    }}
                                    disabled={archivePageIndex === 0}
                                    aria-label="Previous Page"
                                    title="Previous Page"
                                    className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 font-sans"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        const nextIdx = Math.min(spaceFacts.length - 1, archivePageIndex + (isDesktop ? 2 : 1));
                                        setDirection(1);
                                        setArchivePageIndex(nextIdx);
                                        setReadPages(prev => {
                                            const newlyRead = [nextIdx];
                                            if (isDesktop && nextIdx + 1 < spaceFacts.length) newlyRead.push(nextIdx + 1);
                                            return [...new Set([...prev, ...newlyRead])];
                                        });
                                    }}
                                    disabled={isDesktop ? archivePageIndex >= spaceFacts.length - 2 : archivePageIndex === spaceFacts.length - 1}
                                    aria-label="Next Page"
                                    title="Next Page"
                                    className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 font-sans"
                                >
                                    <ChevronRight className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center perspective-[3000px] min-h-0 bg-[#0c0c0e]/30 rounded-3xl p-4 sm:p-8 overflow-hidden font-sans">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={archivePageIndex}
                                    custom={direction}
                                    initial={{ opacity: 1, zIndex: 1 }}
                                    animate={{ opacity: 1, zIndex: 1 }}
                                    exit={{ zIndex: 10 }}
                                    className="absolute inset-8 max-w-6xl mx-auto flex bg-[#1a1a1e] rounded-2xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <motion.div
                                        variants={leftPageVariants}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        style={{ originX: 1, transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                                        className="flex-1 h-full overflow-hidden bg-[#1a1a1e] rounded-l-2xl"
                                    >
                                        <ArchiveFactCard fact={spaceFacts[archivePageIndex]} />
                                    </motion.div>

                                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/40 z-50 shadow-[0_0_15px_rgba(0,0,0,1)] pointer-events-none" />

                                    {isDesktop ? (
                                        <motion.div
                                            variants={rightPageVariants}
                                            transition={{ duration: 0.8, ease: "easeInOut" }}
                                            style={{ originX: 0, transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                                            className="flex-1 border-l border-white/5 bg-[#1a1a1e] rounded-r-2xl overflow-hidden"
                                        >
                                            {archivePageIndex + 1 < spaceFacts.length ? (
                                                <ArchiveFactCard fact={spaceFacts[archivePageIndex + 1]} />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center space-y-4 opacity-20 grayscale">
                                                    <BookOpen className="w-20 h-20 text-gray-600" />
                                                    <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">
                                                        Information Pending...
                                                    </p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : null}
                                </motion.div>
                            </AnimatePresence>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-4/5 h-12 bg-cyan-500/10 blur-3xl rounded-full -mt-8 -z-10" />
                        </div>

                        <div className="mt-12 flex gap-1 justify-center">
                            {spaceFacts.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-300 ${(isDesktop && (i === archivePageIndex || i === archivePageIndex + 1)) || (!isDesktop && i === archivePageIndex)
                                        ? 'w-8 bg-cyan-500'
                                        : 'w-2 bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ArchiveView;
