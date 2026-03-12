import React from 'react';
import type { Bullet } from '../../types/game';
import './GameBullets.css';

interface GameBulletsProps {
    bullets: Bullet[];
}

// 🚀 성능 최적화: motion.div → 순수 div + inline style
// 총알의 초기 fade-in (0.1초)은 성능 대비 효과가 미미하므로 제거.
// 총알은 빠르게 이동하므로 fade-in이 거의 인식 불가능합니다.
export const GameBullets = React.memo(({ bullets }: GameBulletsProps) => {
    return (
        <>
            {bullets.map(b => (
                <div
                    key={b.id}
                    className="game-bullet"
                    style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        // width and height are now handled by CSS classes based on power
                    }}
                    data-power={b.power} // Pass power as a data attribute for CSS styling
                >
                    {/* Core Highlight */}
                    <div className="game-bullet-core" />
                </div>
            ))}
        </>
    );
});
