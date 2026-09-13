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
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 2. Executive 3D Globe & Lat/Long Coordinate Grid
    // Precision Global Wireframe Sphere (Reuters / Bloomberg / Institutional Newsroom Aesthetic)
    const sphereGeo = new THREE.SphereGeometry(5.2, 36, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: 0.35,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.25,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    mainGroup.add(globe);

    // Inner Solid Dark Slate Core (prevents busy see-through clutter)
    const coreGeo = new THREE.SphereGeometry(5.05, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(core);

    // Outer Geodetic Horizon Rings
    const ringGeo1 = new THREE.TorusGeometry(6.8, 0.025, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.5,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.8;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(7.6, 0.02, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.3,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 5;
    mainGroup.add(ring2);

    // News Data Point Constellation (White & Slate Blue telemetry nodes)
    const nodeCount = 80;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      const radius = 5.25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      nodePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      nodePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      nodePositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.16,
      transparent: true,
      opacity: 0.9,
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    mainGroup.add(nodes);

    // 3. Subtle Professional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x60a5fa, 2.5);
    keyLight.position.set(12, 15, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x1e293b, 1.5);
    fillLight.position.set(-12, -10, -10);
    scene.add(fillLight);

    // 4. Cursor tracking with smooth inertial damping
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

    // 5. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow, steady axial rotation (like Earth / institutional globe)
      globe.rotation.y = elapsedTime * 0.08;
      nodes.rotation.y = elapsedTime * 0.08;
      core.rotation.y = elapsedTime * 0.04;

      ring1.rotation.z = elapsedTime * 0.06;
      ring2.rotation.z = -elapsedTime * 0.04;

      // Damped Cursor Interaction
      targetX += (mouseX * 0.35 - targetX) * 0.04;
      targetY += (mouseY * 0.25 - targetY) * 0.04;

      mainGroup.rotation.y = targetX;
      mainGroup.rotation.x = -targetY;

      // Subtle breath
      mainGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.2;

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

      sphereGeo.dispose();
      sphereMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
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
