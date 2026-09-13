import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ThreeScene3D from './ThreeScene3D';

export default function FuturisticBackground() {
  const containerRef = useRef(null);
  const glow1Ref = useRef(null);
  const glow2Ref = useRef(null);
  const glow3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Organic, slow luminous light breathing
      gsap.to(glow1Ref.current, {
        x: '+=80',
        y: '-=50',
        scale: 1.15,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(glow2Ref.current, {
        x: '-=90',
        y: '+=60',
        scale: 1.18,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(glow3Ref.current, {
        x: '+=60',
        y: '+=70',
        scale: 0.92,
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    // 2. Mouse Parallax for Luminous Glows
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = (e.clientX / innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(glow1Ref.current, {
        xPercent: mouseX * 18,
        yPercent: mouseY * 18,
        duration: 2.0,
        ease: 'power2.out',
      });
      gsap.to(glow2Ref.current, {
        xPercent: -mouseX * 22,
        yPercent: -mouseY * 22,
        duration: 2.4,
        ease: 'power2.out',
      });
      gsap.to(glow3Ref.current, {
        xPercent: mouseX * 26,
        yPercent: -mouseY * 16,
        duration: 1.8,
        ease: 'power2.out',
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
        // Luminous, dimensional titanium-indigo spatial background (NOT pitch black)
        background: 'radial-gradient(ellipse at 50% -10%, #2b2259 0%, #181436 40%, #0f0c22 100%)',
      }}
      aria-hidden="true"
    >
      {/* 3D Perspective Depth Grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
        }}
      />

      {/* Interactive WebGL Three.js 3D Scene in the upper hero / atmosphere */}
      <div className="absolute top-0 right-[-5%] sm:right-[5%] lg:right-[12%] w-[420px] sm:w-[580px] lg:w-[680px] h-[450px] sm:h-[620px] opacity-75 sm:opacity-85 pointer-events-none">
        <ThreeScene3D />
      </div>

      {/* Luminous Volumetric Light 1: Electric Indigo Glow */}
      <div
        ref={glow1Ref}
        className="absolute rounded-full blur-[140px] opacity-35 will-change-transform"
        style={{
          width: '55vw',
          height: '55vw',
          maxWidth: '700px',
          maxHeight: '700px',
          top: '-12%',
          right: '5%',
          background: 'radial-gradient(circle, #818cf8 0%, #4f46e5 50%, transparent 75%)',
        }}
      />

      {/* Luminous Volumetric Light 2: Radiant Rose / Coral */}
      <div
        ref={glow2Ref}
        className="absolute rounded-full blur-[150px] opacity-30 will-change-transform"
        style={{
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          top: '5%',
          left: '-5%',
          background: 'radial-gradient(circle, #fb7185 0%, #e11d48 50%, transparent 75%)',
        }}
      />

      {/* Luminous Volumetric Light 3: Sky Cyan Glow */}
      <div
        ref={glow3Ref}
        className="absolute rounded-full blur-[130px] opacity-25 will-change-transform"
        style={{
          width: '40vw',
          height: '40vw',
          maxWidth: '500px',
          maxHeight: '500px',
          top: '45%',
          left: '30%',
          background: 'radial-gradient(circle, #38bdf8 0%, #0284c7 45%, transparent 70%)',
        }}
      />

      {/* Subtle Luminous Ambient Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, transparent 40%, rgba(14, 11, 32, 0.45) 100%)',
        }}
      />
    </div>
  );
}
