// src/pages/NQF5.js
import React from 'react';

const NQF5 = () => {
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
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      color: '#334155',
      marginBottom: '1rem',
    },
    card: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '1px solid #e2e8f0',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>NQF 5 Program</h1>
        <p style={styles.subtitle}>National Qualifications Framework Level 5 Courses</p>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Course Overview</h2>
          <div style={styles.card}>
            <h3>Biblical Studies</h3>
            <p>Comprehensive study of Old and New Testament scriptures with practical application.</p>
          </div>
          <div style={styles.card}>
            <h3>Theology and Doctrine</h3>
            <p>Systematic study of Christian beliefs and theological principles.</p>
          </div>
          <div style={styles.card}>
            <h3>Ministry Leadership</h3>
            <p>Developing leadership skills for effective ministry and church management.</p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Program Requirements</h2>
          <div style={styles.card}>
            <p><strong>Duration:</strong> 2 years full-time</p>
            <p><strong>Credits:</strong> 120 credits minimum</p>
            <p><strong>Assessment:</strong> Assignments, exams, and practical ministry</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NQF5;