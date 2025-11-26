// src/pages/Suggestions.fixed.jsx
import React, { useState, useEffect } from 'react';
import { suggestionsAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    category: 'general',
    anonymous: false
  });
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await suggestionsAPI.getSuggestions();
      const items = response.data?.items || [];

      const suggestionsWithDetails = await Promise.all(
        items.map(async (suggestion) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('suggestion', suggestion.id),
            interactionsAPI.getLikes('suggestion', suggestion.id)
          ]);

          const comments = commentsRes.data?.comments || [];
          const likes = likesRes.data?.likes || [];

          return {
            ...suggestion,
            comments,
            likes,
            liked: likes.some(like => like.user.id === user?.id)
          };
        })
      );

      setSuggestions(suggestionsWithDetails);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await suggestionsAPI.createSuggestion(formData);
      setFormData({ title: '', body: '', category: 'general', anonymous: false });
      setShowForm(false);
      fetchSuggestions();
    } catch (err) {
      console.error('Error creating suggestion:', err);
    }
  };

  const handleLike = async (suggestionId) => {
    try {
      await interactionsAPI.toggleLike('suggestion', suggestionId);
      fetchSuggestions();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleCommentSubmit = async (suggestionId) => {
    const commentText = commentInputs[suggestionId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({ parentType: 'suggestion', parentId: suggestionId, text: commentText, attachments: [] });
      setCommentInputs(prev => ({ ...prev, [suggestionId]: '' }));
      fetchSuggestions();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteSuggestion = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;
    try {
      await suggestionsAPI.deleteSuggestion(suggestionId);
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (err) {
      console.error('Error deleting suggestion:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchSuggestions();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const toggleComments = (suggestionId) => {
    setExpandedComments(prev => ({ ...prev, [suggestionId]: !prev[suggestionId] }));
  };

  // Shared UI tokens (matching other pages)
  const PRIMARY = '#06b6d4';
  const PRIMARY_HOVER = '#0aa9c3';
  const DANGER = '#ef4444';

  const styles = {
    page: { maxWidth: '900px', margin: '0 auto', width: '100%', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
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
    suggestionCard: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.03)' },
    suggestionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
    suggestionInfo: { flex: 1 },
    suggestionTitle: { fontSize: '1.125rem', color: '#0f172a', margin: '0 0 0.5rem 0' },
    suggestionMeta: { display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem', alignItems: 'center' },
    category: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 },
    suggestionBody: { color: '#334155', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap', fontSize: '1.03rem' },
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

  if (loading) return <div style={styles.page}><div style={styles.loading}>Loading suggestions...</div></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Suggestions Box</h1>
        <button
          style={styles.addBtn}
          onClick={() => setShowForm(true)}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}
        >
          + New Suggestion
        </button>
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>New Suggestion</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Enter suggestion title" style={styles.input} required />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={styles.input}>
                  <option value="general">General</option>
                  <option value="facility">Facility</option>
                  <option value="program">Program</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Suggestion</label>
                <textarea value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} placeholder="Describe your suggestion in detail..." style={styles.textarea} required />
              </div>

              <div style={styles.checkbox}>
                <input type="checkbox" checked={formData.anonymous} onChange={(e) => setFormData({...formData, anonymous: e.target.checked})} />
                <label>Post anonymously</label>
              </div>

              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={styles.submitBtn} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>Submit Suggestion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {suggestions.length === 0 ? (
        <div style={styles.empty}><p>No suggestions yet. Be the first to share your idea!</p></div>
      ) : (
        suggestions.map(suggestion => (
          <div key={suggestion.id} style={styles.suggestionCard}>
            <div style={styles.suggestionHeader}>
              <div style={styles.suggestionInfo}>
                <h3 style={styles.suggestionTitle}>{suggestion.title}</h3>
                <div style={styles.suggestionMeta}>
                  <span style={styles.category}>{suggestion.category}</span>
                  <span>{suggestion.anonymous ? 'Anonymous' : `${suggestion.submitter?.firstName || ''} ${suggestion.submitter?.lastName || ''}`.trim()}</span>
                  <span>{new Date(suggestion.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {(suggestion.submitter?.id === user?.id || (typeof isAdmin === 'function' ? isAdmin() : isAdmin)) && (
                <button style={styles.deleteBtn} onClick={() => handleDeleteSuggestion(suggestion.id)}>🗑️</button>
              )}
            </div>

            <div style={styles.suggestionBody}>{suggestion.body}</div>

            <div style={styles.actions}>
              <button
                style={{ ...styles.likeBtn, ...(suggestion.liked ? styles.likedOutline : styles.unlikedOutline) }}
                onClick={() => handleLike(suggestion.id)}
                onMouseEnter={(e) => { if (!suggestion.liked) { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={(e) => { if (!suggestion.liked) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; } }}
              >
                {suggestion.liked ? '❤️' : '🤍'} {suggestion.likes.length}
              </button>

              <button style={{ ...styles.commentToggle }} onClick={() => toggleComments(suggestion.id)} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; }}>
                💬 {suggestion.comments.length} Comments
              </button>
            </div>

            {expandedComments[suggestion.id] && (
              <div style={styles.commentSection}>
                <textarea placeholder="Write a comment..." value={commentInputs[suggestion.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [suggestion.id]: e.target.value }))} rows="3" style={styles.commentInput} />
                <button style={styles.commentBtn} onClick={() => handleCommentSubmit(suggestion.id)} disabled={!commentInputs[suggestion.id]?.trim()} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>Post Comment</button>

                {suggestion.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {suggestion.comments.map(comment => (
                      <div key={comment.id} style={styles.comment}>
                        <div style={styles.commentAvatar}>{comment.author.firstName?.[0]}{comment.author.lastName?.[0]}</div>
                        <div style={styles.commentContent}>
                          <div style={styles.commentHeader}><span style={styles.commentAuthor}>{comment.author.firstName} {comment.author.lastName}</span><span style={styles.commentDate}>{new Date(comment.createdAt).toLocaleString()}</span></div>
                          <p style={styles.commentText}>{comment.text}</p>

                          {(comment.author.id === user?.id || (typeof isAdmin === 'function' ? isAdmin() : isAdmin)) && (
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

export default Suggestions;
