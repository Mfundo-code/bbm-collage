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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    fetchAnnouncements();
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAnnouncements();
      const items = response.data?.items || [];

      const announcementsWithDetails = await Promise.all(
        items.map(async (announcement) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('post', announcement.id),
            interactionsAPI.getLikes('post', announcement.id)
          ]);

          const comments = commentsRes.data?.comments || [];
          const likes = likesRes.data?.likes || [];

          return {
            ...announcement,
            comments,
            likes,
            liked: likes.some(like => like.user.id === user?.id)
          };
        })
      );

      setAnnouncements(announcementsWithDetails);
    } catch (err) {
      console.error('Error fetching announcements:', err);
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
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  const handleLike = async (announcementId) => {
    try {
      await interactionsAPI.toggleLike('post', announcementId);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleCommentSubmit = async (announcementId) => {
    const commentText = commentInputs[announcementId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({ parentType: 'post', parentId: announcementId, text: commentText, attachments: [] });
      setCommentInputs(prev => ({ ...prev, [announcementId]: '' }));
      fetchAnnouncements();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await announcementsAPI.deleteAnnouncement(announcementId);
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const toggleComments = (announcementId) => {
    setExpandedComments(prev => ({ ...prev, [announcementId]: !prev[announcementId] }));
  };

  // Shared UI tokens
  const PRIMARY = '#06b6d4';
  const PRIMARY_HOVER = '#0aa9c3';
  const DANGER = '#ef4444';

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
    title: { 
      fontSize: isMobile ? '1.5rem' : '2rem', 
      color: '#0f172a', 
      margin: 0 
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
    announcementCard: { 
      background: 'white', 
      borderRadius: '12px', 
      padding: isMobile ? '1rem' : '1.5rem', 
      marginBottom: isMobile ? '1rem' : '1.5rem', 
      boxShadow: '0 8px 24px rgba(15,23,42,0.04)', 
      border: '1px solid rgba(15,23,42,0.03)' 
    },
    pinned: { 
      borderColor: '#f59e0b', 
      backgroundColor: '#fffbeb' 
    },
    announcementHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'flex-start', 
      marginBottom: isMobile ? '0.75rem' : '1rem',
      gap: isMobile ? '0.5rem' : '0'
    },
    announcementInfo: { 
      flex: 1, 
      width: isMobile ? '100%' : 'auto' 
    },
    announcementTitle: { 
      fontSize: isMobile ? '1rem' : '1.125rem', 
      color: '#0f172a', 
      margin: '0 0 0.5rem 0',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.25rem' : '0.5rem'
    },
    pinnedBadge: { 
      backgroundColor: '#f59e0b', 
      color: 'white', 
      padding: '0.25rem 0.5rem', 
      borderRadius: '4px', 
      fontSize: isMobile ? '0.65rem' : '0.7rem', 
      fontWeight: 600,
      alignSelf: 'flex-start'
    },
    announcementMeta: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.25rem' : '1rem', 
      color: '#64748b', 
      fontSize: isMobile ? '0.8rem' : '0.9rem' 
    },
    announcementBody: { 
      color: '#334155', 
      lineHeight: '1.6', 
      marginBottom: isMobile ? '0.75rem' : '1rem', 
      whiteSpace: 'pre-wrap', 
      fontSize: isMobile ? '0.95rem' : '1.03rem' 
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
      background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontWeight: 700, 
      fontSize: isMobile ? '0.75rem' : '0.85rem', 
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
    },
    deleteBtn: { 
      background: 'none', 
      border: 'none', 
      color: DANGER, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.9rem' : '1rem', 
      padding: isMobile ? '0.3rem' : '0.4rem', 
      borderRadius: '6px',
      alignSelf: 'flex-start'
    }
  };

  if (loading) return <div style={styles.page}><div style={styles.loading}>Loading announcements...</div></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Announcements</h1>
        {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
          <button 
            style={styles.addBtn} 
            onClick={() => setShowForm(true)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
          >
            + New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay} onClick={() => setShowForm(false)}>
          <div style={styles.formContainer} onClick={(e) => e.stopPropagation()}>
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
                <label style={{fontSize: isMobile ? '0.9rem' : '1rem'}}>Pin this announcement</label>
              </div>

              <div style={styles.checkbox}>
                <input 
                  type="checkbox" 
                  checked={formData.allowComments} 
                  onChange={(e) => setFormData({...formData, allowComments: e.target.checked})} 
                />
                <label style={{fontSize: isMobile ? '0.9rem' : '1rem'}}>Allow comments</label>
              </div>

              <div style={styles.checkbox}>
                <input 
                  type="checkbox" 
                  checked={formData.allowLikes} 
                  onChange={(e) => setFormData({...formData, allowLikes: e.target.checked})} 
                />
                <label style={{fontSize: isMobile ? '0.9rem' : '1rem'}}>Allow likes</label>
              </div>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  style={styles.cancelBtn} 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitBtn} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
                >
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
          {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
            <button 
              style={{...styles.addBtn, marginTop: '1rem'}} 
              onClick={() => setShowForm(true)}
            >
              + Create First Announcement
            </button>
          )}
        </div>
      ) : (
        announcements.map(announcement => (
          <div 
            key={announcement.id} 
            style={{ ...styles.announcementCard, ...(announcement.pinned ? styles.pinned : {}) }}
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

              {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
                <button 
                  style={styles.deleteBtn} 
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                >
                  🗑️
                </button>
              )}
            </div>

            <div style={styles.announcementBody}>{announcement.body}</div>

            <div style={styles.actions}>
              {announcement.allowLikes && (
                <button 
                  style={{ ...styles.likeBtn, ...(announcement.liked ? styles.likedOutline : styles.unlikedOutline) }} 
                  onClick={() => handleLike(announcement.id)}
                  onMouseEnter={(e) => { 
                    if (!announcement.liked) { 
                      e.currentTarget.style.backgroundColor = PRIMARY_HOVER; 
                      e.currentTarget.style.color = 'white'; 
                    } 
                  }} 
                  onMouseLeave={(e) => { 
                    if (!announcement.liked) { 
                      e.currentTarget.style.backgroundColor = 'transparent'; 
                      e.currentTarget.style.color = PRIMARY; 
                    } 
                  }}
                >
                  {announcement.liked ? '❤️' : '🤍'} {announcement.likes.length}
                </button>
              )}

              {announcement.allowComments && (
                <button 
                  style={{ ...styles.commentToggle }} 
                  onClick={() => toggleComments(announcement.id)}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = PRIMARY_HOVER; 
                    e.currentTarget.style.color = 'white'; 
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = 'transparent'; 
                    e.currentTarget.style.color = PRIMARY; 
                  }}
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
                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [announcement.id]: e.target.value }))} 
                  rows="3" 
                  style={styles.commentInput} 
                />
                <button 
                  style={styles.commentBtn} 
                  onClick={() => handleCommentSubmit(announcement.id)} 
                  disabled={!commentInputs[announcement.id]?.trim()}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
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

export default Announcements;