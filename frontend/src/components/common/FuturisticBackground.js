import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ThreeScene3D from './ThreeScene3D';

export default function FuturisticBackground() {
  const containerRef = useRef(null);
  const glow1Ref = useRef(null);
  const glow2Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Slow, steady atmospheric breathing
      gsap.to(glow1Ref.current, {
        x: '+=60',
        y: '-=40',
        scale: 1.1,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(glow2Ref.current, {
        x: '-=50',
        y: '+=50',
        scale: 1.12,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = (e.clientX / innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(glow1Ref.current, {
        xPercent: mouseX * 14,
        yPercent: mouseY * 14,
        duration: 2.2,
        ease: 'power1.out',
      });
      gsap.to(glow2Ref.current, {
        xPercent: -mouseX * 16,
        yPercent: -mouseY * 16,
        duration: 2.6,
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
        // Executive Dark Slate & Navy (Professional, authoritative, illuminated)
        background: 'radial-gradient(ellipse at 50% -15%, #1e293b 0%, #0f172a 45%, #090d16 100%)',
      }}
      aria-hidden="true"
    >
      {/* Precision Editorial Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 3D Global Wireframe Coordinate Globe */}
      <div className="absolute top-[-3%] right-[-6%] sm:right-[2%] lg:right-[8%] w-[440px] sm:w-[580px] lg:w-[680px] h-[480px] sm:h-[620px] opacity-80 pointer-events-none">
        <ThreeScene3D />
      </div>

      {/* Professional Ambient Cobalt Glow */}
      <div
        ref={glow1Ref}
        className="absolute rounded-full blur-[160px] opacity-25 will-change-transform"
        style={{
          width: '50vw',
          height: '50vw',
          maxWidth: '680px',
          maxHeight: '680px',
          top: '-10%',
          right: '8%',
          background: 'radial-gradient(circle, #2563eb 0%, #1d4ed8 50%, transparent 75%)',
        }}
      />

      {/* Deep Slate Cyan Accent Glow */}
      <div
        ref={glow2Ref}
        className="absolute rounded-full blur-[170px] opacity-20 will-change-transform"
        style={{
          width: '45vw',
          height: '45vw',
          maxWidth: '580px',
          maxHeight: '580px',
          top: '25%',
          left: '5%',
          background: 'radial-gradient(circle, #0284c7 0%, #0369a1 50%, transparent 75%)',
        }}
      />

      {/* Subtle Atmospheric Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, transparent 50%, rgba(9, 13, 22, 0.5) 100%)',
        }}
      />
    </div>
  );
}
