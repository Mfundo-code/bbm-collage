// src/pages/Alumni.js
import React, { useState, useEffect } from 'react';
import { alumniAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [graduationYears, setGraduationYears] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    graduationYear: '',
    currentLocation: ''
  });

  useEffect(() => {
    fetchAlumni();
    fetchFilters();
  }, [filters]);

  const fetchAlumni = async () => {
    try {
      const response = await alumniAPI.getAlumni(filters);
      setAlumni(response.data.items);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [yearsRes, locationsRes] = await Promise.all([
        alumniAPI.getGraduationYears(),
        alumniAPI.getLocations()
      ]);
      setGraduationYears(yearsRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleFollow = async (alumnusId) => {
    try {
      await alumniAPI.followAlumnus(alumnusId);
      fetchAlumni(); // Refresh to update follow status
    } catch (error) {
      console.error('Error following alumnus:', error);
    }
  };

  const handleUnfollow = async (alumnusId) => {
    try {
      await alumniAPI.unfollowAlumnus(alumnusId);
      fetchAlumni(); // Refresh to update follow status
    } catch (error) {
      console.error('Error unfollowing alumnus:', error);
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
      margin: '0 0 0.5rem 0',
    },
    subtitle: {
      color: '#64748b',
      fontSize: '1.1rem',
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    filter: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      backgroundColor: 'white',
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
    alumnusCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid transparent',
    },
    alumnusCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      borderColor: '#8b5cf6',
    },
    alumnusHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    alumnusPhoto: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #e2e8f0',
    },
    alumnusInfo: {
      flex: 1,
    },
    alumnusName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: '0 0 0.25rem 0',
    },
    alumnusGraduation: {
      color: '#8b5cf6',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
    },
    alumnusLocation: {
      color: '#64748b',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    alumnusBio: {
      color: '#374151',
      lineHeight: '1.5',
      marginBottom: '1.5rem',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    skills: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    skill: {
      backgroundColor: '#e0e7ff',
      color: '#3730a3',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '500',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
    },
    followBtn: {
      flex: 1,
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
    viewBtn: {
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
      maxWidth: '600px',
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
    alumnusDetail: {
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
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1rem',
    },
    bio: {
      color: '#374151',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
    },
    contactInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    contactItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    contactLabel: {
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.9rem',
    },
    contactValue: {
      color: '#64748b',
    },
    linkedProfiles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    profileLink: {
      color: '#3b82f6',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading alumni network...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Alumni Network</h1>
        <p style={styles.subtitle}>
          Connect with graduates from Mission Bible School around the world
        </p>
      </div>

      <div style={styles.filters}>
        <select
          value={filters.graduationYear}
          onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
          style={styles.filter}
        >
          <option value="">All Graduation Years</option>
          {graduationYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        
        <select
          value={filters.currentLocation}
          onChange={(e) => setFilters({...filters, currentLocation: e.target.value})}
          style={styles.filter}
        >
          <option value="">All Locations</option>
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {alumni.length === 0 ? (
        <div style={styles.empty}>
          <p>No alumni found matching your criteria.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {alumni.map(alumnus => (
            <div
              key={alumnus.user.id}
              style={styles.alumnusCard}
              onClick={() => setSelectedAlumnus(alumnus)}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.alumnusCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={styles.alumnusHeader}>
                <img
                  src={alumnus.user.profilePhoto || '/default-avatar.png'}
                  alt={alumnus.user.firstName}
                  style={styles.alumnusPhoto}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div style={styles.alumnusInfo}>
                  <h3 style={styles.alumnusName}>
                    {alumnus.user.firstName} {alumnus.user.lastName}
                  </h3>
                  <div style={styles.alumnusGraduation}>
                    🎓 Class of {alumnus.graduationYear}
                  </div>
                  {alumnus.currentLocation && (
                    <div style={styles.alumnusLocation}>
                      📍 {alumnus.currentLocation}
                    </div>
                  )}
                </div>
              </div>

              {alumnus.bio && (
                <p style={styles.alumnusBio}>{alumnus.bio}</p>
              )}

              {alumnus.skills && alumnus.skills.length > 0 && (
                <div style={styles.skills}>
                  {alumnus.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} style={styles.skill}>{skill}</span>
                  ))}
                  {alumnus.skills.length > 3 && (
                    <span style={styles.skill}>+{alumnus.skills.length - 3} more</span>
                  )}
                </div>
              )}

              <div style={styles.actions}>
                {alumnus.following ? (
                  <button
                    style={styles.unfollowBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnfollow(alumnus.user.id);
                    }}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    style={styles.followBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(alumnus.user.id);
                    }}
                  >
                    Follow
                  </button>
                )}
                <button
                  style={styles.viewBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlumnus(alumnus);
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAlumnus && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Alumni Profile</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedAlumnus(null)}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.alumnusDetail}>
                <img
                  src={selectedAlumnus.user.profilePhoto || '/default-avatar.png'}
                  alt={selectedAlumnus.user.firstName}
                  style={styles.detailPhoto}
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div style={styles.detailInfo}>
                  <h3 style={styles.detailName}>
                    {selectedAlumnus.user.firstName} {selectedAlumnus.user.lastName}
                  </h3>
                  <div style={styles.detailMeta}>
                    <div style={styles.detailItem}>
                      🎓 Class of {selectedAlumnus.graduationYear}
                    </div>
                    {selectedAlumnus.currentLocation && (
                      <div style={styles.detailItem}>
                        📍 {selectedAlumnus.currentLocation}
                      </div>
                    )}
                    <div style={styles.detailItem}>
                      ✉️ {selectedAlumnus.user.email}
                    </div>
                    {selectedAlumnus.user.contactPhone && (
                      <div style={styles.detailItem}>
                        📞 {selectedAlumnus.user.contactPhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedAlumnus.bio && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>About</h4>
                  <p style={styles.bio}>{selectedAlumnus.bio}</p>
                </div>
              )}

              {selectedAlumnus.skills && selectedAlumnus.skills.length > 0 && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>Skills & Expertise</h4>
                  <div style={styles.skills}>
                    {selectedAlumnus.skills.map((skill, index) => (
                      <span key={index} style={styles.skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlumnus.publicContact && Object.keys(selectedAlumnus.publicContact).length > 0 && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>Contact Information</h4>
                  <div style={styles.contactInfo}>
                    {Object.entries(selectedAlumnus.publicContact).map(([key, value]) => (
                      <div key={key} style={styles.contactItem}>
                        <span style={styles.contactLabel}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span style={styles.contactValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlumnus.linkedProfiles && Object.keys(selectedAlumnus.linkedProfiles).length > 0 && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>Professional Profiles</h4>
                  <div style={styles.linkedProfiles}>
                    {Object.entries(selectedAlumnus.linkedProfiles).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.profileLink}
                      >
                        {platform === 'linkedin' && '💼'}
                        {platform === 'github' && '💻'}
                        {platform === 'twitter' && '🐦'}
                        {platform === 'portfolio' && '🌐'}
                        {platform.charAt(0).toUpperCase() + platform.slice(1)} → {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alumni;