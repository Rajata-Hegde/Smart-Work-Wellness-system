import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, X, AlertCircle } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const ExerciseCoach = ({ activeExercise, poseLandmarks, onComplete, onSkip }) => {
  const [holdCount, setHoldCount] = useState(0);
  const [feedback, setFeedback] = useState('Initializing...');
  const [isFormValid, setIsFormValid] = useState(false);
  const { session } = useWellnessStore();

  const progress = activeExercise ? (holdCount / (activeExercise.holdSeconds * 30)) * 100 : 0;

  useEffect(() => {
    if (!activeExercise || session.status !== 'active') return;

    // Real-time validation logic
    let isValid = false;
    let msg = 'Searching for pose...';

    if (poseLandmarks && poseLandmarks.length > 0) {
      // Basic check: Are shoulders visible?
      const ls = poseLandmarks[11];
      const rs = poseLandmarks[12];
      
      if (ls && rs && ls.visibility > 0.5 && rs.visibility > 0.5) {
        isValid = true;
        msg = 'Good form! Hold it...';
      } else {
        msg = 'Adjust your position to show your shoulders.';
      }
    }

    setIsFormValid(isValid);
    setFeedback(msg);

    if (isValid) {
      setHoldCount(prev => {
        const next = prev + 1;
        if (next >= activeExercise.holdSeconds * 30) {
          if (onComplete) onComplete();
          return 0;
        }
        return next;
      });
    } else {
      // Optionally reset hold if form is lost for too long
      // setHoldCount(0); 
    }
  }, [poseLandmarks, activeExercise, session.status, onComplete]);

  if (!activeExercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card"
      style={{
        backgroundColor: 'var(--primary)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
            <RotateCcw size={16} />
          </div>
          <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>Active Session</span>
        </div>
        <button onClick={onSkip} style={{ color: 'rgba(255,255,255,0.6)' }}><X size={18} /></button>
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '4px', letterSpacing: '-0.02em' }}>{activeExercise.name}</h2>
        <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{activeExercise.instruction}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', margin: '4px 0' }}>
        <div style={{ flex: 1, height: '100%', minHeight: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <motion.div 
              style={{ height: '100%', backgroundColor: isFormValid ? 'var(--success)' : 'var(--warning)', width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', minWidth: '80px', textAlign: 'right' }}>
          {Math.floor(holdCount / 30)}s
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {isFormValid ? <CheckCircle2 size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--warning)" />}
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{feedback}</span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: '4px' }}>
        <button 
          onClick={onSkip}
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase'
          }}
        >
          Skip
        </button>
        <button 
          onClick={() => setHoldCount(0)}
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'white',
            color: 'black',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase'
          }}
        >
          Reset
        </button>
      </div>
    </motion.div>
  );
};

export default ExerciseCoach;
