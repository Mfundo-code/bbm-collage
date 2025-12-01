// src/pages/Mentorship.js
import React, { useState, useEffect } from 'react';
import { mentorshipAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Mentorship = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showAddMenteeModal, setShowAddMenteeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAssignMenteeModal, setShowAssignMenteeModal] = useState(false);
  
  // Data states
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableMentees, setAvailableMentees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Form states
  const [mentorForm, setMentorForm] = useState({
    userId: '',
    areaOfExpertise: '',
    bio: '',
    maxMentees: 5,
    communicationChannels: ['email'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['9:00-12:00', '14:00-17:00']
    }
  });
  
  const [assignMenteeForm, setAssignMenteeForm] = useState({
    menteeId: ''
  });

  useEffect(() => {
    fetchMentors();
    fetchMentees();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await mentorshipAPI.getMentors();
      setMentors(response.data.items || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      const response = await mentorshipAPI.getMentees();
      setMentees(response.data.items || []);
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await mentorshipAPI.getAvailableUsers();
      
      if (response.data && response.data.items) {
        setAvailableUsers(response.data.items);
      } else {
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAvailableMentees = async () => {
    try {
      const response = await mentorshipAPI.getMentees({ mentorId: 'null' });
      setAvailableMentees(response.data.items || []);
    } catch (error) {
      console.error('Error fetching available mentees:', error);
    }
  };

  const handleAddMentor = async () => {
    try {
      await mentorshipAPI.createMentor(mentorForm);
      setSuccess('Mentor added successfully!');
      setShowAddMentorModal(false);
      fetchMentors();
      setMentorForm({
        userId: '',
        areaOfExpertise: '',
        bio: '',
        maxMentees: 5,
        communicationChannels: ['email'],
        availability: {
          days: ['Monday', 'Wednesday', 'Friday'],
          timeSlots: ['9:00-12:00', '14:00-17:00']
        }
      });
      setAvailableUsers([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add mentor');
    }
  };

  const handleAssignMentee = async () => {
    try {
      await mentorshipAPI.assignMentee(selectedMentor.id, assignMenteeForm.menteeId);
      setSuccess('Mentee assigned successfully!');
      setShowAssignMenteeModal(false);
      fetchMentors();
      fetchMentees();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign mentee');
    }
  };

  const handleRemoveMentor = async (mentorId) => {
    if (!window.confirm('Are you sure you want to remove this mentor?')) return;
    
    try {
      await mentorshipAPI.deleteMentor(mentorId);
      setSuccess('Mentor removed successfully');
      fetchMentors();
    } catch (error) {
      setError('Failed to remove mentor');
    }
  };

  const handleRemoveMentee = async (mentorId, menteeId) => {
    try {
      await mentorshipAPI.removeMentee(mentorId, menteeId);
      setSuccess('Mentee removed from mentor');
      fetchMentors();
      fetchMentees();
    } catch (error) {
      setError('Failed to remove mentee');
    }
  };

  const openAssignMenteeModal = (mentor) => {
    setSelectedMentor(mentor);
    fetchAvailableMentees();
    setShowAssignMenteeModal(true);
  };

  const openViewModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowViewModal(true);
  };

  const handleOpenAddMentorModal = () => {
    setShowAddMentorModal(true);
    setSearchQuery('');
    fetchAvailableUsers();
  };

  const filteredUsers = availableUsers.filter(user => 
    !searchQuery || 
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isAdmin = user?.role === 'admin' || user?.role === 'secretary';

  // Simplified styles without red and without capacity stats
  const styles = {
    page: { 
      maxWidth: '1200px', 
      margin: '2rem auto', 
      width: '95%', 
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' 
    },
    header: { 
      marginBottom: '1.5rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    headerLeft: { 
      flex: 1 
    },
    title: { 
      fontSize: '1.9rem', 
      color: '#0f172a', 
      margin: 0 
    },
    subtitle: { 
      color: '#64748b', 
      fontSize: '0.95rem', 
      marginTop: '0.25rem' 
    },
    controls: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    primaryBtn: { 
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: '0.6rem 1.1rem', 
      borderRadius: '10px', 
      fontWeight: 600, 
      cursor: 'pointer', 
      fontSize: '0.95rem',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#0284c7'
      }
    },
    secondaryBtn: {
      backgroundColor: '#64748b', 
      color: 'white', 
      border: 'none', 
      padding: '0.6rem 1.1rem', 
      borderRadius: '10px', 
      fontWeight: 600, 
      cursor: 'pointer', 
      fontSize: '0.95rem',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#475569'
      }
    },
    alert: { 
      padding: '0.85rem', 
      borderRadius: '10px', 
      marginBottom: '1rem', 
      border: '1px solid' 
    },
    alertError: { 
      backgroundColor: '#fff1f2', 
      color: '#9f1239', 
      borderColor: '#fecaca' 
    },
    alertSuccess: { 
      backgroundColor: '#ecfdf5', 
      color: '#065f46', 
      borderColor: '#bbf7d0' 
    },
    loading: { 
      textAlign: 'center', 
      padding: '4rem 2rem', 
      color: '#64748b' 
    },
    empty: { 
      textAlign: 'center', 
      padding: '4rem 2rem', 
      color: '#64748b', 
      backgroundColor: 'white', 
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    },

    // Vertical list layout
    grid: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.25rem' 
    },

    mentorCard: { 
      width: '100%', 
      backgroundColor: 'white',
      borderRadius: '8px', 
      padding: '1.25rem', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      cursor: 'default', 
      transition: 'transform 0.2s ease', 
      border: '1px solid #e5e7eb',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }
    },
    mentorHeader: { 
      display: 'flex', 
      alignItems: 'flex-start', 
      gap: '1rem', 
      marginBottom: '0.75rem' 
    },
    mentorPhoto: { 
      width: '80px', 
      height: '80px', 
      borderRadius: '8px', 
      objectFit: 'cover', 
      border: '2px solid #e5e7eb' 
    },
    mentorInfo: { 
      flex: 1 
    },
    mentorName: { 
      fontSize: '1.1rem', 
      fontWeight: 700, 
      color: '#0f172a', 
      margin: '0 0 0.25rem 0' 
    },
    mentorRole: { 
      color: '#64748b', 
      fontSize: '0.9rem', 
      marginBottom: '0.5rem' 
    },
    expertise: { 
      display: 'inline-block', 
      backgroundColor: '#f0f9ff', 
      color: '#0369a1', 
      padding: '0.25rem 0.75rem', 
      borderRadius: '999px', 
      fontSize: '0.85rem', 
      fontWeight: 600, 
      marginBottom: '1rem' 
    },
    mentorBio: { 
      color: '#475569', 
      lineHeight: '1.5', 
      marginBottom: '1rem',
      fontSize: '0.95rem'
    },
    status: { 
      display: 'inline-block', 
      padding: '0.25rem 0.6rem', 
      borderRadius: '999px', 
      fontSize: '0.78rem', 
      fontWeight: 600 
    },
    active: { 
      backgroundColor: '#f0f9ff', 
      color: '#0369a1',
      border: '1px solid #bae6fd'
    },
    inactive: { 
      backgroundColor: '#f8fafc', 
      color: '#64748b',
      border: '1px solid #e5e7eb'
    },
    actions: { 
      display: 'flex', 
      gap: '0.5rem', 
      flexWrap: 'wrap' 
    },
    actionBtn: {
      flex: 1,
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: '0.55rem 0.65rem', 
      borderRadius: '8px', 
      fontWeight: 600, 
      cursor: 'pointer', 
      fontSize: '0.88rem',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#0284c7'
      }
    },
    viewBtn: { 
      backgroundColor: '#4f46e5',
      '&:hover': {
        backgroundColor: '#4338ca'
      }
    },
    assignBtn: { 
      backgroundColor: '#0ea5e9',
    },
    removeBtn: { 
      backgroundColor: '#64748b',
      '&:hover': {
        backgroundColor: '#475569'
      }
    },
    // Modal styles
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
      padding: '1.25rem', 
      overflowY: 'auto' 
    },
    modalContent: { 
      background: 'white', 
      borderRadius: '12px', 
      width: '100%', 
      maxWidth: '720px', 
      maxHeight: '90vh', 
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    modalHeader: { 
      padding: '1.1rem', 
      borderBottom: '1px solid #e5e7eb', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center'
    },
    modalTitle: { 
      fontSize: '1.25rem', 
      color: '#0f172a', 
      margin: 0 
    },
    closeBtn: { 
      background: 'none', 
      border: 'none', 
      fontSize: '1.35rem', 
      cursor: 'pointer', 
      color: '#64748b',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#f3f4f6'
      }
    },
    modalBody: { 
      padding: '1.25rem' 
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1rem' 
    },
    field: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.5rem' 
    },
    label: { 
      fontWeight: 600, 
      color: '#374151', 
      fontSize: '0.9rem' 
    },
    input: { 
      padding: '0.6rem', 
      border: '1px solid #d1d5db', 
      borderRadius: '8px', 
      fontSize: '0.95rem',
      transition: 'border-color 0.2s',
      '&:focus': {
        outline: 'none',
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)'
      }
    },
    textarea: { 
      padding: '0.6rem', 
      border: '1px solid #d1d5db', 
      borderRadius: '8px', 
      fontSize: '0.95rem', 
      fontFamily: 'inherit', 
      resize: 'vertical', 
      minHeight: '100px',
      transition: 'border-color 0.2s',
      '&:focus': {
        outline: 'none',
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)'
      }
    },
    userList: {
      maxHeight: '400px',
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb'
    },
    userItem: {
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#f0f9ff'
      },
      '&:last-child': {
        borderBottom: 'none'
      }
    },
    userItemSelected: {
      backgroundColor: '#dbeafe',
      borderLeft: '4px solid #0ea5e9'
    },
    userItemPhoto: {
      width: '50px',
      height: '50px',
      borderRadius: '8px',
      objectFit: 'cover',
      border: '2px solid #e5e7eb'
    },
    userItemInfo: {
      flex: 1
    },
    userItemName: {
      fontWeight: 600,
      color: '#1e293b',
      margin: 0,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    userItemRole: {
      backgroundColor: '#e0e7ff',
      color: '#4f46e5',
      padding: '0.125rem 0.5rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '1rem'
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    searchInput: {
      padding: '0.6rem 0.6rem 0.6rem 2.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '0.95rem',
      width: '100%',
      transition: 'border-color 0.2s',
      '&:focus': {
        outline: 'none',
        borderColor: '#0ea5e9',
        boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)'
      }
    },
    resultsCount: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.75rem',
      textAlign: 'right'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb',
      marginTop: '1rem'
    },
    cancelBtn: {
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: '0.55rem 1rem',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#4b5563'
      }
    },
    submitBtn: {
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      padding: '0.55rem 1rem',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#0284c7'
      },
      '&:disabled': {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed'
      }
    }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.loading}>Loading mentors...</div></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Mentorship Program</h1>
          <p style={styles.subtitle}>Guidance and discipleship for spiritual growth</p>
        </div>
        {isAdmin && (
          <div style={styles.controls}>
            <button 
              style={styles.primaryBtn} 
              onClick={handleOpenAddMentorModal}
            >
              + Add Mentor
            </button>
            <button 
              style={styles.secondaryBtn}
              onClick={() => setShowAddMenteeModal(true)}
            >
              + Add Mentee
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ ...styles.alert, ...styles.alertError }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#9f1239',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div style={{ ...styles.alert, ...styles.alertSuccess }}>
          {success}
          <button 
            onClick={() => setSuccess('')}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#065f46',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
          >
            ×
          </button>
        </div>
      )}

      {mentors.length === 0 ? (
        <div style={styles.empty}>
          <p>No mentors available yet.</p>
          {isAdmin && (
            <button 
              style={styles.primaryBtn} 
              onClick={handleOpenAddMentorModal}
            >
              Add Your First Mentor
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {mentors.map(mentor => (
            <div 
              key={mentor.id} 
              style={styles.mentorCard}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.mentorHeader}>
                <img
                  src={mentor.user?.profilePhoto || '/default-avatar.png'}
                  alt={mentor.user?.firstName}
                  style={styles.mentorPhoto}
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div style={styles.mentorInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={styles.mentorName}>
                        {mentor.user?.firstName} {mentor.user?.lastName}
                      </h3>
                      <p style={styles.mentorRole}>
                        {mentor.user?.role?.charAt(0).toUpperCase() + mentor.user?.role?.slice(1)}
                      </p>
                    </div>
                    <div style={{ 
                      ...styles.status, 
                      ...(mentor.status === 'active' ? styles.active : styles.inactive) 
                    }}>
                      {mentor.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div style={styles.expertise}>
                    {mentor.areaOfExpertise}
                  </div>
                </div>
              </div>

              <p style={styles.mentorBio}>
                {mentor.bio || 'No bio available.'}
              </p>

              <div style={styles.actions}>
                <button 
                  style={{ ...styles.actionBtn, ...styles.viewBtn }}
                  onClick={() => openViewModal(mentor)}
                >
                  View Details
                </button>
                {isAdmin && (
                  <>
                    <button 
                      style={{ ...styles.actionBtn, ...styles.assignBtn }}
                      onClick={() => openAssignMenteeModal(mentor)}
                    >
                      Assign Mentee
                    </button>
                    <button 
                      style={{ ...styles.actionBtn, ...styles.removeBtn }}
                      onClick={() => handleRemoveMentor(mentor.id)}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Mentor Modal */}
      {showAddMentorModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Mentor</h2>
              <button 
                style={styles.closeBtn}
                onClick={() => {
                  setShowAddMentorModal(false);
                  setSearchQuery('');
                  setMentorForm({
                    userId: '',
                    areaOfExpertise: '',
                    bio: '',
                    maxMentees: 5,
                    communicationChannels: ['email'],
                    availability: {
                      days: ['Monday', 'Wednesday', 'Friday'],
                      timeSlots: ['9:00-12:00', '14:00-17:00']
                    }
                  });
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.searchContainer}>
                <div style={styles.searchIcon}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  style={styles.searchInput}
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={styles.resultsCount}>
                Showing {filteredUsers.length} of {availableUsers.length} available users
              </div>

              <div style={styles.userList}>
                {loadingUsers ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <p>Loading available users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    <p>No users found.</p>
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #d1d5db',
                          color: '#374151',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginTop: '0.5rem'
                        }}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      style={{
                        ...styles.userItem,
                        ...(mentorForm.userId === user.id ? styles.userItemSelected : {})
                      }}
                      onClick={() => setMentorForm({ ...mentorForm, userId: user.id })}
                    >
                      <img
                        src={user.profilePhoto || '/default-avatar.png'}
                        alt={user.firstName || 'User'}
                        style={styles.userItemPhoto}
                        onError={(e) => { e.target.src = '/default-avatar.png'; }}
                      />
                      <div style={styles.userItemInfo}>
                        <h4 style={styles.userItemName}>
                          {user.firstName} {user.lastName}
                          <span style={styles.userItemRole}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                          </span>
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                          {user.email}
                        </p>
                      </div>
                      {mentorForm.userId === user.id && (
                        <div style={{ color: '#10b981' }}>
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {mentorForm.userId && (
                <form style={styles.form}>
                  <div style={styles.field}>
                    <label style={styles.label}>Area of Expertise *</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={mentorForm.areaOfExpertise}
                      onChange={(e) => setMentorForm({ ...mentorForm, areaOfExpertise: e.target.value })}
                      placeholder="e.g., Pastoral Ministry, Theology, Counseling"
                      required
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Bio</label>
                    <textarea
                      style={styles.textarea}
                      value={mentorForm.bio}
                      onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                      placeholder="Tell us about your experience and background..."
                    />
                  </div>
                </form>
              )}

              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => {
                    setShowAddMentorModal(false);
                    setSearchQuery('');
                    setMentorForm({
                      userId: '',
                      areaOfExpertise: '',
                      bio: '',
                      maxMentees: 5,
                      communicationChannels: ['email'],
                      availability: {
                        days: ['Monday', 'Wednesday', 'Friday'],
                        timeSlots: ['9:00-12:00', '14:00-17:00']
                      }
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  style={styles.submitBtn}
                  onClick={handleAddMentor}
                  disabled={!mentorForm.userId || !mentorForm.areaOfExpertise}
                >
                  Add as Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Mentee Modal */}
      {showAssignMenteeModal && selectedMentor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Assign Mentee to {selectedMentor.user?.firstName} {selectedMentor.user?.lastName}
              </h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowAssignMenteeModal(false)}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              {availableMentees.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                  No available mentees. Add a mentee first.
                </p>
              ) : (
                <div style={styles.userList}>
                  {availableMentees.map(mentee => (
                    <div
                      key={mentee.id}
                      style={{
                        ...styles.userItem,
                        ...(assignMenteeForm.menteeId === mentee.id ? styles.userItemSelected : {})
                      }}
                      onClick={() => setAssignMenteeForm({ menteeId: mentee.id })}
                    >
                      <img
                        src={mentee.user?.profilePhoto || '/default-avatar.png'}
                        alt={mentee.user?.firstName}
                        style={styles.userItemPhoto}
                      />
                      <div style={styles.userItemInfo}>
                        <h4 style={styles.userItemName}>
                          {mentee.user?.firstName} {mentee.user?.lastName}
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {mentee.learningGoals?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowAssignMenteeModal(false)}
                >
                  Cancel
                </button>
                <button 
                  style={styles.submitBtn}
                  onClick={handleAssignMentee}
                  disabled={!assignMenteeForm.menteeId}
                >
                  Assign Mentee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mentor Details Modal */}
      {showViewModal && selectedMentor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {selectedMentor.user?.firstName} {selectedMentor.user?.lastName}
              </h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <img
                  src={selectedMentor.user?.profilePhoto || '/default-avatar.png'}
                  alt={selectedMentor.user?.firstName}
                  style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'cover', border: '3px solid #e5e7eb' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
                    {selectedMentor.areaOfExpertise}
                  </div>
                  <div style={{ color: '#64748b', marginTop: 6 }}>
                    {selectedMentor.user?.role} • {selectedMentor.status}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ 
                      ...styles.status, 
                      ...(selectedMentor.status === 'active' ? styles.active : styles.inactive) 
                    }}>
                      {selectedMentor.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Bio</h4>
                <p style={{ color: '#475569', lineHeight: 1.6, padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  {selectedMentor.bio || 'No bio available.'}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Current Mentees ({selectedMentor.mentees?.length || 0})</h4>
                {selectedMentor.mentees?.length === 0 ? (
                  <p style={{ padding: '1rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    No mentees assigned yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedMentor.mentees?.map(mentee => (
                      <div key={mentee.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <img
                          src={mentee.user?.profilePhoto || '/default-avatar.png'}
                          alt={mentee.user?.firstName}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {mentee.user?.firstName} {mentee.user?.lastName}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            {mentee.learningGoals?.substring(0, 60)}...
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleRemoveMentee(selectedMentor.id, mentee.id)}
                            style={{
                              backgroundColor: '#64748b',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: '#475569'
                              }
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Mentee Modal */}
      {showAddMenteeModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Mentee</h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowAddMenteeModal(false)}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                To add a mentee, first create a user through the Users section or ask the user to register.
                Then you can assign them as a mentee here.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowAddMenteeModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;

