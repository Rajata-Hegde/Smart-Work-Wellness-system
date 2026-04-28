import React from 'react';
import { Brain, Zap, Coffee, Activity, AlertCircle } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const StateBadge = () => {
  const { bodyLanguageState } = useWellnessStore();

  const states = {
    "Flow State": { icon: Brain, color: "#10B981", bg: "#ECFDF5", text: "Flow State", desc: "Optimal performance" },
    "Overwhelmed": { icon: AlertCircle, color: "#EF4444", bg: "#FEF2F2", text: "Overwhelmed", desc: "Take a micro-recovery break" },
    "Fatigued": { icon: Coffee, color: "#F59E0B", bg: "#FFFBEB", text: "Fatigued", desc: "Energy break suggested" },
    "Hyperfocused": { icon: Zap, color: "#8B5CF6", bg: "#F5F3FF", text: "Hyperfocused", desc: "Remember to breathe" },
    "Disengaged / Burnout Risk": { icon: Activity, color: "#6B7280", bg: "#F3F4F6", text: "Disengaged", desc: "High burnout risk detected" }
  };

  const current = states[bodyLanguageState] || states["Flow State"];
  const Icon = current.icon;

  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-md)',
      backgroundColor: current.bg,
      borderColor: current.color,
      borderWidth: '2px',
      transition: 'all 0.5s ease'
    }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '50%', 
        backgroundColor: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '12px',
        color: current.color,
        boxShadow: `0 4px 15px -3px ${current.color}44`
      }}>
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: current.color, textTransform: 'uppercase', margin: 0 }}>
        {current.text}
      </h3>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)', marginTop: '4px' }}>
        {current.desc}
      </p>
    </div>
  );
};

export default StateBadge;
