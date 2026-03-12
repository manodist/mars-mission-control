/**
 * 🚀 MARS MISSION CONTROL - GAME CONFIGURATION (BALANCING)
 * 
 * 이 파일은 게임의 난이도, 속도, 아이템 등장 확률 등 모든 밸런싱 수치를 관리합니다.
 * 실장님이 "속도 조절해줘" 혹은 "아이템 더 많이 나오게 해줘"라고 말씀하시면
 * 저 김비서가 이 파일의 수치를 조정하여 즉시 반영해 드립니다. ✨
 */

export const GAME_CONFIG = {
    // ==========================================================================
    // 1. 속도 설정 (SPEED SETTINGS)
    // ==========================================================================
    SPEED: {
        // 게임의 전반적인 기본 속도 배율 (1.0이 표준)
        baseMultiplier: 1.0,

        // 난이도별 기본 이동 속도 (초당 이동 거리)
        // min 값만 실제로 사용됩니다. 최종 속도 = min × autoDifficulty.speed × speedMultiplier
        // max 값은 현재 미연결 — 상한선 제어는 autoDifficulty 자동 증가 시스템이 담당합니다.
        baseSpeed: {
            low: { min: 1, max: 1.5 },
            mid: { min: 1.5, max: 2.0 },
            high: { min: 1.5, max: 3.0 },
        },

        // ℹ️ 이제 난이도는 미션 진행도(%) 기반 단일 시스템으로 통합되었습니다.
        // 기존의 거리 기반 연속 증가 계수(Threshold, Cap)는 더 이상 사용되지 않으며,
        // CosmicGame.tsx의 useEffect 내 미션 진행률 로직이 이를 대체합니다.
    },

    // ==========================================================================
    // 2. 장애물 및 아이템 생성 설정 (SPAWN & DENSITY SETTINGS)
    // ==========================================================================
    SPAWN: {
        // 매 프레임당 기본 생성 확률 (기본값)
        baseChance: {
            demo: 0.05,
            active: 0.1,
        },

        // 난이도별 장애물 생성 빈도 배율
        spawnRateMult: {
            low: 0.6,  // 1.0 -> 0.6 하향 (초급 튜토리얼 구간 밀도 완화)
            mid: 1.5,  // 1.8 -> 1.5 하향 (초급-중급 난이도 벽 완화)
            high: 2,   // 2.0
        },

        // ⚠️ 아래 두 항목은 현재 코드에서 직접 사용되지 않습니다.
        // 레벨별 밀도는 autoDifficulty.density × spawnMult 조합으로 대신 처리됩니다.
        // levelDensityBoostFactor: 0.15,  // 미연결 (참고용 보존)
        // densityBoostCap: 5.0,           // 미연결 (참고용 보존)

        // 화면상에 동시에 존재할 수 있는 최대 장애물/위험 요소 개수 (화면 너비에 따라 조정됨)
        maxHazards: {
            mobile: 5,
            tablet: 7,
            desktop: 10,
        },
    },

    // ==========================================================================
    // 3. 아이템 확률 설정 (ITEM PROBABILITY SETTINGS)
    // ==========================================================================
    ITEMS: {
        // 난이도별 아이템 등장 기본 확률
        baseChance: {
            low: 0.9,
            mid: 0.8,
            high: 0.7, // 0.25 -> 0.32 상향 (장애물 밀도 3.5x 대비 아이템 빈도 보완)
        },

        // 레벨이 높아질수록 아이템이 덜 나오게 하는 감소율
        levelPenaltyFactor: 0.02, // 0.03 -> 0.02 완화
        minItemChance: 0.3,

        // 연료 부족 시 보너스 확률 (최대치)
        fuelShortageBonusCap: 0.5,

        // 부상 시(체력 50% 미만) 아이템 확률 보너스
        injuredBonus: 0.5,

        // 최종 아이템 등장 확률 상한선
        maxFinalChance: 0.5,

        // 아이템 전용 스폰 기본 간격 (초) — itemChance에 반비례하여 실제 간격이 결정됩니다
        // 낮출수록 크리스탈 포함 모든 아이템이 더 자주 등장합니다
        itemBaseInterval: 0.5,

        // ⚠️ 아래 types 가중치는 현재 코드에서 직접 사용되지 않습니다.
        // 실제 아이템 선택 로직은 CosmicGame.tsx spawnObstacle()의 조건 분기로 처리됩니다.
        // (연료 잔량, 체력 상태, 쿨다운 등 상황 맥락에 따른 동적 선택이 순수 가중치보다 게임성이 높음)
        // 크리스탈 출현 비율 조정: CosmicGame.tsx spawnObstacle()의 subRand 임계값(현재 0.93)을 수정하세요.
        // 아이템 등장 간격 조정: 위의 itemBaseInterval을 수정하세요.
        types: {
            star: { weight: 0.35, description: '연료 아이템 (⚠️ 미연결 — 참고용)' },
            crystal: { weight: 1.0, description: '점수 아이템 (⚠️ 미연결 — 참고용)' },
            wrench: { weight: 0.12, description: '수리 아이템 (⚠️ 미연결 — 참고용)' },
            shield: { weight: 0.1, description: '보호막 아이템 (⚠️ 미연결 — 참고용)' },
            hourglass: { weight: 0.05, description: '시간 정지 아이템 (⚠️ 미연결 — 참고용)' },
        }
    },

    // ==========================================================================
    // 4. 쿨타임 및 특수 이벤트 설정 (COOLDOWN & SPECIAL EVENTS)
    // ==========================================================================
    COOLDOWNS: {
        debris: 8,      // 간격 단축
        fireball: 8,    // 간격 단축
        blackhole: 45,  // 간격 단축
        heal: 20,
        fuel: 8,
        shield: 30,
        redMeteor: 8,
        expanding: 4,
        hourglass: 40,
    },

    // ==========================================================================
    // 5. 플레이어 및 로켓 설정 (PLAYER & ROCKET SETTINGS)
    // ==========================================================================
    PLAYER: {
        initialHealth: 5,
        initialFuel: 100,
        fuelCapacityUpgradeStep: 20,
        initialAutoDodges: 1,

        // 발사 초기 시퀀스 지속 시간 (초) — 이 시간 동안 장애물이 전혀 등장하지 않습니다
        launchDuration: {
            tutorial: 4.0,      // 초급(low) 전용 — 더 긴 안전 구간
            standard: 3.0,      // 중급(mid) 기본값
            highIntensity: 2.0, // 고급(high) — 빠르게 전투 돌입
        },

        // 난이도가 정상화(Ramping)되는 데 걸리는 시간 (초)
        // 이 시간 동안 장애물 밀도가 10% → 100%로 선형 증가합니다
        rampDuration: {
            tutorial: 15,       // 초급(low) 
            standard: 10,        // 중급(mid) 
            highIntensity: 10, // 고급(high)
        }
    }
};
