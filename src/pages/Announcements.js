// src/pages/Announcements.js
import React, { useState, useEffect } from 'react';
import { announcementsAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    pinned: false,
    allowComments: true,
    allowLikes: true
  });
  const { user, canManagePosts } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAnnouncements();
      const announcementsWithDetails = await Promise.all(
        response.data.items.map(async (announcement) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('post', announcement.id),
            interactionsAPI.getLikes('post', announcement.id)
          ]);
          return {
            ...announcement,
            comments: commentsRes.data.comments,
            likes: likesRes.data.likes,
            liked: likesRes.data.likes.some(like => like.user.id === user?.id)
          };
        })
      );
      setAnnouncements(announcementsWithDetails);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await announcementsAPI.createAnnouncement(formData);
      setFormData({ title: '', body: '', pinned: false, allowComments: true, allowLikes: true });
      setShowForm(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleLike = async (announcementId) => {
    try {
      await interactionsAPI.toggleLike('post', announcementId);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (announcementId) => {
    const commentText = commentInputs[announcementId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({
        parentType: 'post',
        parentId: announcementId,
        text: commentText,
        attachments: []
      });

      setCommentInputs(prev => ({ ...prev, [announcementId]: '' }));
      fetchAnnouncements();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementsAPI.deleteAnnouncement(announcementId);
      setAnnouncements(announcements.filter(a => a.id !== announcementId));
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleComments = (announcementId) => {
    setExpandedComments(prev => ({
      ...prev,
      [announcementId]: !prev[announcementId]
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
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
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
      backgroundColor: '#3b82f6',
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
    announcementCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '2px solid transparent',
    },
    pinned: {
      borderColor: '#f59e0b',
      backgroundColor: '#fffbeb',
    },
    announcementHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    announcementInfo: {
      flex: 1,
    },
    announcementTitle: {
      fontSize: '1.25rem',
      color: '#1e293b',
      margin: '0 0 0.5rem 0',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    pinnedBadge: {
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
    },
    announcementMeta: {
      display: 'flex',
      gap: '1rem',
      color: '#64748b',
      fontSize: '0.9rem',
    },
    announcementBody: {
      color: '#374151',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
      whiteSpace: 'pre-wrap',
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
      backgroundColor: '#3b82f6',
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
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
        <div style={styles.loading}>Loading announcements...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Announcements</h1>
        {canManagePosts() && (
          <button 
            style={styles.addBtn}
            onClick={() => setShowForm(true)}
          >
            + New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>New Announcement</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter announcement title"
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Content</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  placeholder="Write your announcement..."
                  style={styles.textarea}
                  required
                />
              </div>
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({...formData, pinned: e.target.checked})}
                />
                <label>Pin this announcement</label>
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
                  Create Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div style={styles.empty}>
          <p>No announcements yet.</p>
        </div>
      ) : (
        announcements.map(announcement => (
          <div 
            key={announcement.id} 
            style={{
              ...styles.announcementCard,
              ...(announcement.pinned ? styles.pinned : {})
            }}
          >
            <div style={styles.announcementHeader}>
              <div style={styles.announcementInfo}>
                <h3 style={styles.announcementTitle}>
                  {announcement.title}
                  {announcement.pinned && <span style={styles.pinnedBadge}>PINNED</span>}
                </h3>
                <div style={styles.announcementMeta}>
                  <span>By {announcement.author.firstName} {announcement.author.lastName}</span>
                  <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {canManagePosts() && (
                <button 
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                >
                  🗑️
                </button>
              )}
            </div>

            <div style={styles.announcementBody}>
              {announcement.body}
            </div>

            <div style={styles.actions}>
              {announcement.allowLikes && (
                <button 
                  style={{
                    ...styles.likeBtn,
                    ...(announcement.liked ? styles.liked : {})
                  }}
                  onClick={() => handleLike(announcement.id)}
                >
                  {announcement.liked ? '❤️' : '🤍'} {announcement.likes.length} Likes
                </button>
              )}
              
              {announcement.allowComments && (
                <button 
                  style={styles.commentToggle}
                  onClick={() => toggleComments(announcement.id)}
                >
                  💬 {announcement.comments.length} Comments
                </button>
              )}
            </div>

            {expandedComments[announcement.id] && announcement.allowComments && (
              <div style={styles.commentSection}>
                <textarea
                  placeholder="Write a comment..."
                  value={commentInputs[announcement.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({
                    ...prev,
                    [announcement.id]: e.target.value
                  }))}
                  rows="3"
                  style={styles.commentInput}
                />
                <button 
                  style={styles.commentBtn}
                  onClick={() => handleCommentSubmit(announcement.id)}
                  disabled={!commentInputs[announcement.id]?.trim()}
                >
                  Post Comment
                </button>

                {announcement.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {announcement.comments.map(comment => (
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

export default Announcements;