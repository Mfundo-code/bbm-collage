import React, { useState, useEffect } from 'react';
import { sundayServicesAPI, interactionsAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

const SundayServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    attachments: [],
    allowComments: true,
    allowLikes: true
  });
  const { user, canManagePosts } = useAuth();
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

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    try {
      const response = await sundayServicesAPI.getSundayServices();
      const items = response.data?.items || [];
      const servicesWithDetails = await Promise.all(
        items.map(async (service) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('post', service.id),
            interactionsAPI.getLikes('post', service.id)
          ]);
          const comments = commentsRes.data?.comments || [];
          const likes = likesRes.data?.likes || [];
          return {
            ...service,
            comments,
            likes,
            liked: likes.some(like => like.user.id === user?.id)
          };
        })
      );
      setServices(servicesWithDetails);
    } catch (error) {
      console.error('Error fetching Sunday services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.body?.trim() || !formData.title?.trim()) {
      alert('Please enter title and service details');
      return;
    }

    setUploading(true);

    try {
      let uploadedUrls = [];
      if (selectedFiles.length > 0) {
        uploadedUrls = await fileUpload.uploadMultipleFiles(selectedFiles);
      }

      await sundayServicesAPI.createSundayService({
        ...formData,
        attachments: uploadedUrls
      });

      setFormData({ title: '', body: '', attachments: [], allowComments: true, allowLikes: true });
      setSelectedFiles([]);
      setShowForm(false);
      fetchServices();
    } catch (error) {
      console.error('Error creating Sunday service:', error);
      alert('Failed to create service: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (serviceId) => {
    try {
      await interactionsAPI.toggleLike('post', serviceId);
      fetchServices();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (serviceId) => {
    const commentText = commentInputs[serviceId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({ parentType: 'post', parentId: serviceId, text: commentText, attachments: [] });
      setCommentInputs(prev => ({ ...prev, [serviceId]: '' }));
      fetchServices();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this Sunday service?')) return;
    try {
      await sundayServicesAPI.deleteSundayService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (error) {
      console.error('Error deleting Sunday service:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchServices();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleComments = (serviceId) => {
    setExpandedComments(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  // --- Shared UI tokens (match Missionaries & Testimonies) ---
  const PRIMARY = '#06b6d4';
  const PRIMARY_HOVER = '#0aa9c3';
  const DANGER = '#ef4444';

  // Media type checkers
  const isMediaFile = (url) => url.includes('.mp4') || url.includes('.mp3') || url.includes('.wav') || url.includes('video') || url.includes('audio');
  const isVideo = (url) => url.includes('.mp4') || url.includes('video');
  const isAudio = (url) => url.includes('.mp3') || url.includes('.wav') || url.includes('audio');

  // Styles function that responds to mobile
  const getStyles = (isMobile) => ({
    page: { 
      maxWidth: '900px', 
      margin: '0 auto', 
      width: '100%', 
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      padding: isMobile ? '1rem' : '2rem'
    },
    header: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'center', 
      marginBottom: isMobile ? '1.5rem' : '2rem',
      gap: isMobile ? '1rem' : '0'
    },
    title: { 
      fontSize: isMobile ? '1.5rem' : '2rem', 
      color: '#0f172a', 
      margin: 0,
      textAlign: isMobile ? 'center' : 'left',
      width: isMobile ? '100%' : 'auto'
    },
    addBtn: { 
      backgroundColor: PRIMARY, 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 1rem' : '0.6rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.95rem' : '1rem', 
      boxShadow: '0 6px 18px rgba(6,182,212,0.08)',
      width: isMobile ? '100%' : 'auto',
      textAlign: 'center'
    },
    formOverlay: { 
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
      padding: isMobile ? '1rem' : '0'
    },
    formContainer: { 
      background: 'white', 
      borderRadius: '12px', 
      padding: isMobile ? '1.25rem' : '2rem', 
      width: isMobile ? '95%' : '90%', 
      maxWidth: '680px', 
      maxHeight: '90vh', 
      overflowY: 'auto',
      margin: isMobile ? '0.5rem' : '0'
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '1rem' : '1.5rem'
    },
    formTitle: { 
      fontSize: isMobile ? '1.1rem' : '1.25rem', 
      color: '#0f172a', 
      margin: 0,
      textAlign: 'center'
    },
    field: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.5rem'
    },
    label: { 
      fontWeight: 700, 
      color: '#0f172a',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    input: { 
      padding: isMobile ? '0.65rem' : '0.75rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.95rem' : '1rem', 
      fontFamily: 'inherit'
    },
    textarea: { 
      padding: isMobile ? '0.65rem' : '0.75rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.95rem' : '1rem', 
      fontFamily: 'inherit', 
      resize: 'vertical', 
      minHeight: isMobile ? '100px' : '120px'
    },
    checkbox: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem'
    },
    formActions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: '1rem', 
      justifyContent: 'flex-end'
    },
    cancelBtn: { 
      backgroundColor: '#64748b', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem' : '0.65rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto',
      textAlign: 'center'
    },
    submitBtn: { 
      backgroundColor: PRIMARY, 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem' : '0.65rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto',
      textAlign: 'center'
    },
    loading: { 
      textAlign: 'center', 
      padding: isMobile ? '2rem 1rem' : '4rem 2rem', 
      color: '#64748b',
      fontSize: isMobile ? '0.95rem' : '1rem'
    },
    empty: { 
      textAlign: 'center', 
      padding: isMobile ? '2rem 1rem' : '4rem 2rem', 
      color: '#64748b', 
      backgroundColor: 'white', 
      borderRadius: '12px',
      fontSize: isMobile ? '0.95rem' : '1rem'
    },
    serviceCard: { 
      background: 'white', 
      borderRadius: '12px', 
      padding: isMobile ? '1rem' : '1.5rem', 
      marginBottom: isMobile ? '1rem' : '1.5rem', 
      boxShadow: '0 8px 24px rgba(15,23,42,0.04)', 
      border: '1px solid rgba(15,23,42,0.03)'
    },
    serviceHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'flex-start', 
      marginBottom: '1rem',
      gap: isMobile ? '0.75rem' : '0'
    },
    serviceInfo: { 
      flex: 1,
      width: isMobile ? '100%' : 'auto'
    },
    serviceTitle: { 
      fontSize: isMobile ? '1rem' : '1.125rem', 
      color: '#0f172a', 
      margin: '0 0 0.5rem 0',
      lineHeight: 1.4
    },
    serviceMeta: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '1rem', 
      color: '#64748b', 
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      alignItems: isMobile ? 'flex-start' : 'center'
    },
    serviceBody: { 
      color: '#334155', 
      lineHeight: '1.6', 
      marginBottom: '1rem', 
      whiteSpace: 'pre-wrap', 
      fontSize: isMobile ? '0.95rem' : '1.03rem'
    },
    // mediaGrid uses a responsive grid; each media item is wrapped in a fixed-height thumb so all images look equal
    mediaGrid: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: isMobile ? '0.75rem' : '1rem', 
      marginBottom: '1rem', 
      alignItems: 'start'
    },
    mediaThumb: { 
      width: '100%', 
      height: isMobile ? '150px' : '200px', 
      overflow: 'hidden', 
      borderRadius: '8px', 
      backgroundColor: '#000', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    mediaThumbImg: { 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover', 
      display: 'block' 
    },
    mediaItem: { 
      width: '100%', 
      borderRadius: '8px', 
      cursor: 'pointer' 
    },
    videoPlayer: { 
      width: '100%', 
      height: isMobile ? '150px' : '200px', 
      borderRadius: '8px', 
      objectFit: 'cover' 
    },
    audioPlayer: { 
      width: '100%', 
      borderRadius: '8px' 
    },
    actions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '1rem', 
      paddingTop: '1rem', 
      borderTop: '1px solid #eef2ff'
    },
    likeBtn: { 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '0.5rem', 
      padding: isMobile ? '0.4rem 0.75rem' : '0.45rem 0.85rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      border: '1px solid transparent',
      width: isMobile ? '100%' : 'auto',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    likedOutline: { background: PRIMARY, color: 'white', borderColor: PRIMARY },
    unlikedOutline: { background: 'transparent', color: PRIMARY, borderColor: PRIMARY },
    commentToggle: { 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '0.5rem', 
      padding: isMobile ? '0.4rem 0.75rem' : '0.45rem 0.85rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      border: '1px solid transparent', 
      color: PRIMARY,
      width: isMobile ? '100%' : 'auto',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    commentSection: { 
      marginTop: '1rem'
    },
    commentInput: { 
      width: '100%', 
      padding: isMobile ? '0.75rem' : '0.85rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.95rem' : '1rem', 
      resize: 'vertical', 
      marginBottom: '0.75rem'
    },
    commentBtn: { 
      backgroundColor: PRIMARY, 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem' : '0.6rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto',
      fontSize: isMobile ? '0.9rem' : '1rem',
      textAlign: 'center'
    },
    commentsList: { 
      marginTop: '1rem'
    },
    comment: { 
      display: 'flex', 
      gap: isMobile ? '0.75rem' : '1rem', 
      padding: isMobile ? '0.75rem' : '0.8rem', 
      backgroundColor: '#f8fafc', 
      borderRadius: '8px', 
      marginBottom: '0.75rem'
    },
    commentAvatar: { 
      width: isMobile ? '32px' : '36px', 
      height: isMobile ? '32px' : '36px', 
      borderRadius: '50%', 
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontWeight: 700, 
      fontSize: isMobile ? '0.8rem' : '0.85rem', 
      flexShrink: 0
    },
    commentContent: { 
      flex: 1
    },
    commentHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'center', 
      marginBottom: '0.5rem',
      gap: isMobile ? '0.25rem' : '0'
    },
    commentAuthor: { 
      fontWeight: 700, 
      color: '#0f172a',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    commentDate: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.75rem' : '0.85rem'
    },
    commentText: { 
      color: '#334155', 
      lineHeight: 1.5, 
      whiteSpace: 'pre-wrap',
      fontSize: isMobile ? '0.9rem' : '0.95rem'
    },
    commentDelete: { 
      background: 'none', 
      border: 'none', 
      color: DANGER, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.85rem' : '0.9rem', 
      fontWeight: 700,
      padding: isMobile ? '0.25rem' : '0'
    },
    deleteBtn: { 
      background: 'none', 
      border: 'none', 
      color: DANGER, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.9rem' : '1rem', 
      padding: '0.4rem', 
      borderRadius: '6px',
      alignSelf: isMobile ? 'flex-start' : 'center'
    },

    // File upload styles
    fileInput: { 
      marginBottom: '1rem' 
    },
    fileList: { 
      marginBottom: '1rem' 
    },
    fileItem: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: isMobile ? '0.4rem' : '0.5rem', 
      backgroundColor: '#f8fafc', 
      borderRadius: '6px', 
      marginBottom: '0.5rem',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    fileName: { 
      flex: 1, 
      fontSize: isMobile ? '0.85rem' : '0.9rem', 
      color: '#374151',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    removeFile: { 
      background: 'none', 
      border: 'none', 
      color: DANGER, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.9rem' : '1rem' 
    },
    uploadProgress: { 
      padding: isMobile ? '0.75rem' : '1rem', 
      textAlign: 'center', 
      color: '#64748b',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    metaRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '1rem',
      alignItems: isMobile ? 'flex-start' : 'center'
    },
    actionButtons: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '0.75rem',
      width: isMobile ? '100%' : 'auto'
    }
  });

  const styles = getStyles(isMobile);

  const fileUploadStyles = {
    fileInput: { marginBottom: '1rem' },
    fileList: { marginBottom: '1rem' },
    fileItem: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: isMobile ? '0.4rem' : '0.5rem', 
      backgroundColor: '#f8fafc', 
      borderRadius: '6px', 
      marginBottom: '0.5rem',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    fileName: { 
      flex: 1, 
      fontSize: isMobile ? '0.85rem' : '0.9rem', 
      color: '#374151',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    removeFile: { background: 'none', border: 'none', color: DANGER, cursor: 'pointer', fontSize: isMobile ? '0.9rem' : '1rem' },
    uploadProgress: { 
      padding: isMobile ? '0.75rem' : '1rem', 
      textAlign: 'center', 
      color: '#64748b',
      fontSize: isMobile ? '0.9rem' : '1rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading Sunday services...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Sunday Services</h1>
        {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
          <button 
            style={styles.addBtn} 
            onClick={() => setShowForm(true)} 
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} 
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
          >
            + Add Service
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>Add Sunday Service</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g., Sunday Worship Service - Date" 
                  style={styles.input} 
                  required 
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Service Details *</label>
                <textarea 
                  value={formData.body} 
                  onChange={(e) => setFormData({...formData, body: e.target.value})} 
                  placeholder="Include sermon notes, worship songs, announcements..." 
                  style={styles.textarea} 
                  required 
                  rows={isMobile ? "4" : "6"} 
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Attachments (Optional)
                  <span style={{fontSize: isMobile ? '0.75rem' : '0.8rem', color: '#64748b', marginLeft: '0.5rem'}}>
                    Images, Videos (max 350MB), Audio, PDFs
                  </span>
                </label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*,audio/*,.pdf" 
                  onChange={handleFileSelect} 
                  style={{...styles.input, padding: isMobile ? '0.4rem' : '0.5rem'}} 
                  disabled={uploading} 
                />

                {selectedFiles.length > 0 && (
                  <div style={fileUploadStyles.fileList}>
                    <p style={{fontSize: isMobile ? '0.85rem' : '0.9rem', marginBottom: '0.5rem', color: '#374151'}}>
                      Selected files ({selectedFiles.length}):
                    </p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={fileUploadStyles.fileItem}>
                        <span style={fileUploadStyles.fileName} title={file.name}>
                          {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                        <button 
                          type="button" 
                          style={fileUploadStyles.removeFile} 
                          onClick={() => removeFile(index)} 
                          disabled={uploading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.checkbox}>
                <input 
                  type="checkbox" 
                  checked={formData.allowComments} 
                  onChange={(e) => setFormData({...formData, allowComments: e.target.checked})} 
                  disabled={uploading} 
                />
                <label style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>Allow comments</label>
              </div>

              <div style={styles.checkbox}>
                <input 
                  type="checkbox" 
                  checked={formData.allowLikes} 
                  onChange={(e) => setFormData({...formData, allowLikes: e.target.checked})} 
                  disabled={uploading} 
                />
                <label style={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>Allow likes</label>
              </div>

              {uploading && (
                <div style={fileUploadStyles.uploadProgress}>
                  <p>Uploading files... Please wait.</p>
                </div>
              )}

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => setShowForm(false)} 
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitBtn} 
                  disabled={uploading || !formData.body?.trim() || !formData.title?.trim()} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
                >
                  {uploading ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div style={styles.empty}>
          <p>No Sunday services posted yet.</p>
        </div>
      ) : (
        services.map(service => (
          <div key={service.id} style={styles.serviceCard}>
            <div style={styles.serviceHeader}>
              <div style={styles.serviceInfo}>
                <h3 style={styles.serviceTitle}>{service.title}</h3>
                <div style={styles.serviceMeta}>
                  <div style={styles.metaRow}>
                    <span>By {service.author.firstName} {service.author.lastName}</span>
                    <span>{new Date(service.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
                <button 
                  style={styles.deleteBtn} 
                  onClick={() => handleDeleteService(service.id)} 
                  title="Delete service"
                >
                  🗑️
                </button>
              )}
            </div>

            <div style={styles.serviceBody}>{service.body}</div>

            {service.attachments && service.attachments.length > 0 && (
              <div style={styles.mediaGrid}>
                {service.attachments.map((attachment, index) => (
                  <div key={index}>
                    {isVideo(attachment) ? (
                      <video 
                        controls 
                        style={styles.videoPlayer}
                      >
                        <source src={attachment} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : isAudio(attachment) ? (
                      <audio 
                        controls 
                        style={styles.audioPlayer}
                      >
                        <source src={attachment} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                      </audio>
                    ) : (
                      <div style={styles.mediaThumb}>
                        <img 
                          src={attachment} 
                          alt={`Service attachment ${index + 1}`} 
                          style={styles.mediaThumbImg} 
                          onClick={() => window.open(attachment, '_blank')} 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={styles.actions}>
              <div style={styles.actionButtons}>
                {service.allowLikes && (
                  <button 
                    style={{ ...styles.likeBtn, ...(service.liked ? styles.likedOutline : styles.unlikedOutline) }} 
                    onClick={() => handleLike(service.id)} 
                    onMouseEnter={(e) => { if (!service.liked) { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; } }} 
                    onMouseLeave={(e) => { if (!service.liked) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; } }}
                  >
                    {service.liked ? '❤️' : '🤍'} {service.likes.length} Likes
                  </button>
                )}

                {service.allowComments && (
                  <button 
                    style={{ ...styles.commentToggle, border: '1px solid transparent', background: 'transparent', color: PRIMARY }} 
                    onClick={() => toggleComments(service.id)} 
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; }} 
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; }}
                  >
                    💬 {service.comments.length} Comments
                  </button>
                )}
              </div>
            </div>

            {expandedComments[service.id] && service.allowComments && (
              <div style={styles.commentSection}>
                <textarea 
                  placeholder="Share your thoughts about the service..." 
                  value={commentInputs[service.id] || ''} 
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [service.id]: e.target.value }))} 
                  rows="3" 
                  style={styles.commentInput} 
                />
                <button 
                  style={styles.commentBtn} 
                  onClick={() => handleCommentSubmit(service.id)} 
                  disabled={!commentInputs[service.id]?.trim()} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
                >
                  Post Comment
                </button>

                {service.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {service.comments.map(comment => (
                      <div key={comment.id} style={styles.comment}>
                        <div style={styles.commentAvatar}>
                          {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                        </div>
                        <div style={styles.commentContent}>
                          <div style={styles.commentHeader}>
                            <span style={styles.commentAuthor}>
                              {comment.author.firstName} {comment.author.lastName}
                            </span>
                            <span style={styles.commentDate}>
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p style={styles.commentText}>{comment.text}</p>

                          {(comment.author.id === user?.id || (typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts)) && (
                            <button 
                              style={styles.commentDelete} 
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SundayServices;