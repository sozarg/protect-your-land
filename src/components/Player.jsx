import React, { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'

export default function Player() {
  // Reference to the RigidBody for physics manipulation
  const rigidBodyRef = useRef()
  
  // State to track which keys are currently pressed
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  })

  // Movement speed configuration
  const MOVEMENT_SPEED = 5
  const JUMP_FORCE = 8

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        setKeys(prev => ({ ...prev, [key]: true }))
      }
      // Space bar for jumping
      if (key === ' ') {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true)
        }
      }
    }

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        setKeys(prev => ({ ...prev, [key]: false }))
      }
    }

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Game loop - runs every frame
  useFrame(() => {
    if (!rigidBodyRef.current) return

    // Calculate movement direction based on pressed keys
    let moveX = 0
    let moveZ = 0

    if (keys.w) moveZ -= 1  // Forward (negative Z in our coordinate system)
    if (keys.s) moveZ += 1  // Backward
    if (keys.a) moveX -= 1  // Left
    if (keys.d) moveX += 1  // Right

    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
      moveX *= 0.707  // 1/√2 to maintain consistent speed
      moveZ *= 0.707
    }

    // Apply movement force to the rigid body
    if (moveX !== 0 || moveZ !== 0) {
      const impulse = {
        x: moveX * MOVEMENT_SPEED,
        y: 0,
        z: moveZ * MOVEMENT_SPEED
      }
      
      // Apply impulse for movement
      rigidBodyRef.current.applyImpulse(impulse, true)
    }

    // Apply some damping to prevent sliding
    const velocity = rigidBodyRef.current.linvel()
    rigidBodyRef.current.setLinvel({
      x: velocity.x * 0.9,  // Horizontal damping
      y: velocity.y,        // Keep vertical velocity for jumping/falling
      z: velocity.z * 0.9   // Horizontal damping
    })
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"              // Dynamic physics body
      position={[0, 2, 0]}        // Start position above the ground
      enabledRotations={[false, true, false]}  // Prevent tipping over
    >
      {/* Capsule Collider for smooth movement */}
      <CapsuleCollider args={[0.5, 0.5]} />
      
      {/* Visual representation of the player */}
      <mesh castShadow receiveShadow>
        {/* Using capsule geometry to match the collider */}
        <capsuleGeometry args={[0.5, 1]} />
        <meshStandardMaterial 
          color="#4a90e2"           // Blue color for the player
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Simple "head" indicator */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial 
          color="#2c5aa0"           // Darker blue for contrast
          roughness={0.4}
        />
      </mesh>
    </RigidBody>
  )
} 