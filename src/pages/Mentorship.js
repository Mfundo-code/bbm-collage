// src/pages/Mentorship.js
import React from 'react';

const Mentorship = () => {
  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      color: '#1e293b',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1.1rem',
    },
    content: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    mentorCard: {
      backgroundColor: '#fef7ed',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      border: '1px solid #fed7aa',
    },
    mentorName: {
      fontSize: '1.25rem',
      color: '#9a3412',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mentorship Program</h1>
        <p style={styles.subtitle}>Guidance and discipleship for spiritual growth</p>
      </div>

      <div style={styles.content}>
        <div style={styles.mentorCard}>
          <h3 style={styles.mentorName}>Pastor John Smith</h3>
          <p><strong>Focus:</strong> Pastoral Ministry</p>
          <p><strong>Experience:</strong> 15 years in church leadership</p>
        </div>
        
        <div style={styles.mentorCard}>
          <h3 style={styles.mentorName}>Dr. Sarah Johnson</h3>
          <p><strong>Focus:</strong> Theological Studies</p>
          <p><strong>Experience:</strong> PhD in Systematic Theology</p>
        </div>
        
        <div style={styles.mentorCard}>
          <h3 style={styles.mentorName}>Elder Michael Brown</h3>
          <p><strong>Focus:</strong> Practical Ministry</p>
          <p><strong>Experience:</strong> 20 years in community outreach</p>
        </div>
      </div>
    </div>
  );
};

export default Mentorship;