import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'

export default function Ground({ 
  width = 30, 
  height = 30, 
  blockSize = 2, 
  spacing = 2.08,
  color = "#4caf50"
}) {
  const grassLayerRef = useRef()
  
  const TOTAL_BLOCKS = width * height
  
  // Generate instances for grass layer (y = 0) with spacing
  const grassLayerInstances = useMemo(() => {
    const tempObject = new THREE.Object3D()
    const instanceMatrix = []
    
    // Create a grid of blocks with spacing
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < height; z++) {
        // Position blocks with spacing to create dark gaps
        const posX = (x - width / 2) * spacing
        const posY = 0 // Grass layer at ground level
        const posZ = (z - height / 2) * spacing
        
        // Set position and scale for this instance
        tempObject.position.set(posX, posY, posZ)
        tempObject.scale.set(blockSize, blockSize, blockSize)
        tempObject.updateMatrix()
        
        // Store the matrix for this instance
        instanceMatrix.push(tempObject.matrix.clone())
      }
    }
    
    return instanceMatrix
  }, [width, height, blockSize, spacing])
  
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
    <group position={[0, 1, 0]}>
      <instancedMesh
        ref={grassLayerRef}
        args={[null, null, TOTAL_BLOCKS]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[blockSize, blockSize, blockSize]} />
        <meshStandardMaterial
          color={color}
          flatShading
          roughness={1}
          metalness={0}
        />
      </instancedMesh>
    </group>
  )
} 