import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, AlertTriangle } from 'lucide-react';
import useWellnessStore from '../store/useWellnessStore';

// Global singleton to prevent double-initialization in React Strict Mode/HMR
let globalHolistic = null;
let globalCamera = null;

const Webcam = ({ onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  const { session, setSessionStatus } = useWellnessStore();
  const onResultsRef = useRef(onResults);
  const sessionStatusRef = useRef(session.status);
  
  useEffect(() => { onResultsRef.current = onResults; }, [onResults]);
  useEffect(() => { sessionStatusRef.current = session.status; }, [session.status]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [fps, setFps] = useState(0);
  const lastFrameTime = useRef(Date.now());
  const lastResults = useRef(null);

  const POSE_CONNECTIONS = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]];
  const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (video.videoWidth > 0 && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    if (canvas.width > 0) {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (lastResults.current) {
        const res = lastResults.current;
        if (res.poseLandmarks) {
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3;
          POSE_CONNECTIONS.forEach(([s, e]) => {
            const a = res.poseLandmarks[s];
            const b = res.poseLandmarks[e];
            if (a && b && a.visibility > 0.5 && b.visibility > 0.5) {
              ctx.beginPath();
              ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
              ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
              ctx.stroke();
            }
          });
        }
        if (res.faceLandmarks) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          FACE_OVAL.forEach((idx, i) => {
            const p = res.faceLandmarks[idx];
            if (i === 0) ctx.moveTo(p.x * canvas.width, p.y * canvas.height);
            else ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
          });
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    requestRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [draw]);

  const handleMediaPipeResults = useCallback((results) => {
    lastResults.current = results;
    const now = Date.now();
    setFps(Math.round(1000 / (now - lastFrameTime.current)));
    lastFrameTime.current = now;

    if (onResultsRef.current) {
      onResultsRef.current({
        pose: results.poseLandmarks,
        face: results.faceLandmarks,
        leftHand: results.leftHandLandmarks,
        rightHand: results.rightHandLandmarks,
      });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const HolisticClass = window.Holistic || (window.mpHolistic && window.mpHolistic.Holistic);
        const CameraClass = window.Camera;

        if (!HolisticClass || !CameraClass) {
          setTimeout(init, 1000);
          return;
        }

        if (!globalHolistic) {
          globalHolistic = new HolisticClass({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
          });

          globalHolistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            refineFaceLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          globalHolistic.onResults(handleMediaPipeResults);
        }

        if (videoRef.current && !globalCamera) {
          globalCamera = new CameraClass(videoRef.current, {
            onFrame: async () => {
              if (globalHolistic && videoRef.current && sessionStatusRef.current === 'active') {
                try {
                  await globalHolistic.send({ image: videoRef.current });
                } catch (e) {
                  console.warn("MediaPipe busy");
                }
              }
            },
            width: 1280,
            height: 720,
          });
          await globalCamera.start();
          setIsLoaded(true);
          setSessionStatus('active');
        } else if (globalCamera) {
          // Camera already exists, just mark as loaded
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Webcam Error:", err);
        setError(`Vision Engine Error: ${err.message}`);
      }
    };

    init();
    return () => {
      // We don't close the global singleton on unmount to prevent restart issues
      // But we should stop the requestAnimationFrame
      cancelAnimationFrame(requestRef.current);
    };
  }, [handleMediaPipeResults, setSessionStatus]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
      <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

      {!isLoaded && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', backgroundColor: '#000' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '16px' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Initializing Vision Engine...</p>
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FF4444', backgroundColor: '#000', padding: '24px', textAlign: 'center' }}>
          <AlertTriangle size={48} style={{ marginBottom: '16px' }} />
          <p style={{ color: 'white', marginBottom: '8px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ color: '#3B82F6', fontSize: '0.875rem', fontWeight: 600 }}>Try Again</button>
        </div>
      )}

      {isLoaded && (
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '0.625rem', fontWeight: 800 }}>
            {fps} FPS
          </div>
          <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px', color: '#10B981', fontSize: '0.625rem', fontWeight: 800 }}>
            VISION LIVE
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Webcam);