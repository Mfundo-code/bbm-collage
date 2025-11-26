// src/pages/Announcements.fixed.jsx
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { fontSize: '2rem', color: '#0f172a', margin: 0 },
    addBtn: { backgroundColor: PRIMARY, color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 6px 18px rgba(6,182,212,0.08)' },
    formOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2,6,23,0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    formContainer: { background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    formTitle: { fontSize: '1.25rem', color: '#0f172a', margin: 0 },
    field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    label: { fontWeight: 700, color: '#0f172a' },
    input: { padding: '0.75rem', border: '1px solid #eef2ff', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit' },
    textarea: { padding: '0.75rem', border: '1px solid #eef2ff', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', minHeight: '120px' },
    checkbox: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    formActions: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
    cancelBtn: { backgroundColor: '#64748b', color: 'white', border: 'none', padding: '0.65rem 1rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' },
    submitBtn: { backgroundColor: PRIMARY, color: 'white', border: 'none', padding: '0.65rem 1rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' },
    loading: { textAlign: 'center', padding: '4rem 2rem', color: '#64748b' },
    empty: { textAlign: 'center', padding: '4rem 2rem', color: '#64748b', backgroundColor: 'white', borderRadius: '12px' },
    announcementCard: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.03)' },
    pinned: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
    announcementHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
    announcementInfo: { flex: 1 },
    announcementTitle: { fontSize: '1.125rem', color: '#0f172a', margin: '0 0 0.5rem 0' },
    pinnedBadge: { backgroundColor: '#f59e0b', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 },
    announcementMeta: { display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem' },
    announcementBody: { color: '#334155', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap', fontSize: '1.03rem' },
    actions: { display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #eef2ff' },
    likeBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.85rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid transparent' },
    likedOutline: { background: PRIMARY, color: 'white', borderColor: PRIMARY },
    unlikedOutline: { background: 'transparent', color: PRIMARY, borderColor: PRIMARY },
    commentToggle: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.85rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: '1px solid transparent', color: PRIMARY },
    commentSection: { marginTop: '1rem' },
    commentInput: { width: '100%', padding: '0.85rem', border: '1px solid #eef2ff', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', marginBottom: '0.75rem' },
    commentBtn: { backgroundColor: PRIMARY, color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' },
    commentsList: { marginTop: '1rem' },
    comment: { display: 'flex', gap: '1rem', padding: '0.8rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '0.75rem' },
    commentAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 },
    commentContent: { flex: 1 },
    commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    commentAuthor: { fontWeight: 700, color: '#0f172a' },
    commentDate: { color: '#64748b', fontSize: '0.85rem' },
    commentText: { color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' },
    commentDelete: { background: 'none', border: 'none', color: DANGER, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 },
    deleteBtn: { background: 'none', border: 'none', color: DANGER, cursor: 'pointer', fontSize: '1rem', padding: '0.4rem', borderRadius: '6px' }
  };

  if (loading) return <div style={styles.page}><div style={styles.loading}>Loading announcements...</div></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Announcements</h1>
        {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
          <button style={styles.addBtn} onClick={() => setShowForm(true)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>+ New Announcement</button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>New Announcement</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Enter announcement title" style={styles.input} required />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Content</label>
                <textarea value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} placeholder="Write your announcement..." style={styles.textarea} required />
              </div>

              <div style={styles.checkbox}>
                <input type="checkbox" checked={formData.pinned} onChange={(e) => setFormData({...formData, pinned: e.target.checked})} />
                <label>Pin this announcement</label>
              </div>

              <div style={styles.checkbox}>
                <input type="checkbox" checked={formData.allowComments} onChange={(e) => setFormData({...formData, allowComments: e.target.checked})} />
                <label>Allow comments</label>
              </div>

              <div style={styles.checkbox}>
                <input type="checkbox" checked={formData.allowLikes} onChange={(e) => setFormData({...formData, allowLikes: e.target.checked})} />
                <label>Allow likes</label>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>Create Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {announcements.length === 0 ? (
        <div style={styles.empty}><p>No announcements yet.</p></div>
      ) : (
        announcements.map(announcement => (
          <div key={announcement.id} style={{ ...styles.announcementCard, ...(announcement.pinned ? styles.pinned : {}) }}>
            <div style={styles.announcementHeader}>
              <div style={styles.announcementInfo}>
                <h3 style={styles.announcementTitle}>
                  {announcement.title}
                  {announcement.pinned && <span style={styles.pinnedBadge}>PINNED</span>}
                </h3>
                <div style={styles.announcementMeta}><span>By {announcement.author.firstName} {announcement.author.lastName}</span><span>{new Date(announcement.createdAt).toLocaleString()}</span></div>
              </div>

              {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
                <button style={styles.deleteBtn} onClick={() => handleDeleteAnnouncement(announcement.id)}>🗑️</button>
              )}
            </div>

            <div style={styles.announcementBody}>{announcement.body}</div>

            <div style={styles.actions}>
              {announcement.allowLikes && (
                <button style={{ ...styles.likeBtn, ...(announcement.liked ? styles.likedOutline : styles.unlikedOutline) }} onClick={() => handleLike(announcement.id)} onMouseEnter={(e) => { if (!announcement.liked) { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; } }} onMouseLeave={(e) => { if (!announcement.liked) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; } }}>{announcement.liked ? '❤️' : '🤍'} {announcement.likes.length}</button>
              )}

              {announcement.allowComments && (
                <button style={{ ...styles.commentToggle }} onClick={() => toggleComments(announcement.id)} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; }}>💬 {announcement.comments.length} Comments</button>
              )}
            </div>

            {expandedComments[announcement.id] && announcement.allowComments && (
              <div style={styles.commentSection}>
                <textarea placeholder="Write a comment..." value={commentInputs[announcement.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [announcement.id]: e.target.value }))} rows="3" style={styles.commentInput} />
                <button style={styles.commentBtn} onClick={() => handleCommentSubmit(announcement.id)} disabled={!commentInputs[announcement.id]?.trim()} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>Post Comment</button>

                {announcement.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {announcement.comments.map(comment => (
                      <div key={comment.id} style={styles.comment}>
                        <div style={styles.commentAvatar}>{comment.author.firstName?.[0]}{comment.author.lastName?.[0]}</div>
                        <div style={styles.commentContent}>
                          <div style={styles.commentHeader}><span style={styles.commentAuthor}>{comment.author.firstName} {comment.author.lastName}</span><span style={styles.commentDate}>{new Date(comment.createdAt).toLocaleString()}</span></div>
                          <p style={styles.commentText}>{comment.text}</p>

                          {(comment.author.id === user?.id || (typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts)) && (
                            <button style={styles.commentDelete} onClick={() => handleDeleteComment(comment.id)}>Delete</button>
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
