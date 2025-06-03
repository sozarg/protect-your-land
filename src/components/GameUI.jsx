import React from 'react'

export default function GameUI({ playerRef }) {
  // Get player health and game state
  const getPlayerHealth = () => {
    if (playerRef?.current?.getHealth) {
      return playerRef.current.getHealth()
    }
    return 100
  }

  const getIsGameOver = () => {
    if (playerRef?.current?.isGameOver) {
      return playerRef.current.isGameOver()
    }
    return false
  }

  const health = getPlayerHealth()
  const isGameOver = getIsGameOver()
  const MAX_HEALTH = 100

  // Health bar component
  const HealthBar = () => (
    <div style={healthBarStyles.container}>
      <div style={healthBarStyles.label}>Health</div>
      <div style={healthBarStyles.barBackground}>
        <div 
          style={{
            ...healthBarStyles.barFill,
            width: `${(health / MAX_HEALTH) * 100}%`,
            backgroundColor: health > 60 ? '#4CAF50' : health > 30 ? '#FF9800' : '#F44336'
          }}
        />
      </div>
      <div style={healthBarStyles.healthText}>{health}/{MAX_HEALTH}</div>
    </div>
  )

  // Game Over overlay
  const GameOverOverlay = () => (
    isGameOver && (
      <div style={gameOverStyles.overlay}>
        <div style={gameOverStyles.container}>
          <h1 style={gameOverStyles.title}>💀 GAME OVER 💀</h1>
          <p style={gameOverStyles.subtitle}>You were overwhelmed by zombies!</p>
          <div style={gameOverStyles.stats}>
            <p>Final Health: {health}</p>
            <p>Press F5 to restart</p>
          </div>
        </div>
      </div>
    )
  )

  return (
    <>
      {/* Health Bar - HTML overlay */}
      <HealthBar />
      
      {/* Game Over Overlay - HTML overlay */}
      <GameOverOverlay />
    </>
  )
}

// Styles for health bar
const healthBarStyles = {
  container: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 200,
    fontFamily: 'system-ui, sans-serif',
    color: '#ffffff',
    userSelect: 'none',
  },

  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
    textAlign: 'center',
  },

  barBackground: {
    width: '200px',
    height: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative',
  },

  barFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
    borderRadius: '8px',
  },

  healthText: {
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '5px',
    fontFamily: 'monospace',
  }
}

// Styles for game over overlay
const gameOverStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  container: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    padding: '40px',
    borderRadius: '15px',
    border: '3px solid #F44336',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
  },

  title: {
    color: '#F44336',
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
  },

  subtitle: {
    color: '#ffffff',
    fontSize: '18px',
    margin: '0 0 30px 0',
  },

  stats: {
    color: '#cccccc',
    fontSize: '14px',
    lineHeight: '1.5',
  }
} 