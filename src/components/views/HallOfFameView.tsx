import { useMemo } from 'react';
import { Trophy, BookOpen, Gamepad2, MessageSquare, Database, Star } from 'lucide-react';
import type { Badge } from '../../types/game';
import type { SpaceFact } from '../../data/spaceFacts';
import { LEARNING_PROGRAM } from '../../data/learningProgram';

interface Mission {
  id: number;
  title: string;
  completed: boolean;
}

interface HallOfFameViewProps {
  userInfo: { name: string; age: string; role: string; dream: string };
  missions: Mission[];
  userAnswers: Record<number, string>;
  allTimeBadges: Badge[];
  totalGameScore: number;
  readPages: number[];
  spaceFacts: SpaceFact[];
  commsVisited: boolean;
}

// 배지 희귀도 분류
const RARE_BADGE_IDS = new Set([
  'phoenix', 'time_lord', 'void_walker', 'untouchable', 'immortal',
  'one_percent', 'fortune_teller', 'last_breath', 'needle_thread'
]);
const UNCOMMON_BADGE_IDS = new Set([
  'daredevil', 'tactician', 'ghost', 'sniper', 'hoarder',
  'zen_master', 'speedrunner', 'turtle', 'perfectionist', 'improviser',
  'berserker', 'pacifist', 'clutch_king', 'ice_in_veins', 'thrill_seeker',
  'resource_king', 'glass_cannon', 'tank', 'balanced', 'chaos_agent'
]);

function getBadgeRarity(id: string): { label: string; color: string } {
  if (RARE_BADGE_IDS.has(id)) return { label: 'LEGENDARY', color: 'text-amber-300 border-amber-400/40 bg-amber-500/10' };
  if (UNCOMMON_BADGE_IDS.has(id)) return { label: 'RARE', color: 'text-purple-300 border-purple-400/40 bg-purple-500/10' };
  return { label: 'COMMON', color: 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10' };
}

// 섹션 헤더 컴포넌트
function SectionHeader({ icon: Icon, label, color, count }: { icon: React.ComponentType<{className?: string}>, label: string, color: string, count?: string }) {
  return (
    <div className={`flex items-center gap-3 mb-4 pb-3 border-b border-white/10`}>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h2 className="text-xs font-black uppercase tracking-widest text-white">{label}</h2>
      {count && <span className="ml-auto text-[10px] font-bold text-gray-500">{count}</span>}
    </div>
  );
}

export default function HallOfFameView({
  userInfo,
  missions,
  userAnswers,
  allTimeBadges,
  totalGameScore,
  readPages,
  spaceFacts,
  commsVisited,
}: HallOfFameViewProps) {
  // STUDY 통계
  const completedMissions = useMemo(() => missions.filter(m => m.completed), [missions]);
  const answeredPages = useMemo(
    () => LEARNING_PROGRAM.filter(p => p.question && userAnswers[p.id]?.trim()),
    [userAnswers]
  );

  // 종합 명예 점수
  const honorScore = useMemo(() => {
    const studyScore = completedMissions.length * 200;
    const answerScore = answeredPages.length * 150;
    const badgeScore = allTimeBadges.length * 100 +
      allTimeBadges.filter(b => RARE_BADGE_IDS.has(b.id)).length * 300 +
      allTimeBadges.filter(b => UNCOMMON_BADGE_IDS.has(b.id)).length * 100;
    const gameScore = Math.floor(totalGameScore / 10);
    const dataScore = readPages.length * 50;
    const commsScore = commsVisited ? 100 : 0;
    return studyScore + answerScore + badgeScore + gameScore + dataScore + commsScore;
  }, [completedMissions, answeredPages, allTimeBadges, totalGameScore, readPages, commsVisited]);

  // 랭크 결정
  const rank = useMemo(() => {
    if (honorScore >= 5000) return { label: '전설의 대원', icon: '🌟', color: 'text-amber-300' };
    if (honorScore >= 3000) return { label: '영웅 대원', icon: '🚀', color: 'text-purple-300' };
    if (honorScore >= 1500) return { label: '베테랑 대원', icon: '⭐', color: 'text-cyan-300' };
    if (honorScore >= 500) return { label: '훈련 대원', icon: '🛸', color: 'text-green-300' };
    return { label: '신규 대원', icon: '🪐', color: 'text-gray-400' };
  }, [honorScore]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0c0c0e]">
      {/* 배경 장식 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* ── 헤더: 대원 명패 ── */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full blur-[3px] animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">명예의 전당</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Hall of Fame · Training Station CP-08</p>
          </div>

          {/* 대원 명패 */}
          <div className="inline-block bg-white/[0.03] border border-amber-500/20 rounded-2xl px-8 py-5 mt-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{rank.icon}</span>
              <div className="text-left">
                <div className="text-lg font-black text-white">
                  {userInfo.name ? `${userInfo.name} 대원` : '익명 대원'}
                </div>
                <div className={`text-xs font-bold uppercase tracking-widest ${rank.color}`}>{rank.label}</div>
                {userInfo.dream && (
                  <div className="text-[10px] text-gray-500 mt-1 italic">"{userInfo.dream}"</div>
                )}
              </div>
              <div className="ml-6 text-right">
                <div className="text-[9px] text-gray-500 uppercase tracking-wider">명예 점수</div>
                <div className="text-2xl font-black text-amber-400 leading-none">{honorScore.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 1. 게임 전적 ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <SectionHeader
            icon={Gamepad2}
            label="게임 전적"
            color="bg-orange-500/10 text-orange-400"
            count={`배지 ${allTimeBadges.length}개 획득`}
          />

          {/* 게임 통계 수치 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-black/30 rounded-xl p-4 text-center border border-white/5">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">누적 점수</div>
              <div className="text-2xl font-black text-orange-400">{totalGameScore.toLocaleString()}</div>
            </div>
            <div className="bg-black/30 rounded-xl p-4 text-center border border-white/5">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">획득 배지</div>
              <div className="text-2xl font-black text-amber-400">{allTimeBadges.length}</div>
            </div>
          </div>

          {/* 배지 갤러리 */}
          {allTimeBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allTimeBadges.map(badge => {
                const rarity = getBadgeRarity(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${rarity.color} transition-all hover:scale-[1.01]`}
                  >
                    <span className="text-2xl flex-shrink-0">{badge.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white truncate">{badge.name}</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-60 flex-shrink-0">{rarity.label}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <Gamepad2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">게임을 플레이하고 배지를 획득해보세요</p>
            </div>
          )}
        </div>

        {/* ── 2. 학습 기록 ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <SectionHeader
            icon={BookOpen}
            label="학습 기록"
            color="bg-green-500/10 text-green-400"
            count={`${completedMissions.length} / ${missions.length} 미션 완료`}
          />

          {/* 미션 완료 현황 */}
          <div className="space-y-2 mb-5">
            {missions.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.completed ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-white/10'}`} />
                <span className={`text-xs truncate ${m.completed ? 'text-white' : 'text-gray-600'}`}>{m.title}</span>
                {m.completed && <span className="ml-auto text-[9px] text-green-400 font-bold flex-shrink-0">COMPLETE</span>}
              </div>
            ))}
          </div>

          {/* 내가 쓴 답변 */}
          {answeredPages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">내가 쓴 답변 ({answeredPages.length}개)</span>
              </div>
              <div className="space-y-3">
                {answeredPages.map(page => (
                  <div key={page.id} className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-base flex-shrink-0">{page.icon}</span>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400">{page.title}</div>
                        <div className="text-[11px] text-gray-300 mt-0.5 italic">Q. {page.question}</div>
                      </div>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/10 rounded-lg px-3 py-2 mt-2">
                      <p className="text-xs text-gray-200 leading-relaxed">{userAnswers[page.id]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedMissions.length === 0 && (
            <div className="text-center py-6 text-gray-600">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">STUDY 탭에서 미션을 시작해보세요</p>
            </div>
          )}
        </div>

        {/* ── 3. 지식 탐구 기록 (COMMS + DATA) ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <SectionHeader
            icon={Database}
            label="지식 탐구 기록"
            color="bg-cyan-500/10 text-cyan-400"
          />

          <div className="grid grid-cols-2 gap-4">
            {/* COMMS */}
            <div className={`rounded-xl p-4 border transition-all ${commsVisited ? 'bg-purple-500/5 border-purple-500/20' : 'bg-black/20 border-white/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className={`w-4 h-4 ${commsVisited ? 'text-purple-400' : 'text-gray-600'}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">COMMS</span>
              </div>
              <div className="text-lg font-black text-white">{commsVisited ? '탐구 완료' : '미방문'}</div>
              <p className="text-[10px] text-gray-500 mt-1">
                {commsVisited
                  ? '쥘 베른 심층 분석 3편 열람'
                  : 'COMMS 탭을 방문해보세요'}
              </p>
              {commsVisited && (
                <div className="mt-2 text-[9px] font-bold text-purple-400 uppercase tracking-wider">+100pts</div>
              )}
            </div>

            {/* DATA */}
            <div className={`rounded-xl p-4 border transition-all ${readPages.length > 0 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-black/20 border-white/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={`w-4 h-4 ${readPages.length > 0 ? 'text-cyan-400' : 'text-gray-600'}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">DATA</span>
              </div>
              <div className="text-lg font-black text-white">
                {readPages.length} <span className="text-sm text-gray-500">/ {spaceFacts.length}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">우주 아카이브 열람 완료</p>
              {readPages.length > 0 && (
                <div className="mt-2 text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                  +{readPages.length * 50}pts
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. 종합 명예 점수 분석 ── */}
        <div className="bg-gradient-to-br from-amber-500/5 to-purple-500/5 border border-amber-500/20 rounded-2xl p-6">
          <SectionHeader
            icon={Trophy}
            label="명예 점수 분석"
            color="bg-amber-500/10 text-amber-400"
          />
          <div className="space-y-2">
            {[
              { label: '미션 완료', value: completedMissions.length * 200, unit: `${completedMissions.length}개 × 200` },
              { label: '질문 답변', value: answeredPages.length * 150, unit: `${answeredPages.length}개 × 150` },
              { label: '게임 점수', value: Math.floor(totalGameScore / 10), unit: `${totalGameScore.toLocaleString()} ÷ 10` },
              { label: '희귀 배지', value: allTimeBadges.filter(b => RARE_BADGE_IDS.has(b.id)).length * 300, unit: `${allTimeBadges.filter(b => RARE_BADGE_IDS.has(b.id)).length}개 × 300` },
              { label: '일반 배지', value: allTimeBadges.filter(b => !RARE_BADGE_IDS.has(b.id)).length * 100, unit: `${allTimeBadges.filter(b => !RARE_BADGE_IDS.has(b.id)).length}개 × 100` },
              { label: 'DATA 열람', value: readPages.length * 50, unit: `${readPages.length}편 × 50` },
              { label: 'COMMS 탐구', value: commsVisited ? 100 : 0, unit: commsVisited ? '완료' : '미방문' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-[11px] text-gray-400">{row.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-gray-600">{row.unit}</span>
                  <span className="text-xs font-bold text-amber-300 w-16 text-right">{row.value.toLocaleString()} pt</span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-black text-white">총 명예 점수</span>
              <span className="text-xl font-black text-amber-400">{honorScore.toLocaleString()} pt</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[9px] text-gray-700 uppercase tracking-widest pb-4">
          Hall of Fame · InblanQ Training Station CP-08
        </p>
      </div>
    </div>
  );
}
