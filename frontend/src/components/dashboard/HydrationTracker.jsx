import React from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const HydrationTracker = () => {
  const { hydration, updateHydration } = useWellnessStore();
  const percentage = Math.min(100, (hydration.current / hydration.goal) * 100);

  return (
    <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: 'var(--radius-sm)', 
        backgroundColor: 'rgba(37, 99, 235, 0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--info)'
      }}>
        <Droplets size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--secondary)' }}>Hydration</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{hydration.current} / {hydration.goal} ml</span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'var(--divider)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: 'var(--info)', width: `${percentage}%`, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button 
          onClick={() => updateHydration(-250)}
          style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--divider)', color: 'var(--secondary)' }}
          title="Decrease"
        >
          <Minus size={14} />
        </button>
        <button 
          onClick={() => updateHydration(250)}
          style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary)', color: 'white' }}
          title="Add 250ml"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

export default HydrationTracker;
