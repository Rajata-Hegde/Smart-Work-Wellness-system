import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import aiCoachEngine from '../../utils/ai/aiCoachEngine';
import '../../styles/glassmorphism.css';

/**
 * AICoach - Smart AI wellness assistant
 */
const AICoach = ({ metrics = {}, onRecommendationAccepted }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showCoach, setShowCoach] = useState(true);

  useEffect(() => {
    // Get initial greeting
    if (!currentMessage) {
      const greeting = aiCoachEngine.getTimeBasedGreeting();
      setCurrentMessage(greeting);
    }
  }, []);

  useEffect(() => {
    if (metrics && Object.keys(metrics).length > 0) {
      // Get contextual response
      const response = aiCoachEngine.getContextualResponse(metrics);
      if (response) {
        setCurrentMessage(response);
        aiCoachEngine.addToHistory('assistant', response);
      }

      // Generate recommendations
      const recs = aiCoachEngine.generateRecommendations(metrics);
      if (recs.length > 0) {
        setRecommendations(recs);
      }
    }
  }, [metrics]);

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRecommendation = (rec) => {
    setCurrentMessage(`Great! Let me help you with ${rec.type}.`);
    speakMessage(`Starting ${rec.action}`);
    if (onRecommendationAccepted) {
      onRecommendationAccepted(rec);
    }
    setRecommendations(recommendations.filter((r) => r !== rec));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Coach Avatar */}
      <AnimatePresence>
        {showCoach && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <GlassmorphicCard className="flex flex-col items-center" glow>
              {/* Avatar */}
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                  border: '2px solid rgba(99, 102, 241, 0.5)',
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI
              </motion.div>

              {/* Message */}
              <motion.div className="text-center max-w-sm">
                <h3 className="font-semibold mb-2">SMART Coach</h3>
                <motion.p
                  className="text-slate-300 text-sm"
                  key={currentMessage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentMessage}
                </motion.p>

                {/* Voice indicator */}
                {isListening && (
                  <motion.div
                    className="mt-3 flex gap-1 justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-6 bg-primary rounded-full"
                        animate={{ scaleY: [1, 2, 1] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Speaker Button */}
              <motion.button
                className="mt-4 px-4 py-2 rounded-lg bg-primary bg-opacity-20 hover:bg-opacity-40 transition-all"
                onClick={() => speakMessage(currentMessage)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Read aloud
              </motion.button>
            </GlassmorphicCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h4 className="text-sm font-semibold text-slate-300 px-2">Recommendations:</h4>
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassmorphicCard
                  interactive
                  onClick={() => handleRecommendation(rec)}
                  className="cursor-pointer hover:border-primary hover:border-opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">{rec.message}</div>
                      <div className="text-xs text-slate-400">
                        {rec.action === 'exercise' && 'Guided exercise'}
                        {rec.action === 'break' && `${rec.duration} min break`}
                        {rec.action === 'refocus' && 'Refocus'}
                      </div>
                    </div>
                    <motion.div
                      className="text-2xl"
                      whileHover={{ scale: 1.2 }}
                    >
                      →
                    </motion.div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICoach;
