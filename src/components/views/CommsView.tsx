import { motion } from 'framer-motion';
import { MessageSquare, Activity, Cpu, Users, Ruler, Rocket, Hexagon, Zap } from 'lucide-react';

const ANALYSIS_ITEMS = [
    {
        id: 1,
        title: "[측정] 성취와 오만을 가르는 '계산'",
        icon: Ruler,
        color: "cyan",
        content: "쥘 베른의 소설에서 우주를 향한 도전은 그저 '꿈꾸는 것'으로 끝나지 않아요. 정확한 수치와 치밀한 계산이 밑바탕이 되어야 비로소 말이 되는 이야기로 바뀌죠. 확실한 근거 없이 무작정 뛰어드는 건 무모한 '오만'일 수 있어요. 하지만 정확히 계산하고 끈질기게 준비한 도전은 결국 위대한 '성취'가 된답니다. 상상을 현실로 만드는 가장 든든한 무기는 바로 여러분의 '논리적인 생각'과 '치밀한 구조적 설계'예요!",
        emoji: "📐"
    },
    {
        id: 2,
        title: "[정복] 무기가 우주선이 된 반전",
        icon: Rocket,
        color: "purple",
        content: "과거에는 전쟁을 위해 대포와 무기를 만들었어요. 하지만 이 파괴적 기술들이 나중에는 사람을 우주로 보내는 탐사 로켓으로 쓰이게 되었죠. 기술을 어떻게 활용할지 '목적'을 고민했기 때문에 일어난 일이에요. 진정한 정복이란 누군가를 지배하는 게 아니라, 우리가 모르던 새로운 세상을 평화롭게 열어가는 것이라는 걸 잘 보여주는 멋진 사례입니다. 낯설게 보기, 반대관점으로 생각해 보기 등 다양한 방식의 융합적 사고가 중요해요!, ",
        emoji: "🚀"
    },
    {
        id: 3,
        title: "통합 분석: 확실한 '성취'인가, 아슬아슬한 '오만'인가?",
        icon: Hexagon,
        color: "indigo",
        content: (
            <div className="space-y-4">
                <p>
                    <span className="text-white font-black underline decoration-indigo-500/50 underline-offset-4">진짜 성취(Achievement)의 조건</span>:
                    기술이 세상을 더 낫게 만들려면 '바른 목적'과 '정확한 데이터'가 만나야 해요. 쥘 베른은 상상만 하지 않고 과학적으로 진짜 가능한지 엄청나게 고민했어요. 이런 끈질긴 노력이 바로 단순한 허풍과 위대한 도전을 가르는 중요한 기준입니다.
                </p>
                <p>
                    <span className="text-white font-black underline decoration-indigo-500/50 underline-offset-4">경계해야 할 오만(Arrogance)</span>:
                    단지 힘을 자랑하거나 자연을 훼손하면서 얻어낸 화려한 결과는 결국 '오만'이라는 비판을 듣게 돼요. 우리가 꼭 명심해야 할 '책임 있는 도전'은, 도구가 얼마나 강력한지 자랑하는 것보다 그 도구로 세상을 얼마나 평화롭고 이롭게 만들지 먼저 생각하는 마음에서 시작됩니다.
                </p>
            </div>
        ),
        emoji: "💎"
    }
];

const AnalysisCard = ({ item, index }: { item: typeof ANALYSIS_ITEMS[0], index: number }) => {
    const Icon = item.icon;
    const isOdd = index % 2 !== 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className={`group relative p-6 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden ${isOdd ? 'lg:translate-x-4' : 'lg:-translate-x-4'}`}
        >
            <div className="scanline opacity-[0.02] group-hover:opacity-[0.05] transition-opacity" />

            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Icon className="w-24 h-24 text-white" />
            </div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 blur-[80px] -z-10 group-hover:bg-purple-500/20 transition-all" />

            <div className="relative z-10 flex flex-col md:flex-row gap-10">
                <div className="shrink-0 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-[10px] font-black font-mono text-gray-500 uppercase tracking-widest vertical-text py-4 border-l border-white/5">
                        PHASE-0{item.id}
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-px bg-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Mission Report</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                            {item.title} {item.emoji}
                        </h3>
                    </div>

                    <div className="text-gray-400 text-sm md:text-lg leading-relaxed md:leading-loose font-medium">
                        {item.content}
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center gap-4 group/btn">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 group-hover:animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300 transition-colors">Strategic Link Established</span>
                        <Zap className="w-3 h-3 text-cyan-500 ml-auto group-hover:scale-125 transition-transform" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const CommsView = () => {
    return (
        <motion.div
            key="comms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full overflow-y-auto p-4 md:p-8 lg:p-20 scrollbar-hide max-w-[1200px] mx-auto space-y-12 md:space-y-16 flex flex-col items-center"
        >
            {/* Main Header */}
            <header className="w-full max-w-4xl text-center space-y-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex flex-col items-center gap-4 group"
                >
                    <div className="p-5 bg-purple-500/10 rounded-2xl border border-purple-500/20 group-hover:bg-purple-500/20 transition-all duration-500">
                        <MessageSquare className="w-10 h-10 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-5xl md:text-7xl font-cyber text-white tracking-tighter italic uppercase text-shadow-glow">
                            중앙 상황실
                        </h2>
                        <div className="flex items-center justify-center gap-3">
                            <span className="h-px w-10 bg-purple-500/30" />
                            <p className="text-[11px] md:text-xs text-purple-400 font-bold uppercase tracking-[0.5em] font-mono">
                                Direct Command Center Feedback
                            </p>
                            <span className="h-px w-10 bg-purple-500/30" />
                        </div>
                    </div>
                </motion.div>

                <p className="text-gray-500 text-xs md:text-sm font-medium leading-relaxed max-w-2xl mx-auto uppercase tracking-widest opacity-80">
                    쥘 베른의 &lt;지구에서 달까지&gt; 숨겨진 비밀 분석 리포트입니다. <br></br>꼼꼼한 과학적 노력과 우주를 향한 멋진 꿈이 만나는 지점을 함께 살펴봐요! <br></br>독서와 글쓰기에 새로운 방향을 제시해 줄 것입니다.
                </p>
            </header>

            {/* Analysis Grid */}
            <div className="w-full space-y-8 md:space-y-12">
                {ANALYSIS_ITEMS.map((item, index) => (
                    <AnalysisCard key={item.id} item={item} index={index} />
                ))}
            </div>

            {/* System Status Grid - Compact & Subtle */}
            <footer className="w-full flex flex-wrap justify-center gap-x-12 gap-y-4 pt-12 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity duration-700">
                <div className="flex items-center gap-3 group">
                    <Activity className="w-4 h-4 text-cyan-500/50 group-hover:text-cyan-500 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest leading-none">Energy Profile</span>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">STABLE</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 group">
                    <Cpu className="w-4 h-4 text-purple-500/50 group-hover:text-purple-500 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest leading-none">Compute Sync</span>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">V-SYNC ACTIVE</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 group">
                    <Users className="w-4 h-4 text-indigo-500/50 group-hover:text-indigo-500 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest leading-none">Command Rank</span>
                        <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors tracking-tight">ELITE COMMANDER</span>
                    </div>
                </div>
            </footer>
        </motion.div >

    );
};

export default CommsView;
