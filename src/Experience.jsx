import React, { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Stats, Stars, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import Ground from './components/Ground' // Imported Ground component
import Player from './components/Player' // Import Player component
import WaveSystem from './components/WaveSystem' // Import WaveSystem component
import ZombieSpawner from './components/ZombieSpawner' // Import ZombieSpawner
import GameUI from './components/GameUI'
// import CameraController from './components/CameraController' // TODO: Import camera controller if needed

export default function Experience() {
  // Create refs for component communication
  const zombieSpawnerRef = useRef()
  const playerRef = useRef()

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* GAME UI OVERLAYS - Outside Canvas for proper HTML rendering */}
      <WaveSystem zombieSpawnerRef={zombieSpawnerRef} />
      <GameUI playerRef={playerRef} />
      
      {/* 3D WORLD CANVAS - Only 3D elements inside */}
      <Canvas shadows>
        {/* THIRD-PERSON CAMERA - Behind and above player */}
        <PerspectiveCamera
          makeDefault
          position={[0, 15, 20]}
          fov={75}
          near={0.1}
          far={300}
          onUpdate={(camera) => camera.lookAt(0, 0, 0)}
        />

        {/* ORBIT CONTROLS - Allow camera rotation around player */}
        <OrbitControls
          target={[0, 0, 0]}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={40}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          mouseButtons={{
            LEFT: null,
            MIDDLE: null,
            RIGHT: 0
          }}
        />

        {/* NIGHT SKY BACKGROUND */}
        <color attach="background" args={['#2a003f']} />
        
        {/* STARFIELD */}
        <Stars 
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade={true}
        />
        
        {/* FPS MONITOR */}
        <Stats />
        
        {/* LIGHTING SETUP */}
        <ambientLight intensity={0.3} color="#ffffff" />
        
        {/* MAIN DIRECTIONAL LIGHT WITH SHADOWS */}
        <directionalLight
          position={[15, 25, 15]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-40}
          shadow-camera-right={40}
          shadow-camera-top={40}
          shadow-camera-bottom={-40}
        />

        {/* PHYSICS WORLD */}
        <Physics gravity={[0, -9.81, 0]} debug={false}>
          {/* TERRAIN - Simple rectangular ground */}
          <Ground />

          {/* GAME ENTITIES */}
          <Player ref={playerRef} zombieSpawnerRef={zombieSpawnerRef} />
          <ZombieSpawner ref={zombieSpawnerRef} playerRef={playerRef} />
        </Physics>
        
        {/* DEVELOPMENT HELPERS */}
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  )
} 