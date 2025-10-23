import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';

const Options: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await browser.runtime.sendMessage({ type: 'AUTH_STATUS' });
      if (response.success) {
        setAuthStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
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
    window.open('http://localhost:3000', '_blank');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 style={styles.title}>CV-Express Extension Settings</h1>
        </div>
      </header>

      <div style={styles.content}>
        {authStatus?.authenticated ? (
          <>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Account</h2>
              <div style={styles.card}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Name:</span>
                  <span style={styles.value}>{authStatus.userData.name}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Email:</span>
                  <span style={styles.value}>{authStatus.userData.email}</span>
                </div>
                {authStatus.resume && (
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Resume:</span>
                    <span style={styles.value}>{authStatus.resume.originalName}</span>
                  </div>
                )}
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>About</h2>
              <div style={styles.card}>
                <p style={styles.description}>
                  CV-Express Extension automatically fills job application forms with your information
                  from your CV-Express profile. Simply visit any job application page and click the
                  floating "Auto-Fill" button.
                </p>
                <div style={styles.featureList}>
                  <div style={styles.feature}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Supports major ATS systems (Workday, Greenhouse, Lever, iCIMS)</span>
                  </div>
                  <div style={styles.feature}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Securely stores your data locally</span>
                  </div>
                  <div style={styles.feature}>
                    <span style={styles.featureIcon}>✓</span>
                    <span>Tracks applications automatically</span>
                  </div>
                </div>
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Actions</h2>
              <div style={styles.actions}>
                <button onClick={openWebApp} style={styles.btnPrimary}>
                  Open CV-Express Web App
                </button>
                <button onClick={handleLogout} style={styles.btnSecondary}>
                  Logout
                </button>
              </div>
            </section>
          </>
        ) : (
          <section style={styles.section}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Not Logged In</h2>
              <p style={styles.description}>
                Please login to CV-Express to use the extension.
              </p>
              <button onClick={openWebApp} style={styles.btnPrimary}>
                Open CV-Express Web App
              </button>
            </div>
          </section>
        )}

        <footer style={styles.footer}>
          <p>CV-Express Extension v1.0.0</p>
          <p>© 2025 CV-Express. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#64748b',
  },
  header: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    color: 'white',
    padding: '40px 20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
  },
  label: {
    fontWeight: '600',
    color: '#475569',
  },
  value: {
    color: '#1e293b',
  },
  description: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#475569',
    marginBottom: '20px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: '#475569',
  },
  featureIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: '#10b981',
    color: 'white',
    borderRadius: '50%',
    fontSize: '12px',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  btnPrimary: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    padding: '12px 24px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  footer: {
    marginTop: '60px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
    fontSize: '14px',
    color: '#94a3b8',
  },
};

// Render the options page
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Options />);
}

