import React from 'react';
import { Shield, Eye, Zap, Target, Heart } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const RPGPanel = () => {
  const { rpg } = useWellnessStore();
  const { level, xp, stats } = rpg;
  
  const xpProgress = (xp / (level * 500)) * 100;

  const StatBar = ({ label, value, icon: Icon, color }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon size={14} color={color} />
          <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--secondary)' }}>{label}</span>
        </div>
        <span style={{ fontSize: '0.625rem', fontWeight: 800 }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: '4px', backgroundColor: 'var(--divider)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: color, width: `${value}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );

  return (
    <div className="card" style={{ padding: 'var(--space-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: 800,
          boxShadow: '0 0 15px rgba(0,0,0,0.1)'
        }}>
          {level}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>LEVEL {level}</span>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--secondary)' }}>{xp} / {level * 500} XP</span>
          </div>
          <div style={{ height: '6px', backgroundColor: 'var(--divider)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: 'var(--primary)', width: `${xpProgress}%`, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
        <StatBar label="Strength" value={stats.strength} icon={Shield} color="var(--success)" />
        <StatBar label="Vision" value={stats.vision} icon={Eye} color="var(--info)" />
        <StatBar label="Stamina" value={stats.stamina} icon={Zap} color="var(--warning)" />
        <StatBar label="Focus" value={stats.focus} icon={Target} color="#8B5CF6" />
        <StatBar label="Resilience" value={stats.resilience} icon={Heart} color="#EC4899" />
      </div>
    </div>
  );
};

export default RPGPanel;
