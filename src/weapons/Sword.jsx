import React from 'react'

const Sword = ({ isEquipped = false, attackAnimation = false }) => {
  // If not equipped, don't render anything
  if (!isEquipped) {
    return null
  }

  return (
    <group 
      position={[0.6, -0.2, 0]} // Adjusted for Adventurer right hand
      rotation={[
        0, 
        Math.PI / 4, // Slight angle outward
        attackAnimation ? -Math.PI / 2 : Math.PI / 6 // Attack swing animation
      ]}
    >
      {/* Sword Blade - Long and sharp */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.06, 1.2, 0.02]} />
        <meshStandardMaterial 
          color="#C0C0C0" // Silver metallic
          metalness={0.8}
          roughness={0.2}
          emissive={attackAnimation ? "#DDDDDD" : "#000000"} // Slight glow when attacking
          emissiveIntensity={attackAnimation ? 0.3 : 0}
        />
      </mesh>
      
      {/* Crossguard - Horizontal protection */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.08, 0.06]} />
        <meshStandardMaterial 
          color="#404040" // Dark gray
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* Handle/Grip - Wooden wrap */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial 
          color="#8B4513" // Dark brown wood
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Pommel - Golden weight at end */}
      <mesh position={[0, -0.35, 0]} castShadow>
        <sphereGeometry args={[0.06]} />
        <meshStandardMaterial 
          color="#DAA520" // Golden
          metalness={0.7}
          roughness={0.3}
          emissive={attackAnimation ? "#FFD700" : "#000000"} // Golden glow when attacking
          emissiveIntensity={attackAnimation ? 0.2 : 0}
        />
      </mesh>

      {/* Attack Energy Effect - Only during attack */}
      {attackAnimation && (
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.12]} />
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}

export default Sword 