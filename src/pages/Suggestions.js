// src/pages/Suggestions.js
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
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await suggestionsAPI.getSuggestions();
      const suggestionsWithDetails = await Promise.all(
        response.data.items.map(async (suggestion) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('suggestion', suggestion.id),
            interactionsAPI.getLikes('suggestion', suggestion.id)
          ]);
          return {
            ...suggestion,
            comments: commentsRes.data.comments,
            likes: likesRes.data.likes,
            liked: likesRes.data.likes.some(like => like.user.id === user?.id)
          };
        })
      );
      setSuggestions(suggestionsWithDetails);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
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
    } catch (error) {
      console.error('Error creating suggestion:', error);
    }
  };

  const handleLike = async (suggestionId) => {
    try {
      await interactionsAPI.toggleLike('suggestion', suggestionId);
      fetchSuggestions();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (suggestionId) => {
    const commentText = commentInputs[suggestionId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({
        parentType: 'suggestion',
        parentId: suggestionId,
        text: commentText,
        attachments: []
      });

      setCommentInputs(prev => ({ ...prev, [suggestionId]: '' }));
      fetchSuggestions();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteSuggestion = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;
    try {
      await suggestionsAPI.deleteSuggestion(suggestionId);
      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchSuggestions();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleComments = (suggestionId) => {
    setExpandedComments(prev => ({
      ...prev,
      [suggestionId]: !prev[suggestionId]
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
      backgroundColor: '#10b981',
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
      backgroundColor: '#10b981',
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
    suggestionCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    suggestionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    suggestionInfo: {
      flex: 1,
    },
    suggestionTitle: {
      fontSize: '1.25rem',
      color: '#1e293b',
      margin: '0 0 0.5rem 0',
    },
    suggestionMeta: {
      display: 'flex',
      gap: '1rem',
      color: '#64748b',
      fontSize: '0.9rem',
    },
    category: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
    },
    suggestionBody: {
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
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
        <div style={styles.loading}>Loading suggestions...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Suggestions Box</h1>
        <button 
          style={styles.addBtn}
          onClick={() => setShowForm(true)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
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
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter suggestion title"
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={styles.input}
                >
                  <option value="general">General</option>
                  <option value="facility">Facility</option>
                  <option value="program">Program</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Suggestion</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  placeholder="Describe your suggestion in detail..."
                  style={styles.textarea}
                  required
                />
              </div>
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({...formData, anonymous: e.target.checked})}
                />
                <label>Post anonymously</label>
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
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {suggestions.length === 0 ? (
        <div style={styles.empty}>
          <p>No suggestions yet. Be the first to share your idea!</p>
        </div>
      ) : (
        suggestions.map(suggestion => (
          <div key={suggestion.id} style={styles.suggestionCard}>
            <div style={styles.suggestionHeader}>
              <div style={styles.suggestionInfo}>
                <h3 style={suggestionTitle}>{suggestion.title}</h3>
                <div style={styles.suggestionMeta}>
                  <span style={styles.category}>{suggestion.category}</span>
                  <span>
                    {suggestion.anonymous ? 'Anonymous' : 
                     `${suggestion.submitter?.firstName} ${suggestion.submitter?.lastName}`}
                  </span>
                  <span>{new Date(suggestion.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {(suggestion.submitter?.id === user?.id || isAdmin()) && (
                <button 
                  style={styles.deleteBtn}
                  onClick={() => handleDeleteSuggestion(suggestion.id)}
                >
                  🗑️
                </button>
              )}
            </div>

            <div style={styles.suggestionBody}>
              {suggestion.body}
            </div>

            <div style={styles.actions}>
              <button 
                style={{
                  ...styles.likeBtn,
                  ...(suggestion.liked ? styles.liked : {})
                }}
                onClick={() => handleLike(suggestion.id)}
              >
                {suggestion.liked ? '❤️' : '🤍'} {suggestion.likes.length} Likes
              </button>
              
              <button 
                style={styles.commentToggle}
                onClick={() => toggleComments(suggestion.id)}
              >
                💬 {suggestion.comments.length} Comments
              </button>
            </div>

            {expandedComments[suggestion.id] && (
              <div style={styles.commentSection}>
                <textarea
                  placeholder="Write a comment..."
                  value={commentInputs[suggestion.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({
                    ...prev,
                    [suggestion.id]: e.target.value
                  }))}
                  rows="3"
                  style={styles.commentInput}
                />
                <button 
                  style={styles.commentBtn}
                  onClick={() => handleCommentSubmit(suggestion.id)}
                  disabled={!commentInputs[suggestion.id]?.trim()}
                >
                  Post Comment
                </button>

                {suggestion.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {suggestion.comments.map(comment => (
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

export default Suggestions;