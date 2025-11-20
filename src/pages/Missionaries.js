// src/pages/Missionaries.js
import React, { useState, useEffect } from 'react';
import { missionariesAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Missionaries = () => {
  const [missionaries, setMissionaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMissionary, setSelectedMissionary] = useState(null);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [prayerFormData, setPrayerFormData] = useState({
    text: '',
    urgency: 'medium',
    images: []
  });

  useEffect(() => {
    fetchMissionaries();
  }, []);

  const fetchMissionaries = async () => {
    try {
      const response = await missionariesAPI.getMissionaries();
      setMissionaries(response.data.items);
    } catch (error) {
      console.error('Error fetching missionaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrayerRequests = async (missionaryId) => {
    try {
      const response = await missionariesAPI.getPrayerRequests(missionaryId);
      setPrayerRequests(response.data.items);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    }
  };

  const handleFollow = async (missionaryId) => {
    try {
      await missionariesAPI.followMissionary(missionaryId);
      fetchMissionaries(); // Refresh to update follow status
    } catch (error) {
      console.error('Error following missionary:', error);
    }
  };

  const handleUnfollow = async (missionaryId) => {
    try {
      await missionariesAPI.unfollowMissionary(missionaryId);
      fetchMissionaries(); // Refresh to update follow status
    } catch (error) {
      console.error('Error unfollowing missionary:', error);
    }
  };

  const handlePray = async (prayerRequestId) => {
    try {
      await missionariesAPI.prayForRequest(prayerRequestId);
      if (selectedMissionary) {
        fetchPrayerRequests(selectedMissionary.user.id);
      }
    } catch (error) {
      console.error('Error praying for request:', error);
    }
  };

  const handleSubmitPrayerRequest = async (e) => {
    e.preventDefault();
    if (!selectedMissionary) return;

    try {
      await missionariesAPI.createPrayerRequest(selectedMissionary.user.id, prayerFormData);
      setPrayerFormData({ text: '', urgency: 'medium', images: [] });
      setShowPrayerForm(false);
      fetchPrayerRequests(selectedMissionary.user.id);
    } catch (error) {
      console.error('Error creating prayer request:', error);
    }
  };

  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      color: '#1e293b',
      margin: 0,
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1.1rem',
      marginTop: '0.5rem',
    },
    loading: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b',
    },
    empty: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b',
      backgroundColor: 'white',
      borderRadius: '12px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '2rem',
    },
    missionaryCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
    },
    missionaryCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      borderColor: '#3b82f6',
    },
    missionaryHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    missionaryPhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #e2e8f0',
    },
    missionaryInfo: {
      flex: 1,
    },
    missionaryName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: '0 0 0.25rem 0',
    },
    missionaryLocation: {
      color: '#64748b',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginBottom: '0.25rem',
    },
    missionaryOrg: {
      color: '#3b82f6',
      fontSize: '0.9rem',
      fontWeight: '500',
    },
    status: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    active: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    inactive: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    missionaryBio: {
      color: '#374151',
      lineHeight: '1.5',
      marginBottom: '1.5rem',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
    },
    followBtn: {
      flex: 1,
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s',
    },
    unfollowBtn: {
      flex: 1,
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s',
    },
    prayerBtn: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '2rem',
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '800px',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    modalHeader: {
      padding: '2rem 2rem 1rem 2rem',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    modalTitle: {
      fontSize: '1.5rem',
      color: '#1e293b',
      margin: 0,
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#64748b',
    },
    modalBody: {
      padding: '2rem',
    },
    missionaryDetail: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '2rem',
      marginBottom: '2rem',
    },
    detailPhoto: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '4px solid #e2e8f0',
    },
    detailInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    detailName: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0,
    },
    detailMeta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#64748b',
    },
    ministrySection: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
    },
    ministryDescription: {
      color: '#374151',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
    },
    prayerSection: {
      marginTop: '2rem',
    },
    prayerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    addPrayerBtn: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    prayerRequests: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    prayerCard: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '1.5rem',
      borderLeft: '4px solid #8b5cf6',
    },
    prayerText: {
      color: '#374151',
      lineHeight: '1.5',
      marginBottom: '1rem',
    },
    prayerMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    prayerUrgency: {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    highUrgency: {
      backgroundColor: '#fecaca',
      color: '#dc2626',
    },
    mediumUrgency: {
      backgroundColor: '#fef3c7',
      color: '#d97706',
    },
    lowUrgency: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    prayerStats: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: '#64748b',
      fontSize: '0.9rem',
    },
    prayBtn: {
      background: 'none',
      border: 'none',
      color: '#8b5cf6',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    formOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001,
    },
    formContainer: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      width: '90%',
      maxWidth: '500px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formTitle: {
      fontSize: '1.25rem',
      color: '#1e293b',
      margin: 0,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontWeight: '600',
      color: '#374151',
    },
    textarea: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '100px',
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
    },
    cancelBtn: {
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    submitBtn: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading missionaries...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Missionaries</h1>
        <p style={styles.subtitle}>
          Supporting our missionaries around the world in prayer and partnership
        </p>
      </div>

      {missionaries.length === 0 ? (
        <div style={styles.empty}>
          <p>No missionaries registered yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {missionaries.map(missionary => (
            <div
              key={missionary.user.id}
              style={styles.missionaryCard}
              onClick={() => {
                setSelectedMissionary(missionary);
                fetchPrayerRequests(missionary.user.id);
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.missionaryCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={styles.missionaryHeader}>
                <img
                  src={missionary.photo || '/default-avatar.png'}
                  alt={missionary.user.firstName}
                  style={styles.missionaryPhoto}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div style={styles.missionaryInfo}>
                  <h3 style={styles.missionaryName}>
                    {missionary.user.firstName} {missionary.user.lastName}
                  </h3>
                  <div style={styles.missionaryLocation}>
                    📍 {missionary.locationCountry || 'Unknown location'}
                  </div>
                  {missionary.sendingOrganization && (
                    <div style={styles.missionaryOrg}>
                      {missionary.sendingOrganization}
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                ...styles.status,
                ...(missionary.activeStatus === 'active' ? styles.active : styles.inactive)
              }}>
                {missionary.activeStatus === 'active' ? 'Active' : 'Inactive'}
              </div>

              <p style={styles.missionaryBio}>
                {missionary.bio || 'No bio available.'}
              </p>

              <div style={styles.actions}>
                {missionary.following ? (
                  <button
                    style={styles.unfollowBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfollow(missionary.user.id);
                    }}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    style={styles.followBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(missionary.user.id);
                    }}
                  >
                    Follow
                  </button>
                )}
                <button
                  style={styles.prayerBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMissionary(missionary);
                    fetchPrayerRequests(missionary.user.id);
                  }}
                >
                  🙏 Pray
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMissionary && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Missionary Profile</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedMissionary(null)}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.missionaryDetail}>
                <img
                  src={selectedMissionary.photo || '/default-avatar.png'}
                  alt={selectedMissionary.user.firstName}
                  style={styles.detailPhoto}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div style={styles.detailInfo}>
                  <h3 style={styles.detailName}>
                    {selectedMissionary.user.firstName} {selectedMissionary.user.lastName}
                  </h3>
                  <div style={styles.detailMeta}>
                    <div style={styles.detailItem}>
                      📍 {selectedMissionary.locationCountry || 'Unknown location'}
                    </div>
                    {selectedMissionary.sendingOrganization && (
                      <div style={styles.detailItem}>
                        🏢 {selectedMissionary.sendingOrganization}
                      </div>
                    )}
                    <div style={styles.detailItem}>
                      ⚡ {selectedMissionary.activeStatus === 'active' ? 'Active in Ministry' : 'Currently Inactive'}
                    </div>
                    {selectedMissionary.contactPreference && (
                      <div style={styles.detailItem}>
                        📞 Contact: {selectedMissionary.contactPreference}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedMissionary.bio && (
                <div style={styles.ministrySection}>
                  <h4 style={styles.sectionTitle}>About</h4>
                  <p style={styles.ministryDescription}>{selectedMissionary.bio}</p>
                </div>
              )}

              {selectedMissionary.ministryDescription && (
                <div style={styles.ministrySection}>
                  <h4 style={styles.sectionTitle}>Ministry Work</h4>
                  <p style={styles.ministryDescription}>{selectedMissionary.ministryDescription}</p>
                </div>
              )}

              <div style={styles.prayerSection}>
                <div style={styles.prayerHeader}>
                  <h4 style={styles.sectionTitle}>Prayer Requests</h4>
                  <button
                    style={styles.addPrayerBtn}
                    onClick={() => setShowPrayerForm(true)}
                  >
                    + Add Request
                  </button>
                </div>

                {prayerRequests.length === 0 ? (
                  <p style={{color: '#64748b', textAlign: 'center', padding: '2rem'}}>
                    No prayer requests yet.
                  </p>
                ) : (
                  <div style={styles.prayerRequests}>
                    {prayerRequests.map(request => (
                      <div key={request.id} style={styles.prayerCard}>
                        <p style={styles.prayerText}>{request.text}</p>
                        <div style={styles.prayerMeta}>
                          <span style={{
                            ...styles.prayerUrgency,
                            ...(request.urgency === 'high' ? styles.highUrgency : 
                                 request.urgency === 'medium' ? styles.mediumUrgency : styles.lowUrgency)
                          }}>
                            {request.urgency}
                          </span>
                          <div style={styles.prayerStats}>
                            <span>🙏 {request.prayerCount} prayers</span>
                            <button
                              style={styles.prayBtn}
                              onClick={() => handlePray(request.id)}
                            >
                              + Pray
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrayerForm && selectedMissionary && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>
              Add Prayer Request for {selectedMissionary.user.firstName}
            </h3>
            <form onSubmit={handleSubmitPrayerRequest} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Prayer Request</label>
                <textarea
                  value={prayerFormData.text}
                  onChange={(e) => setPrayerFormData({...prayerFormData, text: e.target.value})}
                  placeholder="Share your prayer request..."
                  style={styles.textarea}
                  required
                />
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Urgency</label>
                <select
                  value={prayerFormData.urgency}
                  onChange={(e) => setPrayerFormData({...prayerFormData, urgency: e.target.value})}
                  style={styles.select}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn}
                  onClick={() => setShowPrayerForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Missionaries;