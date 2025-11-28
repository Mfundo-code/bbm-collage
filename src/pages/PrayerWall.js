// src/pages/PrayerWall.js
import React, { useState } from 'react';

const PrayerWall = () => {
  const [prayerRequests, setPrayerRequests] = useState([
    {
      id: 1,
      name: 'Mary Johnson',
      request: 'Pray for healing from chronic illness',
      date: '2024-01-15',
      prayers: 12
    },
    {
      id: 2,
      name: 'David Chen',
      request: 'Guidance for upcoming ministry decisions',
      date: '2024-01-14',
      prayers: 8
    },
    {
      id: 3,
      name: 'Sarah Williams',
      request: 'Strength for family during difficult times',
      date: '2024-01-13',
      prayers: 15
    }
  ]);

  const [newRequest, setNewRequest] = useState('');

  const handleAddRequest = () => {
    if (newRequest.trim()) {
      const request = {
        id: prayerRequests.length + 1,
        name: 'You',
        request: newRequest,
        date: new Date().toISOString().split('T')[0],
        prayers: 0
      };
      setPrayerRequests([request, ...prayerRequests]);
      setNewRequest('');
    }
  };

  const handlePray = (id) => {
    setPrayerRequests(prayerRequests.map(req => 
      req.id === id ? { ...req, prayers: req.prayers + 1 } : req
    ));
  };

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
    addSection: {
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
    },
    textarea: {
      width: '100%',
      padding: '1rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      resize: 'vertical',
      minHeight: '100px',
      marginBottom: '1rem',
    },
    addButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    prayerCard: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '1px solid #e2e8f0',
    },
    prayerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    prayerName: {
      fontWeight: '600',
      color: '#374151',
    },
    prayerDate: {
      color: '#64748b',
      fontSize: '0.9rem',
    },
    prayerText: {
      marginBottom: '1rem',
      lineHeight: '1.5',
    },
    prayButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Prayer Wall</h1>
        <p style={styles.subtitle}>Share your prayer requests and pray for others</p>
      </div>

      <div style={styles.content}>
        <div style={styles.addSection}>
          <h3>Add Your Prayer Request</h3>
          <textarea
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Share your prayer request..."
            style={styles.textarea}
          />
          <button 
            style={styles.addButton}
            onClick={handleAddRequest}
          >
            Submit Prayer Request
          </button>
        </div>

        <div>
          <h3>Prayer Requests</h3>
          {prayerRequests.map((request) => (
            <div key={request.id} style={styles.prayerCard}>
              <div style={styles.prayerHeader}>
                <span style={styles.prayerName}>{request.name}</span>
                <span style={styles.prayerDate}>{request.date}</span>
              </div>
              <p style={styles.prayerText}>{request.request}</p>
              <button 
                style={styles.prayButton}
                onClick={() => handlePray(request.id)}
              >
                🙏 I Prayed ({request.prayers})
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrayerWall;