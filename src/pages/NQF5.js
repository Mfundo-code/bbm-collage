// src/pages/NQF5.js
import React from 'react';

const NQF5 = () => {
  const styles = {
    page: {
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0fdf4',
      padding: '1.5rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    },
    container: {
      maxWidth: '450px',
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)',
      border: '1px solid #dcfce7'
    },
    iconContainer: {
      width: '80px',
      height: '80px',
      backgroundColor: '#dcfce7',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      border: '2px solid #bbf7d0'
    },
    icon: {
      fontSize: '2.5rem',
      color: '#16a34a'
    },
    title: {
      fontSize: '1.75rem',
      color: '#166534',
      marginBottom: '0.75rem',
      fontWeight: 700
    },
    message: {
      fontSize: '1rem',
      color: '#4b5563',
      lineHeight: 1.5,
      marginBottom: '1.5rem'
    },
    progressBar: {
      width: '100%',
      height: '6px',
      backgroundColor: '#e5e7eb',
      borderRadius: '3px',
      overflow: 'hidden',
      margin: '1.5rem auto'
    },
    progressFill: {
      width: '65%',
      height: '100%',
      backgroundColor: '#22c55e',
      borderRadius: '3px',
      animation: 'pulse 2s ease-in-out infinite'
    },
    status: {
      display: 'inline-block',
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: '0.4rem 1.25rem',
      borderRadius: '999px',
      fontSize: '0.85rem',
      fontWeight: 600,
      marginTop: '0.75rem',
      border: '1px solid #bbf7d0'
    },
    comingSoon: {
      marginTop: '1.5rem',
      color: '#6b7280',
      fontSize: '0.9rem',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.iconContainer}>
          <svg 
            style={styles.icon}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h1 style={styles.title}>NQF 5 Program</h1>
        
        <p style={styles.message}>
          We're currently developing an amazing learning experience for the National Qualifications Framework Level 5.
          This section will include comprehensive courses, interactive materials, and assessment tools.
        </p>
        
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>
        
        <div style={styles.status}>In Development</div>
        
        <p style={styles.comingSoon}>
          Stay tuned for our launch announcement!
        </p>
      </div>
    </div>
  );
};

export default NQF5;