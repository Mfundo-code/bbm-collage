import React, { useState, useEffect } from 'react';
import { testimoniesAPI, interactionsAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

const Testimonies = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    location: '',
    outreachTag: ''
  });
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      const response = await testimoniesAPI.getTestimonies();
      const testimoniesWithDetails = await Promise.all(
        response.data.items.map(async (testimony) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('testimony', testimony.id),
            interactionsAPI.getLikes('testimony', testimony.id)
          ]);
          return {
            ...testimony,
            comments: commentsRes.data.comments,
            likes: likesRes.data.likes,
            liked: likesRes.data.likes.some(like => like.user.id === user?.id)
          };
        })
      );
      setTestimonies(testimoniesWithDetails);
    } catch (error) {
      console.error('Error fetching testimonies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadError('');
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.body?.trim() || !formData.title?.trim()) {
      alert('Please enter title and testimony content');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      let uploadedUrls = [];
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        console.log('Starting file uploads...', selectedFiles.length, 'files');
        try {
          uploadedUrls = await fileUpload.uploadMultipleFiles(selectedFiles);
          console.log('Files uploaded successfully:', uploadedUrls);
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr);
          setUploadError(`Upload failed: ${uploadErr.message}`);
          setUploading(false);
          return;
        }
      }

      console.log('Creating testimony with attachments:', uploadedUrls);
      await testimoniesAPI.createTestimony({
        ...formData,
        attachments: uploadedUrls
      });
      
      setFormData({ 
        title: '', 
        body: '', 
        location: '', 
        outreachTag: '' 
      });
      setSelectedFiles([]);
      setShowForm(false);
      fetchTestimonies();
    } catch (error) {
      console.error('Error creating testimony:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to create testimony: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (testimonyId) => {
    try {
      await interactionsAPI.toggleLike('testimony', testimonyId);
      fetchTestimonies();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (testimonyId) => {
    const commentText = commentInputs[testimonyId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({
        parentType: 'testimony',
        parentId: testimonyId,
        text: commentText,
        attachments: []
      });

      setCommentInputs(prev => ({ ...prev, [testimonyId]: '' }));
      fetchTestimonies();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteTestimony = async (testimonyId) => {
    if (!window.confirm('Are you sure you want to delete this testimony?')) return;
    try {
      await testimoniesAPI.deleteTestimony(testimonyId);
      setTestimonies(testimonies.filter(t => t.id !== testimonyId));
    } catch (error) {
      console.error('Error deleting testimony:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchTestimonies();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleComments = (testimonyId) => {
    setExpandedComments(prev => ({
      ...prev,
      [testimonyId]: !prev[testimonyId]
    }));
  };

  const handleToggleFeatured = async (testimonyId) => {
    try {
      await testimoniesAPI.toggleFeatured(testimonyId);
      fetchTestimonies();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const fileUploadStyles = {
    fileInput: {
      marginBottom: '1rem',
    },
    fileList: {
      marginBottom: '1rem',
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '6px',
      marginBottom: '0.5rem',
    },
    fileName: {
      flex: 1,
      fontSize: '0.9rem',
      color: '#374151',
    },
    removeFile: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    uploadProgress: {
      padding: '1rem',
      textAlign: 'center',
      color: '#64748b',
    },
    uploadError: {
      padding: '1rem',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderRadius: '6px',
      marginBottom: '1rem',
      fontSize: '0.9rem',
    },
  };

  const styles = {
    page: {
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2rem',
      color: '#1e293b',
      margin: 0,
    },
    addBtn: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.2s',
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
      zIndex: 1000,
    },
    formContainer: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formTitle: {
      fontSize: '1.5rem',
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
    input: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
    },
    textarea: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '120px',
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
    testimonyCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '2px solid transparent',
    },
    featured: {
      borderColor: '#f59e0b',
      backgroundColor: '#fffbeb',
    },
    testimonyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    testimonyInfo: {
      flex: 1,
    },
    testimonyTitle: {
      fontSize: '1.25rem',
      color: '#1e293b',
      margin: '0 0 0.5rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    featuredBadge: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
    },
    testimonyMeta: {
      display: 'flex',
      gap: '1rem',
      color: '#64748b',
      fontSize: '0.9rem',
      flexWrap: 'wrap',
    },
    location: {
      color: '#059669',
      fontWeight: '600',
    },
    outreachTag: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    testimonyBody: {
      color: '#374151',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
      whiteSpace: 'pre-wrap',
      fontSize: '1.05rem',
    },
    mediaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    mediaItem: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    actions: {
      display: 'flex',
      gap: '2rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0',
    },
    likeBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      transition: 'all 0.2s',
    },
    liked: {
      color: '#dc2626',
    },
    commentToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      transition: 'all 0.2s',
    },
    featuredBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'none',
      border: 'none',
      color: '#d97706',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      transition: 'all 0.2s',
    },
    commentSection: {
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e2e8f0',
    },
    commentInput: {
      width: '100%',
      padding: '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      resize: 'vertical',
      marginBottom: '1rem',
      fontFamily: 'inherit',
    },
    commentBtn: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    commentsList: {
      marginTop: '1.5rem',
    },
    comment: {
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      marginBottom: '1rem',
    },
    commentAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.8rem',
      flexShrink: 0,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
    },
    commentAuthor: {
      fontWeight: '600',
      color: '#1e293b',
    },
    commentDate: {
      color: '#64748b',
      fontSize: '0.8rem',
    },
    commentText: {
      color: '#374151',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
    },
    commentDelete: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    deleteBtn: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '0.5rem',
      borderRadius: '4px',
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading testimonies...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Testimonies</h1>
        <button 
          style={styles.addBtn}
          onClick={() => setShowForm(true)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
        >
          + Share Testimony
        </button>
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Share Your Testimony</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Give your testimony a title"
                  style={styles.input}
                  required
                  disabled={uploading}
                />
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Where did this happen?"
                  style={styles.input}
                  disabled={uploading}
                />
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Outreach Tag</label>
                <input
                  type="text"
                  value={formData.outreachTag}
                  onChange={(e) => setFormData({...formData, outreachTag: e.target.value})}
                  placeholder="e.g., Youth Outreach, Medical Mission"
                  style={styles.input}
                  disabled={uploading}
                />
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Your Testimony *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  placeholder="Share your experience and how God has worked in your life..."
                  style={styles.textarea}
                  required
                  rows="6"
                  disabled={uploading}
                />
              </div>

              {/* File Upload Section */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Photos/Videos (Optional)
                  <span style={{fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem'}}>
                    Images, Videos (max 350MB)
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  style={{...styles.input, padding: '0.5rem'}}
                  disabled={uploading}
                />
                
                {selectedFiles.length > 0 && (
                  <div style={fileUploadStyles.fileList}>
                    <p style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: '#374151'}}>
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

              {uploadError && (
                <div style={fileUploadStyles.uploadError}>
                  {uploadError}
                </div>
              )}

              {uploading && (
                <div style={fileUploadStyles.uploadProgress}>
                  <p>Uploading files and creating testimony... Please wait.</p>
                </div>
              )}
              
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn}
                  onClick={() => {
                    setShowForm(false);
                    setUploadError('');
                    setSelectedFiles([]);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={uploading || !formData.body?.trim() || !formData.title?.trim()}
                >
                  {uploading ? 'Sharing...' : 'Share Testimony'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {testimonies.length === 0 ? (
        <div style={styles.empty}>
          <p>No testimonies yet. Be the first to share your story!</p>
        </div>
      ) : (
        testimonies.map(testimony => (
          <div 
            key={testimony.id} 
            style={{
              ...styles.testimonyCard,
              ...(testimony.featured ? styles.featured : {})
            }}
          >
            <div style={styles.testimonyHeader}>
              <div style={styles.testimonyInfo}>
                <h3 style={styles.testimonyTitle}>
                  {testimony.title}
                  {testimony.featured && <span style={styles.featuredBadge}>FEATURED</span>}
                </h3>
                <div style={styles.testimonyMeta}>
                  <span>By {testimony.author.firstName} {testimony.author.lastName}</span>
                  <span>{new Date(testimony.createdAt).toLocaleString()}</span>
                  {testimony.location && <span style={styles.location}>📍 {testimony.location}</span>}
                  {testimony.outreachTag && <span style={styles.outreachTag}>{testimony.outreachTag}</span>}
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '0.5rem'}}>
                {(testimony.author.id === user?.id || isAdmin()) && (
                  <button 
                    style={styles.deleteBtn}
                    onClick={() => handleDeleteTestimony(testimony.id)}
                    title="Delete testimony"
                  >
                    🗑️
                  </button>
                )}
                {isAdmin() && (
                  <button 
                    style={styles.featuredBtn}
                    onClick={() => handleToggleFeatured(testimony.id)}
                    title={testimony.featured ? 'Remove featured' : 'Mark as featured'}
                  >
                    {testimony.featured ? '★' : '☆'}
                  </button>
                )}
              </div>
            </div>

            <div style={styles.testimonyBody}>
              {testimony.body}
            </div>

            {testimony.attachments && testimony.attachments.length > 0 && (
              <div style={styles.mediaGrid}>
                {testimony.attachments.map((attachment, index) => (
                  <img 
                    key={index}
                    src={attachment} 
                    alt={`Testimony attachment ${index + 1}`}
                    style={styles.mediaItem}
                    onClick={() => window.open(attachment, '_blank')}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            )}

            <div style={styles.actions}>
              <button 
                style={{
                  ...styles.likeBtn,
                  ...(testimony.liked ? styles.liked : {})
                }}
                onClick={() => handleLike(testimony.id)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {testimony.liked ? '❤️' : '🤍'} {testimony.likes.length} Likes
              </button>
              
              <button 
                style={styles.commentToggle}
                onClick={() => toggleComments(testimony.id)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                💬 {testimony.comments.length} Comments
              </button>
            </div>

            {expandedComments[testimony.id] && (
              <div style={styles.commentSection}>
                <textarea
                  placeholder="Share your thoughts or encouragement..."
                  value={commentInputs[testimony.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({
                    ...prev,
                    [testimony.id]: e.target.value
                  }))}
                  rows="3"
                  style={styles.commentInput}
                />
                <button 
                  style={styles.commentBtn}
                  onClick={() => handleCommentSubmit(testimony.id)}
                  disabled={!commentInputs[testimony.id]?.trim()}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                >
                  Post Comment
                </button>

                {testimony.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {testimony.comments.map(comment => (
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
                          
                          {(comment.author.id === user?.id || isAdmin()) && (
                            <button 
                              style={styles.commentDelete}
                              onClick={() => handleDeleteComment(comment.id)}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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

export default Testimonies;