import React, { useState, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

export default function WeaponShop({ playerRef }) {
  // State for managing shop interaction
  const [isPlayerNear, setIsPlayerNear] = useState(false)
  const [showObtainedMessage, setShowObtainedMessage] = useState(false)
  
  // Reference to the shop NPC RigidBody
  const shopRef = useRef()
  
  // Configuration
  const SHOP_POSITION = [8, 3, 8] // Slightly raised for the pedestal
  const INTERACTION_DISTANCE = 2.5
  const MESSAGE_DISPLAY_TIME = 2000 // 2 seconds

  // Check distance to player every frame
  useFrame(() => {
    if (!playerRef?.current || !shopRef.current) return

    try {
      const playerPosition = playerRef.current.translation()
      const shopPosition = shopRef.current.translation()
      
      // Calculate distance between player and shop
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - shopPosition.x, 2) +
        Math.pow(playerPosition.z - shopPosition.z, 2)
      )

      // Update near state based on distance
      const playerNear = distance <= INTERACTION_DISTANCE
      setIsPlayerNear(playerNear)
      
    } catch (error) {
      console.warn('WeaponShop distance check error:', error)
    }
  })

  // Handle keyboard input for interaction
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'e' && isPlayerNear) {
        // Check if player already has the sword
        if (playerRef?.current?.hasWeapon && playerRef.current.hasWeapon('Sword')) {
          return // Player already has the sword, do nothing
        }

        // Give the sword to the player
        if (playerRef?.current?.giveWeapon) {
          const success = playerRef.current.giveWeapon('Sword')
          
          if (success) {
            // Show obtained message
            setShowObtainedMessage(true)
            console.log('🗡️ Player obtained the Sword!')
            
            // Hide message after delay
            setTimeout(() => {
              setShowObtainedMessage(false)
            }, MESSAGE_DISPLAY_TIME)
          }
        }
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyPress)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPlayerNear, playerRef])

  // Expose shop state for external UI rendering
  React.useEffect(() => {
    // Store shop state in a global object for external access
    window.__weaponShopState = {
      isPlayerNear,
      showObtainedMessage,
      playerHasSword: playerRef?.current?.hasWeapon && playerRef.current.hasWeapon('Sword')
    }
  }, [isPlayerNear, showObtainedMessage, playerRef])

  return (
    <>
      {/* NPC SHOP KEEPER - ONLY 3D ELEMENTS */}
      <RigidBody
        ref={shopRef}
        type="fixed"
        position={SHOP_POSITION}
      >
        {/* Shop collider for physics */}
        <CuboidCollider args={[0.5, 1.5, 0.5]} />
        
        {/* PEDESTAL BASE */}
        <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.4, 8]} />
          <meshStandardMaterial 
            color="#2F4F4F"  // Dark slate gray for stone pedestal
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Visual representation - Shop Keeper Body (Medieval Merchant Outfit) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial 
            color="#D2691E"  // Chocolate/burnt orange for medieval merchant clothing
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>

        {/* Merchant Belt/Apron */}
        <mesh position={[0, 0, 0.51]} castShadow>
          <boxGeometry args={[0.9, 1.5, 0.05]} />
          <meshStandardMaterial 
            color="#8B4513"  // Brown leather apron
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Shop Keeper Head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.4]} />
          <meshStandardMaterial 
            color="#DDBEA9"  // Warmer skin tone
            roughness={0.7}
          />
        </mesh>

        {/* Merchant Hat */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.25, 0.3, 8]} />
          <meshStandardMaterial 
            color="#654321"  // Dark brown hat
            roughness={0.8}
          />
        </mesh>

        {/* Shop Sign Background */}
        <mesh position={[0, 2.8, 0]} castShadow>
          <boxGeometry args={[2, 0.6, 0.1]} />
          <meshStandardMaterial 
            color="#654321"  // Dark brown for sign background
            roughness={0.9}
          />
        </mesh>

        {/* ALTERNATIVE SIMPLE SHOP INDICATOR - Using simple geometry instead of Text */}
        {/* Shop Icon - Simple geometric representation */}
        <mesh position={[0, 2.8, 0.06]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.3]} />
          <meshStandardMaterial 
            color="#FFD700"  // Gold color for shop indicator
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Shop Symbol - Diamond shape */}
        <mesh position={[0, 2.8, 0.08]} rotation={[0, 0, Math.PI/4]} castShadow>
          <boxGeometry args={[0.15, 0.15, 0.02]} />
          <meshStandardMaterial 
            color="#FFD700"  // Gold color
            emissive="#FFD700"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* ENHANCED SWORD DISPLAY */}
        {/* Sword Blade */}
        <mesh position={[0.8, 1.8, 0]} rotation={[0, 0, Math.PI/6]} castShadow>
          <boxGeometry args={[0.08, 1.4, 0.03]} />
          <meshStandardMaterial 
            color="#E6E6FA"  // Lavender silver for polished blade
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Sword Crossguard */}
        <mesh position={[0.69, 1.15, 0]} rotation={[0, 0, Math.PI/6]} castShadow>
          <boxGeometry args={[0.4, 0.08, 0.05]} />
          <meshStandardMaterial 
            color="#B8860B"  // Dark goldenrod for crossguard
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Sword Handle (Enhanced) */}
        <mesh position={[0.59, 0.95, 0]} rotation={[0, 0, Math.PI/6]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
          <meshStandardMaterial 
            color="#DAA520"  // Old gold for handle
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* Sword Pommel */}
        <mesh position={[0.50, 0.75, 0]} rotation={[0, 0, Math.PI/6]} castShadow>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial 
            color="#B8860B"  // Dark goldenrod matching crossguard
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Weapon Display Stand */}
        <mesh position={[0.8, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.1, 0.1, 1, 6]} />
          <meshStandardMaterial 
            color="#654321"  // Dark brown wood
            roughness={0.8}
          />
        </mesh>
      </RigidBody>
    </>
  )
} 