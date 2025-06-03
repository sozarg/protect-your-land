import React, { useRef, useEffect, useState, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'

const Player = forwardRef(({ zombieSpawnerRef }, ref) => {
  // Reference to the RigidBody for physics manipulation
  const rigidBodyRef = useRef()
  
  // Health and combat state
  const [health, setHealth] = useState(100)
  const [isGameOver, setIsGameOver] = useState(false)
  const [lastDamageTime, setLastDamageTime] = useState({}) // Track damage cooldown per zombie ID
  
  // State to track which keys are currently pressed
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  })

  // Configuration
  const MOVEMENT_SPEED = 5
  const JUMP_FORCE = 8
  const MAX_HEALTH = 100
  const DAMAGE_COOLDOWN = 1000 // 1 second in milliseconds
  const DAMAGE_RANGE = 1.2 // meters

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (key === 'w' || key === 'a' || key === 's' || key === 'd') {
        setKeys(prev => ({ ...prev, [key]: true }))
      }
      // Space bar for jumping (only if alive)
      if (key === ' ' && !isGameOver) {
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
  }, [isGameOver])

  // Check for zombie damage
  const checkZombieDamage = () => {
    if (!zombieSpawnerRef?.current || !rigidBodyRef.current || isGameOver) return

    try {
      const playerPosition = rigidBodyRef.current.translation()
      const zombies = zombieSpawnerRef.current.getZombies()
      const currentTime = Date.now()

      zombies.forEach(zombie => {
        if (!zombie.isAlive) return

        // Get zombie position (we need to find its RigidBody, but for now we'll use stored position)
        const zombiePos = zombie.position
        
        // Calculate distance to zombie
        const distance = Math.sqrt(
          Math.pow(playerPosition.x - zombiePos[0], 2) +
          Math.pow(playerPosition.z - zombiePos[2], 2)
        )

        // Check if zombie is in damage range
        if (distance <= DAMAGE_RANGE) {
          const lastDamage = lastDamageTime[zombie.id] || 0
          
          // Apply damage if cooldown has passed
          if (currentTime - lastDamage >= DAMAGE_COOLDOWN) {
            setHealth(prevHealth => {
              const newHealth = Math.max(0, prevHealth - zombie.damage)
              console.log(`💥 Player took ${zombie.damage} damage! Health: ${newHealth}`)
              return newHealth
            })

            // Update damage cooldown for this zombie
            setLastDamageTime(prev => ({
              ...prev,
              [zombie.id]: currentTime
            }))
          }
        }
      })
    } catch (error) {
      console.warn('Error checking zombie damage:', error)
    }
  }

  // Game loop - runs every frame
  useFrame(() => {
    if (!rigidBodyRef.current) return

    // Check for zombie damage every frame
    checkZombieDamage()

    // Check if player died
    if (health <= 0 && !isGameOver) {
      setIsGameOver(true)
      console.log('💀 Game Over!')
      return
    }

    // Don't process movement if game is over
    if (isGameOver) return

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

  // Expose the rigidBodyRef and health functions to parent component
  React.useImperativeHandle(ref, () => ({
    // Expose RigidBody methods directly
    translation: () => rigidBodyRef.current?.translation(),
    setTranslation: (pos) => rigidBodyRef.current?.setTranslation(pos),
    linvel: () => rigidBodyRef.current?.linvel(),
    setLinvel: (vel) => rigidBodyRef.current?.setLinvel(vel),
    applyImpulse: (impulse, wake) => rigidBodyRef.current?.applyImpulse(impulse, wake),
    
    // Expose health and game state functions
    getHealth: () => health,
    isGameOver: () => isGameOver,
    resetGame: () => {
      setHealth(MAX_HEALTH)
      setIsGameOver(false)
      setLastDamageTime({})
      // Reset position if needed
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: 0, y: 2, z: 0 })
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 })
      }
    }
  }))

  // Return only 3D elements valid for R3F Canvas
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
          color={isGameOver ? "#666666" : "#4a90e2"}  // Gray when dead, blue when alive
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Simple "head" indicator */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial 
          color={isGameOver ? "#444444" : "#2c5aa0"}  // Darker when dead
          roughness={0.4}
        />
      </mesh>
    </RigidBody>
  )
})

Player.displayName = 'Player'

export default Player 