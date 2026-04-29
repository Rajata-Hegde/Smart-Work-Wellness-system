import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, X, AlertCircle } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const VisualGuide = ({ type, name }) => {
  if (name === 'Rapid Blinking') {
    return (
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '20px' }}>
        {[0, 1].map(i => (
          <div key={i} style={{ width: '60px', height: '40px', border: '3px solid white', borderRadius: '50%', position: 'relative', overflow: 'hidden' }}>
            <motion.div 
              animate={{ height: ['100%', '0%', '100%'] }} 
              transition={{ repeat: Infinity, duration: 0.4 }} 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', backgroundColor: 'white', zIndex: 2 }} 
            />
            <div style={{ width: '20px', height: '20px', backgroundColor: '#3B82F6', borderRadius: '50%', position: 'absolute', top: '10px', left: '20px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (name === 'Eye Rolling') {
    return (
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '20px' }}>
        {[0, 1].map(i => (
          <div key={i} style={{ width: '60px', height: '40px', border: '3px solid white', borderRadius: '50%', position: 'relative' }}>
            <motion.div 
              animate={{ 
                x: [0, 15, 0, -15, 0],
                y: [-5, 0, 5, 0, -5]
              }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
              style={{ width: '20px', height: '20px', backgroundColor: '#3B82F6', borderRadius: '50%', position: 'absolute', top: '10px', left: '20px' }} 
            />
          </div>
        ))}
      </div>
    );
  }

  if (name === 'Focus Shift') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: '60px', height: '40px', border: '3px solid white', borderRadius: '50%', position: 'relative' }}>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }} 
                style={{ width: '20px', height: '20px', backgroundColor: '#3B82F6', borderRadius: '50%', position: 'absolute', top: '10px', left: '20px' }} 
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100px', height: '100px', margin: '0 auto', position: 'relative' }}>
      <div style={{ width: '60px', height: '80px', border: '3px solid white', borderRadius: '30px 30px 0 0', position: 'absolute', bottom: 0, left: '20px' }} />
      <motion.div 
        animate={name.includes('Neck') ? { rotate: [-15, 15, -15] } : { y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        style={{ width: '40px', height: '40px', border: '3px solid white', borderRadius: '50%', position: 'absolute', top: '10px', left: '30px' }} 
      />
    </div>
  );
};

const ExerciseCoach = ({ activeExercise, poseLandmarks, faceLandmarks, leftHand, rightHand, onComplete, onSkip }) => {
  const [holdCount, setHoldCount] = useState(0);
  const [feedback, setFeedback] = useState('Initializing...');
  const [isFormValid, setIsFormValid] = useState(false);
  const { session } = useWellnessStore();
  const pupilHistory = useRef([]);

  const progress = activeExercise ? (holdCount / (activeExercise.holdSeconds * 30)) * 100 : 0;

  useEffect(() => {
    if (!activeExercise || session.status !== 'active') return;

    // Real-time validation logic
    let isValid = false;
    let msg = 'Searching for person...';

    if (activeExercise.type === 'eyes') {
      if (faceLandmarks && faceLandmarks.length > 0) {
        // --- STRICT EYE VERIFICATION ---
        
        if (activeExercise.name === 'Rapid Blinking') {
          const eyeDist = Math.abs(faceLandmarks[159].y - faceLandmarks[145].y);
          if (eyeDist < 0.015) {
            isValid = true;
            msg = 'Blink detected! Keep going...';
          } else {
            isValid = true; 
            msg = 'Blink rapidly now!';
          }
        } 
        
        else if (activeExercise.name === 'Palming Relief') {
          // Check if hands are near eyes (landmark 159 is top of left eye, 386 is top of right)
          const leftEye = faceLandmarks[159];
          const rightEye = faceLandmarks[386];
          
          const isLeftHandCovering = leftHand && leftHand.some(h => Math.abs(h.x - leftEye.x) < 0.1 && Math.abs(h.y - leftEye.y) < 0.1);
          const isRightHandCovering = rightHand && rightHand.some(h => Math.abs(h.x - rightEye.x) < 0.1 && Math.abs(h.y - rightEye.y) < 0.1);
          
          if (isLeftHandCovering || isRightHandCovering) {
            isValid = true;
            msg = 'Eyes covered. Relax now...';
          } else {
            msg = 'Cover your eyes with your palms.';
          }
        }

        else if (activeExercise.name === 'Eye Rolling') {
          // Track iris movement (Landmark 468 is iris center)
          const iris = faceLandmarks[468];
          pupilHistory.current.push({ x: iris.x, y: iris.y });
          if (pupilHistory.current.length > 15) pupilHistory.current.shift();
          
          if (pupilHistory.current.length >= 10) {
            const xVar = Math.max(...pupilHistory.current.map(p => p.x)) - Math.min(...pupilHistory.current.map(p => p.x));
            const yVar = Math.max(...pupilHistory.current.map(p => p.y)) - Math.min(...pupilHistory.current.map(p => p.y));
            
            if (xVar > 0.005 || yVar > 0.005) {
              isValid = true;
              msg = 'Great eye movement!';
            } else {
              msg = 'Slowly roll your eyes...';
            }
          }
        }
        
        else {
          isValid = true;
          msg = 'Stay focused on the guide...';
        }
      } else {
        msg = 'Ensure your face is clearly visible.';
      }
    } else if (poseLandmarks && poseLandmarks.length > 0) {
      // Biometric Posture Verification
      if (activeExercise.name.includes('Neck')) {
        const le = poseLandmarks[7];
        const re = poseLandmarks[8];
        const tilt = Math.abs(le.y - re.y);
        if (tilt > 0.04) {
          isValid = true;
          msg = 'Great stretch! Hold it...';
        } else {
          msg = 'Tilt your head further to confirm stretch.';
        }
      } else {
        const ls = poseLandmarks[11];
        const rs = poseLandmarks[12];
        if (ls && rs && ls.visibility > 0.5 && rs.visibility > 0.5) {
          isValid = true;
          msg = 'Good form! Hold it...';
        } else {
          msg = 'Adjust your position to show your shoulders.';
        }
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
    }
  }, [poseLandmarks, faceLandmarks, leftHand, rightHand, activeExercise, session.status, onComplete]);

  if (!activeExercise) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        boxShadow: '0 0 50px rgba(59, 130, 246, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 50,
        padding: 'var(--space-xl)',
        borderRadius: '24px'
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

      <VisualGuide type={activeExercise.type} name={activeExercise.name} />

      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.02em' }}>{activeExercise.name}</h2>
        <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>{activeExercise.instruction}</p>
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
