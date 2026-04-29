import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Bell, 
  User, 
  Clock, 
  Zap,
  Volume2,
  VolumeX,
  Eye,
  Shield,
  Activity,
  Timer
} from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const DashboardLayout = ({ 
  webcamModule, 
  scoreCards, 
  alertsPanel, 
  exerciseCoach, 
  analyticsDashboard, 
  aiCoach, 
  hydrationTracker 
}) => {
  const { session, scores, settings, incrementTimer } = useWellnessStore();

  useEffect(() => {
    let timer;
    if (session.status === 'active') {
      timer = setInterval(() => {
        incrementTimer();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [session.status, incrementTimer]);

  const formatTime = (seconds) => {
    const s = seconds || 0;
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  const getWellnessColor = (score) => {
    if (score > 80) return 'var(--success)';
    if (score > 60) return 'var(--warning)';
    return 'var(--error)';
  };

  if (settings.bossMode) {
    return (
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, display: 'flex', gap: 10 }}>
         <div style={{ backgroundColor: 'black', color: 'white', padding: '10px 20px', borderRadius: 30, fontSize: 12, fontWeight: 800, display: 'flex', gap: 15, alignItems: 'center' }}>
            <Activity size={14} color={getWellnessColor(scores.wellness)} />
            <span>{scores.wellness}%</span>
            <div style={{ width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <span>{formatTime(session.elapsedTime)}</span>
            <button 
              onClick={() => useWellnessStore.setState({ settings: { ...settings, bossMode: false } })}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: 10 }}
            >
              EXIT BOSS MODE
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Smart Wellness</h2>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>AI Platform</p>
          </div>
        </div>

        {/* Master Wellness Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: getWellnessColor(scores.wellness), lineHeight: 1 }}>{scores.wellness}%</div>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Master Score</div>
          </div>
          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--secondary)', fontSize: '0.875rem' }}>
            <Timer size={16} />
            <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{formatTime(session.elapsedTime)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
             <button 
                className="icon-btn" 
                onClick={() => useWellnessStore.setState({ settings: { ...settings, voiceAlerts: !settings.voiceAlerts } })}
             >
                {settings.voiceAlerts ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
             <button 
                className="icon-btn" 
                onClick={() => useWellnessStore.setState({ settings: { ...settings, bossMode: true } })}
                title="Boss Mode"
             >
                <Shield size={20} />
             </button>
            <button className="icon-btn"><Bell size={20} /></button>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <User size={20} color="var(--secondary)" />
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="dashboard-grid">
          <section className="primary-section">
            <div className="card webcam-card">
              {webcamModule}
            </div>
            {analyticsDashboard}
          </section>

          <aside className="secondary-section">
            <div className="score-grid">
              {scoreCards}
            </div>

            <div className="card" style={{ 
              backgroundColor: '#FAFAFA', 
              border: '1px dashed var(--border)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <Zap size={18} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800 }}>AI Wellness Coach</h3>
              </div>
              {aiCoach}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <h3 style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Real-time Alerts</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  <span style={{ fontSize: '0.625rem', color: 'var(--success)', fontWeight: 700 }}>ACTIVE</span>
                </div>
              </div>
              {alertsPanel}
            </div>

            {hydrationTracker}
            {exerciseCoach}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
