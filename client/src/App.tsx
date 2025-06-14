import { useState, useEffect } from 'react'
import { Wheel } from './components/Wheel'
import Login from './pages/Login'
import './App.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const sampleOptions = [
  'Pizza', 'Burger', 'Sushi', 'Tacos',
  'Pasta', 'Salad', 'Steak', 'Curry'
];

function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('googleCredential')));
  const navigate = useNavigate();

  const handleSpinEnd = () => {
    setIsSpinning(false);
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogin(true);
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/check`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.isLoggedIn);
          if (!data.isLoggedIn) {
            navigate('/');
          }
        } else {
          setIsLoggedIn(false);
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
        navigate('/');
      }
    };
    checkLogin();
  }, [navigate]);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <img src="/pickle-logo.png" alt="Pickle Wheel logo" style={{height: '28px', width: '28px', objectFit: 'contain', marginRight: '0.3rem'}} />
            Pickle Wheel
          </div>
          <div className="nav-links">
            {isLoggedIn ? (
              <a href="#" onClick={e => { e.preventDefault(); window.location.href = '/dashboard'; }}>Dashboard</a>
            ) : (
              <a href="#" onClick={handleLoginClick}>Login</a>
            )}
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <section className="hero-bg">
        <div className="hero-card-bg">
          <div className="hero-flex">
            <div className="hero-text">
              <h1>Spin the Pickle!</h1>
              <h2>Fun, Fair, and Fast Decision Making</h2>
              <p className="subtitle">
                Make your choices fun and easy with Pickle Wheel! <br/>
                Perfect for games, giveaways, team decisions, and more.<br/>
              </p>
              <button 
                className="cta-button"
                onClick={() => setShowLogin(true)}
              >
                Create Your First Pickle Wheel
              </button>
            </div>
            <div className="hero-wheel">
              <div className="wheel-card">
                <Wheel 
                  options={sampleOptions} 
                  spinning={isSpinning}
                  onSpinEnd={handleSpinEnd}
                />
                <button 
                  className="spin-button"
                  onClick={() => setIsSpinning(true)}
                  disabled={isSpinning}
                >
                  {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat">
          <span className="stat-number">1000+</span>
          <span className="stat-label">Wheels Created</span>
        </div>
        <div className="stat">
          <span className="stat-number">50k+</span>
          <span className="stat-label">Spins</span>
        </div>
        <div className="stat">
          <span className="stat-number">4.9</span>
          <span className="stat-label">User Rating</span>
        </div>
      </section>

      <main className="main-content">
        <section className="features" id="features">
          <div className="section-header">
            <h2>Why Choose Our Wheel?</h2>
            <p>Discover the features that make our wheel picker stand out</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Customizable Design</h3>
              <p>Create wheels that match your brand with custom colors and themes</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Save & Share</h3>
              <p>Save your wheels and share them with your team or community</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Fair & Random</h3>
              <p>Our algorithm ensures truly random and unbiased results</p>
            </div>
          </div>
        </section>

        <section className="cta-section" id="create">
          <div className="cta-content">
            <h2>Ready to Create Your First Wheel?</h2>
            <p>Join thousands of users who trust our wheel picker for their decisions</p>
            <button 
              className="create-button"
              onClick={() => setShowLogin(true)}
            >
              Create Your Wheel
            </button>
          </div>
        </section>
      </main>

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
            <form className="create-form">
              <div className="form-group">
                <label htmlFor="wheelName">Wheel Name</label>
                <input
                  type="text"
                  id="wheelName"
                  placeholder="Enter wheel name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="wheelOptions">Options (comma-separated)</label>
                <input
                  type="text"
                  id="wheelOptions"
                  placeholder="Option 1, Option 2, Option 3"
                  required
                />
      </div>
              
              <div className="form-actions">
                <button type="submit">Create Wheel</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
        </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-logo">Pickle Wheel</div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
            {isLoggedIn ? (
              <a href="#" onClick={e => { e.preventDefault(); window.location.href = '/dashboard'; }}>Dashboard</a>
            ) : (
              <a href="#" onClick={handleLoginClick}>Login</a>
            )}
          </div>
          <div className="footer-copyright">
            © 2024 Pickle Wheel (<a href="https://picklewheel.com" style={{color: '#fff', textDecoration: 'underline'}}>picklewheel.com</a>). All rights reserved.
          </div>
        </div>
      </footer>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      <Analytics />
      <SpeedInsights />
    </div>
  )
}

export default App
