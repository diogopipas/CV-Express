import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

interface AuthStatus {
  authenticated: boolean;
  userData: any;
  resume: any;
}

const Popup: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'AUTH_STATUS' });
      if (response.success) {
        setAuthStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoggingIn(true);

    try {
      // Import auth from utils
      const { auth } = await import('../utils/auth');
      const result = await auth.login(email, password);

      if (result.success) {
        await checkAuthStatus();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { auth } = await import('../utils/auth');
      await auth.logout();
      setAuthStatus(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const openWebApp = () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authStatus?.authenticated) {
    return (
      <div className="popup-container">
        <div className="header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1>CV-Express</h1>
          </div>
        </div>

        <div className="content">
          <div className="login-prompt">
            <h2>Welcome Back!</h2>
            <p>Login to start auto-filling job applications</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loggingIn}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loggingIn}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loggingIn}>
              {loggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="divider">or</div>

          <button onClick={openWebApp} className="btn btn-secondary">
            Open CV-Express Web App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1>CV-Express</h1>
        </div>
      </div>

      <div className="content">
        <div className="user-info">
          <div className="avatar">
            {authStatus.userData.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{authStatus.userData.name}</h3>
            <p>{authStatus.userData.email}</p>
          </div>
        </div>

        {authStatus.resume ? (
          <div className="resume-info">
            <div className="resume-icon">📄</div>
            <div>
              <p className="resume-name">{authStatus.resume.originalName}</p>
              <p className="resume-meta">Resume loaded</p>
            </div>
          </div>
        ) : (
          <div className="no-resume">
            <p>No resume found</p>
            <button onClick={openWebApp} className="btn btn-text">
              Upload Resume
            </button>
          </div>
        )}

        <div className="info-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>
            Visit a job application page and click the floating "Auto-Fill" button to automatically fill the form with your information.
          </p>
        </div>

        <div className="actions">
          <button onClick={openWebApp} className="btn btn-primary">
            Open CV-Express
          </button>
          <button onClick={openOptions} className="btn btn-secondary">
            Settings
          </button>
          <button onClick={handleLogout} className="btn btn-text">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Render the popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}

