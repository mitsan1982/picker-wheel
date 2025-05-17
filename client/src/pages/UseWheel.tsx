import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wheel } from '../components/Wheel';
import { getWheelById, type Wheel as WheelType, spinWheel } from '../api';

interface DashboardContext {
  userData: {
    name: string;
    email: string;
    picture: string;
  };
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
}

export default function UseWheel() {
  const { id } = useParams<{ id: string }>();
  const [wheel, setWheel] = useState<WheelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getWheelById(id)
      .then(setWheel)
      .catch(() => setError('Wheel not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSpin = async () => {
    setSpinning(true);
    try {
      if (wheel) {
        const updated = await spinWheel(wheel.id);
        setWheel(updated);
      }
    } finally {
      setSpinning(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error || !wheel) return <div>Wheel not found.</div>;

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
            >
              My Wheels
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content" style={{ paddingTop: '4rem', maxWidth: 600, margin: '0 auto' }}>
        <section className="wheels-section" style={{textAlign: 'center'}}>
          <h2>{wheel.name}</h2>
          <div style={{ margin: '2rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Wheel options={wheel.options} spinning={spinning} onSpinEnd={() => setSpinning(false)} />
            <button
              className="spin-button"
              style={{ marginTop: '2rem', minWidth: 180 }}
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? 'Spinning...' : 'Spin the Wheel'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
} 