import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FuturisticBackground() {
  const containerRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);
  const blob4Ref = useRef(null);
  const blob5Ref = useRef(null);

  useEffect(() => {
    // 1. Continuous organic floating animation for blobs
    const ctx = gsap.context(() => {
      // Blob 1: Hot Pink / Magenta (#ff2d55)
      gsap.to(blob1Ref.current, {
        x: '+=90',
        y: '-=60',
        scale: 1.15,
        rotation: 45,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Blob 2: Deep Electric Purple / Indigo (#7000ff)
      gsap.to(blob2Ref.current, {
        x: '-=110',
        y: '+=80',
        scale: 1.25,
        rotation: -60,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Blob 3: Neon Cyan / Blue (#00f2fe)
      gsap.to(blob3Ref.current, {
        x: '+=80',
        y: '+=100',
        scale: 0.9,
        duration: 9.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Blob 4: Vivid Crimson / Fire Red (#ff0844)
      gsap.to(blob4Ref.current, {
        x: '-=70',
        y: '-=90',
        scale: 1.2,
        rotation: 30,
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Blob 5: Amber / Golden Core Glow (#ff8a00)
      gsap.to(blob5Ref.current, {
        x: '+=50',
        y: '-=40',
        scale: 1.1,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    // 2. Interactive mouse parallax
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const mouseX = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const mouseY = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

      // Subtle parallax offset with damped easing
      gsap.to(blob1Ref.current, {
        xPercent: mouseX * 25,
        yPercent: mouseY * 25,
        duration: 1.6,
        ease: 'power2.out',
      });
      gsap.to(blob2Ref.current, {
        xPercent: -mouseX * 30,
        yPercent: -mouseY * 30,
        duration: 2.0,
        ease: 'power2.out',
      });
      gsap.to(blob3Ref.current, {
        xPercent: mouseX * 40,
        yPercent: -mouseY * 20,
        duration: 1.4,
        ease: 'power2.out',
      });
      gsap.to(blob4Ref.current, {
        xPercent: -mouseX * 35,
        yPercent: mouseY * 35,
        duration: 2.2,
        ease: 'power2.out',
      });
      gsap.to(blob5Ref.current, {
        xPercent: mouseX * 15,
        yPercent: mouseY * 15,
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
        background: 'radial-gradient(ellipse at 50% 0%, #170d2b 0%, #0c0819 45%, #05030a 100%)',
      }}
      aria-hidden="true"
    >
      {/* Dimensional Grid / Sub-mesh Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Blob 1: Magenta / Pink */}
      <div
        ref={blob1Ref}
        className="absolute rounded-full blur-[130px] opacity-45 will-change-transform"
        style={{
          width: '55vw',
          height: '55vw',
          maxWidth: '650px',
          maxHeight: '650px',
          top: '-10%',
          left: '5%',
          background: 'radial-gradient(circle, #ff2d55 0%, #d81b60 60%, transparent 80%)',
        }}
      />

      {/* Blob 2: Deep Violet / Purple */}
      <div
        ref={blob2Ref}
        className="absolute rounded-full blur-[140px] opacity-45 will-change-transform"
        style={{
          width: '60vw',
          height: '60vw',
          maxWidth: '750px',
          maxHeight: '750px',
          top: '10%',
          right: '-10%',
          background: 'radial-gradient(circle, #7000ff 0%, #302b63 60%, transparent 80%)',
        }}
      />

      {/* Blob 3: Vibrant Cyan / Ice Blue */}
      <div
        ref={blob3Ref}
        className="absolute rounded-full blur-[120px] opacity-35 will-change-transform"
        style={{
          width: '45vw',
          height: '45vw',
          maxWidth: '550px',
          maxHeight: '550px',
          top: '45%',
          left: '-5%',
          background: 'radial-gradient(circle, #00f2fe 0%, #4facfe 50%, transparent 75%)',
        }}
      />

      {/* Blob 4: Crimson / Neon Red */}
      <div
        ref={blob4Ref}
        className="absolute rounded-full blur-[150px] opacity-40 will-change-transform"
        style={{
          width: '50vw',
          height: '50vw',
          maxWidth: '650px',
          maxHeight: '650px',
          bottom: '-5%',
          right: '5%',
          background: 'radial-gradient(circle, #ff0844 0%, #ff4b1f 60%, transparent 80%)',
        }}
      />

      {/* Blob 5: Amber / Golden Glow Accent */}
      <div
        ref={blob5Ref}
        className="absolute rounded-full blur-[110px] opacity-25 will-change-transform"
        style={{
          width: '35vw',
          height: '35vw',
          maxWidth: '450px',
          maxHeight: '450px',
          bottom: '25%',
          left: '35%',
          background: 'radial-gradient(circle, #ff8a00 0%, #ff2d55 50%, transparent 70%)',
        }}
      />

      {/* Atmospheric Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(5, 3, 10, 0.6) 100%)',
        }}
      />
    </div>
  );
}
