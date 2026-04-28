import React from 'react';
import { Brain, Coffee, Activity, Zap } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const TodayJourney = () => {
  const { timeline } = useWellnessStore();

  const getIcon = (type) => {
    switch (type) {
      case 'flow': return Brain;
      case 'break': return Coffee;
      case 'stress': return Zap;
      default: return Activity;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'flow': return '#10B981';
      case 'break': return '#3B82F6';
      case 'stress': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="card" style={{ padding: 'var(--space-md)' }}>
      <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>
        Today's Journey
      </h3>
      
      <div style={{ 
        position: 'relative', 
        height: '60px', 
        display: 'flex', 
        alignItems: 'center',
        padding: '0 20px'
      }}>
        {/* Baseline */}
        <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', backgroundColor: 'var(--divider)', zIndex: 1 }} />
        
        <div style={{ display: 'flex', gap: 'var(--space-xl)', zIndex: 2 }}>
          {timeline.length === 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>Your journey begins here...</span>
          )}
          {timeline.map((event, i) => {
            const Icon = getIcon(event.type);
            const color = getColor(event.type);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: 'white', 
                  border: `2px solid ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: color,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <Icon size={12} />
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 800 }}>{event.time}</span>
                <span style={{ fontSize: '0.5rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>{event.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodayJourney;
