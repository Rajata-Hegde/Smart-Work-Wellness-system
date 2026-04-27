import { useState, useEffect, useRef } from 'react';
import { analyzePosture } from '../utils/postureAnalysis';
import { analyzeEyes } from '../utils/eyeAnalysis';
import { analyzeAttention } from '../utils/attentionAnalysis';

const WellnessDashboard = ({ poseLandmarks, faceLandmarks, sessionLog = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scores, setScores] = useState({
    postureScore: 0,
    eyeHealthScore: 0,
    focusScore: 0,
    wellnessScore: 0,
  });
  const [streak, setStreak] = useState(0);
  const [insights, setInsights] = useState([]);
  const sessionStateRef = useRef({
    postureScores: [],
    blinkRates: [],
    focusScores: [],
    sessionStart: Date.now(),
    sessionsLog: [],
  });

  // Load streak from localStorage
  useEffect(() => {
    const savedStreak = localStorage.getItem('smartHealthStreak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
  }, []);

  // Calculate scores and update session log
  useEffect(() => {
    if (!poseLandmarks || !faceLandmarks) return;

    const postureAnalysis = analyzePosture(poseLandmarks);
    const eyeAnalysis = analyzeEyes(faceLandmarks, sessionStateRef.current);
    const attentionAnalysis = analyzeAttention(faceLandmarks, sessionStateRef.current);

    // Calculate normalized scores
    const postureScore = postureAnalysis.score;
    const eyeHealthScore = Math.max(0, 100 - (20 - eyeAnalysis.blinkRate) * 5);
    const focusScore = attentionAnalysis.focusScore;
    const wellnessScore = Math.round((postureScore + eyeHealthScore + focusScore) / 3);

    setScores({
      postureScore,
      eyeHealthScore: Math.max(0, Math.min(100, eyeHealthScore)),
      focusScore,
      wellnessScore,
    });

    // Track scores for analytics
    sessionStateRef.current.postureScores.push(postureScore);
    sessionStateRef.current.blinkRates.push(eyeAnalysis.blinkRate);
    sessionStateRef.current.focusScores.push(focusScore);

    // Update streak
    if (wellnessScore > 70) {
      const today = new Date().toDateString();
      const lastStreakDate = localStorage.getItem('smartHealthStreakDate');

      if (lastStreakDate !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('smartHealthStreak', newStreak.toString());
        localStorage.setItem('smartHealthStreakDate', today);
      }
    }

    // Generate insights every 30 seconds
    if (sessionStateRef.current.postureScores.length > 60) {
      const insights = generateInsights(
        sessionStateRef.current.postureScores,
        sessionStateRef.current.blinkRates,
        sessionStateRef.current.focusScores
      );
      setInsights(insights);
    }
  }, [poseLandmarks, faceLandmarks, streak]);

  const generateInsights = (postureScores, blinkRates, focusScores) => {
    const newInsights = [];

    // Analyze posture pattern
    if (postureScores.length > 50) {
      const midpoint = Math.floor(postureScores.length / 2);
      const firstHalf = postureScores.slice(0, midpoint);
      const secondHalf = postureScores.slice(midpoint);

      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg < firstAvg - 10) {
        newInsights.push('📉 Your posture tends to worsen over time. Take breaks more frequently.');
      }
    }

    // Analyze blink rate pattern
    if (blinkRates.length > 50) {
      const midpoint = Math.floor(blinkRates.length / 2);
      const firstHalf = blinkRates.slice(0, midpoint);
      const secondHalf = blinkRates.slice(midpoint);

      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg < firstAvg - 3) {
        newInsights.push('👁️ Your blink rate drops in longer sessions. Remember the 20-20-20 rule.');
      }
    }

    // Analyze focus score pattern
    if (focusScores.length > 50) {
      const midpoint = Math.floor(focusScores.length / 2);
      const firstHalf = focusScores.slice(0, midpoint);
      const secondHalf = focusScores.slice(midpoint);

      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg < firstAvg - 10) {
        newInsights.push('🎯 Your focus dips in the second half of sessions. Consider a break midway.');
      }
    }

    return newInsights;
  };

  const sessionDuration = Math.floor(
    (Date.now() - sessionStateRef.current.sessionStart) / 1000 / 60
  );

  // Create timeline visualization (color-coded segments)
  const timelineSegments = [];
  if (sessionStateRef.current.postureScores.length > 0) {
    for (let i = 0; i < Math.min(30, sessionStateRef.current.postureScores.length); i++) {
      const score = sessionStateRef.current.postureScores[i];
      let color = 'good';
      if (score < 70) color = 'warning';
      if (score < 40) color = 'danger';
      timelineSegments.push(color);
    }
  }

  return (
    <>
      {!isOpen && (
        <button
          className="dashboard-toggle"
          onClick={() => setIsOpen(true)}
          title="Open Wellness Dashboard"
        >
          📊
        </button>
      )}

      {isOpen && (
        <div className="wellness-panel">
          <div className="wellness-content">
            <div className="wellness-header">
              <span>📊 Wellness Dashboard</span>
              <button
                className="wellness-close"
                onClick={() => setIsOpen(false)}
                title="Close Dashboard"
              >
                ✕
              </button>
            </div>

            <div className="scores-grid">
              <div className="score-card posture">
                <div className="score-card-label">Posture</div>
                <div className="score-card-value">{scores.postureScore}</div>
              </div>

              <div className="score-card eyes">
                <div className="score-card-label">Eye Health</div>
                <div className="score-card-value">{Math.round(scores.eyeHealthScore)}</div>
              </div>

              <div className="score-card focus">
                <div className="score-card-label">Focus</div>
                <div className="score-card-value">{scores.focusScore}</div>
              </div>

              <div className="score-card wellness">
                <div className="score-card-label">Wellness Score</div>
                <div className="score-card-value">{scores.wellnessScore}</div>
              </div>
            </div>

            {streak > 0 && (
              <div className="streak-box">
                <div className="streak-number">🔥 {streak}</div>
                <div className="streak-label">Day Streak</div>
              </div>
            )}

            <div>
              <div className="score-card-label" style={{ marginBottom: '12px' }}>
                Session Timeline ({sessionDuration}m)
              </div>
              <div className="timeline-bar">
                {timelineSegments.map((color, idx) => (
                  <div key={idx} className={`timeline-segment ${color}`} />
                ))}
              </div>
            </div>

            {insights.length > 0 && (
              <div className="insights-section">
                <div className="insights-title">💡 AI Insights</div>
                {insights.map((insight, idx) => (
                  <div key={idx} className="insight-item">
                    {insight}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'center', color: '#b0b0b0', fontSize: '0.85rem' }}>
              Session Data: {sessionStateRef.current.postureScores.length} frames logged
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WellnessDashboard;
