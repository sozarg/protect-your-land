import React, { useState, useEffect } from 'react'

export default function WeaponShopUI() {
  const [shopState, setShopState] = useState({
    isPlayerNear: false,
    showObtainedMessage: false,
    playerHasSword: false
  })

  // Poll the global shop state
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.__weaponShopState) {
        setShopState(window.__weaponShopState)
      }
    }, 50) // Check every 50ms for smooth updates

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* INTERACTION MESSAGE */}
      {shopState.isPlayerNear && !shopState.playerHasSword && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '10px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 1000,
          border: '2px solid #ffd700',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}>
          🗡️ Presiona E para obtener la Sword
        </div>
      )}

      {/* OBTAINED MESSAGE */}
      {shopState.showObtainedMessage && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 128, 0, 0.9)',
          color: 'white',
          padding: '20px 30px',
          borderRadius: '15px',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 1001,
          border: '3px solid #00ff00',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.4)',
          animation: 'fadeInOut 2s ease-in-out'
        }}>
          ✅ ¡Espada obtenida!
        </div>
      )}
    </>
  )
} 