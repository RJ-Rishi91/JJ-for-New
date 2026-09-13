import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FuturisticBackground() {
  const containerRef = useRef(null);
  const leak1Ref = useRef(null);
  const leak2Ref = useRef(null);
  const leak3Ref = useRef(null);
  const leak4Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Organic, slow breathing atmospheric light leaks
      gsap.to(leak1Ref.current, {
        x: '+=60',
        y: '-=40',
        scale: 1.08,
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(leak2Ref.current, {
        x: '-=70',
        y: '+=50',
        scale: 1.12,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(leak3Ref.current, {
        x: '+=50',
        y: '+=60',
        scale: 0.95,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(leak4Ref.current, {
        x: '-=40',
        y: '-=50',
        scale: 1.06,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    // 2. High-inertia subtle mouse parallax
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = (e.clientX / innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(leak1Ref.current, {
        xPercent: mouseX * 14,
        yPercent: mouseY * 14,
        duration: 2.4,
        ease: 'power1.out',
      });
      gsap.to(leak2Ref.current, {
        xPercent: -mouseX * 18,
        yPercent: -mouseY * 18,
        duration: 2.8,
        ease: 'power1.out',
      });
      gsap.to(leak3Ref.current, {
        xPercent: mouseX * 22,
        yPercent: -mouseY * 12,
        duration: 2.2,
        ease: 'power1.out',
      });
      gsap.to(leak4Ref.current, {
        xPercent: -mouseX * 15,
        yPercent: mouseY * 15,
        duration: 3.0,
        ease: 'power1.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% -10%, #17112c 0%, #0c0918 45%, #07050e 100%)',
      }}
      aria-hidden="true"
    >
      {/* Film grain noise filter for physical warmth and tactile soul */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none">
        <filter id="filmGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#filmGrain)" />
      </svg>

      {/* Atmospheric Light Leak 1: Warm Rose & Crimson (Editorial Warmth) */}
      <div
        ref={leak1Ref}
        className="absolute rounded-full blur-[160px] opacity-[0.22] will-change-transform"
        style={{
          width: '52vw',
          height: '52vw',
          maxWidth: '680px',
          maxHeight: '680px',
          top: '-8%',
          left: '8%',
          background: 'radial-gradient(circle, #e11d48 0%, #be123c 45%, transparent 75%)',
        }}
      />

      {/* Atmospheric Light Leak 2: Rich Editorial Indigo */}
      <div
        ref={leak2Ref}
        className="absolute rounded-full blur-[180px] opacity-[0.24] will-change-transform"
        style={{
          width: '55vw',
          height: '55vw',
          maxWidth: '720px',
          maxHeight: '720px',
          top: '8%',
          right: '-6%',
          background: 'radial-gradient(circle, #4f46e5 0%, #312e81 50%, transparent 75%)',
        }}
      />

      {/* Atmospheric Light Leak 3: Subtle Warm Amber Glow */}
      <div
        ref={leak3Ref}
        className="absolute rounded-full blur-[150px] opacity-[0.14] will-change-transform"
        style={{
          width: '42vw',
          height: '42vw',
          maxWidth: '520px',
          maxHeight: '520px',
          top: '40%',
          left: '25%',
          background: 'radial-gradient(circle, #d97706 0%, #b45309 45%, transparent 70%)',
        }}
      />

      {/* Atmospheric Light Leak 4: Soft Deep Violet */}
      <div
        ref={leak4Ref}
        className="absolute rounded-full blur-[170px] opacity-[0.20] will-change-transform"
        style={{
          width: '48vw',
          height: '48vw',
          maxWidth: '620px',
          maxHeight: '620px',
          bottom: '-5%',
          right: '10%',
          background: 'radial-gradient(circle, #7c3aed 0%, #4c1d95 50%, transparent 75%)',
        }}
      />

      {/* Cinematic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, transparent 35%, rgba(7, 5, 14, 0.65) 100%)',
        }}
      />
    </div>
  );
}
