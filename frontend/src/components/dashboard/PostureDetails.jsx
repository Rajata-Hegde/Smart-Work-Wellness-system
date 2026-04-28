import React from 'react';

const PostureDetails = ({ metrics }) => {
  if (!metrics) return null;

  const MetricItem = ({ label, value }) => (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '0.625rem', fontWeight: 800, color: value < 60 ? 'var(--error)' : value < 85 ? 'var(--warning)' : 'var(--success)' }}>{value}%</span>
      </div>
      <div style={{ height: '3px', backgroundColor: 'var(--divider)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          backgroundColor: value < 60 ? 'var(--error)' : value < 85 ? 'var(--warning)' : 'var(--success)', 
          width: `${value}%`, 
          transition: 'width 0.5s ease' 
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
      <MetricItem label="Forward Head" value={metrics.forwardHead} />
      <MetricItem label="Spinal Alignment" value={metrics.alignment} />
      <MetricItem label="Shoulder Symmetry" value={metrics.symmetry} />
      <MetricItem label="Head Tilt" value={metrics.headTilt} />
      <MetricItem label="Hip Slide" value={metrics.hipSlide} />
    </div>
  );
};

export default PostureDetails;
