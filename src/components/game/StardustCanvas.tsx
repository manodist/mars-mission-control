import React, { useEffect, useRef, useState } from 'react';

interface Stardust {
    id: string | number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

interface StardustCanvasProps {
    time: number;
    speedEffectIntensity: number;
    baseSpeed: number;
    isPaused: boolean;
}

/**
 * 🌠 StardustCanvas 컴포넌트
 * 수많은 스타더스트 파티클을 HTML5 Canvas로 효율적으로 렌더링합니다.
 * 플레이어의 비행 속도와 진행률에 따라 스트레치(Stretch) 효과를 가미합니다.
 */
export const StardustCanvas: React.FC<StardustCanvasProps> = ({
    time,
    speedEffectIntensity,
    baseSpeed,
    isPaused,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stardustRef = useRef<Stardust[]>([]);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    // 🚀 성능 최적화: 리사이즈 이벤트를 별도로 관리 (useEffect 루프에서 분리)
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 초기 파티클 생성
    useEffect(() => {
        const initialParticles: Stardust[] = [];
        for (let i = 0; i < 40; i++) {
            initialParticles.push({
                id: Math.random(),
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 1 + Math.random() * 2,
                speed: baseSpeed * (0.35 + Math.random() * 0.30),
                opacity: 0.2 + Math.random() * 0.5
            });
        }
        stardustRef.current = initialParticles;
    }, [baseSpeed]);

    // 렌더링 루프
    useEffect(() => {
        if (isPaused || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = dimensions;

        // 파티클 업데이트 및 렌더링
        ctx.clearRect(0, 0, width, height);

        const isHighSpeed = speedEffectIntensity > 0.3;
        ctx.lineWidth = isHighSpeed ? 2 : 1;

        stardustRef.current.forEach(p => {
            const currentSpeed = p.speed + (speedEffectIntensity * 0.4);
            p.y += currentSpeed;

            if (p.y > 105) {
                p.y = -5;
                p.x = Math.random() * 100;
            }

            const pxX = (p.x / 100) * width;
            const pxY = (p.y / 100) * height;
            const stretch = isHighSpeed ? (10 + speedEffectIntensity * 40) : 2;

            ctx.beginPath();
            ctx.globalAlpha = p.opacity;

            // 모든 스타더스트를 Cyan/Indigo 톤으로 일관되게 표현
            ctx.strokeStyle = '#67e8f9'; // Cyan 300
            ctx.moveTo(pxX, pxY);
            ctx.lineTo(pxX, pxY - stretch);

            ctx.stroke();
        });

        // 🚀 고강도 최적화: 속도가 빠를수록 입자 개수를 줄여 렌더링 부하 절감 (가변 밀도 제어)
        const targetMaxCount = Math.floor(40 - (speedEffectIntensity * 20)); // 평상시 40개 -> 초고속 시 20개

        if (stardustRef.current.length > targetMaxCount) {
            // 개수가 넘칠 경우 뒤(오래된 입자)부터 제거
            stardustRef.current = stardustRef.current.slice(-targetMaxCount);
        }

        // 입자 생성 확률도 현재 개수에 맞춰 동적으로 조절
        const spawnProbability = stardustRef.current.length < targetMaxCount ? 0.15 : 0;
        if (Math.random() < spawnProbability) {
            stardustRef.current.push({
                id: Math.random(),
                x: Math.random() * 100,
                y: -5,
                size: 1 + Math.random() * 1.5,
                speed: baseSpeed * (0.35 + Math.random() * 0.30),
                opacity: 0.2 + Math.random() * 0.5
            });
        }
    }, [time, speedEffectIntensity, isPaused, baseSpeed, dimensions]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            width={dimensions.width}
            height={dimensions.height}
            style={{
                width: '100%',
                height: '100%',
                zIndex: 5,
                filter: speedEffectIntensity > 0.5 ? `blur(${Math.min(2, (speedEffectIntensity - 0.5) * 4)}px)` : 'none'
            }}
        />
    );
};

export const StardustCanvasMemo = React.memo(StardustCanvas);
