import type { GameState, Badge, BadgeId, GameStats } from '../types/game';

export const BADGE_DEFINITIONS: Record<BadgeId, Omit<Badge, 'id'>> = {
    iron_hull: {
        name: '강철의 의지',
        description: '피해 없이 미션을 완수했습니다.',
        icon: '🛡️',
        color: 'bg-slate-500',
        message: '어떤 시련이 와도 흔들리지 않는 강인한 마음이 당신을 지켜줄 거예요.'
    },
    speed_demon: {
        name: '빛의 속도',
        description: '놀라운 속도로 미션을 완료했습니다.',
        icon: '⚡',
        color: 'bg-yellow-500',
        message: '망설임 없이 나아가는 용기가 당신을 가장 빛나는 곳으로 이끌어 줄 거예요.'
    },
    eco_pilot: {
        name: '에코 파일럿',
        description: '연료를 80% 이상 남기고 완료했습니다.',
        icon: '🌱',
        color: 'bg-green-500',
        message: '가진 것을 소중히 여기는 마음이 더 큰 풍요로움을 가져다줍니다.'
    },
    survivor: {
        name: '불굴의 생존자',
        description: '체력 1을 남기고 극적으로 생존했습니다.',
        icon: '❤️‍🩹',
        color: 'bg-red-500',
        message: '끝까지 포기하지 않는 그 마음이 바로 기적을 만드는 힘입니다.'
    },
    star_hunter: {
        name: '별을 쫓는 자',
        description: '한 번의 미션에서 별 50개 이상을 획득했습니다.',
        icon: '⭐',
        color: 'bg-yellow-400',
        message: '높은 곳을 바라보며 꾸는 꿈은 당신의 삶을 별처럼 빛나게 할 거예요.'
    },
    running_on_fumes: {
        name: '한계 돌파',
        description: '연료가 5% 미만인 상태로 완료했습니다.',
        icon: '⛽',
        color: 'bg-orange-500',
        message: '벼랑 끝에서도 희망을 놓지 않는 순간, 새로운 길이 열립니다.'
    },
    close_call: {
        name: '위기 탈출',
        description: '보호막으로 치명적인 피해를 막아냈습니다.',
        icon: '😅',
        color: 'bg-blue-400',
        message: '준비된 자에게 위기는 곧 기회가 됩니다. 당신은 이미 준비되어 있어요.'
    },
    lucky_77: {
        name: '행운의 주인공',
        description: '점수 끝자리를 77로 맞췄습니다.',
        icon: '🎰',
        color: 'bg-purple-500',
        message: '오늘 당신에게 찾아온 행운은, 당신이 그동안 쌓아온 노력의 선물입니다.'
    },
    space_tycoon: {
        name: '우주 거상',
        description: '아이템을 100개 이상 획득했습니다.',
        icon: '💎',
        color: 'bg-cyan-400',
        message: '작은 성취들이 모여 위대한 결과를 만듭니다. 당신의 성실함이 그 증거예요.'
    },
    shield_guardian: {
        name: '수호자',
        description: '오랫동안 보호막을 유지했습니다.',
        icon: '🛡️',
        color: 'bg-emerald-500',
        message: '당신 자신을 소중히 지키는 것이 세상을 지키는 첫걸음입니다.'
    },
    minimalist: {
        name: '미니멀리스트',
        description: '업그레이드 없이 미션을 완수했습니다.',
        icon: '⚪',
        color: 'bg-gray-400',
        message: '화려한 조건 없이도 당신은 그 자체로 충분히 훌륭하고 강인합니다.'
    },
    long_hauler: {
        name: '끈기있는 탐험가',
        description: '한 번에 100,000km 이상 비행했습니다.',
        icon: '🚚',
        color: 'bg-blue-600',
        message: '꾸준함은 그 어떤 재능보다 강력합니다. 당신의 끈기가 멋진 미래를 만들 거예요.'
    },
    ironclad: {
        name: '철벽 방어',
        description: '최대 체력을 끝까지 강화했습니다.',
        icon: '🤖',
        color: 'bg-slate-700',
        message: '탄탄한 기본기는 당신이 더 높이 날아오를 수 있는 튼튼한 발판이 되어줍니다.'
    },
    black_hole: {
        name: '사건의 지평선',
        description: '블랙홀의 위협에서 살아남았습니다.',
        icon: '⚫',
        color: 'bg-violet-900',
        message: '가장 어두운 순간에도 빛을 향해 나아가는 당신의 의지가 길을 밝혀줄 거예요.'
    },
    safety_first: {
        name: '무사고 운전',
        description: '기체 손상 없이 안전하게 완료했습니다.',
        icon: '⛑️',
        color: 'bg-white',
        message: '신중함과 조심성은 겁이 아니라, 소중한 것을 지킬 줄 아는 지혜입니다.'
    },
    gambler: {
        name: '승부사',
        description: '행운 스텟에 많이 투자했습니다.',
        icon: '🎲',
        color: 'bg-rose-500',
        message: '가끔은 대담한 도전이 인생을 긍정적인 방향으로 180도 바꿔놓기도 합니다.'
    },
    destroyer: {
        name: '파괴자',
        description: '장애물 50개 이상을 파괴했습니다.',
        icon: '💥',
        color: 'bg-red-600',
        message: '두려움에 맞서 싸우는 용기가 당신 앞의 모든 장애물을 사라지게 할 거예요.'
    },

    // === 플레이 스타일 뱃지 ===
    daredevil: {
        name: '데어데블',
        description: '체력 1로 10초 이상 비행했습니다.',
        icon: '😎',
        color: 'bg-orange-600',
        message: '위험 속에서도 침착함을 잃지 않는 당신, 진정한 모험가의 모습이에요.'
    },
    tactician: {
        name: '전략가',
        description: '평균 체력 80% 이상, 평균 연료 60% 이상 유지.',
        icon: '🧠',
        color: 'bg-indigo-500',
        message: '철저한 계획과 실행력, 그것이 바로 당신만의 성공 방정식입니다.'
    },
    ghost: {
        name: '고스트',
        description: '장애물 10개 미만 파괴, 완벽한 회피 플레이.',
        icon: '👻',
        color: 'bg-gray-500',
        message: '부드러운 물이 바위를 뚫듯, 유연함이 때로는 가장 강한 힘이 됩니다.'
    },
    sniper: {
        name: '스나이퍼',
        description: '명중률 90% 이상, 정확한 사격.',
        icon: '🎯',
        color: 'bg-red-500',
        message: '정확한 한 발이 무분별한 백 발보다 낫다는 것을 당신은 알고 있어요.'
    },
    hoarder: {
        name: '수집가',
        description: '아이템 150개 이상 수집.',
        icon: '🗃️',
        color: 'bg-amber-500',
        message: '작은 것도 소중히 여기는 마음이 큰 풍요를 만들어냅니다.'
    },
    zen_master: {
        name: '젠 마스터',
        description: '피해 3회 이하, 연료 효율 최상.',
        icon: '🧘',
        color: 'bg-teal-400',
        message: '고요함 속에서 완벽을 추구하는 당신의 여정이 아름답습니다.'
    },
    speedrunner: {
        name: '스피드러너',
        description: '기록적인 속도로 미션 완료 (난이도별 최상위 10%).',
        icon: '🏃',
        color: 'bg-yellow-400',
        message: '때로는 빠르게 달려가는 결단력이 새로운 문을 열어줍니다.'
    },
    turtle: {
        name: '거북이',
        description: '매우 느리지만 안전하게 완료 (평균 체력 90%+).',
        icon: '🐢',
        color: 'bg-green-600',
        message: '천천히 가도 괜찮아요. 중요한 건 포기하지 않고 끝까지 가는 거니까요.'
    },
    perfectionist: {
        name: '완벽주의자',
        description: '피해 0, 연료 70%+, 아이템 100+, 파괴 30+.',
        icon: '💯',
        color: 'bg-purple-600',
        message: '당신의 완벽함을 향한 열정이 세상을 더 나은 곳으로 만듭니다.'
    },
    improviser: {
        name: '즉흥 연주자',
        description: '업그레이드 랜덤, 다양한 전략 사용.',
        icon: '🎭',
        color: 'bg-pink-500',
        message: '예측 불가능한 상황에서도 최선을 찾아내는 당신의 창의성이 빛납니다.'
    },
    berserker: {
        name: '버서커',
        description: '장애물 70개 이상 파괴, 공격적 플레이.',
        icon: '⚔️',
        color: 'bg-red-700',
        message: '때로는 정면 돌파가 가장 빠른 해결책이 되기도 합니다.'
    },
    pacifist: {
        name: '평화주의자',
        description: '장애물 5개 미만 파괴, 완벽 회피.',
        icon: '☮️',
        color: 'bg-sky-400',
        message: '싸우지 않고 이기는 것, 그것이 가장 높은 경지입니다.'
    },
    clutch_king: {
        name: '클러치 킹',
        description: '체력 1 상태에서 15초 이상 생존.',
        icon: '👑',
        color: 'bg-yellow-500',
        message: '가장 어려운 순간에 빛을 발하는 당신, 진정한 챔피언입니다.'
    },
    ice_in_veins: {
        name: '냉혈한',
        description: '완벽한 회피 10회 이상, 흔들림 없는 플레이.',
        icon: '🧊',
        color: 'bg-cyan-300',
        message: '차가운 머리와 뜨거운 가슴, 그 균형이 당신을 특별하게 만듭니다.'
    },
    thrill_seeker: {
        name: '스릴 추구자',
        description: '위험 점수 300+, 아슬아슬한 플레이.',
        icon: '🎢',
        color: 'bg-orange-500',
        message: '한계에 도전하는 용기가 당신을 평범함에서 벗어나게 합니다.'
    },
    resource_king: {
        name: '자원 관리 왕',
        description: '연료 90%+, 체력 최대, 아이템 120+.',
        icon: '📊',
        color: 'bg-emerald-600',
        message: '준비된 자에게 기회는 반드시 찾아옵니다. 당신처럼요.'
    },
    glass_cannon: {
        name: '유리 대포',
        description: '파괴 50+, 평균 체력 40% 미만.',
        icon: '🔫',
        color: 'bg-red-400',
        message: '공격이 최선의 방어라는 것을 몸소 증명하는 당신의 스타일이 멋져요.'
    },
    tank: {
        name: '탱커',
        description: '체력 업그레이드 최대, 피해 10회 이상 생존.',
        icon: '🛡️',
        color: 'bg-slate-600',
        message: '견고한 기반 위에서 피어나는 꽃이 가장 오래 갑니다.'
    },
    balanced: {
        name: '균형자',
        description: '모든 스탯이 고르게 분포.',
        icon: '⚖️',
        color: 'bg-blue-500',
        message: '균형 잡힌 삶이야말로 가장 아름다운 예술 작품입니다.'
    },
    chaos_agent: {
        name: '카오스 에이전트',
        description: '극단적인 플레이 (체력 1 + 연료 5% + 파괴 40+).',
        icon: '🌀',
        color: 'bg-violet-600',
        message: '혼돈 속에서도 질서를 만들어내는 당신만의 방식이 있어요.'
    },

    // === 희귀 & 전설 뱃지 ===
    phoenix: {
        name: '불사조',
        description: '체력 1에서 풀 체력으로 회복 후 완료.',
        icon: '🔥',
        color: 'bg-gradient-to-r from-orange-500 to-red-600',
        message: '넘어져도 다시 일어서는 당신, 그 모습이 가장 아름답습니다.'
    },
    time_lord: {
        name: '시간의 지배자',
        description: '시간 정지를 5회 이상 효과적으로 사용.',
        icon: '⏰',
        color: 'bg-gradient-to-r from-purple-500 to-blue-600',
        message: '기회를 포착하는 타이밍, 그것이 성공의 비밀입니다.'
    },
    void_walker: {
        name: '공허의 방랑자',
        description: '블랙홀 3개 이상 탈출.',
        icon: '🌌',
        color: 'bg-gradient-to-r from-violet-900 to-black',
        message: '가장 어두운 순간도 두려워하지 않는 당신의 용기가 길을 밝혀요.'
    },
    untouchable: {
        name: '언터쳐블',
        description: '완벽한 회피 20회 이상.',
        icon: '✨',
        color: 'bg-gradient-to-r from-cyan-400 to-blue-500',
        message: '완벽에 가까운 실력, 그것은 재능이 아닌 노력의 결과입니다.'
    },
    immortal: {
        name: '불멸자',
        description: '피해 0, 연료 80%+, 아이템 150+, 파괴 50+.',
        icon: '🏆',
        color: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600',
        message: '전설은 이렇게 만들어지는 거예요. 당신이야말로 진정한 전설입니다.'
    },
    one_percent: {
        name: '1%의 기적',
        description: '체력 1%, 연료 1%로 완료.',
        icon: '🎯',
        color: 'bg-gradient-to-r from-red-600 to-pink-600',
        message: '끝까지 포기하지 않은 당신만이 볼 수 있는 기적입니다.'
    },
    fortune_teller: {
        name: '운명의 예언자',
        description: '행운 관련 뱃지 3개 이상 동시 획득.',
        icon: '🔮',
        color: 'bg-gradient-to-r from-purple-600 to-pink-600',
        message: '행운은 준비된 자에게 찾아온다는 말, 당신을 위한 말이에요.'
    },
    last_breath: {
        name: '마지막 숨결',
        description: '체력 1 상태로 20초 이상.',
        icon: '💀',
        color: 'bg-gradient-to-r from-gray-700 to-red-900',
        message: '절망의 끝에서도 희망을 놓지 않는 당신의 의지가 경이롭습니다.'
    },
    needle_thread: {
        name: '바늘구멍 통과',
        description: '완벽한 회피 15회 + 체력 1 경험.',
        icon: '🪡',
        color: 'bg-gradient-to-r from-blue-600 to-purple-600',
        message: '위기를 기회로, 불가능을 가능으로 만드는 당신의 순간 판단력이 놀랍습니다.'
    }
};

export function calculateBadges(state: GameState): Badge[] {
    const badges: Badge[] = [];
    const defaultStats: Required<GameStats> = {
        asteroidsDestroyed: 0,
        itemsCollected: 0,
        damageTaken: 0,
        closeCalls: 0,
        lowFuelTime: 0,
        perfectDodges: 0,
        shieldUsages: 0,
        shieldSaves: 0,
        timeFrozen: 0,
        bulletsShot: 0,
        maxCombo: 0,
        fuelPickups: 0,
        healthPickups: 0,
        blackHolesEscaped: 0,
        completionTime: 0,
        averageHealth: 0,
        averageFuel: 0,
        riskScore: 0,
        efficiencyScore: 0
    };
    const stats: Required<GameStats> = { ...defaultStats, ...state.stats };


    const maxFuel = 100 + state.upgrades.fuel_capacity * 20;
    const maxHealth = 5 + state.upgrades.max_health;
    const fuelPercent = state.fuel / maxFuel;
    const healthPercent = state.health / maxHealth;

    // Helper to add badge
    const addBadge = (id: BadgeId) => {
        if (!badges.find(b => b.id === id)) {
            badges.push({ id, ...BADGE_DEFINITIONS[id] });
        }
    };

    // === 기존 뱃지 (개선된 조건) ===

    // 1. Health & Survival
    if (state.health === 1) addBadge('survivor');
    if (state.health === maxHealth && stats.damageTaken === 0) addBadge('iron_hull');
    if (stats.damageTaken === 0) addBadge('safety_first');

    // 2. Fuel
    if (fuelPercent > 0.8) addBadge('eco_pilot');
    if (fuelPercent < 0.05 && state.fuel > 0) addBadge('running_on_fumes');

    // 3. Combat & Collection
    if (stats.asteroidsDestroyed >= 50) addBadge('destroyer');
    if (stats.itemsCollected >= 100) addBadge('space_tycoon');

    // 4. Distance & Speed
    if (state.distance > 100000) addBadge('long_hauler');

    // 5. Upgrades
    if (state.upgrades.max_health >= 5) addBadge('ironclad');
    if (state.upgrades.luck >= 3) addBadge('gambler');

    // 6. Luck
    if (state.score % 100 === 77) addBadge('lucky_77');

    // 7. Shield
    if (stats.shieldSaves >= 3) addBadge('close_call');
    if (stats.shieldUsages >= 5) addBadge('shield_guardian');

    // 8. Black Hole
    if (stats.blackHolesEscaped >= 1) addBadge('black_hole');

    // === 새로운 플레이 스타일 뱃지 ===

    // 위험 감수형 플레이어
    if (stats.closeCalls >= 10) addBadge('daredevil');
    if (stats.closeCalls >= 15) addBadge('clutch_king');
    if (stats.closeCalls >= 20) addBadge('last_breath');

    // 전략적 플레이어
    if (stats.averageHealth >= 0.8 && stats.averageFuel >= 0.6) addBadge('tactician');
    if (stats.damageTaken <= 3 && fuelPercent >= 0.7) addBadge('zen_master');

    // 회피 전문가
    if (stats.asteroidsDestroyed < 10 && stats.damageTaken === 0) addBadge('ghost');
    if (stats.asteroidsDestroyed <= 5 && state.missionComplete) addBadge('pacifist');
    if (stats.perfectDodges >= 10) addBadge('ice_in_veins');
    if (stats.perfectDodges >= 20) addBadge('untouchable');
    if (stats.perfectDodges >= 15 && state.health === 1) addBadge('needle_thread');

    // 전투 전문가
    if (stats.bulletsShot > 0) {
        const accuracy = stats.asteroidsDestroyed / stats.bulletsShot;
        if (accuracy >= 0.9 && stats.bulletsShot >= 20) addBadge('sniper');
    }
    if (stats.asteroidsDestroyed >= 70) addBadge('berserker');
    if (stats.asteroidsDestroyed >= 50 && stats.averageHealth < 0.4) addBadge('glass_cannon');

    // 수집가
    if (stats.itemsCollected >= 150) addBadge('hoarder');

    // 완벽주의자
    if (
        stats.damageTaken === 0 &&
        fuelPercent >= 0.7 &&
        stats.itemsCollected >= 100 &&
        stats.asteroidsDestroyed >= 30
    ) {
        addBadge('perfectionist');
    }

    // 속도 관련 (난이도별 기준 시간)
    const speedThresholds = {
        low: 60,    // 1분
        mid: 90,    // 1.5분
        high: 120   // 2분
    };
    if (stats.completionTime > 0 && stats.completionTime <= speedThresholds[state.difficulty]) {
        addBadge('speedrunner');
    }
    if (stats.completionTime > 180 && stats.averageHealth >= 0.9) {
        addBadge('turtle');
    }

    // 위험 추구자
    if (stats.riskScore >= 300) addBadge('thrill_seeker');

    // 자원 관리 왕
    if (fuelPercent >= 0.9 && state.health === maxHealth && stats.itemsCollected >= 120) {
        addBadge('resource_king');
    }

    // 탱커
    if (state.upgrades.max_health >= 4 && stats.damageTaken >= 10 && state.health > 0) {
        addBadge('tank');
    }

    // 균형잡힌 플레이
    const upgradeValues = Object.values(state.upgrades);
    const avgUpgrade = upgradeValues.reduce((a, b) => a + b, 0) / upgradeValues.length;
    const isBalanced = upgradeValues.every(v => Math.abs(v - avgUpgrade) <= 1);
    if (isBalanced && avgUpgrade >= 2) {
        addBadge('balanced');
    }

    // 카오스 에이전트
    if (state.health === 1 && fuelPercent <= 0.05 && stats.asteroidsDestroyed >= 40) {
        addBadge('chaos_agent');
    }

    // === 희귀 & 전설 뱃지 ===

    // 불사조 (체력 1에서 회복)
    if (stats.closeCalls >= 5 && stats.healthPickups >= 2 && state.health >= maxHealth - 1) {
        addBadge('phoenix');
    }

    // 시간의 지배자
    if (stats.timeFrozen >= 5) {
        addBadge('time_lord');
    }

    // 공허의 방랑자
    if (stats.blackHolesEscaped >= 3) {
        addBadge('void_walker');
    }

    // 불멸자 (완벽한 플레이)
    if (
        stats.damageTaken === 0 &&
        fuelPercent >= 0.8 &&
        stats.itemsCollected >= 150 &&
        stats.asteroidsDestroyed >= 50
    ) {
        addBadge('immortal');
    }

    // 1%의 기적
    if (healthPercent <= 0.01 && fuelPercent <= 0.01 && state.missionComplete) {
        addBadge('one_percent');
    }

    // 운명의 예언자 (행운 관련 뱃지 3개)
    const luckBadges = badges.filter(b =>
        ['lucky_77', 'gambler', 'survivor', 'running_on_fumes'].includes(b.id)
    );
    if (luckBadges.length >= 3) {
        addBadge('fortune_teller');
    }

    // 미니멀리스트 (업그레이드 없음)
    const totalUpgrades = Object.values(state.upgrades).reduce((a, b) => a + b, 0);
    if (totalUpgrades === 0 && state.missionComplete) {
        addBadge('minimalist');
    }

    // 즉흥 연주자 (다양한 업그레이드)
    const upgradeTypes = Object.values(state.upgrades).filter(v => v > 0).length;
    if (upgradeTypes >= 5) {
        addBadge('improviser');
    }

    return badges;
}
