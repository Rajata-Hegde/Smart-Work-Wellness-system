import { useState, useEffect } from 'react';
import { analyzePosture, analyzeDistance } from '../utils/postureAnalysis';

const PostureDisplay = ({ poseLandmarks, faceLandmarks }) => {
  const [posture, setPosture] = useState(null);
  const [distanceStatus, setDistanceStatus] = useState(null);

  useEffect(() => {
    if (poseLandmarks) {
      const analysis = analyzePosture(poseLandmarks);
      setPosture(analysis);
    }
  }, [poseLandmarks]);

  useEffect(() => {
    if (faceLandmarks) {
      const distance = analyzeDistance(faceLandmarks);
      setDistanceStatus(distance);
    }
  }, [faceLandmarks]);

  if (!posture) {
    return (
      <div className="posture-display card">
        <h3>Posture Monitor</h3>
        <p className="loading">Waiting for pose detection...</p>
      </div>
    );
  }

  const colorMap = {
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444',
    gray: '#6b7280',
  };

  return (
    <div className="posture-display card">
      <h3>Posture</h3>

      <div className="posture-badge" style={{ borderColor: colorMap[posture.color] }}>
        <div className="posture-label" style={{ color: colorMap[posture.color] }}>
          {posture.label}
        </div>
      </div>

      <div className="score-container">
        <div className="score-label">Posture Score</div>
        <div className="score-bar">
          <div
            className="score-fill"
            style={{
              width: `${posture.score}%`,
              backgroundColor: colorMap[posture.color],
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div className="score-value">{posture.score}/100</div>
      </div>

      {distanceStatus && (
        <div className="distance-status">
          <div className={`distance-indicator ${distanceStatus.status}`}>
            {distanceStatus.message}
          </div>
        </div>
      )}

      {posture.issues && posture.issues.length > 0 && (
        <div className="issues-list">
          <div className="issues-title">Areas to improve:</div>
          <ul>
            {posture.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PostureDisplay;
