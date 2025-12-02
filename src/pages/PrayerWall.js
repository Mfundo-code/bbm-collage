import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { prayerWallAPI } from '../services/api';

const PrayerWall = () => {
  const { user } = useAuth();
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [filter, setFilter] = useState('all'); // all, my, answered, urgent
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simplified palette: only greens + muted neutrals (removed blue/red)
  const PRIMARY = '#10b981'; // green
  const PRIMARY_DARK = '#047857';
  const PRIMARY_LIGHT = '#ecfdf5';
  const MUTED = '#6b7280';

  useEffect(() => {
    loadPrayerRequests();
  }, [filter]);

  const loadPrayerRequests = async () => {
    try {
      setLoading(true);
      let params = {};

      if (filter === 'my') {
        params.myRequests = true;
      } else if (filter === 'answered') {
        params.status = 'answered';
      } else if (filter === 'urgent') {
        params.urgency = 'high';
      }

      const response = await prayerWallAPI.getRequests(params);
      const data = response.data;

      if (data && data.items) {
        setPrayerRequests(data.items);
      } else {
        setPrayerRequests([]);
      }
    } catch (error) {
      console.error('Error loading prayer requests:', error);
      setPrayerRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequest = async () => {
    if (newRequest.trim()) {
      try {
        const response = await prayerWallAPI.createRequest({
          text: newRequest,
          urgency: urgency,
          images: []
        });

        // Add the new request to the beginning of the list
        setPrayerRequests(prev => [response.data, ...prev]);
        setNewRequest('');
        setUrgency('medium');
      } catch (error) {
        console.error('Error creating prayer request:', error);
        alert('Failed to create prayer request. Please try again.');
      }
    }
  };

  const handlePray = async (prayerRequestId) => {
    try {
      await prayerWallAPI.prayForRequest(prayerRequestId);

      // Update local state
      setPrayerRequests(prev => prev.map(req =>
        req.id === prayerRequestId
          ? { ...req, prayerCount: (req.prayerCount || 0) + 1 }
          : req
      ));
    } catch (error) {
      console.error('Error adding prayer:', error);
      alert('Failed to add prayer. Please try again.');
    }
  };

  const handleMarkAnswered = async (prayerRequestId) => {
    try {
      await prayerWallAPI.markAsAnswered(prayerRequestId);

      // Update local state
      setPrayerRequests(prev => prev.map(req =>
        req.id === prayerRequestId
          ? { ...req, status: 'answered', isAnswered: true, answeredAt: new Date().toISOString() }
          : req
      ));

      alert('Prayer request marked as answered!');
    } catch (error) {
      console.error('Error updating prayer request:', error);
      alert('Failed to update prayer request. Please try again.');
    }
  };

  const handleDeleteRequest = async (prayerRequestId) => {
    if (window.confirm('Are you sure you want to delete this prayer request?')) {
      try {
        await prayerWallAPI.deleteRequest(prayerRequestId);

        // Remove from local state
        setPrayerRequests(prev => prev.filter(req => req.id !== prayerRequestId));
      } catch (error) {
        console.error('Error deleting prayer request:', error);
        alert('Failed to delete prayer request. Please try again.');
      }
    }
  };

  // Improved urgency styles for readability
  const getUrgencyStyles = (u) => {
    switch (u) {
      case 'low':
        return { background: '#ecfccb', color: '#365314' };
      case 'high':
        return { background: '#fde68a', color: '#92400e' };
      case 'medium':
      default:
        return { background: '#fef3c7', color: '#92400e' };
    }
  };

  const styles = {
    page: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: isMobile ? '0 0.75rem 2rem' : '0 1rem 3rem',
      color: PRIMARY_DARK,
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    header: { 
      marginBottom: isMobile ? '1rem' : '1.25rem',
      textAlign: isMobile ? 'center' : 'left'
    },
    title: { 
      fontSize: isMobile ? '1.5rem' : '1.75rem', 
      color: PRIMARY_DARK, 
      marginBottom: '0.25rem',
      textAlign: isMobile ? 'center' : 'left'
    },
    subtitle: { 
      color: MUTED, 
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      textAlign: isMobile ? 'center' : 'left'
    },

    filters: { 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '1rem', 
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-start'
    },
    filterButton: {
      padding: isMobile ? '0.4rem 0.7rem' : '0.5rem 0.9rem',
      borderRadius: '999px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      color: MUTED,
      border: '1px solid rgba(0,0,0,0.06)',
      minWidth: isMobile ? '80px' : 'auto'
    },
    filterButtonActive: {
      backgroundColor: PRIMARY_DARK,
      color: 'white',
      borderColor: PRIMARY_DARK
    },

    content: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: '0 8px 30px rgba(15,23,42,0.03)'
    },
    addSection: {
      marginBottom: isMobile ? '1rem' : '1.25rem',
      padding: isMobile ? '0.75rem' : '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid rgba(0,0,0,0.03)'
    },
    textarea: {
      width: '100%',
      padding: isMobile ? '0.75rem' : '0.9rem',
      border: '1px solid rgba(15,23,42,0.06)',
      borderRadius: '8px',
      fontSize: isMobile ? '0.95rem' : '0.98rem',
      resize: 'vertical',
      minHeight: '80px',
      marginBottom: '0.75rem',
      fontFamily: 'inherit',
      color: PRIMARY_DARK,
      backgroundColor: 'white'
    },
    urgencySelect: {
      padding: isMobile ? '0.4rem' : '0.5rem',
      border: '1px solid rgba(15,23,42,0.06)',
      borderRadius: '6px',
      marginBottom: isMobile ? '0.5rem' : '0.75rem',
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      color: PRIMARY_DARK,
      backgroundColor: 'white',
      width: isMobile ? '100%' : 'auto'
    },

    // Button variants with distinct states but no blue/red
    addButton: {
      backgroundColor: PRIMARY_DARK,
      color: 'white',
      border: 'none',
      padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.1rem',
      borderRadius: '8px',
      fontWeight: 700,
      cursor: 'pointer',
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      boxShadow: '0 6px 20px rgba(4,120,87,0.12)',
      width: isMobile ? '100%' : 'auto'
    },
    addButtonDisabled: {
      backgroundColor: 'rgba(16,185,129,0.35)',
      color: 'white',
      border: 'none',
      padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.1rem',
      borderRadius: '8px',
      fontWeight: 700,
      cursor: 'not-allowed',
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      width: isMobile ? '100%' : 'auto'
    },

    prayerCard: {
      backgroundColor: '#ffffff',
      padding: isMobile ? '0.75rem' : '1rem',
      borderRadius: '10px',
      marginBottom: isMobile ? '0.75rem' : '0.85rem',
      border: '1px solid rgba(15,23,42,0.03)',
      position: 'relative'
    },
    prayerHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'flex-start', 
      marginBottom: '0.5rem',
      gap: isMobile ? '0.5rem' : '0'
    },
    prayerUserInfo: { flex: 1 },
    prayerName: { 
      fontWeight: 700, 
      color: PRIMARY_DARK,
      fontSize: isMobile ? '0.95rem' : '1rem'
    },
    prayerDate: { 
      color: MUTED, 
      fontSize: isMobile ? '0.8rem' : '0.85rem' 
    },
    prayerMeta: { 
      display: 'flex', 
      gap: '0.5rem', 
      alignItems: 'center',
      flexWrap: 'wrap'
    },

    urgencyBadge: (u) => ({
      padding: '0.25rem 0.6rem',
      borderRadius: '999px',
      fontSize: isMobile ? '0.7rem' : '0.78rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      ...getUrgencyStyles(u)
    }),

    missionaryBadge: { 
      backgroundColor: '#f1f5f9', 
      color: PRIMARY_DARK, 
      padding: '0.25rem 0.6rem', 
      borderRadius: '999px', 
      fontSize: isMobile ? '0.7rem' : '0.78rem' 
    },

    prayerText: { 
      marginBottom: isMobile ? '0.5rem' : '0.75rem', 
      lineHeight: 1.6, 
      whiteSpace: 'pre-wrap', 
      color: PRIMARY_DARK,
      fontSize: isMobile ? '0.9rem' : '1rem'
    },

    prayerActions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '1rem', 
      alignItems: isMobile ? 'flex-start' : 'center', 
      justifyContent: 'space-between' 
    },
    prayerButtons: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0.6rem', 
      alignItems: 'flex-start',
      width: isMobile ? '100%' : 'auto'
    },

    // distinct buttons but using greens / neutral outlines
    prayButton: {
      backgroundColor: PRIMARY,
      color: 'white',
      border: 'none',
      padding: isMobile ? '0.4rem 0.8rem' : '0.45rem 0.9rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      fontWeight: 700,
      boxShadow: '0 6px 18px rgba(16,185,129,0.12)',
      width: isMobile ? '100%' : 'auto'
    },

    answeredButton: {
      backgroundColor: 'transparent',
      color: PRIMARY_DARK,
      border: `1px solid ${PRIMARY_DARK}`,
      padding: isMobile ? '0.4rem 0.8rem' : '0.45rem 0.9rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      fontWeight: 700,
      boxShadow: 'none',
      width: isMobile ? '100%' : 'auto'
    },

    deleteButton: {
      backgroundColor: 'transparent',
      color: MUTED,
      border: '1px solid rgba(15,23,42,0.06)',
      padding: isMobile ? '0.4rem 0.8rem' : '0.45rem 0.9rem',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      fontWeight: 700,
      boxShadow: 'none',
      width: isMobile ? '100%' : 'auto'
    },

    statusBadge: (isAnswered) => ({
      padding: '0.25rem 0.6rem',
      borderRadius: '999px',
      fontSize: isMobile ? '0.7rem' : '0.78rem',
      fontWeight: 700,
      backgroundColor: isAnswered ? PRIMARY_LIGHT : '#f1f5f9',
      color: isAnswered ? PRIMARY_DARK : MUTED
    }),

    answeredInfo: { 
      marginTop: '0.8rem', 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      backgroundColor: PRIMARY_LIGHT, 
      borderRadius: '8px', 
      color: MUTED, 
      fontSize: isMobile ? '0.85rem' : '0.9rem' 
    },
    loading: { 
      textAlign: 'center', 
      padding: '2rem', 
      color: PRIMARY_DARK 
    },

    // New styles for mobile form layout
    formControls: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.6rem' : '0.6rem',
      alignItems: isMobile ? 'stretch' : 'center',
      marginBottom: isMobile ? '0.5rem' : '0.75rem'
    },
    formButtons: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0',
      alignItems: 'stretch',
      width: isMobile ? '100%' : 'auto'
    },
    urgencyContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0.6rem',
      alignItems: isMobile ? 'stretch' : 'center',
      width: isMobile ? '100%' : 'auto'
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading prayer requests...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Prayer Wall</h1>
        <p style={styles.subtitle}>Share your prayer requests and pray for others</p>
      </div>

      <div style={styles.filters}>
        <button
          style={{ ...styles.filterButton, ...(filter === 'all' ? styles.filterButtonActive : {}) }}
          onClick={() => setFilter('all')}
        >
          All Prayers
        </button>
        <button
          style={{ ...styles.filterButton, ...(filter === 'my' ? styles.filterButtonActive : {}) }}
          onClick={() => setFilter('my')}
        >
          My Prayers
        </button>
        <button
          style={{ ...styles.filterButton, ...(filter === 'answered' ? styles.filterButtonActive : {}) }}
          onClick={() => setFilter('answered')}
        >
          Answered
        </button>
        <button
          style={{ ...styles.filterButton, ...(filter === 'urgent' ? styles.filterButtonActive : {}) }}
          onClick={() => setFilter('urgent')}
        >
          Urgent
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.addSection}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.1rem' }}>Add Your Prayer Request</h3>
          <textarea
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            placeholder="Share your prayer request..."
            style={styles.textarea}
            aria-label="New prayer request"
          />
          <div style={styles.formControls}>
            <div style={styles.urgencyContainer}>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                style={styles.urgencySelect}
                aria-label="Urgency"
              >
                <option value="low">Low Urgency</option>
                <option value="medium">Medium Urgency</option>
                <option value="high">High Urgency</option>
              </select>

              <div style={styles.formButtons}>
                <button
                  style={newRequest.trim() ? styles.addButton : styles.addButtonDisabled}
                  onClick={handleAddRequest}
                  disabled={!newRequest.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ 
            marginTop: 0, 
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Prayer Requests ({prayerRequests.length})
          </h3>
          {prayerRequests.length === 0 ? (
            <p style={{ 
              textAlign: 'center', 
              color: MUTED, 
              padding: isMobile ? '1.5rem' : '2rem',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}>
              No prayer requests found. {filter === 'my' ? 'You haven\'t posted any prayer requests yet.' : 'Be the first to share one!'}
            </p>
          ) : (
            prayerRequests.map((request) => (
              <div key={request.id} style={styles.prayerCard}>
                <div style={styles.prayerHeader}>
                  <div style={styles.prayerUserInfo}>
                    <div style={styles.prayerName}>
                      {request.postedBy?.firstName || 'Anonymous'} {request.postedBy?.lastName || ''}
                    </div>
                    <div style={styles.prayerDate}>
                      {new Date(request.createdAt).toLocaleDateString()} • {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={styles.prayerMeta}>
                    <span style={styles.urgencyBadge(request.urgency)}>
                      {request.urgency}
                    </span>
                    {request.missionary && (
                      <span style={styles.missionaryBadge}>
                        🙏 {request.missionary.user?.firstName || 'Missionary'}
                      </span>
                    )}
                    <span style={styles.statusBadge(request.isAnswered)}>
                      {request.isAnswered ? 'Answered' : 'Active'}
                    </span>
                  </div>
                </div>

                <p style={styles.prayerText}>{request.text}</p>

                <div style={styles.prayerActions}>
                  <div style={styles.prayerButtons}>
                    <button
                      style={styles.prayButton}
                      onClick={() => handlePray(request.id)}
                      aria-label={`I prayed for request ${request.id}`}
                    >
                      🙏 I Prayed ({request.prayerCount || 0})
                    </button>

                    {request.postedBy?.id === user?.id && !request.isAnswered && (
                      <button
                        style={styles.answeredButton}
                        onClick={() => handleMarkAnswered(request.id)}
                        aria-label={`Mark request ${request.id} as answered`}
                      >
                        ✅ Mark as Answered
                      </button>
                    )}
                  </div>

                  {(request.postedBy?.id === user?.id || user?.role === 'admin') && (
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteRequest(request.id)}
                      aria-label={`Delete request ${request.id}`}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>

                {request.isAnswered && (
                  <div style={styles.answeredInfo}>
                    ✓ This prayer has been answered on {request.answeredAt ? new Date(request.answeredAt).toLocaleDateString() : 'a previous date'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerWall;