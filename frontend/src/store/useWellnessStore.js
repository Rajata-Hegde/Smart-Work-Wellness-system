import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWellnessStore = create(
  persist(
    (set, get) => ({
      // Session State
      session: {
        status: 'idle', // 'idle', 'active', 'paused'
        startTime: null,
        elapsedTime: 0,
        lastActive: null,
        flowActive: false,
        flowSessions: 0,
        isHorizontal: false, // New orientation state
      },
      
      // RPG Stats & XP
      rpg: {
        level: 1,
        xp: 0,
        stats: {
          strength: 100,
          vision: 100,
          stamina: 100,
          focus: 100,
          resilience: 100
        },
        achievements: [],
      },

      // Unified State
      bodyLanguageState: 'Flow State',
      stressIndex: 0,
      environmentScore: 100,
      
      // Real-time Scores
      scores: {
        posture: 100,
        eyes: 100,
        focus: 100,
        stress: 0,
        wellness: 100,
      },

      // Detection Metadata
      detections: {
        postureState: 'Excellent',
        postureConfidence: 100,
        eyeStatus: 'Stable',
        blinkRate: 12,
        focusStatus: 'Focused',
        isYawning: false,
        typingVariance: 0,
        gazeQuadrant: 4,
        postureMetrics: {
          forwardHead: 100,
          alignment: 100,
          symmetry: 100,
          headTilt: 100,
          proximity: 100,
          wrist: 100
        }
      },

      // History & Timeline
      history: [], 
      timeline: [],
      
      alerts: [],
      activeExercise: null,
      hydration: { goal: 2000, current: 0 },
      settings: { bossMode: false, voiceAlerts: true },

      // Actions
      setSessionStatus: (status) => set((state) => ({
        session: { 
          ...state.session, 
          status, 
          startTime: status === 'active' ? Date.now() : state.session.startTime 
        }
      })),

      setIsHorizontal: (isHorizontal) => set((state) => {
        if (state.session.isHorizontal === isHorizontal) return state;
        return { session: { ...state.session, isHorizontal } };
      }),

      updateScores: (newScores) => set((state) => {
        if (state.session.isHorizontal) return state;
        
        const scores = { ...state.scores, ...newScores };
        const hydrationScore = Math.min(100, (state.hydration.current / state.hydration.goal) * 100);
        const wellness = Math.round(
          (scores.posture * 0.3) + 
          (scores.eyes * 0.2) + 
          (scores.focus * 0.2) + 
          ((100 - scores.stress) * 0.15) + 
          (hydrationScore * 0.15)
        );

        if (JSON.stringify(state.scores) === JSON.stringify({ ...scores, wellness })) return state;
        return { scores: { ...scores, wellness } };
      }),

      updateDetections: (newDetections) => set((state) => {
        const merged = { ...state.detections, ...newDetections };
        if (JSON.stringify(state.detections) === JSON.stringify(merged)) return state;
        return { detections: merged };
      }),

      addXP: (amount) => set((state) => {
        if (state.session.isHorizontal) return state;
        const newXP = state.rpg.xp + amount;
        if (newXP >= state.rpg.level * 500) {
          return { rpg: { ...state.rpg, level: state.rpg.level + 1, xp: 0 } };
        }
        return { rpg: { ...state.rpg, xp: newXP } };
      }),

      setBodyLanguage: (state) => set({ bodyLanguageState: state }),
      setStressIndex: (val) => set({ stressIndex: val }),
      setEnvironmentScore: (val) => set({ environmentScore: val }),

      addAlert: (alert) => set((state) => {
        if (state.session.isHorizontal && alert.type !== 'system') return state;
        if (state.session.flowActive && alert.severity !== 'error') return state;
        if (state.alerts.some(a => a.type === alert.type)) return state;
        return {
          alerts: [{ ...alert, id: Date.now(), timestamp: new Date().toLocaleTimeString() }, ...state.alerts.slice(0, 3)]
        };
      }),

      incrementTimer: () => set((state) => {
        if (state.session.isHorizontal) return state; // Pause timer if horizontal
        
        const newElapsed = state.session.elapsedTime + 1;
        let rpgUpdates = {};
        if (newElapsed % 60 === 0) {
          const { posture, eyes, focus, stress } = state.scores;
          rpgUpdates = {
            stats: {
              strength: Math.max(0, state.rpg.stats.strength + (posture < 70 ? -1 : 0.5)),
              vision: Math.max(0, state.rpg.stats.vision + (eyes < 70 ? -1 : 0.5)),
              focus: Math.max(0, state.rpg.stats.focus + (focus < 70 ? -1 : 0.5)),
              resilience: Math.max(0, state.rpg.stats.resilience + (stress > 65 ? -1 : 0.5)),
              stamina: state.rpg.stats.stamina
            }
          };
        }
        return { 
          session: { ...state.session, elapsedTime: newElapsed },
          ...(Object.keys(rpgUpdates).length > 0 ? { rpg: { ...state.rpg, stats: { ...state.rpg.stats, ...rpgUpdates.stats } } } : {})
        };
      }),

      addHistorySnapshot: () => set((state) => ({
        history: [...state.history, { 
          time: new Date().toLocaleTimeString(), 
          ...state.scores 
        }].slice(-100)
      })),

      addTimelineEvent: (event) => set((state) => ({
        timeline: [...state.timeline, { 
          time: new Date().toLocaleTimeString(), 
          ...event 
        }].slice(-10)
      })),

      resetSession: () => set({
        session: { status: 'idle', startTime: null, elapsedTime: 0, lastActive: null, flowActive: false, flowSessions: 0, isHorizontal: false },
        scores: { posture: 100, eyes: 100, focus: 100, stress: 0, wellness: 100 },
        alerts: [],
        activeExercise: null,
        timeline: []
      })
    }),
    {
      name: 'wellness-rpg-storage-v2',
      partialize: (state) => ({ 
        rpg: state.rpg, 
        history: state.history, 
        hydration: state.hydration,
        settings: state.settings 
      }),
    }
  )
);

export default useWellnessStore;
