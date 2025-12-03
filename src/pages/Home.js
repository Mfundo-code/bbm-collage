import React, { useState, useEffect } from 'react';
import { postsAPI, interactionsAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [lightboxImages, setLightboxImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    attachments: [],
    allowComments: true,
    allowLikes: true,
    tags: []
  });
  const { user, canManagePosts } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    fetchUpdates();
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await postsAPI.getPosts({ postType: 'update', page: 1, pageSize: 20 });
      const items = response.data?.items || [];

      const updatesWithDetails = await Promise.all(
        items.map(async (post) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('post', post.id),
            interactionsAPI.getLikes('post', post.id)
          ]);

          const comments = commentsRes.data?.comments || [];
          const likes = likesRes.data?.likes || [];

          return {
            ...post,
            comments,
            likes,
            liked: likes.some(like => like.user.id === user?.id)
          };
        })
      );

      setUpdates(updatesWithDetails);
    } catch (err) {
      console.error('Error fetching updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.body?.trim()) {
      alert('Please enter update content');
      return;
    }

    setUploading(true);
    try {
      let uploadedUrls = [];
      if (selectedFiles.length > 0) uploadedUrls = await fileUpload.uploadMultipleFiles(selectedFiles);

      await postsAPI.createPost({ ...formData, attachments: uploadedUrls, postType: 'update' });

      setFormData({ title: '', body: '', attachments: [], allowComments: true, allowLikes: true, tags: [] });
      setSelectedFiles([]);
      setShowForm(false);
      fetchUpdates();
    } catch (err) {
      console.error('Error creating update:', err);
      alert('Failed to create update: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await interactionsAPI.toggleLike('post', postId);
      fetchUpdates();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({ parentType: 'post', parentId: postId, text: commentText, attachments: [] });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchUpdates();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsAPI.deletePost(postId);
      setUpdates(prev => prev.filter(u => u.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchUpdates();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const toggleComments = (postId) => setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));

  // Lightbox functions
  const openLightbox = (imageUrl, allImages, index) => {
    setLightboxImages(allImages);
    setLightboxImage(imageUrl);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
    setLightboxImages([]);
    setCurrentImageIndex(0);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  };

  const navigateLightbox = (direction) => {
    let newIndex = currentImageIndex + direction;
    
    if (newIndex < 0) {
      newIndex = lightboxImages.length - 1;
    } else if (newIndex >= lightboxImages.length) {
      newIndex = 0;
    }
    
    setCurrentImageIndex(newIndex);
    setLightboxImage(lightboxImages[newIndex]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex, lightboxImages]);

  // Filter only images for lightbox
  const getImageAttachments = (attachments) => {
    return attachments.filter(attachment => 
      attachment.match(/\.(jpeg|jpg|png|gif|webp|bmp|svg)$/i) || 
      attachment.includes('image/')
    );
  };

  // Shared UI tokens
  const PRIMARY = '#06b6d4';
  const PRIMARY_HOVER = '#0aa9c3';
  const DANGER = '#ef4444';

  const fileUploadStyles = {
    fileInput: { marginBottom: '1rem' },
    fileList: { marginBottom: '1rem' },
    fileItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0.4rem' : '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '0.5rem' },
    fileName: { flex: 1, fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#374151' },
    removeFile: { background: 'none', border: 'none', color: DANGER, cursor: 'pointer', fontSize: isMobile ? '0.9rem' : '1rem' },
    uploadProgress: { padding: '1rem', textAlign: 'center', color: '#64748b' }
  };

  const lightboxStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },
    container: {
      position: 'relative',
      width: '90%',
      height: '90%',
      display: 'flex',
      flexDirection: 'column'
    },
    imageContainer: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden'
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain'
    },
    closeButton: {
      position: 'absolute',
      top: isMobile ? '10px' : '20px',
      right: isMobile ? '10px' : '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      color: 'white',
      fontSize: isMobile ? '1.5rem' : '2rem',
      cursor: 'pointer',
      width: isMobile ? '40px' : '50px',
      height: isMobile ? '40px' : '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s'
    },
    navButton: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      color: 'white',
      fontSize: isMobile ? '1.5rem' : '2rem',
      cursor: 'pointer',
      width: isMobile ? '40px' : '50px',
      height: isMobile ? '40px' : '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s'
    },
    prevButton: {
      left: isMobile ? '10px' : '20px'
    },
    nextButton: {
      right: isMobile ? '10px' : '20px'
    },
    counter: {
      position: 'absolute',
      bottom: isMobile ? '60px' : '20px',
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'white',
      fontSize: isMobile ? '0.9rem' : '1rem',
      background: 'rgba(0, 0, 0, 0.5)',
      padding: '5px 10px',
      borderRadius: '20px',
      width: 'fit-content',
      margin: '0 auto'
    }
  };

  const styles = {
    page: { 
      maxWidth: '900px', 
      margin: '0 auto', 
      width: '100%', 
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      padding: isMobile ? '1rem' : '0'
    },
    header: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'center', 
      marginBottom: isMobile ? '1.5rem' : '2rem',
      gap: isMobile ? '1rem' : '0'
    },
    headerText: { flex: 1 },
    title: { 
      fontSize: isMobile ? '1.5rem' : '2rem', 
      color: '#0f172a', 
      margin: 0,
      textAlign: isMobile ? 'left' : 'left'
    },
    subtitle: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.9rem' : '1.05rem', 
      margin: '0.25rem 0 0 0' 
    },
    addBtn: { 
      backgroundColor: PRIMARY, 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.85rem' : '0.6rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.9rem' : '1rem', 
      boxShadow: '0 6px 18px rgba(6,182,212,0.08)',
      alignSelf: isMobile ? 'flex-start' : 'auto'
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
      padding: isMobile ? '0.5rem' : '0'
    },
    formContainer: { 
      background: 'white', 
      borderRadius: '12px', 
      padding: isMobile ? '1.25rem' : '2rem', 
      width: isMobile ? '95%' : '90%', 
      maxWidth: isMobile ? '95%' : '680px', 
      maxHeight: isMobile ? '95vh' : '90vh', 
      overflowY: 'auto' 
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '1rem' : '1.5rem' 
    },
    formTitle: { 
      fontSize: isMobile ? '1.1rem' : '1.25rem', 
      color: '#0f172a', 
      margin: 0 
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
      padding: isMobile ? '0.6rem' : '0.75rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '1rem', 
      fontFamily: 'inherit' 
    },
    textarea: { 
      padding: isMobile ? '0.6rem' : '0.75rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '1rem', 
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
      gap: isMobile ? '0.5rem' : '1rem', 
      justifyContent: 'flex-end' 
    },
    cancelBtn: { 
      backgroundColor: '#64748b', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.75rem' : '0.65rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto'
    },
    submitBtn: { 
      backgroundColor: PRIMARY, 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.75rem' : '0.65rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto'
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
      fontSize: isMobile ? '0.95rem' : '1rem'
    },

    updateCard: { 
      background: 'white', 
      borderRadius: '12px', 
      padding: isMobile ? '1rem' : '1.5rem', 
      marginBottom: isMobile ? '1rem' : '1.5rem', 
      boxShadow: '0 8px 24px rgba(15,23,42,0.04)', 
      border: '1px solid rgba(15,23,42,0.03)' 
    },
    updateHeader: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      marginBottom: isMobile ? '0.75rem' : '1rem' 
    },
    authorInfo: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: isMobile ? '0.75rem' : '1rem' 
    },
    avatar: { 
      width: isMobile ? '40px' : '50px', 
      height: isMobile ? '40px' : '50px', 
      borderRadius: '50%', 
      background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontWeight: 700, 
      fontSize: isMobile ? '0.95rem' : '1.1rem' 
    },
    authorDetails: { 
      display: 'flex', 
      flexDirection: 'column' 
    },
    authorName: { 
      fontWeight: 700, 
      color: '#0f172a', 
      fontSize: isMobile ? '0.95rem' : '1.05rem' 
    },
    postDate: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.8rem' : '0.9rem' 
    },
    deleteBtn: {
      background: 'none',
      border: 'none',
      color: DANGER,
      cursor: 'pointer',
      fontSize: isMobile ? '0.9rem' : '1rem',
      padding: isMobile ? '0.3rem' : '0.4rem',
      borderRadius: '6px'
    },

    updateTitle: { 
      fontSize: isMobile ? '1rem' : '1.125rem', 
      color: '#0f172a', 
      margin: '0 0 0.5rem 0' 
    },
    updateBody: { 
      color: '#334155', 
      lineHeight: '1.6', 
      marginBottom: '1rem', 
      whiteSpace: 'pre-wrap', 
      fontSize: isMobile ? '0.95rem' : '1.03rem' 
    },

    // Responsive media grid
    mediaGrid: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))', 
      gap: isMobile ? '8px' : '12px', 
      marginBottom: '1rem' 
    },
    mediaItemWrap: { 
      width: '100%', 
      height: isMobile ? '120px' : '160px', 
      overflow: 'hidden', 
      borderRadius: '8px',
      cursor: 'pointer'
    },
    mediaItem: { 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover', 
      display: 'block',
      transition: 'transform 0.2s' 
    },

    actions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '1rem', 
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
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      width: isMobile ? '100%' : 'auto'
    },
    likedOutline: { 
      background: PRIMARY, 
      color: 'white', 
      borderColor: PRIMARY 
    },
    unlikedOutline: { 
      background: 'transparent', 
      color: PRIMARY, 
      borderColor: PRIMARY 
    },
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
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      width: isMobile ? '100%' : 'auto'
    },

    commentSection: { 
      marginTop: isMobile ? '0.75rem' : '1rem' 
    },
    commentInput: { 
      width: '100%', 
      padding: isMobile ? '0.6rem' : '0.85rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '1rem', 
      resize: 'vertical', 
      marginBottom: isMobile ? '0.5rem' : '0.75rem',
      minHeight: '80px'
    },
    commentBtn: { 
      backgroundColor: PRIMARY, 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.85rem' : '0.6rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer',
      fontSize: isMobile ? '0.9rem' : '1rem',
      width: isMobile ? '100%' : 'auto'
    },

    commentsList: { 
      marginTop: isMobile ? '0.75rem' : '1rem' 
    },
    comment: { 
      display: 'flex', 
      gap: isMobile ? '0.75rem' : '1rem', 
      padding: isMobile ? '0.6rem' : '0.8rem', 
      backgroundColor: '#f8fafc', 
      borderRadius: '8px', 
      marginBottom: isMobile ? '0.5rem' : '0.75rem' 
    },
    commentAvatar: { 
      width: isMobile ? '32px' : '36px', 
      height: isMobile ? '32px' : '36px', 
      borderRadius: '50%', 
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontWeight: 600, 
      fontSize: isMobile ? '0.75rem' : '0.85rem' 
    },
    commentContent: { 
      flex: 1 
    },
    commentHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'center', 
      marginBottom: isMobile ? '0.25rem' : '0.5rem',
      gap: isMobile ? '0.25rem' : '0'
    },
    commentAuthor: { 
      fontWeight: 700, 
      color: '#0f172a',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    commentDate: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.75rem' : '0.85rem' 
    },
    commentText: { 
      color: '#334155', 
      lineHeight: 1.5, 
      whiteSpace: 'pre-wrap',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    commentDelete: { 
      background: 'none', 
      border: 'none', 
      color: DANGER, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.9rem', 
      fontWeight: 700,
      marginTop: isMobile ? '0.25rem' : '0'
    }
  };

  if (loading) return <div style={styles.page}><div style={styles.loading}>Loading daily updates...</div></div>;

  return (
    <div style={styles.page}>
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div style={lightboxStyles.overlay} onClick={closeLightbox}>
          <div style={lightboxStyles.container} onClick={(e) => e.stopPropagation()}>
            <div style={lightboxStyles.imageContainer}>
              <img 
                src={lightboxImage} 
                alt="Enlarged view" 
                style={lightboxStyles.image}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {lightboxImages.length > 1 && (
              <>
                <button 
                  style={{...lightboxStyles.navButton, ...lightboxStyles.prevButton}}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(-1);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  ‹
                </button>
                
                <button 
                  style={{...lightboxStyles.navButton, ...lightboxStyles.nextButton}}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(1);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  ›
                </button>
                
                <div style={lightboxStyles.counter}>
                  {currentImageIndex + 1} / {lightboxImages.length}
                </div>
              </>
            )}
            
            <button 
              style={lightboxStyles.closeButton}
              onClick={closeLightbox}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Daily Mission Updates</h1>
          <p style={styles.subtitle}>Latest news and activities from the mission field</p>
        </div>

        {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
          <button 
            style={styles.addBtn} 
            onClick={() => setShowForm(true)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
          >
            + Add Update
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.formTitle}>New Daily Update</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title (Optional)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="Enter update title" 
                  style={styles.input} 
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Content *</label>
                <textarea 
                  value={formData.body} 
                  onChange={(e) => setFormData({...formData, body: e.target.value})} 
                  placeholder="Share what's happening in the mission field..." 
                  style={styles.textarea} 
                  required 
                  rows={isMobile ? "4" : "6"} 
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Attachments (Optional)
                  <span style={{fontSize: isMobile ? '0.7rem' : '0.8rem', color: '#64748b', marginLeft: '0.5rem'}}>
                    Images, Audio, PDFs
                  </span>
                </label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,audio/*,.pdf" 
                  onChange={handleFileSelect} 
                  style={{...styles.input, padding: isMobile ? '0.4rem' : '0.5rem'}} 
                  disabled={uploading} 
                />

                {selectedFiles.length > 0 && (
                  <div style={fileUploadStyles.fileList}>
                    <p style={{fontSize: isMobile ? '0.8rem' : '0.9rem', marginBottom: '0.5rem', color: '#374151'}}>
                      Selected files ({selectedFiles.length}):
                    </p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={fileUploadStyles.fileItem}>
                        <span style={fileUploadStyles.fileName}>
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
                <label style={{fontSize: isMobile ? '0.9rem' : '1rem'}}>Allow comments</label>
              </div>

              <div style={styles.checkbox}>
                <input 
                  type="checkbox" 
                  checked={formData.allowLikes} 
                  onChange={(e) => setFormData({...formData, allowLikes: e.target.checked})} 
                  disabled={uploading} 
                />
                <label style={{fontSize: isMobile ? '0.9rem' : '1rem'}}>Allow likes</label>
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
                  disabled={uploading || !formData.body?.trim()} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
                >
                  {uploading ? 'Creating...' : 'Create Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {updates.length === 0 ? (
        <div style={styles.empty}>
          <p>No updates yet. Check back later for mission news.</p>
          {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
            <button 
              style={{...styles.addBtn, marginTop: '1rem'}} 
              onClick={() => setShowForm(true)}
            >
              + Create First Update
            </button>
          )}
        </div>
      ) : (
        updates.map(update => {
          // Filter images for this update
          const imageAttachments = getImageAttachments(update.attachments);
          
          return (
            <div key={update.id} style={styles.updateCard}>
              <div style={styles.updateHeader}>
                <div style={styles.authorInfo}>
                  <div style={styles.avatar}>
                    {update.author.firstName?.[0]}{update.author.lastName?.[0]}
                  </div>
                  <div style={styles.authorDetails}>
                    <div style={styles.authorName}>
                      {update.author.firstName} {update.author.lastName}
                    </div>
                    <div style={styles.postDate}>
                      {new Date(update.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {(update.author.id === user?.id || user?.role === 'admin') && (
                  <button 
                    style={styles.deleteBtn} 
                    onClick={() => handleDeletePost(update.id)} 
                    title="Delete post"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {update.title && <h2 style={styles.updateTitle}>{update.title}</h2>}

              <div style={styles.updateBody}>{update.body}</div>

              {update.attachments && update.attachments.length > 0 && (
                <div style={styles.mediaGrid}>
                  {update.attachments.map((attachment, index) => (
                    <div key={index} style={styles.mediaItemWrap}>
                      {attachment.match(/\.(jpeg|jpg|png|gif|webp|bmp|svg)$/i) || attachment.includes('image/') ? (
                        <img 
                          src={attachment} 
                          alt={`Attachment ${index + 1}`} 
                          style={styles.mediaItem} 
                          onClick={() => openLightbox(attachment, imageAttachments, imageAttachments.indexOf(attachment))}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      ) : (
                        // For non-images (like PDFs), open in new tab
                        <a 
                          href={attachment} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            height: '100%', 
                            backgroundColor: '#f8fafc', 
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            padding: '1rem'
                          }}
                        >
                          {attachment.includes('.pdf') ? '📄 PDF' : '📎 File'}
                          <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                            Click to open
                          </span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.actions}>
                {update.allowLikes && (
                  <button 
                    style={{ ...styles.likeBtn, ...(update.liked ? styles.likedOutline : styles.unlikedOutline) }} 
                    onClick={() => handleLike(update.id)}
                    onMouseEnter={(e) => { 
                      if (!update.liked) { 
                        e.currentTarget.style.backgroundColor = PRIMARY_HOVER; 
                        e.currentTarget.style.color = 'white'; 
                      } 
                    }} 
                    onMouseLeave={(e) => { 
                      if (!update.liked) { 
                        e.currentTarget.style.backgroundColor = 'transparent'; 
                        e.currentTarget.style.color = PRIMARY; 
                      } 
                    }}
                  >
                    {update.liked ? '❤️' : '🤍'} {update.likes.length}
                  </button>
                )}

                {update.allowComments && (
                  <button 
                    style={{ ...styles.commentToggle }} 
                    onClick={() => toggleComments(update.id)}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.backgroundColor = PRIMARY_HOVER; 
                      e.currentTarget.style.color = 'white'; 
                    }} 
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.backgroundColor = 'transparent'; 
                      e.currentTarget.style.color = PRIMARY; 
                    }}
                  >
                    💬 {update.comments.length} Comments
                  </button>
                )}
              </div>

              {expandedComments[update.id] && update.allowComments && (
                <div style={styles.commentSection}>
                  <textarea 
                    placeholder="Write a comment..." 
                    value={commentInputs[update.id] || ''} 
                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [update.id]: e.target.value }))} 
                    rows="3" 
                    style={styles.commentInput} 
                  />
                  <button 
                    style={styles.commentBtn} 
                    onClick={() => handleCommentSubmit(update.id)} 
                    disabled={!commentInputs[update.id]?.trim()}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
                  >
                    Post Comment
                  </button>

                  {update.comments.length > 0 && (
                    <div style={styles.commentsList}>
                      {update.comments.map(comment => (
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
                            {(comment.author.id === user?.id || user?.role === 'admin') && (
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
          );
        })
      )}
    </div>
  );
};

export default Home;