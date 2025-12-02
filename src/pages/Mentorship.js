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
  const [isMobile, setIsMobile] = useState(false);
  
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
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    fetchMentors();
    fetchMentees();
    
    return () => window.removeEventListener('resize', checkIfMobile);
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

  // Responsive styles
  const styles = {
    page: { 
      maxWidth: '1200px', 
      margin: isMobile ? '1rem auto' : '2rem auto', 
      width: isMobile ? '92%' : '95%', 
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' 
    },
    header: { 
      marginBottom: isMobile ? '1rem' : '1.5rem', 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '1rem' : '0'
    },
    headerLeft: { 
      flex: 1 
    },
    title: { 
      fontSize: isMobile ? '1.5rem' : '1.9rem', 
      color: '#0f172a', 
      margin: 0 
    },
    subtitle: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.85rem' : '0.95rem', 
      marginTop: '0.25rem' 
    },
    controls: {
      display: 'flex',
      gap: isMobile ? '0.5rem' : '0.75rem',
      flexWrap: 'wrap',
      width: isMobile ? '100%' : 'auto'
    },
    primaryBtn: { 
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.85rem' : '0.6rem 1.1rem', 
      borderRadius: '10px', 
      fontWeight: 600, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      transition: 'background-color 0.2s',
      flex: isMobile ? 1 : 'none'
    },
    secondaryBtn: {
      backgroundColor: '#64748b', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.85rem' : '0.6rem 1.1rem', 
      borderRadius: '10px', 
      fontWeight: 600, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      transition: 'background-color 0.2s',
      flex: isMobile ? 1 : 'none'
    },
    alert: { 
      padding: isMobile ? '0.75rem' : '0.85rem', 
      borderRadius: '10px', 
      marginBottom: isMobile ? '0.75rem' : '1rem', 
      border: '1px solid',
      fontSize: isMobile ? '0.85rem' : '1rem'
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
      padding: isMobile ? '3rem 1rem' : '4rem 2rem', 
      color: '#64748b',
      fontSize: isMobile ? '0.95rem' : '1rem'
    },
    empty: { 
      textAlign: 'center', 
      padding: isMobile ? '3rem 1rem' : '4rem 2rem', 
      color: '#64748b', 
      backgroundColor: 'white', 
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      fontSize: isMobile ? '0.95rem' : '1rem'
    },

    // Vertical list layout
    grid: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '1rem' : '1.25rem' 
    },

    mentorCard: { 
      width: '100%', 
      backgroundColor: 'white',
      borderRadius: '8px', 
      padding: isMobile ? '1rem' : '1.25rem', 
      boxShadow: isMobile ? '0 1px 4px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.1)', 
      cursor: 'default', 
      transition: 'transform 0.2s ease', 
      border: '1px solid #e5e7eb'
    },
    mentorHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'flex-start', 
      gap: isMobile ? '0.75rem' : '1rem', 
      marginBottom: isMobile ? '0.5rem' : '0.75rem' 
    },
    mentorPhoto: { 
      width: isMobile ? '64px' : '80px', 
      height: isMobile ? '64px' : '80px', 
      borderRadius: '8px', 
      objectFit: 'cover', 
      border: '2px solid #e5e7eb' 
    },
    mentorInfo: { 
      flex: 1,
      width: isMobile ? '100%' : 'auto'
    },
    mentorName: { 
      fontSize: isMobile ? '1rem' : '1.1rem', 
      fontWeight: 700, 
      color: '#0f172a', 
      margin: '0 0 0.25rem 0' 
    },
    mentorRole: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.8rem' : '0.9rem', 
      marginBottom: '0.5rem' 
    },
    expertise: { 
      display: 'inline-block', 
      backgroundColor: '#f0f9ff', 
      color: '#0369a1', 
      padding: isMobile ? '0.2rem 0.6rem' : '0.25rem 0.75rem', 
      borderRadius: '999px', 
      fontSize: isMobile ? '0.75rem' : '0.85rem', 
      fontWeight: 600, 
      marginBottom: isMobile ? '0.75rem' : '1rem' 
    },
    mentorBio: { 
      color: '#475569', 
      lineHeight: '1.5', 
      marginBottom: '1rem',
      fontSize: isMobile ? '0.9rem' : '0.95rem'
    },
    statusRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.5rem',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0'
    },
    status: { 
      display: 'inline-block', 
      padding: isMobile ? '0.2rem 0.5rem' : '0.25rem 0.6rem', 
      borderRadius: '999px', 
      fontSize: isMobile ? '0.7rem' : '0.78rem', 
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
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0.5rem', 
      flexWrap: 'wrap' 
    },
    actionBtn: {
      flex: isMobile ? 'none' : 1,
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '8px', 
      fontWeight: 600, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      transition: 'background-color 0.2s',
      width: isMobile ? '100%' : 'auto'
    },
    viewBtn: { 
      backgroundColor: '#4f46e5'
    },
    assignBtn: { 
      backgroundColor: '#0ea5e9'
    },
    removeBtn: { 
      backgroundColor: '#64748b'
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
      padding: isMobile ? '0.5rem' : '1.25rem', 
      overflowY: 'auto' 
    },
    modalContent: { 
      background: 'white', 
      borderRadius: '12px', 
      width: '100%', 
      maxWidth: isMobile ? '95%' : '720px', 
      maxHeight: isMobile ? '95vh' : '90vh', 
      overflowY: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    },
    modalHeader: { 
      padding: isMobile ? '1rem' : '1.1rem', 
      borderBottom: '1px solid #e5e7eb', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center'
    },
    modalTitle: { 
      fontSize: isMobile ? '1.1rem' : '1.25rem', 
      color: '#0f172a', 
      margin: 0 
    },
    closeBtn: { 
      background: 'none', 
      border: 'none', 
      fontSize: isMobile ? '1.25rem' : '1.35rem', 
      cursor: 'pointer', 
      color: '#64748b',
      width: isMobile ? '32px' : '36px',
      height: isMobile ? '32px' : '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s'
    },
    modalBody: { 
      padding: isMobile ? '1rem' : '1.25rem' 
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '0.75rem' : '1rem' 
    },
    field: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.5rem' 
    },
    label: { 
      fontWeight: 600, 
      color: '#374151', 
      fontSize: isMobile ? '0.85rem' : '0.9rem' 
    },
    input: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #d1d5db', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      transition: 'border-color 0.2s'
    },
    textarea: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #d1d5db', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem', 
      fontFamily: 'inherit', 
      resize: 'vertical', 
      minHeight: '100px',
      transition: 'border-color 0.2s'
    },
    userList: {
      maxHeight: '400px',
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb'
    },
    userItem: {
      padding: isMobile ? '0.75rem' : '1rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.75rem' : '1rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    userItemSelected: {
      backgroundColor: '#dbeafe',
      borderLeft: isMobile ? '3px solid #0ea5e9' : '4px solid #0ea5e9'
    },
    userItemPhoto: {
      width: isMobile ? '40px' : '50px',
      height: isMobile ? '40px' : '50px',
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
      fontSize: isMobile ? '0.9rem' : '1rem',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.25rem' : '0.5rem'
    },
    userItemRole: {
      backgroundColor: '#e0e7ff',
      color: '#4f46e5',
      padding: '0.125rem 0.5rem',
      borderRadius: '999px',
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      fontWeight: 600,
      alignSelf: 'flex-start'
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
      padding: isMobile ? '0.5rem 0.5rem 0.5rem 2.25rem' : '0.6rem 0.6rem 0.6rem 2.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      width: '100%',
      transition: 'border-color 0.2s'
    },
    resultsCount: {
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      color: '#6b7280',
      marginBottom: '0.75rem',
      textAlign: 'right'
    },
    modalActions: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'flex-end',
      gap: isMobile ? '0.5rem' : '0.75rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e5e7eb',
      marginTop: '1rem'
    },
    cancelBtn: {
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      padding: isMobile ? '0.5rem 0.75rem' : '0.55rem 1rem',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      width: isMobile ? '100%' : 'auto'
    },
    submitBtn: {
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      padding: isMobile ? '0.5rem 0.75rem' : '0.55rem 1rem',
      borderRadius: '8px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      width: isMobile ? '100%' : 'auto'
    },
    viewModalContent: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '1rem' : '1rem',
      alignItems: isMobile ? 'flex-start' : 'center',
      marginBottom: '1.5rem'
    },
    viewModalImage: {
      width: isMobile ? '100%' : '100px',
      height: isMobile ? '120px' : '100px',
      borderRadius: '12px',
      objectFit: 'cover',
      border: '3px solid #e5e7eb'
    },
    menteeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: isMobile ? '0.6rem' : '0.75rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '0.5rem',
      flexDirection: isMobile ? 'column' : 'row'
    },
    menteeImage: {
      width: isMobile ? '48px' : '40px',
      height: isMobile ? '48px' : '40px',
      borderRadius: '8px',
      border: '2px solid #e5e7eb'
    },
    menteeInfo: {
      flex: 1,
      width: isMobile ? '100%' : 'auto',
      textAlign: isMobile ? 'center' : 'left'
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
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0284c7'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0ea5e9'}
            >
              + Add Mentor
            </button>
            <button 
              style={styles.secondaryBtn}
              onClick={() => setShowAddMenteeModal(true)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#64748b'}
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
              style={{...styles.primaryBtn, marginTop: '1rem'}} 
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
              onMouseEnter={e => !isMobile && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => !isMobile && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={styles.mentorHeader}>
                <img
                  src={mentor.user?.profilePhoto || '/default-avatar.png'}
                  alt={mentor.user?.firstName}
                  style={styles.mentorPhoto}
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div style={styles.mentorInfo}>
                  <div style={styles.statusRow}>
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
                >
                  View Details
                </button>
                {isAdmin && (
                  <>
                    <button 
                      style={{ ...styles.actionBtn, ...styles.assignBtn }}
                      onClick={() => openAssignMenteeModal(mentor)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0284c7'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#0ea5e9'}
                    >
                      Assign Mentee
                    </button>
                    <button 
                      style={{ ...styles.actionBtn, ...styles.removeBtn }}
                      onClick={() => handleRemoveMentor(mentor.id)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#64748b'}
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
        <div style={styles.modalOverlay} onClick={() => {
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
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                  onFocus={(e) => e.target.style.outline = 'none'}
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
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = mentorForm.userId === user.id ? '#dbeafe' : 'transparent'}
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
                        <p style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.85rem', margin: '0.25rem 0 0 0' }}>
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
                      onFocus={(e) => e.target.style.outline = 'none'}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Bio</label>
                    <textarea
                      style={styles.textarea}
                      value={mentorForm.bio}
                      onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                      placeholder="Tell us about your experience and background..."
                      onFocus={(e) => e.target.style.outline = 'none'}
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  Cancel
                </button>
                <button 
                  style={styles.submitBtn}
                  onClick={handleAddMentor}
                  disabled={!mentorForm.userId || !mentorForm.areaOfExpertise}
                  onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0284c7')}
                  onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0ea5e9')}
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
        <div style={styles.modalOverlay} onClick={() => setShowAssignMenteeModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Assign Mentee to {selectedMentor.user?.firstName} {selectedMentor.user?.lastName}
              </h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowAssignMenteeModal(false)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = assignMenteeForm.menteeId === mentee.id ? '#dbeafe' : 'transparent'}
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
                        <p style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  Cancel
                </button>
                <button 
                  style={styles.submitBtn}
                  onClick={handleAssignMentee}
                  disabled={!assignMenteeForm.menteeId}
                  onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0284c7')}
                  onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0ea5e9')}
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
        <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {selectedMentor.user?.firstName} {selectedMentor.user?.lastName}
              </h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowViewModal(false)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.viewModalContent}>
                <img
                  src={selectedMentor.user?.profilePhoto || '/default-avatar.png'}
                  alt={selectedMentor.user?.firstName}
                  style={styles.viewModalImage}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 18, color: '#0f172a' }}>
                    {selectedMentor.areaOfExpertise}
                  </div>
                  <div style={{ color: '#64748b', marginTop: 6, fontSize: isMobile ? '0.85rem' : '1rem' }}>
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
                <h4 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: isMobile ? '0.95rem' : '1rem' }}>Bio</h4>
                <p style={{ color: '#475569', lineHeight: 1.6, padding: isMobile ? '0.75rem' : '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {selectedMentor.bio || 'No bio available.'}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#374151', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                  Current Mentees ({selectedMentor.mentees?.length || 0})
                </h4>
                {selectedMentor.mentees?.length === 0 ? (
                  <p style={{ padding: '1rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    No mentees assigned yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedMentor.mentees?.map(mentee => (
                      <div key={mentee.id} style={styles.menteeItem}>
                        <img
                          src={mentee.user?.profilePhoto || '/default-avatar.png'}
                          alt={mentee.user?.firstName}
                          style={styles.menteeImage}
                        />
                        <div style={styles.menteeInfo}>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                            {mentee.user?.firstName} {mentee.user?.lastName}
                          </div>
                          <div style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#64748b' }}>
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
                              padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: isMobile ? '0.8rem' : '0.85rem',
                              fontWeight: 600,
                              transition: 'background-color 0.2s',
                              width: isMobile ? '100%' : 'auto'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#64748b'}
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
        <div style={styles.modalOverlay} onClick={() => setShowAddMenteeModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Mentee</h2>
              <button 
                style={styles.closeBtn}
                onClick={() => setShowAddMenteeModal(false)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                To add a mentee, first create a user through the Users section or ask the user to register.
                Then you can assign them as a mentee here.
              </p>
              <div style={styles.modalActions}>
                <button 
                  style={styles.cancelBtn}
                  onClick={() => setShowAddMenteeModal(false)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
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