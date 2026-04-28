import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ScoreCard = ({ title, value = 0, icon: Icon, color, trend = 0, unit = '%' }) => {
  const safeValue = isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  
  // Calculate stroke-dasharray for the circle progress
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  const getStatusColor = (val) => {
    if (val >= 80) return '#10B981'; // Success
    if (val >= 50) return '#F59E0B'; // Warning
    return '#EF4444'; // Error
  };

  const statusColor = color || getStatusColor(safeValue);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card" 
      style={{ 
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '160px',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: 'var(--divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          {Icon && <Icon size={18} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {trend > 0 ? <TrendingUp size={12} color="#10B981" /> : 
           trend < 0 ? <TrendingDown size={12} color="#EF4444" /> : 
           <Minus size={12} color="var(--secondary)" />}
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: 700,
            color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : 'var(--secondary)'
          }}>
            {trend > 0 ? `+${trend}` : trend}%
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.7rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '2px' }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{Math.round(safeValue)}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>{unit}</span>
          </div>
        </div>

        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
          <svg width="64" height="64" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="var(--divider)"
              strokeWidth="8"
            />
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke={statusColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 800,
            color: statusColor
          }}>
            {Math.round(safeValue)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreCard;
