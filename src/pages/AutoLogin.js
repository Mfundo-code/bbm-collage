// ============================================
// FILE: src/pages/AutoLogin.js
// ============================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AutoLogin = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const { autoLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      return;
    }

    const performAutoLogin = async () => {
      const result = await autoLogin(token);
      
      if (result.success) {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setStatus('error');
      }
    };

    performAutoLogin();
  }, [searchParams, autoLogin, navigate]);

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      padding: '3rem',
      textAlign: 'center',
      minWidth: '400px',
    },
    spinner: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 2rem',
    },
    icon: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      color: 'white',
      fontSize: '3rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
    },
    successIcon: {
      backgroundColor: '#48bb78',
    },
    errorIcon: {
      backgroundColor: '#f56565',
    },
    title: {
      color: '#2d3748',
      marginBottom: '0.5rem',
    },
    text: {
      color: '#718096',
      marginBottom: '1.5rem',
    },
    button: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '0.75rem 2rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '1rem',
    },
  };

  // Add keyframes for spinner
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {status === 'processing' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Logging you in...</h2>
            <p style={styles.text}>Please wait while we verify your credentials.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{...styles.icon, ...styles.successIcon}}>✓</div>
            <h2 style={styles.title}>Login Successful!</h2>
            <p style={styles.text}>Redirecting you to the dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{...styles.icon, ...styles.errorIcon}}>✕</div>
            <h2 style={styles.title}>Login Failed</h2>
            <p style={styles.text}>Your login token is invalid or has expired.</p>
            <button 
              onClick={() => navigate('/login')}
              style={styles.button}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
            >
              Go to Login Page
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AutoLogin;