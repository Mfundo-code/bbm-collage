// src/pages/ContinuesLearning.js
import React from 'react';

const ContinuesLearning = () => {
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    courseCard: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
    },
    courseTitle: {
      fontSize: '1.25rem',
      color: '#334155',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Continues Learning</h1>
        <p style={styles.subtitle}>Ongoing education and professional development</p>
      </div>

      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.courseCard}>
            <h3 style={styles.courseTitle}>Advanced Biblical Studies</h3>
            <p>Deep dive into specific books and themes of the Bible.</p>
          </div>
          <div style={styles.courseCard}>
            <h3 style={styles.courseTitle}>Contemporary Theology</h3>
            <p>Exploring modern theological issues and responses.</p>
          </div>
          <div style={styles.courseCard}>
            <h3 style={styles.courseTitle}>Pastoral Counseling</h3>
            <p>Skills for effective counseling in ministry contexts.</p>
          </div>
          <div style={styles.courseCard}>
            <h3 style={styles.courseTitle}>Church Administration</h3>
            <p>Managing church operations and resources effectively.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinuesLearning;