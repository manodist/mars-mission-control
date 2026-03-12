import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Rocket } from 'lucide-react';

interface Mission {
    id: number;
    title: string;
    desc: string;
    icon: string;
    location: string;
    type: string;
    completed: boolean;
}

interface StatusViewProps {
    missions: Mission[];
    toggleMission: (id: number) => void;
    setShowSuccess: (show: boolean) => void;
}

const UnifiedMissionSet = ({ number, title, missionIds, missions, onToggle, isFinal }: {
    number: string;
    title: string;
    missionIds: number[];
    missions: Mission[];
    onToggle: (id: number) => void;
    isFinal?: boolean;
}) => {
    const setMissions = missions.filter(m => missionIds.includes(m.id));
    const isCompleted = setMissions.every(m => m.completed);
    const completedCount = setMissions.filter(m => m.completed).length;

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onToggle(missionIds[0])}
            className={`relative group/set p-6 md:p-8 lg:p-12 rounded-[3rem] border transition-all duration-500 cursor-pointer overflow-hidden ${isCompleted
                ? isFinal
                    ? 'bg-[#1a0b2e]/40 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]'
                    : 'bg-[#081a1e]/40 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.05] shadow-2xl shadow-black/80'
                }`}
        >
            {/* Glossy Overlay & Glow */}
            <div className={`absolute -inset-[100%] bg-gradient-to-tr ${isFinal ? 'from-purple-500/10 via-transparent to-purple-500/5' : 'from-cyan-500/10 via-transparent to-cyan-500/5'} opacity-0 group-hover/set:opacity-100 transition-opacity duration-1000 animate-pulse`} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-20 pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-6">
                        <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-[1.5rem] font-black text-2xl border-2 transition-all duration-700 ${isCompleted
                            ? isFinal
                                ? 'bg-purple-500 text-white border-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.6)] rotate-[360deg]'
                                : 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.6)] rotate-[360deg]'
                            : `bg-white/5 text-white/30 border-white/10 group-hover/set:border-${isFinal ? 'purple' : 'cyan'}-500/50 group-hover/set:text-${isFinal ? 'purple' : 'cyan'}-400 group-hover/set:bg-${isFinal ? 'purple' : 'cyan'}-500/10`
                            }`}>
                            {number}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <h3 className={`text-xl md:text-2xl lg:text-3xl font-black tracking-tight transition-all duration-500 ${isCompleted ? 'text-white' : 'text-gray-500 group-hover/set:text-white'}`}>
                                    {title}
                                </h3>
                                {isCompleted && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-white rounded-full p-0.5"
                                    >
                                        <CheckCircle2 className={`w-6 h-6 ${isFinal ? 'text-purple-500' : 'text-cyan-500'}`} />
                                    </motion.div>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`h-px w-8 ${isFinal ? 'bg-purple-500/50' : 'bg-cyan-500/50'}`} />
                                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] transition-colors duration-500 ${isCompleted ? isFinal ? 'text-purple-400' : 'text-cyan-400' : 'text-gray-600 group-hover/set:text-white/40'}`}>
                                    Mission Sequence {number}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {setMissions.map(m => (
                            <motion.div
                                key={m.id}
                                whileHover={{ y: -2 }}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] md:text-sm font-black border backdrop-blur-md transition-all duration-500 ${m.completed
                                    ? isFinal
                                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                        : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                    : 'bg-black/40 border-white/5 text-gray-500 group-hover/set:border-white/20 group-hover/set:text-gray-300'
                                    }`}>
                                <span className={`transition-all duration-500 text-2xl ${m.completed ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'grayscale opacity-30 group-hover/set:opacity-100 group-hover/set:grayscale-0'}`}>
                                    {m.icon}
                                </span>
                                <span className="uppercase tracking-widest">{m.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-8 lg:pl-12 lg:border-l border-white/10">
                    <div className="space-y-2">
                        <div className="text-[10px] text-gray-500 font-extrabold uppercase tracking-[0.3em] opacity-60">Success Rate</div>
                        <div className="text-3xl md:text-5xl font-black text-white flex items-baseline gap-2">
                            <span className={`transition-colors duration-500 ${isCompleted ? isFinal ? 'text-purple-400' : 'text-cyan-400' : 'text-white'}`}>{completedCount}</span>
                            <span className="text-xl text-gray-700 font-light">/</span>
                            <span className="text-xl text-gray-700 font-light">{missionIds.length}</span>
                        </div>
                    </div>
                    <div className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ${isCompleted
                        ? isFinal
                            ? 'border-purple-500/60 bg-purple-500/10 shadow-[0_0_40px_rgba(168,85,247,0.4)]'
                            : 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.4)]'
                        : `border-white/10 bg-white/5 group-hover/set:border-${isFinal ? 'purple' : 'cyan'}-500/40 group-hover/set:scale-105`
                        }`}>
                        <div className={`absolute inset-0 rounded-full border-4 border-transparent [animation-duration:3s] ${isCompleted ? isFinal ? 'border-t-purple-400 animate-spin' : 'border-t-cyan-400 animate-spin' : ''}`} />
                        <Rocket className={`w-10 h-10 md:w-14 md:h-14 transition-all duration-700 ${isCompleted ? isFinal ? 'text-purple-400' : 'text-cyan-400' : `text-gray-800 group-hover/set:text-${isFinal ? 'purple' : 'cyan'}-500 group-hover/set:animate-bounce`}`} />
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / missionIds.length) * 100}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className={`h-full shadow-[0_0_15px_rgba(255,255,255,0.3)] ${isCompleted
                        ? isFinal ? 'bg-purple-500' : 'bg-cyan-500'
                        : isFinal ? 'bg-purple-500/40' : 'bg-cyan-500/40'
                        }`}
                />
            </div>
        </motion.div>
    );
};

const StatusView = ({ missions, toggleMission, setShowSuccess }: StatusViewProps) => {
    return (
        <motion.div
            key="status"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-full overflow-y-auto p-4 md:p-10 lg:p-20 space-y-8 md:space-y-10 scrollbar-hide max-w-[1200px] mx-auto"
        >
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                    <h2 className="text-sm md:text-base lg:text-xl font-black tracking-[0.5em] uppercase flex items-center gap-5">
                        <div className="relative">
                            <Shield className="w-6 h-6 md:w-7 md:h-7 text-cyan-500" />
                            <div className="absolute inset-0 bg-cyan-400 blur-[8px] opacity-40 animate-pulse" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white/30 italic">
                            과학 기술의 이중성 분석
                        </span>
                    </h2>
                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                        <span className="text-[9px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                            Protocols Synchronized
                        </span>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* SET 01 */}
                    <UnifiedMissionSet
                        number="01"
                        title="파괴의 발상 전환: 우주로의 비상"
                        missionIds={[1, 2]}
                        missions={missions}
                        onToggle={toggleMission}
                    />

                    {/* SET 02 */}
                    <UnifiedMissionSet
                        number="02"
                        title="우주선의 상상과 미사일의 공포"
                        missionIds={[3, 4]}
                        missions={missions}
                        onToggle={toggleMission}
                    />

                    {/* SET 03 */}
                    <UnifiedMissionSet
                        number="03"
                        title="쥘 베른의 통찰과 인류의 약속"
                        missionIds={[5, 6]}
                        missions={missions}
                        onToggle={toggleMission}
                    />

                    {/* FINAL STEP */}
                    <UnifiedMissionSet
                        number="04"
                        title="FINAL : 혁신 가치 평가"
                        missionIds={[7]}
                        missions={missions}
                        onToggle={toggleMission}
                        isFinal
                    />
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-left flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                <p className="text-[11px] md:text-xs lg:text-sm text-cyan-200/60 font-medium leading-relaxed max-w-4xl text-center md:text-left">
                    문헌 및 사료 데이터를 통해 과학 기술의 성취와 책임의 정합성을 검증합니다.
                </p>
                {missions.filter(m => [1, 2, 3, 4, 5, 6, 7].includes(m.id)).every(m => m.completed) ? (
                    <motion.button
                        animate={{
                            borderColor: ["rgba(168, 85, 247, 0.4)", "rgba(168, 85, 247, 1)", "rgba(168, 85, 247, 0.4)"],
                            boxShadow: ["0 5px 15px rgba(168,85,247,0.1)", "0 0 30px rgba(168,85,247,0.5)", "0 5px 15px rgba(168,85,247,0.1)"]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        whileHover={{ scale: 1.02, borderColor: "rgba(192, 132, 252, 1)", boxShadow: "0 0 40px rgba(192,132,252,0.6)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowSuccess(true)}
                        className="group w-full md:w-auto px-6 md:px-8 py-4 rounded-xl bg-purple-900/40 border border-purple-500/50 text-white font-black tracking-widest hover:bg-purple-800/60 md:ml-4 whitespace-nowrap relative overflow-hidden flex justify-center items-center z-10"
                    >
                        <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-purple-400 group-hover:text-white transition-colors" />
                            <span className="flex flex-col items-center sm:items-start text-left">
                                <span className="text-[10px] text-purple-300 uppercase tracking-[0.3em] font-bold leading-none mb-1">Analytical Record</span>
                                <span className="text-sm md:text-base leading-none">분석 종결 보고서 열람</span>
                            </span>
                        </span>
                        <motion.div
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -skew-x-12"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                        />
                    </motion.button>
                ) : (
                    <div className="w-full md:w-auto px-6 md:px-8 py-4 rounded-xl bg-[#0c0c0e]/80 border border-white/5 text-gray-500 font-black tracking-widest md:ml-4 whitespace-nowrap relative flex justify-center items-center z-10 cursor-not-allowed">
                        <span className="relative z-10 flex items-center gap-3">
                            <Shield className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                            <span className="flex flex-col items-center sm:items-start text-left">
                                <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold leading-none mb-1">Data Analysis Required</span>
                                <span className="text-sm md:text-base text-gray-500 leading-none">모든 분석을 완수하십시오</span>
                            </span>
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatusView;
