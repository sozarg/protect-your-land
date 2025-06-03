import React, { useState, useEffect, useCallback } from 'react'

export default function WaveSystem({ zombieSpawnerRef }) {
  // Wave system state
  const [currentWave, setCurrentWave] = useState(1)
  const [timeUntilNextWave, setTimeUntilNextWave] = useState(120) // 120 seconds = 2 minutes
  const [isWaveActive, setIsWaveActive] = useState(false)

  // Configuration
  const WAVE_INTERVAL = 120 // seconds between waves
  const WAVE_PREPARATION_TIME = 10 // seconds of preparation time

  // Function to handle new wave logic (ready for enemy spawning)
  const onNewWave = useCallback((waveNumber) => {
    console.log(`🌊 Starting Wave ${waveNumber}!`)
    
    // Spawn zombies using the ZombieSpawner ref
    if (zombieSpawnerRef && zombieSpawnerRef.current) {
      zombieSpawnerRef.current.spawnWave(waveNumber)
    }
    
    // Set wave as active for a short time (visual feedback)
    setIsWaveActive(true)
    setTimeout(() => setIsWaveActive(false), 3000) // Active state for 3 seconds
  }, [zombieSpawnerRef])

  // Start new wave function
  const startNewWave = useCallback(() => {
    const newWaveNumber = currentWave + 1
    setCurrentWave(newWaveNumber)
    setTimeUntilNextWave(WAVE_INTERVAL)
    onNewWave(newWaveNumber)
  }, [currentWave, onNewWave])

  // Manual wave advance
  const advanceWaveManually = () => {
    startNewWave()
  }

  // Timer effect - runs every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeUntilNextWave(prev => {
        if (prev <= 1) {
          // Time reached 0, start new wave
          startNewWave()
          return WAVE_INTERVAL // Reset timer
        }
        return prev - 1 // Countdown
      })
    }, 1000) // Update every second

    // Cleanup timer on unmount
    return () => clearInterval(timer)
  }, [startNewWave])

  // Format time display (mm:ss)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Determine display status
  const getWaveStatus = () => {
    if (isWaveActive) return 'WAVE STARTING!'
    if (timeUntilNextWave <= WAVE_PREPARATION_TIME) return 'PREPARE!'
    return 'NEXT WAVE IN'
  }

  // Get zombie count for display
  const getZombieCount = () => {
    if (zombieSpawnerRef && zombieSpawnerRef.current) {
      return zombieSpawnerRef.current.getZombieCount()
    }
    return 0
  }

  return (
    <div style={styles.container}>
      {/* Wave Information Display */}
      <div style={styles.waveInfo}>
        <div style={styles.waveNumber}>
          Wave {currentWave}
        </div>
        
        <div style={styles.status}>
          {getWaveStatus()}
        </div>
        
        <div style={styles.countdown}>
          {isWaveActive ? '🌊' : formatTime(timeUntilNextWave)}
        </div>

        {/* Zombie count display */}
        <div style={styles.zombieCount}>
          Zombies: {getZombieCount()}
        </div>
      </div>

      {/* Manual Wave Advance Button */}
      <button 
        onClick={advanceWaveManually}
        style={{
          ...styles.advanceButton,
          ...(timeUntilNextWave <= WAVE_PREPARATION_TIME ? styles.advanceButtonUrgent : {})
        }}
      >
        Start Wave {currentWave + 1}
      </button>

      {/* Wave Status Indicator */}
      {isWaveActive && (
        <div style={styles.waveActiveIndicator}>
          ⚔️ ENEMIES INCOMING! ⚔️
        </div>
      )}
    </div>
  )
}

// Styles object for the UI components
const styles = {
  container: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 100,
    fontFamily: 'system-ui, sans-serif',
    color: '#ffffff',
    userSelect: 'none',
    pointerEvents: 'auto', // Enable interaction
  },

  waveInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '15px 20px',
    borderRadius: '8px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '10px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },

  waveNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: '8px',
    textAlign: 'center',
  },

  status: {
    fontSize: '14px',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: '5px',
    fontWeight: '500',
  },

  countdown: {
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF6B6B',
    fontFamily: 'monospace',
    marginBottom: '8px',
  },

  zombieCount: {
    fontSize: '14px',
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '500',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '8px',
  },

  advanceButton: {
    backgroundColor: '#2196F3',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
  },

  advanceButtonUrgent: {
    backgroundColor: '#FF5722',
    animation: 'pulse 1s infinite',
    boxShadow: '0 2px 8px rgba(255, 87, 34, 0.5)',
  },

  waveActiveIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    color: '#ffffff',
    padding: '20px 40px',
    borderRadius: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(255, 0, 0, 0.5)',
    border: '3px solid #ffffff',
  }
} 