import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3DMedicalGlobeProps {
  progress: number;
}

export const Hero3DMedicalGlobe: React.FC<Hero3DMedicalGlobeProps> = ({ progress }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Main Medical Hologram Group
    const hologramGroup = new THREE.Group();
    scene.add(hologramGroup);

    // --- Core 3D Medical Cross ---
    // Vertical bar
    const barVGeom = new THREE.BoxGeometry(0.5, 1.6, 0.45);
    // Horizontal bar
    const barHGeom = new THREE.BoxGeometry(1.6, 0.5, 0.45);
    
    const crossMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#00f2fe'),
      emissive: new THREE.Color('#0369a1'),
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.35,
      ior: 1.5,
      transparent: true,
      opacity: 0.92,
    });

    const crossV = new THREE.Mesh(barVGeom, crossMat);
    const crossH = new THREE.Mesh(barHGeom, crossMat);
    const coreCross = new THREE.Group();
    coreCross.add(crossV);
    coreCross.add(crossH);
    hologramGroup.add(coreCross);

    // Edge Wireframe for the 3D cross for high-tech holographic look
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.8,
    });
    const wireV = new THREE.LineSegments(new THREE.EdgesGeometry(barVGeom), wireMat);
    const wireH = new THREE.LineSegments(new THREE.EdgesGeometry(barHGeom), wireMat);
    coreCross.add(wireV);
    coreCross.add(wireH);

    // --- Inner Bio-Shield Icosahedron Wireframe ---
    const icoGeom = new THREE.IcosahedronGeometry(1.35, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const icosahedron = new THREE.Mesh(icoGeom, icoMat);
    hologramGroup.add(icosahedron);

    // --- Outer Gyroscopic Rings (3 gimbal rings) ---
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const ring1Geom = new THREE.TorusGeometry(1.85, 0.025, 16, 64);
    const ring1 = new THREE.Mesh(ring1Geom, ringMat1);
    hologramGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const ring2Geom = new THREE.TorusGeometry(2.1, 0.02, 16, 64);
    const ring2 = new THREE.Mesh(ring2Geom, ringMat2);
    ring2.rotation.x = Math.PI / 2.6;
    hologramGroup.add(ring2);

    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const ring3Geom = new THREE.TorusGeometry(2.35, 0.015, 16, 64);
    const ring3 = new THREE.Mesh(ring3Geom, ringMat3);
    ring3.rotation.y = Math.PI / 3;
    hologramGroup.add(ring3);

    // --- Orbiting Medical Nanite Particles ---
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      particleScales[i] = Math.random() * 0.05 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    hologramGroup.add(particles);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0x082f49, 2.5);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 4, 15);
    cyanPoint.position.set(2, 3, 3);
    scene.add(cyanPoint);

    const bluePoint = new THREE.PointLight(0x3b82f6, 3.5, 15);
    bluePoint.position.set(-3, -2, 2);
    scene.add(bluePoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 2, 10);
    emeraldPoint.position.set(0, 0, 4);
    scene.add(emeraldPoint);

    // Mouse Interaction Parallax
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.5;
      targetRotX = -y * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotate core cross
      coreCross.rotation.y = elapsedTime * 0.8;
      coreCross.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
      coreCross.rotation.z = Math.cos(elapsedTime * 0.4) * 0.15;

      // Pulse scale according to heartbeat
      const pulse = 1 + Math.sin(elapsedTime * 3.5) * 0.04;
      coreCross.scale.set(pulse, pulse, pulse);

      // Gyroscopic Ring Rotations
      ring1.rotation.z = elapsedTime * 0.5;
      ring1.rotation.x = elapsedTime * 0.3;

      ring2.rotation.y = -elapsedTime * 0.6;
      ring2.rotation.z = elapsedTime * 0.2;

      ring3.rotation.x = elapsedTime * 0.4;
      ring3.rotation.y = elapsedTime * 0.4;

      // Icosahedron slow spin
      icosahedron.rotation.y = -elapsedTime * 0.25;
      icosahedron.rotation.x = elapsedTime * 0.15;

      // Particles slow vortex orbit
      particles.rotation.y = elapsedTime * 0.18;
      particles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

      // Mouse Parallax Damping
      hologramGroup.rotation.y += (targetRotY - hologramGroup.rotation.y) * 0.05;
      hologramGroup.rotation.x += (targetRotX - hologramGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-72 h-72 sm:w-84 sm:h-84 mx-auto flex items-center justify-center pointer-events-none select-none">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full relative z-10" />

      {/* Holographic Base Projection Ring HUD */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Outer Rotating Radar Dashes */}
        <div className="w-64 h-64 sm:w-76 sm:h-76 rounded-full border border-cyan-500/20 border-dashed animate-spin-slow" />
        <div className="w-56 h-56 sm:w-68 sm:h-68 rounded-full border border-cyan-400/30 animate-spin-slow-reverse" />
        
        {/* Holographic Glowing Base Disk */}
        <div className="absolute bottom-2 w-48 h-12 rounded-[100%] bg-cyan-500/20 blur-lg" />
        <div className="absolute bottom-4 w-32 h-6 rounded-[100%] bg-cyan-400/40 blur-md" />
      </div>

      {/* High-tech HUD Corner Brackets */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 opacity-70" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 opacity-70" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 opacity-70" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 opacity-70" />
      </div>
    </div>
  );
};
