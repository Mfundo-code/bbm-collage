// ============================================
// FILE: src/pages/PostDetail.js
// (Due to length constraints, key parts shown)
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI, interactionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canManagePosts } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostData();
  }, [id]);

  const fetchPostData = async () => {
    try {
      const [postRes, commentsRes, likesRes] = await Promise.all([
        postsAPI.getPost(id),
        interactionsAPI.getComments('post', id),
        interactionsAPI.getLikes('post', id)
      ]);

      setPost(postRes.data);
      setComments(commentsRes.data.comments);
      setLikes(likesRes.data.likes);
      setLiked(likesRes.data.likes.some(l => l.user.id === user?.id));
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await interactionsAPI.toggleLike('post', id);
      setLiked(response.data.liked);
      const likesRes = await interactionsAPI.getLikes('post', id);
      setLikes(likesRes.data.likes);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await interactionsAPI.addComment({
        parentType: 'post',
        parentId: parseInt(id),
        text: commentText,
        attachments: []
      });

      setCommentText('');
      const commentsRes = await interactionsAPI.getComments('post', id);
      setComments(commentsRes.data.comments);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await interactionsAPI.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsAPI.deletePost(id);
      navigate('/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    backLink: {
      color: '#667eea',
      fontWeight: '600',
      textDecoration: 'none',
    },
    actions: {
      display: 'flex',
      gap: '1rem',
    },
    content: {
      background: 'white',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      position: 'relative',
    },
    title: {
      fontSize: '2.5rem',
      color: '#2d3748',
      marginBottom: '1.5rem',
      lineHeight: '1.2',
    },
    body: {
      color: '#2d3748',
      fontSize: '1.1rem',
      lineHeight: '1.8',
      marginBottom: '2rem',
    },
    likeBtn: {
      background: 'white',
      border: '2px solid #e2e8f0',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#4a5568',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem',
    },
    liked: {
      backgroundColor: '#fff5f5',
      borderColor: '#fc8181',
      color: '#fc8181',
    },
    commentsSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    commentForm: {
      marginBottom: '2rem',
    },
    textarea: {
      width: '100%',
      padding: '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      resize: 'vertical',
      marginBottom: '1rem',
      fontFamily: 'inherit',
    },
    submitBtn: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '1rem',
    },
    comment: {
      display: 'flex',
      gap: '1rem',
      padding: '1.5rem',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
      marginBottom: '1rem',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      flexShrink: '0',
    },
  };

  if (loading) return <div style={{textAlign: 'center', padding: '4rem', color: '#718096'}}>Loading...</div>;
  if (!post) return <div style={{textAlign: 'center', padding: '4rem', color: '#718096'}}>Post not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/posts" style={styles.backLink}>← Back to Posts</Link>
        {canManagePosts() && (
          <div style={styles.actions}>
            <Link to={`/posts/edit/${post.id}`} style={{...styles.backLink}}>✏️ Edit</Link>
            <button onClick={handleDeletePost} style={{...styles.backLink, background: 'none', border: 'none', cursor: 'pointer', color: '#f56565'}}>
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      <div style={styles.content}>
        <h1 style={styles.title}>{post.title || 'Untitled Post'}</h1>
        <div style={styles.body}>
          {post.body?.split('\n').map((para, i) => <p key={i} style={{marginBottom: '1rem'}}>{para}</p>)}
        </div>
        <button 
          onClick={handleLike}
          style={{...styles.likeBtn, ...(liked ? styles.liked : {})}}
        >
          {liked ? '❤️' : '🤍'} {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
        </button>
      </div>

      {post.allowComments && (
        <div style={styles.commentsSection}>
          <h2 style={{marginBottom: '1.5rem'}}>Comments</h2>
          <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows="3"
              disabled={submitting}
              style={styles.textarea}
            />
            <button type="submit" disabled={submitting || !commentText.trim()} style={styles.submitBtn}>
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {comments.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: '#718096'}}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} style={styles.comment}>
                <div style={styles.avatar}>
                  {comment.author.firstName?.[0]}{comment.author.lastName?.[0]}
                </div>
                <div style={{flex: 1}}>
                  <div style={{marginBottom: '0.5rem'}}>
                    <span style={{fontWeight: '700', color: '#2d3748'}}>
                      {comment.author.firstName} {comment.author.lastName}
                    </span>
                    <span style={{color: '#718096', fontSize: '0.85rem', marginLeft: '1rem'}}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{color: '#4a5568', lineHeight: '1.6', marginBottom: '0.5rem'}}>
                    {comment.text}
                  </p>
                  {comment.author.id === user?.id && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{background: 'none', border: 'none', color: '#f56565', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer'}}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PostDetail;