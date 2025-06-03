import React, { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
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
      <Canvas
        camera={{
          position: [10, 15, 10], // Fixed isometric-style camera position
          fov: 75,
          near: 0.1,
          far: 200
        }}
        shadows // Enable shadow rendering
        onCreated={({ camera }) => {
          // Make camera look at the origin (center of the game world)
          camera.lookAt(0, 0, 0)
        }}
      >
        {/* LIGHTING SETUP */}
        {/* Ambient light for general scene illumination */}
        <ambientLight intensity={0.4} color="#ffffff" />
        
        {/* Directional light with elevated position for dramatic shadows */}
        <directionalLight
          position={[15, 20, 5]}
          intensity={1}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* PHYSICS WORLD */}
        <Physics gravity={[0, -9.81, 0]} debug={false}>
          {/* GAME WORLD COMPONENTS */}
          {/* Ground/Terrain - Main game surface */}
          <Ground />

          {/* GAME ENTITIES */}
          {/* Player character with physics and health system */}
          <Player ref={playerRef} zombieSpawnerRef={zombieSpawnerRef} />
          
          {/* Zombie spawning and management */}
          <ZombieSpawner ref={zombieSpawnerRef} playerRef={playerRef} />
        </Physics>
        
        {/* Additional camera controls if needed */}
        {/* <CameraController /> */}

        {/* HELPERS - Remove in production */}
        {/* Axis helper for development (red=X, green=Y, blue=Z) */}
        <axesHelper args={[5]} />
        
        {/* Grid helper for positioning reference */}
        <gridHelper args={[20, 20, '#666666', '#333333']} />
      </Canvas>
    </div>
  )
} 