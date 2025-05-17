import { useEffect, useState } from 'react';
import { getWheels, type Wheel as WheelType } from '../api';

export default function UserDashboard() {
  const [wheels, setWheels] = useState<WheelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getWheels()
      .then(setWheels)
      .catch(err => setError(err.message || 'Failed to fetch wheels'))
      .finally(() => setLoading(false));
  }, []);

  const totalWheels = wheels.length;
  const totalSpins = wheels.reduce((sum, w) => sum + (w.spins || 0), 0);
  const lastUsedWheel = wheels.reduce((latest, w) => {
    const last = w.lastUsed || w.createdAt;
    if (!latest) return w;
    return new Date(last) > new Date(latest.lastUsed || latest.createdAt) ? w : latest;
  }, undefined as WheelType | undefined);
  const mostUsedWheel = wheels.reduce((most, w) => {
    if (!most) return w;
    return (w.spins || 0) > (most.spins || 0) ? w : most;
  }, undefined as WheelType | undefined);

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>Account Metrics</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '2rem',
          minWidth: '180px',
          textAlign: 'center',
          flex: '1 1 0'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{totalWheels}</div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>Wheels Created</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '2rem',
          minWidth: '180px',
          textAlign: 'center',
          flex: '1 1 0'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>{totalSpins}</div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>Total Spins</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '2rem',
          minWidth: '180px',
          textAlign: 'center',
          flex: '1 1 0'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-color)' }}>Last Used</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-color)', marginTop: '0.5rem' }}>
            {lastUsedWheel ? new Date(lastUsedWheel.lastUsed || lastUsedWheel.createdAt).toLocaleString() : '—'}
          </div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>
            {lastUsedWheel ? lastUsedWheel.name : '—'}
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          padding: '2rem',
          minWidth: '180px',
          textAlign: 'center',
          flex: '1 1 0'
        }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-color)' }}>Most Used</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent-color)', marginTop: '0.5rem' }}>
            {mostUsedWheel ? mostUsedWheel.spins : '—'}
          </div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>
            {mostUsedWheel ? mostUsedWheel.name : '—'}
          </div>
        </div>
      </div>
    </div>
  );
} 