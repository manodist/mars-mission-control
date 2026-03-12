/**
 * 🎮 우주 레이저 게임 상수 관리
 * 미션 시간, 밸런스, 물리 상수를 한곳에서 관리합니다.
 */

export const MISSION_TIMES = {
    low: 180,  // 초급: 3분 (180초)
    mid: 300,  // 중급: 5분 (300초)
    high: 3600 // 고급: 1시간
};

export const MISSION_GOALS = {
    low: 384400,   // 지구-달 평균 거리 (km)
    mid: 78000000, // 지구-화성 근접 거리 (km)
    high: 1000000000 // 10억 km (심우주 모드)
};

export const MISSION_LABELS = {
    low: "초급 (Mars Junior)",
    mid: "중급 (Mars Explorer)",
    high: "고급 (Mars Colonist)"
};

/**
 * 🚀 로켓 부품(부스터, 연료통) 색상 설정
 * GameLaunchpad 컴포넌트에서 참조합니다.
 */
export const TANK_COLORS = [
    { name: 'Classic Zenith', value: '#f8fafc', class: 'tank-color-white', borderClass: 'tank-border-white' },
    { name: 'Mars Oxide', value: '#a84c24', class: 'tank-color-orange', borderClass: 'tank-border-orange' },
    { name: 'Carbon Black', value: '#1e293b', class: 'tank-color-black', borderClass: 'tank-border-black' },
    { name: 'Solaris Gold', value: '#ca8a04', class: 'tank-color-gold', borderClass: 'tank-border-gold' }
];

/**
 * 🌌 특급 모드 미션 레벨 계산기 (Phase 1 + Phase 2 동적 위협)
 *
 * Phase 1 (0~10분): S-Curve로 Lv1 → Lv10 점진 상승
 * Phase 2 (10분~): 3개의 비조화(non-harmonic) 사인파 합성으로
 *   자연스럽게 오르내리는 위협 파동 생성 (Lv4~Lv10)
 *
 * 파동 주기가 서로 소수 비율이라 장기간 패턴이 반복되지 않아
 * 매 플레이마다 다른 우주 탐사 경험을 제공합니다.
 */
export function getHighDifficultyMissionLevel(time: number): number {
    if (time < 600) {
        // Phase 1: S-Curve 점진 상승 (0~10분)
        const progress = time / 600;
        const sCurve = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
        return Math.floor(sCurve * 9) + 1;
    }
    // Phase 2: 비조화 사인파 합성 동적 위협 (10분 이후)
    const t = time - 600;
    const wave1 = Math.sin(t * Math.PI / 97) * 3.0;  // 진폭 ±3.0, 주기 ~194초(3.2분) — 드라마틱 대파동
    const wave2 = Math.sin(t * Math.PI / 43) * 1.5;  // 진폭 ±1.5, 주기 ~86초(1.4분) — 중파동
    const wave3 = Math.sin(t * Math.PI / 19) * 0.8;  // 진폭 ±0.8, 주기 ~38초 — 세부 잔파
    const base = 7; // 기저 위협 레벨 (Lv7: 블랙홀 감지 구간)
    return Math.round(Math.max(4, Math.min(10, base + wave1 + wave2 + wave3)));
}

// 기존 COLORS (내부 로켓 색상) 명시적 추가 (필요 시)
export const COLORS = [
    { name: 'Zenith White', value: '#f8fafc', class: 'rocket-color-zenith' },
    { name: 'Cyber Blue', value: '#06b6d4', class: 'rocket-color-cyber' },
    { name: 'Emerald City', value: '#10b981', class: 'rocket-color-emerald' },
    { name: 'Nebula Purple', value: '#a855f7', class: 'rocket-color-nebula' },
    { name: 'Rose Quartz', value: '#f472b6', class: 'rocket-color-rose' }
];
