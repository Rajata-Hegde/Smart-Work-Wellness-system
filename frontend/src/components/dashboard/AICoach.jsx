import React, { useMemo } from 'react';
import { Sparkles, Lightbulb, TrendingDown, Target, UserCheck } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const AICoach = () => {
  const { scores, detections } = useWellnessStore();

  const guidance = useMemo(() => {
    const suggestions = [];

    if (scores.posture < 70) {
      if (detections.postureState === 'Forward Head') {
        suggestions.push({
          icon: UserCheck,
          text: "Head forward detected. Push your chin back slightly to align with your spine.",
          priority: 1
        });
      } else if (detections.postureState === 'Slouching') {
        suggestions.push({
          icon: UserCheck,
          text: "Slouching detected. Lift your chest and roll your shoulders back.",
          priority: 1
        });
      }
    }

    if (scores.eyes < 70) {
      suggestions.push({
        icon: Sparkles,
        text: "Blink rate is low. Try to blink intentionally to stay lubricated.",
        priority: 2
      });
    }

    if (scores.focus < 70) {
      suggestions.push({
        icon: Target,
        text: "Focus is wavering. A 1-minute breathing exercise might help reset.",
        priority: 3
      });
    }

    if (detections.isYawning) {
      suggestions.push({
        icon: TrendingDown,
        text: "You seem tired. Consider a quick movement break or some water.",
        priority: 1
      });
    }

    // Default tip if no issues
    if (suggestions.length === 0) {
      return {
        icon: Lightbulb,
        text: "You're doing great! Keep maintaining this posture for maximum productivity."
      };
    }

    // Sort by priority and return top
    return suggestions.sort((a, b) => a.priority - b.priority)[0];
  }, [scores, detections]);

  const Icon = guidance.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-md)',
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        minHeight: '80px'
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: 'var(--radius-sm)', 
          backgroundColor: 'var(--divider)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--primary)'
        }}>
          <Icon size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, lineHeight: 1.5 }}>
            {guidance.text}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--secondary)', fontSize: '0.6875rem', fontWeight: 600, padding: '0 4px' }}>
        <Sparkles size={12} />
        <span>DYNAMIC AI ANALYSIS ACTIVE</span>
      </div>
    </div>
  );
};

export default AICoach;
