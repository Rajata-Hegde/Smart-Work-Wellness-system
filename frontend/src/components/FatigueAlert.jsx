import { useState, useEffect, useRef } from 'react';
import { analyzeEyes, detectYawn } from '../utils/eyeAnalysis';
import { analyzeAttention } from '../utils/attentionAnalysis';

const FatigueAlert = ({ faceLandmarks, poseLandmarks }) => {
  const [alerts, setAlerts] = useState([]);
  const [breakTimer, setBreakTimer] = useState(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState(20);
  const [blinkRate, setBlinkRate] = useState(0);
  const sessionStateRef = useRef({});
  const voiceFeedbackRef = useRef({});

  useEffect(() => {
    if (!faceLandmarks) return;

    const eyeAnalysis = analyzeEyes(faceLandmarks, sessionStateRef.current);
    setBlinkRate(eyeAnalysis.blinkRate);

    const yawnAnalysis = detectYawn(faceLandmarks, sessionStateRef.current);
    const attentionAnalysis = analyzeAttention(faceLandmarks, sessionStateRef.current);

    const newAlerts = [];

    if (eyeAnalysis.eyeFatigue) {
      newAlerts.push({
        id: 'fatigue',
        type: 'fatigue',
        message: '👁️ Eye fatigue detected — blink more',
      });

      if (!voiceFeedbackRef.current.fatigueSaid) {
        speakAlert('Blink more frequently');
        voiceFeedbackRef.current.fatigueSaid = true;
      }
    } else {
      voiceFeedbackRef.current.fatigueSaid = false;
    }

    if (eyeAnalysis.triggerBreak && !breakTimer) {
      newAlerts.push({
        id: 'break',
        type: 'break',
        message: '🕐 20-20-20 Break Time! Look 20 feet away for 20 seconds.',
      });

      setBreakTimer(true);
      setBreakTimeLeft(20);

      if (!voiceFeedbackRef.current.breakSaid) {
        speakAlert('Take a break, look away');
        voiceFeedbackRef.current.breakSaid = true;
      }
    }

    if (yawnAnalysis.yawnDetected) {
      newAlerts.push({
        id: 'yawn',
        type: 'yawn',
        message: '😴 You seem tired, take a break',
      });

      if (!voiceFeedbackRef.current.yawnSaid) {
        speakAlert('You seem tired, take a break');
        voiceFeedbackRef.current.yawnSaid = true;
      }
    } else {
      voiceFeedbackRef.current.yawnSaid = false;
    }

    if (attentionAnalysis.lookingAway) {
      newAlerts.push({
        id: 'attention',
        type: 'attention',
        message: '🔍 Low focus detected — look back at screen',
      });

      if (!voiceFeedbackRef.current.attentionSaid) {
        speakAlert('Focus on the screen');
        voiceFeedbackRef.current.attentionSaid = true;
      }
    } else {
      voiceFeedbackRef.current.attentionSaid = false;
    }

    setAlerts(newAlerts);
  }, [faceLandmarks, breakTimer]);

  useEffect(() => {
    if (!breakTimer) return;

    if (breakTimeLeft <= 0) {
      setBreakTimer(null);
      speakAlert('Break time complete');
      voiceFeedbackRef.current.breakSaid = false;
      return;
    }

    const interval = setInterval(() => {
      setBreakTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [breakTimer, breakTimeLeft]);

  const closeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const speakAlert = (message) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fatigue-alert">
      {alerts.length === 0 ? (
        <div className="card">
          <h3>👀 Eye Health</h3>
          <div className="blink-stats">
            <div className="stat-item">
              <div className="stat-label">Blink Rate</div>
              <div className="stat-value">{blinkRate} /min</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ color: blinkRate >= 10 ? '#22c55e' : '#eab308' }}>
                {blinkRate >= 10 ? 'Healthy' : 'Low'}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {breakTimer && (
        <div className="card">
          <h3>20-20-20 Break Timer</h3>
          <div className="timer-display">{breakTimeLeft}s</div>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#b0b0b0' }}>
            Look at something 20 feet away
          </p>
        </div>
      )}

      {alerts.map((alert) => (
        <div key={alert.id} className={`alert-banner ${alert.type}`}>
          <div className="alert-text">{alert.message}</div>
          <button className="alert-close" onClick={() => closeAlert(alert.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default FatigueAlert;

