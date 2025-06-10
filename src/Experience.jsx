import React, { useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { Stats, Stars, PerspectiveCamera, OrbitControls } from '@react-three/drei'
import Ground from './components/Ground' // Imported Ground component
import Player from './components/Player' // Import Player component
import WaveSystem from './components/WaveSystem' // Import WaveSystem component
import ZombieSpawner from './components/ZombieSpawner' // Import ZombieSpawner
import WeaponShop from './components/WeaponShop' // Import WeaponShop component
import WeaponShopUI from './components/WeaponShopUI' // Import WeaponShopUI component
import GameUI from './components/GameUI'
// import CameraController from './components/CameraController' // TODO: Import camera controller if needed

export default function Experience() {
  // Create refs for component communication
  const zombieSpawnerRef = useRef()
  const playerRef = useRef()

  // Terrain configuration - centralized here
  const TERRAIN_CONFIG = {
    width: 30,
    height: 30,
    blockSize: 2,
    spacing: 2.08,
    color: "#4caf50"
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* GAME UI OVERLAYS - Outside Canvas for proper HTML rendering */}
      <WaveSystem zombieSpawnerRef={zombieSpawnerRef} />
      <GameUI playerRef={playerRef} />
      <WeaponShopUI />
      
      {/* 3D WORLD CANVAS - Only 3D elements inside */}
      <Canvas shadows>
        {/* THIRD-PERSON CAMERA - Behind and above player */}
        <PerspectiveCamera
          makeDefault
          position={[0, 15, 20]}  // Back to reasonable height
          fov={75}
          near={0.1}
          far={300}
          onUpdate={(camera) => camera.lookAt(0, 2, 0)}  // Look at correct player height
        />

        {/* ORBIT CONTROLS - Allow camera rotation around player */}
        <OrbitControls
          target={[0, 2, 0]}  // Target at correct player height
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}     // Minimum distance from target
          maxDistance={40}
          minPolarAngle={Math.PI / 8}    // Minimum angle (higher minimum)
          maxPolarAngle={Math.PI / 2.2}  // Maximum angle
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          mouseButtons={{
            LEFT: null,
            MIDDLE: null,
            RIGHT: 0
          }}
        />

        {/* NIGHT SKY BACKGROUND */}
        <color attach="background" args={['#2a003f']} />
        
        {/* ATMOSPHERIC FOG */}
        <fog attach="fog" args={['#2a003f', 25, 80]} />
        
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
        <ambientLight intensity={0.6} color="#fbeedb" />
        
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

        {/* TERRAIN-SPECIFIC DIRECTIONAL LIGHT - For dark edge shadows between blocks */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
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
          {/* TERRAIN VISUAL - Only rendering */}
          <Ground 
            width={TERRAIN_CONFIG.width}
            height={TERRAIN_CONFIG.height}
            blockSize={TERRAIN_CONFIG.blockSize}
            spacing={TERRAIN_CONFIG.spacing}
            color={TERRAIN_CONFIG.color}
          />

          {/* TERRAIN PHYSICS - Ground collision */}
          <RigidBody 
            type="fixed"
            position={[0, 1.5, 0]} // Exactly at ground surface (0.5 + 1.0)
          >
            <CuboidCollider 
              args={[
                TERRAIN_CONFIG.width * TERRAIN_CONFIG.spacing / 2, 
                0.5, // Half the block height
                TERRAIN_CONFIG.height * TERRAIN_CONFIG.spacing / 2
              ]}
            />
          </RigidBody>

          {/* GAME ENTITIES */}
          <Player ref={playerRef} zombieSpawnerRef={zombieSpawnerRef} />
          <ZombieSpawner ref={zombieSpawnerRef} playerRef={playerRef} />
          <WeaponShop playerRef={playerRef} />
        </Physics>
        
        {/* DEVELOPMENT HELPERS */}
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  )
} 