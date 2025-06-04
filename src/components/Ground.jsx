import React, { useRef, useMemo } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

export default function Ground() {
  const grassLayerRef = useRef()
  
  // Terrain configuration - 30x30 blocks with spacing (SMALLER SQUARE)
  const TERRAIN_WIDTH = 30   // 30 blocks wide (X-axis) - Half the previous size
  const TERRAIN_DEPTH = 30   // 30 blocks deep (Z-axis) - Half the previous size
  const BLOCK_SIZE = 2       // Each block is 2x2x2 (doubled in size)
  const SPACING = 2.08       // Spacing between blocks for dark edge effect (2 + 0.08 gap)
  const TOTAL_BLOCKS = TERRAIN_WIDTH * TERRAIN_DEPTH // 900 blocks
  
  // Generate instances for grass layer (y = 0) with spacing
  const grassLayerInstances = useMemo(() => {
    const tempObject = new THREE.Object3D()
    const instanceMatrix = []
    
    // Create a 60x36 grid of blocks with spacing
    for (let x = 0; x < TERRAIN_WIDTH; x++) {
      for (let z = 0; z < TERRAIN_DEPTH; z++) {
        // Position blocks with spacing to create dark gaps
        const posX = (x - TERRAIN_WIDTH / 2) * SPACING
        const posY = 0 // Grass layer at ground level
        const posZ = (z - TERRAIN_DEPTH / 2) * SPACING
        
        // Set position and scale for this instance
        tempObject.position.set(posX, posY, posZ)
        tempObject.scale.set(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
        tempObject.updateMatrix()
        
        // Store the matrix for this instance
        instanceMatrix.push(tempObject.matrix.clone())
      }
    }
    
    return instanceMatrix
  }, [])
  
  // Apply instance matrices to the grass layer InstancedMesh
  React.useEffect(() => {
    if (grassLayerRef.current) {
      grassLayerInstances.forEach((matrix, index) => {
        grassLayerRef.current.setMatrixAt(index, matrix)
      })
      grassLayerRef.current.instanceMatrix.needsUpdate = true
    }
  }, [grassLayerInstances])

  return (
    <>
      {/* DIRECTIONAL LIGHT - For dark edge shadows between blocks */}
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

      {/* GRASS LAYER BLOCKS - Surface where player walks */}
      <instancedMesh
        ref={grassLayerRef}
        args={[null, null, TOTAL_BLOCKS]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
        <meshStandardMaterial
          color="#4caf50"
          flatShading
          roughness={1}
          metalness={0}
        />
      </instancedMesh>

      {/* PHYSICS GROUND - Adjusted for spaced blocks */}
      <RigidBody 
        type="fixed"
        position={[0, 0.5, 0]} // At the top of the surface blocks
      >
        <CuboidCollider 
          args={[TERRAIN_WIDTH * SPACING / 2, 0.5, TERRAIN_DEPTH * SPACING / 2]}
        />
      </RigidBody>
    </>
  )
} 