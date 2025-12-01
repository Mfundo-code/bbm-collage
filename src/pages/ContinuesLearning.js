// src/pages/ContinuesLearning.js
import React from 'react';

const ContinuesLearning = () => {
  const styles = {
    page: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    },
    card: {
      maxWidth: '500px',
      textAlign: 'center',
      padding: '4rem 3rem',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(34, 197, 94, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(187, 247, 208, 0.5)'
    },
    icon: {
      fontSize: '4rem',
      color: '#16a34a',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '2.2rem',
      background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem',
      fontWeight: 800
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#4b5563',
      lineHeight: 1.7,
      marginBottom: '2rem'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: '0.75rem 2rem',
      borderRadius: '999px',
      fontSize: '1rem',
      fontWeight: 600,
      marginTop: '1rem',
      border: '2px solid #bbf7d0'
    },
    features: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '2rem',
      textAlign: 'left'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#4b5563',
      fontSize: '0.95rem'
    },
    checkIcon: {
      color: '#22c55e'
    }
  };

  const features = [
    'Advanced courses and workshops',
    'Professional development tracks',
    'Interactive learning materials',
    'Peer collaboration spaces',
    'Progress tracking and certifications'
  ];

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
      <div style={styles.card}>
        <div style={{...styles.icon, animation: 'float 3s ease-in-out infinite'}}>
          <svg 
            width="1em" 
            height="1em" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
        </div>
        
        <h1 style={styles.title}>Continuous Learning</h1>
        
        <p style={styles.subtitle}>
          We're building a comprehensive learning ecosystem for ministry leaders. 
          This platform will provide ongoing education, skill development, and 
          resources to support your growth journey.
        </p>
        
        <div style={styles.badge}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: '4px'}}>
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
          </svg>
          In Development
        </div>
        
        <div style={styles.features}>
          {features.map((feature, index) => (
            <div key={index} style={styles.feature}>
              <svg 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 16 16"
                style={styles.checkIcon}
              >
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
              </svg>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContinuesLearning;