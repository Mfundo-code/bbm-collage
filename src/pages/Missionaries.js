import React, { useState, useEffect } from 'react';
import { missionariesAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

const Missionaries = () => {
  const { user } = useAuth();
  const [missionaries, setMissionaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMissionary, setSelectedMissionary] = useState(null);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [prayerFormData, setFormData] = useState({
    text: '',
    urgency: 'medium',
    images: []
  });

  const [createFormData, setCreateFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    contactPhone: '',
    profilePhoto: '',
    bio: '',
    ministryDescription: '',
    organization: '',
    originalCountry: '',
    missionCountry: '',
    contactPreference: 'email'
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    contactPhone: '',
    profilePhoto: '',
    bio: '',
    ministryDescription: '',
    organization: '',
    originalCountry: '',
    missionCountry: '',
    contactPreference: '',
    activeStatus: 'active'
  });

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    fetchMissionaries();
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchMissionaries = async () => {
    try {
      const response = await missionariesAPI.getMissionaries();
      setMissionaries(response.data.items || []);
    } catch (error) {
      console.error('Error fetching missionaries:', error);
      setError('Failed to load missionaries');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrayerRequests = async (missionaryId) => {
    try {
      const response = await missionariesAPI.getPrayerRequests(missionaryId);
      setPrayerRequests(response.data.items || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    }
  };

  const handleFileUpload = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const url = await fileUpload.uploadFile(file);

      if (formType === 'create') {
        setCreateFormData(prev => ({ ...prev, profilePhoto: url }));
      } else {
        setEditFormData(prev => ({ ...prev, profilePhoto: url }));
      }

      setSuccess('Photo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await missionariesAPI.createMissionary(createFormData);

      const creds = response.data?.credentials;
      if (creds) {
        setCredentials({ email: creds.email, password: creds.temporaryPassword });
      }

      setSuccess('Missionary created! Credentials are shown so you can copy them.');
      setShowCreateForm(false);
      fetchMissionaries();
      setCreateFormData({
        email: '', firstName: '', lastName: '', contactPhone: '', profilePhoto: '',
        bio: '', ministryDescription: '', organization: '', originalCountry: '',
        missionCountry: '', contactPreference: 'email'
      });

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create missionary');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMissionary) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await missionariesAPI.updateMissionary(selectedMissionary.user.id, editFormData);
      setSuccess('Profile updated successfully!');
      setShowEditForm(false);
      fetchMissionaries();
      setSelectedMissionary(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditForm = (missionary) => {
    setEditFormData({
      firstName: missionary.user.firstName || '',
      lastName: missionary.user.lastName || '',
      contactPhone: missionary.user.contactPhone || '',
      profilePhoto: missionary.photo || '',
      bio: missionary.bio || '',
      ministryDescription: missionary.ministryDescription || '',
      organization: missionary.sendingOrganization || '',
      originalCountry: missionary.originalCountry || '',
      missionCountry: missionary.locationCountry || '',
      contactPreference: missionary.contactPreference || 'email',
      activeStatus: missionary.activeStatus || 'active'
    });
    setSelectedMissionary(missionary);
    setShowEditForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this missionary?')) return;

    try {
      await missionariesAPI.deleteMissionary(userId);
      setSuccess('Missionary deleted successfully');
      fetchMissionaries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete missionary');
    }
  };

  const handleFollow = async (missionaryId) => {
    try {
      await missionariesAPI.followMissionary(missionaryId);
      fetchMissionaries();
    } catch (error) {
      console.error('Error following missionary:', error);
    }
  };

  const handleUnfollow = async (missionaryId) => {
    try {
      await missionariesAPI.unfollowMissionary(missionaryId);
      fetchMissionaries();
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
      setFormData({ text: '', urgency: 'medium', images: [] });
      setShowPrayerForm(false);
      fetchPrayerRequests(selectedMissionary.user.id);
    } catch (error) {
      console.error('Error creating prayer request:', error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'secretary';
  const canEdit = (missionary) => isAdmin || user?.id === missionary.user.id;

  const copyCredentials = async () => {
    if (!credentials) return;
    const payload = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const ta = document.createElement('textarea');
        ta.value = payload;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied('both');
      setTimeout(() => setCopied(''), 2500);
    } catch (err) {
      console.error('Copy failed', err);
      setError('Unable to copy credentials to clipboard');
    }
  };

  const openView = (missionary) => {
    setSelectedMissionary(missionary);
    fetchPrayerRequests(missionary.user.id);
    setShowViewModal(true);
  };

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
    headerLeft: { flex: 1 },
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
    createBtn: { 
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.85rem' : '0.6rem 1.1rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.85rem' : '0.95rem', 
      boxShadow: '0 6px 18px rgba(14,165,233,0.12)',
      alignSelf: isMobile ? 'flex-start' : 'auto'
    },
    alert: { 
      padding: isMobile ? '0.75rem' : '0.85rem', 
      borderRadius: '10px', 
      marginBottom: isMobile ? '0.75rem' : '1rem', 
      border: '1px solid',
      fontSize: isMobile ? '0.85rem' : '1rem'
    },
    alertError: { backgroundColor: '#fff1f2', color: '#9f1239', borderColor: '#fecaca' },
    alertSuccess: { backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#bbf7d0' },
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
      fontSize: isMobile ? '0.95rem' : '1rem'
    },
    grid: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '1rem' : '1.25rem' 
    },
    missionaryCard: { 
      width: '100%', 
      background: 'linear-gradient(180deg, #fff, #fbfbff)', 
      borderRadius: '8px', 
      padding: isMobile ? '1rem' : '1.25rem', 
      boxShadow: '0 6px 18px rgba(15,23,42,0.05)', 
      cursor: 'default', 
      transition: 'transform 0.18s ease, box-shadow 0.18s ease', 
      border: '1px solid rgba(15,23,42,0.03)' 
    },
    missionaryHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center', 
      gap: isMobile ? '0.75rem' : '1rem', 
      marginBottom: isMobile ? '0.5rem' : '0.75rem' 
    },
    missionaryPhoto: { 
      width: isMobile ? '72px' : '96px', 
      height: isMobile ? '72px' : '96px', 
      borderRadius: '10px', 
      objectFit: 'cover', 
      border: '2px solid #eef2ff' 
    },
    missionaryInfo: { 
      flex: 1,
      width: isMobile ? '100%' : 'auto'
    },
    missionaryName: { 
      fontSize: isMobile ? '1rem' : '1.1rem', 
      fontWeight: 800, 
      color: '#0f172a', 
      margin: '0 0 0.25rem 0' 
    },
    missionaryLocation: { 
      color: '#475569', 
      fontSize: isMobile ? '0.85rem' : '0.95rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.4rem', 
      marginBottom: '0.4rem' 
    },
    missionaryOrg: { 
      color: '#06b6d4', 
      fontSize: isMobile ? '0.85rem' : '0.9rem', 
      fontWeight: 700 
    },
    statusRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      width: isMobile ? '100%' : 'auto',
      marginTop: isMobile ? '0.5rem' : '0'
    },
    status: { 
      display: 'inline-block', 
      padding: isMobile ? '0.2rem 0.5rem' : '0.25rem 0.6rem', 
      borderRadius: '999px', 
      fontSize: isMobile ? '0.7rem' : '0.78rem', 
      fontWeight: 700, 
      marginBottom: isMobile ? '0.5rem' : '0.6rem' 
    },
    active: { backgroundColor: '#ecfdf5', color: '#065f46' },
    inactive: { backgroundColor: '#fff7ed', color: '#92400e' },
    missionaryBio: { 
      color: '#334155', 
      lineHeight: '1.45', 
      marginBottom: '1rem',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    actions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0.5rem', 
      flexWrap: 'wrap', 
      marginTop: '0.5rem' 
    },
    followBtn: { 
      flex: isMobile ? 'none' : 1, 
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      width: isMobile ? '100%' : 'auto'
    },
    viewBtn: { 
      flex: isMobile ? 'none' : 1,
      backgroundColor: '#7c3aed', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      width: isMobile ? '100%' : 'auto'
    },
    editBtn: { 
      flex: isMobile ? 'none' : 1,
      backgroundColor: '#f59e0b', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      width: isMobile ? '100%' : 'auto'
    },
    deleteBtn: { 
      flex: isMobile ? 'none' : 1,
      backgroundColor: '#ef4444', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      width: isMobile ? '100%' : 'auto'
    },
    modalOverlay: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(2,6,23,0.45)', 
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
      overflowY: 'auto' 
    },
    modalHeader: { 
      padding: isMobile ? '1rem' : '1.1rem', 
      borderBottom: '1px solid #eef2ff', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'sticky', 
      top: 0, 
      backgroundColor: 'white', 
      zIndex: 1 
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
      color: '#475569' 
    },
    modalBody: { 
      padding: isMobile ? '1rem' : '1.25rem' 
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '0.75rem' : '1rem' 
    },
    formRow: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
      gap: isMobile ? '0.75rem' : '0.75rem' 
    },
    field: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.5rem' 
    },
    label: { 
      fontWeight: 700, 
      color: '#0f172a', 
      fontSize: isMobile ? '0.85rem' : '0.9rem' 
    },
    input: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem' 
    },
    textarea: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem', 
      fontFamily: 'inherit', 
      resize: 'vertical', 
      minHeight: '100px' 
    },
    select: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem' 
    },
    fileLabel: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px dashed #7dd3fc', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      textAlign: 'center', 
      color: '#0369a1', 
      fontWeight: 700, 
      transition: 'all 0.2s',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    fileInput: { display: 'none' },
    preview: { 
      width: isMobile ? '100px' : '120px', 
      height: isMobile ? '100px' : '120px', 
      borderRadius: '12px', 
      objectFit: 'cover', 
      margin: '0.75rem auto', 
      display: 'block', 
      border: '2px solid #eef2ff' 
    },
    formActions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0.65rem', 
      justifyContent: 'flex-end', 
      paddingTop: '0.75rem', 
      borderTop: '1px solid #eef2ff' 
    },
    cancelBtn: { 
      backgroundColor: '#64748b', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.75rem' : '0.55rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto'
    },
    submitBtn: { 
      backgroundColor: '#06b6d4', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.75rem' : '0.55rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto'
    },
    credBox: { 
      padding: isMobile ? '0.75rem' : '1rem', 
      borderRadius: '8px', 
      background: '#f8fafc', 
      border: '1px dashed #e6eef7', 
      display: 'flex', 
      gap: isMobile ? '0.5rem' : '0.75rem', 
      alignItems: 'center' 
    },
    smallBtn: { 
      padding: isMobile ? '0.4rem 0.5rem' : '0.45rem 0.6rem', 
      borderRadius: '8px', 
      border: 'none', 
      fontWeight: 700, 
      cursor: 'pointer',
      fontSize: isMobile ? '0.8rem' : '0.85rem'
    },
    viewModalContent: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '1rem' : '1rem',
      alignItems: isMobile ? 'flex-start' : 'center'
    },
    viewModalImage: {
      width: isMobile ? '100%' : '110px',
      height: isMobile ? '140px' : '110px',
      borderRadius: '12px',
      objectFit: 'cover'
    }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.loading}>Loading missionaries...</div></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Missionaries</h1>
          <p style={styles.subtitle}>Supporting our missionaries around the world</p>
        </div>
        {isAdmin && (
          <button 
            style={styles.createBtn} 
            onClick={() => setShowCreateForm(true)}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.2)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 6px 18px rgba(14,165,233,0.12)'; }}
          >
            + Create Missionary
          </button>
        )}
      </div>

      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{success}</div>}

      {missionaries.length === 0 ? (
        <div style={styles.empty}>
          <p>No missionaries registered yet.</p>
          {isAdmin && (
            <button 
              style={{...styles.createBtn, marginTop: '1rem'}} 
              onClick={() => setShowCreateForm(true)}
            >
              + Create First Missionary
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {missionaries.map(missionary => (
            <div
              key={missionary.user.id}
              style={styles.missionaryCard}
              onMouseEnter={e => !isMobile && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => !isMobile && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={styles.missionaryHeader}>
                <img
                  src={missionary.photo || '/default-avatar.png'}
                  alt={missionary.user.firstName}
                  style={styles.missionaryPhoto}
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div style={styles.missionaryInfo}>
                  <h3 style={styles.missionaryName}>
                    {missionary.user.firstName} {missionary.user.lastName}
                  </h3>
                  <div style={styles.missionaryLocation}>📍 {missionary.locationCountry || 'Unknown'}</div>
                  {missionary.sendingOrganization && (
                    <div style={styles.missionaryOrg}>{missionary.sendingOrganization}</div>
                  )}
                  <div style={styles.statusRow}>
                    <div style={{ ...styles.status, ...(missionary.activeStatus === 'active' ? styles.active : styles.inactive) }}>
                      {missionary.activeStatus === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>

              <p style={styles.missionaryBio}>{missionary.bio || 'No bio available.'}</p>

              <div style={styles.actions}>
                <button 
                  style={styles.followBtn} 
                  onClick={() => handleFollow(missionary.user.id)}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Follow
                </button>
                <button 
                  style={styles.viewBtn} 
                  onClick={() => openView(missionary)}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  View
                </button>
                {canEdit(missionary) && (
                  <button 
                    style={styles.editBtn} 
                    onClick={() => openEditForm(missionary)}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Edit
                  </button>
                )}
                {isAdmin && (
                  <button 
                    style={styles.deleteBtn} 
                    onClick={() => handleDelete(missionary.user.id)}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Missionary</h2>
              <button style={styles.closeBtn} onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleCreateSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>First Name *</label>
                    <input
                      type="text"
                      value={createFormData.firstName}
                      onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Last Name *</label>
                    <input
                      type="text"
                      value={createFormData.lastName}
                      onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    value={createFormData.contactPhone}
                    onChange={(e) => setCreateFormData({ ...createFormData, contactPhone: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Profile Photo</label>
                  <label style={styles.fileLabel}>
                    {uploading ? 'Uploading...' : '📷 Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'create')}
                      style={styles.fileInput}
                      disabled={uploading}
                    />
                  </label>
                  {createFormData.profilePhoto && (
                    <img src={createFormData.profilePhoto} alt="Preview" style={styles.preview} />
                  )}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Original Country</label>
                    <input
                      type="text"
                      value={createFormData.originalCountry}
                      onChange={(e) => setCreateFormData({ ...createFormData, originalCountry: e.target.value })}
                      style={styles.input}
                      placeholder="e.g., USA"
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Mission Country</label>
                    <input
                      type="text"
                      value={createFormData.missionCountry}
                      onChange={(e) => setCreateFormData({ ...createFormData, missionCountry: e.target.value })}
                      style={styles.input}
                      placeholder="e.g., Kenya"
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Organization</label>
                  <input
                    type="text"
                    value={createFormData.organization}
                    onChange={(e) => setCreateFormData({ ...createFormData, organization: e.target.value })}
                    style={styles.input}
                    placeholder="Sending organization"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Bio</label>
                  <textarea
                    value={createFormData.bio}
                    onChange={(e) => setCreateFormData({ ...createFormData, bio: e.target.value })}
                    style={styles.textarea}
                    placeholder="Brief biography..."
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Ministry Description</label>
                  <textarea
                    value={createFormData.ministryDescription}
                    onChange={(e) => setCreateFormData({ ...createFormData, ministryDescription: e.target.value })}
                    style={styles.textarea}
                    placeholder="Describe the ministry work..."
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Contact Preference</label>
                  <select
                    value={createFormData.contactPreference}
                    onChange={(e) => setCreateFormData({ ...createFormData, contactPreference: e.target.value })}
                    style={styles.select}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Missionary'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && selectedMissionary && (
        <div style={styles.modalOverlay} onClick={() => setShowEditForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Missionary Profile</h2>
              <button style={styles.closeBtn} onClick={() => setShowEditForm(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleEditSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>First Name</label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Last Name</label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    value={editFormData.contactPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Profile Photo</label>
                  <label style={styles.fileLabel}>
                    {uploading ? 'Uploading...' : '📷 Upload New Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'edit')}
                      style={styles.fileInput}
                      disabled={uploading}
                    />
                  </label>
                  {editFormData.profilePhoto && (
                    <img src={editFormData.profilePhoto} alt="Preview" style={styles.preview} />
                  )}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Original Country</label>
                    <input
                      type="text"
                      value={editFormData.originalCountry}
                      onChange={(e) => setEditFormData({ ...editFormData, originalCountry: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Mission Country</label>
                    <input
                      type="text"
                      value={editFormData.missionCountry}
                      onChange={(e) => setEditFormData({ ...editFormData, missionCountry: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Organization</label>
                  <input
                    type="text"
                    value={editFormData.organization}
                    onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Bio</label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Ministry Description</label>
                  <textarea
                    value={editFormData.ministryDescription}
                    onChange={(e) => setEditFormData({ ...editFormData, ministryDescription: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Contact Preference</label>
                  <select
                    value={editFormData.contactPreference}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPreference: e.target.value })}
                    style={styles.select}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                {isAdmin && (
                  <div style={styles.field}>
                    <label style={styles.label}>Status</label>
                    <select
                      value={editFormData.activeStatus}
                      onChange={(e) => setEditFormData({ ...editFormData, activeStatus: e.target.value })}
                      style={styles.select}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div style={styles.formActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowEditForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal (profile + prayer requests) */}
      {showViewModal && selectedMissionary && (
        <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedMissionary.user.firstName} {selectedMissionary.user.lastName}</h2>
              <button style={styles.closeBtn} onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.viewModalContent}>
                <img src={selectedMissionary.photo || '/default-avatar.png'} alt="pic" style={styles.viewModalImage} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18 }}>{selectedMissionary.sendingOrganization || ''}</div>
                  <div style={{ color: '#475569', marginTop: 6, fontSize: isMobile ? '0.9rem' : '1rem' }}>📍 {selectedMissionary.locationCountry || 'Unknown'}</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ ...styles.status, ...(selectedMissionary.activeStatus === 'active' ? styles.active : styles.inactive) }}>{selectedMissionary.activeStatus === 'active' ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? 15 : 16 }}>Bio</h3>
                <p style={{ color: '#334155', lineHeight: 1.5, fontSize: isMobile ? '0.9rem' : '1rem' }}>{selectedMissionary.bio || 'No bio available.'}</p>
              </div>

              <div style={{ marginTop: 8 }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? 15 : 16 }}>Ministry</h3>
                <p style={{ color: '#334155', lineHeight: 1.5, fontSize: isMobile ? '0.9rem' : '1rem' }}>{selectedMissionary.ministryDescription || 'No ministry description.'}</p>
              </div>

              <div style={{ marginTop: 12 }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? 15 : 16 }}>Prayer Requests</h3>
                {prayerRequests.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: isMobile ? '0.9rem' : '1rem' }}>No prayer requests yet.</p>
                ) : (
                  prayerRequests.map(r => (
                    <div key={r.id} style={{ padding: isMobile ? '0.75rem' : 12, borderRadius: 8, background: '#f8fafc', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1rem' }}>{r.text}</div>
                      <div style={{ color: '#475569', marginTop: 6, fontSize: isMobile ? '0.85rem' : '0.9rem' }}>{r.urgency}</div>
                      <div style={{ marginTop: 8 }}>
                        <button 
                          style={{ ...styles.smallBtn, background: '#06b6d4', color: 'white' }} 
                          onClick={() => handlePray(r.id)}
                        >
                          I prayed
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <button 
                  style={{ ...styles.smallBtn, background: '#06b6d4', color: 'white', width: isMobile ? '100%' : 'auto' }} 
                  onClick={() => setShowPrayerForm(s => !s)}
                >
                  {showPrayerForm ? 'Close Prayer Form' : 'Add Prayer Request'}
                </button>

                {showPrayerForm && (
                  <form onSubmit={handleSubmitPrayerRequest} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea 
                      value={prayerFormData.text} 
                      onChange={(e) => setFormData({ ...prayerFormData, text: e.target.value })} 
                      placeholder="Prayer request" 
                      style={{...styles.textarea, minHeight: '80px'}} 
                      required 
                    />
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8 }}>
                      <select 
                        value={prayerFormData.urgency} 
                        onChange={(e) => setFormData({ ...prayerFormData, urgency: e.target.value })} 
                        style={styles.select}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <button 
                        type="submit" 
                        style={{ ...styles.smallBtn, background: '#0ea5e9', color: 'white', width: isMobile ? '100%' : 'auto' }}
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials modal */}
      {credentials && (
        <div style={styles.modalOverlay} onClick={() => setCredentials(null)}>
          <div style={{ ...styles.modalContent, maxWidth: isMobile ? '95%' : 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New Account Credentials</h3>
              <button style={styles.closeBtn} onClick={() => setCredentials(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.credBox}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Email</div>
                  <div style={{ marginTop: 6, wordBreak: 'break-all' }}>{credentials.email}</div>
                </div>
              </div>

              <div style={{ height: 10 }} />

              <div style={styles.credBox}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Temporary Password</div>
                  <div style={{ marginTop: 6, wordBreak: 'break-all' }}>{credentials.password}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: 8 }}>
                <button style={styles.cancelBtn} onClick={() => setCredentials(null)}>Close</button>
                <button 
                  style={{ ...styles.submitBtn, width: isMobile ? '100%' : 'auto' }} 
                  onClick={() => { copyCredentials(); setSuccess('Credentials copied to clipboard.'); setTimeout(() => setSuccess(''), 2500); }}
                >
                  {copied === 'both' ? 'Copied' : 'Copy Credentials'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Missionaries;