import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Calendar, CheckCircle2, MessageSquare, PenLine } from 'lucide-react';
import { LEARNING_PROGRAM } from '../../data/learningProgram';

interface MissionSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    userInfo: {
        name: string;
        age: string;
        dream: string;
        role: string;
    };
    // 📝 사용자가 StudyModal에서 작성한 답변들
    userAnswers?: Record<number, string>;
}

const MissionSuccessModal = ({ isOpen, onClose, userInfo, userAnswers = {} }: MissionSuccessModalProps) => {
    const today = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // 📝 답변이 있는 페이지들만 필터링 (빈 문자열 제외)
    const answeredPages = LEARNING_PROGRAM.filter(
        p => userAnswers[p.id] && userAnswers[p.id].trim().length > 0
    );
    const hasAnswers = answeredPages.length > 0;

    // 📝 카테고리별 색상 매핑
    const categoryColors: Record<string, { border: string; text: string; bg: string; dot: string }> = {
        '소설': { border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
        '역사': { border: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
        '결론': { border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10', dot: 'bg-purple-500' },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose} />

                    {/* Main Scrollable Card */}
                    <motion.div
                        initial={{ scale: 0.95, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 120 }}
                        className="relative w-full max-w-4xl h-[90vh] bg-[#0c0c0e] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,209,255,0.15)] flex flex-col group"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 z-10 px-6 py-5 md:px-8 md:py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-b from-yellow-500/20 to-amber-700/20 flex items-center justify-center border border-yellow-500/30">
                                    <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-yellow-500/80 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em]">Analytical Completion Record</h3>
                                    <h2 className="text-xl md:text-3xl font-black text-white italic tracking-tighter mt-0.5">분석 보고서</h2>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all active:scale-90"
                                title="닫기"
                            >
                                <X className="w-6 h-6 md:w-8 md:h-8" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-14 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                            <div className="max-w-3xl mx-auto space-y-12 md:space-y-16">

                                {/* Personal Intro */}
                                <div className="text-center space-y-4 md:space-y-6">
                                    <div className="flex items-center justify-center gap-3 text-cyan-400 font-bold text-xl md:text-3xl">
                                        <span className="h-px w-8 md:w-12 bg-cyan-400/30" />
                                        {userInfo.name || "분석 완료"}
                                        <span className="h-px w-8 md:w-12 bg-cyan-400/30" />
                                    </div>
                                    <p className="text-gray-400 text-[13px] md:text-base leading-relaxed font-medium max-w-xl mx-auto">
                                        본 보고서는 모든 분석 과정을 종결하였음을 증명함.<br className="hidden md:block" /> 인류의 기술적 성취가 <span className="text-cyan-400 font-bold"> 인류발전에 기여</span>하는 <b>'정합성 분석'</b> 과정을 완료함.
                                    </p>
                                </div>

                                {/* 📝 사용자 답변 모아보기 섹션 */}
                                {hasAnswers && (
                                    <article className="space-y-6 md:space-y-8 bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.03] border border-cyan-500/[0.1] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-48 h-48 bg-cyan-500/5 mix-blend-screen blur-[80px] pointer-events-none" />
                                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 mix-blend-screen blur-[80px] pointer-events-none" />

                                        <div className="text-center mb-6 md:mb-8 relative z-10">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
                                                <PenLine className="w-3.5 h-3.5 text-cyan-400" />
                                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">My Analysis Records</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">나의 분석 기록</h3>
                                            <p className="text-[12px] md:text-[13px] text-gray-500 mt-2 font-medium">
                                                각 탐사 과제에 대해 직접 작성한 {answeredPages.length}개의 답변
                                            </p>
                                        </div>

                                        <div className="space-y-4 md:space-y-5 relative z-10">
                                            {answeredPages.map((page, index) => {
                                                const colors = categoryColors[page.category] || categoryColors['역사'];
                                                return (
                                                    <div
                                                        key={page.id}
                                                        className={`relative p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/[0.02] border ${colors.border} hover:bg-white/[0.04] transition-all group/answer`}
                                                    >
                                                        {/* 질문 헤더 */}
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className={`shrink-0 w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center border ${colors.border}`}>
                                                                <MessageSquare className={`w-3.5 h-3.5 ${colors.text}`} />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${colors.text}`}>
                                                                        Q{String(index + 1).padStart(2, '0')}
                                                                    </span>
                                                                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} font-bold`}>
                                                                        {page.category}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] md:text-[12px] text-gray-400 leading-relaxed line-clamp-2">
                                                                    {page.question}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* 사용자 답변 */}
                                                        <div className="ml-10 pl-4 border-l-2 border-cyan-500/20 group-hover/answer:border-cyan-500/40 transition-colors">
                                                            <p className="text-[13px] md:text-sm text-white/80 leading-relaxed font-medium whitespace-pre-wrap">
                                                                {userAnswers[page.id]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </article>
                                )}

                                {/* Model Answers Article */}
                                <article className="space-y-10 md:space-y-14 bg-white/[0.02] border border-white/[0.05] p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden backdrop-blur-md">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 mix-blend-screen blur-[100px] pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 mix-blend-screen blur-[100px] pointer-events-none" />

                                    <div className="text-center mb-8 md:mb-12 relative z-10">
                                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">분석 보고서 모범 해설</h3>
                                        <p className="text-[13px] md:text-sm text-gray-500 mt-2 font-medium">각 단계를 거치며 도출된 이상적인 가치 기준</p>
                                    </div>

                                    <section className="relative z-10 group">
                                        <h4 className="text-lg md:text-xl font-bold text-cyan-400 tracking-tight mb-3 md:mb-4 flex items-center gap-3">
                                            <span className="text-[10px] md:text-xs px-2.5 py-1 bg-cyan-500/20 rounded uppercase tracking-widest font-black">Part 01</span>
                                            기술의 두 얼굴: 파괴에서 성취로
                                        </h4>
                                        <p className="text-[13px] md:text-[15px] text-gray-300 leading-[1.8] font-light break-keep pl-4 md:pl-5 border-l-2 border-cyan-500/30 group-hover:border-cyan-500 transition-colors">
                                            대포 클럽이 전쟁 무기를 우주 탐사에 쓰겠다고 선언한 것이나, V2 로켓이 무서운 미사일에서 아폴로 우주선의 시작이 된 역사는 기술이 '두 얼굴'을 가졌다는 것을 보여줘요. 기술 자체는 착한 것도 나쁜 것도 아니에요. 그것을 사용하는 <b>사람의 마음가짐과 책임감</b>만이 파괴적인 무기를 평화로운 성취로 바꿀 수 있습니다.
                                        </p>
                                    </section>

                                    <section className="relative z-10 group">
                                        <h4 className="text-lg md:text-xl font-bold text-green-400 tracking-tight mb-3 md:mb-4 flex items-center gap-3">
                                            <span className="text-[10px] md:text-xs px-2.5 py-1 bg-green-500/20 rounded uppercase tracking-widest font-black">Part 02</span>
                                            상상력에도 '안전 규칙'이 필요해요
                                        </h4>
                                        <p className="text-[13px] md:text-[15px] text-gray-300 leading-[1.8] font-light break-keep pl-4 md:pl-5 border-l-2 border-green-500/30 group-hover:border-green-500 transition-colors">
                                            콜럼비아드호는 대포로 사람을 쏘아올리는 위험한 상상이었고, 냉전 시대에는 핵미사일 경쟁이 지구를 위험에 빠뜨렸어요. 아무리 멋진 상상이나 강력한 기술이라도, 그것이 사람을 다치게 할 수 있다면 반드시 <b>'안전한 규칙'</b>이 필요합니다. 1967년의 우주 평화 조약처럼, 모두가 함께 지키기로 한 약속이 있을 때 비로소 기술은 안전한 성공이 될 수 있어요.
                                        </p>
                                    </section>

                                    <section className="relative z-10 group">
                                        <h4 className="text-lg md:text-xl font-bold text-yellow-500 tracking-tight mb-3 md:mb-4 flex items-center gap-3">
                                            <span className="text-[10px] md:text-xs px-2.5 py-1 bg-yellow-500/20 rounded uppercase tracking-widest font-black">Part 03</span>
                                            과학적 검증과 미래를 위한 책임감
                                        </h4>
                                        <p className="text-[13px] md:text-[15px] text-gray-300 leading-[1.8] font-light break-keep pl-4 md:pl-5 border-l-2 border-yellow-500/30 group-hover:border-yellow-500 transition-colors">
                                            160년 전 쥘 베른이 플로리다를 발사 장소로 상상한 것이 실제 케네디 우주 센터와 일치한 건, 상상에도 과학적 근거가 있었기 때문이에요. 하지만 우주 쓰레기처럼 우리의 성취가 미래를 위협할 수도 있어요. 우주에서 계속 성공하려면 <b>과학적 검증</b>뿐 아니라, 다음 세대를 위해 <b>우주 환경을 깨끗하게 지키는 책임감</b>까지 함께 가져야 합니다.
                                        </p>
                                    </section>

                                    <section className="relative z-10 group">
                                        <h4 className="text-lg md:text-xl font-bold text-purple-400 tracking-tight mb-3 md:mb-4 flex items-center gap-3">
                                            <span className="text-[10px] md:text-xs px-2.5 py-1 bg-purple-500/20 rounded uppercase tracking-widest font-black">Part 04</span>
                                            재사용 기술이 여는 화성의 꿈
                                        </h4>
                                        <p className="text-[13px] md:text-[15px] text-gray-300 leading-[1.8] font-light break-keep pl-4 md:pl-5 border-l-2 border-purple-500/30 group-hover:border-purple-500 transition-colors">
                                            SpaceX는 로켓을 한 번 쓰고 버리는 대신 다시 쓸 수 있게 만들어서 우주 가는 비용을 10분의 1로 줄였어요. 화성에 사람이 살려면 엄청나게 많은 물자를 보내야 하는데, 한 번에 수백억이 드는 로켓은 감당할 수 없죠. <b>비용을 아끼는 기술</b>이 있어야 수천 번의 발사가 가능해지고, 그래야 비로소 '화성에 사람이 살게 하자'는 큰 꿈이 현실이 될 수 있습니다.
                                        </p>
                                    </section>
                                </article>
                            </div>
                        </div>

                        {/* Footer - Fixed Height */}
                        <div className="flex-shrink-0 z-10 px-6 py-5 md:px-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] backdrop-blur-xl">
                            <div className="flex flex-col items-center sm:items-start gap-1 opacity-60">
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 font-mono">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4" /> {today}
                                </div>
                                <div className="text-[9px] md:text-[10px] text-gray-500 font-black tracking-widest uppercase">데이터 분석 센터 사령관 인증</div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-white text-black text-xs md:text-sm font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 hover:text-black transition-all shadow-xl hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 active:scale-95 duration-200"
                            >
                                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> 기록 보관 및 종료
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MissionSuccessModal;
