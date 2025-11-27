import React, { useState, useEffect } from 'react';
import { alumniAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

const Alumni = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumnus, setSelectedAlumnus] = useState(null);
  const [graduationYears, setGraduationYears] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    graduationYear: '',
    currentLocation: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState('');

  const [createFormData, setCreateFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    contactPhone: '',
    profilePhoto: '',
    graduationYear: new Date().getFullYear(),
    currentLocation: '',
    bio: '',
    skills: [],
    publicContact: {},
    linkedProfiles: {}
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    contactPhone: '',
    profilePhoto: '',
    graduationYear: '',
    currentLocation: '',
    bio: '',
    skills: [],
    publicContact: {},
    linkedProfiles: {}
  });

  useEffect(() => {
    fetchAlumni();
    fetchFilters();
  }, [filters]);

  const fetchAlumni = async () => {
    try {
      const response = await alumniAPI.getAlumni(filters);
      setAlumni(response.data.items || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      setError('Failed to load alumni');
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
      setGraduationYears(yearsRes.data || []);
      setLocations(locationsRes.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
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
      const response = await alumniAPI.createAlumni(createFormData);

      const creds = response.data?.credentials;
      if (creds) {
        setCredentials({ email: creds.email, password: creds.temporaryPassword });
      }

      setSuccess('Alumni created! Credentials are shown so you can copy them.');
      setShowCreateForm(false);
      fetchAlumni();
      setCreateFormData({
        email: '', firstName: '', lastName: '', contactPhone: '', profilePhoto: '',
        graduationYear: new Date().getFullYear(), currentLocation: '', bio: '',
        skills: [], publicContact: {}, linkedProfiles: {}
      });

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create alumni');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlumnus) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await alumniAPI.updateAlumni(selectedAlumnus.user.id, editFormData);
      setSuccess('Profile updated successfully!');
      setShowEditForm(false);
      fetchAlumni();
      setSelectedAlumnus(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditForm = (alumnus) => {
    setEditFormData({
      firstName: alumnus.user.firstName || '',
      lastName: alumnus.user.lastName || '',
      contactPhone: alumnus.user.contactPhone || '',
      profilePhoto: alumnus.user.profilePhoto || '',
      graduationYear: alumnus.graduationYear || '',
      currentLocation: alumnus.currentLocation || '',
      bio: alumnus.bio || '',
      skills: alumnus.skills || [],
      publicContact: alumnus.publicContact || {},
      linkedProfiles: alumnus.linkedProfiles || {}
    });
    setSelectedAlumnus(alumnus);
    setShowEditForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this alumni?')) return;

    try {
      await alumniAPI.deleteAlumni(userId);
      setSuccess('Alumni deleted successfully');
      fetchAlumni();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete alumni');
    }
  };

  const handleFollow = async (alumnusId) => {
    try {
      await alumniAPI.followAlumnus(alumnusId);
      fetchAlumni();
    } catch (error) {
      console.error('Error following alumni:', error);
    }
  };

  const handleUnfollow = async (alumnusId) => {
    try {
      await alumniAPI.unfollowAlumnus(alumnusId);
      fetchAlumni();
    } catch (error) {
      console.error('Error unfollowing alumni:', error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'secretary';
  const canEdit = (alumnus) => isAdmin || user?.id === alumnus.user.id;

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

  const openView = (alumnus) => {
    setSelectedAlumnus(alumnus);
    setShowViewModal(true);
  };

  // Helper functions for skills and contact management
  const addSkill = (formType, skill) => {
    if (!skill.trim()) return;
    if (formType === 'create') {
      setCreateFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (formType, index) => {
    if (formType === 'create') {
      setCreateFormData(prev => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index)
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        skills: prev.skills.filter((_, i) => i !== index)
      }));
    }
  };

  const addContact = (formType, key, value) => {
    if (!key.trim() || !value.trim()) return;
    if (formType === 'create') {
      setCreateFormData(prev => ({
        ...prev,
        publicContact: { ...prev.publicContact, [key.trim()]: value.trim() }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        publicContact: { ...prev.publicContact, [key.trim()]: value.trim() }
      }));
    }
  };

  const removeContact = (formType, key) => {
    if (formType === 'create') {
      const newContact = { ...createFormData.publicContact };
      delete newContact[key];
      setCreateFormData(prev => ({ ...prev, publicContact: newContact }));
    } else {
      const newContact = { ...editFormData.publicContact };
      delete newContact[key];
      setEditFormData(prev => ({ ...prev, publicContact: newContact }));
    }
  };

  const addLinkedProfile = (formType, platform, url) => {
    if (!platform.trim() || !url.trim()) return;
    if (formType === 'create') {
      setCreateFormData(prev => ({
        ...prev,
        linkedProfiles: { ...prev.linkedProfiles, [platform.trim()]: url.trim() }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        linkedProfiles: { ...prev.linkedProfiles, [platform.trim()]: url.trim() }
      }));
    }
  };

  const removeLinkedProfile = (formType, platform) => {
    if (formType === 'create') {
      const newProfiles = { ...createFormData.linkedProfiles };
      delete newProfiles[platform];
      setCreateFormData(prev => ({ ...prev, linkedProfiles: newProfiles }));
    } else {
      const newProfiles = { ...editFormData.linkedProfiles };
      delete newProfiles[platform];
      setEditFormData(prev => ({ ...prev, linkedProfiles: newProfiles }));
    }
  };

  const styles = {
    page: { maxWidth: '1200px', margin: '2rem auto', width: '95%', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
    header: { marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flex: 1 },
    title: { fontSize: '1.9rem', color: '#0f172a', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '0.95rem', marginTop: '0.25rem' },
    createBtn: { backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '0.6rem 1.1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 6px 18px rgba(14,165,233,0.12)' },
    alert: { padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid' },
    alertError: { backgroundColor: '#fff1f2', color: '#9f1239', borderColor: '#fecaca' },
    alertSuccess: { backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#bbf7d0' },
    loading: { textAlign: 'center', padding: '4rem 2rem', color: '#64748b' },
    empty: { textAlign: 'center', padding: '4rem 2rem', color: '#64748b', backgroundColor: 'white', borderRadius: '12px' },
    grid: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    filter: { padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem' },

    alumnusCard: { width: '100%', background: 'linear-gradient(180deg, #fff, #fbfbff)', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 6px 18px rgba(15,23,42,0.05)', cursor: 'default', transition: 'transform 0.18s ease, box-shadow 0.18s ease', border: '1px solid rgba(15,23,42,0.03)' },
    alumnusHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' },
    alumnusPhoto: { width: '96px', height: '96px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #eef2ff' },
    alumnusInfo: { flex: 1 },
    alumnusName: { fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' },
    alumnusGraduation: { color: '#8b5cf6', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' },
    alumnusLocation: { color: '#475569', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' },
    alumnusBio: { color: '#334155', lineHeight: '1.45', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    skills: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' },
    skill: { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 },
    actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' },
    followBtn: { flex: 1, backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '0.55rem 0.65rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' },
    viewBtn: { backgroundColor: '#7c3aed', color: 'white', border: 'none', padding: '0.55rem 0.65rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' },
    editBtn: { backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '0.55rem 0.65rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' },
    deleteBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '0.55rem 0.65rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' },

    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2,6,23,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1.25rem', overflowY: 'auto' },
    modalContent: { background: 'white', borderRadius: '12px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader: { padding: '1.1rem', borderBottom: '1px solid #eef2ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 },
    modalTitle: { fontSize: '1.25rem', color: '#0f172a', margin: 0 },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.35rem', cursor: 'pointer', color: '#475569' },
    modalBody: { padding: '1.25rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
    field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    label: { fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' },
    input: { padding: '0.6rem', border: '1px solid #eef2ff', borderRadius: '8px', fontSize: '0.95rem' },
    textarea: { padding: '0.6rem', border: '1px solid #eef2ff', borderRadius: '8px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px' },
    select: { padding: '0.6rem', border: '1px solid #eef2ff', borderRadius: '8px', fontSize: '0.95rem' },
    fileLabel: { padding: '0.6rem', border: '1px dashed #7dd3fc', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: '#0369a1', fontWeight: 700, transition: 'all 0.2s' },
    fileInput: { display: 'none' },
    preview: { width: '120px', height: '120px', borderRadius: '12px', objectFit: 'cover', margin: '0.75rem auto', display: 'block', border: '2px solid #eef2ff' },
    formActions: { display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #eef2ff' },
    cancelBtn: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '0.55rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
    submitBtn: { backgroundColor: '#06b6d4', color: 'white', border: 'none', padding: '0.55rem 1rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' },
    credBox: { padding: '1rem', borderRadius: '8px', background: '#f8fafc', border: '1px dashed #e6eef7', display: 'flex', gap: '0.75rem', alignItems: 'center' },
    smallBtn: { padding: '0.45rem 0.6rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' },
    tagInput: { display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' },
    tagList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    contactItem: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' },
    contactList: { marginTop: '0.5rem' }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.loading}>Loading alumni network...</div></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Alumni Network</h1>
          <p style={styles.subtitle}>Connect with graduates from Mission Bible School around the world</p>
        </div>
        {isAdmin && (
          <button style={styles.createBtn} onClick={() => setShowCreateForm(true)}>
            + Create Alumni
          </button>
        )}
      </div>

      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{success}</div>}

      {/* Filters */}
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
          <p>No alumni registered yet.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {alumni.map(alumnus => (
            <div
              key={alumnus.user.id}
              style={styles.alumnusCard}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={styles.alumnusHeader}>
                <img
                  src={alumnus.user.profilePhoto || '/default-avatar.png'}
                  alt={alumnus.user.firstName}
                  style={styles.alumnusPhoto}
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div style={styles.alumnusInfo}>
                  <h3 style={styles.alumnusName}>
                    {alumnus.user.firstName} {alumnus.user.lastName}
                  </h3>
                  <div style={styles.alumnusGraduation}>🎓 Class of {alumnus.graduationYear}</div>
                  {alumnus.currentLocation && (
                    <div style={styles.alumnusLocation}>📍 {alumnus.currentLocation}</div>
                  )}
                </div>
              </div>

              {alumnus.bio && (
                <p style={styles.alumnusBio}>{alumnus.bio}</p>
              )}

              {alumnus.skills && alumnus.skills.length > 0 && (
                <div style={styles.skills}>
                  {alumnus.skills.slice(0, 4).map((skill, index) => (
                    <span key={index} style={styles.skill}>{skill}</span>
                  ))}
                  {alumnus.skills.length > 4 && (
                    <span style={styles.skill}>+{alumnus.skills.length - 4} more</span>
                  )}
                </div>
              )}

              <div style={styles.actions}>
                <button style={styles.followBtn} onClick={() => handleFollow(alumnus.user.id)}>
                  Follow
                </button>
                <button style={styles.viewBtn} onClick={() => openView(alumnus)}>
                  View
                </button>
                {canEdit(alumnus) && (
                  <button style={styles.editBtn} onClick={() => openEditForm(alumnus)}>
                    Edit
                  </button>
                )}
                {isAdmin && (
                  <button style={styles.deleteBtn} onClick={() => handleDelete(alumnus.user.id)}>
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
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Alumni</h2>
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
                    <label style={styles.label}>Graduation Year *</label>
                    <input
                      type="number"
                      value={createFormData.graduationYear}
                      onChange={(e) => setCreateFormData({ ...createFormData, graduationYear: parseInt(e.target.value) })}
                      style={styles.input}
                      min="1950"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Current Location</label>
                    <input
                      type="text"
                      value={createFormData.currentLocation}
                      onChange={(e) => setCreateFormData({ ...createFormData, currentLocation: e.target.value })}
                      style={styles.input}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Bio</label>
                  <textarea
                    value={createFormData.bio}
                    onChange={(e) => setCreateFormData({ ...createFormData, bio: e.target.value })}
                    style={styles.textarea}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Skills</label>
                  <div style={styles.tagInput}>
                    <input
                      type="text"
                      placeholder="Add a skill"
                      style={{ ...styles.input, flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill('create', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={styles.smallBtn}
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        addSkill('create', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={styles.tagList}>
                    {createFormData.skills.map((skill, index) => (
                      <span key={index} style={styles.skill}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('create', index)}
                          style={{ marginLeft: '0.25rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Alumni'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && selectedAlumnus && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Alumni Profile</h2>
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
                    <label style={styles.label}>Graduation Year</label>
                    <input
                      type="number"
                      value={editFormData.graduationYear}
                      onChange={(e) => setEditFormData({ ...editFormData, graduationYear: parseInt(e.target.value) })}
                      style={styles.input}
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Current Location</label>
                    <input
                      type="text"
                      value={editFormData.currentLocation}
                      onChange={(e) => setEditFormData({ ...editFormData, currentLocation: e.target.value })}
                      style={styles.input}
                    />
                  </div>
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
                  <label style={styles.label}>Skills</label>
                  <div style={styles.tagInput}>
                    <input
                      type="text"
                      placeholder="Add a skill"
                      style={{ ...styles.input, flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill('edit', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={styles.smallBtn}
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        addSkill('edit', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={styles.tagList}>
                    {editFormData.skills.map((skill, index) => (
                      <span key={index} style={styles.skill}>
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill('edit', index)}
                          style={{ marginLeft: '0.25rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

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

      {/* View Modal */}
      {showViewModal && selectedAlumnus && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedAlumnus.user.firstName} {selectedAlumnus.user.lastName}</h2>
              <button style={styles.closeBtn} onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={selectedAlumnus.user.profilePhoto || '/default-avatar.png'} alt="pic" style={{ width: 110, height: 110, borderRadius: 12, objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>Class of {selectedAlumnus.graduationYear}</div>
                  <div style={{ color: '#475569', marginTop: 6 }}>📍 {selectedAlumnus.currentLocation || 'Location not specified'}</div>
                  <div style={{ color: '#475569', marginTop: 6 }}>✉️ {selectedAlumnus.user.email}</div>
                  {selectedAlumnus.user.contactPhone && (
                    <div style={{ color: '#475569', marginTop: 6 }}>📞 {selectedAlumnus.user.contactPhone}</div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Bio</h3>
                <p style={{ color: '#334155', lineHeight: 1.5 }}>{selectedAlumnus.bio || 'No bio available.'}</p>
              </div>

              {selectedAlumnus.skills && selectedAlumnus.skills.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Skills</h3>
                  <div style={styles.skills}>
                    {selectedAlumnus.skills.map((skill, index) => (
                      <span key={index} style={styles.skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlumnus.publicContact && Object.keys(selectedAlumnus.publicContact).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Contact Information</h3>
                  <div style={styles.contactList}>
                    {Object.entries(selectedAlumnus.publicContact).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '80px' }}>{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAlumnus.linkedProfiles && Object.keys(selectedAlumnus.linkedProfiles).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Linked Profiles</h3>
                  <div style={styles.contactList}>
                    {Object.entries(selectedAlumnus.linkedProfiles).map(([platform, url]) => (
                      <div key={platform} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, minWidth: '80px' }}>{platform}:</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9' }}>{url}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credentials modal */}
      {credentials && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: 520 }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New Account Credentials</h3>
              <button style={styles.closeBtn} onClick={() => setCredentials(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.credBox}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Email</div>
                  <div style={{ marginTop: 6 }}>{credentials.email}</div>
                </div>
              </div>

              <div style={{ height: 10 }} />

              <div style={styles.credBox}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800 }}>Temporary Password</div>
                  <div style={{ marginTop: 6 }}>{credentials.password}</div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button style={styles.cancelBtn} onClick={() => setCredentials(null)}>Close</button>
                <button style={{ ...styles.submitBtn }} onClick={() => { copyCredentials(); setSuccess('Credentials copied to clipboard.'); setTimeout(() => setSuccess(''), 2500); }}>
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

export default Alumni;