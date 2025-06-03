import React from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

export default function Ground() {
  return (
    <RigidBody 
      type="fixed"                      // Fixed (static) physics body - doesn't move
      position={[0, -0.5, 0]}           // Lower the ground slightly below origin
      rotation={[-0.1, 0, 0]}          // Slight tilt on X-axis for perspective
    >
      {/* Physics Collider - matches the visual geometry */}
      <CuboidCollider args={[10, 0.5, 10]} />
      
      {/* Visual representation */}
      <mesh 
        receiveShadow                    // Enable shadow receiving
        castShadow                       // Also cast shadows if needed
      >
        {/* 3D Box Geometry - Wide rectangular block */}
        <boxGeometry 
          args={[20, 1, 20]}            // [width, height, depth] - Elongated terrain block
        />
        
        {/* Material with earth-like coloring */}
        <meshStandardMaterial 
          color="#2d4a22"               // Dark forest green
          roughness={0.8}               // Slightly rough surface
          metalness={0.1}               // Low metallic reflection
        />
      </mesh>
    </RigidBody>
  )
} 