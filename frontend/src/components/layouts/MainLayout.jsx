import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from '../Webcam';
import PostureDisplay from '../PostureDisplay';
import FatigueAlert from '../FatigueAlert';
import ExerciseCoach from '../ExerciseCoach';
import AIWellnessScore from '../dashboard/AIWellnessScore';
import BurnoutPredictor from '../dashboard/BurnoutPredictor';
import AICoach from '../ai/AICoach';
import GameificationDashboard from '../gamification/GameificationDashboard';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import { useWellnessScore, useBurnoutPrediction, useGameification } from '../../hooks/useWellness';
import { analyzePosture } from '../../utils/postureAnalysis';
import '../../styles/glassmorphism.css';
import '../../styles/minimal.css';

/**
 * MainLayout - Main dashboard layout integrating all components
 */
const MainLayout = ({ onWebcamResults }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [completedExercises, setCompletedExercises] = useState([]);
  const [sessionStats, setSessionStats] = useState({});
  const [postureLabelTrigger, setPostureLabelTrigger] = useState(null);

  const { scores, updateScores } = useWellnessScore();
  const { riskScore } = useBurnoutPrediction();
  const { xp, level, achievements, addXP } = useGameification();

  // Track posture issues over time (for triggering ExerciseCoach)
  const postureStateRef = React.useRef({ lastLabel: null, issueStartTime: null });

  // Handle webcam results
  const handleWebcamResults = (results) => {
    const newMetrics = {
      posture: results.pose,
      eyes: results.face,
      attention: results.face,
      fatigue: {
        yawnCount: 0,
        avgEyeClosureDuration: 0,
        sessionMinutes: sessionStats.duration || 0,
      },
    };

    setMetrics(newMetrics);
    updateScores(newMetrics);

    // Trigger exercises when posture is bad for a short period
    if (results.pose) {
      const postureAnalysis = analyzePosture(results.pose);
      const currentLabel = postureAnalysis.label;

      if (currentLabel && currentLabel !== 'Good posture' && currentLabel !== 'Pose not detected') {
        if (postureStateRef.current.lastLabel === currentLabel) {
          const durationSec = (Date.now() - (postureStateRef.current.issueStartTime || Date.now())) / 1000;
          if (durationSec > 5) setPostureLabelTrigger(currentLabel);
        } else {
          postureStateRef.current.lastLabel = currentLabel;
          postureStateRef.current.issueStartTime = Date.now();
          setPostureLabelTrigger(null);
        }
      } else {
        postureStateRef.current.lastLabel = null;
        postureStateRef.current.issueStartTime = null;
        setPostureLabelTrigger(null);
      }
    }

    // Update historical data
    setHistoricalData((prev) => ({
      ...prev,
      posture: [...(prev.posture || []), scores.postureScore],
      eyeHealth: [...(prev.eyeHealth || []), scores.eyeHealthScore],
      focus: [...(prev.focus || []), scores.focusScore],
      fatigue: [...(prev.fatigue || []), scores.fatigueScore],
    }));

    setSessionStats({
      ...scores,
      startTime: sessionStats.startTime || Date.now(),
      duration: (Date.now() - (sessionStats.startTime || Date.now())) / 1000 / 60,
    });

    if (onWebcamResults) {
      onWebcamResults(results);
    }
  };

  const handleExerciseComplete = (exerciseName) => {
    setCompletedExercises((prev) => [...prev, exerciseName]);
    addXP(50);
  };

  // Tab content components
  const tabs = [
    {
      id: 'dashboard',
      label: 'Wellness',
      icon: null,
    },
    {
      id: 'burnout',
      label: 'Burnout risk',
      icon: null,
    },
    {
      id: 'coach',
      label: 'Coach',
      icon: null,
    },
    {
      id: 'gamification',
      label: 'Progress',
      icon: null,
    },
  ];

  return (
    <div className="sw-minimal">
      <div className="sw-header">
        <div className="sw-header-inner">
          <div className="sw-brand">Smart Work Wellness</div>
          <div className="sw-tabs" role="tablist" aria-label="Sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className="sw-tab"
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(229,231,235,0.72)' }}>
            Level {level} • {xp} XP
          </div>
        </div>
      </div>

      <div className="sw-grid">
        <div className="sw-panel">
          <div className="sw-panel-title">Live</div>
          <Webcam onResults={handleWebcamResults} />
        </div>

        <div className="sw-panel">
          {activeTab === 'dashboard' && (
            <>
              <div className="sw-panel-title">Wellness</div>
              <AIWellnessScore metrics={metrics} />
            </>
          )}
          {activeTab === 'burnout' && (
            <>
              <div className="sw-panel-title">Burnout risk</div>
              <BurnoutPredictor metrics={metrics} historicalData={historicalData} />
            </>
          )}
          {activeTab === 'coach' && (
            <>
              <div className="sw-panel-title">Coach</div>
              <AICoach metrics={scores} />
            </>
          )}
          {activeTab === 'gamification' && (
            <>
              <div className="sw-panel-title">Progress</div>
              <GameificationDashboard completedExercises={completedExercises} sessionStats={sessionStats} />
            </>
          )}

          <div style={{ marginTop: 16 }}>
            <PostureDisplay poseLandmarks={metrics.posture} faceLandmarks={metrics.eyes} />
          </div>
          <div style={{ marginTop: 16 }}>
            <FatigueAlert faceLandmarks={metrics.eyes} poseLandmarks={metrics.posture} />
          </div>

          <ExerciseCoach
            postureLabelTrigger={postureLabelTrigger}
            poseLandmarks={metrics.posture}
            faceLandmarks={metrics.eyes}
            onComplete={handleExerciseComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
