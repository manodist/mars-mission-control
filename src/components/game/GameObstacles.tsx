import React, { useEffect, useRef } from 'react';
import type { Obstacle } from '../../types/game';

interface GameObstaclesProps {
    obstacles: Obstacle[];
    speedEffectIntensity?: number; // 고속 효과 강도 (0~1, 현재 미사용)
}

/**
 * 🚀 하이엔드 최적화: Offscreen Sprite 캐싱 & Canvas 렌더러
 * 장애물의 복잡한 디자인을 매 프레임 그리지 않고, 오프스크린 캔버스에 미리 그려둔 후
 * 실제 게임 캔버스로 복사(Copy)만 하는 방식을 사용합니다.
 * 이를 통해 120Hz+ 하이엔드 모니터에서도 안정적인 프레임을 보장합니다.
 */
export const GameObstacles = React.memo(({ obstacles }: GameObstaclesProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spriteCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

    // 🎨 오프스크린 스프라이트 생성기
    const getCachedSprite = (type: string, size: number, variant?: string, color?: string): HTMLCanvasElement | null => {
        const cacheKey = `${type}-${size}-${variant}-${color}`;
        if (spriteCacheRef.current.has(cacheKey)) {
            return spriteCacheRef.current.get(cacheKey)!;
        }

        // 캐시 크기 관리 (너무 많아지면 비우기)
        if (spriteCacheRef.current.size > 120) {
            spriteCacheRef.current.clear();
        }

        const offCanvas = document.createElement('canvas');
        const padding = 20; // 글로우 효과 등을 위한 여백
        const totalSize = size + padding * 2;
        offCanvas.width = totalSize;
        offCanvas.height = totalSize;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) return null;

        const center = totalSize / 2;
        const radius = size / 2;

        ctx.translate(center, center);

        // --- 장애물 종류별 드로잉 로직 (기존 CSS 디자인 완벽 재현) ---
        if (type === 'asteroid') {
            const colors = {
                brown: { base: '#8D6E63', border: '#4E342E', crater: 'rgba(62, 39, 35, 0.5)' },
                red: { base: '#991b1b', border: '#450a0a', crater: 'rgba(69, 10, 10, 0.5)' },
                dark: { base: '#1e293b', border: '#000000', crater: 'rgba(0, 0, 0, 0.6)' },
                gray: { base: '#6b7280', border: '#1f2937', crater: 'rgba(17, 24, 39, 0.5)' }
            };
            const c = colors[variant as keyof typeof colors] || colors.gray;

            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.fillStyle = c.base;
            ctx.strokeStyle = c.border;
            ctx.lineWidth = 4;
            ctx.rotate(Math.PI / 4);

            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = c.crater;
            ctx.beginPath(); ctx.arc(-radius * 0.4, -radius * 0.4, radius * 0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(radius * 0.3, radius * 0.3, radius * 0.3, 0, Math.PI * 2); ctx.fill();
        }
        else if (type === 'debris') {
            ctx.fillStyle = '#18181b';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
            ctx.beginPath();
            const points = [{ x: -0.4, y: -1 }, { x: 0.8, y: -0.6 }, { x: 1, y: 0.4 }, { x: 0.2, y: 1 }, { x: -0.8, y: 0.6 }, { x: -1, y: -0.2 }];
            points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x * radius, p.y * radius) : ctx.lineTo(p.x * radius, p.y * radius));
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; ctx.lineWidth = 1; ctx.stroke();
        }
        else if (type === 'fireball') {
            const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius + 8);
            grad.addColorStop(0, '#ea580c'); grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, radius + 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#dc2626'; ctx.strokeStyle = '#9a3412'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        else if (type === 'satellite') {
            // 🛰️🔥 고장난 인공위성 - 불타는 위험 장애물
            // 0. 배경 불꽃 후광 (위험 분위기 조성)
            const fireGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.5);
            fireGlow.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
            fireGlow.addColorStop(0.5, 'rgba(220, 38, 38, 0.2)');
            fireGlow.addColorStop(1, 'rgba(220, 38, 38, 0)');
            ctx.fillStyle = fireGlow;
            ctx.beginPath(); ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2); ctx.fill();

            // 1. 몸체 (Main Body - Diagonal)
            ctx.rotate(-Math.PI / 4);

            // 그을린 몸체 (원래 회색 → 검게 탄 느낌)
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(251, 146, 60, 0.8)';
            ctx.fillStyle = '#78716c'; // 그을린 회색
            ctx.strokeStyle = '#292524'; // 탄 테두리 (거의 검정)
            ctx.lineWidth = 2;

            const bodyW = radius * 0.8;
            const bodyH = radius * 1.4;
            ctx.beginPath();
            ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 5);
            ctx.fill();
            ctx.stroke();

            // 몸체 열 손상 무늬 (불탄 자국)
            ctx.fillStyle = '#44403c';
            ctx.fillRect(-bodyW / 4, -bodyH / 4, bodyW / 2, bodyH / 2);
            ctx.strokeStyle = '#1c1917'; ctx.lineWidth = 1;
            ctx.strokeRect(-bodyW / 4, -bodyH / 4, bodyW / 2, bodyH / 2);

            ctx.shadowBlur = 0;

            // 2. 태양광 패널 (망가진 상태)
            ctx.fillStyle = '#1e3a5f'; // 탄 패널 (어두운 블루)
            ctx.strokeStyle = '#fb923c'; // 불꽃 테두리
            ctx.lineWidth = 1;

            // 좌측 패널 (부분 파손)
            ctx.beginPath();
            ctx.rect(-bodyW / 2 - radius * 1.2, -radius * 0.3, radius * 1.2, radius * 0.6);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-bodyW / 2 - radius * 0.6, -radius * 0.3); ctx.lineTo(-bodyW / 2 - radius * 0.6, radius * 0.3);
            ctx.stroke();

            // 우측 패널
            ctx.beginPath();
            ctx.rect(bodyW / 2, -radius * 0.3, radius * 1.2, radius * 0.6);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(bodyW / 2 + radius * 0.6, -radius * 0.3); ctx.lineTo(bodyW / 2 + radius * 0.6, radius * 0.3);
            ctx.stroke();

            // 3. 파라볼라 안테나 (손상됨)
            ctx.fillStyle = '#78716c';
            ctx.strokeStyle = '#fb923c';
            ctx.beginPath();
            ctx.arc(0, -bodyH / 2 - radius * 0.2, radius * 0.5, Math.PI, 0);
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = '#fb923c';
            ctx.beginPath();
            ctx.moveTo(0, -bodyH / 2 - radius * 0.7);
            ctx.lineTo(0, -bodyH / 2 - radius * 0.9);
            ctx.stroke();

            ctx.fillStyle = '#ef4444'; // 빨간 경고등
            ctx.shadowBlur = 8; ctx.shadowColor = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -bodyH / 2 - radius * 0.9, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // 4. 불꽃 파편 (몸체에 붙은 불)
            ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
            ctx.shadowBlur = 8; ctx.shadowColor = '#f97316';
            ctx.beginPath(); ctx.ellipse(-bodyW * 0.1, bodyH * 0.35, 3, 5, -0.3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( bodyW * 0.2, bodyH * 0.2, 2, 4, 0.4, 0, Math.PI * 2); ctx.fill();
        }
        else if (type === 'hourglass') {
            // ⏳ 모래시계 디자인 (시간 정지 아이템)
            const grad = ctx.createLinearGradient(0, -radius, 0, radius);
            grad.addColorStop(0, '#22d3ee'); // Cyan top
            grad.addColorStop(0.5, '#ffffff');
            grad.addColorStop(1, '#22d3ee'); // Cyan bottom

            ctx.fillStyle = grad;
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';

            // 상단 삼각형
            ctx.beginPath();
            ctx.moveTo(-radius * 0.8, -radius * 0.8);
            ctx.lineTo(radius * 0.8, -radius * 0.8);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();

            // 하단 삼각형
            ctx.beginPath();
            ctx.moveTo(-radius * 0.8, radius * 0.8);
            ctx.lineTo(radius * 0.8, radius * 0.8);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();

            // 모래 효과 (노란색 점)
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(0, radius * 0.4, 3, 0, Math.PI * 2);
            ctx.fill();

            // 테두리
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        else if (type === 'wrench') {
            // 🛠️ 수리 키트 디자인 (렌치)
            ctx.fillStyle = '#94a3b8'; // Slate metal
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.5)'; // 수리 느낌의 붉은 광채

            // 핸들
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-radius * 0.2, -radius * 0.8, radius * 0.4, radius * 1.6);

            // 상단 머리 (C-shape)
            ctx.beginPath();
            ctx.arc(0, -radius * 0.7, radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 머리 자르기 (렌치 입)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(-radius * 0.2, -radius * 1.2);
            ctx.lineTo(radius * 0.2, -radius * 1.2);
            ctx.lineTo(radius * 0.2, -radius * 0.6);
            ctx.lineTo(-radius * 0.2, -radius * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
        else if (type === 'bolt') {
            // ⚡ 연료 아이템 (번개 모양)
            ctx.fillStyle = '#facc15';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#eab308';

            ctx.beginPath();
            ctx.moveTo(radius * 0.2, -radius);
            ctx.lineTo(-radius * 0.4, radius * 0.1);
            ctx.lineTo(radius * 0.1, radius * 0.1);
            ctx.lineTo(-radius * 0.2, radius);
            ctx.lineTo(radius * 0.4, -radius * 0.1);
            ctx.lineTo(-radius * 0.1, -radius * 0.1);
            ctx.closePath();

            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        else if (type === 'crystal') {
            ctx.fillStyle = '#22d3ee'; ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
            ctx.rotate(Math.PI / 4); ctx.fillRect(-radius * 0.6, -radius * 0.6, radius * 1.2, radius * 1.2);
            ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.strokeRect(-radius * 0.6, -radius * 0.6, radius * 1.2, radius * 1.2);
        }
        else if (type === 'shield') {
            // 🛡️ 보호막 아이템 - 실제 방패 형태 + 에너지 문양

            // 방패 외곽선 그리기 함수 (위 아치 + 아래 뾰족)
            const drawShield = () => {
                ctx.beginPath();
                ctx.moveTo(-radius * 0.85, -radius * 0.55); // 좌상단 시작
                // 상단 아치 (bezier 곡선)
                ctx.bezierCurveTo(
                    -radius * 0.85, -radius * 1.05,  // 좌측 제어점
                     radius * 0.85, -radius * 1.05,  // 우측 제어점
                     radius * 0.85, -radius * 0.55   // 우상단 끝
                );
                // 우측 내려오기
                ctx.lineTo(radius * 0.85, radius * 0.25);
                // 오른쪽 아래 → 하단 뾰족
                ctx.bezierCurveTo(
                    radius * 0.85,  radius * 0.65,
                    radius * 0.35,  radius * 0.95,
                    0,              radius * 1.0
                );
                // 하단 뾰족 → 왼쪽 아래
                ctx.bezierCurveTo(
                    -radius * 0.35, radius * 0.95,
                    -radius * 0.85, radius * 0.65,
                    -radius * 0.85, radius * 0.25
                );
                ctx.closePath();
            };

            // 1. 배경 글로우 (넓게 퍼지는 에너지장)
            const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.4);
            outerGlow.addColorStop(0, 'rgba(52, 211, 153, 0.3)');
            outerGlow.addColorStop(0.6, 'rgba(16, 185, 129, 0.15)');
            outerGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath(); ctx.arc(0, 0, radius * 1.4, 0, Math.PI * 2); ctx.fill();

            // 2. 방패 본체 (그라디언트 충전)
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#10b981';
            const bodyGrad = ctx.createLinearGradient(0, -radius, 0, radius);
            bodyGrad.addColorStop(0,   'rgba(110, 231, 183, 0.75)'); // 밝은 민트 (상단)
            bodyGrad.addColorStop(0.4, 'rgba(52,  211, 153, 0.6)');
            bodyGrad.addColorStop(1,   'rgba(6,   95,  70,  0.7)');  // 짙은 초록 (하단)
            ctx.fillStyle = bodyGrad;
            drawShield();
            ctx.fill();

            // 3. 방패 테두리 (광채)
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#34d399';
            ctx.strokeStyle = 'rgba(167, 243, 208, 0.95)';
            ctx.lineWidth = 2;
            drawShield();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // 4. 방패 내부 문양 (에너지 격자)
            ctx.strokeStyle = 'rgba(167, 243, 208, 0.5)';
            ctx.lineWidth = 1;
            // 세로 중앙선
            ctx.beginPath();
            ctx.moveTo(0, -radius * 0.9);
            ctx.lineTo(0,  radius * 0.85);
            ctx.stroke();
            // 가로 중간선
            ctx.beginPath();
            ctx.moveTo(-radius * 0.72, -radius * 0.1);
            ctx.lineTo( radius * 0.72, -radius * 0.1);
            ctx.stroke();

            // 5. 중앙 에너지 결정체 (다이아몬드)
            ctx.fillStyle = 'rgba(167, 243, 208, 0.9)';
            ctx.shadowBlur = 10; ctx.shadowColor = '#6ee7b7';
            ctx.beginPath();
            ctx.moveTo(0,               -radius * 0.28); // 상단 꼭지
            ctx.lineTo( radius * 0.18,  -radius * 0.1);  // 우
            ctx.lineTo(0,                radius * 0.08);  // 하단
            ctx.lineTo(-radius * 0.18,  -radius * 0.1);  // 좌
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        else if (type === 'star') {
            // ⚡ 연료 아이템 - 번개 모양 (전기 에너지 느낌)
            // 바깥쪽 방사형 글로우 후광 (노란 후광 원)
            const bgGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.3);
            bgGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
            bgGrad.addColorStop(0.6, 'rgba(234, 179, 8, 0.2)');
            bgGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
            ctx.fillStyle = bgGrad;
            ctx.beginPath(); ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2); ctx.fill();

            // 번개 본체 (두 겹으로 그려서 외곽선 효과)
            ctx.shadowBlur = 22;
            ctx.shadowColor = '#fde047';

            // 바깥 테두리 (흰색 광채)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.moveTo(radius * 0.28, -radius * 0.95);
            ctx.lineTo(-radius * 0.50, radius * 0.08);
            ctx.lineTo(radius * 0.10, radius * 0.08);
            ctx.lineTo(-radius * 0.28, radius * 0.95);
            ctx.lineTo(radius * 0.50, -radius * 0.08);
            ctx.lineTo(-radius * 0.10, -radius * 0.08);
            ctx.closePath();
            ctx.fill();

            // 안쪽 번개 본체 (노란색)
            ctx.fillStyle = '#facc15';
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(radius * 0.25,  -radius * 0.90);
            ctx.lineTo(-radius * 0.44,  radius * 0.06);
            ctx.lineTo(radius * 0.08,   radius * 0.06);
            ctx.lineTo(-radius * 0.25,  radius * 0.90);
            ctx.lineTo(radius * 0.44,  -radius * 0.06);
            ctx.lineTo(-radius * 0.08, -radius * 0.06);
            ctx.closePath();
            ctx.fill();
        }
        else if (type === 'blackhole') {
            ctx.fillStyle = 'black'; ctx.shadowBlur = 25; ctx.shadowColor = 'rgba(147, 51, 234, 0.6)';
            ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2); ctx.stroke();
        }
        else {
            ctx.fillStyle = color || '#6366f1'; ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(99, 102, 241, 0.8)';
            ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'white'; ctx.lineWidth = 1; ctx.stroke();
        }

        spriteCacheRef.current.set(cacheKey, offCanvas);
        return offCanvas;
    };

    useEffect(() => {
        let animationFrameId: number;

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d', { alpha: true });
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
            }

            ctx.clearRect(0, 0, rect.width, rect.height);
            const time = Date.now() / 1000;

            obstacles.forEach(obs => {
                const sprite = getCachedSprite(obs.type, obs.size, obs.variant, (obs as { color?: string }).color);
                if (!sprite) return;

                const px = (obs.x * rect.width) / 100;
                const py = (obs.y * rect.height) / 100;

                // 투명도 계산: 블랙홀(성장 페이드인 + 하단 페이드아웃) / 팽창 소행성 / 기본값 1
                let opacity = 1;
                if (obs.type === 'blackhole') {
                    if (obs.y > 85) {
                        // 화면 하단(y > 85%) 진입 시 서서히 사라짐 → y=110%에서 완전 투명
                        opacity = Math.max(0, 1 - (obs.y - 85) / 25);
                    } else if (obs.targetSize && obs.size < obs.targetSize) {
                        // 성장 중: 크기에 비례해 점점 뚜렷해짐 (0.2 → 1.0)
                        opacity = Math.min(1, (obs.size - 5) / (obs.targetSize - 5) + 0.2);
                    }
                    // 완전 성장 + 페이드아웃 구간 아님 → opacity = 1 (기본값 유지)
                } else if (obs.targetSize) {
                    // 팽창 소행성: 크기 성장에 따라 점점 뚜렷해짐
                    opacity = Math.min(1, (obs.size - 5) / (obs.targetSize - 5) + 0.2);
                }

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.translate(px, py);

                if (obs.angle) ctx.rotate((obs.angle * Math.PI) / 180);

                const drawSize = sprite.width / dpr;
                ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);

                // --- 동적 효과 (애니메이션 오버레이) ---
                if (obs.type === 'shield') {
                    // 🛡️ 보호막 - 에너지 파동 + 회전 링 애니메이션
                    const pulseT = (time * 1.8) % 1;          // 0→1 반복 (파동 확장)
                    const pulse2T = ((time * 1.8) + 0.5) % 1; // 0.5 위상차 (교번 파동)

                    // 첫 번째 에너지 파동 링
                    const ring1R = (obs.size / 2 + 4) + pulseT * (obs.size * 0.35);
                    ctx.strokeStyle = `rgba(52, 211, 153, ${(1 - pulseT) * 0.7})`;
                    ctx.lineWidth = 1.5;
                    ctx.shadowBlur = 8; ctx.shadowColor = '#10b981';
                    ctx.beginPath(); ctx.arc(0, 0, ring1R, 0, Math.PI * 2); ctx.stroke();

                    // 두 번째 에너지 파동 링 (교번)
                    const ring2R = (obs.size / 2 + 4) + pulse2T * (obs.size * 0.35);
                    ctx.strokeStyle = `rgba(110, 231, 183, ${(1 - pulse2T) * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.arc(0, 0, ring2R, 0, Math.PI * 2); ctx.stroke();

                    // 중앙 결정체 빛남 (사인파 밝기 변화)
                    const coreGlow = 0.5 + Math.sin(time * 4) * 0.5;
                    ctx.fillStyle = `rgba(167, 243, 208, ${coreGlow * 0.6})`;
                    ctx.shadowBlur = 12 + coreGlow * 8; ctx.shadowColor = '#6ee7b7';
                    ctx.beginPath(); ctx.arc(0, -obs.size * 0.09, obs.size * 0.07, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }
                else if (obs.type === 'star') {
                    // ⚡ 연료 아이템 - 전기 방전 애니메이션 효과
                    const pulseScale = 0.85 + Math.sin(time * 6) * 0.15; // 번개 주변 박동 링
                    const sparkOpacity = 0.4 + Math.abs(Math.sin(time * 8)) * 0.6; // 전기 번쩍임

                    // 박동하는 전기 링
                    ctx.strokeStyle = `rgba(253, 224, 71, ${sparkOpacity * 0.6})`;
                    ctx.lineWidth = 1.5;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#fde047';
                    ctx.beginPath();
                    ctx.arc(0, 0, (obs.size / 2 + 6) * pulseScale, 0, Math.PI * 2);
                    ctx.stroke();

                    // 전기 스파크 (짧은 선분 4방향)
                    if (sparkOpacity > 0.8) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${sparkOpacity * 0.7})`;
                        ctx.lineWidth = 1;
                        const sparkLen = obs.size * 0.18;
                        const dist = obs.size * 0.6;
                        [[0, -dist, 0, -dist - sparkLen], [0, dist, 0, dist + sparkLen],
                         [-dist, 0, -dist - sparkLen, 0], [dist, 0, dist + sparkLen, 0]].forEach(([x1, y1, x2, y2]) => {
                            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                        });
                    }
                }
                else if (obs.type === 'satellite') {
                    // 🔥 고장난 인공위성 - 불꽃 + 경고 비콘 동적 효과
                    ctx.save();
                    // 인공위성이 -45도 회전되어 있으므로 좌표계 보정
                    ctx.rotate(-Math.PI / 4);

                    const bodyH = obs.size * 0.7; // getCachedSprite의 bodyH 기준

                    // 흔들리는 불꽃 파티클 (매 프레임 랜덤 위치로 자연스러운 화염 효과)
                    const flamePoints = [
                        { x: -obs.size * 0.1, y: bodyH * 0.5 },
                        { x:  obs.size * 0.15, y: bodyH * 0.35 },
                        { x:  obs.size * 0.0,  y: bodyH * 0.45 },
                    ];
                    flamePoints.forEach((fp, i) => {
                        const flicker = Math.sin(time * 12 + i * 2.1) * 0.5 + 0.5;
                        const flameH = (3 + flicker * 5) * (obs.size / 40);
                        const grad = ctx.createLinearGradient(fp.x, fp.y, fp.x, fp.y - flameH * 2);
                        grad.addColorStop(0, `rgba(251, 146, 60, ${0.7 + flicker * 0.3})`);
                        grad.addColorStop(0.5, `rgba(239, 68, 68, ${0.5 + flicker * 0.3})`);
                        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
                        ctx.fillStyle = grad;
                        ctx.shadowBlur = 8 + flicker * 6;
                        ctx.shadowColor = '#f97316';
                        ctx.beginPath();
                        ctx.ellipse(fp.x, fp.y - flameH * 0.5, (1.5 + flicker) * (obs.size / 40), flameH, 0, 0, Math.PI * 2);
                        ctx.fill();
                    });
                    ctx.shadowBlur = 0;

                    // 경고 비콘 - 빨간 경고등 깜빡임 (0.5초 주기)
                    const beaconPhase = Math.floor(time * 3) % 2;
                    if (beaconPhase === 0) {
                        // 전파 확산 링 (위험 신호)
                        const waveScale = (time * 2.5) % 1;
                        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - waveScale})`;
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.arc(0, -obs.size * 1.15, 14 * waveScale, -Math.PI * 0.8, -Math.PI * 0.2);
                        ctx.stroke();

                        // 빨간 비콘 점
                        ctx.fillStyle = '#ef4444';
                        ctx.shadowBlur = 12; ctx.shadowColor = '#ef4444';
                        ctx.beginPath();
                        ctx.arc(0, -obs.size * 1.15, 3.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                    ctx.restore();
                }

                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [obstacles]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{ imageRendering: 'auto' }}
        />
    );
});
