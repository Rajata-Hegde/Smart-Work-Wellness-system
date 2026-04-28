import React from 'react';
import { Activity, Shield, Zap, Target, ArrowRight } from 'lucide-react';

const LandingPage = ({ onStart }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
      textAlign: 'center',
      gap: 'var(--space-xl)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: 'var(--primary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Activity size={32} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em' }}>Wellness.OS</h1>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 'var(--space-lg)', letterSpacing: '-0.05em' }}>
          Real-time wellness <br /> 
          <span style={{ color: 'var(--secondary)' }}>for deep work.</span>
        </h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--secondary)', lineHeight: 1.6, marginBottom: 'var(--space-xl)' }}>
          A premium, AI-powered system designed to monitor your posture, eye health, and focus while you work. Built for high-performance professionals.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <button 
          onClick={onStart}
          style={{
            padding: '16px 32px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <span>Start Session</span>
          <ArrowRight size={20} />
        </button>
        <button style={{
          padding: '16px 32px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'white',
          border: '1px solid var(--border)',
          color: 'var(--primary)',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          Documentation
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 'var(--space-xl)',
        marginTop: 'var(--space-xl)',
        maxWidth: '900px'
      }}>
        {[
          { icon: Shield, title: 'Privacy First', desc: 'All processing happens locally in your browser.' },
          { icon: Zap, title: 'Real-time AI', desc: 'Instant feedback on posture and fatigue.' },
          { icon: Target, title: 'Smart Goals', desc: 'Daily streaks and focus tracking metrics.' }
        ].map((feat, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ color: 'var(--secondary)', marginBottom: '8px' }}><feat.icon size={24} /></div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{feat.title}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
