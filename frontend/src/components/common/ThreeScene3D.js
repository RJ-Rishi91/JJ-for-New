import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene3D({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. 3D Objects Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Core 3D Geometry: Luminous Wireframe Icosahedron (Global Journalism Network)
    const icoGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      wireframe: true,
      emissive: 0x3730a3,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.8,
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    mainGroup.add(icosahedron);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(2.6, 24, 24);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      wireframe: false,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0xe11d48,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.65,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerSphere);

    // Concentric 3D Orbit Rings
    const ringGeo1 = new THREE.TorusGeometry(6.2, 0.04, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(7.5, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      opacity: 0.45,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    mainGroup.add(ring2);

    // Floating 3D Star & Node Constellation
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorRose = new THREE.Color(0xfb7185);
    const colorCyan = new THREE.Color(0x38bdf8);
    const colorIndigo = new THREE.Color(0x818cf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 8 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? colorRose : i % 3 === 1 ? colorCyan : colorIndigo;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // 3. Volumetric Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xf43f5e, 3.5, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 3.0, 50);
    cyanLight.position.set(-10, -10, 8);
    scene.add(cyanLight);

    // 4. Mouse-reactive 3D coordinates with smooth damping
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (e.clientX / innerWidth - 0.5) * 2;
      mouseY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 5. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop (60 FPS)
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Autonomous 3D Rotations
      icosahedron.rotation.y = elapsedTime * 0.15;
      icosahedron.rotation.x = elapsedTime * 0.08;

      innerSphere.rotation.y = -elapsedTime * 0.25;

      ring1.rotation.z = elapsedTime * 0.12;
      ring2.rotation.z = -elapsedTime * 0.10;
      ring2.rotation.x = -Math.PI / 6 + Math.sin(elapsedTime * 0.5) * 0.1;

      particles.rotation.y = elapsedTime * 0.05;

      // Smooth Cursor 3D Tilting
      targetX += (mouseX * 0.5 - targetX) * 0.05;
      targetY += (mouseY * 0.4 - targetY) * 0.05;

      mainGroup.rotation.y = targetX;
      mainGroup.rotation.x = -targetY;

      // Soft Floating Float (bobbing)
      mainGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.35;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      icoGeo.dispose();
      icoMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
