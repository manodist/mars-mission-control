import type { SpaceFact } from '../data/spaceFacts';

export type UpgradeType = 'max_health' | 'fuel_capacity' | 'magnet' | 'shield_boost' | 'luck' | 'plasma_cannon';

export type LaunchPhase = 'staging_initial' | 'staging_boosters_off' | 'staging_tank_off' | 'staging_fairing_off' | 'active';

export interface Position {
    x: number;
    y: number;
}


export interface GameState {
    score: number;
    health: number;
    fuel: number;
    level: number;
    distance: number;
    time: number;
    gameOver: boolean;
    gameStarted: boolean;
    difficulty: 'low' | 'mid' | 'high';
    gameOverReason?: 'fuel' | 'damage' | 'fireball';
    shieldActive: number; // 0 = no shield, 1-3 = shield hits remaining
    upgrades: Record<UpgradeType, number>; // Permanent upgrades (level 0-5)
    showUpgradeScreen: boolean;
    upgradePoints: number;
    gravityActive?: boolean;
    showFactScreen?: boolean;
    currentFact?: SpaceFact;
    showLevelUp?: number; // Level number to show in animation, 0 = hidden
    missionComplete?: boolean;
    isLanding?: boolean; // Landing sequence active
    planetAbsorbing?: boolean; // 로켓이 목적지 천체로 진입하는 흡수 효과 진행 중
    distanceToTarget: number;
    isRelaunch: boolean;
    sessionStartTime: number;
    autoDodgesRemaining: number;
    isDodgeFlashing: boolean;
    showStrategyModal: boolean;
    startDistance: number;
    isPaused: boolean;
    isAutoPilot: boolean;
    isSpeedEffect: boolean; // 🚀 고속 주행 시 시각 효과 활성화 여부
    speedEffectIntensity: number; // 🚀 효과 강도 (0 ~ 1)
    timeFreezeUntil: number; // Duration until time freeze ends (game loop time)
    showLaunchpad: boolean;  // Launchpad screen visibility
    showStaging?: boolean;   // Rocket staging sequence visibility
    rocketCustomization: RocketCustomization;
    stats?: GameStats;       // Mission statistics
    earnedBadges?: Badge[];  // Badges earned in this mission
    bgmVolume: number;       // Background music volume (0-1)
    bgmTrack: string;        // Selected background music track
    completedMissions: Record<'low' | 'mid' | 'high', boolean>; // 난이도별 완료 상태 저장
    fps: number;             // 실시간 프레임 수
}

export interface RocketCustomization {
    color: string;           // CSS color or hex
    decal: string;           // Decal name or ID
    engineType: 'standard' | 'plasma' | 'nuclear';
    astronautName: string;
    tankColor?: string; // Color of the main fuel tank
    boosterColor?: string; // Color of the side boosters
    boosterMessage?: string; // Sentence to display on boosters (legacy single field)
    boosterMessageLeft?: string; // Left booster text
    boosterMessageRight?: string; // Right booster text
}

export interface Particle {
    id: number | string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export interface Obstacle {
    id: number | string;
    x: number;
    y: number;
    speed: number;
    type: 'asteroid' | 'crystal' | 'star' | 'wrench' | 'fireball' | 'satellite' | 'debris' | 'blackhole' | 'stardust' | 'shield' | 'hourglass';
    size: number;
    health?: number; // Hit points to destroy (if destroyable)
    damage?: number; // Damage to player health on collision
    variant?: 'gray' | 'brown' | 'red' | 'dark'; // Color variant for asteroids
    vx?: number; // Horizontal velocity for debris
    oscillation?: { amplitude: number; frequency: number; initialX: number }; // For curved movement
    scoreType?: 'small' | 'medium' | 'large';
    centerY?: number; // Center Y for circular movement
    angle?: number;   // Current angle for circular movement
    targetSize?: number; // For growth effect
    blink?: boolean; // For blinking effect
    isDodged?: boolean; // For passing over without collision
    splitting?: boolean; // For meteorites that split into smaller ones
    isSplitChild?: boolean; // To identify fragments of a split meteorite
    blackHoleImmune?: boolean; // 블랙홀 면역: 다른 z축 깊이에 있어 흡수되지 않는 장애물
}

export interface Bullet {
    id: number | string;
    x: number;
    y: number;
    speed: number;
    power: number;
}

export interface GameTweaks {
    speedMultiplier: number;
    obstacleDensity: number;
    itemFrequency: number;
    rocketScale: number;
}

export interface GameStats {
    asteroidsDestroyed?: number;
    itemsCollected?: number;
    damageTaken?: number;
    // 플레이 스타일 분석을 위한 세밀한 메트릭
    closeCalls?: number;              // 체력 1 상태로 플레이한 시간 (초)
    lowFuelTime?: number;             // 연료 10% 미만 상태 시간 (초)
    perfectDodges?: number;           // 장애물을 아슬아슬하게 회피한 횟수
    shieldUsages?: number;            // 보호막 활성화 횟수
    shieldSaves?: number;             // 보호막으로 막은 피해 횟수
    timeFrozen?: number;              // 시간 정지 사용 횟수
    bulletsShot?: number;             // 발사한 총알 수
    maxCombo?: number;                // 최대 연속 파괴 콤보
    fuelPickups?: number;             // 연료 아이템 획득 횟수
    healthPickups?: number;           // 체력 아이템 획득 횟수
    blackHolesEscaped?: number;       // 블랙홀 탈출 횟수
    completionTime?: number;          // 미션 완료 시간 (초)
    averageHealth?: number;           // 평균 체력 (누적/시간)
    averageFuel?: number;             // 평균 연료 (누적/시간)
    riskScore?: number;               // 위험 감수 점수 (낮은 체력/연료 시간 기반)
    efficiencyScore?: number;         // 효율성 점수 (최소 자원으로 최대 성과)
}

export type BadgeId =
    // 기존 뱃지
    | 'iron_hull' | 'speed_demon' | 'eco_pilot' | 'survivor' | 'star_hunter'
    | 'running_on_fumes' | 'close_call' | 'lucky_77'
    | 'space_tycoon' | 'shield_guardian' | 'minimalist'
    | 'long_hauler' | 'ironclad' | 'black_hole' | 'safety_first' | 'gambler' | 'destroyer'
    // 플레이 스타일 뱃지
    | 'daredevil' | 'tactician' | 'ghost' | 'sniper' | 'hoarder'
    | 'zen_master' | 'speedrunner' | 'turtle' | 'perfectionist' | 'improviser'
    | 'berserker' | 'pacifist' | 'clutch_king' | 'ice_in_veins' | 'thrill_seeker'
    | 'resource_king' | 'glass_cannon' | 'tank' | 'balanced' | 'chaos_agent'
    // 희귀 & 특별 뱃지
    | 'phoenix' | 'time_lord' | 'void_walker' | 'untouchable' | 'immortal'
    | 'one_percent' | 'fortune_teller' | 'last_breath' | 'needle_thread';

export interface Badge {
    id: BadgeId;
    name: string;
    description: string;
    icon: string;
    color: string;
    message?: string;
}
