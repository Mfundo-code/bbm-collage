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
  }, []);

  const fetchUpdates = async () => {
    try {
      const response = await postsAPI.getPosts({ 
        postType: 'update',
        page: 1,
        pageSize: 20
      });
      const updatesWithDetails = await Promise.all(
        response.data.items.map(async (post) => {
          const [commentsRes, likesRes] = await Promise.all([
            interactionsAPI.getComments('post', post.id),
            interactionsAPI.getLikes('post', post.id)
          ]);
          return {
            ...post,
            comments: commentsRes.data.comments,
            likes: likesRes.data.likes,
            liked: likesRes.data.likes.some(like => like.user.id === user?.id)
          };
        })
      );
      setUpdates(updatesWithDetails);
    } catch (error) {
      console.error('Error fetching updates:', error);
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
    
    if (!formData.body?.trim()) {
      alert('Please enter update content');
      return;
    }

    setUploading(true);

    try {
      let uploadedUrls = [];
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        uploadedUrls = await fileUpload.uploadMultipleFiles(selectedFiles);
      }

      await postsAPI.createPost({
        ...formData,
        attachments: uploadedUrls,
        postType: 'update'
      });
      
      setFormData({ 
        title: '', 
        body: '', 
        attachments: [], 
        allowComments: true, 
        allowLikes: true,
        tags: [] 
      });
      setSelectedFiles([]);
      setShowForm(false);
      fetchUpdates();
    } catch (error) {
      console.error('Error creating update:', error);
      alert('Failed to create update: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await interactionsAPI.toggleLike('post', postId);
      fetchUpdates();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    try {
      await interactionsAPI.addComment({
        parentType: 'post',
        parentId: postId,
        text: commentText,
        attachments: []
      });

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchUpdates();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsAPI.deletePost(postId);
      setUpdates(updates.filter(update => update.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      fetchUpdates();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
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
    subtitle: {
      color: '#64748b',
      fontSize: '1.1rem',
      margin: '0.5rem 0 0 0',
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
      transition: 'border-color 0.2s',
    },
    textarea: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '120px',
      transition: 'border-color 0.2s',
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
      transition: 'background-color 0.2s',
    },
    submitBtn: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    loading: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b',
      fontSize: '1.1rem',
    },
    empty: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    updateCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
    },
    updateHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    authorInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '1.1rem',
    },
    authorDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    authorName: {
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '1.1rem',
    },
    postDate: {
      color: '#64748b',
      fontSize: '0.9rem',
    },
    deleteBtn: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '1.1rem',
      padding: '0.5rem',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
    updateTitle: {
      fontSize: '1.5rem',
      color: '#1e293b',
      marginBottom: '1rem',
    },
    updateBody: {
      color: '#374151',
      lineHeight: '1.7',
      marginBottom: '1.5rem',
      fontSize: '1.05rem',
      whiteSpace: 'pre-wrap',
    },
    mediaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    mediaItem: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    videoPlayer: {
      width: '100%',
      borderRadius: '8px',
      maxHeight: '400px',
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
      transition: 'border-color 0.2s',
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
      transition: 'background-color 0.2s',
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
      border: '1px solid #e2e8f0',
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
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading daily updates...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Daily Mission Updates</h1>
          <p style={styles.subtitle}>
            Latest news and activities from the mission field
          </p>
        </div>
        {canManagePosts() && (
          <button 
            style={styles.addBtn}
            onClick={() => setShowForm(true)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            + Add Update
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
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
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                  rows="6"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* File Upload Section */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Attachments (Optional)
                  <span style={{fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem'}}>
                    Images, Videos (max 350MB), Audio, PDFs
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
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
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.allowComments}
                  onChange={(e) => setFormData({...formData, allowComments: e.target.checked})}
                  disabled={uploading}
                />
                <label>Allow comments</label>
              </div>
              
              <div style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.allowLikes}
                  onChange={(e) => setFormData({...formData, allowLikes: e.target.checked})}
                  disabled={uploading}
                />
                <label>Allow likes</label>
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={uploading || !formData.body?.trim()}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
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
        </div>
      ) : (
        updates.map(update => (
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
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🗑️
                </button>
              )}
            </div>

            {update.title && (
              <h2 style={styles.updateTitle}>{update.title}</h2>
            )}

            <div style={styles.updateBody}>
              {update.body}
            </div>

            {update.attachments && update.attachments.length > 0 && (
              <div style={styles.mediaGrid}>
                {update.attachments.map((attachment, index) => (
                  <div key={index}>
                    {attachment.includes('.mp4') || attachment.includes('video') ? (
                      <video 
                        controls 
                        style={styles.videoPlayer}
                      >
                        <source src={attachment} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img 
                        src={attachment} 
                        alt={`Attachment ${index + 1}`}
                        style={styles.mediaItem}
                        onClick={() => window.open(attachment, '_blank')}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={styles.actions}>
              <button 
                style={{
                  ...styles.likeBtn,
                  ...(update.liked ? styles.liked : {})
                }}
                onClick={() => handleLike(update.id)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {update.liked ? '❤️' : '🤍'} {update.likes.length} Likes
              </button>
              
              <button 
                style={styles.commentToggle}
                onClick={() => toggleComments(update.id)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                💬 {update.comments.length} Comments
              </button>
            </div>

            {expandedComments[update.id] && update.allowComments && (
              <div style={styles.commentSection}>
                <textarea
                  placeholder="Write a comment..."
                  value={commentInputs[update.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({
                    ...prev,
                    [update.id]: e.target.value
                  }))}
                  rows="3"
                  style={styles.commentInput}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <button 
                  style={styles.commentBtn}
                  onClick={() => handleCommentSubmit(update.id)}
                  disabled={!commentInputs[update.id]?.trim()}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
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

export default Home;