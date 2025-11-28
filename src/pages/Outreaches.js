import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// NOTE: Logic preserved from original Outreaches.js — UI/UX restyled to match the Home.fixed.jsx design tokens.
const Outreaches = () => {
  const { canManagePosts, user } = useAuth() || {};

  const mockOutreaches = [
    {
      id: 1,
      title: 'Local Community Outreach',
      status: 'ongoing',
      location: 'Surrounding communities',
      leader: 'Pastor John M.',
      activities: ['Food distribution', "Children's programs", 'Counseling'],
      description: 'Weekly food & support for families in township areas.',
      photos: [],
      reports: [],
    },
    {
      id: 2,
      title: 'Youth Evangelism',
      status: 'ongoing',
      location: 'Schools and youth centers',
      leader: 'Sister Thandi',
      activities: ['Sports ministry', 'Bible studies', 'Career guidance'],
      description: 'Engaging youth through sports and mentorship.',
      photos: [],
      reports: [],
    },
    {
      id: 3,
      title: 'Medical Missions',
      status: 'completed',
      location: 'Rural clinics',
      leader: 'Dr. Moyo',
      activities: ['Free clinics', 'Health education'],
      description: 'Month-long medical mission that served three villages.',
      photos: [],
      reports: [
        {
          id: 1,
          title: 'Medical mission summary',
          author: 'Dr. Moyo',
          description: 'We saw 420 patients. Kids received vaccines and health education was given.',
          photos: [],
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Week 1 Report',
          author: 'Dr. Moyo',
          description: 'First week completed successfully. We set up clinics in two villages and served 150 patients.',
          photos: [],
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ];

  // --- State (logic unchanged) ---
  const [outreaches, setOutreaches] = useState(mockOutreaches);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [selected, setSelected] = useState(null);

  const [isReporting, setIsReporting] = useState(false);
  const [reportData, setReportData] = useState({ title: '', description: '', leader: '', activities: '' });
  const [reportPhotos, setReportPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const openReport = (outreach) => {
    setSelected(outreach);
    setReportData({
      title: '',
      description: '',
      leader: outreach.leader || '',
      activities: outreach.activities.join(', '),
    });
    setReportPhotos([]);
    setIsReporting(true);
  };

  const onFilesPicked = (files) => {
    const arr = Array.from(files).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setReportPhotos((p) => [...p, ...arr]);
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const removePhoto = (index) => {
    setReportPhotos((p) => {
      const removed = p[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return p.filter((_, i) => i !== index);
    });
  };

  const submitReport = () => {
    if (!selected) return;
    const newReport = {
      id: Date.now(),
      title: reportData.title || `Report by ${user?.firstName || 'Admin'}`,
      author: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin',
      description: reportData.description,
      photos: reportPhotos.map((p) => p.url),
      createdAt: new Date().toISOString(),
    };

    setOutreaches((list) =>
      list.map((o) => (o.id === selected.id ? { ...o, reports: [newReport, ...(o.reports || [])] } : o))
    );

    setIsReporting(false);
    setSelected(null);
  };

  const showDetails = (outreach) => setSelected(outreach);
  const closeDetails = () => {
    setSelected(null);
    setIsReporting(false);
  };
  const closeReport = () => {
    setIsReporting(false);
    // keep selected open in details view as original
  };

  // --- New design tokens and styles inspired by Home.fixed.jsx ---
  const PRIMARY = '#06b6d4';
  const PRIMARY_HOVER = '#0aa9c3';
  const DANGER = '#ef4444';

  const styles = {
    page: { maxWidth: '980px', margin: '0 auto', width: '100%', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    titleWrap: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: 800 },
    subtitle: { color: '#64748b', fontSize: '1.05rem', marginTop: '0.25rem' },

    tabBar: { display: 'flex', gap: 12, marginTop: '1rem' },
    tab: (active) => ({ padding: '0.55rem 0.9rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', background: active ? PRIMARY : 'transparent', color: active ? '#fff' : PRIMARY, border: `1px solid ${PRIMARY}`, boxShadow: active ? '0 6px 18px rgba(6,182,212,0.08)' : 'none' }),

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, marginTop: 18 },
    card: { background: 'white', borderRadius: 12, padding: '1.25rem', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.03)', display: 'flex', flexDirection: 'column', gap: 10 },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    cardTitle: { fontSize: '1.05rem', fontWeight: 800, color: '#062a2a' },
    tag: (status) => ({ padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: status === 'ongoing' ? '#ecfeff' : '#f8fafc', color: status === 'ongoing' ? '#065f46' : '#64748b', border: `1px solid ${status === 'ongoing' ? '#67f6ea' : '#e6eef8'}` }),

    meta: { color: '#64748b', fontSize: 13 },
    description: { color: '#334155', lineHeight: 1.6 },

    actions: { display: 'flex', gap: 10, marginTop: 'auto', justifyContent: 'flex-end' },
    btn: { padding: '0.55rem 0.9rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14 },
    btnPrimary: { background: PRIMARY, color: 'white' },
    btnGhost: { background: 'transparent', color: '#0f1724', border: '1px solid #e6eef8' },

    // modal (details/report) will follow Home.fixed visual language
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2,6,23,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 },
    modal: { background: 'white', borderRadius: 12, padding: '1.25rem', width: 'min(920px,95%)', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' },
    closeBtn: { background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b' },

    sectionTitle: { fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 },

    photosRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 },
    photoThumb: { width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eef2f7' },

    reportCard: { background: '#ffffff', padding: 16, borderRadius: 10, marginBottom: 12, border: '1px solid #eef2f7' },

    formContainer: { display: 'flex', flexDirection: 'column', gap: 12 },
    label: { fontWeight: 700, color: '#0f172a', marginBottom: 6 },
    input: { padding: '0.75rem', border: '1px solid #eef2ff', borderRadius: 8, fontSize: '1rem' },
    textarea: { padding: '0.75rem', border: '1px solid #eef2ff', borderRadius: 8, fontSize: '1rem', minHeight: 120, resize: 'vertical' },

    addPhotosBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, borderRadius: 8, border: '2px dashed #e6eef8', cursor: 'pointer', background: '#fafafa' },
    smallMuted: { fontSize: 13, color: '#64748b' },

    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }
  };

  const filtered = outreaches.filter((o) => o.status === activeTab);
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={styles.page}>
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
          <button
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={() => {
              // Open a lightweight "create quick report" for admins — keep original logic: openReport expects an outreach
              // In this layout we simply scroll to top or can open the first outreach report modal if desired. We'll open the reporting overlay while keeping logic unchanged.
              if (filtered[0]) openReport(filtered[0]);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
          >
            + Add Report
          </button>
        )}
      </div>

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

            <div style={{ marginTop: 8 }}>
              <div style={styles.smallMuted}><strong>Activities:</strong> {o.activities.join(', ')}</div>
            </div>

            <div style={styles.actions}>
              <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={() => showDetails(o)}>View Details</button>
              {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
                <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => openReport(o)} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_HOVER)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}>Report</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal (styled like Home.fixed) */}
      {selected && !isReporting && (
        <div style={styles.overlay} onClick={closeDetails}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>{selected.title}</div>
                <div style={{ color: '#64748b', marginTop: 6 }}>Leader: {selected.leader} • {selected.location}</div>
              </div>
              <button style={styles.closeBtn} onClick={closeDetails}>×</button>
            </div>

            <div>
              <div style={styles.sectionTitle}>Description</div>
              <p style={{ marginTop: 0, color: '#334155', lineHeight: 1.6 }}>{selected.description}</p>

              <div style={{ marginTop: 12 }}>
                <div style={styles.twoCol}>
                  <div>
                    <div style={styles.label}>Activities</div>
                    <div>{selected.activities.join(', ')}</div>
                  </div>
                  <div>
                    <div style={styles.label}>Reports</div>
                    <div>{(selected.reports || []).length} report(s)</div>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div style={styles.sectionTitle}>Photos</div>
                  <div style={styles.photosRow}>
                    {(selected.photos || []).length === 0 ? (
                      <div style={{ color: '#94a3b8' }}>No photos yet</div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{r.title}</div>
                            <div style={{ color: '#64748b', fontSize: 13 }}>By {r.author} • {new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                        </div>

                        <p style={{ color: '#334155', marginTop: 8 }}>{r.description}</p>

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

      {/* Report Modal (styled like Home.fixed) */}
      {isReporting && (
        <div style={styles.overlay} onClick={closeReport}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>{selected?.title ? `Report: ${selected.title}` : 'New Outreach Report'}</div>
              <button style={styles.closeBtn} onClick={closeReport}>×</button>
            </div>

            <div style={styles.formContainer}>
              <div>
                <label style={styles.label}>Title</label>
                <input style={styles.input} value={reportData.title} onChange={(e) => setReportData((s) => ({ ...s, title: e.target.value }))} placeholder="Short title for this report" />
              </div>

              <div>
                <label style={styles.label}>Description</label>
                <textarea style={styles.textarea} value={reportData.description} onChange={(e) => setReportData((s) => ({ ...s, description: e.target.value }))} placeholder="What happened / what is happening" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={styles.label}>Leader</label>
                  <input style={styles.input} value={reportData.leader} onChange={(e) => setReportData((s) => ({ ...s, leader: e.target.value }))} placeholder="Name of the outreach leader" />
                </div>
                <div>
                  <label style={styles.label}>Activities (comma separated)</label>
                  <input style={styles.input} value={reportData.activities} onChange={(e) => setReportData((s) => ({ ...s, activities: e.target.value }))} placeholder="e.g. Food distribution, Counseling" />
                </div>
              </div>

              <div>
                <label style={styles.label}>Photos</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
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
                            <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: -8, right: -8, background: DANGER, color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer' }}>×</button>
                          </div>
                        ))
                      )}
                    </div>

                    <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => onFilesPicked(e.target.files)} />
                  </div>

                  <div>
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
                  style={{ ...styles.btn, ...styles.btnPrimary, ...((!reportData.description && reportPhotos.length === 0) ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                  onClick={submitReport}
                  disabled={!reportData.description && reportPhotos.length === 0}
                >
                  Submit Report
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
