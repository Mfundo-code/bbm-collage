// src/pages/SundayServices.js
import React, { useState, useEffect } from 'react';
import { sundayServicesAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SundayServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    attachments: [],
    allowComments: true,
    allowLikes: true
  });
  const { user, canManagePosts } = useAuth();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await sundayServicesAPI.getSundayServices();
      const servicesWithDetails = await Promise.all(
        response.data.items.map(async (service) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('post', service.id),
            interactionsAPI.getLikes('post', service.id)
          ]);
          return {
            ...service,
            comments: commentsRes.data.comments,
            likes: likesRes.data.likes,
            liked: likesRes.data.likes.some(like => like.user.id === user?.id)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sundayServicesAPI.createSundayService(formData);
      setFormData({ title: '', body: '', attachments: [], allowComments: true, allowLikes: true });
      setShowForm(false);
      fetchServices();
    } catch (error) {
      console.error('Error creating Sunday service:', error);
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
      await interactionsAPI.addComment({
        parentType: 'post',
        parentId: serviceId,
        text: commentText,
        attachments: []
      });

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
      setServices(services.filter(s => s.id !== serviceId));
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
    setExpandedComments(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
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
      backgroundColor: '#059669',
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
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
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
      backgroundColor: '#059669',
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
    serviceCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: '4px solid #059669',
    },
    serviceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    serviceInfo: {
      flex: 1,
    },
    serviceTitle: {
      fontSize: '1.5rem',
      color: '#1e293b',
      margin: '0 0 0.5rem 0',
    },
    serviceMeta: {
      display: 'flex',
      gap: '1rem',
      color: '#64748b',
      fontSize: '0.9rem',
    },
    serviceBody: {
      color: '#374151',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
      whiteSpace: 'pre-wrap',
      fontSize: '1.05rem',
    },
    mediaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    mediaItem: {
      width: '100%',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    videoPlayer: {
      width: '100%',
      height: '300px',
      borderRadius: '8px',
    },
    audioPlayer: {
      width: '100%',
      borderRadius: '8px',
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
      backgroundColor: '#059669',
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
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
        <div style={styles.loading}>Loading Sunday services...</div>
      </div>
    );
  }

  const isMediaFile = (url) => {
    return url.includes('.mp4') || url.includes('.mp3') || url.includes('.wav') || 
           url.includes('video') || url.includes('audio');
  };

  const isVideo = (url) => {
    return url.includes('.mp4') || url.includes('video');
  };

  const isAudio = (url) => {
    return url.includes('.mp3') || url.includes('.wav') || url.includes('audio');
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Sunday Services</h1>
        {canManagePosts() && (
          <button 
            style={styles.addBtn}
            onClick={() => setShowForm(true)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
          >
            + Add Service
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Add Sunday Service</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
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
                <label style={styles.label}>Service Details</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  placeholder="Include sermon notes, worship songs, announcements..."
                  style={styles.textarea}
                  required
                />
              </div>
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.allowComments}
                  onChange={(e) => setFormData({...formData, allowComments: e.target.checked})}
                />
                <label>Allow comments</label>
              </div>
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.allowLikes}
                  onChange={(e) => setFormData({...formData, allowLikes: e.target.checked})}
                />
                <label>Allow likes</label>
              </div>
              
              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Add Service
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
                  <span>By {service.author.firstName} {service.author.lastName}</span>
                  <span>{new Date(service.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {canManagePosts() && (
                <button 
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteService(service.id)}
                  title="Delete service"
                >
                  🗑️
                </button>
              )}
            </div>

            <div style={styles.serviceBody}>
              {service.body}
            </div>

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
                      <img 
                        src={attachment} 
                        alt={`Service attachment ${index + 1}`}
                        style={styles.mediaItem}
                        onClick={() => window.open(attachment, '_blank')}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={styles.actions}>
              {service.allowLikes && (
                <button 
                  style={{
                    ...styles.likeBtn,
                    ...(service.liked ? styles.liked : {})
                  }}
                  onClick={() => handleLike(service.id)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {service.liked ? '❤️' : '🤍'} {service.likes.length} Likes
                </button>
              )}
              
              {service.allowComments && (
                <button 
                  style={styles.commentToggle}
                  onClick={() => toggleComments(service.id)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  💬 {service.comments.length} Comments
                </button>
              )}
            </div>

            {expandedComments[service.id] && service.allowComments && (
              <div style={styles.commentSection}>
                <textarea
                  placeholder="Share your thoughts about the service..."
                  value={commentInputs[service.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({
                    ...prev,
                    [service.id]: e.target.value
                  }))}
                  rows="3"
                  style={styles.commentInput}
                />
                <button 
                  style={styles.commentBtn}
                  onClick={() => handleCommentSubmit(service.id)}
                  disabled={!commentInputs[service.id]?.trim()}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
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
                          
                          {(comment.author.id === user?.id || canManagePosts()) && (
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

export default SundayServices;