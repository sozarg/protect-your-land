import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

const ZombieSpawner = forwardRef(({ playerRef }, ref) => {
  // State to manage active zombies
  const [zombies, setZombies] = useState([])
  // New: Store zombie RigidBody references for attack system
  const zombieRefs = useRef(new Map()) // Map of zombieId -> rigidBodyRef

  // Configuration
  const SPAWN_RADIUS = 8 // Distance from center where zombies spawn
  const ZOMBIE_BASE_COUNT = 2 // Base number of zombies per wave
  const ZOMBIE_SCALE_FACTOR = 1.5 // Multiplier for additional zombies per wave
  const MAX_ZOMBIE_SPEED = 3 // Maximum speed limit for zombies

  // Generate random spawn position around the map edges
  const generateSpawnPosition = () => {
    const angle = Math.random() * Math.PI * 2 // Random angle in radians
    const distance = SPAWN_RADIUS + Math.random() * 2 // Spawn at edge + some variance
    
    return {
      x: Math.cos(angle) * distance,
      y: 3, // Spawn well above the elevated terrain
      z: Math.sin(angle) * distance
    }
  }

  // Generate unique zombie ID
  const generateZombieId = () => {
    return `zombie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create a new zombie object
  const createZombie = (waveNumber) => {
    const position = generateSpawnPosition()
    
    return {
      id: generateZombieId(),
      position: [position.x, position.y, position.z],
      waveNumber: waveNumber,
      type: 'basic', // Ready for different zombie types
      health: 100,
      speed: 1 + (waveNumber * 0.1), // Slightly faster each wave
      damage: 10 + (waveNumber * 2), // More damage each wave
      isAlive: true
    }
  }

  // Main spawn function - called by WaveSystem
  const spawnWave = (waveNumber) => {
    const zombieCount = Math.floor(ZOMBIE_BASE_COUNT + (waveNumber * ZOMBIE_SCALE_FACTOR))
    const newZombies = []

    console.log(`🧟 Spawning ${zombieCount} zombies for Wave ${waveNumber}`)

    // Generate the specified number of zombies
    for (let i = 0; i < zombieCount; i++) {
      const zombie = createZombie(waveNumber)
      newZombies.push(zombie)
    }

    // Add new zombies to the existing list
    setZombies(prevZombies => [...prevZombies, ...newZombies])

    return newZombies // Return for potential use by caller
  }

  // Remove a zombie (for when they're defeated)
  const removeZombie = (zombieId) => {
    setZombies(prevZombies => prevZombies.filter(zombie => zombie.id !== zombieId))
    // Clean up zombie reference
    zombieRefs.current.delete(zombieId)
  }

  // Clear all zombies (useful for restarting)
  const clearAllZombies = () => {
    setZombies([])
    // Clear all zombie references
    zombieRefs.current.clear()
  }

  // New: Get zombie references for attack system
  const getZombieRefs = () => {
    return zombieRefs.current
  }

  // New: Damage a zombie
  const damageZombie = (zombieId, damage = 100) => {
    setZombies(prevZombies => 
      prevZombies.map(zombie => {
        if (zombie.id === zombieId) {
          const newHealth = Math.max(0, zombie.health - damage)
          if (newHealth <= 0) {
            // Mark as dead
            return { ...zombie, health: 0, isAlive: false }
          }
          return { ...zombie, health: newHealth }
        }
        return zombie
      })
    )
  }

  // Expose functions to parent component via ref
  useImperativeHandle(ref, () => ({
    spawnWave,
    removeZombie,
    clearAllZombies,
    getZombieCount: () => zombies.length,
    getZombies: () => zombies,
    getZombieRefs, // New: For attack system
    damageZombie   // New: For attack system
  }))

  // Individual Zombie Component with AI movement
  const ZombieEntity = ({ zombie }) => {
    const zombieRigidBodyRef = useRef()

    // Register this zombie's reference when component mounts
    useEffect(() => {
      if (zombieRigidBodyRef.current) {
        zombieRefs.current.set(zombie.id, zombieRigidBodyRef.current)
      }
      
      // Cleanup when component unmounts
      return () => {
        zombieRefs.current.delete(zombie.id)
      }
    }, [zombie.id])

    // AI Movement - runs every frame
    useFrame(() => {
      // Early return if no player reference or zombie rigid body
      if (!playerRef || !playerRef.current || !zombieRigidBodyRef.current) {
        return
      }

      try {
        // Get current positions
        const zombiePosition = zombieRigidBodyRef.current.translation()
        const playerPosition = playerRef.current.translation()

        // Verify that playerPosition is valid
        if (!playerPosition) {
          return
        }

        // Calculate direction vector from zombie to player
        const directionX = playerPosition.x - zombiePosition.x
        const directionZ = playerPosition.z - zombiePosition.z

        // Calculate distance to player (for normalization)
        const distance = Math.sqrt(directionX * directionX + directionZ * directionZ)

        // Only move if player is not too close (prevent overlapping)
        if (distance > 0.5) {
          // Normalize direction vector (make it unit length)
          const normalizedX = directionX / distance
          const normalizedZ = directionZ / distance

          // Apply zombie speed multiplier
          const moveSpeedX = normalizedX * zombie.speed
          const moveSpeedZ = normalizedZ * zombie.speed

          // Limit maximum speed
          const finalSpeedX = Math.max(-MAX_ZOMBIE_SPEED, Math.min(MAX_ZOMBIE_SPEED, moveSpeedX))
          const finalSpeedZ = Math.max(-MAX_ZOMBIE_SPEED, Math.min(MAX_ZOMBIE_SPEED, moveSpeedZ))

          // Get current velocity to preserve Y component
          const currentVelocity = zombieRigidBodyRef.current.linvel()

          // Set new velocity (preserve Y for physics like falling/jumping)
          zombieRigidBodyRef.current.setLinvel({
            x: finalSpeedX,
            y: currentVelocity.y, // Keep vertical velocity intact
            z: finalSpeedZ
          })
        } else {
          // If too close, stop horizontal movement but keep Y velocity
          const currentVelocity = zombieRigidBodyRef.current.linvel()
          zombieRigidBodyRef.current.setLinvel({
            x: 0,
            y: currentVelocity.y,
            z: 0
          })
        }
      } catch (error) {
        // Handle any potential errors gracefully
        console.warn('Zombie movement error:', error)
      }
    })

    return (
      <RigidBody
        ref={zombieRigidBodyRef}
        type="dynamic"
        position={zombie.position}
        enabledRotations={[false, true, false]} // Prevent tipping over
        key={zombie.id}
      >
        {/* Physics collider */}
        <CuboidCollider args={[0.4, 0.8, 0.4]} />
        
        {/* Visual representation - Main body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.6, 0.8]} />
          <meshStandardMaterial 
            color="#8B0000"           // Dark red
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Zombie head */}
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial 
            color="#A52A2A"           // Slightly lighter red
            roughness={0.8}
          />
        </mesh>

        {/* Eyes (simple white dots) */}
        <mesh position={[-0.1, 1.1, 0.25]} castShadow>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.1, 1.1, 0.25]} castShadow>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>

        {/* Arms (simple cylinders) */}
        <mesh position={[-0.6, 0.3, 0]} rotation={[0, 0, Math.PI/6]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.8]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
        <mesh position={[0.6, 0.3, 0]} rotation={[0, 0, -Math.PI/6]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.8]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>
      </RigidBody>
    )
  }

  // Render all active zombies
  return (
    <>
      {zombies.map(zombie => (
        zombie.isAlive && (
          <ZombieEntity 
            key={zombie.id} 
            zombie={zombie}
          />
        )
      ))}
    </>
  )
})

// Set display name for debugging
ZombieSpawner.displayName = 'ZombieSpawner'

export default ZombieSpawner 