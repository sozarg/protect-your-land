import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import Ground from './components/Ground' // Imported Ground component
import Player from './components/Player' // Import Player component
import WaveSystem from './components/WaveSystem' // Import WaveSystem component
// import Zombies from './components/Zombies' // TODO: Import zombies/enemies component  
// import CameraController from './components/CameraController' // TODO: Import camera controller if needed

export default function Experience() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* GAME UI OVERLAY - Outside Canvas for proper positioning */}
      <WaveSystem />
      
      {/* 3D WORLD CANVAS */}
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
          {/* Player character with physics */}
          <Player />
          
          {/* Enemy spawning and wave management */}
          {/* <Zombies /> */}
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