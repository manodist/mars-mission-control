import React, { useEffect, useRef, useState } from 'react';

interface AuroraCanvasProps {
    opacity: number; // 0 = 완전 투명, 1 = 완전 표시 — 제자리 페이드 인/아웃
    time: number;    // 물결 애니메이션용
}

/**
 * 🌅 AuroraCanvas - 저비용 고품질 극광 효과
 *
 * 성능 최적화 원칙 (은하수와 동급 부하):
 *   · shadowBlur 완전 제거 → 다층 그라디언트로 글로우 모사
 *   · ctx.save/scale/restore 제거 → 수학 계산으로 대체
 *   · globalCompositeOperation 전환 없음 (source-over 고정)
 *   · 15fps 스로틀 (오로라는 느린 효과라 차이 없음)
 *   · CSS mix-blend-screen으로 GPU 레이어 혼합
 *
 * 렌더링 구조:
 *   1) 대기 광채    — 화면 전체에 깔리는 은은한 색조
 *   2) 빛 기둥들    — 수평 그라디언트를 수직으로 사용, 파형 오프셋
 *   3) 극광 입자    — 황금비 분산 빛점, 반짝임
 */
export const AuroraCanvas: React.FC<AuroraCanvasProps> = ({ opacity, time }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
    // 15fps 스로틀: 오로라는 느린 효과라 20fps 이하로도 충분히 부드러움
    const lastRenderRef = useRef<number>(0);

    useEffect(() => {
        const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        // ── 15fps 스로틀 (67ms 간격) ─────────────────────────────────────
        // 60fps 게임 루프에서 time이 바뀔 때마다 effect가 실행되지만,
        // 실제 캔버스 재렌더는 15fps만 수행 → 게임 루프 부하 없음
        const now = performance.now();
        if (now - lastRenderRef.current < 67) return;
        lastRenderRef.current = now;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { w: W, h: H } = dims;
        ctx.clearRect(0, 0, W, H);

        // 극광 색상 팔레트
        const pal: [number, number, number][] = [
            [30,  255, 130],  // 아크틱 그린
            [0,   210, 255],  // 아이스 블루
            [110,  60, 255],  // 딥 바이올렛
            [0,   255, 195],  // 일렉트릭 틸
            [220,  70, 200],  // 에테리얼 핑크
            [60,  200, 255],  // 하늘 사파이어
        ];

        const lerpC = (
            a: [number,number,number],
            b: [number,number,number],
            t: number,
        ): [number,number,number] => [
            Math.round(a[0]*(1-t) + b[0]*t),
            Math.round(a[1]*(1-t) + b[1]*t),
            Math.round(a[2]*(1-t) + b[2]*t),
        ];

        // 오로라 띠 중심과 범위
        const bandY  = H * 0.5;
        const spread = H * 0.4;

        // ══════════════════════════════════════════════════════════════════
        // PASS 1: 대기 광채 (넓고 흐릿한 색조 오버레이)
        // 수직 선형 그라디언트로 화면 전체를 오로라 분위기로
        // ══════════════════════════════════════════════════════════════════
        for (let i = 0; i < 4; i++) {
            const phase = (i / 4) * Math.PI * 2;
            const t = (Math.sin(time * 0.12 + phase) + 1) / 2;
            const [r, g, b] = lerpC(pal[i % pal.length], pal[(i+2) % pal.length], t);

            // 수직 그라디언트: 오로라 띠 영역만 빛남
            const atmTop    = bandY - spread * 0.9;
            const atmBottom = bandY + spread * 0.9;
            const atmGrad = ctx.createLinearGradient(0, atmTop, 0, atmBottom);
            atmGrad.addColorStop(0,   `rgba(${r},${g},${b}, 0)`);
            atmGrad.addColorStop(0.2, `rgba(${r},${g},${b}, 0.04)`);
            atmGrad.addColorStop(0.5, `rgba(${r},${g},${b}, 0.07)`);
            atmGrad.addColorStop(0.8, `rgba(${r},${g},${b}, 0.04)`);
            atmGrad.addColorStop(1,   `rgba(${r},${g},${b}, 0)`);

            ctx.fillStyle = atmGrad;
            ctx.fillRect(0, atmTop, W, atmBottom - atmTop);
        }

        // ══════════════════════════════════════════════════════════════════
        // PASS 2: 빛 기둥들
        // 수평 그라디언트 직사각형 (중심 밝음 → 양쪽 투명)으로 세로 빛줄기 표현
        // save/scale/restore 없음 → 순수 수학 계산
        // ══════════════════════════════════════════════════════════════════
        const RAY_COUNT = 14;

        for (let i = 0; i < RAY_COUNT; i++) {
            const phase = (i / RAY_COUNT) * Math.PI * 6;

            // 색상 사이클
            const colorT = (Math.sin(time * 0.18 + phase) + 1) / 2;
            const ci = i % pal.length;
            const ni = (i + 1) % pal.length;
            const [r, g, b] = lerpC(pal[ci], pal[ni], colorT);

            // X 위치: 두 사인파 중첩으로 유기적 흔들림
            const baseX = (i / (RAY_COUNT - 1)) * W;
            const swayX =
                Math.sin(time * 0.22 + phase)       * W * 0.055 +
                Math.sin(time * 0.09 + phase * 1.7) * W * 0.025;
            const cx = baseX + swayX;

            // 빛줄기 너비: 숨쉬듯 변동
            const halfW = W * (0.04 + Math.sin(time * 0.15 + phase) * 0.012 + 0.01);

            // 수직 범위: 각 기둥마다 약간 다른 Y 범위 (자연스러운 들쭉날쭉)
            const rayTop    = bandY - spread * (0.45 + Math.sin(phase * 1.1) * 0.1);
            const rayBottom = bandY + spread * (0.5  + Math.sin(phase * 0.8) * 0.1);

            // 밝기: 맥동
            const pulse = 0.13 + Math.sin(time * 0.55 + phase) * 0.04;

            // ── 3개 레이어 중첩으로 shadowBlur 없이 소프트 글로우 모사 ──
            // 넓은 레이어(외곽) → 중간 레이어 → 좁은 코어(가장 밝음)
            const layers: [number, number][] = [
                [halfW * 2.8, pulse * 0.25],   // 외곽: 넓고 희미
                [halfW * 1.4, pulse * 0.55],   // 중간
                [halfW * 0.5, pulse * 1.0],    // 코어: 좁고 밝음
            ];

            // 각 레이어: 수평 그라디언트 × globalAlpha(수직 구간별) = 어두운 색 없이 빛만 페이드
            for (const [lHalfW, lAlpha] of layers) {
                const hGrad = ctx.createLinearGradient(cx - lHalfW, 0, cx + lHalfW, 0);
                hGrad.addColorStop(0,    `rgba(${r},${g},${b}, 0)`);
                hGrad.addColorStop(0.25, `rgba(${r},${g},${b}, ${lAlpha * 0.4})`);
                hGrad.addColorStop(0.5,  `rgba(${r},${g},${b}, ${lAlpha})`);
                hGrad.addColorStop(0.75, `rgba(${r},${g},${b}, ${lAlpha * 0.4})`);
                hGrad.addColorStop(1,    `rgba(${r},${g},${b}, 0)`);

                // 수직 알파 페이드: 3구간(상단·본체·하단)으로 나눠 globalAlpha만 조절
            // → 어두운 색 일절 없음, 순수 빛이 서서히 스러지는 효과
            const rH  = rayBottom - rayTop;
            const fZ  = rH * 0.18; // 상하단 각 18%를 페이드 구간으로

            // 상단 페이드: 거의 투명 → 반투명
            ctx.globalAlpha = 0.25 * 0.3;
            ctx.fillStyle = hGrad;
            ctx.fillRect(cx - lHalfW, rayTop, lHalfW * 2, fZ * 0.5);

            ctx.globalAlpha = 0.25 * 0.65;
            ctx.fillStyle = hGrad;
            ctx.fillRect(cx - lHalfW, rayTop + fZ * 0.5, lHalfW * 2, fZ * 0.5);

            // 본체: 완전 불투명
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = hGrad;
            ctx.fillRect(cx - lHalfW, rayTop + fZ, lHalfW * 2, rH - fZ * 2);

            // 하단 페이드: 반투명 → 거의 투명
            ctx.globalAlpha = 0.25 * 0.65;
            ctx.fillStyle = hGrad;
            ctx.fillRect(cx - lHalfW, rayBottom - fZ, lHalfW * 2, fZ * 0.5);

            ctx.globalAlpha = 0.25 * 0.3;
            ctx.fillStyle = hGrad;
            ctx.fillRect(cx - lHalfW, rayBottom - fZ * 0.5, lHalfW * 2, fZ * 0.5);
            }
            ctx.globalAlpha = 1;
        }

        // ══════════════════════════════════════════════════════════════════
        // PASS 3: 극광 입자 (shadowBlur 없이 작은 원으로)
        // 글로우는 작은 원 + 외곽 약한 원 두 개 겹침으로 모사
        // ══════════════════════════════════════════════════════════════════
        const PARTICLE_COUNT = 30; // 80→30 으로 대폭 감소

        for (let p = 0; p < PARTICLE_COUNT; p++) {
            const seedX = (p * 137.508) % W;
            const seedY = (p * 61.803)  % 1;
            const baseY = bandY - spread * 0.5 + seedY * spread;
            const py = baseY + Math.sin(time * 0.55 + p * 1.618) * H * 0.04;

            const twinkle = (Math.sin(time * 2.8 + p * 2.399) + 1) / 2;
            if (twinkle < 0.35) continue;

            const pc = Math.floor((seedX / W) * RAY_COUNT) % pal.length;
            const [pr, pg, pb] = pal[pc];

            // 글로우 레이어 1: 큰 원, 낮은 알파
            ctx.globalAlpha = twinkle * 0.25;
            ctx.fillStyle = `rgba(${pr},${pg},${pb}, 1)`;
            ctx.beginPath();
            ctx.arc(seedX, py, 3.5 + twinkle * 2, 0, Math.PI * 2);
            ctx.fill();

            // 글로우 레이어 2: 작은 밝은 코어
            ctx.globalAlpha = twinkle * 0.9;
            ctx.fillStyle = twinkle > 0.8
                ? `rgba(220, 255, 240, 1)`
                : `rgba(${pr},${pg},${pb}, 1)`;
            ctx.beginPath();
            ctx.arc(seedX, py, 0.9 + twinkle * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

    }, [time, dims]);

    return (
        <canvas
            ref={canvasRef}
            width={dims.w}
            height={dims.h}
            className="absolute inset-0 pointer-events-none z-[2] mix-blend-screen"
            style={{ opacity }}
        />
    );
};

export const AuroraCanvasMemo = React.memo(AuroraCanvas);
