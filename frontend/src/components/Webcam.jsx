import { useEffect, useRef } from 'react';

const Webcam = ({ onResults }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const holisticRef = useRef(null);
  const cameraRef = useRef(null);

  // Define connections manually
  const POSE_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
    [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
    [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [18, 20], [11, 23],
    [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29],
    [28, 30], [29, 31], [30, 32], [27, 31], [28, 32]
  ];

  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15],
    [15, 16], [0, 17], [17, 18], [18, 19], [19, 20]
  ];

  const FACEMESH_TESSELATION = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
    [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15],
    [15, 16], [16, 17], [17, 18], [18, 19], [19, 20]
  ];

  const drawConnectors = (ctx, landmarks, connections, style) => {
    const color = style.color || '#ffffff';
    const lineWidth = style.lineWidth || 1;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    
    for (const [start, end] of connections) {
      if (landmarks[start] && landmarks[end]) {
        const startX = landmarks[start].x * ctx.canvas.width;
        const startY = landmarks[start].y * ctx.canvas.height;
        const endX = landmarks[end].x * ctx.canvas.width;
        const endY = landmarks[end].y * ctx.canvas.height;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
  };

  const drawLandmarks = (ctx, landmarks, style) => {
    const radius = style.radius || 3;
    const color = style.color || '#ffffff';
    
    ctx.fillStyle = color;
    
    for (const landmark of landmarks) {
      if (landmark && landmark.x !== undefined && landmark.y !== undefined) {
        const x = landmark.x * ctx.canvas.width;
        const y = landmark.y * ctx.canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    let holistic;
    let camera;

    const initializeMediaPipe = async () => {
      try {
        // Load scripts if not already loaded
        if (!window.Holistic) {
          console.log('Loading MediaPipe Holistic from CDN...');
          const script1 = document.createElement('script');
          script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js';
          script1.async = true;
          document.head.appendChild(script1);

          const script2 = document.createElement('script');
          script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
          script2.async = true;
          document.head.appendChild(script2);

          // Wait for scripts to load
          await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (window.Holistic && window.Camera) {
                console.log('MediaPipe libraries loaded');
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve();
            }, 10000);
          });
        }

        if (!window.Holistic || !window.Camera) {
          console.error('MediaPipe failed to load');
          return;
        }

        holistic = new window.Holistic({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });

        holistic.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          refineFaceLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        holisticRef.current = holistic;

        holistic.onResults(handleResults);

        if (videoRef.current) {
          camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (holistic && videoRef.current) {
                try {
                  await holistic.send({ image: videoRef.current });
                } catch (error) {
                  console.error('Error sending frame to Holistic:', error);
                }
              }
            },
            width: 1280,
            height: 720,
          });

          cameraRef.current = camera;
          camera.start();
          console.log('Camera started successfully');
        }
      } catch (error) {
        console.error('MediaPipe initialization error:', error);
      }
    };

    // Start initialization after a small delay to ensure DOM is ready
    const timer = setTimeout(initializeMediaPipe, 500);

    return () => {
      clearTimeout(timer);
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  const handleResults = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video dimensions
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Always draw the video frame first
    try {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    } catch (error) {
      console.error('Error drawing video frame:', error);
    }

    // Then draw landmarks on top
    if (results && results.poseLandmarks && results.poseLandmarks.length > 0) {
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 2,
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        radius: 3,
      });
    }

    if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
      drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, {
        color: '#CCCCCC',
        lineWidth: 1,
      });
    }

    if (results && results.leftHandLandmarks && results.leftHandLandmarks.length > 0) {
      drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, {
        color: '#FFFF00',
        lineWidth: 2,
      });
      drawLandmarks(ctx, results.leftHandLandmarks, {
        color: '#FF00FF',
        radius: 2,
      });
    }

    if (results && results.rightHandLandmarks && results.rightHandLandmarks.length > 0) {
      drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, {
        color: '#FFFF00',
        lineWidth: 2,
      });
      drawLandmarks(ctx, results.rightHandLandmarks, {
        color: '#FF00FF',
        radius: 2,
      });
    }

    // Pass landmark data to parent component
    onResults({
      pose: results?.poseLandmarks || null,
      face: results?.faceLandmarks || null,
      leftHand: results?.leftHandLandmarks || null,
      rightHand: results?.rightHandLandmarks || null,
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      <video
        ref={videoRef}
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '1280px',
          backgroundColor: '#000',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default Webcam;