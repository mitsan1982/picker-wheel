import { useState } from 'react';

interface WheelData {
  id: string;
  name: string;
  options: string[];
  createdAt: string;
  spins: number;
}

export default function UserDashboard() {
  // Sample wheels data for metrics
  const [userWheels] = useState<WheelData[]>([
    {
      id: '1',
      name: 'Lunch Options',
      options: ['Pizza', 'Burger', 'Sushi', 'Tacos'],
      createdAt: '2024-03-20',
      spins: 12
    },
    {
      id: '2',
      name: 'Team Picker',
      options: ['Alice', 'Bob', 'Charlie'],
      createdAt: '2024-03-21',
      spins: 7
    }
  ]);

  const totalWheels = userWheels.length;
  const totalSpins = userWheels.reduce((sum, w) => sum + w.spins, 0);

  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ marginBottom: '2rem', color: 'var(--primary-color)' }}>Account Metrics</h2>
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
      </div>
    </div>
  );
} 