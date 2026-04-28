import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Line
} from 'recharts';
import { BarChart3, Clock, Zap, Activity } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const AnalyticsDashboard = () => {
  const { history } = useWellnessStore();

  // Process history for chart
  const data = useMemo(() => {
    if (history.length === 0) return Array.from({ length: 20 }, (_, i) => ({ name: i, wellness: 0, posture: 0, eyes: 0 }));
    return history.map((h, i) => ({
      name: i,
      posture: h.posture,
      eyes: h.eyes,
      focus: h.focus,
      wellness: h.wellness
    })).slice(-30); // Show last 30 snapshots
  }, [history]);

  // Calculate Metrics from history
  const metrics = useMemo(() => {
    if (!history || history.length === 0) return { avgWellness: 0, peakFocus: 0, quality: 'Initializing...' };
    
    const validHistory = history.filter(h => !isNaN(h.wellness));
    if (validHistory.length === 0) return { avgWellness: 0, peakFocus: 0, quality: 'Initializing...' };
    
    const avgWellness = Math.round(validHistory.reduce((acc, h) => acc + h.wellness, 0) / validHistory.length);
    const peakFocus = Math.max(...validHistory.map(h => h.focus || 0));
    
    let quality = 'Excellent';
    if (avgWellness < 85) quality = 'Good';
    if (avgWellness < 70) quality = 'Fair';
    if (avgWellness < 50) quality = 'Poor';

    return { avgWellness, peakFocus, quality };
  }, [history]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Snapshot {label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: entry.color }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>{entry.name}</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ gap: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Activity size={20} />
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Wellness Trends</h2>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--success)', backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>LIVE STREAMING</span>
        </div>
      </div>

      <div style={{ height: '240px', width: '100%', marginLeft: '-20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
            <XAxis dataKey="name" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="wellness" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWellness)" 
              name="Overall"
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="posture" 
              stroke="var(--success)" 
              strokeWidth={2}
              dot={false}
              name="Posture"
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="eyes" 
              stroke="var(--info)" 
              strokeWidth={2}
              dot={false}
              name="Eyes"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 'var(--space-md)',
        marginTop: 'var(--space-md)',
        paddingTop: 'var(--space-lg)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Wellness</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metrics.avgWellness}%</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Peak Focus</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metrics.peakFocus}%</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Quality</p>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: metrics.avgWellness > 70 ? 'var(--success)' : 'var(--warning)' }}>{metrics.quality}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
