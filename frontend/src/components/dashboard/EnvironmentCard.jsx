import React from 'react';
import { Sun, Wind, Moon, Thermometer } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const EnvironmentCard = () => {
  const { environmentScore } = useWellnessStore();

  const getStatus = (score) => {
    if (score > 80) return { label: 'Optimal', color: 'var(--success)' };
    if (score > 50) return { label: 'Fair', color: 'var(--warning)' };
    return { label: 'Poor', color: 'var(--error)' };
  };

  const status = getStatus(environmentScore);

  return (
    <div className="card" style={{ padding: 'var(--space-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase' }}>Environment</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }} />
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: status.color }}>{status.label}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 800, 
          color: 'var(--primary)',
          letterSpacing: '-0.02em'
        }}>
          {environmentScore}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)', lineHeight: 1.2 }}>
          Ambient<br />Score
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={14} color="var(--secondary)" />
          <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>Lighting</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Moon size={14} color="var(--secondary)" />
          <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>Night Mode</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wind size={14} color="var(--secondary)" />
          <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>Air Quality</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Thermometer size={14} color="var(--secondary)" />
          <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>Temp</span>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentCard;
