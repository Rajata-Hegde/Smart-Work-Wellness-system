import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import useWellnessStore from './store/useWellnessStore';
import DashboardLayout from './components/layouts/DashboardLayout';
import LandingPage from './components/landing/LandingPage';
import Webcam from './components/Webcam';
import ScoreCard from './components/dashboard/ScoreCard';
import AlertsPanel from './components/dashboard/AlertsPanel';
import ExerciseCoach from './components/dashboard/ExerciseCoach';
import AnalyticsDashboard from './components/dashboard/AnalyticsDashboard';
import AICoach from './components/dashboard/AICoach';
import HydrationTracker from './components/dashboard/HydrationTracker';

// New Components
import RPGPanel from './components/dashboard/RPGPanel';
import StateBadge from './components/dashboard/StateBadge';
import EnvironmentCard from './components/dashboard/EnvironmentCard';
import TodayJourney from './components/dashboard/TodayJourney';
import MicroRecovery from './components/dashboard/MicroRecovery';
import PostureDetails from './components/dashboard/PostureDetails';

// Icons
import { LayoutDashboard, Eye, Target, Zap, Waves, Brain, Moon, User, Clock, Droplets, ShieldCheck } from 'lucide-react';

// Utils
import { analyzePosture, startCalibration, processCalibrationFrame } from './utils/postureAnalysis';
import { analyzeEyes, detectYawn } from './utils/eyeAnalysis';
import { analyzeAttention } from './utils/attentionAnalysis';
import { analyzeStress } from './utils/stressAnalysis';
import { analyzeEnvironment } from './utils/environmentAnalysis';
import { analyzeFlow, getBodyLanguageState } from './utils/flowAnalysis';

function App() {
  const [started, setStarted] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [recoveryActive, setRecoveryActive] = useState(false);
  
  const { 
    session, 
    scores, 
    updateScores, 
    updateDetections, 
    addAlert, 
    addHistorySnapshot, 
    activeExercise,
    resetSession,
    setSessionStatus,
    setBodyLanguage,
    setStressIndex,
    setEnvironmentScore,
    addXP,
    addTimelineEvent,
    detections,
    rpg,
    bodyLanguageState,
    settings,
    setIsHorizontal
  } = useWellnessStore();

  const analysisStateRef = useRef({
    eyeData: null,
    latestResults: null,
    typing: { lastKeyTime: 0, intervals: [] }
  });

  const lastUpdateRef = useRef({ store: 0, history: 0, flow: 0, level: 1 });

  const speak = useCallback((text) => {
    if (!settings.voiceAlerts || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [settings.voiceAlerts]);

  useEffect(() => {
    const handleKeyDown = () => {
      const now = Date.now();
      if (analysisStateRef.current.typing.lastKeyTime > 0) {
        const interval = now - analysisStateRef.current.typing.lastKeyTime;
        if (interval < 2000) {
          analysisStateRef.current.typing.intervals.push(interval);
          if (analysisStateRef.current.typing.intervals.length > 20) analysisStateRef.current.typing.intervals.shift();
        }
      }
      analysisStateRef.current.typing.lastKeyTime = now;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const calculateTypingVariance = () => {
    const intervals = analysisStateRef.current.typing.intervals;
    if (intervals.length < 5) return 0;
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.map(i => Math.pow(i - avg, 2)).reduce((a, b) => a + b, 0) / intervals.length;
    return Math.sqrt(variance) / avg;
  };

  useEffect(() => {
    if (rpg.level > lastUpdateRef.current.level) {
      addAlert({ severity: 'success', message: `LEVEL UP! You reached level ${rpg.level}`, type: 'system' });
      speak(`Congratulations! You reached level ${rpg.level}`);
      lastUpdateRef.current.level = rpg.level;
    }
  }, [rpg.level, addAlert, speak]);

  useEffect(() => {
    if (bodyLanguageState === 'Overwhelmed' && !recoveryActive) {
      setRecoveryActive(true);
      speak("You seem overwhelmed. Starting micro-recovery protocol.");
    }
  }, [bodyLanguageState, recoveryActive, speak]);

  const handleDetectionResults = useCallback((results) => {
    if (!results) return;
    analysisStateRef.current.latestResults = results;

    if (calibrating) {
      const done = processCalibrationFrame(results.pose);
      if (done) {
        setCalibrating(false);
        addAlert({ severity: 'success', message: 'Calibration Complete!', type: 'system' });
      }
      return;
    }

    const typingVar = calculateTypingVariance();
    const p = analyzePosture(results.pose);
    
    setIsHorizontal(p.isHorizontal);
    if (p.isHorizontal) return;

    const e = analyzeEyes(results.face);
    const a = analyzeAttention(results.face);
    const s = analyzeStress(results.face, typingVar);
    const f = analyzeFlow({ 
      gazeQuadrant: a.quadrant, 
      typingVariance: typingVar, 
      postureScore: p.score, 
      blinkRate: e.blinkRate 
    });
    
    const bodyState = getBodyLanguageState(p.score, s.stressIndex, typingVar);
    analysisStateRef.current.lastAnalysis = { p, e, a, s, f, bodyState, typingVar };
  }, [calibrating, addAlert, setIsHorizontal]);

  useEffect(() => {
    if (!started || session.status !== 'active') return;

    const interval = setInterval(() => {
      if (session.isHorizontal) return;

      const data = analysisStateRef.current.lastAnalysis;
      if (!data) return;

      const { p, e, a, s, f, bodyState, typingVar } = data;

      updateScores({ posture: p.score, eyes: e.fatigueScore, focus: a.focusScore, stress: s.stressIndex });
      updateDetections({
        postureState: p.label,
        postureConfidence: p.confidence || 100,
        postureMetrics: p.metrics, // Pass detailed metrics
        blinkRate: e.blinkRate,
        focusStatus: a.status,
        gazeQuadrant: a.quadrant,
        typingVariance: typingVar
      });

      setBodyLanguage(bodyState);
      setStressIndex(s.stressIndex);

      if (p.score < 60) {
        addAlert({ severity: 'warning', message: `Posture Alert: ${p.label}`, type: 'posture' });
      }
      const eyeExercises = [
        { name: 'Rapid Blinking', instruction: 'Blink your eyes rapidly for 20 seconds to lubricate and refresh your eyes.', holdSeconds: 20, type: 'eyes' },
        { name: 'Eye Rolling', instruction: 'Slowly roll your eyes in a full circle 5 times clockwise, then 5 times counter-clockwise.', holdSeconds: 15, type: 'eyes' },
        { name: 'Palming Relief', instruction: 'Rub your hands together to warm them, then gently place your palms over your closed eyes.', holdSeconds: 20, type: 'eyes' },
        { name: 'Focus Shift', instruction: 'Look at a distant object for 5 seconds, then shift focus to something near you for 5 seconds.', holdSeconds: 20, type: 'eyes' }
      ];

      if (e.microsleep && !activeExercise) {
        const exercise = eyeExercises[Math.floor(Math.random() * eyeExercises.length)];
        addAlert({ severity: 'error', message: `Microsleep detected! Starting ${exercise.name}.`, type: 'fatigue' });
        speak(`Microsleep detected. Let's do some ${exercise.name} to wake up.`);
        
        useWellnessStore.setState({ activeExercise: exercise });
      } else if (e.yawning) {
        addAlert({ severity: 'warning', message: 'Yawn detected. You might be getting tired.', type: 'fatigue' });
        speak("I noticed you yawning. Maybe grab some water or take a quick stretch.");
      } else if (scores.eyes < 50 && !activeExercise && (Date.now() - (analysisStateRef.current.lastExerciseTime || 0)) > 120000) {
        const exercise = eyeExercises[0]; // Default to blinking for fatigue
        addAlert({ severity: 'warning', message: 'High Eye Fatigue! Time for a break.', type: 'fatigue' });
        speak("Your eyes look tired. Let's do some rapid blinking.");
        
        useWellnessStore.setState({ activeExercise: exercise });
        analysisStateRef.current.lastExerciseTime = Date.now();
      }

      if (f.isInFlow && !session.flowActive) {
        useWellnessStore.setState(s => ({ session: { ...s.session, flowActive: true, flowSessions: s.session.flowSessions + 1 } }));
        addTimelineEvent({ type: 'flow', value: 'Started' });
        addAlert({ severity: 'success', message: 'Flow State Detected. Silencing alerts.', type: 'flow' });
      } else if (!f.isInFlow && session.flowActive) {
        useWellnessStore.setState(s => ({ session: { ...s.session, flowActive: false } }));
        addTimelineEvent({ type: 'flow', value: 'Ended' });
      }

      if (p.score > 90) addXP(5);
      
      const now = Date.now();
      if (now - lastUpdateRef.current.history > 5000) {
        addHistorySnapshot();
        lastUpdateRef.current.history = now;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [started, session.status, session.flowActive, session.isHorizontal, updateScores, updateDetections, addAlert, addHistorySnapshot, addXP, addTimelineEvent, setBodyLanguage, setStressIndex, speak]);

  useEffect(() => {
    if (!started || session.status !== 'active') return;
    const interval = setInterval(() => {
      const video = document.querySelector('video');
      if (video) {
        const env = analyzeEnvironment(video);
        setEnvironmentScore(env.score);
        if (env.issue) addAlert({ severity: 'info', message: env.issue, type: 'env' });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [started, session.status, setEnvironmentScore, addAlert]);

  const handleStart = () => {
    resetSession();
    setStarted(true);
    setSessionStatus('active');
  };

  const handleCalibrate = () => {
    startCalibration();
    setCalibrating(true);
    addAlert({ severity: 'info', message: 'Stay still for 3 seconds...', type: 'system' });
  };

  if (!started) return <LandingPage onStart={handleStart} />;

  return (
    <div className={session.flowActive ? 'flow-glow' : ''}>
      {recoveryActive && <MicroRecovery onComplete={() => setRecoveryActive(false)} />}
      
      {activeExercise && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-lg)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ width: '100%', maxWidth: '500px' }}>
            <ExerciseCoach 
              activeExercise={activeExercise}
              poseLandmarks={analysisStateRef.current.latestResults?.pose}
              faceLandmarks={analysisStateRef.current.latestResults?.face}
              leftHand={analysisStateRef.current.latestResults?.leftHand}
              rightHand={analysisStateRef.current.latestResults?.rightHand}
              onComplete={() => { addXP(100); useWellnessStore.setState({ activeExercise: null }); }}
              onSkip={() => useWellnessStore.setState({ activeExercise: null })}
            />
          </div>
        </div>
      )}
      
      {session.isHorizontal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          zIndex: 3000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          backdropFilter: 'blur(5px)'
        }}>
          <Moon size={64} style={{ marginBottom: '20px', color: '#3B82F6' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Lying Down Detected</h2>
          <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Session paused while you rest.</p>
        </div>
      )}

      <DashboardLayout
        webcamModule={<Webcam onResults={handleDetectionResults} />}
        scoreCards={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)', width: '100%', position: 'relative' }}>
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
               <ScoreCard title="Posture" value={scores.posture} icon={ShieldCheck} unit="%" />
               <PostureDetails metrics={detections.postureMetrics} />
               <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                  <button onClick={handleCalibrate} className="calibrate-btn">CALIBRATE</button>
               </div>
            </div>
            <ScoreCard title="Eye Health" value={scores.eyes} icon={Eye} unit={`% (${detections.blinkRate} bpm)`} />
            <ScoreCard title="Focus" value={scores.focus} icon={Target} unit={`% (Zone ${detections.gazeQuadrant})`} />
            <ScoreCard title="Stress Index" value={100 - scores.stress} icon={Brain} unit="%" />
          </div>
        }
        aiCoach={<AICoach />}
        alertsPanel={<AlertsPanel />}
        hydrationTracker={<HydrationTracker />}
        analyticsDashboard={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
              <StateBadge />
              <RPGPanel />
              <EnvironmentCard />
            </div>
            <AnalyticsDashboard />
            <TodayJourney />
          </div>
        }
      />
    </div>
  );
}

export default App;