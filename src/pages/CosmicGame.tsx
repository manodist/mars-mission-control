import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Pause, Play, Radio, Cpu, Activity, Settings, Hourglass } from "lucide-react";
import { MISSION_GOALS, MISSION_TIMES, getHighDifficultyMissionLevel } from "../constants/gameConstants";
import { SoundController } from "../utils/SoundController";
import type {
  UpgradeType,
  GameState,
  Obstacle,
  Bullet,
  Particle,
  GameTweaks,
} from "../types/game";
import { calculateBadges } from "../utils/badgeUtils";

// Game Components
import { GameHUD } from "../components/game/GameHUD";
import { GameTarget } from "../components/game/GameTarget";
import { GameMenu } from "../components/game/GameMenu";
import { GameUpgradeScreen } from "../components/game/GameUpgradeScreen";
import { GameFactOverlay } from "../components/game/GameFactOverlay";
import { GameGameOverOverlay } from "../components/game/GameGameOverOverlay";
import { GameMissionCompleteOverlay } from "../components/game/GameMissionCompleteOverlay";
import { GameStrategyModal } from "../components/game/GameStrategyModal";
import { GameSettingsModal } from "../components/game/GameSettingsModal";
import { GameBullets } from "../components/game/GameBullets";
import { GameObstacles } from "../components/game/GameObstacles";
import { GamePlayer } from "../components/game/GamePlayer";
import { GameParticles } from "../components/game/GameParticles";
import { GameLaunchpad } from "../components/game/GameLaunchpad";
import { StardustCanvasMemo } from "../components/game/StardustCanvas";
import { GalaxyCanvasMemo } from "../components/game/GalaxyCanvas";
import { AuroraCanvasMemo } from "../components/game/AuroraCanvas";
import type { LaunchPhase } from '../types/game';
// import { RocketStagingSequence } from "../components/game/RocketStagingSequence";
import { SPACE_FACTS } from "../data/spaceFacts";
import { GAME_CONFIG } from "../config/GameConfig";
import './CosmicGame.css';

// 배경음악 플레이리스트 정의 (공개 리소스 폴더 기반)
const BGM_PLAYLIST = [
  'space opera.mp3',
  'Space Ambient.mp3',
  'space racer.mp3',
  'Space Arcade.mp3',
];

interface CosmicGameProps {
  onGameOver?: (score: number, badges?: import('../types/game').Badge[]) => void;
  onScoreUpdate?: (score: number) => void; // Real-time score update
  defaultAstronautName?: string;
}

export default function CosmicGame({
  onGameOver,
  onScoreUpdate,
  defaultAstronautName = "",
}: CosmicGameProps) {
  // const [showStagingSequence, setShowStagingSequence] = useState(false);

  // 배경음악 관리
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  // BGM이 재생되어야 하는 상태인지 추적 (트랙 전환 시 자동 재생 여부 결정용)
  const bgmShouldPlayRef = useRef(false);

  // 🎮 Responsive scaling state
  const [gameScale, setGameScale] = useState(1);

  // 🎮 레벨 개념 분리: xpLevel(점수 누적용) vs missionLevel(현재 미션 난이도용)

  // missionLevel은 useEffect에서 진행도에 따라 계산되어 gameTweaks와 연동됩니다. (아래 로직 확인)

  // Responsive scaling logic
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Scale between 0.6 (mobile) and 1.0 (desktop)
      const scale = Math.min(1, Math.max(0.6, width / 1000));
      setGameScale(scale);

      // Adjust max limits based on width
      setGameScale(scale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [state, setState] = useState<GameState>({
    score: 0,
    health: GAME_CONFIG.PLAYER.initialHealth,
    fuel: GAME_CONFIG.PLAYER.initialFuel,
    level: 1,
    distance: 0,
    time: 0,
    gameOver: false,
    gameStarted: false,
    difficulty: "low",
    gameOverReason: undefined,
    shieldActive: 0,
    isSpeedEffect: false, // 🚀 고속 주행 시 시각 효과 활성화 여부
    speedEffectIntensity: 0, // 🚀 효과 강도 (0 ~ 1)
    upgrades: {
      max_health: 0,
      fuel_capacity: 0,
      magnet: 0,
      shield_boost: 0,
      luck: 0,
      plasma_cannon: 0,
    },
    showUpgradeScreen: false,
    upgradePoints: 0,
    gravityActive: false,
    showLevelUp: 0,
    missionComplete: false,
    isLanding: false,
    distanceToTarget: MISSION_GOALS["low"],
    isRelaunch: false,
    sessionStartTime: 0,
    autoDodgesRemaining: GAME_CONFIG.PLAYER.initialAutoDodges,
    isDodgeFlashing: false,
    showStrategyModal: false,
    isPaused: false,
    startDistance: 0,
    isAutoPilot: false,
    timeFreezeUntil: 0,
    showLaunchpad: false,
    rocketCustomization: {
      color: "#f8fafc", // Zenith White
      decal: "DEEP",
      engineType: "standard",
      astronautName: defaultAstronautName,
      tankColor: "#f8fafc", // Zenith White
      boosterColor: "#f8fafc", // Zenith White
      boosterMessage: "",
    },
    stats: {
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
      efficiencyScore: 0,
    },
    earnedBadges: [],
    bgmVolume: 0.3,
    bgmTrack: BGM_PLAYLIST[0],
    completedMissions: { low: false, mid: false, high: false }, // 임시 초기값
    fps: 60, // 실시간 FPS (초기값 60)
  });

  // 로컬 스토리지에서 완료된 미션 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mars_mission_completed");
      if (saved) {
        const completed = JSON.parse(saved);
        setState(s => ({ ...s, completedMissions: completed }));
      }
    } catch (err) {
      console.error("Failed to load completed missions:", err);
    }
  }, []);

  // ─── 최초 플레이 튜토리얼 감지 ─────────────────────────────────────────
  // localStorage에 방문 기록이 없을 때만 튜토리얼 오버레이를 표시합니다.
  useEffect(() => {
    try {
      const seen = localStorage.getItem("mars_tutorial_seen");
      if (!seen) setShowTutorial(true);
    } catch {
      // localStorage 접근 불가 시 조용히 무시
    }
  }, []);

  // Sync astronaut name if registered later
  useEffect(() => {
    if (defaultAstronautName && !state.rocketCustomization.astronautName) {
      setState(prev => ({
        ...prev,
        rocketCustomization: {
          ...prev.rocketCustomization,
          astronautName: defaultAstronautName
        }
      }));
    }
  }, [defaultAstronautName, state.rocketCustomization.astronautName]);

  // 배경음악 초기화 및 트랙 변경 (트랙이 바뀔 때만 실행)
  useEffect(() => {
    // 이전 트랙 정리 (새 Audio 객체 생성 전에 이전 것을 명시적으로 멈춤)
    if (bgmRef.current) {
      bgmRef.current.pause();
    }

    // 새 Audio 객체 생성
    const audio = new Audio(`/${state.bgmTrack}`);
    audio.loop = false; // 순차 재생: 개별 곡 반복 없음
    audio.volume = state.bgmVolume;
    bgmRef.current = audio;

    // 곡이 끝나면 자동으로 다음 트랙으로 전환
    const handleTrackEnd = () => {
      setState(prev => {
        const currentIndex = BGM_PLAYLIST.indexOf(prev.bgmTrack);
        const nextIndex = (currentIndex + 1) % BGM_PLAYLIST.length;
        return { ...prev, bgmTrack: BGM_PLAYLIST[nextIndex] };
      });
    };

    audio.addEventListener('ended', handleTrackEnd);

    // 게임 진행 중이라면 새 트랙을 즉시 재생 (끊김 없는 곡 전환)
    if (bgmShouldPlayRef.current) {
      audio.play().catch(err => {
        console.log('BGM autoplay prevented:', err);
      });
    }

    // 트랙 변경 또는 컴포넌트 언마운트 시 정리
    return () => {
      audio.removeEventListener('ended', handleTrackEnd);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.bgmTrack]); // ← 트랙 변경 시에만 재실행 (일시정지 등 게임 상태 변화에는 반응 안 함)

  // 볼륨 변경
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = state.bgmVolume;
    }
  }, [state.bgmVolume]);

  // 게임 상태에 따른 배경음악 재생/일시정지
  useEffect(() => {
    const shouldPlay = state.gameStarted && !state.gameOver && !state.isPaused && !state.missionComplete;
    // ref 업데이트: 트랙 전환 시 자동 재생 여부 결정에 사용됨
    bgmShouldPlayRef.current = shouldPlay;

    if (!bgmRef.current) return;

    if (shouldPlay) {
      // 게임 진행 중 - 현재 위치에서 계속 재생 (처음부터 다시 시작하지 않음)
      bgmRef.current.play().catch(err => {
        console.log('BGM autoplay prevented:', err);
      });
    } else {
      // 게임 종료, 일시정지, 미션 완료 - 현재 위치를 유지하며 일시정지
      bgmRef.current.pause();
    }
  }, [state.gameStarted, state.gameOver, state.isPaused, state.missionComplete]);

  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 70 }); // 🎯 게임 시작 시 중앙 정렬 (실장님 요청사항)
  // 🔑 stale closure 방지: useCallback 메모이제이션 안에서도 마우스 좌표를 최신 값으로 읽기 위한 Ref
  // targetPosition(state)는 GameTarget 렌더링용, targetPositionRef는 게임 루프 내부 연산용
  const targetPositionRef = useRef({ x: 50, y: 70 });
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 70 });
  // 🔑 stale closure 방지: playerPosition도 ref로 추적
  // 충돌 감지, 자석, 오토파일럿, 블랙홀 중력 등 updateGame 내부 모든 연산에 사용
  const playerPositionRef = useRef({ x: 50, y: 70 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  // 🔑 stale closure 방지: obstacles도 ref로 추적
  // updateGame 내부(자동항법, 블랙홀 중력 등)는 useCallback 클로저 때문에
  // obstacles state를 직접 읽으면 항상 초기 빈 배열을 봄 → 위협 탐지 불가 버그!
  const obstaclesRef = useRef<Obstacle[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  const [bullets, setBullets] = useState<Bullet[]>([]);
  // 🔑 stale closure 방지: bullets도 ref로 추적 (updateGame 클로저 내 총알 충돌 계산에 사용)
  const bulletsRef = useRef<Bullet[]>([]);
  const [shake, setShake] = useState(0);

  // ─── 튜토리얼 & 경고 시스템 ───────────────────────────────────────────
  // 최초 플레이어에게 핵심 메카닉을 알려주는 힌트 오버레이
  const [showTutorial, setShowTutorial] = useState(false);
  // blackhole / expanding 첫 등장 시 일회성 경고 메시지
  const [threatWarning, setThreatWarning] = useState<string | null>(null);
  // 어떤 특수 위협 유형을 이미 경고했는지 추적 (중복 경고 방지)
  const seenThreatsRef = useRef<Set<string>>(new Set());
  // 팽창 운석 경고 타이머 Ref (re-render 시 타이머 취소 방지)
  const threatWarningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── 별먼지 스트릭 시스템 제거됨 ───
  // UI 렌더링용

  const lastShotTime = useRef(0);
  const lastExpandingTime = useRef(0);
  const nextObstacleAllowedTime = useRef(0);
  const nextItemAllowedTime = useRef(0); // 아이템 전용 스폰 게이트 (장애물 밀도와 독립)
  const lastDebrisTime = useRef(0);
  const lastFireballTime = useRef(0);
  const lastBlackHoleTime = useRef(0);
  const lastSatelliteTime = useRef(0); // 🛰️ 인공위성 전용 쿨다운
  const lastRedMeteorTime = useRef(0);
  const lastFpsUpdateTime = useRef(0);
  const frameCount = useRef(0);
  // 아이템 쿨타임 추적용 Ref (Gemini 리팩토링으로 누락된 선언 복구)
  const lastStarTime = useRef(0);
  const lastHourglassTime = useRef(0);
  const lastHealTime = useRef(0);
  const lastShieldTime = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // 🆔 ID 생성 보강
  const getUniqueId = useCallback(() => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }, []);

  // 🔄 최신 상태 참조용 Ref (rAF 다중 호출 시 stale state 문제 해결)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 🚀 외부 콜백 Ref 격리: 부모 리렌더로 인한 게임 루프 파괴 방지
  const onScoreUpdateRef = useRef(onScoreUpdate);
  const onGameOverRef = useRef(onGameOver);
  useEffect(() => {
    onScoreUpdateRef.current = onScoreUpdate;
    onGameOverRef.current = onGameOver;
  }, [onScoreUpdate, onGameOver]);

  // ─── P2-C: blackhole / expanding 첫 등장 경고 ──────────────────────────
  // 블랙홀: 화면에 있는 동안 경고 유지 → 사라지면 즉시 제거 (타이머 불필요)
  // 팽창 운석: 게임 세션당 첫 1회만 경고, ref 타이머로 3.5초 후 제거
  //            (obstacles 변화마다 useEffect cleanup이 실행되므로 일반 setTimeout은 즉시 취소됨)
  useEffect(() => {
    if (!state.gameStarted || state.gameOver || state.isPaused) return;

    const BLACKHOLE_MSG = '⚫ 블랙홀 감지! 중력에 끌려들어가면 탈출이 어렵습니다. 즉시 거리를 벌리세요.';
    const EXPANDING_MSG = '💥 팽창 운석 감지! 시간이 지날수록 크기가 커집니다. 빠르게 피하세요.';

    // 블랙홀: 화면 존재 여부에 따라 경고 on/off
    const hasBlackhole = obstacles.some(obs => obs.type === 'blackhole');
    if (hasBlackhole) {
      setThreatWarning(BLACKHOLE_MSG);
      return; // 블랙홀 경고 우선, 팽창 운석 체크 생략
    }
    // 화면에 블랙홀 없음 → 블랙홀 경고 제거 (다른 경고는 유지)
    setThreatWarning(prev => prev === BLACKHOLE_MSG ? null : prev);

    // 팽창 운석: 세션 첫 등장 시 1회 경고 (ref 타이머로 관리)
    // 팽창 운석은 별도 type이 아니라 targetSize가 설정된 asteroid입니다.
    const hasExpanding = obstacles.some(obs => obs.targetSize != null);
    if (hasExpanding && !seenThreatsRef.current.has('expanding')) {
      seenThreatsRef.current.add('expanding');
      setThreatWarning(EXPANDING_MSG);
      if (threatWarningTimerRef.current) clearTimeout(threatWarningTimerRef.current);
      threatWarningTimerRef.current = setTimeout(() => {
        setThreatWarning(null);
        threatWarningTimerRef.current = null;
      }, 3500);
    }
  }, [obstacles, state.gameStarted, state.gameOver, state.isPaused]);

  const [gameTweaks, setGameTweaks] = useState<GameTweaks>({
    speedMultiplier: 1.0,
    obstacleDensity: 1.0,
    itemFrequency: 1.0,
    rocketScale: 1.0,
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // 🎯 자동 난이도 진행도 (사용자 gameTweaks와 분리된 별도 state)
  // 설정 패널에 "현재 자동 진행도"로 표시되며, 사용자 슬라이더를 덮어쓰지 않습니다.
  const [autoDifficulty, setAutoDifficulty] = useState({ speed: 1.0, density: 1.0 });

  // ✅ 미션 진행도 기반 autoDifficulty 자동 업데이트
  // gameTweaks(사용자 제어)가 아닌 autoDifficulty(자동 진행도)를 업데이트합니다.
  // 이로써 사용자가 밀도를 3x로 설정해도 덮어쓰이지 않습니다.
  useEffect(() => {
    if (!state.gameStarted || state.gameOver) return;

    // difficultyProgress: 달/화성은 미션 진행률(0~10단계), 심우주는 플레이 시간(0~15단계)
    // ⚠️ 버그 수정: 특급 모드는 MISSION_GOALS.high = 10억 km (Infinity가 아님)이므로
    // distanceToTarget === Infinity 조건은 절대 참이 될 수 없었음.
    // difficulty === 'high' 조건으로 직접 판별하여 시간 기반 난이도 상승 활성화.
    let difficultyProgress: number;
    if (state.difficulty === 'high') {
      // 특급: 1분마다 1단계 상승, 최대 15단계 (15분 후 최고 난이도 도달)
      difficultyProgress = Math.min(15, Math.floor(state.time / 60));
    } else {
      // 초급/중급: 미션 진행률 기반 (0% → 100% = 0~10단계)
      const missionGoal = MISSION_GOALS[state.difficulty] as number;
      const missionProgress = Math.min(1, state.distance / missionGoal);
      difficultyProgress = Math.floor(missionProgress * 10);
    }

    // 자동 진행도: 속도 1.0x → 2.0x, 밀도 1.0x → 1.5x
    const newSpeed = Number(Math.min(2.0, 1.0 + difficultyProgress * 0.1).toFixed(2));
    const newDensity = Number(Math.min(1.5, 1.0 + difficultyProgress * 0.05).toFixed(2));

    // 최적화: 값이 실제로 변했을 때만 상태 업데이트 (불필요한 리렌더 방지)
    setAutoDifficulty(prev => {
      if (prev.speed === newSpeed && prev.density === newDensity) return prev;
      return { speed: newSpeed, density: newDensity };
    });
  }, [state.distance, state.time, state.gameStarted, state.difficulty, state.distanceToTarget, state.gameOver]);

  const wasPausedBeforeSettings = useRef(false);

  // 🌌 은하수 스크롤 효과 상태 관리
  // 초급/중급은 미션 45% 진입 시 딱 1번 표시, 특급은 90초 주기
  const galaxyLowMidShown = useRef(false);       // 초급/중급 1회 표시 여부
  const galaxyLowMidStartTime = useRef<number | null>(null); // 스크롤 시작 시간(초)

  // 🌌 난이도 변경 시 은하수·오로라 ref 초기화
  // 초급 → 중급 등 난이도가 바뀌면 '이미 표시함' 상태를 리셋해야
  // 새 난이도에서도 30%/70% 트리거가 다시 동작함
  useEffect(() => {
    galaxyLowMidShown.current    = false;
    galaxyLowMidStartTime.current = null;
    auroraLowMidShown.current    = false;
    auroraLowMidStartTime.current = null;
  }, [state.difficulty]);

  // 🌌 초급/중급 전용: 미션 30% 도달 시 은하수 스크롤 1회 트리거
  // useRef로 관리되므로 setState 없이도 동작, 불필요한 리렌더 없음
  useEffect(() => {
    if (state.difficulty === 'high') return;         // 특급은 주기 방식(별도 처리)
    if (!state.gameStarted || state.gameOver) return;
    if (galaxyLowMidShown.current) return;           // 이미 표시했으면 무시

    const missionGoal = MISSION_GOALS[state.difficulty] as number;
    const progress = state.distance / missionGoal;

    // 미션 30% 달성 시 → 은하수 스크롤 시작 시간 기록
    if (progress >= 0.30) {
      galaxyLowMidShown.current = true;
      galaxyLowMidStartTime.current = state.time;
    }
  }, [state.distance, state.time, state.gameStarted, state.difficulty, state.gameOver]);

  // 🌅 오로라 스크롤 효과 상태 관리
  // 초급/중급: 미션 70% 도달 시 1회, 특급: 60초 주기 (은하수와 엇갈리게)
  const auroraLowMidShown = useRef(false);
  const auroraLowMidStartTime = useRef<number | null>(null);

  // 🌅 초급/중급 전용: 미션 70% 도달 시 오로라 스크롤 1회 트리거
  useEffect(() => {
    if (state.difficulty === 'high') return;
    if (!state.gameStarted || state.gameOver) return;
    if (auroraLowMidShown.current) return;

    const missionGoal = MISSION_GOALS[state.difficulty] as number;
    const progress = state.distance / missionGoal;

    // 미션 70% 달성 시 → 오로라 스크롤 시작 (은하수보다 늦게 등장해 두 효과 분리)
    if (progress >= 0.70) {
      auroraLowMidShown.current = true;
      auroraLowMidStartTime.current = state.time;
    }
  }, [state.distance, state.time, state.gameStarted, state.difficulty, state.gameOver]);

  // 🌪️ 태양풍 효과 상태 관리 (중급/특급 전용)
  // 아주 가끔 로켓을 한쪽으로 밀어붙이는 장애물 효과
  const solarWindStartTime = useRef<number | null>(null);  // 현재 태양풍 시작 시간
  const solarWindDir = useRef({ x: 0, y: 0 });            // 태양풍 방향 벡터
  const [solarWindActive, setSolarWindActive] = useState(false); // UI 경고 표시용

  // 🌪️ 태양풍 발생 주기 관리: 중급 120~180초, 특급 60~120초 중 랜덤 간격
  const nextSolarWindTime = useRef<number>(0); // 다음 태양풍 예약 시간
  useEffect(() => {
    if (state.difficulty === 'low') return;          // 초급은 태양풍 없음
    if (!state.gameStarted || state.gameOver) return;

    // 게임 시작 후 첫 번째 태양풍 시간 설정 (아직 예약 안 된 경우)
    if (nextSolarWindTime.current === 0) {
      const delay = state.difficulty === 'high' ? 60 : 120;
      nextSolarWindTime.current = state.time + delay;
    }

    // 특급 모드 120초 마스터 사이클 기반 슬롯:
    // [  0 ~ 25s]: 은하수 활성 → 태양풍 발동 금지
    // [ 60 ~ 80s]: 오로라 활성 → 태양풍 발동 금지
    const cyclePhase = state.difficulty === 'high' ? state.time % 120 : 0;
    const isInGalaxySlot = state.difficulty === 'high' && cyclePhase < 25;
    const isInAuroraSlot = state.difficulty === 'high' && cyclePhase >= 60 && cyclePhase < 80;

    // 예약 시간이 됐고, 현재 태양풍이 없고, 은하수·오로라 슬롯도 아닌 경우 → 발동
    if (
      state.time >= nextSolarWindTime.current &&
      solarWindStartTime.current === null &&
      !isInGalaxySlot && !isInAuroraSlot
    ) {
      // 태양풍 방향: 좌/우/대각 중 랜덤 (y는 약하게 - 위아래보다 옆으로 주로 밀림)
      const angle = Math.random() * Math.PI * 2;
      solarWindDir.current = {
        x: Math.cos(angle) * 0.8,   // 가로 힘 (강)
        y: Math.sin(angle) * 0.4,   // 세로 힘 (약)
      };
      solarWindStartTime.current = state.time;
      setSolarWindActive(true);

      // 다음 태양풍 예약: 특급 60~120초, 중급 120~180초 후
      const baseInterval = state.difficulty === 'high' ? 60 : 120;
      nextSolarWindTime.current = state.time + baseInterval + Math.random() * 60;
    }

    // 태양풍 종료 체크: 8초 지속 후 종료
    const DURATION = 8;
    if (
      solarWindStartTime.current !== null &&
      state.time - solarWindStartTime.current >= DURATION
    ) {
      solarWindStartTime.current = null;
      setSolarWindActive(false);
    }
  }, [state.time, state.gameStarted, state.difficulty, state.gameOver]);

  const [launchPhase, setLaunchPhase] = useState<LaunchPhase>('active');

  // ==================================================================================
  // [1. 난이도 및 게임 속도 설정 (Difficulty & Speed Settings)]
  // 레벨, 거리, 난이도 모드(Low/Mid/High)에 따라 게임의 빠르기와 장애물 등장 빈도를 결정합니다.
  // ==================================================================================
  const getDifficultySettings = useCallback(() => {
    // ℹ️ 난이도는 두 레이어의 곱으로 결정됩니다:
    // 1) autoDifficulty: 미션 진행률에 따른 자동 상승 (1.0x → 2.0x)
    // 2) gameTweaks: 사용자가 설정 패널에서 수동 조절하는 배율 (기본 1.0x)
    // 두 값이 독립적으로 관리되므로 사용자 설정이 자동 진행에 덮어쓰이지 않습니다.

    // 난이도 설정 반환 (baseSpeed: 기본 속도, spawnMult: 생성 빈도, itemChance: 아이템 나올 확률)
    let baseSettings = { baseSpeed: 0.3, spawnMult: 0.5, itemChance: 0.7 };

    const speedCfg = GAME_CONFIG.SPEED.baseSpeed;
    const spawnCfg = GAME_CONFIG.SPAWN.spawnRateMult;
    const itemCfg = GAME_CONFIG.ITEMS.baseChance;

    switch (state.difficulty) {
      case "low":
        baseSettings = {
          baseSpeed: speedCfg.low.min,
          spawnMult: spawnCfg.low,
          itemChance: itemCfg.low,
        };
        break;
      case "mid":
        baseSettings = {
          baseSpeed: speedCfg.mid.min,
          spawnMult: spawnCfg.mid,
          itemChance: itemCfg.mid,
        };
        break;
      case "high":
        baseSettings = {
          baseSpeed: speedCfg.high.min,
          spawnMult: spawnCfg.high,
          itemChance: itemCfg.high,
        };
        break;
      default:
        baseSettings = {
          baseSpeed: 0.5,
          spawnMult: 0.5,
          itemChance: 0.5,
        };
        break;
    }

    return {
      // 기본 속도 × 자동 진행도 × 사용자 배율 × 글로벌 배율
      baseSpeed: baseSettings.baseSpeed * autoDifficulty.speed * gameTweaks.speedMultiplier * GAME_CONFIG.SPEED.baseMultiplier,
      // 기본 생성 빈도 × 자동 진행도 × 사용자 배율 (사용자가 3x 설정 시 실제 3배 효과)
      spawnMult: baseSettings.spawnMult * autoDifficulty.density * gameTweaks.obstacleDensity,
      itemChance: baseSettings.itemChance * gameTweaks.itemFrequency,
    };
  }, [state.difficulty, gameTweaks, autoDifficulty]);

  // 폭발 효과 생성 함수
  // 장애물 파괴 시 파편이 튀는 시각적 연출을 담당합니다.
  // 🚀 성능 및 비주얼 최적화: 기본 파티클 수를 8→4로 감소 (실장님 피드백 반영: '너무 많은 점' 개선)
  const createExplosion = (x: number, y: number, color: string, count = 4) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2; // 360도 전방향으로 퍼짐
      const speed = 0.5 + Math.random() * 2; // 파편의 속도를 랜덤하게 설정 (자연스러움 유도)
      newParticles.push({
        id: getUniqueId(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.3, // 파편 생존 시간 (0.5초 후 사라짐)
        color: i % 3 === 0 ? "#ffffff" : color, // 흰색과 지정 색상을 섞어서 반짝임 효과
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // 🚀 성능 및 비주얼 최적화: 흡수 이펙트 파티클 수 5→3으로 감소
  const createAbsorptionEffect = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * 5;
      newParticles.push({
        id: getUniqueId(),
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 1.5, // 🚀 0.5 -> 1.5: 흡수 속도 3배 증가
        vy: -Math.sin(angle) * 1.5,
        life: 0.4, // 🚀 1.0 -> 0.4: 수명을 단축하여 잔상 제거
        color,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // ==================================================================================
  // [2. 장애물 생성 로직 (Obstacle Spawning Logic)]
  // 어떤 장애물을, 언제, 어디에, 어떤 속도로 생성할지 결정하는 핵심 함수입니다.
  // ==================================================================================
  // [2. 장애물 생성 로직 (Obstacle Spawning Logic) - Refactored]
  // 어떤 장애물을, 언제, 어디에, 어떤 속도로 생성할지 결정하는 핵심 함수입니다.
  const spawnObstacle = useCallback(
    (isDemo = false, isRamping = false, counts: { debris: number; satellite: number } = { debris: 0, satellite: 0 }, forceType?: 'obstacle' | 'item') => {
      const settings = getDifficultySettings();
      const rand = Math.random();

      // 🛡️ 스냅샷: 최신 상태를 Ref에서 직접 가져와 클로저 문제 해결
      const currentState = stateRef.current;
      const { difficulty: diff, fuel, health, time, distance, upgrades, shieldActive } = currentState;
      const maxHealth = 5 + (upgrades.max_health || 0);
      const maxFuel = 100 + (upgrades.fuel_capacity || 0) * 20;
      const fuelRatio = fuel / maxFuel;

      const isInjured = health < maxHealth * 0.5 && !isDemo;

      // 진행률 기반 난이도 단계 계산 (현재 미션 내에서의 수준)
      const missionGoal = MISSION_GOALS[diff] as number;

      // 최종 정규화된 missionLevel (1 ~ 10)
      // 특급(high) 모드: Phase1(0~10분) S-Curve 상승 → Phase2(10분+) 비조화 사인파 동적 변동
      // 일반 모드: 거리 기반 S-Curve
      let missionLevel: number;
      if (diff === 'high') {
        missionLevel = getHighDifficultyMissionLevel(time);
      } else {
        const progress = Math.min(1, distance / missionGoal);
        const k = 10;
        const m = 0.5;
        const sCurveValue = 1 / (1 + Math.exp(-k * (progress - m)));
        missionLevel = Math.floor(sCurveValue * 9) + 1;
      }

      // 2-2. 아이템 생성 확률 계산 (Item Spawn Probability)
      // 난이도 기본값에 미션 레벨(진행도) 상승에 따른 보정치를 적용합니다.
      let effectiveItemChance = settings.itemChance * Math.max(GAME_CONFIG.ITEMS.minItemChance, 1 - (missionLevel - 1) * GAME_CONFIG.ITEMS.levelPenaltyFactor);

      // 연료가 부족할수록 아이템 상자(아이템 전체)가 더 자주 나오게 보너스 확률 부여
      // 50% 이하부터 서서히 상승하여 0%일 때 최대 보너스
      const fuelBonusChance = Math.max(0, 0.5 - fuelRatio) * 0.8;
      effectiveItemChance += Math.min(GAME_CONFIG.ITEMS.fuelShortageBonusCap, fuelBonusChance);

      if (isInjured) effectiveItemChance += GAME_CONFIG.ITEMS.injuredBonus;
      effectiveItemChance = Math.min(GAME_CONFIG.ITEMS.maxFinalChance, effectiveItemChance);

      // 2-3. 개별 아이템/장애물 쿨타임 및 특수 생성 조건은 이제 updateGame에서 스폰 결정 전 또는 후에 관리됩니다.
      // spawnObstacle은 순수하게 생성 로직만 담당하도록 하여 의존성을 줄입니다.

      // 2-4. 장애물 종류 결정 (Obstacle Type Determination)
      let type: Obstacle["type"] = "asteroid";

      // A. 아이템 생성 (Item Spawn)
      // forceType으로 강제 지정 가능: 장애물/아이템 스폰 게이트를 분리하기 위함
      const isItem = forceType === 'item' ? true : forceType === 'obstacle' ? false : rand < effectiveItemChance;

      if (isItem) {
        const itemRand = Math.random();

        // 연료가 충분할 때 (80% 이상) 연료 아이템(star) 등장 방지
        const isFuelHigh = fuelRatio > 0.8;

        const canSpawnHourglass = missionLevel >= 7 && time - (lastHourglassTime.current || 0) > GAME_CONFIG.COOLDOWNS.hourglass;
        const canSpawnHeal = time - (lastHealTime.current || 0) > (GAME_CONFIG.COOLDOWNS.heal || 15);

        // 연료 비율이 낮을수록 star가 나올 확률이 서서히 상승
        // 🔴 20% 미만 (빨간 게이지): 가중치 대폭 상승 + 쿨타임 단축
        const isFuelCritical = fuelRatio < 0.2;
        const fuelItemWeight = isFuelHigh ? 0
          : isFuelCritical ? 0.5  // 빨간색 구간: 최대 가중치
            : (fuelRatio < 0.4 ? 0.2 + (0.4 - fuelRatio) * 0.3 : 0.2);
        const starCooldown = isFuelCritical ? 5 : (GAME_CONFIG.COOLDOWNS.fuel || 10); // 빨간색 구간: 쿨타임 5초로 단축
        const canSpawnStarNow = time - (lastStarTime.current || 0) > starCooldown;

        if (!isFuelHigh && canSpawnStarNow && itemRand < Math.min(0.6, fuelItemWeight)) {
          type = "star";
          lastStarTime.current = time;
        } else if (canSpawnHourglass && itemRand > 0.9) { // 확률 하향 (0.85 -> 0.9)
          type = "hourglass";
          lastHourglassTime.current = time;
        } else if (isInjured && canSpawnHeal && itemRand < 0.4 && health <= 4) {
          type = "wrench";
          lastHealTime.current = time;
        } else {
          // ┌─────────────────────────────────────────────────────────────────────────┐
          // │  🎛️ 아이템 종류 선택 로직 — 조정 방법                                     │
          // │                                                                         │
          // │  아래 subRand 구간이 각 아이템의 출현 비율을 결정합니다.                       │
          // │  GameConfig.ts의 ITEMS.types 가중치는 여기서는 직접 사용되지 않습니다.          │
          // │                                                                         │
          // │  ── 현재 구간 (연료 충분 상태 기준) ──                                      │
          // │  [0.00 ~ 0.30): star   — 연료 아이템  → 쿨타임/연료 부족 시에만 실제 등장     │
          // │  [0.30 ~ 0.87): crystal — 경험치 크리스탈 (약 57%)                          │
          // │  [0.87 ~ 0.90): wrench  — 수리 키트   → 체력 4 이하 + 쿨타임 충족 시만 등장   │
          // │  [0.90 ~ 1.00): shield  — 보호막       → 쿨타임 충족 시만 등장               │
          // │                                                                         │
          // │  ── 조정 공식 ──                                                          │
          // │  크리스탈 더 많이: 0.87 → 0.90+ 으로 높이기                                 │
          // │  크리스탈 더 적게: 0.87 → 0.75 이하로 낮추기                                │
          // │  렌치(수리) 더 많이: 두 번째 조건(0.90)을 높이거나 체력 조건 완화            │
          // │  실드 더 많이: GameConfig.ts > COOLDOWNS.shield 값을 낮추기 (현재 35초)       │
          // └─────────────────────────────────────────────────────────────────────────┘
          const subRand = Math.random();
          // 연료가 낮고 쿨타임이 지났을 때만 연료(star)를 추가로 보정합니다.
          if (subRand < 0.3 && !isFuelHigh && canSpawnStarNow) {
            type = "star";
            lastStarTime.current = time;
          } else if (subRand < 0.93) {
            // 크리스탈 선택 구간: 0.3~0.93 (약 63%)
            // ✏️ 조정: 이 숫자(0.93)를 올리면 크리스탈 ↑, 낮추면 ↓
            type = "crystal";
          } else if (subRand < 0.96 && health <= 4 && canSpawnHeal) {
            // 수리 키트: 체력 4 이하 + 쿨타임(GameConfig COOLDOWNS.heal) 충족 시만 등장
            // (이전 코드 버그 수정: 0.87로 잘못 설정되어 크리스탈 분기와 겹쳐 dead code였음)
            // ✏️ 조정: health <= 4 조건을 <= 3으로 낮추면 더 희귀하게, <= 5로 올리면 더 자주
            type = "wrench";
            lastHealTime.current = time;
          } else if (shieldActive === 0 && time - (lastShieldTime.current || 0) > GAME_CONFIG.COOLDOWNS.shield) {
            // 보호막: 이미 보호막이 없을 때 + 쿨타임(GameConfig COOLDOWNS.shield = 35초) 충족 시
            // ✏️ 조정: GameConfig.ts > COOLDOWNS.shield 값을 낮추면 보호막이 더 자주 등장
            type = "shield";
            lastShieldTime.current = time;
          } else {
            type = isFuelHigh ? "crystal" : "star";
            if (type === "star") {
              if (!canSpawnStarNow || isFuelHigh) type = "crystal";
              else lastStarTime.current = time;
            }
          }
        }
      } else {
        // B. 적/방해물 생성 (Enemy Spawn)
        const obstaclePool: Obstacle["type"][] = ["asteroid"];
        const canSpawnDebris = (time - (lastDebrisTime.current || 0) > 15) && (counts.debris < 1);
        const canSpawnFireball = time - (lastFireballTime.current || 0) > GAME_CONFIG.COOLDOWNS.fireball;
        const canSpawnBlackHole = time - (lastBlackHoleTime.current || 0) > GAME_CONFIG.COOLDOWNS.blackhole;
        // 🛰️ 인공위성 생성 빈도 대폭 하향: 30초 쿨다운 + 화면상 최대 1개 제한
        const canSpawnSatellite = (time - (lastSatelliteTime.current || 0) > 30) && (counts.satellite < 1);

        if (diff === "low") {
          if (missionLevel >= 2 && canSpawnDebris) obstaclePool.push("debris");
          if (missionLevel >= 5 && canSpawnSatellite) obstaclePool.push("satellite"); // 등장 시점 늦춤 (2->5)
          if (missionLevel >= 3) obstaclePool.push("asteroid");
          if (missionLevel >= 7) obstaclePool.push("asteroid");
        } else if (diff === "mid") {
          if (missionLevel >= 2 && canSpawnDebris) obstaclePool.push("debris");
          if (missionLevel >= 4 && canSpawnSatellite) obstaclePool.push("satellite"); // 등장 시점 늦춤 (3->4)
          if (missionLevel >= 5 && canSpawnFireball) obstaclePool.push("fireball");
          obstaclePool.push("asteroid");
        } else { // high
          if (missionLevel >= 1 && canSpawnDebris) obstaclePool.push("debris");
          if (missionLevel >= 3 && canSpawnSatellite) obstaclePool.push("satellite"); // 등장 시점 늦춤 (2->3)
          if (missionLevel >= 4 && canSpawnFireball) obstaclePool.push("fireball");
          if (missionLevel >= 6 && canSpawnBlackHole) obstaclePool.push("blackhole");
          if (missionLevel >= 8) obstaclePool.push("asteroid");
        }

        type = obstaclePool[Math.floor(Math.random() * obstaclePool.length)];

        // 쿨타임 갱신
        if (type === "debris") lastDebrisTime.current = time;
        if (type === "fireball") lastFireballTime.current = time;
        if (type === "blackhole") lastBlackHoleTime.current = time;
        if (type === "satellite") lastSatelliteTime.current = time;
      }

      // 2-5. 속도 및 크기, 데미지 상세 설정 (Refined Attributes)
      const speedVar = diff === "low" ? (Math.random() - 0.5) * 0.2 : (Math.random() > 0.85 ? 0.5 : (Math.random() - 0.5) * 0.3);
      const speed = (settings.baseSpeed + speedVar) * (isDemo ? 0.3 : 1);

      let size = 30;
      let asteroidVariant: "gray" | "brown" | "red" | "dark" = "gray";
      let collisionDamage = 1;
      let scoreType: "small" | "medium" | "large" | undefined = undefined;
      let finalSpeed = speed;

      // 타입별 속성 정의
      switch (type) {
        case "star":
          size = 25 + Math.random() * 10;
          finalSpeed = speed * 0.6;
          break;
        case "wrench":
          size = 30;
          finalSpeed = speed * 0.7;
          break;
        case "shield":
          size = 35;
          finalSpeed = speed * 0.7;
          break;
        case "crystal": {
          const cRand = Math.random();
          if (cRand < 0.6) { size = 25; scoreType = "small"; }
          else if (cRand < 0.9) { size = 40; scoreType = "medium"; }
          else { size = 55; scoreType = "large"; }
          finalSpeed = speed * 0.8;
          break;
        }
        case "hourglass":
          size = 40;
          finalSpeed = speed * 0.5;
          break;

        case "asteroid":
          if (missionLevel <= 2) {
            asteroidVariant = "gray";
            size = 40 + Math.random() * 20;
            finalSpeed = speed * (0.9 + Math.random() * 0.2);
          } else if (missionLevel <= 5) {
            asteroidVariant = Math.random() > 0.7 ? "brown" : "gray";
            size = (asteroidVariant === "brown" ? 60 : 45) + Math.random() * 25;
            collisionDamage = asteroidVariant === "brown" ? 2 : 1;
            finalSpeed = speed * (0.8 + Math.random() * 0.4);
          } else {
            const variants: ("gray" | "brown" | "red" | "dark")[] = ["gray", "gray", "brown", "brown"];
            if (missionLevel >= 7) variants.push("red");
            if (missionLevel >= 8) variants.push("dark");

            asteroidVariant = variants[Math.floor(Math.random() * variants.length)];
            if (asteroidVariant === "red") lastRedMeteorTime.current = time;

            if (asteroidVariant === "gray") { size = 50 + Math.random() * 20; collisionDamage = 1; }
            else if (asteroidVariant === "brown") { size = 80 + Math.random() * 30; collisionDamage = 2; }
            else if (asteroidVariant === "red") { size = 100 + Math.random() * 30; collisionDamage = 3; finalSpeed = speed * 1.5; }
            else { size = 130 + Math.random() * 40; collisionDamage = 4; finalSpeed = speed * 0.6; }
          }
          break;

        case "debris":
          size = 20 + Math.random() * 15;
          finalSpeed = speed * (1.2 + Math.random() * 0.3);
          break;

        case "satellite":
          size = 45 + Math.random() * 10;
          finalSpeed = speed * 0.9;
          collisionDamage = 2;
          break;

        case "fireball":
          size = 50 + Math.random() * 20;
          finalSpeed = speed * 1.8;
          collisionDamage = 3;
          break;

        case "blackhole":
          size = 55;           // 작게 등장해서 서서히 성장
          finalSpeed = speed * 0.1; // 다른 장애물의 절반 이하 속도
          break;
      }

      let asteroidHealth: number | undefined = undefined;
      // expanding 속성 정의 (targetSize)
      let targetSize: number | undefined = undefined;

      if (type === "asteroid") {
        if (asteroidVariant === "gray") asteroidHealth = 1;
        else if (asteroidVariant === "brown") asteroidHealth = 2;
        else if (asteroidVariant === "red") asteroidHealth = 3;
        else if (asteroidVariant === "dark") asteroidHealth = 5;

        // Expanding Meteor Logic (Level 4+ only, Cooldown 5s, Max 5 on screen)
        const expandingCount = obstaclesRef.current.filter(o => o.targetSize).length;
        if (missionLevel >= 4 && !isDemo && expandingCount < 5 && time - (lastExpandingTime.current || 0) > 5 && Math.random() < 0.2) {
          targetSize = size * 2.5; // Expands to 2.5x original size
          lastExpandingTime.current = time;
        }
      }

      // 블랙홀: 작게 등장해서 3배까지 성장 (서서히 나타나는 위협감 연출)
      if (type === 'blackhole') {
        targetSize = size * 3.0;
      }

      let spawnX = Math.random() * 90 + 5;
      let spawnY = -15 - (isRamping ? Math.random() * 50 : 0); // 항상 화면 밖(-15% 지점)에서 생성 보장
      let spawnVX = type === "debris" ? (Math.random() - 0.5) * 0.5 : 0;
      let oscillator = undefined;
      let centerVertical = undefined;
      let initialAngle = undefined;

      // 이동 패턴 추가
      if (type === "satellite") {
        oscillator = { amplitude: 40, frequency: 0.05, initialX: Math.random() * 60 + 20 };
        centerVertical = -10;
        initialAngle = Math.random() * 360;
      } else if (type === "debris" && Math.random() > 0.5) {
        oscillator = { amplitude: 5 + Math.random() * 10, frequency: 0.02, initialX: Math.random() * 70 + 15 };
      }

      // 장애물 생성 (Special Patterns 포함)
      if (type === "asteroid" && !isDemo && (missionLevel === 9 || missionLevel === 10) && Math.random() < 0.3) {
        // Side Meteor Pattern (Simplified)
        const fromLeft = Math.random() > 0.5;
        spawnX = fromLeft ? -10 : 110; // 완전히 화면 밖에서 생성
        spawnY = Math.random() * 40;
        spawnVX = fromLeft ? 0.5 : -0.5;
      }

      const newObs: Obstacle = {
        id: getUniqueId(),
        x: spawnX,
        y: spawnY,
        type,
        size: size * gameScale,
        health: asteroidHealth,
        damage: collisionDamage,
        variant: type === "asteroid" ? asteroidVariant : undefined,
        scoreType,
        vx: spawnVX,
        oscillation: oscillator,
        centerY: centerVertical,
        angle: initialAngle,
        speed: finalSpeed,
        targetSize: targetSize ? targetSize * gameScale : undefined,
        // 🌌 블랙홀 면역: 50% 확률로 다른 z축 깊이에 있어 블랙홀에 흡수되지 않음
        blackHoleImmune: type !== "blackhole" && Math.random() < 0.5,
      };
      if (newObs.oscillation) newObs.x = newObs.oscillation.initialX;

      // 🔧 개선: setObstacles를 여기서 직접 호출하지 않고 반환 → 이동 업데이트에서 통합 주입
      // 프레임당 setObstacles 호출 2회 → 1회로 감소 (React 리렌더 부하 절감)
      return newObs;
    },
    // 🔧 개선: stateRef를 직접 참조하여 state 전체에 대한 의존성을 제거합니다.
    // 이를 통해 불필요한 함수 재생성과 클로저 문제를 동시에 해결합니다.
    [getDifficultySettings, gameScale, getUniqueId]
  );

  const updateGame = useCallback(() => {
    // 🛡️ 스냅샷: 최신 상태를 Ref에서 직접 가져와 stale state 원천 차단
    const currentState = stateRef.current;
    if (currentState.gameOver || currentState.isPaused || currentState.missionComplete) return;

    const isDemo = !currentState.gameStarted;
    const settings = getDifficultySettings();

    // Destructure from currentState
    const {
      upgrades,
      difficulty,
      isLanding,
      time,
      sessionStartTime,
      timeFreezeUntil,
      planetAbsorbing,
      fuel,
      score,
      health,
      shieldActive,
      gravityActive,
    } = currentState;

    /* stardustStreakRef.current > 0 조건으로 딱 한 번만 setState 호출됩니다 (매 프레임 호출 방지) 
    if (stardustStreakRef.current > 0 && time - lastStardustCollectTimeRef.current > 2.0) {
      stardustStreakRef.current = 0;
      setStardustStreakDisplay(0);
    } */

    // ==================================================================================
    // [3. 게임 루프 및 스폰 타이밍 (Game Loop & Spawn Timing)]
    // 매 프레임마다 실행되며, 장애물을 생성할지 결정합니다.
    // ==================================================================================
    const timeInSession = time - sessionStartTime;
    // 특급 대원(hard) 모드일 경우, 초반 대기 시간을 줄여서 더 빨리 장애물이 나오도록 함
    const isHard = difficulty === "high";
    const isEasy = difficulty === "low";

    // 초기 발사 연출 시간 (Launch Sequence) — GameConfig.ts PLAYER.launchDuration에서 제어
    // 초급: tutorial(4s) / 중급: standard(2.5s) / 고급: highIntensity(1.5s)
    const launchDuration = isHard
      ? GAME_CONFIG.PLAYER.launchDuration.highIntensity
      : isEasy
        ? GAME_CONFIG.PLAYER.launchDuration.tutorial
        : GAME_CONFIG.PLAYER.launchDuration.standard;
    // 난이도가 정상화(Ramping)되는 데 걸리는 시간 — GameConfig.ts PLAYER.rampDuration에서 제어
    // 초급: tutorial(12s) / 중급: standard(4s) / 고급: highIntensity(2.5s)
    const rampDuration = isHard
      ? GAME_CONFIG.PLAYER.rampDuration.highIntensity
      : isEasy
        ? GAME_CONFIG.PLAYER.rampDuration.tutorial
        : GAME_CONFIG.PLAYER.rampDuration.standard;

    const distanceInSession = currentState.distance - currentState.startDistance;
    // 🚀 개선: 발사 판정을 시간 위주로 변경하고, 거리 조건은 최소한의 보조 장치로만 사용
    // 거리 2000 기준이 너무 높아 로켓이 느릴 때 데드락(정지)이 발생하는 문제를 해결합니다.
    const launchLimitDist = currentState.difficulty === "high" ? 150 : 250;
    const isLaunching = !isDemo && (timeInSession < launchDuration || distanceInSession < launchLimitDist);

    let spawnChanceMult = 1.0;
    let isRamping = false;
    if (isLaunching) {
      spawnChanceMult = 0; // 발사 중에는 장애물 없음
    } else if (!isDemo && timeInSession < launchDuration + rampDuration) {
      // 점진적 난이도 상승 (Linear Ramp-up)
      // 고급: 50% 밀도로 시작 / 중급: 10% / 초급: 5% (튜토리얼 수준)
      const startDensity = isHard ? 0.5 : isEasy ? 0.05 : 0.1;
      spawnChanceMult =
        startDensity +
        ((1 - startDensity) * (timeInSession - launchDuration)) / rampDuration;
      isRamping = true;
    }

    // 최종 스폰 확률 계산
    // GameConfig의 baseChance 값을 사용
    const baseSpawnChance = isDemo ? GAME_CONFIG.SPAWN.baseChance.demo : GAME_CONFIG.SPAWN.baseChance.active;

    // 🔧 밸런싱: 난이도 설정(settings.spawnMult)이 Tweak 설정과 곱해져서 확실히 반영되도록 함
    const effectiveSpawnRate =
      currentState.isLanding ? 0 : (baseSpawnChance * settings.spawnMult * spawnChanceMult);

    // 개수 및 쿨타임 체크 (의존성 분리된 spawnObstacle을 위한 사전 체크)
    // ✅ obstaclesRef.current 사용 → stale closure 해결
    // ⚠️ stardust는 배경 연출용이므로 최대 장애물 카운트에서 제외
    // stardust가 포함되면 maxHazards 상한(15)에 도달해 실제 행성/장애물이 스폰되지 않는 버그 발생
    const currentObstacleCount = obstaclesRef.current.filter(o => o.type !== 'stardust').length;
    // 🔧 spawnObstacle 반환값을 pendingSpawn에 저장 → 이동 업데이트에서 통합 주입
    let pendingSpawn: Obstacle | null = null;
    let pendingItemSpawn: Obstacle | null = null; // 아이템 전용 (장애물과 분리)
    // ⏳ 모래시계 시간정지 중에는 장애물 생성도 멈춤 (해제 후 한꺼번에 쏟아지는 문제 방지)
    const isTimeFrozenForSpawn = timeFreezeUntil > time;
    // ⏱️ 기차형 연속 스폰 방지: 이전 스폰으로부터 최소 간격이 지났을 때만 허용
    const canSpawnNow = time >= nextObstacleAllowedTime.current;

    // === 장애물 전용 스폰 (obstacleDensity 설정에 반응) ===
    // forceType='obstacle' 로 아이템이 섞이지 않도록 강제
    // 화면 너비에 따라 최대 장애물 수 결정 — GameConfig.ts SPAWN.maxHazards에서 제어
    const maxHazardsCfg = GAME_CONFIG.SPAWN.maxHazards;
    const screenW = window.innerWidth;
    const maxHazards = screenW >= 1024 ? maxHazardsCfg.desktop
      : screenW >= 640 ? maxHazardsCfg.tablet
        : maxHazardsCfg.mobile;
    if (!isLaunching && !isTimeFrozenForSpawn && canSpawnNow && currentObstacleCount < maxHazards && Math.random() < effectiveSpawnRate) {
      const debrisCount = obstaclesRef.current.filter(o => o.type === 'debris').length;
      const satelliteCount = obstaclesRef.current.filter(o => o.type === 'satellite').length;
      pendingSpawn = spawnObstacle(isDemo, isRamping, { debris: debrisCount, satellite: satelliteCount }, 'obstacle') || null;
      if (pendingSpawn) {
        // 🎯 적응형 게이트: spawnMult에 비례해서 게이트를 단축해 실제 밀도 차이를 체감 가능하게 함
        // 수식: Low 1x=0.21s(2.6/sec), Low 3x=0.07s(7.9/sec), 비율=3.0x ✓
        const rawGate = 0.12 + Math.random() * 0.18;
        const adaptiveGate = Math.max(0.06, rawGate / Math.max(0.1, settings.spawnMult));
        nextObstacleAllowedTime.current = time + adaptiveGate;
      }
    }

    // === 아이템 전용 스폰 (itemFrequency 설정에 반응, 장애물 밀도와 완전 독립) ===
    // 아이템 게이트 간격: 1x 기준 ~2.5초, 3x 시 ~0.8초 (settings.itemChance에 반비례)
    // ⏳ 시간 정지 중에도 아이템은 계속 생성됩니다 (이득 아이템은 멈추지 않음)
    const canSpawnItemNow = time >= nextItemAllowedTime.current;
    if (!isLaunching && canSpawnItemNow && !currentState.isLanding) {
      const itemSpawn = spawnObstacle(isDemo, isRamping, { debris: 0, satellite: 0 }, 'item') || null;
      if (itemSpawn) {
        pendingItemSpawn = itemSpawn;
        // 포아송 분포 기반 간격: itemChance가 높을수록 게이트 단축 (itemFrequency 3x → ~3x 더 자주)
        const ITEM_BASE_INTERVAL = GAME_CONFIG.ITEMS.itemBaseInterval; // GameConfig.ts에서 제어 (현재 0.75초)
        const itemMean = Math.max(0.3, ITEM_BASE_INTERVAL / Math.max(0.1, settings.itemChance));
        const itemGate = Math.max(0.3, -Math.log(Math.random()) * itemMean);
        nextItemAllowedTime.current = time + itemGate;
      }
    }

    // 🌌 배경 효과: 별먼지(Stardust)는 이제 StardustCanvas에서 전담합니다.
    // 기존 DOM 기반 수집형 stardust 생성 로직은 성능 최적화를 위해 제거되었습니다.

    // Apply Black Hole Gravity Physics
    if (!isDemo && currentState.gameStarted) {
      let gravityEffect = false;
      let forceX = 0;
      let forceY = 0;

      // ✅ obstaclesRef.current 사용 → stale closure 해결
      obstaclesRef.current.forEach((obs) => {
        if (obs.type === "blackhole") {
          const dx = obs.x - playerPositionRef.current.x;
          const dy = obs.y - playerPositionRef.current.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          // Massive Pull range (Screen % units)
          const pullRange = 60; // Increased from 40

          if (dist < pullRange) {
            gravityEffect = true;
            // Exponential pull strength!
            // The closer you get, the harder it is to escape
            // Reduced max strength from 5.0 -> 2.5 to make it survivable
            const strength = Math.max(
              0,
              Math.pow(1 - dist / pullRange, 2) * 2.5,
            );

            forceX += (dx / dist) * strength;
            forceY += (dy / dist) * strength;

            // Extreme shaking/distortion
            if (dist < 25) {
              setShake((prev) => Math.max(prev, 10 - dist / 3)); // Violent shake
            }
          }
        }
      });

      if (gravityEffect) {
        // Directly modify player position to simulate 'dragging' against control
        setPlayerPosition((prev) => ({
          x: Math.max(5, Math.min(95, prev.x + forceX)),
          y: Math.max(5, Math.min(95, prev.y + forceY)),
        }));
        if (!gravityActive) setState((s) => ({ ...s, gravityActive: true }));
        SoundController.updateGravity(true);
      } else {
        if (gravityActive) setState((s) => ({ ...s, gravityActive: false }));
        SoundController.updateGravity(false);
      }
    }

    // --- TTC (Time-To-Collision) 기반 안전 회랑 자동항법 AI v3 ---
    // ⚠️ isLanding 제외 필수: 착륙 중 자동운항이 y→75 목표로 이동하면 착륙 이동(y→5)과
    //    충돌하여 평형점 y≈49% 에 수렴 → 행성 진입 불가 버그 발생
    if (currentState.isAutoPilot && !isDemo && !isLaunching && !currentState.isLanding) {
      // ============================================================
      // 🤖 자동항법 AI v3 — TTC 기반 안전 회랑(Safe Corridor) 방식
      //
      // ❌ 구 방식(포텐셜 필드)의 치명적 결함:
      //    forceX = (curDx/curDist) * strength
      //    → 장애물이 로켓 정면 위(curDx≈0)이면 forceX=0
      //    → 수평 이동 전혀 안 함 → 가운데 고착 버그!
      //
      // ✅ 신 방식(TTC 안전 회랑):
      //    1. TTC 계산: 장애물이 내 y위치에 도달할 프레임 수
      //    2. 위협 판단: TTC < 임계값 AND 수평 충돌 경로에 있는지
      //    3. 명확한 목표 X: safeLeft(장애물 왼쪽 경계) vs safeRight(오른쪽 경계)
      //       → curDx 무관! 항상 구체적인 X좌표로 이동
      // ============================================================

      const apPos = playerPositionRef.current;
      const TTC_THRESHOLD = 80;  // 이 프레임 이내 충돌 예상 시 회피 시작
      const ROCKET_RADIUS = 5;   // 로켓 충돌 반경 (% 단위)
      const SIZE_TO_PCT = 0.065; // px → % 반경 변환 계수
      const BUFFER = 4;          // 안전 회랑 추가 여유 (%)

      // === 1단계: 위협 탐지 — TTC 기반 충돌 경로 분석 ===
      type SafeCorridor = {
        safeLeft: number;   // 장애물 왼쪽 안전 X (%)
        safeRight: number;  // 장애물 오른쪽 안전 X (%)
        urgency: number;    // 위급도 0~1 (TTC 짧을수록 높음)
      };

      const activeThreats: SafeCorridor[] = [];

      // ✅ obstaclesRef.current 사용 → stale closure 해결 (obstacles 직접 읽으면 빈 배열)
      for (const obs of obstaclesRef.current) {
        // 비위협 타입(아이템, 시각 효과) 제외
        if (!["asteroid", "fireball", "debris", "blackhole", "redMeteor", "expanding"].includes(obs.type)) continue;
        // 이미 지나간 장애물 제외 (로켓 아래 10% 이상)
        if (obs.y > apPos.y + 10) continue;
        // 너무 멀리 있는 장애물 제외
        if (obs.y < -80) continue;

        const obsRadius = (obs.size * SIZE_TO_PCT) + ROCKET_RADIUS;
        const speed = Math.max(0.01, obs.speed);

        // TTC: 장애물이 로켓 y 위치에 도달하는 데 걸리는 프레임 수
        const ttc = (apPos.y - obs.y) / speed;
        if (ttc < 0 || ttc > TTC_THRESHOLD) continue; // 이미 지나갔거나 아직 너무 멈

        // TTC 시점에서의 장애물 예측 X 위치 (vx가 있으면 반영)
        const futureObsX = obs.x + (obs.vx || 0) * ttc;

        // 수평 충돌 경로 체크: 현재 OR 미래 위치에서 겹치면 위협
        const curOverlap = Math.abs(apPos.x - obs.x) < obsRadius + BUFFER;
        const futureOverlap = Math.abs(apPos.x - futureObsX) < obsRadius + BUFFER;
        if (!curOverlap && !futureOverlap) continue; // 수평으로 안 겹침 → 안전

        // 안전 회랑 경계 계산
        const safeLeft = futureObsX - obsRadius - BUFFER;
        const safeRight = futureObsX + obsRadius + BUFFER;

        // 위급도: TTC가 짧을수록 높음 (0~1 범위)
        const urgency = 1 - ttc / TTC_THRESHOLD;

        activeThreats.push({ safeLeft, safeRight, urgency });
      }

      // === 2단계: 아이템 탐지 (더 넓은 시야) — obstaclesRef.current 사용 ===
      const items = obstaclesRef.current.filter(obs =>
        ["star", "wrench", "crystal", "hourglass"].includes(obs.type) &&
        obs.y > -10 &&
        obs.y < apPos.y + 60 &&
        Math.abs(obs.x - apPos.x) < 70
      );

      // === 3단계: 이동 목표 결정 ===
      let targetX = apPos.x;
      let targetY = apPos.y;
      let moveSpeed = 1.0;

      if (activeThreats.length > 0) {
        // 가장 위급한 위협을 기준으로 안전 회랑 선택
        const worstThreat = activeThreats.reduce((a, b) => a.urgency > b.urgency ? a : b);
        const maxUrgency = worstThreat.urgency;

        // 좌우 중 중앙(50%)에 더 가까운 방향으로 회피 (사이드 벽 고착 방지)
        const leftDist = Math.abs(50 - worstThreat.safeLeft);
        const rightDist = Math.abs(50 - worstThreat.safeRight);
        const rawTargetX = leftDist < rightDist ? worstThreat.safeLeft : worstThreat.safeRight;

        targetX = Math.max(8, Math.min(92, rawTargetX));
        targetY = 65; // 안정적인 중간 높이 유지

        // 위급도에 비례하는 속도: 최소 2.5, 최대 6.0
        moveSpeed = Math.min(6.0, 2.5 + maxUrgency * 4.0);

      } else if (items.length > 0) {
        // 위협 없음: 아이템 적극 수집
        const bestItem = items.sort((a, b) => {
          // 연료 부족 시 별(연료) 최우선
          if (fuel < 40) {
            if (a.type === "star" && b.type !== "star") return -1;
            if (b.type === "star" && a.type !== "star") return 1;
          }
          // 평소에는 크리스탈(점수) 우선
          if (a.type === "crystal" && b.type !== "crystal") return -1;
          if (b.type === "crystal" && a.type !== "crystal") return 1;
          // 거리순 정렬
          const dA = Math.sqrt((a.x - apPos.x) ** 2 + (a.y - apPos.y) ** 2);
          const dB = Math.sqrt((b.x - apPos.x) ** 2 + (b.y - apPos.y) ** 2);
          return dA - dB;
        })[0];

        targetX = bestItem.x;
        targetY = bestItem.y;
        moveSpeed = 3.0;

      } else {
        // 위협/아이템 없음: 중앙 기준 사인파 순찰 (정적 대기 X → 지속 이동으로 생동감 확보)
        // 주기 ~4초 좌우 ±22%, 수직 ±5% 진동 → 장애물과 맞닥뜨릴 때도 움직이는 상태라 반응 빠름
        const patrolTime = time * 0.025; // 게임 시간 기반 주기
        targetX = 50 + Math.sin(patrolTime) * 22;
        targetY = 65 + Math.sin(patrolTime * 0.7) * 5;
        moveSpeed = 1.8;
      }

      // === 4단계: 이동 적용 (ref + state 동시 업데이트) ===
      {
        const diffX = targetX - apPos.x;
        const diffY = targetY - apPos.y;
        const speedMult = gameTweaks?.speedMultiplier || 1;
        const stepX = diffX * (moveSpeed * speedMult * 0.15);
        const stepY = diffY * (moveSpeed * speedMult * 0.15);

        // 위급 회피 시 넓은 범위(8~92%), 평시 중앙(20~80%) 유지
        const maxUrgency = activeThreats.reduce((m, t) => Math.max(m, t.urgency), 0);
        const xMin = maxUrgency > 0.7 ? 8 : 20;
        const xMax = maxUrgency > 0.7 ? 92 : 80;

        const newApPos = {
          x: Math.max(xMin, Math.min(xMax, apPos.x + stepX)),
          y: Math.max(15, Math.min(92, apPos.y + stepY)),
        };
        playerPositionRef.current = newApPos;
        setPlayerPosition(newApPos);
      }
    }

    if (!isDemo) {
      setState((prev) => {
        // Safety: Ensure fuel is always a valid number
        // 배속 설정에 맞춰 연료 소모량도 비례해서 조정 (밸런스 유지)
        const currentFuel = prev.fuel || 100;
        const newFuel = Math.max(0, currentFuel - (0.02 * gameTweaks.speedMultiplier));

        if (newFuel <= 0 && !prev.gameOver) {
          return { ...prev, fuel: 0, gameOver: true, gameOverReason: "fuel" };
        }

        // Safety: Ensure score is a valid number for level calculation
        const currentScore = prev.score || 0;
        const nextXPLevel = Math.floor(currentScore / 1000) + 1; // Use nextXPLevel for score-based level
        const levelChanged = nextXPLevel > prev.level; // Compare with prev.level for UI update

        // Mission Progression Logic
        let distIncrement = 1500;
        if (prev.difficulty === "low") {
          distIncrement = MISSION_GOALS.low / (MISSION_TIMES.low * 60);
        } else if (prev.difficulty === "mid") {
          distIncrement = MISSION_GOALS.mid / (MISSION_TIMES.mid * 60);
        } else if (prev.difficulty === "high") {
          // 무한 모드: 초기 발사 연출을 위해 기본 속도를 보정하고, 이후 점진적으로 증가
          distIncrement = 50 + nextXPLevel * 5; // Use nextXPLevel here
        }

        // Safety: Ensure distance is a valid number
        const currentDistance = prev.distance || 0;

        // Smooth Launch Acceleration Factor (0 to 3 seconds)
        // Launch Acceleration Curve (0 to launchDuration seconds)
        const currentLaunchDuration = isHard ? GAME_CONFIG.PLAYER.launchDuration.highIntensity : GAME_CONFIG.PLAYER.launchDuration.standard;
        if (timeInSession < currentLaunchDuration) {
          const t = timeInSession / currentLaunchDuration;
          // 🚀 개선: 최소 가속 인자를 0.01 -> 0.15로 상향하여 초기 기동성 확보 (정지 방지)
          const launchFactor = 0.15 + 0.85 * Math.pow(t, 2);
          distIncrement *= launchFactor;
        }

        // 게임 속도 설정(speedMultiplier)에 따라 시각적 속도는 빨라지지만, 
        // 화성에 도달하는 실제 시간(거리 증가분)은 5분 설정을 유지하도록 고정합니다.
        // distIncrement *= gameTweaks.speedMultiplier; 

        const nextDistance = currentDistance + distIncrement;
        const target = MISSION_GOALS[prev.difficulty];

        // Update mission status but DON'T return early to ensure other stats (fuel, time) update
        const isNewCompletion =
          nextDistance >= target &&
          target !== Infinity &&
          !prev.missionComplete;

        const newBadges = isNewCompletion ? calculateBadges(prev) : prev.earnedBadges;

        // 매 프레임마다 추적되는 통계 업데이트
        const deltaTime = 1 / 60; // 60 FPS
        const maxHealth = 5 + (prev.upgrades?.max_health || 0);
        const maxFuel = 100 + (prev.upgrades?.fuel_capacity || 0) * 20;
        const healthPercent = prev.health / maxHealth;
        const fuelPercent = newFuel / maxFuel;

        const updatedStats = {
          ...prev.stats,
          // 위험한 상태 시간 추적
          closeCalls: (prev.stats?.closeCalls || 0) + (prev.health === 1 ? deltaTime : 0),
          lowFuelTime: (prev.stats?.lowFuelTime || 0) + (fuelPercent < 0.1 ? deltaTime : 0),
          // 평균 체력/연료 누적 (나중에 시간으로 나눔)
          averageHealth: (prev.stats?.averageHealth || 0) + healthPercent * deltaTime,
          averageFuel: (prev.stats?.averageFuel || 0) + fuelPercent * deltaTime,
          // 위험 점수 계산 (낮은 체력/연료 시간에 비례)
          riskScore: (prev.stats?.riskScore || 0) +
            ((prev.health <= 2 ? 2 : 0) + (fuelPercent < 0.2 ? 3 : 0)),
          // 미션 완료 시간
          completionTime: isNewCompletion ? timeInSession : (prev.stats?.completionTime || 0),
        };

        // 📈 속도 및 진행률 기반 시각 효과 업데이트
        const effectThreshold = 0.3; // 진행률 30% 이상부터 효과 시작 (실장님 요청으로 60%에서 조정)
        const progress = target > 0 ? nextDistance / target : 0;
        const isSpeedEffect = progress >= effectThreshold;
        const speedEffectIntensity = isSpeedEffect ? (progress - effectThreshold) / (1 - effectThreshold) : 0;

        return {
          ...prev,
          earnedBadges: newBadges,
          fuel: newFuel,
          distance:
            target !== Infinity &&
              nextDistance > target &&
              !prev.missionComplete
              ? target
              : nextDistance,
          time: (prev.time || 0) + deltaTime,
          level: nextXPLevel,
          showLevelUp: levelChanged ? nextXPLevel : prev.showLevelUp,
          autoDodgesRemaining: levelChanged ? nextXPLevel : prev.autoDodgesRemaining,
          distanceToTarget: Math.max(0, target - nextDistance),
          missionComplete: prev.missionComplete,
          isLanding: prev.isLanding || isNewCompletion,
          isSpeedEffect, // 🚀 효과 활성화
          speedEffectIntensity, // 🚀 효과 강도
          stats: updatedStats,
        };
      });
    }

    // stale closure 방지: shake 값을 클로저에서 읽지 않고 함수형 업데이트로 감소
    setShake((prev) => Math.max(0, prev - 1));

    if (isLanding && !currentState.missionComplete) {
      const targetX = 50;
      const targetY = 5;
      // ✅ stale 클로저 수정: playerPosition(스테일) → playerPositionRef.current(항상 최신)
      // 이전: dist가 초기값으로 고정 → dist < 3 조건 절대 만족 못해 → missionComplete 미전환
      const landCurPos = playerPositionRef.current;
      const dx = targetX - landCurPos.x;
      const dy = targetY - landCurPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 3 && !planetAbsorbing) {
        // 로켓이 천체 반경 내 진입 → 행성 흡수 효과 트리거
        setState(prev => ({ ...prev, planetAbsorbing: true }));
      } else if (!planetAbsorbing) {
        // 천체를 향해 빠르게 접근 (기존 0.05 → 0.08로 속도 향상)
        const newLandPos = {
          x: landCurPos.x + dx * 0.08,
          y: landCurPos.y + dy * 0.08,
        };
        playerPositionRef.current = newLandPos;
        setPlayerPosition(newLandPos);
      }
    }

    if (currentState.gameStarted && !currentState.gameOver && upgrades.plasma_cannon > 0) {
      const now = Date.now();
      // Firing frequency: Level 1-5 (3s, 2s, 1s, 0.5s, 0.25s)
      const cooldownMap = [Infinity, 3000, 2000, 1000, 500, 250];
      const cooldown = cooldownMap[upgrades.plasma_cannon] || 250;
      if (now - lastShotTime.current > cooldown) {
        lastShotTime.current = now;
        setBullets((prev) => [
          ...prev,
          {
            id: getUniqueId(),
            x: playerPositionRef.current.x,
            y: playerPositionRef.current.y - 5,
            speed: 3,
            power: upgrades.plasma_cannon,
          },
        ]);
        SoundController.play("shoot");
        // 총알 발사 통계 추적
        setState(s => ({
          ...s,
          stats: {
            ...s.stats,
            bulletsShot: (s.stats?.bulletsShot || 0) + 1,
          }
        }));
      }
    }

    setBullets((prev) =>
      prev
        .map((b) => ({
          ...b,
          y: b.y - b.speed,
        }))
        .filter((b) => b.y > -10),
    );

    setParticles((prev) => {
      const moved = prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.04, // 🚀 0.02 -> 0.04: 생존 시간을 절반으로 단축 (실장님 요청사항)
        }))
        .filter((p) => p.life > 0);

      // 🚀 비주얼 최적화: 파티클 최대 개수 제한 더욱 강화 (30→15) (실장님 피드백 반영)
      if (moved.length > 15) return moved.slice(-15);
      return moved;
    });

    // ==================================================================================
    // [4. 장애물 위치 업데이트 (Obstacle Movement)]
    // 각 장애물의 위치를 업데이트하고 화면 밖으로 나간 것들을 처리합니다.
    // ==================================================================================
    // 📈 FPS 측정 루틴 (1초마다 업데이트)
    const now = Date.now();
    frameCount.current++;
    if (now - lastFpsUpdateTime.current >= 1000) {
      const currentFps = Math.round((frameCount.current * 1000) / (now - lastFpsUpdateTime.current));
      setState(s => ({ ...s, fps: currentFps }));
      frameCount.current = 0;
      lastFpsUpdateTime.current = now;
    }

    const isTimeFrozen = timeFreezeUntil > time;

    setObstacles((prev) => {
      if (!prev) return [];

      // 🔧 개선안 3: 별먼지 생성을 이 단일 setObstacles 호출에 통합
      // → 별도 setObstacles 호출 제거로 React 리렌더 1회 감소

      // 성능 최적화: 프레임마다 블랙홀 위치를 한 번만 찾아서 재사용합니다.
      const blackHoles = prev.filter((o) => o.type === "blackhole");

      const moved = prev.flatMap((obs) => {
        if (!obs || typeof obs.y !== "number" || Number.isNaN(obs.y)) return [];

        // 시간 정지 중에는 위험 장애물 이동만 멈춥니다.
        // 이득 아이템(crystal, star, wrench, shield, hourglass)은 계속 이동합니다.
        if (isTimeFrozen && !["crystal", "star", "wrench", "shield", "hourglass"].includes(obs.type)) {
          return [obs];
        }

        let newX = obs.x;
        const currentSpeed =
          typeof obs.speed === "number" && !Number.isNaN(obs.speed)
            ? obs.speed
            : 0.2;

        let newY = obs.y + Math.max(currentSpeed, 0.1);
        let currentSize = obs.size;
        let newAngle = obs.angle;

        // 1. 자석 효과 (Magnet Logic): 아이템을 플레이어 쪽으로 끌어당깁니다.
        if (
          upgrades.magnet > 0 &&
          ["star", "crystal", "wrench", "satellite", "hourglass"].includes(
            obs.type,
          )
        ) {
          const dx = playerPositionRef.current.x - obs.x;
          const dy = playerPositionRef.current.y - obs.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          const magnetRange = 15 + upgrades.magnet * 10;

          if (dist > 0 && dist < magnetRange) {
            const pullStrength = 0.4 + upgrades.magnet * 0.15;
            newX += (dx / dist) * pullStrength;
            const verticalPull = (dy / dist) * pullStrength;
            if (verticalPull > 0) newY += verticalPull;
          }
        }

        // 2. 블랙홀 중력장 (Black Hole Gravity): 주변 장애물을 빨아들입니다.
        // 🌌 블랙홀 중력장: 3D/4D 공간 시뮬레이션
        // 각 장애물은 생성 시 50% 확률로 블랙홀과 다른 깊이(z축)에 있어 흡수되지 않음
        blackHoles.forEach((bh) => {
          if (obs.type === "blackhole") return;
          // 블랙홀 면역 체크: 이 장애물이 다른 차원 깊이에 있으면 통과
          if (obs.blackHoleImmune) return;
          const dx = bh.x - obs.x;
          const dy = bh.y - obs.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          const pullRange = 50;

          if (dist > 0 && dist < pullRange) {
            const pullStrength = (1 - dist / pullRange) * 1.5;
            newX += (dx / dist) * pullStrength;
            const verticalPull = (dy / dist) * pullStrength;
            if (verticalPull > 0) newY += verticalPull;
            if (dist < bh.size / 6) newY = 200; // Swallowed
          }
        });

        // 3. 종류별 특수 이동 패턴 (Specialized Movement per Type)
        if (
          obs.type === "satellite" &&
          obs.oscillation &&
          typeof obs.centerY === "number" &&
          typeof obs.angle === "number"
        ) {
          const nextCenterY =
            obs.centerY + (typeof obs.speed === "number" ? obs.speed : 0.2);
          const nextAngle = obs.angle + obs.oscillation.frequency;
          const finalX =
            obs.oscillation.initialX +
            Math.cos(nextAngle) * obs.oscillation.amplitude;
          const finalY =
            nextCenterY + Math.sin(nextAngle) * obs.oscillation.amplitude;

          // 인공위성 자폭 (Satellite Self-Explosion): 화면 중간쯤 오면 폭발합니다.
          if (finalY > 45 && !isDemo) {
            createExplosion(finalX, finalY, "#94a3b8", 25);
            SoundController.play("damage");
            return []; // Explode and vanish
          }

          newX = finalX;
          newY = finalY;
          newAngle = nextAngle;

          return [
            {
              ...obs,
              x: newX,
              y: newY,
              centerY: nextCenterY,
              angle: newAngle,
            } as Obstacle,
          ];
        }

        if (
          (obs.type === "shield" || obs.type === "wrench" || obs.type === "hourglass") &&
          typeof obs.centerY === "number"
        ) {
          const nextCenterY = obs.centerY + 0.12;
          let nextX = obs.x;
          const driftTowardsPlayer = 0.15;
          if (nextX < playerPositionRef.current.x) nextX += driftTowardsPlayer;
          else if (nextX > playerPositionRef.current.x) nextX -= driftTowardsPlayer;

          newX = nextX;
          newY = nextCenterY;
          newAngle = (obs.angle || 0) + 1.5;

          return [
            {
              ...obs,
              x: newX,
              y: newY,
              centerY: nextCenterY,
              angle: newAngle,
            } as Obstacle,
          ];
        }

        if (obs.type === "debris") {
          // 우주 쓰레기: 단순 회전하며 낙하 (복잡한 궤도 없음)
          const nextY = obs.y + (obs.speed || 0.2);
          const nextX = obs.x + (obs.vx || 0);

          newX = nextX;
          newY = nextY;
          newAngle = ((obs.angle || 0) + 1.5) % 360; // 제자리에서 빙글빙글 돕니다.
        }

        // 4. 공통 효과 (Common Effects: 크기 변화, 가속도, 회전)
        if (obs.targetSize && currentSize < obs.targetSize) {
          currentSize += 1.5;
          const deltaY = newY - obs.y;
          newY = obs.y + deltaY * 0.75;
        }

        if (obs.vx && obs.type !== "debris") newX += obs.vx;

        if (
          typeof newAngle === "number" &&
          obs.type !== "shield" &&
          obs.type !== "debris" &&
          obs.type !== "satellite" &&
          obs.type !== "hourglass"
        ) {
          const rotationSpeed = 0.8;
          newAngle = (newAngle + rotationSpeed) % 360;
        }

        const updatedObs: Obstacle = {
          ...obs,
          x: newX,
          y: newY,
          size: currentSize,
          angle: newAngle,
          speed: currentSpeed, // 가속된 속도 반영
        };

        // 5. 분열 로직 (Splitting Logic: 13레벨 이상 특수 패턴)
        if (obs.splitting && newY > 30) {
          createExplosion(newX, newY, "#475569", 20);
          SoundController.play("damage");
          return [
            {
              ...updatedObs,
              id: getUniqueId(),
              splitting: false,
              x: newX - 6,
              y: newY + 2,
              vx: -0.4,
              size: 22,
              damage: 1,
              isSplitChild: true,
            },
            {
              ...updatedObs,
              id: getUniqueId(),
              splitting: false,
              x: newX,
              y: newY + 5,
              vx: 0,
              size: 25,
              damage: 1,
              isSplitChild: true,
            },
            {
              ...updatedObs,
              id: getUniqueId(),
              splitting: false,
              x: newX + 6,
              y: newY + 2,
              vx: 0.4,
              size: 22,
              damage: 1,
              isSplitChild: true,
            },
          ];
        }

        return [updatedObs];
      });

      // 6. 총알 충돌 감지 로직 (Bullet Collision)
      // px 단위 환산 (bullets/obstacles 모두 % 좌표 → px 거리로 정밀 비교)
      const bCw = containerRef.current?.clientWidth ?? window.innerWidth;
      const bCh = containerRef.current?.clientHeight ?? window.innerHeight;
      let destroyedInFrame = 0;
      const hitBulletIds: (number | string)[] = [];
      const updatedWithBullets = moved.map((obs) => {
        const currentObs = { ...obs };
        if (["asteroid", "debris", "fireball"].includes(obs.type)) {
          // bulletsRef 사용: bullets state는 updateGame 클로저에서 항상 stale(빈 배열)
          bulletsRef.current.forEach((bullet) => {
            if (currentObs.health === 0) return;
            const dxPx = (obs.x - bullet.x) * bCw / 100;
            const dyPx = (obs.y - bullet.y) * bCh / 100;
            const distSqPx = dxPx * dxPx + dyPx * dyPx;
            // 총알 명중 반경: 장애물 반지름(px) 기준
            const hitRange = obs.size / 2;

            if (distSqPx < hitRange * hitRange) {
              currentObs.health = 0;
              destroyedInFrame++;
              hitBulletIds.push(bullet.id);
              createExplosion(bullet.x, bullet.y, "#f87171", 10);
              createExplosion(obs.x, obs.y, "#ef4444", 20);
            }
          });
        }
        return currentObs;
      });

      if (hitBulletIds.length > 0) {
        setBullets((prev) => prev.filter((b) => !hitBulletIds.includes(b.id)));
      }

      const filtered = updatedWithBullets.filter(
        (obs) => obs.y < 110 && obs.health !== 0,
      );
      if (isDemo) return filtered;
      // 착륙 중에는 충돌 감지 없음 (로켓이 천체로 진입하는 동안 피해 방지)
      if (isLanding) return filtered; // isLanding은 currentState에서 destructure된 최신 값
      // 충돌 체크 (Collision Check) - 매 프레임 실행됩니다.
      let newHealth = health;
      let newScore = score;
      let newFuel = fuel;
      let newShield = shieldActive;
      let itemsCollectedInFrame = 0;
      let damageTakenInFrame = 0;
      let anyDodgeThisFrame = false;

      // 🔧 충돌 판정 정확도 개선: px 단위 통일 계산
      // 문제: obs.x/y는 %(컨테이너 기준), obs.size는 px → 단위 불일치로 히트박스 왜곡
      // 수정: dx/dy를 실제 px로 환산 후 px 기준 반경과 비교
      const cw = containerRef.current?.clientWidth ?? window.innerWidth;
      const ch = containerRef.current?.clientHeight ?? window.innerHeight;
      // 로켓 바디 충돌 반경 (w-16=64px 컨테이너의 약 1/4, gameScale 반영)
      const ROCKET_RADIUS_PX = 14 * gameScale;

      const collidedIds: (number | string)[] = [];
      filtered.forEach((obs) => {
        if (obs.isDodged) return;

        // % → px 환산 (가로/세로 종횡비 왜곡 보정 포함)
        const dxPx = (obs.x - playerPositionRef.current.x) * cw / 100;
        const dyPx = (obs.y - playerPositionRef.current.y) * ch / 100;
        const distSqPx = dxPx * dxPx + dyPx * dyPx;

        const isDangerous = [
          "asteroid",
          "fireball",
          "debris",
          "blackhole",
          "satellite",
        ].includes(obs.type);
        const isItem = !isDangerous;

        // 크리스탈/별먼지는 "터치 수집" — 2.5배 반경 적용 시 근처 크리스탈까지 연쇄 획득되는 버그 발생
        const isScoreItem = obs.type === 'crystal' || obs.type === 'stardust';
        // 자석 보너스: 유틸 아이템(연료/수리/보호막)에만 적용 (크리스탈 연쇄 방지)
        const magnetBonusPx = (isItem && !isScoreItem) ? upgrades.magnet * 2 * cw / 100 : 0;
        // 충돌 기준 반경:
        // - 장애물(위험): 시각 반지름 + 로켓 반지름, 0.78 계수로 약 20% 축소 (판정 관대)
        // - 크리스탈/별먼지(점수): 시각 반지름 기준 정확한 터치 판정 (연쇄 획득 방지)
        // - 유틸 아이템(연료/수리/보호막/모래시계): 스치듯 지나가도 획득 (1.8배 + 자석 보너스)
        const collisionThresholdPx = isDangerous
          ? (obs.size / 2 + ROCKET_RADIUS_PX) * 0.78
          : isScoreItem
            ? (obs.size / 2 + ROCKET_RADIUS_PX)
            : (obs.size * 1.8 + ROCKET_RADIUS_PX + magnetBonusPx);

        if (distSqPx < collisionThresholdPx * collisionThresholdPx) {
          if (isItem) itemsCollectedInFrame++;
          // 자동 회피(Auto-Dodge) 로직: '회피' 아이템이나 기능이 있을 때 작동
          // 여러 장애물이 뭉쳐있을 때(Cluster) 한 번에 회피 포인트가 다 사라지지 않도록
          // 0.5초 무적 시간(flashing)을 줍니다.
          if (
            isDangerous &&
            // stale closure 방지: currentState(= stateRef.current)에서 최신 회피 횟수를 읽음
            (currentState.autoDodgesRemaining > 0 || currentState.isDodgeFlashing) &&
            newShield === 0
          ) {
            if (!currentState.isDodgeFlashing) {
              anyDodgeThisFrame = true;
            }
            obs.isDodged = true;
            return; // 회피 성공으로 처리하고, 이번 프레임에서 충돌 처리를 건너뛰고 다음 장애물로 넘어갑니다.
          }

          collidedIds.push(obs.id);
          if (obs.type === "asteroid") {
            const damage = obs.damage || (obs.size > 60 ? 2 : 1);

            // 쉴드 방어 로직 (Shield protection)
            if (newShield > 0) {
              newShield -= 1;
              setShake(5);
              createExplosion(obs.x, obs.y, "#22c55e"); // 초록색 쉴드 이펙트 폭발
              SoundController.play("shield_hit");
            } else {
              newHealth -= damage;
              damageTakenInFrame += damage;
              setShake(damage * 10);
              createExplosion(obs.x, obs.y, "#4b5563");
              if (newHealth <= 0) {
                SoundController.play("gameover");
                SoundController.stopBGM();
                setState((s) => ({
                  ...s,
                  gameOver: true,
                  gameOverReason: "damage",
                }));
              } else {
                SoundController.play("damage");
              }
            }
          } else if (obs.type === "debris") {
            // Debris damage
            if (newShield > 0) {
              newShield -= 1;
              setShake(5);
              createExplosion(obs.x, obs.y, "#22c55e");
              SoundController.play("shield_hit");
            } else {
              newHealth -= 1;
              damageTakenInFrame += 1;
              setShake(8);
              createExplosion(obs.x, obs.y, "#9ca3af"); // 회색 파편 폭발 이펙트
              if (newHealth <= 0) {
                SoundController.play("gameover");
                SoundController.stopBGM();
                setState((s) => ({
                  ...s,
                  gameOver: true,
                  gameOverReason: "damage",
                }));
              } else {
                SoundController.play("damage");
              }
            }
          } else if (obs.type === "satellite") {
            // Satellite damage
            if (newShield > 0) {
              newShield -= 1;
              setShake(8);
              createExplosion(obs.x, obs.y, "#22c55e");
              SoundController.play("shield_hit");
            } else {
              newHealth -= 1;
              damageTakenInFrame += 1;
              setShake(15);
              createExplosion(obs.x, obs.y, "#ef4444");
              if (newHealth <= 0) {
                SoundController.play("gameover");
                SoundController.stopBGM();
                setState((s) => ({
                  ...s,
                  gameOver: true,
                  gameOverReason: "damage",
                }));
              } else {
                SoundController.play("damage");
              }
            }
          } else if (obs.type === "fireball") {
            // 파이어볼도 쉴드가 있으면 막을 수 있습니다!
            if (newShield > 0) {
              newShield -= 1;
              setShake(10);
              createExplosion(obs.x, obs.y, "#22c55e"); // 초록색 쉴드 이펙트
              SoundController.play("shield_hit");
            } else {
              damageTakenInFrame += newHealth;
              newHealth = 0;
              setShake(30);
              createExplosion(obs.x, obs.y, "#f97316");
              SoundController.play("gameover");
              SoundController.stopBGM();
              setState((s) => ({
                ...s,
                gameOver: true,
                health: 0,
                gameOverReason: "fireball",
              }));
            }
          } else if (obs.type === "crystal") {
            // ────────────────────────────────────────────────────────────────
            // 💎 크리스탈(Crystal) 점수 보상 시스템
            // ────────────────────────────────────────────────────────────────
            // 크기별 기본 점수 (baseReward):
            //   small  → 25pt  (스폰 확률 60% — cRand < 0.6)
            //   medium → 80pt  (스폰 확률 30% — 0.6 ≤ cRand < 0.9)
            //   large  → 150pt (스폰 확률 10% — 0.9 ≤ cRand)
            //
            // 평균 기댓값: 0.6×25 + 0.3×80 + 0.1×150 = 51pt/개
            //
            // ✏️ 점수를 조정하려면:
            //   - 전체적으로 높이기 → 아래 세 baseReward 숫자를 동일 비율로 올리세요
            //     예: 25/80/150 → 40/120/225 (1.6배)
            //   - small만 올리기  → 첫 번째 줄 "let baseReward = 25" 값 변경
            //   - medium만 올리기 → "if (... === 'medium') baseReward = 80" 값 변경
            //   - large만 올리기  → "else if (... === 'large') baseReward = 150" 값 변경
            //
            // ✏️ 행운(Luck) 업그레이드 보너스 배율을 바꾸려면:
            //   현재: (1 + upgrades.luck * 0.2) = Lv.1:+20%, Lv.2:+40%, Lv.3:+60%
            //   - 더 강하게 → 0.2를 0.3~0.5로 올리세요
            //   - 더 약하게 → 0.2를 0.1로 내리세요
            //
            // ✏️ 게임 속도 배율(speedMultiplier)과의 연동:
            //   현재: 최종 점수 = baseReward × luckMult × speedMultiplier
            //   speedMultiplier는 GameLaunchpad의 설정 슬라이더 값입니다.
            //   설정을 끊고 싶다면 * gameTweaks.speedMultiplier 부분을 제거하세요.
            // ────────────────────────────────────────────────────────────────
            let baseReward = 25;
            if (obs.scoreType === "medium") baseReward = 80;
            else if (obs.scoreType === "large") baseReward = 150;

            const reward = Math.floor(baseReward * (1 + upgrades.luck * 0.2) * gameTweaks.speedMultiplier);
            newScore += reward;
            createAbsorptionEffect(obs.x, obs.y, "#22d3ee");
            SoundController.play("collect");
          } else if (obs.type === "stardust") {
            // stardust 타입 충돌 로직은 제거되었습니다. (StardustCanvas 대체)
          } else if (obs.type === "star") {
            // 노란 별(Star) = 연료 (크기에 따라 10~25 회복)
            const baseReward = Math.floor((obs.size / 50) * 20);
            const reward = Math.floor(
              baseReward * (1 + upgrades.fuel_capacity * 0.2),
            ); // 연료통 업그레이드하면 회복량도 늘어남
            newFuel = Math.min(
              100 + upgrades.fuel_capacity * 20,
              newFuel + reward,
            );
            createAbsorptionEffect(obs.x, obs.y, "#fbbf24");
            SoundController.play("fuel");
          } else if (obs.type === "shield") {
            // 실드(Shield) = 보호막 생성 (기본 3회 + 업그레이드 수치)
            newShield = 3 + upgrades.shield_boost;
            createAbsorptionEffect(obs.x, obs.y, "#10b981");
            SoundController.play("shield_get");
            // 보호막 사용 통계 추적
            setState(s => ({
              ...s,
              stats: {
                ...s.stats,
                shieldUsages: (s.stats?.shieldUsages || 0) + 1,
              }
            }));
          } else if (obs.type === "wrench") {
            // 수리도구(Wrench) = 체력 1 회복
            const maxHealth = 5 + upgrades.max_health;
            newHealth = Math.min(maxHealth, newHealth + 1);
            createAbsorptionEffect(obs.x, obs.y, "#ec4899");
            SoundController.play("heal");
          } else if (obs.type === "hourglass") {
            // 시간 정지 획득: 5초 동안 장애물 정지
            setState(s => ({
              ...s,
              timeFreezeUntil: s.time + 5,
              stats: {
                ...s.stats,
                timeFrozen: (s.stats?.timeFrozen || 0) + 1,
              }
            }));
            createAbsorptionEffect(obs.x, obs.y, "#a78bfa");
            SoundController.play("collect");
            setShake(5);
          } else if (obs.type === "blackhole") {
            // 블랙홀 중심부 충돌 = 치명적 데미지 (즉사는 아님, 반피 까임)
            // inner zone: 전체 충돌 반경(65.5px)의 약 60% 이내 = 블랙홀 코어 영역
            if (distSqPx < (obs.size * 0.3) * (obs.size * 0.3)) {
              // 딥 임팩트 (Deep impact)
              createExplosion(obs.x, obs.y, "#6d28d9"); // 보라색 폭발 이펙트

              if (newShield > 0) {
                // 쉴드가 있으면 즉시 파괴되면서 목숨을 구합니다.
                newShield = 0;
                setShake(20);
                SoundController.play("shield_hit");
              } else {
                // 쉴드 없으면 체력의 절반이 날아가는 막대한 피해
                const damage = Math.ceil(newHealth / 2);
                newHealth -= damage;
                damageTakenInFrame += damage;
                setShake(30);

                if (newHealth <= 0) {
                  SoundController.play("gameover");
                  SoundController.stopBGM();
                  setState((s) => ({
                    ...s,
                    gameOver: true,
                    health: 0,
                    gameOverReason: undefined,
                  }));
                } else {
                  SoundController.play("damage");
                }
              }
            }
          }
        }
      });

      if (
        anyDodgeThisFrame ||
        newHealth !== health ||
        newScore !== score ||
        newFuel !== fuel ||
        newShield !== shieldActive ||
        destroyedInFrame > 0 ||
        itemsCollectedInFrame > 0 ||
        damageTakenInFrame > 0
      ) {
        setState((s) => ({
          ...s,
          autoDodgesRemaining: anyDodgeThisFrame ? Math.max(0, s.autoDodgesRemaining - 1) : s.autoDodgesRemaining,
          isDodgeFlashing: anyDodgeThisFrame ? true : s.isDodgeFlashing,
          health: newHealth,
          score: newScore,
          fuel: newFuel !== fuel ? newFuel : s.fuel,
          shieldActive: newShield,
          stats: {
            ...s.stats,
            asteroidsDestroyed: (s.stats?.asteroidsDestroyed || 0) + destroyedInFrame,
            itemsCollected: (s.stats?.itemsCollected || 0) + itemsCollectedInFrame,
            damageTaken: (s.stats?.damageTaken || 0) + damageTakenInFrame,
            fuelPickups: (s.stats?.fuelPickups || 0) + (newFuel > fuel ? 1 : 0),
            healthPickups: (s.stats?.healthPickups || 0) + (newHealth > (s.health || 0) ? 1 : 0),
            shieldSaves: (s.stats?.shieldSaves || 0) + (newShield < (s.shieldActive || 0) && damageTakenInFrame === 0 ? 1 : 0),
            perfectDodges: (s.stats?.perfectDodges || 0) + (anyDodgeThisFrame ? 1 : 0),
          },
        }));

        if (anyDodgeThisFrame) {
          SoundController.play("collect");
          setTimeout(() => {
            setState((s) => ({ ...s, isDodgeFlashing: false }));
          }, 500);
        }
      }

      // 🔧 개선: 새 장애물 + 별먼지를 이 단일 setObstacles에서 통합 주입
      // → 별도 setObstacles 호출 완전 제거로 프레임당 React 리렌더 최소화
      const result = filtered.filter((obs) => !collidedIds.includes(obs.id));
      if (pendingSpawn) result.push(pendingSpawn);
      if (pendingItemSpawn) result.push(pendingItemSpawn); // 아이템 전용 스폰 (장애물과 독립)
      return result;
    });

    // 🚀 실장님의 '오리지널 감성' 복구: 타겟 포지션(조준선) 부드럽게 추종 (Lerp 적용)
    // Autopilot, 미션 완료, 착륙 중 상황이 아닐 때만 수동 추종 로직 적용
    // ⚠️ isLanding 상태일 때는 행성 흡수 로직이 y축 이동을 제어하므로 반드시 제외해야 함 (충돌 방지)
    // 🔑 stale closure 방지: state.xxx 대신 currentState.xxx(= stateRef.current) 사용
    // 🚀 실장님의 '손맛' 최적화: 조종 반응성 상향 및 동적 가속도 도입
    // Autopilot, 미션 완료, 착륙 중 상황이 아닐 때만 수동 추종 로직 적용
    if (!currentState.isAutoPilot && !currentState.missionComplete && !currentState.gameOver && currentState.gameStarted && !currentState.isLanding) {
      const curPos = playerPositionRef.current;
      const dx = targetPositionRef.current.x - curPos.x;
      const dy = targetPositionRef.current.y - curPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 🚀 개선: 거리가 멀수록 더 민첩하게 따라붙는 '탄력적 추종(Elastic Snap)'
      // 거리가 50% 이상 벌어지면 최대 1.4배까지 반응 속도 가속
      const distanceBoost = 1 + Math.min(0.4, dist / 50);

      // 🚀 개선: 기본 반응성(0.12 -> 0.25) 상향 및 레벨업 성장폭 조정
      // 레벨당 +0.035 → 최대 0.55 (레벨 9 이상에서 정점 도달)
      const baseAgility = 0.25 + (currentState.level - 1) * 0.035;
      const finalLerp = Math.min(0.55, baseAgility * distanceBoost);

      const gravityEffect = gravityActive ? 0.3 : 0;

      // 🌪️ 태양풍 드리프트: 2단계 강도 모델
      // · 첫 2초 (Surge)    : 강도 40/s → 로켓이 확 떠밀려나는 충격
      // · 이후 6초 (Sustained): 강도 22/s → 버티기 어려운 지속 압력
      // · 조종 반응성도 20%로 낮춰 마우스로 상쇄하기 어렵게 만듦
      let windForce = 0;
      let windLerpPenalty = 1.0;
      if (solarWindStartTime.current !== null) {
        const windElapsed = currentState.time - solarWindStartTime.current;
        if (windElapsed < 2.0) {
          // Surge: 첫 2초간 강하게 치고 들어오다가 점점 줄어듦
          windForce = 40.0 * (1 - windElapsed / 2.0 * 0.35);
        } else {
          // Sustained: 이후 지속 압박
          windForce = 22.0;
        }
        windLerpPenalty = 0.20; // 조종 반응성 80% 저하 → 제어 매우 어려움
      }

      const solarWindDriftX = solarWindDir.current.x * (1 / 60) * windForce;
      const solarWindDriftY = solarWindDir.current.y * (1 / 60) * windForce;
      const effectiveLerp   = finalLerp * windLerpPenalty;

      const newPlayerPos = {
        x: Math.max(5, Math.min(95, curPos.x + dx * effectiveLerp + solarWindDriftX)),
        y: Math.max(5, Math.min(95, curPos.y + dy * effectiveLerp + gravityEffect + solarWindDriftY)),
      };

      // ref를 먼저 동기 갱신 → 프레임 내 후속 계산(충돌 등)에서 최신 위치 즉시 반영
      playerPositionRef.current = newPlayerPos;
      setPlayerPosition(newPlayerPos);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDifficultySettings, spawnObstacle, gameScale]); // state 의존성 제거

  // 🔧 프레임 끊김 해결: updateRef를 렌더 시점에 동기적으로 업데이트
  // 이전: useEffect(비동기) → state 변경 후 rAF가 실행될 때 stale 참조 가능 → 멈춤 발생
  // 개선: 렌더 시점에 즉시 할당 → rAF 콜백이 항상 최신 updateGame 참조 보장
  const updateRef = useRef<() => void>(undefined);
  updateRef.current = updateGame;
  // 렌더 시점에 obstaclesRef/bulletsRef를 동기 갱신 → updateGame 내부 stale closure 해결
  obstaclesRef.current = obstacles;
  bulletsRef.current = bullets;

  useEffect(() => {
    let frameId: number;
    let lastTime = 0;
    let accumulator = 0;
    const FIXED_STEP = 1000 / 60; // 목표: 60fps (16.67ms 간격)
    const MAX_STEPS = 3; // 프레임 드랍 시 최대 3프레임까지만 보정 (과거를 무한히 따라잡지 않음)

    const loop = (timestamp: number) => {
      if (lastTime === 0) lastTime = timestamp;
      const elapsed = timestamp - lastTime;
      lastTime = timestamp;

      // 🔧 프레임 끊김 핵심 해결: Fixed Timestep Accumulator 패턴
      // 프레임이 드랍되면(elapsed > 16.67ms), 누적된 시간만큼
      // updateGame을 여러 번 실행하여 오브젝트 이동량을 보정합니다.
      // → "멈칫한 후 순간이동"이 아닌 "자연스러운 연속 이동" 보장
      accumulator += elapsed;
      let steps = 0;
      while (accumulator >= FIXED_STEP && steps < MAX_STEPS) {
        if (updateRef.current) {
          updateRef.current();
        }
        accumulator -= FIXED_STEP;
        steps++;
      }
      // 보정 한도 초과 시 잔여 시간 버리기 (더 큰 렉 방지)
      if (accumulator > FIXED_STEP * 2) accumulator = 0;

      frameId = requestAnimationFrame(loop);
    };

    if (state.gameStarted && !state.gameOver && !state.isPaused && !state.missionComplete) {
      frameId = requestAnimationFrame(loop);
      SoundController.updateEngine();
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [state.gameOver, state.gameStarted, state.isPaused, state.missionComplete]);

  // 📊 실시간 스코어 외부 통지 관찰 (Throttled update to parent)
  const lastScoreReportedTime = useRef(0);
  useEffect(() => {
    if (onScoreUpdateRef.current && state.gameStarted) {
      const now = Date.now();
      // 🚀 500ms마다 또는 점수가 100점 이상 올랐을 때만 부모에게 통지 (렌더링 폭주 방지)
      if (now - lastScoreReportedTime.current > 500) {
        onScoreUpdateRef.current(state.score);
        lastScoreReportedTime.current = now;
      }
    }
  }, [state.score, state.gameStarted]);

  // 🏁 게임 종료 시 외부 처리 (의존성 최소화)
  useEffect(() => {
    if (state.gameOver && onGameOverRef.current) {
      onGameOverRef.current(state.score, state.earnedBadges);
    }
  }, [state.gameOver, state.score, state.earnedBadges]);

  // 레벨업 알림 자동 닫기 처리
  useEffect(() => {
    if (state.showLevelUp) {
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, showLevelUp: 0 }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.showLevelUp]);

  // 행성 흡수 완료 → 1.8초 후 임무 완료 화면 전환
  // 로켓이 천체 안으로 사라진 뒤 파동 효과가 끝날 때까지 대기
  useEffect(() => {
    if (state.planetAbsorbing && !state.missionComplete) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, missionComplete: true }));
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [state.planetAbsorbing, state.missionComplete]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || state.gameOver || state.isAutoPilot || state.isLanding || launchPhase !== 'active') return;
    const rect = containerRef.current.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if (window.TouchEvent && e.nativeEvent instanceof TouchEvent) {
      // Prevent browser scroll/zoom while dragging on mobile
      if (e.cancelable) e.preventDefault();
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // 🚀 조준선(Target)은 즉시 이동, 로켓 본체(Player)는 updateGame 루프에서 부드럽게 추적
    const clampedPos = {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
    };
    // Ref를 먼저 동기적으로 갱신 → useCallback stale closure 없이 게임 루프에서 즉시 반영
    targetPositionRef.current = clampedPos;
    setTargetPosition(clampedPos);
  };

  const startGame = () => {
    // 재출격 시에는 연료통, 부스터 없이 로켓만 출발하도록 설정 (실장님 요청사항)
    if (state.isRelaunch) {
      setLaunchPhase('staging_fairing_off'); // 주변 외부 장비(부스터, 연료통) 제거 상태로 즉시 시작
      setTimeout(() => setLaunchPhase('active'), 1500); // 1.5초 후 제어 가능 상태로 전환
    } else {
      // 일반 출격 시 관람 중심의 전체 스테이징 시퀀스 진행
      setLaunchPhase('staging_initial');
      setTimeout(() => setLaunchPhase('staging_boosters_off'), 800);
      setTimeout(() => setLaunchPhase('staging_tank_off'), 2000);
      setTimeout(() => setLaunchPhase('staging_fairing_off'), 3500);
      setTimeout(() => setLaunchPhase('active'), 5000);
    }

    SoundController.init();
    SoundController.play("start");
    SoundController.startBGM();
    setState((prev) => {
      // 영구 업그레이드 수치 적용
      const baseHealth = 5 + prev.upgrades.max_health;
      const baseFuel = 100 + prev.upgrades.fuel_capacity * 20;

      // 모든 업그레이드 완료 여부 확인 (게임 엔딩 조건 확인용)
      const isMaxed = Object.values(prev.upgrades).every((level) => level >= 5);
      const isRelaunch = prev.isRelaunch;

      // 재출격(relaunch)이 아니고 풀 업그레이드 상태이거나 새로운 미션일 때만 점수/레벨 초기화
      // 'high'(무한 무한) 모드에서는 풀 업그레이드 후에도 기록을 유지할 수 있도록 함.
      const shouldResetStats = !isRelaunch && isMaxed;

      return {
        ...prev,
        // 재출격 시에는 기존 점수 유지, 새로운 시작 시에만 초기화
        score: shouldResetStats ? 0 : prev.score,
        health: baseHealth,
        fuel: baseFuel,
        level: shouldResetStats ? 1 : Math.floor(prev.score / 1000) + 1,
        distance: shouldResetStats || !isRelaunch ? 0 : prev.distance,
        startDistance: shouldResetStats || !isRelaunch ? 0 : prev.distance,
        time: shouldResetStats || !isRelaunch ? 0 : prev.time,
        sessionStartTime: shouldResetStats || !isRelaunch ? 0 : prev.time,

        gameOver: false,
        gameStarted: true,
        gameOverReason: undefined,
        shieldActive: 0,
        showUpgradeScreen: false,
        showLaunchpad: false,
        missionComplete: false,
        isLanding: false, // 게임 시작 시에도 명시적 초기화
        planetAbsorbing: false, // 행성 흡수 효과 초기화
        distanceToTarget:
          isMaxed || !isRelaunch
            ? MISSION_GOALS[prev.difficulty]
            : Math.max(0, MISSION_GOALS[prev.difficulty] - prev.distance),
        autoDodgesRemaining:
          shouldResetStats || !isRelaunch
            ? 1
            : Math.floor(prev.score / 1000) + 1,
        isDodgeFlashing: false,
        isAutoPilot: false,
        showStrategyModal: false,
        timeFreezeUntil: 0, // Initialize timeFreezeUntil
        stats: shouldResetStats
          ? {
            asteroidsDestroyed: 0,
            itemsCollected: 0,
            damageTaken: 0,
          }
          : prev.stats,
        earnedBadges: shouldResetStats ? [] : prev.earnedBadges,
      };
    });
    setObstacles([]);
    setParticles([]);
    setShake(0);
    setPlayerPosition({ x: 50, y: 85 });
    setTargetPosition({ x: 50, y: 85 });
  };

  const togglePause = () => {
    setState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const setDifficulty = (diff: "low" | "mid" | "high") => {
    setState((prev) => ({
      ...prev,
      difficulty: diff,
      distanceToTarget: MISSION_GOALS[diff],
      missionComplete: false,
    }));
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case "low":
        return "초급 대원 모드";
      case "mid":
        return "중급 대원 모드";
      case "high":
        return "특급 대원 모드";
      default:
        return "";
    }
  };

  const retryLevel = () => {
    setState((s) => {
      const baseHealth = 5 + s.upgrades.max_health;
      const baseFuel = 100 + s.upgrades.fuel_capacity * 20;
      return {
        ...s,
        distance: 0,
        startDistance: 0,
        score: 0,
        level: 1,
        health: baseHealth,
        fuel: baseFuel,
        missionComplete: false,
        isLanding: false, // 재도전 시 착륙 상태 반드시 초기화
        planetAbsorbing: false, // 행성 흡수 효과 초기화
        isRelaunch: false,
        sessionStartTime: s.time,
        distanceToTarget: MISSION_GOALS[s.difficulty],
        timeFreezeUntil: 0,
        stats: {
          asteroidsDestroyed: 0,
          itemsCollected: 0,
          damageTaken: 0,
        },
      };
    });
    // ✅ 재도전 시 로켓 위치 초기화 (착륙 후 y≈5 버그 방지)
    setObstacles([]);
    setParticles([]);
    setShake(0);
    setPlayerPosition({ x: 50, y: 85 });
    setTargetPosition({ x: 50, y: 85 });
    playerPositionRef.current = { x: 50, y: 85 };
    targetPositionRef.current = { x: 50, y: 85 };
    SoundController.play("shield_get");
  };

  const nextMission = () => {
    const nextDifficulty =
      state.difficulty === "low" ? "mid" : ("high" as "low" | "mid" | "high");
    setState((s) => {
      const baseHealth = 5 + s.upgrades.max_health;
      const baseFuel = 100 + s.upgrades.fuel_capacity * 20;
      return {
        ...s,
        difficulty: nextDifficulty,
        distance: 0,
        startDistance: 0,
        // score와 level은 미션 간 누적 유지 (리셋하지 않음)
        level: Math.floor(s.score / 1000) + 1,
        health: baseHealth,
        fuel: baseFuel,
        missionComplete: false,
        isLanding: false, // 다음 미션 시에도 착륙 상태 초기화
        planetAbsorbing: false, // 행성 흡수 효과 초기화
        isRelaunch: false,
        sessionStartTime: s.time,
        distanceToTarget: MISSION_GOALS[nextDifficulty],
        timeFreezeUntil: 0,
        stats: {
          asteroidsDestroyed: 0,
          itemsCollected: 0,
          damageTaken: 0,
        },
      };
    });
    // ✅ 다음 미션 시작: 로켓 위치를 화면 하단으로 초기화 (착륙 후 y≈5에서 시작하는 버그 방지)
    setObstacles([]);
    setParticles([]);
    setShake(0);
    setPlayerPosition({ x: 50, y: 85 });
    setTargetPosition({ x: 50, y: 85 });
    playerPositionRef.current = { x: 50, y: 85 };
    targetPositionRef.current = { x: 50, y: 85 };
    SoundController.play("shield_get");
  };

  const updateUpgrade = (type: UpgradeType) => {
    const isMaxed = state.upgrades[type] >= 5;
    if (!isMaxed && state.upgradePoints > 0) {
      setState((prev) => {
        const nextUpgrades = {
          ...prev.upgrades,
          [type]: prev.upgrades[type] + 1,
        };

        const newState = {
          ...prev,
          upgrades: nextUpgrades,
          upgradePoints: prev.upgradePoints - 1,
          // 우주정거장에서 즉시 충전된 상태를 게이지에 반영
          health: 5 + nextUpgrades.max_health,
          fuel: 100 + nextUpgrades.fuel_capacity * 20,
        };

        const allMaxed = Object.values(nextUpgrades).every(
          (level) => level >= 5,
        );
        if (allMaxed) {
          const randomFact =
            SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
          return {
            ...newState,
            showUpgradeScreen: false,
            showFactScreen: true,
            currentFact: randomFact,
          };
        }
        return newState;
      });
      SoundController.play("shield_get");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050508] relative overflow-hidden overflow-x-hidden font-mono text-white">
      {/* 배경 별들이 흐르는 효과 */}
      <div className="absolute inset-0 z-0 h-[200%] animate-scrolling-bg opacity-30 pointer-events-none bg-star-field" />

      {/* 🌕🔴 목적지 천체 비주얼 (미션 진행률 70% 이상 시 등장) */}
      {(() => {
        // 진행률 계산: distanceToTarget은 "남은 거리"이므로 총 목표 = 현재 + 남은 거리
        const totalDistance = state.distance + state.distanceToTarget;
        const missionProgress = totalDistance > 0 && state.distanceToTarget < Infinity
          ? Math.min(1, state.distance / totalDistance)
          : 0;

        // 95% 이상 도달 시 천체가 서서히 나타남 (0.01 → 1.0 스케일)
        const rawProgress = (missionProgress - 0.95) / 0.05;
        const appearProgress = Math.min(1, Math.max(0, 0.01 + rawProgress * 0.99));

        if (missionProgress < 0.95 || !state.gameStarted || state.gameOver) return null;

        // 난이도에 따른 천체 결정
        const isMoon = state.difficulty === 'low';
        const isMars = state.difficulty === 'mid';

        if (!isMoon && !isMars) return null; // 심우주(high)는 목적지 없음

        // 천체 크기: 최종 160px의 1%인 1.6px부터 100%인 160px까지
        const targetFullSize = 160;
        const size = appearProgress * targetFullSize;
        // 투명도: 1%에서 100%까지
        const opacity = appearProgress;

        return (
          <motion.div
            key="destination-planet"
            animate={{
              opacity,
              width: size,
              height: size,
              top: `${6 - appearProgress * 2}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute z-[2] pointer-events-none left-1/2 -translate-x-1/2"
          >
            {/* 천체 본체 */}
            <div
              className={`destination-planet-body ${isMoon ? 'planet-moon' : 'planet-mars'}`}
              style={{
                boxShadow: isMoon
                  ? `0 0 ${size * 0.3}px rgba(245, 245, 240, 0.4), inset -${size * 0.15}px -${size * 0.1}px ${size * 0.2}px rgba(0,0,0,0.3)`
                  : `0 0 ${size * 0.3}px rgba(232, 115, 74, 0.4), inset -${size * 0.15}px -${size * 0.1}px ${size * 0.2}px rgba(0,0,0,0.4)`,
              }}
            >
              {/* 달: 크레이터 디테일 */}
              {isMoon && size > 60 && (
                <>
                  <div className="planet-detail-crater bg-crater-light" style={{ top: '25%', left: '30%', width: '18%', height: '18%' }} />
                  <div className="planet-detail-crater bg-crater-light" style={{ top: '55%', left: '50%', width: '12%', height: '12%', opacity: 0.8 }} />
                  <div className="planet-detail-crater bg-crater-light" style={{ top: '40%', left: '60%', width: '8%', height: '8%', opacity: 0.6 }} />
                  <div className="planet-detail-highlight bg-highlight-soft" style={{ top: '15%', left: '20%', width: '10%', height: '10%' }} />
                </>
              )}
              {/* 화성: 표면 디테일 */}
              {isMars && size > 60 && (
                <>
                  <div className="planet-detail-crater bg-crater-medium" style={{ top: '20%', left: '25%', width: '20%', height: '20%' }} />
                  <div className="mars-surface-line" style={{ top: '45%', left: '10%', width: '80%' }} />
                  <div className="planet-detail-highlight bg-highlight-orange" style={{ top: '60%', left: '55%', width: '15%', height: '15%' }} />
                </>
              )}
              {/* 로켓 진입 시 내부 플래시 오버레이 */}
              {state.planetAbsorbing && (
                <motion.div
                  className="absolute inset-0 rounded-full z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.95, 0.6, 0] }}
                  transition={{ duration: 0.7, ease: 'easeInOut', times: [0, 0.2, 0.5, 1] }}
                  style={{
                    background: isMoon
                      ? 'radial-gradient(circle, rgba(255,255,240,1) 0%, rgba(245,245,200,0.8) 50%, transparent 100%)'
                      : 'radial-gradient(circle, rgba(255,220,80,1) 0%, rgba(255,160,40,0.8) 50%, transparent 100%)',
                  }}
                />
              )}
            </div>

            {/* 천체 이름 라벨 (등장 33% 이상 표시, 흡수 중 숨김) */}
            {appearProgress > 0.33 && !state.planetAbsorbing && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${isMoon ? 'text-gray-300/60' : 'text-orange-400/60'}`}>
                  {isMoon ? 'MOON' : 'MARS'}
                </span>
              </motion.div>
            )}

            {/* 글로우 오라 */}
            <div
              className={`planet-glow-aura animate-pulse ${isMoon ? 'glow-moon' : 'glow-mars'}`}
            />

            {/* 흡수 파동 링 - 로켓이 천체로 진입할 때 방사형 파동 방출 */}
            {state.planetAbsorbing && (
              <>
                {/* 파동 링 1 (가장 빠름) */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  initial={{ scale: 1, opacity: 0.9 }}
                  animate={{ scale: 4.5, opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ borderColor: isMoon ? 'rgba(255,255,220,0.85)' : 'rgba(255,190,60,0.85)' }}
                />
                {/* 파동 링 2 (중간) */}
                <motion.div
                  className="absolute inset-0 rounded-full border"
                  initial={{ scale: 1, opacity: 0.65 }}
                  animate={{ scale: 5.5, opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.15 }}
                  style={{ borderColor: isMoon ? 'rgba(255,255,220,0.65)' : 'rgba(255,180,50,0.65)' }}
                />
                {/* 파동 링 3 (가장 느림, 가장 넓음) */}
                <motion.div
                  className="absolute inset-0 rounded-full border"
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 7, opacity: 0 }}
                  transition={{ duration: 1.8, ease: 'easeOut', delay: 0.35 }}
                  style={{ borderColor: isMoon ? 'rgba(255,255,220,0.4)' : 'rgba(255,180,50,0.4)' }}
                />
                {/* 중앙 핵심 플래시 (외부 방사형) */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ scale: 0.5, opacity: 0.9 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{
                    background: isMoon
                      ? 'radial-gradient(circle, rgba(255,255,240,0.8) 0%, transparent 60%)'
                      : 'radial-gradient(circle, rgba(255,220,80,0.8) 0%, transparent 60%)',
                  }}
                />
              </>
            )}
          </motion.div>
        );
      })()}

      {/* 게임 상단 HUD (헤드업 디스플레이) */}
      <GameHUD state={state} />

      {/* 메인 게임 및 플레이어 영역 */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        animate={{
          x: shake > 0 ? Math.sin(state.time * 50) * shake : 0,
          y: shake > 0 ? Math.cos(state.time * 40) * shake : 0,
        }}
        transition={{ duration: 0 }}
        className="flex-1 relative select-none overflow-hidden bg-black/40 touch-none"
        style={{
          cursor: 'none',
          touchAction: 'none',
          // 🚀 시각 효과: 고속 주행 시 화면 왜곡 및 색수차 효과 (GPU 가속 활용)
          filter: state.isSpeedEffect
            ? `contrast(${100 + state.speedEffectIntensity * 20}%) 
               brightness(${100 + state.speedEffectIntensity * 10}%)
               hue-rotate(${state.speedEffectIntensity * 5}deg)
               blur(${state.speedEffectIntensity * 0.5}px)`
            : 'none',
          transition: 'filter 0.3s ease-out'
        }}
      >
        {/* 🌠 최적화된 스타더스트 캔버스 레이어 */}
        <StardustCanvasMemo
          time={state.time}
          speedEffectIntensity={state.speedEffectIntensity}
          baseSpeed={getDifficultySettings().baseSpeed}
          isPaused={state.isPaused}
        />

        {/* 🌌 은하수 배경 효과 - 화면 상단에서 하단으로 서서히 통과하는 연출
            · 초급/중급: 미션 45% 도달 시 딱 1회 (25초 동안 스크롤)
            · 특급: 90초 주기, 처음 25초 동안 스크롤 (65초 휴식 → 반복)
            scrollY: 0=화면 위 진입, 0.5=화면 중앙, 1=화면 아래 퇴장 */}
        {(() => {
          if (!state.gameStarted || state.gameOver) return null;

          const DURATION = 25; // 스크롤 한 번에 걸리는 시간 (초)
          let scrollY: number | null = null;

          if (state.difficulty === 'high') {
            // 특급: 120초 마스터 사이클, [0~25s] 슬롯에서 은하수 표시
            // 태양풍 활성 중에는 렌더링 중단 (동시 표시 방지)
            if (!solarWindActive) {
              const cycle = state.time % 120;
              if (cycle < DURATION) {
                scrollY = cycle / DURATION;
              }
            }
          } else {
            // 초급/중급: galaxyLowMidStartTime이 기록된 경우에만 표시
            if (galaxyLowMidStartTime.current !== null) {
              const elapsed = state.time - galaxyLowMidStartTime.current;
              if (elapsed >= 0 && elapsed < DURATION) {
                scrollY = elapsed / DURATION;
              }
            }
          }

          if (scrollY === null) return null;

          return (
            <GalaxyCanvasMemo
              scrollY={scrollY}
              time={state.time}
            />
          );
        })()}

        {/* 🌅 오로라 배경 효과 - 상단 고정, 서서히 페이드 인 → 유지 → 페이드 아웃
            · 초급/중급: 미션 70% 도달 시 딱 1회
            · 특급: 60초 주기 */}
        {(() => {
          if (!state.gameStarted || state.gameOver) return null;

          const DURATION = 20; // 오로라 표시 총 시간 (초)
          const FADE     = 3;  // 페이드 인/아웃 구간 (초)

          // elapsed → opacity 계산 (0→1 페이드인, 1 유지, 1→0 페이드아웃)
          const calcOpacity = (elapsed: number): number | null => {
            if (elapsed < 0 || elapsed >= DURATION) return null;
            if (elapsed < FADE) return elapsed / FADE;
            if (elapsed > DURATION - FADE) return (DURATION - elapsed) / FADE;
            return 1;
          };

          let opacity: number | null = null;

          if (state.difficulty === 'high') {
            // 특급: 120초 마스터 사이클, [60~80s] 슬롯에서 오로라 표시
            // 태양풍 활성 중에는 렌더링 중단 (동시 표시 방지)
            if (!solarWindActive) {
              const cyclePhase = state.time % 120;
              if (cyclePhase >= 60 && cyclePhase < 80) {
                opacity = calcOpacity(cyclePhase - 60); // 슬롯 내 경과 시간 기준 페이드
              }
            }
          } else if (auroraLowMidStartTime.current !== null) {
            opacity = calcOpacity(state.time - auroraLowMidStartTime.current);
          }

          if (opacity === null) return null;

          return (
            <AuroraCanvasMemo
              opacity={opacity}
              time={state.time}
            />
          );
        })()}

        {/* 🌪️ 태양풍 시각 효과 - 로켓이 밀려날 때 화면 가장자리 경고 오버레이
            바람 방향으로 화면 테두리가 주황/금색으로 물드는 연출 */}
        {solarWindActive && state.gameStarted && !state.gameOver && (() => {
          const dir = solarWindDir.current;
          // 바람 방향 벡터에 따라 어느 쪽 가장자리를 강조할지 결정
          const leftGlow   = Math.max(0, -dir.x); // 왼쪽으로 바람 → 오른쪽 테두리 강조 (반대편)
          const rightGlow  = Math.max(0,  dir.x);
          const topGlow    = Math.max(0, -dir.y);
          const bottomGlow = Math.max(0,  dir.y);

          return (
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 8 }}>
              {/* 가장자리 빛 오버레이 */}
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(ellipse 80% 30% at 50% 100%, rgba(251,146,60,${bottomGlow * 0.35}) 0%, transparent 100%),
                  radial-gradient(ellipse 80% 30% at 50% 0%,   rgba(251,146,60,${topGlow    * 0.35}) 0%, transparent 100%),
                  radial-gradient(ellipse 30% 80% at 0%   50%, rgba(251,146,60,${leftGlow   * 0.35}) 0%, transparent 100%),
                  radial-gradient(ellipse 30% 80% at 100% 50%, rgba(251,146,60,${rightGlow  * 0.35}) 0%, transparent 100%)
                `,
              }} />
              {/* 태양풍 경고 텍스트 */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-2
                              bg-orange-950/70 border border-orange-400/60 rounded-full
                              px-4 py-1.5 text-orange-300 text-xs font-mono backdrop-blur-sm"
                   style={{ animation: 'pulse 1s ease-in-out infinite' }}>
                <span className="text-orange-400 text-sm">☀</span>
                SOLAR WIND — HOLD COURSE
              </div>
              {/* 태양풍 파티클 줄기 (CSS로 단순하게 표현) */}
              <div className="absolute inset-0 overflow-hidden opacity-30">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent"
                       style={{
                         top: `${10 + i * 11}%`,
                         left: '-20%',
                         width: '140%',
                         transform: `rotate(${dir.y * 15}deg) translateX(${((state.time * 80 + i * 60) % 200) - 20}%)`,
                         opacity: 0.6 - i * 0.04,
                       }} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* 🚀 실장님의 조준선: 마우스 위치를 즉시 추적하여 시각적 반응성 극대화 */}
        {state.gameStarted && !state.gameOver && !state.isPaused && (
          <GameTarget position={targetPosition} />
        )}
        <AnimatePresence>
          {state.distance - state.startDistance < 2000 && (
            <motion.div
              key="departure-env"
              initial={{ y: 0, opacity: 1 }}
              animate={{
                // 0.35배 속도로 천천히 아래로 멀어짐 (기존 1.5 → 0.35)
                y: (state.distance - state.startDistance) * 0.35,
                // 2000 거리에 걸쳐 서서히 투명해짐 (기존 600 → 2000)
                opacity: Math.max(
                  0,
                  1 - (state.distance - state.startDistance) / 2000,
                ),
              }}
              transition={{ type: 'tween', ease: 'linear', duration: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-[-15%] left-[-20%] right-[-20%] h-[75vh] z-0 pointer-events-none transform-gpu"
            >
              <img
                src={state.isRelaunch ? "/station.jpg" : "/earth.jpg"}
                className="w-full h-full object-cover rounded-t-[100px] border-t-8 border-white/10 shadow-[0_-50px_100px_rgba(0,0,0,0.8)] grayscale-[0.3] brightness-75"
                alt="Launch Point"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/40 to-black/80" />
              <div
                className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-${state.isRelaunch ? "purple" : "blue"}-500/20 to-transparent blur-3xl`}
              />
            </motion.div>
          )}

          {state.isPaused && (
            <motion.div
              key="pause-env"
              initial={{ y: 500, opacity: 0 }}
              animate={{ y: "15vh", opacity: 1 }}
              exit={{ y: 500, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 100 }}
              className="absolute bottom-[-25%] left-[-10%] right-[-10%] h-[70vh] z-0 pointer-events-none"
            >
              <img
                src="/station.jpg"
                className="w-full h-full object-cover rounded-t-[100px] border-t-8 border-cyan-500/30 shadow-[0_-50px_100px_rgba(0,0,0,0.8)] brightness-75"
                alt="Station Point"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/40 to-black/80" />
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/20 to-transparent blur-3xl" />

              {/* 시각적 연출: 스캐닝 빔 효과 */}
              <motion.div
                animate={{ top: ["20%", "80%", "20%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
              />

              {/* 시각적 연출: 우주정거장 통신 단말기 */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[340px] min-h-[160px] bg-black/80 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-md z-20 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-2">
                  <Radio className="w-4 h-4 text-cyan-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-tighter text-cyan-500/80">
                    Station_Radio_104.9
                  </span>
                  <div className="ml-auto flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                  </div>
                </div>
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  <motion.p
                    key={Math.floor(state.time / 4)}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm text-cyan-200 leading-relaxed font-mono whitespace-pre-wrap font-medium"
                  >
                    "
                    {
                      SPACE_FACTS[Math.floor(state.time) % SPACE_FACTS.length]
                        .quote
                    }
                    "
                  </motion.p>
                  <div className="flex items-center gap-3 pt-1 opacity-50">
                    <div className="flex items-center gap-1">
                      <Cpu className="w-2.5 h-2.5" />
                      <span className="text-[8px] uppercase tracking-widest">
                        Docking_System_OK
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" />
                      <span className="text-[8px] uppercase tracking-widest">
                        Pilot_Vitals_STABLE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {state.timeFreezeUntil > state.time && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-500/30 z-[45] pointer-events-none"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{
                      rotateY: [0, 180, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Hourglass className="w-16 h-16 text-blue-300 drop-shadow-[0_0_15px_rgba(147,197,253,0.8)]" />
                  </motion.div>
                  <span className="text-blue-400 font-black text-2xl sm:text-4xl tracking-[0.2em] sm:tracking-[0.3em] animate-pulse drop-shadow-md">TIME FROZEN</span>
                  <div className="h-1.5 w-48 sm:w-64 bg-blue-500/20 rounded-full overflow-hidden border border-blue-400/20">
                    <motion.div
                      className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: (state.timeFreezeUntil - state.time), ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <GamePlayer
          state={state}
          playerPosition={playerPosition}
          launchPhase={launchPhase}
          speedMultiplier={gameTweaks.speedMultiplier}
          rocketScale={gameTweaks.rocketScale}
        />

        {/* 발사된 총알 렌더링 */}
        <GameBullets bullets={bullets} />

        {/* 장애물 및 아이템 렌더링 */}
        <GameObstacles obstacles={obstacles} speedEffectIntensity={state.speedEffectIntensity} />

        {/* 파티클 이펙트 렌더링 */}
        <GameParticles particles={particles} />
      </motion.div>

      {/* 오버레이 및 모달 창 */}
      <AnimatePresence>
        {!state.gameStarted && !state.gameOver && (
          <GameMenu
            state={state}
            setDifficulty={setDifficulty}
            showStrategyModal={() =>
              setState((s) => ({ ...s, showStrategyModal: true }))
            }
            openLaunchpad={() =>
              setState((s) => ({ ...s, showLaunchpad: true }))
            }
          />
        )}

        {!state.gameStarted && !state.gameOver && state.showLaunchpad && (
          <GameLaunchpad
            state={state}
            onClose={() => setState((s) => ({ ...s, showLaunchpad: false }))}
            onUpdateCustomization={(custom) =>
              setState((s) => ({ ...s, rocketCustomization: custom }))
            }
            onLaunch={() => {
              setState((s) => ({ ...s, showLaunchpad: false }));
              startGame();
            }}
          />
        )}
      </AnimatePresence>

      <GameUpgradeScreen
        state={state}
        onUpgrade={updateUpgrade}
        onStart={() => {
          const randomFact =
            SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
          setState((prev) => ({
            ...prev,
            showUpgradeScreen: false,
            showFactScreen: true,
            currentFact: randomFact,
          }));
        }}
      />

      <GameFactOverlay
        state={state}
        startGame={() => {
          setState((prev) => ({ ...prev, showFactScreen: false }));
          setTimeout(() => startGame(), 100);
        }}
      />

      <GameGameOverOverlay
        state={state}
        relaunch={() =>
          setState((prev) => ({
            ...prev,
            showUpgradeScreen: true,
            upgradePoints: prev.upgradePoints + 1,
            isRelaunch: true,
            // 우주정거장 도킹 시 즉시 체력과 연료 완충
            health: 5 + prev.upgrades.max_health,
            fuel: 100 + prev.upgrades.fuel_capacity * 20,
          }))
        }
        getDifficultyLabel={getDifficultyLabel}
      />

      <GameMissionCompleteOverlay
        state={state}
        retryLevel={retryLevel}
        nextMission={nextMission}
        endMission={() =>
          setState((s) => ({
            ...s,
            gameStarted: false,
            missionComplete: false,
            isRelaunch: false,
          }))
        }
      />

      <GameStrategyModal
        state={state}
        closeModal={() =>
          setState((prev) => ({ ...prev, showStrategyModal: false }))
        }
      />

      <GameSettingsModal
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          if (!wasPausedBeforeSettings.current && state.gameStarted && !state.gameOver) {
            setState((prev) => ({ ...prev, isPaused: false }));
          }
        }}
        tweaks={gameTweaks}
        setTweaks={setGameTweaks}
        bgmVolume={state.bgmVolume}
        bgmTrack={state.bgmTrack}
        setState={setState}
        autoDifficulty={autoDifficulty}
      />

      {/* 하단 플로팅 컨트롤 (투명한 유리 효과) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex flex-col items-center sm:flex-row sm:items-end justify-between gap-4 px-4 sm:px-8 pb-1 z-30 pointer-events-none">
        {/* 프로토콜 정보 표시 */}
        <div className="hidden sm:flex items-center gap-3 order-2 sm:order-1 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl pointer-events-auto">
          <button
            onClick={() => {
              window.location.hash = "status";
            }}
            aria-label="Return to Mission Control"
            className="text-gray-500 hover:text-cyan-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
              Protocol
            </span>
            <span className="text-[8px] font-black text-cyan-500 uppercase">
              Space_Runner_V1.0
            </span>
          </div>
        </div>

        {/* 주요 조작 버튼 Group */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2 min-w-[280px] sm:min-w-[320px] order-1 sm:order-2 bg-black/40 backdrop-blur-md border border-white/10 p-1.5 sm:p-2 rounded-2xl pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          {state.gameStarted && !state.gameOver ? (
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  isAutoPilot: !prev.isAutoPilot,
                }))
              }
              className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border transition-all ${state.isAutoPilot
                ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
            >
              <Cpu
                className={`w-3.5 h-3.5 ${state.isAutoPilot ? "animate-pulse" : ""}`}
              />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {state.isAutoPilot ? "수동" : "자동"}
              </span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={togglePause}
            disabled={!state.gameStarted || state.gameOver}
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border transition-all ${state.isPaused
              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
              : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              } disabled:opacity-0 disabled:pointer-events-none`}
          >
            {state.isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">
                  재개
                </span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-center">
                  정지
                </span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              wasPausedBeforeSettings.current = state.isPaused;
              setShowSettingsModal(true);
              if (state.gameStarted && !state.gameOver) {
                setState((prev) => ({ ...prev, isPaused: true }));
              }
            }}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Open Tweak Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
              설정
            </span>
          </button>
        </div>

        {/* 상태 정보 표시 */}
        <div className="hidden sm:block order-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl pointer-events-auto">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Target grade:{" "}
            <span className="text-cyan-400 font-black ml-1">
              {getDifficultyLabel(state.difficulty)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── P1-B: 첫 플레이 튜토리얼 오버레이 ────────────────────────────────
           게임을 처음 시작하는 유저에게 핵심 메카닉 3가지를 안내합니다.
           탭하거나 [시작하기] 버튼을 누르면 닫히며, localStorage에 기록되어
           이후 플레이에서는 나타나지 않습니다.                                   */}
      {showTutorial && (
        <div
          className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setShowTutorial(false);
            try { localStorage.setItem("mars_tutorial_seen", "1"); } catch { /* ignore */ }
          }}
        >
          <div
            className="relative bg-gray-950/95 border border-white/15 rounded-2xl p-5 sm:p-7 max-w-sm w-[92vw] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-5 border-b border-white/10 pb-4">
              <span className="text-lg">🚀</span>
              <div>
                <div className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Space Runner V1.0</div>
                <div className="text-sm font-black text-white">미션 브리핑</div>
              </div>
            </div>

            {/* 핵심 메카닉 3가지 */}
            <div className="space-y-4">
              {/* 연료 관리 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center shrink-0 text-base">⛽</div>
                <div>
                  <div className="text-[10px] font-black text-yellow-400 uppercase tracking-wider mb-0.5">연료 관리</div>
                  <div className="text-[11px] text-gray-300 leading-relaxed">연료는 시간이 지나면 자동으로 소모됩니다. <span className="text-yellow-300 font-bold">별(★) 아이템</span>을 수집해 보충하세요. 연료가 바닥나면 게임오버!</div>
                </div>
              </div>

              {/* 회피 조작 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-base">🎯</div>
                <div>
                  <div className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-0.5">조작 방법</div>
                  <div className="text-[11px] text-gray-300 leading-relaxed">터치 또는 마우스로 화면 어디든 클릭하면 로켓이 그 위치로 이동합니다. <span className="text-cyan-300 font-bold">상하좌우 자유롭게</span> 움직일 수 있으며, DODGE 횟수가 남아있으면 한 번은 자동 회피됩니다.</div>
                </div>
              </div>

              {/* 특수 위험 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-base">⚠️</div>
                <div>
                  <div className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-0.5">특수 위험</div>
                  <div className="text-[11px] text-gray-300 leading-relaxed"><span className="text-purple-300 font-bold">블랙홀</span>은 로켓을 끌어당기고, <span className="text-orange-300 font-bold">팽창 운석</span>은 시간이 지날수록 커집니다. 처음 등장 시 경고가 표시됩니다.</div>
                </div>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => {
                setShowTutorial(false);
                try { localStorage.setItem("mars_tutorial_seen", "1"); } catch { /* ignore */ }
              }}
              className="mt-6 w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-xl text-[11px] font-black text-cyan-300 uppercase tracking-widest transition-colors"
            >
              임무 개시 →
            </button>
          </div>
        </div>
      )}

      {/* ─── P2-C: 특수 위협 첫 등장 경고 배너 ──────────────────────────────
           blackhole / expanding 최초 등장 시 3.5초간 화면 상단에 표시됩니다.    */}
      {threatWarning && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[150] pointer-events-none">
          <div className="flex items-center gap-2 bg-orange-950/90 border border-orange-500/60 rounded-xl px-4 py-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] backdrop-blur-sm animate-pulse">
            <span className="text-base">⚠️</span>
            <span className="text-[10px] sm:text-xs font-black text-orange-200 whitespace-nowrap">
              {threatWarning}
            </span>
          </div>
        </div>
      )}

      {/* ─── 별먼지 스트릭 HUD 제거됨 (배경 시스템 통합) ─── */}
    </div>
  );
}
