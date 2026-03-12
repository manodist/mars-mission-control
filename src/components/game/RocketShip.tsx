import React from 'react';

interface RocketShipProps {
    className?: string;
    color?: string;
    isDodgeFlashing?: boolean;
}

export const RocketShip = React.memo(({ className, color = '#e2e8f0', isDodgeFlashing = false }: RocketShipProps) => {
    return (
        <svg
            viewBox="0 0 24 24"
            className={`overflow-visible ${className || ''}`}
        >
            <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                </linearGradient>
            </defs>

            {/* Engine Nozzles */}
            <path d="M9 19 L11 22 L13 22 L15 19 Z" fill="#334155" />
            <rect x="10" y="19" width="4" height="1" fill="#1e293b" />

            {/* Left Wing */}
            <path d="M9 14 L4 19 L9 18 Z" fill={color} stroke="#475569" strokeWidth="0.5" />
            <path d="M9 14 L4 19 L9 18 Z" fill="url(#bodyGrad)" />

            {/* Right Wing */}
            <path d="M15 14 L20 19 L15 18 Z" fill={color} stroke="#475569" strokeWidth="0.5" />
            <path d="M15 14 L20 19 L15 18 Z" fill="url(#bodyGrad)" />

            {/* Main Fuselage - Angular & Sleek */}
            <path
                d="M12 2 L16 10 L16 18 L14 19 L10 19 L8 18 L8 10 Z"
                fill={color}
                stroke={isDodgeFlashing ? "#fb923c" : "#94a3b8"}
                strokeWidth="1"
            />
            <path d="M12 2 L16 10 L16 18 L14 19 L10 19 L8 18 L8 10 Z" fill="url(#bodyGrad)" />

            {/* Cockpit Window */}
            <path d="M10.5 8 L13.5 8 L14 11 L10 11 Z" fill="#06b6d4" stroke="#0891b2" strokeWidth="0.5" />
            <path d="M10.5 8 L13.5 8 L14 11 L10 11 Z" fill="rgba(255,255,255,0.4)" />

            {/* Vertical Stabilizer / Detail Lines */}
            <path d="M12 4 L12 18" stroke="#cbd5e1" strokeWidth="0.5" strokeOpacity="0.5" />
            <line x1="8" y1="14" x2="16" y2="14" stroke="#cbd5e1" strokeWidth="0.5" strokeOpacity="0.5" />
        </svg>
    );
});
