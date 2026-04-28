import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X, Clock, BellOff } from 'lucide-react';
import useWellnessStore from '../../store/useWellnessStore';

const AlertsPanel = () => {
  const { alerts, dismissAlert, snoozeAlert } = useWellnessStore();

  const getAlertConfig = (type) => {
    switch (type) {
      case 'error':
        return { icon: AlertCircle, color: 'var(--error)', bg: 'rgba(220, 38, 38, 0.05)' };
      case 'warning':
        return { icon: AlertTriangle, color: 'var(--warning)', bg: 'rgba(234, 88, 12, 0.05)' };
      default:
        return { icon: Info, color: 'var(--info)', bg: 'rgba(37, 99, 235, 0.05)' };
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="card" style={{ 
        padding: 'var(--space-lg)', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 'var(--space-sm)',
        color: 'var(--secondary)',
        borderStyle: 'dashed'
      }}>
        <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--divider)' }}>
          <Clock size={20} />
        </div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500 }}>No active alerts</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <AnimatePresence initial={false}>
        {alerts.map((alert) => {
          const config = getAlertConfig(alert.severity);
          const Icon = config.icon;
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                display: 'flex',
                gap: 'var(--space-md)',
                position: 'relative'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: config.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: config.color,
                flexShrink: 0
              }}>
                <Icon size={18} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: config.color, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--secondary)' }}>{alert.timestamp}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500, lineHeight: 1.4 }}>
                  {alert.message}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '4px', position: 'absolute', top: '8px', right: '8px' }}>
                <button 
                  onClick={() => snoozeAlert(alert.id)}
                  className="alert-action-btn"
                  title="Snooze (5m)"
                >
                  <BellOff size={14} />
                </button>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="alert-action-btn"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>

              <style>{`
                .alert-action-btn {
                  padding: 4px;
                  border-radius: 4px;
                  color: var(--secondary);
                  opacity: 0.4;
                  transition: all 0.2s;
                }
                .alert-action-btn:hover {
                  opacity: 1;
                  background-color: var(--divider);
                }
              `}</style>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AlertsPanel;
