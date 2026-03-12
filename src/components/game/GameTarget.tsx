import React from "react";
import { motion } from "framer-motion";

interface GameTargetProps {
    position: { x: number; y: number };
}

/**
 * 🛰️ GameTarget 컴포넌트
 * 실장님의 마우스/터치 위치를 즉각적으로 보여주는 조준선입니다.
 * 로켓 본체보다 먼저 움직여 조작의 즉각성을 시각화합니다.
 */
export const GameTarget: React.FC<GameTargetProps> = ({ position }) => {
    return (
        <motion.div
            initial={false}
            animate={{
                left: `${position.x}%`,
                top: `${position.y}%`,
            }}
            transition={{
                type: "spring",
                stiffness: 1000,
                damping: 50,
                mass: 0.1,
            }}
            className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        >
            {/* 바깥쪽 회전 링 */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border border-cyan-500/30 rounded-full flex items-center justify-center relative"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400/60" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400/60" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-400/60" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-400/60" />
            </motion.div>

            {/* 안쪽 십자 조준선 */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-[1px] bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <div className="h-4 w-[1px] bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </div>

            {/* 중앙 점 */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_4px_white]" />
            </div>
        </motion.div>
    );
};
