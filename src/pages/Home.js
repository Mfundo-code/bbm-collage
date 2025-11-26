// src/pages/Home.fixed.jsx
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
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    attachments: [],
    allowComments: true,
    allowLikes: true,
    tags: []
  });
  const { user, canManagePosts } = useAuth();

  useEffect(() => {
    fetchUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Shared UI tokens
  const PRIMARY = '#06b6d4';
  const PRIMARY_HOVER = '#0aa9c3';
  const DANGER = '#ef4444';

  const fileUploadStyles = {
    fileInput: { marginBottom: '1rem' },
    fileList: { marginBottom: '1rem' },
    fileItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '0.5rem' },
    fileName: { flex: 1, fontSize: '0.9rem', color: '#374151' },
    removeFile: { background: 'none', border: 'none', color: DANGER, cursor: 'pointer', fontSize: '1rem' },
    uploadProgress: { padding: '1rem', textAlign: 'center', color: '#64748b' }
  };

  const styles = {
    page: { maxWidth: '900px', margin: '0 auto', width: '100%', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    title: { fontSize: '2rem', color: '#0f172a', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '1.05rem', margin: '0.25rem 0 0 0' },
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

    updateCard: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.03)' },
    updateHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
    authorInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
    avatar: { width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' },
    authorDetails: { display: 'flex', flexDirection: 'column' },
    authorName: { fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' },
    postDate: { color: '#64748b', fontSize: '0.9rem' },

    updateTitle: { fontSize: '1.125rem', color: '#0f172a', margin: '0 0 0.5rem 0' },
    updateBody: { color: '#334155', lineHeight: '1.6', marginBottom: '1rem', whiteSpace: 'pre-wrap', fontSize: '1.03rem' },

    // Make image grid produce equal-size thumbnails regardless of source
    mediaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1rem' },
    mediaItemWrap: { width: '100%', height: '160px', overflow: 'hidden', borderRadius: '8px' },
    mediaItem: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'pointer', transition: 'transform 0.2s' },
    videoPlayer: { width: '100%', borderRadius: '8px', maxHeight: '400px' },

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
    commentAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' },
    commentContent: { flex: 1 },
    commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    commentAuthor: { fontWeight: 700, color: '#0f172a' },
    commentDate: { color: '#64748b', fontSize: '0.85rem' },
    commentText: { color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' },
    commentDelete: { background: 'none', border: 'none', color: DANGER, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }
  };

  if (loading) return <div style={styles.page}><div style={styles.loading}>Loading daily updates...</div></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily Mission Updates</h1>
          <p style={styles.subtitle}>Latest news and activities from the mission field</p>
        </div>

        {(typeof canManagePosts === 'function' ? canManagePosts() : canManagePosts) && (
          <button style={styles.addBtn} onClick={() => setShowForm(true)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>+ Add Update</button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>New Daily Update</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Title (Optional)</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Enter update title" style={styles.input} />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Content *</label>
                <textarea value={formData.body} onChange={(e) => setFormData({...formData, body: e.target.value})} placeholder="Share what's happening in the mission field..." style={styles.textarea} required rows="6" />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Attachments (Optional)
                  <span style={{fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem'}}>Images, Videos (max 350MB), Audio, PDFs</span>
                </label>
                <input type="file" multiple accept="image/*,video/*,audio/*,.pdf" onChange={handleFileSelect} style={{...styles.input, padding: '0.5rem'}} disabled={uploading} />

                {selectedFiles.length > 0 && (
                  <div style={fileUploadStyles.fileList}>
                    <p style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: '#374151'}}>Selected files ({selectedFiles.length}):</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={fileUploadStyles.fileItem}>
                        <span style={fileUploadStyles.fileName}>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        <button type="button" style={fileUploadStyles.removeFile} onClick={() => removeFile(index)} disabled={uploading}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.checkbox}>
                <input type="checkbox" checked={formData.allowComments} onChange={(e) => setFormData({...formData, allowComments: e.target.checked})} disabled={uploading} />
                <label>Allow comments</label>
              </div>

              <div style={styles.checkbox}>
                <input type="checkbox" checked={formData.allowLikes} onChange={(e) => setFormData({...formData, allowLikes: e.target.checked})} disabled={uploading} />
                <label>Allow likes</label>
              </div>

              {uploading && (<div style={fileUploadStyles.uploadProgress}><p>Uploading files... Please wait.</p></div>)}

              <div style={styles.formActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)} disabled={uploading}>Cancel</button>
                <button type="submit" style={styles.submitBtn} disabled={uploading || !formData.body?.trim()} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>{uploading ? 'Creating...' : 'Create Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {updates.length === 0 ? (
        <div style={styles.empty}><p>No updates yet. Check back later for mission news.</p></div>
      ) : (
        updates.map(update => (
          <div key={update.id} style={styles.updateCard}>
            <div style={styles.updateHeader}>
              <div style={styles.authorInfo}>
                <div style={styles.avatar}>{update.author.firstName?.[0]}{update.author.lastName?.[0]}</div>
                <div style={styles.authorDetails}><div style={styles.authorName}>{update.author.firstName} {update.author.lastName}</div><div style={styles.postDate}>{new Date(update.createdAt).toLocaleString()}</div></div>
              </div>

              {(update.author.id === user?.id || user?.role === 'admin') && (
                <button style={styles.deleteBtn} onClick={() => handleDeletePost(update.id)} title="Delete post">🗑️</button>
              )}
            </div>

            {update.title && <h2 style={styles.updateTitle}>{update.title}</h2>}

            <div style={styles.updateBody}>{update.body}</div>

            {update.attachments && update.attachments.length > 0 && (
              <div style={styles.mediaGrid}>
                {update.attachments.map((attachment, index) => (
                  <div key={index} style={styles.mediaItemWrap}>
                    {attachment.includes('.mp4') || attachment.includes('video') ? (
                      <video controls style={styles.videoPlayer}><source src={attachment} type="video/mp4" />Your browser does not support the video tag.</video>
                    ) : (
                      <img src={attachment} alt={`Attachment ${index + 1}`} style={styles.mediaItem} onClick={() => window.open(attachment, '_blank')} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={styles.actions}>
              {update.allowLikes && (
                <button style={{ ...styles.likeBtn, ...(update.liked ? styles.likedOutline : styles.unlikedOutline) }} onClick={() => handleLike(update.id)} onMouseEnter={(e) => { if (!update.liked) { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; } }} onMouseLeave={(e) => { if (!update.liked) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; } }}>{update.liked ? '❤️' : '🤍'} {update.likes.length}</button>
              )}

              {update.allowComments && (
                <button style={{ ...styles.commentToggle }} onClick={() => toggleComments(update.id)} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PRIMARY_HOVER; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; }}>💬 {update.comments.length} Comments</button>
              )}
            </div>

            {expandedComments[update.id] && update.allowComments && (
              <div style={styles.commentSection}>
                <textarea placeholder="Write a comment..." value={commentInputs[update.id] || ''} onChange={(e) => setCommentInputs(prev => ({ ...prev, [update.id]: e.target.value }))} rows="3" style={styles.commentInput} />
                <button style={styles.commentBtn} onClick={() => handleCommentSubmit(update.id)} disabled={!commentInputs[update.id]?.trim()} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_HOVER} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PRIMARY}>Post Comment</button>

                {update.comments.length > 0 && (
                  <div style={styles.commentsList}>
                    {update.comments.map(comment => (
                      <div key={comment.id} style={styles.comment}>
                        <div style={styles.commentAvatar}>{comment.author.firstName?.[0]}{comment.author.lastName?.[0]}</div>
                        <div style={styles.commentContent}>
                          <div style={styles.commentHeader}><span style={styles.commentAuthor}>{comment.author.firstName} {comment.author.lastName}</span><span style={styles.commentDate}>{new Date(comment.createdAt).toLocaleString()}</span></div>
                          <p style={styles.commentText}>{comment.text}</p>
                          {(comment.author.id === user?.id || user?.role === 'admin') && (<button style={styles.commentDelete} onClick={() => handleDeleteComment(comment.id)}>Delete</button>)}
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

export default Home;
