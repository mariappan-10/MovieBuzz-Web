import React from 'react';
import { useNavigate } from 'react-router-dom';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <button onClick={() => navigate('/')} className="back-button">
        ← Back to Home
      </button>

      <div className="about-content">
        <div className="about-header">
          <h1>About MovieBuzz</h1>
          <p className="about-tagline">Your ultimate movie discovery companion</p>
        </div>

        <div className="about-sections">
          <section className="about-section">
            <h2>What is MovieBuzz?</h2>
            <p>
              MovieBuzz is a modern web application designed to help movie enthusiasts discover, 
              search, and manage their favorite films. Built with cutting-edge web technologies, 
              it provides a seamless experience for exploring movies and building your personal watchlist.
            </p>
          </section>

          <section className="about-section">
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>🔍 Movie Search</h3>
                <p>Search through thousands of movies with instant results and detailed information.</p>
              </div>
              <div className="feature-card">
                <h3>📝 Personal Watchlist</h3>
                <p>Create and manage your personal movie watchlist to keep track of films you want to watch.</p>
              </div>
              <div className="feature-card">
                <h3>📱 Responsive Design</h3>
                <p>Enjoy a seamless experience across all devices - desktop, tablet, and mobile.</p>
              </div>
              <div className="feature-card">
                <h3>🔐 User Authentication</h3>
                <p>Secure user accounts with personalized experiences and data protection.</p>
              </div>
            </div>
          </section>

          <section className="about-section creators-section">
            <h2>Created By</h2>
            <div className="creators">
              <div className="creator-card">
                <div className="creator-avatar">👨‍💻</div>
                <h3>Mariappan</h3>
                <p>Full-Stack Developer</p>
                <a 
                  href="https://www.linkedin.com/in/mariappan-77386514b" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="linkedin-link"
                >
                  <span className="linkedin-icon">💼</span>
                  Connect on LinkedIn
                </a>
              </div>
              <div className="creator-card">
                <div className="creator-avatar">🤖</div>
                <h3>Claude AI</h3>
                <p>AI Assistant by Anthropic</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Get Started</h2>
            <p>
              Ready to discover your next favorite movie? Start by searching for films or create an account 
              to build your personal watchlist and get the most out of MovieBuzz.
            </p>
            <div className="cta-buttons">
              <button onClick={() => navigate('/')} className="cta-button primary">
                Start Exploring
              </button>
              <button onClick={() => navigate('/register')} className="cta-button secondary">
                Create Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;