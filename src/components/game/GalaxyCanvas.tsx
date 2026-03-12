import React, { useEffect, useRef, useState } from 'react';

interface GalaxyCanvasProps {
    // 스크롤 진행도: 0 = 화면 위에서 진입, 0.5 = 화면 중앙 통과, 1 = 화면 아래로 퇴장
    scrollY: number;
    time: number; // 별 반짝임 애니메이션용
}

interface StarPoint {
    x: number;         // 0~1 (정규화 좌표)
    y: number;
    size: number;
    brightness: number;
    twinkleOffset: number; // 별마다 다른 위상으로 반짝임
    color: string;
}

/**
 * 🌌 GalaxyCanvas 컴포넌트
 * 모든 난이도에서 은하수가 화면 상단에서 하단으로 서서히 흘러 지나가는 효과입니다.
 * CSS transform translateY로 스크롤 위치를 제어하고,
 * Canvas는 별 반짝임 등 내부 렌더링만 담당합니다.
 */
export const GalaxyCanvas: React.FC<GalaxyCanvasProps> = ({ scrollY, time }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<StarPoint[]>([]);
    const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

    // 별점 초기화 (마운트 시 한 번만 생성 → 위치 고정)
    useEffect(() => {
        // 은하수 특유의 색상 팔레트 (청백색, 연보라, 연핑크)
        const starColors = [
            '#ffffff', '#f0f4ff', '#dde8ff',
            '#c8d8ff', '#b8c4ff', '#d8b8ff', '#ffcce0',
        ];

        const stars: StarPoint[] = [];

        // 은하수 밴드 별들 (밴드를 따라 집중 분포, 700개)
        for (let i = 0; i < 700; i++) {
            const x = Math.random();
            // 은하수 밴드: 왼쪽 아래 → 오른쪽 위 방향 (-20도 기울기)
            const bandCenterY = 0.52 + (x - 0.5) * (-Math.tan(Math.PI / 9));
            // 밴드 가장자리로 갈수록 두께가 넓어짐 (자연스러운 퍼짐)
            const edgeDist = Math.abs(x - 0.5) * 2; // 0(중앙) ~ 1(가장자리)
            const spread = 0.04 + edgeDist * 0.08 + Math.random() * 0.06;
            const y = bandCenterY + (Math.random() - 0.5) * spread;

            stars.push({
                x,
                y,
                size: 0.3 + Math.random() * 1.8,
                brightness: 0.35 + Math.random() * 0.65,
                twinkleOffset: Math.random() * Math.PI * 2,
                color: starColors[Math.floor(Math.random() * starColors.length)],
            });
        }

        // 배경 산개 별들 (화면 전체, 250개)
        for (let i = 0; i < 250; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random(),
                size: 0.2 + Math.random() * 0.9,
                brightness: 0.08 + Math.random() * 0.25,
                twinkleOffset: Math.random() * Math.PI * 2,
                color: '#e8efff',
            });
        }

        starsRef.current = stars;
    }, []);

    // 리사이즈 감지
    useEffect(() => {
        const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // 은하수 렌더링 (내부 opacity 없음 → CSS opacity로 전체 페이드 관리)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { w: W, h: H } = dims;
        ctx.clearRect(0, 0, W, H);

        const cx = W * 0.5;
        const cy = H * 0.5;

        // 1. 은하수 핵 (밝은 중심부 - 납작한 타원으로 표현)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 9); // -20도 기울기
        ctx.scale(1, 0.15);       // 납작한 타원 (은하수 모양)
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.5);
        coreGrad.addColorStop(0,    'rgba(230, 240, 255, 0.22)');
        coreGrad.addColorStop(0.08, 'rgba(200, 215, 255, 0.18)');
        coreGrad.addColorStop(0.25, 'rgba(160, 180, 255, 0.11)');
        coreGrad.addColorStop(0.55, 'rgba(120, 145, 230, 0.05)');
        coreGrad.addColorStop(1,    'rgba(80, 110, 200, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, W * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. 은하수 외곽 퍼짐 (더 넓고 흐릿한 레이어)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-Math.PI / 9);
        ctx.scale(1, 0.08);
        const outerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.65);
        outerGrad.addColorStop(0,   'rgba(180, 200, 255, 0.10)');
        outerGrad.addColorStop(0.4, 'rgba(140, 160, 230, 0.06)');
        outerGrad.addColorStop(1,   'rgba(100, 130, 210, 0)');
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, W * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3. 성운 패치 (Nebula spots - 색감 포인트)
        const nebulae = [
            { rx: 0.28, ry: 0.44, color: [140, 110, 255], r: W * 0.11 }, // 보라 성운
            { rx: 0.62, ry: 0.56, color: [60,  200, 255], r: W * 0.09 }, // 청록 성운
            { rx: 0.50, ry: 0.40, color: [255, 130, 190], r: W * 0.07 }, // 핑크 성운 (은하 핵 근처)
            { rx: 0.18, ry: 0.60, color: [80,  150, 255], r: W * 0.07 }, // 파랑 성운
            { rx: 0.78, ry: 0.42, color: [180, 100, 255], r: W * 0.06 }, // 연보라 성운
        ];
        nebulae.forEach(n => {
            const nx = n.rx * W;
            const ny = n.ry * H;
            const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r);
            g.addColorStop(0,   `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0.09)`);
            g.addColorStop(0.5, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0.04)`);
            g.addColorStop(1,   `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 4. 별점 렌더링 (반짝임 포함, 전체 투명도는 CSS opacity 담당)
        starsRef.current.forEach(s => {
            const px = s.x * W;
            const py = s.y * H;
            // 별마다 다른 속도와 위상으로 반짝임
            const twinkle = 0.7 + Math.sin(time * 1.8 + s.twinkleOffset) * 0.3;
            const finalAlpha = s.brightness * twinkle; // CSS opacity가 전체 페이드를 담당
            if (finalAlpha < 0.02) return; // 너무 흐리면 스킵

            ctx.globalAlpha = finalAlpha;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(px, py, s.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
    }, [time, dims]); // scrollY 제거: 위치/페이드는 CSS transform/opacity가 담당

    // 스크롤 진행도(0~1)에서 CSS 속성 계산
    // scrollY=0 → translateY(-100%) : 화면 바로 위 (진입 직전)
    // scrollY=0.5 → translateY(0%)  : 화면 정중앙 (완전 통과)
    // scrollY=1 → translateY(+100%) : 화면 바로 아래 (완전 퇴장)
    const translateYPct = (scrollY - 0.5) * 200;

    // 진입/퇴장 구간에서 부드럽게 페이드
    const cssOpacity =
        scrollY < 0.12 ? scrollY / 0.12 :        // 진입 페이드 인 (0 → 0.12)
        scrollY > 0.88 ? (1 - scrollY) / 0.12 :  // 퇴장 페이드 아웃 (0.88 → 1)
        1;                                         // 화면 중앙 통과 중 완전 표시

    return (
        <canvas
            ref={canvasRef}
            width={dims.w}
            height={dims.h}
            className="absolute inset-0 pointer-events-none"
            style={{
                zIndex: 1,                                  // 배경별(z-0) 위, 스타더스트(z-5) 아래
                transform: `translateY(${translateYPct}%)`, // 스크롤 위치
                opacity: cssOpacity,                        // 진입/퇴장 페이드
            }}
        />
    );
};

export const GalaxyCanvasMemo = React.memo(GalaxyCanvas);
