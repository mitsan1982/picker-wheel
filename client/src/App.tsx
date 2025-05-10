import { useState } from 'react'
import { Wheel } from './components/Wheel'
import './App.css'

const sampleOptions = [
  'Pizza', 'Burger', 'Sushi', 'Tacos',
  'Pasta', 'Salad', 'Steak', 'Curry'
];

function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSpinEnd = () => {
    setIsSpinning(false);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">Wheel of Fortune</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#create">Create</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <section className="hero-bg">
        <div className="hero-card">
          <div className="hero-flex">
            <div className="hero-text">
              <h1>Where <span className="gradient-text">Randomness</span> Meets</h1>
              <h2>Creativity in Decision Making</h2>
              <p className="subtitle">
                Transform your choices into an exciting experience with our interactive wheel picker.<br/>
                Perfect for teams, events, and everyday decisions.
              </p>
              <button 
                className="cta-button"
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Wheel
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
              onClick={() => setShowCreateForm(true)}
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
          <div className="footer-logo">Wheel of Fortune</div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#create">Create</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-copyright">
            © 2024 Wheel of Fortune. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
