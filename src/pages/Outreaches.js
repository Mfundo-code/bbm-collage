import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { outreachesAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';

const Outreaches = () => {
  const { canManagePosts, user } = useAuth() || {};

  // State
  const [outreaches, setOutreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ongoing');
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Report states
  const [isReporting, setIsReporting] = useState(false);
  const [reportData, setReportData] = useState({ title: '', description: '', leader: '' });
  const [reportPhotos, setReportPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Outreach creation states
  const [isCreatingOutreach, setIsCreatingOutreach] = useState(false);
  const [outreachData, setOutreachData] = useState({
    title: '',
    status: 'ongoing',
    location: '',
    leader: '',
    description: '',
    photos: []
  });
  const [outreachPhotos, setOutreachPhotos] = useState([]);
  const [creatingOutreach, setCreatingOutreach] = useState(false);

  const fileInputRef = useRef(null);
  const outreachFileInputRef = useRef(null);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch outreaches from API
  const fetchOutreaches = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await outreachesAPI.getOutreaches();
      setOutreaches(response.data);
    } catch (err) {
      console.error('Error fetching outreaches:', err);
      setError('Failed to load outreaches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutreaches();
  }, []);

  // Report functions
  const openReport = (outreach) => {
    if (!outreach) {
      setError('Please select an outreach first');
      return;
    }

    setSelected(outreach);
    setReportData({
      title: `Report for ${outreach.title}`,
      description: '',
      leader: outreach.leader || ''
    });
    setReportPhotos([]);
    setIsReporting(true);
    setError('');
  };

  const onFilesPicked = async (files) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const uploadedUrl = await fileUpload.uploadFile(file);
          return { file, url: uploadedUrl };
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setReportPhotos((p) => [...p, ...uploadedPhotos]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload some photos. Please try again.');
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const removePhoto = (index) => {
    setReportPhotos((p) => p.filter((_, i) => i !== index));
  };

  const submitReport = async () => {
    if (!selected || submitting) return;

    try {
      setSubmitting(true);
      setError('');

      if (!reportData.description.trim()) {
        setError('Please provide a description for the report');
        return;
      }

      const reportPayload = {
        title: reportData.title || `Report for ${selected.title}`,
        description: reportData.description,
        photos: reportPhotos.map((p) => p.url)
      };

      await outreachesAPI.createReport(selected.id, reportPayload);

      await fetchOutreaches();

      setIsReporting(false);
      setSelected(null);
      setReportPhotos([]);
      setError('');
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Outreach creation functions
  const openCreateOutreach = () => {
    setIsCreatingOutreach(true);
    setOutreachData({
      title: '',
      status: 'ongoing',
      location: '',
      leader: '',
      description: '',
      photos: []
    });
    setOutreachPhotos([]);
    setError('');
  };

  const closeCreateOutreach = () => {
    setIsCreatingOutreach(false);
    setOutreachData({
      title: '',
      status: 'ongoing',
      location: '',
      leader: '',
      description: '',
      photos: []
    });
    setOutreachPhotos([]);
  };

  const handleOutreachInputChange = (e) => {
    const { name, value } = e.target;
    setOutreachData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onOutreachFilesPicked = async (files) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const uploadedUrl = await fileUpload.uploadFile(file);
          return { file, url: uploadedUrl };
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setOutreachPhotos((p) => [...p, ...uploadedPhotos]);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload some photos. Please try again.');
    }
  };

  const handleOutreachPhotoClick = () => outreachFileInputRef.current?.click();

  const removeOutreachPhoto = (index) => {
    setOutreachPhotos((p) => p.filter((_, i) => i !== index));
  };

  const submitOutreach = async () => {
    if (creatingOutreach) return;

    try {
      setCreatingOutreach(true);
      setError('');

      // Validation
      if (!outreachData.title.trim()) {
        setError('Please provide a title for the outreach');
        return;
      }
      if (!outreachData.location.trim()) {
        setError('Please provide a location for the outreach');
        return;
      }
      if (!outreachData.leader.trim()) {
        setError('Please provide a leader for the outreach');
        return;
      }
      if (!outreachData.description.trim()) {
        setError('Please provide a description for the outreach');
        return;
      }

      const outreachPayload = {
        title: outreachData.title,
        status: outreachData.status,
        location: outreachData.location,
        leader: outreachData.leader,
        description: outreachData.description,
        photos: outreachPhotos.map((p) => p.url)
      };

      await outreachesAPI.createOutreach(outreachPayload);

      await fetchOutreaches();

      closeCreateOutreach();
      setError('');
    } catch (err) {
      console.error('Error creating outreach:', err);
      setError('Failed to create outreach. Please try again.');
    } finally {
      setCreatingOutreach(false);
    }
  };

  const showDetails = (outreach) => setSelected(outreach);
  const closeDetails = () => {
    setSelected(null);
    setIsReporting(false);
  };
  const closeReport = () => {
    setIsReporting(false);
    setError('');
  };

  // Filter outreaches based on active tab
  const filtered = outreaches.filter((o) => o.status === activeTab);

  // Design tokens and styles
  const PRIMARY = '#06b6d4';
  const PRIMARY_HOVER = '#0aa9c3';
  const DANGER = '#ef4444';
  const SUCCESS = '#10b981';

  const styles = {
    page: { 
      maxWidth: '980px', 
      margin: '0 auto', 
      width: '100%', 
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', 
      padding: isMobile ? '1rem' : '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    header: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'center' : 'center',
      marginBottom: '1.5rem',
      width: '100%',
      textAlign: isMobile ? 'center' : 'left',
      gap: isMobile ? '1rem' : '0'
    },
    titleWrap: { 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: isMobile ? 'center' : 'flex-start'
    },
    title: { 
      fontSize: isMobile ? '1.5rem' : '2rem', 
      color: '#0f172a', 
      margin: 0, 
      fontWeight: 800,
      textAlign: 'center'
    },
    subtitle: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.9rem' : '1.05rem', 
      marginTop: '0.25rem',
      textAlign: 'center'
    },

    tabBar: { 
      display: 'flex', 
      gap: 12, 
      marginTop: '1rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    tab: (active) => ({ 
      padding: '0.55rem 0.9rem', 
      borderRadius: 10, 
      cursor: 'pointer', 
      fontWeight: 700, 
      fontSize: '0.95rem', 
      background: active ? PRIMARY : 'transparent', 
      color: active ? '#fff' : PRIMARY, 
      border: `1px solid ${PRIMARY}`, 
      boxShadow: active ? '0 6px 18px rgba(6,182,212,0.08)' : 'none',
      minWidth: isMobile ? '120px' : 'auto',
      textAlign: 'center'
    }),

    grid: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(280px,1fr))', 
      gap: 18, 
      marginTop: 18,
      width: '100%'
    },
    card: { 
      background: 'white', 
      borderRadius: 12, 
      padding: isMobile ? '1rem' : '1.25rem', 
      boxShadow: '0 8px 24px rgba(15,23,42,0.04)', 
      border: '1px solid rgba(15,23,42,0.03)', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 10,
      textAlign: 'center'
    },
    cardHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'center' : 'flex-start', 
      gap: 12 
    },
    cardTitle: { 
      fontSize: isMobile ? '1rem' : '1.05rem', 
      fontWeight: 800, 
      color: '#062a2a',
      textAlign: 'center'
    },
    tag: (status) => ({ 
      padding: '6px 12px', 
      borderRadius: 999, 
      fontSize: 12, 
      fontWeight: 700, 
      background: status === 'ongoing' ? '#ecfeff' : '#f8fafc', 
      color: status === 'ongoing' ? '#065f46' : '#64748b', 
      border: `1px solid ${status === 'ongoing' ? '#67f6ea' : '#e6eef8'}`,
      marginTop: isMobile ? '0.5rem' : '0'
    }),

    meta: { 
      color: '#64748b', 
      fontSize: 13,
      textAlign: 'center'
    },
    description: { 
      color: '#334155', 
      lineHeight: 1.6,
      textAlign: 'center'
    },

    actions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: 10, 
      marginTop: 'auto', 
      justifyContent: 'center',
      width: '100%'
    },
    btn: { 
      padding: '0.55rem 0.9rem', 
      borderRadius: 10, 
      border: 'none', 
      cursor: 'pointer', 
      fontWeight: 800, 
      fontSize: 14, 
      transition: 'all 0.2s ease',
      width: isMobile ? '100%' : 'auto',
      textAlign: 'center'
    },
    btnPrimary: { background: PRIMARY, color: 'white' },
    btnSuccess: { background: SUCCESS, color: 'white' },
    btnGhost: { background: 'transparent', color: '#0f1724', border: '1px solid #e6eef8' },

    headerActions: { 
      display: 'flex', 
      gap: 10,
      justifyContent: 'center',
      width: isMobile ? '100%' : 'auto'
    },

    overlay: { 
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
      padding: 20 
    },
    modal: { 
      background: 'white', 
      borderRadius: 12, 
      padding: isMobile ? '1rem' : '1.25rem', 
      width: isMobile ? '95%' : 'min(920px,95%)', 
      maxHeight: '90vh', 
      overflowY: 'auto',
      margin: isMobile ? '1rem' : '0'
    },
    modalHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 12,
      textAlign: 'center',
      gap: isMobile ? '1rem' : '0'
    },
    modalTitle: { 
      fontSize: isMobile ? '1.1rem' : '1.25rem', 
      fontWeight: 800, 
      color: '#0f172a',
      textAlign: 'center'
    },
    closeBtn: { 
      background: 'transparent', 
      border: 'none', 
      fontSize: 22, 
      cursor: 'pointer', 
      color: '#64748b',
      alignSelf: isMobile ? 'center' : 'flex-start'
    },

    sectionTitle: { 
      fontSize: isMobile ? '1rem' : '1.05rem', 
      fontWeight: 700, 
      color: '#0f172a', 
      marginBottom: 8,
      textAlign: 'center'
    },
    twoCol: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
      gap: 16, 
      marginBottom: 12 
    },

    photosRow: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(100px, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))', 
      gap: 12,
      justifyContent: 'center'
    },
    photoThumb: { 
      width: '100%', 
      height: isMobile ? '100px' : '120px', 
      objectFit: 'cover', 
      borderRadius: 8, 
      border: '1px solid #eef2f7' 
    },

    reportCard: { 
      background: '#ffffff', 
      padding: 16, 
      borderRadius: 10, 
      marginBottom: 12, 
      border: '1px solid #eef2f7',
      textAlign: 'center'
    },

    formContainer: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 12,
      alignItems: 'center'
    },
    formRow: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 8,
      width: '100%',
      alignItems: 'center'
    },
    label: { 
      fontWeight: 700, 
      color: '#0f172a', 
      marginBottom: 6,
      textAlign: 'center',
      width: '100%'
    },
    input: { 
      padding: '0.75rem', 
      border: '1px solid #eef2ff', 
      borderRadius: 8, 
      fontSize: '1rem', 
      width: '100%',
      textAlign: 'center'
    },
    textarea: { 
      padding: '0.75rem', 
      border: '1px solid #eef2ff', 
      borderRadius: 8, 
      fontSize: '1rem', 
      minHeight: 120, 
      resize: 'vertical', 
      width: '100%',
      textAlign: 'center'
    },
    select: { 
      padding: '0.75rem', 
      border: '1px solid #eef2ff', 
      borderRadius: 8, 
      fontSize: '1rem', 
      width: '100%', 
      background: 'white',
      textAlign: 'center'
    },

    addPhotosBox: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: isMobile ? '100px' : '120px', 
      borderRadius: 8, 
      border: '2px dashed #e6eef8', 
      cursor: 'pointer', 
      background: '#fafafa',
      width: '100%'
    },
    smallMuted: { 
      fontSize: 13, 
      color: '#64748b',
      textAlign: 'center'
    },

    modalActions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'center', 
      gap: 10, 
      marginTop: 12,
      width: '100%'
    },
    loading: { 
      textAlign: 'center', 
      padding: '2rem', 
      color: '#64748b',
      width: '100%'
    },
    error: { 
      background: '#fef2f2', 
      color: '#dc2626', 
      padding: '1rem', 
      borderRadius: 8, 
      marginBottom: '1rem',
      textAlign: 'center',
      width: '100%'
    }
  };

  const [hoveredCard, setHoveredCard] = useState(null);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading outreaches...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <h1 style={styles.title}>Outreaches & Missions</h1>
          <p style={styles.subtitle}>Track community work, reports and photos — manage outreach activity</p>
          <div style={styles.tabBar}>
            <div style={styles.tab(activeTab === 'ongoing')} onClick={() => setActiveTab('ongoing')}>Ongoing</div>
            <div style={styles.tab(activeTab === 'completed')} onClick={() => setActiveTab('completed')}>Completed</div>
          </div>
        </div>

        {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
          <div style={styles.headerActions}>
            <button
              style={{ ...styles.btn, ...styles.btnSuccess }}
              onClick={openCreateOutreach}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0da271')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = SUCCESS)}
            >
              + Create Outreach
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#64748b',
          background: '#f8fafc',
          borderRadius: '12px',
          marginTop: '1rem',
          width: '100%'
        }}>
          <h3>No {activeTab} outreaches found</h3>
          <p>Create your first outreach to get started!</p>
        </div>
      )}

      <div style={styles.grid}>
        {filtered.map((o) => (
          <div
            key={o.id}
            style={{ ...styles.card, ...(hoveredCard === o.id ? { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(15,23,42,0.06)' } : {}) }}
            onMouseEnter={() => setHoveredCard(o.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>{o.title}</div>
                <div style={styles.meta}>{o.location} • Leader: {o.leader}</div>
              </div>
              <div style={styles.tag(o.status)}>{o.status}</div>
            </div>

            <div style={styles.description}>{o.description}</div>

            <div style={styles.actions}>
              <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => showDetails(o)}>View Details</button>
              {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={() => openReport(o)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
                >
                  Report
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selected && !isReporting && (
        <div style={styles.overlay} onClick={closeDetails}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>{selected.title}</div>
                <div style={{ color: '#64748b', marginTop: 6, textAlign: 'center' }}>Leader: {selected.leader} • {selected.location}</div>
              </div>
              <button style={styles.closeBtn} onClick={closeDetails}>×</button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={styles.sectionTitle}>Description</div>
              <p style={{ marginTop: 0, color: '#334155', lineHeight: 1.6, textAlign: 'center' }}>{selected.description}</p>

              <div style={{ marginTop: 12 }}>
                <div style={styles.twoCol}>
                  <div>
                    <div style={styles.label}>Reports</div>
                    <div>{(selected.reports || []).length} report(s)</div>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={styles.sectionTitle}>Photos</div>
                  <div style={styles.photosRow}>
                    {(selected.photos || []).length === 0 ? (
                      <div style={{ color: '#94a3b8', textAlign: 'center', width: '100%' }}>No photos yet</div>
                    ) : (
                      (selected.photos || []).map((p, i) => <img key={i} src={p} alt={`photo-${i}`} style={styles.photoThumb} />)
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={styles.sectionTitle}>Reports</div>

                  {(selected.reports || []).length === 0 ? (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>No reports yet</div>
                  ) : (
                    (selected.reports || []).map((r) => (
                      <div key={r.id} style={styles.reportCard}>
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: isMobile ? '0.5rem' : '0' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{r.title}</div>
                            <div style={{ color: '#64748b', fontSize: 13 }}>By {r.author} • {new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                        </div>

                        <p style={{ color: '#334155', marginTop: 8, textAlign: 'center' }}>{r.description}</p>

                        {r.photos && r.photos.length > 0 && (
                          <div style={styles.photosRow}>
                            {r.photos.map((p, i) => <img key={i} src={p} alt={`report-${i}`} style={styles.photoThumb} />)}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={closeDetails}>Close</button>
                {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
                  <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => setIsReporting(true)} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}>Add Report</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReporting && (
        <div style={styles.overlay} onClick={closeReport}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{selected?.title ? `Report: ${selected.title}` : 'New Outreach Report'}</div>
              <button style={styles.closeBtn} onClick={closeReport}>×</button>
            </div>

            <div style={styles.formContainer}>
              <div style={styles.formRow}>
                <label style={styles.label}>Title</label>
                <input
                  style={styles.input}
                  value={reportData.title}
                  onChange={(e) => setReportData((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Short title for this report"
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={reportData.description}
                  onChange={(e) => setReportData((s) => ({ ...s, description: e.target.value }))}
                  placeholder="What happened / what is happening"
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Photos</label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 8, width: '100%' }}>
                  <div>
                    <div style={styles.photosRow}>
                      {reportPhotos.length === 0 ? (
                        <div style={styles.addPhotosBox} onClick={handlePhotoClick}>
                          <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: 20 }}>+</div>
                            <div style={{ fontSize: 12 }}>Add Photos</div>
                          </div>
                        </div>
                      ) : (
                        reportPhotos.map((p, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <img src={p.url} alt={`preview-${i}`} style={styles.photoThumb} />
                            <button
                              onClick={() => removePhoto(i)}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                background: DANGER,
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 22,
                                height: 22,
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => onFilesPicked(e.target.files)}
                    />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={styles.smallMuted}>Tip: Add multiple photos to showcase your outreach activities</div>
                    <div style={{ marginTop: 12 }}>
                      <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={handlePhotoClick}>Choose photos</button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={closeReport}>Cancel</button>
                <button
                  style={{
                    ...styles.btn,
                    ...styles.btnPrimary,
                    ...((!reportData.description && reportPhotos.length === 0) || submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                  }}
                  onClick={submitReport}
                  disabled={(!reportData.description && reportPhotos.length === 0) || submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Outreach Modal */}
      {isCreatingOutreach && (
        <div style={styles.overlay} onClick={closeCreateOutreach}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>Create New Outreach</div>
              <button style={styles.closeBtn} onClick={closeCreateOutreach}>×</button>
            </div>

            <div style={styles.formContainer}>
              <div style={styles.twoCol}>
                <div style={styles.formRow}>
                  <label style={styles.label}>Title *</label>
                  <input
                    style={styles.input}
                    name="title"
                    value={outreachData.title}
                    onChange={handleOutreachInputChange}
                    placeholder="Outreach mission title"
                  />
                </div>

                <div style={styles.formRow}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.select}
                    name="status"
                    value={outreachData.status}
                    onChange={handleOutreachInputChange}
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={styles.twoCol}>
                <div style={styles.formRow}>
                  <label style={styles.label}>Location *</label>
                  <input
                    style={styles.input}
                    name="location"
                    value={outreachData.location}
                    onChange={handleOutreachInputChange}
                    placeholder="Where is this outreach happening?"
                  />
                </div>

                <div style={styles.formRow}>
                  <label style={styles.label}>Leader *</label>
                  <input
                    style={styles.input}
                    name="leader"
                    value={outreachData.leader}
                    onChange={handleOutreachInputChange}
                    placeholder="Who is leading this outreach?"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Description *</label>
                <textarea
                  style={styles.textarea}
                  name="description"
                  value={outreachData.description}
                  onChange={handleOutreachInputChange}
                  placeholder="Describe the outreach mission, goals, and impact"
                />
              </div>

              <div style={styles.formRow}>
                <label style={styles.label}>Photos</label>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginTop: 8, width: '100%' }}>
                  <div>
                    <div style={styles.photosRow}>
                      {outreachPhotos.length === 0 ? (
                        <div style={styles.addPhotosBox} onClick={handleOutreachPhotoClick}>
                          <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: 20 }}>+</div>
                            <div style={{ fontSize: 12 }}>Add Photos</div>
                          </div>
                        </div>
                      ) : (
                        outreachPhotos.map((p, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <img src={p.url} alt={`preview-${i}`} style={styles.photoThumb} />
                            <button
                              onClick={() => removeOutreachPhoto(i)}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                background: DANGER,
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 22,
                                height: 22,
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <input
                      ref={outreachFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => onOutreachFilesPicked(e.target.files)}
                    />
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={styles.smallMuted}>Add photos to showcase the outreach location or previous activities</div>
                    <div style={{ marginTop: 12 }}>
                      <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={handleOutreachPhotoClick}>Choose photos</button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={closeCreateOutreach}>Cancel</button>
                <button
                  style={{
                    ...styles.btn,
                    ...styles.btnSuccess,
                    ...(creatingOutreach ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                  }}
                  onClick={submitOutreach}
                  disabled={creatingOutreach}
                >
                  {creatingOutreach ? 'Creating...' : 'Create Outreach'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Outreaches;