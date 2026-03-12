import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import {
  Rocket,
  Radio,
  MessageSquare,
  Users,
  LayoutGrid,
  X,
  BookOpen,
  Trophy
} from 'lucide-react';
import type { Badge } from './types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { SPACE_FACTS } from './data/spaceFacts';
import MissionSuccessModal from './components/modals/MissionSuccessModal';
import StudyModal from './components/modals/StudyModal';
import { LEARNING_PROGRAM } from './data/learningProgram';
import type { LearningPage } from './data/learningProgram';

// Lazy load views for performance
const CosmicGame = lazy(() => import('./pages/CosmicGame'));
const CommsView = lazy(() => import('./components/views/CommsView'));
const StatusView = lazy(() => import('./components/views/StatusView'));
const ArchiveView = lazy(() => import('./components/views/ArchiveView'));
const HallOfFameView = lazy(() => import('./components/views/HallOfFameView'));

// --- Shared Components ---

const MissionLoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-[#0c0c0e]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      <span className="text-cyan-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">Loading Mission Data...</span>
    </div>
  </div>
);


export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'status' | 'game' | 'comms' | 'archive' | 'hall'>('landing');
  const [showSuccess, setShowSuccess] = useState(false);
  const [archivePageIndex, setArchivePageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900); // Optimized for Tablet Landscape and above
  const [totalGameScore, setTotalGameScore] = useState(0);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [readPages, setReadPages] = useState<number[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', age: '', role: '', dream: '' });
  const [gameKey, setGameKey] = useState(0);
  const [selectedStudyPages, setSelectedStudyPages] = useState<LearningPage[]>([]);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [startPageIndex, setStartPageIndex] = useState(0);
  // 📝 사용자 답변 저장: { pageId: '답변 텍스트' }
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // 🏆 명예의 전당: 세션 내 배지 (새로고침 시 초기화)
  const [allTimeBadges, setAllTimeBadges] = useState<Badge[]>([]);
  // 💬 COMMS 탭 방문 여부 (세션 내 유지)
  const [commsVisited, setCommsVisited] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [missions, setMissions] = useState(LEARNING_PROGRAM.map(p => ({
    id: p.id,
    title: p.title,
    desc: p.category === '소설' ? `소설: ${p.title}` : p.category === '역사' ? `역사: ${p.title}` : p.title,
    icon: p.icon,
    location: p.location,
    type: p.type,
    completed: false
  })));

  const [hasAutoShownSuccess, setHasAutoShownSuccess] = useState(false);

  useEffect(() => {
    const requiredMissions = missions.filter(m => [1, 2, 3, 4, 5, 6, 7].includes(m.id));
    if (requiredMissions.length > 0 && requiredMissions.every(m => m.completed) && !hasAutoShownSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(true);
        setHasAutoShownSuccess(true);
      }, 500); // slight delay after modal closure
      return () => clearTimeout(timer);
    }
  }, [missions, hasAutoShownSuccess]);

  const handleMissionClick = (id: number) => {
    // Determine which set the mission belongs to
    let setIds: number[] = [];
    if (id === 1 || id === 2) setIds = [1, 2];
    else if (id === 3 || id === 4) setIds = [3, 4];
    else if (id === 5 || id === 6) setIds = [5, 6];
    else if (id === 7) setIds = [7];

    const pages = LEARNING_PROGRAM.filter(p => setIds.includes(p.id));
    if (pages.length > 0) {
      setSelectedStudyPages(pages);
      const initialIndex = pages.findIndex(p => p.id === id);
      setStartPageIndex(initialIndex >= 0 ? initialIndex : 0);
      setIsStudyModalOpen(true);
    }
  };

  // 📝 미션 완료 시 사용자 답변도 함께 수집하여 저장
  const completeMission = (id: number, answers?: Record<number, string>) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    if (answers) {
      setUserAnswers(prev => ({ ...prev, ...answers }));
    }
  };

  const handleScoreUpdate = useCallback((score: number) => {
    setTotalGameScore(score);
  }, []);

  const handleGameEnd = useCallback((score: number, badges?: Badge[]) => {
    setTotalGameScore(score);
    // 게임 종료 시 획득 배지 누적 (중복 제거)
    if (badges && badges.length > 0) {
      setAllTimeBadges(prev => {
        const existingIds = new Set(prev.map(b => b.id));
        const newBadges = badges.filter(b => !existingIds.has(b.id));
        return [...prev, ...newBadges];
      });
    }
  }, []);

  // ─── 명예 점수 (HallOfFame와 동일한 공식, 헤더 우상단과 연동) ─────────────
  // HallOfFameView 내부의 honorScore useMemo와 동일하게 계산합니다.
  const honorScore = useMemo(() => {
    const rareIds = new Set([
      'phoenix', 'time_lord', 'void_walker', 'untouchable', 'immortal',
      'one_percent', 'fortune_teller', 'last_breath', 'needle_thread'
    ]);
    const uncommonIds = new Set([
      'daredevil', 'tactician', 'ghost', 'sniper', 'hoarder',
      'zen_master', 'speedrunner', 'turtle', 'perfectionist', 'improviser',
      'berserker', 'pacifist', 'clutch_king', 'ice_in_veins', 'thrill_seeker',
      'resource_king', 'glass_cannon', 'tank', 'balanced', 'chaos_agent'
    ]);
    const completedMissionCount = missions.filter(m => m.completed).length;
    const answeredPageCount = LEARNING_PROGRAM.filter(p => p.question && userAnswers[p.id]?.trim()).length;
    return (
      completedMissionCount * 200 +
      answeredPageCount * 150 +
      allTimeBadges.length * 100 +
      allTimeBadges.filter(b => rareIds.has(b.id)).length * 300 +
      allTimeBadges.filter(b => uncommonIds.has(b.id)).length * 100 +
      Math.floor(totalGameScore / 10) +
      readPages.length * 50 +
      (commsVisited ? 100 : 0)
    );
  }, [missions, userAnswers, allTimeBadges, totalGameScore, readPages, commsVisited]);

  // Sync tab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['landing', 'status', 'game', 'comms', 'archive', 'hall'].includes(hash)) {
        setActiveTab(hash as 'landing' | 'status' | 'game' | 'comms' | 'archive' | 'hall');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-terminal-bg relative overflow-hidden font-pretendard selection:bg-cyan-500/30">
      {/* --- Header --- */}
      <div className="flex-shrink-0 p-4 md:p-6 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-30">
        <button
          onClick={() => {
            setActiveTab('landing');
            window.location.hash = 'landing';
          }}
          className="flex items-center gap-3 md:gap-5 hover:opacity-80 transition-opacity cursor-pointer text-left"
          aria-label="홈으로 이동"
        >
          <div className="relative">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Radio className="w-5 h-5 md:w-7 md:h-7 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full blur-[2px] animate-ping" />
          </div>
          <div className="text-left">
            <h1 className="text-sm md:text-xl lg:text-2xl tracking-widest text-white font-black">InblanQ 트레이닝 스테이션</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-tighter">Terminal ID: CP-08</span>
              <span className="w-1 h-1 rounded-full bg-cyan-400/20 shadow-[0_0_5px_rgba(0,209,255,0.4)]" />
              <span className="text-[9px] md:text-xs font-bold text-cyan-400/50 uppercase tracking-tighter">Status: Active</span>
            </div>
          </div>
        </button>
        <div className="text-right">
          <div className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">명예 점수</div>
          <div className="text-xl md:text-3xl lg:text-4xl font-black tracking-tighter leading-none text-amber-400">{honorScore.toLocaleString()}</div>
        </div>
      </div>

      {/* --- Navigation + Content --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Mini Nav */}
        <div className="w-20 md:w-28 border-r border-white/5 bg-black/40 flex flex-col items-center py-8 gap-10 z-40">
          {[
            { id: 'comms', icon: MessageSquare, label: 'COMMS', active: 'bg-purple-500/15 text-purple-500 border border-purple-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]' },
            { id: 'status', icon: LayoutGrid, label: 'STUDY', active: 'bg-green-500/15 text-green-500 border border-green-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]' },
            { id: 'game', icon: Rocket, label: 'GAME', active: 'bg-orange-500/15 text-orange-500 border border-orange-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]' },
            { id: 'archive', icon: BookOpen, label: 'DATA', active: 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]' },
            { id: 'hall', icon: Trophy, label: 'HALL', active: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                if (btn.id === 'game' && activeTab === 'game') {
                  setGameKey(prev => prev + 1);
                } else {
                  setActiveTab(btn.id as 'landing' | 'status' | 'game' | 'comms' | 'archive' | 'hall');
                  window.location.hash = btn.id;
                  // COMMS 탭 첫 방문 기록
                  if (btn.id === 'comms' && !commsVisited) {
                    setCommsVisited(true);
                  }
                }
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${activeTab === btn.id ? btn.active : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              title={btn.label}
            >
              <btn.icon className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-center">{btn.label}</span>
            </button>
          ))}

          <div className="mt-auto pb-6">
            {!userInfo.name ? (
              <button
                onClick={() => { setActiveTab('landing'); window.location.hash = 'landing'; }}
                className="p-4 rounded-xl text-gray-500 hover:text-cyan-400 hover:bg-white/5 transition-all animate-pulse"
                title="대원 등록"
              >
                <Users className="w-7 h-7" />
              </button>
            ) : (
              <button
                onClick={() => setShowUserModal(true)}
                className="group relative flex flex-col items-center gap-1"
                title="프로필"
              >
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-cyan-500">
                  <span className="text-3xl">🧑‍🚀</span>
                </div>
                <span className="text-[10px] font-black text-cyan-400 truncate max-w-[84px]">{userInfo.name} 대원</span>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0c0c0e] rounded-full" />
              </button>
            )}
          </div>
        </div>

        {/* View Layout Agent */}
        <div className="flex-1 relative overflow-hidden bg-[#0c0c0e]">
          <AnimatePresence mode="wait">
            {activeTab === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar"
              >
                {/* Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
                  <div className="absolute inset-0 opacity-[0.02] bg-grid" />
                </div>

                <div className="relative flex items-center justify-center min-h-full px-6 py-16 md:px-10 md:py-24">
                  <div className="w-full max-w-lg space-y-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center space-y-5"
                    >
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Rocket className="w-8 h-8 text-cyan-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full blur-[3px] animate-ping" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white italic leading-tight">
                          Inblan<span className="text-purple-500">Q</span>
                        </h2>
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">
                          Training Station
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white/[0.03] border border-white/[0.08] lg:border-white/[0.12] rounded-3xl p-8 md:p-12 space-y-8 shadow-2xl backdrop-blur-sm"
                    >
                      <div className="text-center mb-4">
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">대원 등록</h3>
                        <p className="text-xs md:text-sm text-gray-400 mt-2">훈련을 시작하려면 대원 정보를 입력하세요</p>
                      </div>

                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">이름</label>
                          <input
                            type="text"
                            placeholder="홍길동"
                            value={userInfo.name}
                            onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 md:py-4 text-white text-sm md:text-base placeholder:text-gray-600 focus:border-cyan-500/50 focus:bg-black/60 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">나이</label>
                          <input
                            type="text"
                            placeholder="8"
                            value={userInfo.age}
                            onChange={e => setUserInfo({ ...userInfo, age: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 md:py-4 text-white text-sm md:text-base placeholder:text-gray-600 focus:border-cyan-500/50 focus:bg-black/60 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">나의 꿈</label>
                          <input
                            type="text"
                            placeholder="우주 비행사가 되고 싶어요"
                            value={userInfo.dream}
                            onChange={e => setUserInfo({ ...userInfo, dream: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 md:py-4 text-white text-sm md:text-base placeholder:text-gray-600 focus:border-cyan-500/50 focus:bg-black/60 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">나의 다짐</label>
                          <input
                            type="text"
                            placeholder="끝까지 포기하지 않겠습니다"
                            value={userInfo.role}
                            onChange={e => setUserInfo({ ...userInfo, role: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 md:py-4 text-white text-sm md:text-base placeholder:text-gray-600 focus:border-cyan-500/50 focus:bg-black/60 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (userInfo.name) {
                            setActiveTab('comms');
                            window.location.hash = 'comms';
                          }
                        }}
                        disabled={!userInfo.name}
                        className="w-full py-4 bg-gradient-to-r from-cyan-500/80 to-purple-500/80 backdrop-blur-md text-white font-black uppercase tracking-widest rounded-xl hover:from-cyan-400/90 hover:to-purple-400/90 transition-all shadow-[0_0_30px_rgba(0,209,255,0.25),0_0_60px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(0,209,255,0.4),0_0_80px_rgba(168,85,247,0.25)] border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:border-white/5 flex items-center justify-center gap-2 mt-2"
                      >
                        <Rocket className="w-4 h-4" />
                        훈련 시작
                      </button>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center text-[9px] md:text-[10px] text-gray-600 uppercase tracking-wider"
                    >
                      Next-Gen Space Training Program &middot; CP-08
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'comms' && (
              <motion.div
                key="comms"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<MissionLoadingFallback />}>
                  <CommsView />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<MissionLoadingFallback />}>
                  <StatusView
                    missions={missions}
                    toggleMission={handleMissionClick}
                    setShowSuccess={setShowSuccess}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'game' && (
              <motion.div
                key={`game-container-${gameKey}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-black z-10"
              >
                <Suspense fallback={<MissionLoadingFallback />}>
                  <CosmicGame
                    onScoreUpdate={handleScoreUpdate}
                    onGameOver={handleGameEnd}
                    defaultAstronautName={userInfo.name}
                  />
                </Suspense>
              </motion.div>
            )}

            {activeTab === 'archive' && (
              <motion.div
                key="archive"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<MissionLoadingFallback />}>
                  <ArchiveView
                    isArchiveOpen={isArchiveOpen}
                    setIsArchiveOpen={setIsArchiveOpen}
                    archivePageIndex={archivePageIndex}
                    setArchivePageIndex={setArchivePageIndex}
                    direction={direction}
                    setDirection={setDirection}
                    readPages={readPages}
                    setReadPages={setReadPages}
                    isDesktop={isDesktop}
                    spaceFacts={SPACE_FACTS}
                  />
                </Suspense>
              </motion.div>
            )}
            {activeTab === 'hall' && (
              <motion.div
                key="hall"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0"
              >
                <Suspense fallback={<MissionLoadingFallback />}>
                  <HallOfFameView
                    userInfo={userInfo}
                    missions={missions}
                    userAnswers={userAnswers}
                    allTimeBadges={allTimeBadges}
                    totalGameScore={totalGameScore}
                    readPages={readPages}
                    spaceFacts={SPACE_FACTS}
                    commsVisited={commsVisited}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>

          <MissionSuccessModal
            isOpen={showSuccess}
            onClose={() => setShowSuccess(false)}
            userInfo={userInfo}
            userAnswers={userAnswers}
          />

          {isStudyModalOpen && selectedStudyPages.length > 0 && (
            <StudyModal
              key={`${selectedStudyPages[0].id}-${startPageIndex}`}
              pages={selectedStudyPages}
              initialPageIndex={startPageIndex}
              onClose={() => setIsStudyModalOpen(false)}
              onComplete={completeMission}
            />
          )}

          <AnimatePresence>
            {showUserModal && userInfo.name && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
              >
                <div className="absolute inset-0" onClick={() => setShowUserModal(false)} />
                <motion.div
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                  className="bg-[#0c0c0e] border border-cyan-500/30 p-8 max-w-sm w-full rounded-2xl relative z-10 shadow-2xl"
                >
                  <button onClick={() => setShowUserModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white" title="닫기" aria-label="닫기"><X /></button>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center mx-auto">
                      <span className="text-3xl">🧑‍🚀</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{userInfo.name} <span className="text-cyan-400">대원</span></h3>
                      {userInfo.age && <p className="text-xs text-gray-500">{userInfo.age}세</p>}
                      {userInfo.dream && <p className="text-xs text-gray-400 mt-2 italic">"{userInfo.dream}"</p>}
                      {userInfo.role && <p className="text-xs text-cyan-400 font-bold mt-2">💪 {userInfo.role}</p>}
                    </div>
                    <button
                      onClick={() => setShowUserModal(false)}
                      className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold uppercase text-xs rounded-xl hover:bg-white/10 mt-2"
                    >
                      닫기
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 py-2 px-8 bg-black border-t border-white/5 flex items-center justify-between text-[8px] text-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="font-bold text-green-500">SYSTEMS_LOCKED</span>
          </div>
          <span className="opacity-50 font-mono text-[6px]">BUILD_2026.02.08_PRO</span>
        </div>
      </div>
    </div>
  );
}
