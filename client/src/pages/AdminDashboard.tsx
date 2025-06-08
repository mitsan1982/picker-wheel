import { useEffect, useState } from 'react';

interface Metrics {
  usersCount: number;
  wheelsCount: number;
  visits: number;
  registrationAttempts: number;
  instance: {
    memoryUsage: any;
    cpuUsage: any;
    uptime: number;
    loadAvg: number[];
    freeMem: number;
    totalMem: number;
  };
  users: any[];
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const idToken = localStorage.getItem('googleCredential');
        if (!idToken) throw new Error('Not authenticated');
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const frontendSecret = import.meta.env.VITE_FRONTEND_SECRET;
        if (!frontendSecret) throw new Error('VITE_FRONTEND_SECRET environment variable is required');
        const res = await fetch(`${apiBase}/api/admin/metrics`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'X-Frontend-Secret': frontendSecret
          }
        });
        if (res.status === 403) {
          setError('403: Forbidden. You do not have access to this page.');
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red', margin: '2rem' }}>{error}</div>;
  if (!metrics) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '2rem', minWidth: 180, textAlign: 'center', flex: '1 1 0' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{metrics.usersCount}</div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>Users</div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '2rem', minWidth: 180, textAlign: 'center', flex: '1 1 0' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{metrics.wheelsCount}</div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>Wheels</div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '2rem', minWidth: 180, textAlign: 'center', flex: '1 1 0' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{metrics.visits}</div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>Visits</div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '2rem', minWidth: 180, textAlign: 'center', flex: '1 1 0' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-color)' }}>{metrics.registrationAttempts}</div>
          <div style={{ color: 'var(--primary-color)', fontWeight: 500, marginTop: '0.5rem' }}>Registration Attempts</div>
        </div>
      </div>
      <h3 style={{ marginTop: '2.5rem', color: 'var(--primary-color)' }}>Instance Metrics</h3>
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '2rem', marginTop: '1rem' }}>
        {/* Memory Usage */}
        {(() => {
          const mem = metrics.instance.memoryUsage;
          const totalMem = metrics.instance.totalMem;
          const usedMem = mem.rss;
          const usedMB = usedMem / 1024 / 1024;
          const totalMB = totalMem / 1024 / 1024;
          const memPercent = totalMem ? (usedMem / totalMem) * 100 : 0;
          return (
            <div style={{ marginBottom: '1rem' }}>
              <b>Memory Usage:</b> {usedMB.toFixed(1)} MB / {totalMB.toFixed(1)} MB ({memPercent.toFixed(1)}%)
              <div style={{ height: 8, background: '#eee', borderRadius: 4, marginTop: 4, marginBottom: 4 }}>
                <div style={{ width: `${memPercent}%`, height: '100%', background: 'var(--accent-color)', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: '0.95em', color: '#666' }}>
                <span>RSS: {usedMB.toFixed(1)} MB</span> | <span>Heap Used: {(mem.heapUsed / 1024 / 1024).toFixed(1)} MB</span> | <span>Heap Total: {(mem.heapTotal / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>
          );
        })()}
        {/* CPU Usage */}
        {(() => {
          const cpu = metrics.instance.cpuUsage;
          const totalCpu = cpu.user + cpu.system;
          // Node's cpuUsage is in microseconds, convert to ms
          const userMs = cpu.user / 1000;
          const systemMs = cpu.system / 1000;
          const totalMs = totalCpu / 1000;
          // Estimate percentage: divide by uptime (in seconds) * 1000 (ms)
          const uptimeMs = metrics.instance.uptime * 1000;
          const cpuPercent = uptimeMs ? (totalMs / uptimeMs) * 100 : 0;
          return (
            <div style={{ marginBottom: '1rem' }}>
              <b>CPU Usage:</b> {totalMs.toFixed(0)} ms (User: {userMs.toFixed(0)} ms, System: {systemMs.toFixed(0)} ms) <span style={{ color: '#888', fontSize: '0.95em' }}>~{cpuPercent.toFixed(1)}% of uptime</span>
              <div style={{ height: 8, background: '#eee', borderRadius: 4, marginTop: 4, marginBottom: 4 }}>
                <div style={{ width: `${Math.min(cpuPercent, 100)}%`, height: '100%', background: 'var(--accent-color)', borderRadius: 4 }} />
              </div>
            </div>
          );
        })()}
        <div><b>Uptime:</b> {metrics.instance.uptime.toFixed(1)}s</div>
        <div><b>Load Average:</b> {metrics.instance.loadAvg.map(n => n.toFixed(2)).join(', ')}</div>
        <div><b>Free Memory:</b> {(metrics.instance.freeMem / 1024 / 1024).toFixed(1)} MB</div>
        <div><b>Total Memory:</b> {(metrics.instance.totalMem / 1024 / 1024).toFixed(1)} MB</div>
      </div>

      {/* Users Widget */}
      <h3 style={{ marginTop: '2.5rem', color: 'var(--primary-color)' }}>Users</h3>
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '2rem', marginTop: '1rem' }}>
        {!metrics.users ? (
          <div>No users data available.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {metrics.users.map((user: any) => (
                <tr key={user.email}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{user.email}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{user.name || '-'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{user.role || 'user'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 