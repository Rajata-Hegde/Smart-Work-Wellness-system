import React, { useState, useEffect } from 'react';
import { Wind } from 'lucide-react';

const MicroRecovery = ({ onComplete }) => {
  const [phase, setPhase] = useState('Inhale'); // Inhale, Hold, Exhale
  const [counter, setCounter] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(c => {
        if (c <= 1) {
          if (phase === 'Inhale') { setPhase('Hold'); return 4; }
          if (phase === 'Hold') { setPhase('Exhale'); return 4; }
          if (phase === 'Exhale') { onComplete(); return 0; }
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      backdropFilter: 'blur(10px)',
      animation: 'fade-in 0.5s ease'
    }}>
      <div style={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        border: '4px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '40px'
      }}>
        {/* Animated Circle */}
        <div style={{
          width: phase === 'Inhale' ? '180px' : phase === 'Exhale' ? '80px' : '180px',
          height: phase === 'Inhale' ? '180px' : phase === 'Exhale' ? '80px' : '180px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          transition: 'all 4s linear',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Wind size={48} />
        </div>
        
        <div style={{ position: 'absolute', bottom: '-80px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{phase}</h2>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '8px' }}>{counter}</div>
        </div>
      </div>

      <p style={{ maxWidth: '300px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
        Micro-Recovery Protocol Active. Follow the breathing guide to reset your stress levels.
      </p>

      <button 
        onClick={onComplete}
        style={{ marginTop: '60px', background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer' }}
      >
        SKIP PROTOCOL
      </button>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default MicroRecovery;
