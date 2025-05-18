import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { createWheel } from '../api';

interface UserData {
  name: string;
  email: string;
  picture: string;
  userId: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function DashboardLayout() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [wheelName, setWheelName] = useState('');
  const [wheelOptions, setWheelOptions] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshWheels, setRefreshWheels] = useState(0);

  useEffect(() => {
    const credential = localStorage.getItem('googleCredential');
    if (!credential) {
      navigate('/');
      return;
    }
    try {
      const decoded = jwtDecode<any>(credential);
      setUserData({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        userId: decoded.sub
      });
    } catch (error) {
      console.error('Error decoding JWT:', error);
      navigate('/');
    }
  }, [navigate]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <img 
              src={"/pickle-logo.png"}
              alt="Pickle Wheel logo"
              style={{height: '28px', width: '28px', objectFit: 'contain', marginRight: '0.3rem'}}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span>Pickle Wheel</span>
          </div>
          <div className="nav-links">
            <button
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600 }}
              onClick={() => navigate('/dashboard/my-wheels')}
              disabled={location.pathname === '/dashboard/my-wheels'}
            >
              My Wheels
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content" style={{ paddingTop: '4rem' }}>
        <div className="dashboard-grid" style={{gridTemplateColumns: collapsed ? '64px 1fr' : '300px 1fr', transition: 'grid-template-columns 0.3s'}}> 
          {/* Sidebar: Profile & Actions */}
          <section className="profile-section" style={{paddingRight: collapsed ? 0 : '2rem', minWidth: collapsed ? 64 : 300, transition: 'all 0.3s', position: 'relative', alignSelf: 'flex-start'}}>
            {/* Collapsed view: just avatar/initials, clickable to expand */}
            {collapsed ? (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 0}}>
                {userData.picture ? (
                  <img
                    src={userData.picture}
                    alt="Profile"
                    style={{ width: 40, height: 40, borderRadius: '50%', marginBottom: 8, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    onClick={() => setCollapsed(false)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCollapsed(false); }}
                    tabIndex={0}
                    title="Expand sidebar"
                    onError={e => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                    onMouseOver={e => (e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-color)')}
                    onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)')}
                  />
                ) : (
                  <div
                    style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginBottom: 8, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    onClick={() => setCollapsed(false)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCollapsed(false); }}
                    tabIndex={0}
                    title="Expand sidebar"
                    onMouseOver={e => (e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-color)')}
                    onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    {getInitials(userData.name)}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Collapse button at top left of profile card */}
                <button
                  aria-label="Collapse sidebar"
                  onClick={() => setCollapsed(true)}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: 12,
                    zIndex: 2,
                    background: '#fff',
                    border: '1.5px solid var(--accent-color)',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    color: 'var(--accent-color)',
                    fontSize: 20,
                    padding: 0
                  }}
                >
                  {/* SVG left arrow */}
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.5 14L7.5 9L11.5 4" stroke="var(--accent-color)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="profile-card" style={{position: 'relative', marginTop: 0}}>
                  <img 
                    src={userData.picture || '/default-avatar.png'}
                    alt="Profile"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                  />
                  <h2>{userData.name}</h2>
                  <p>{userData.email}</p>
                  <button
                    style={{
                      marginTop: '1.5rem',
                      background: 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.7rem 1.5rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                    onClick={() => {
                      localStorage.removeItem('googleCredential');
                      navigate('/');
                    }}
                  >
                    Logout
                  </button>
                </div>
                {/* Actions Card */}
                <div className="actions-card" style={{marginTop: '2rem', background: 'white', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', padding: '2rem', textAlign: 'center'}}>
                  <button
                    className="cta-button"
                    style={{width: '100%', marginBottom: '1rem'}}
                    onClick={() => navigate('/dashboard')}
                    disabled={location.pathname === '/dashboard'}
                  >
                    Dashboard
                  </button>
                  <button
                    className="create-button"
                    style={{width: '100%', marginBottom: '1rem'}}
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create Wheel
                  </button>
                  <button
                    className="cta-button"
                    style={{width: '100%'}}
                    onClick={() => navigate('/dashboard/my-wheels')}
                    disabled={location.pathname === '/dashboard/my-wheels'}
                  >
                    My Wheels
                  </button>
                </div>
              </>
            )}
          </section>
          {/* Main Content Outlet */}
          <section style={{width: '100%'}}>
            <Outlet context={{ userData, showCreateForm, setShowCreateForm, refreshWheels, setRefreshWheels }} />
          </section>
        </div>
        {/* Create Wheel Modal (global for dashboard) */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal">
              <button 
                className="close-button"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
              <h2>Create Your Wheel</h2>
              <form className="create-form" onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);
                try {
                  const credential = localStorage.getItem('googleCredential');
                  const decoded = credential ? jwtDecode<any>(credential) : null;
                  const userId = decoded?.sub;
                  if (!userId) throw new Error('User ID not found in JWT');
                  const optionsArr = wheelOptions.split(',').map(opt => opt.trim()).filter(Boolean);
                  if (optionsArr.length < 2) {
                    setError('Please enter at least 2 options.');
                    setLoading(false);
                    return;
                  }
                  const newWheel = await createWheel({ userId, name: wheelName, options: optionsArr, isPublic });
                  setShowCreateForm(false);
                  setWheelName('');
                  setWheelOptions('');
                  setIsPublic(false);
                  setRefreshWheels(r => r + 1);
                  navigate(`/dashboard/wheel/${newWheel.id}`);
                } catch (err: any) {
                  setError(err.message || 'Failed to create wheel');
                } finally {
                  setLoading(false);
                }
              }}>
                <div className="form-group">
                  <label htmlFor="wheelName">Wheel Name</label>
                  <input
                    type="text"
                    id="wheelName"
                    placeholder="Enter wheel name"
                    value={wheelName}
                    onChange={e => setWheelName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="wheelOptions">Options (comma-separated)</label>
                  <input
                    type="text"
                    id="wheelOptions"
                    placeholder="Option 1, Option 2, Option 3"
                    value={wheelOptions}
                    onChange={e => setWheelOptions(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                  />
                  <label htmlFor="isPublic">Make this wheel public</label>
                </div>
                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                <div className="form-actions">
                  <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Wheel'}</button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 