import React, { useEffect, useState, useRef } from 'react';
import { SPLASH_CONFIG } from '../constants';
import { SplashScreenStatus } from '../types';

/**
 * SplashScreen Component
 * 
 * Displays the initial loading screen with a logo and background text.
 * Handles the transition animation where the logo scales and moves
 * to the position of the navbar logo ("Zoom to Navbar" effect).
 */
const SplashScreen: React.FC = () => {
    const [status, setStatus] = useState<SplashScreenStatus>('idle');
    const [logoStyle, setLogoStyle] = useState<React.CSSProperties>({});
    const logoRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        // Ensure scroll starts at the top
        window.scrollTo(0, 0);

        const initAnimation = () => {
            const target = document.getElementById(SPLASH_CONFIG.NAVBAR_LOGO_ID);
            const source = logoRef.current;

            if (!target || !source) {
                // Fallback: If elements aren't found, just fade out
                setStatus('hidden');
                document.body.classList.add('bg-pattern-loaded');
                return;
            }

            const targetRect = target.getBoundingClientRect();
            const sourceRect = source.getBoundingClientRect();

            // 1. Lock the logo at its current visual position
            setLogoStyle({
                position: 'fixed',
                top: `${sourceRect.top}px`,
                left: `${sourceRect.left}px`,
                width: `${sourceRect.width}px`,
                height: `${sourceRect.height}px`,
                zIndex: 9999,
                transition: `all ${SPLASH_CONFIG.ANIMATION_DURATION}ms ${SPLASH_CONFIG.EASING}`,
                transform: 'none',
            });

            setStatus('animating');
            document.body.classList.add('bg-pattern-loaded');

            // 2. Trigger the move to the target position in the next frame
            requestAnimationFrame(() => {
                setLogoStyle({
                    position: 'fixed',
                    top: `${targetRect.top}px`,
                    left: `${targetRect.left}px`,
                    width: `${targetRect.width}px`,
                    height: `${targetRect.height}px`,
                    zIndex: 9999,
                    transition: `all ${SPLASH_CONFIG.ANIMATION_DURATION}ms ${SPLASH_CONFIG.EASING}`,
                    transform: 'none',
                });
            });

            // 3. Unmount after animation completes
            setTimeout(() => {
                setStatus('hidden');
            }, SPLASH_CONFIG.ANIMATION_DURATION);
        };

        const timer = setTimeout(initAnimation, SPLASH_CONFIG.INITIAL_WAIT);

        return () => clearTimeout(timer);
    }, []);

    if (status === 'hidden') return null;

    // Transition styles for the background elements that fade out
    const fadeOutStyle: React.CSSProperties = {
        opacity: status === 'animating' ? 0 : 1,
        transition: `opacity ${SPLASH_CONFIG.ANIMATION_DURATION}ms ease-out`
    };

    return (
        <div className={`fixed inset-0 z-[9999] flex items-start justify-start pt-10 md:pt-16 pl-3 md:pl-6 ${status === 'idle' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* 1. Underlying Texture/Image Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    ...fadeOutStyle,
                    backgroundImage: "url('/Assets/page-bg.png')",
                }}
            />

            {/* 2. Brand Color Overlay (Gradient) - Essential for contrast */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-[#001226] via-[#001226]/90 to-[#002a4d]/80"
                style={fadeOutStyle}
            />

            {/* 3. Background "USAT" Typography Watermark */}
            {/* Using a subtle gold-tinted outline effect for a premium feel */}
            <div className="absolute inset-0 flex items-end justify-center overflow-hidden pb-5">
                <span
                    className="font-display font-black text-[35vw] leading-none select-none pointer-events-none w-[90%] pl-60"
                    style={{
                        ...fadeOutStyle,
                        color: 'transparent',
                        WebkitTextStroke: '10px rgba(212, 175, 55, 0.1)', // Gold outline
                        opacity: 0.7 // Slight transparency
                    }}
                >
                    USAT
                </span>
            </div>

            {/* 4. Main Logo Container */}
            <div className="relative z-10 flex items-start justify-start">
                <img
                    ref={logoRef}
                    src="/Assets/logo.png"
                    alt="Amal Tiznit Logo"
                    // Added faint glow/shadow for depth
                    className={`${status === 'idle' ? 'w-[500px] h-[500px] drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]' : ''} object-contain`}
                    style={status === 'animating' ? logoStyle : undefined}
                />
            </div>
        </div>
    );
};

export default SplashScreen;
