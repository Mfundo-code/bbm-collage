// ============================================
// FILE: src/pages/Posts.js
// ============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [postType, setPostType] = useState('');
  const { canManagePosts } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [page, postType]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 10 };
      if (postType) params.postType = postType;
      
      const response = await postsAPI.getPosts(params);
      setPosts(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setPostType(type);
    setPage(1);
  };

  const styles = {
    page: {
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    headerContent: {
      flex: '1',
    },
    title: {
      fontSize: '2rem',
      color: '#2d3748',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: '#718096',
      fontSize: '1.1rem',
    },
    createBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'inline-block',
    },
    filters: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    filterBtn: {
      padding: '0.5rem 1.25rem',
      border: '2px solid #e2e8f0',
      background: 'white',
      borderRadius: '8px',
      fontWeight: '600',
      color: '#4a5568',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '1rem',
    },
    filterBtnActive: {
      backgroundColor: '#667eea',
      borderColor: '#667eea',
      color: 'white',
    },
    loading: {
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'white',
      borderRadius: '12px',
      color: '#718096',
    },
    postsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    postCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'box-shadow 0.2s',
      position: 'relative',
    },
    postLink: {
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
      marginBottom: '1rem',
    },
    postTitle: {
      fontSize: '1.5rem',
      color: '#2d3748',
      transition: 'color 0.2s',
    },
    postMeta: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      fontSize: '0.9rem',
      color: '#718096',
    },
    postType: {
      backgroundColor: '#e6f2ff',
      color: '#2b6cb0',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    postExcerpt: {
      color: '#4a5568',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
    },
    postFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0',
    },
    postStats: {
      display: 'flex',
      gap: '1.5rem',
      color: '#718096',
      fontSize: '0.9rem',
    },
    editLink: {
      color: '#667eea',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'color 0.2s',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '2rem',
      marginTop: '3rem',
      padding: '1.5rem',
      background: 'white',
      borderRadius: '12px',
    },
    paginationBtn: {
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '1rem',
    },
    paginationBtnDisabled: {
      backgroundColor: '#cbd5e0',
      cursor: 'not-allowed',
    },
    paginationInfo: {
      color: '#4a5568',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>All Posts</h1>
          <p style={styles.subtitle}>Browse announcements and updates</p>
        </div>
        {canManagePosts() && (
          <Link 
            to="/posts/create" 
            style={styles.createBtn}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ➕ Create Post
          </Link>
        )}
      </div>

      <div style={styles.filters}>
        {['', 'announcement', 'event', 'news'].map((type) => (
          <button 
            key={type}
            onClick={() => handleTypeChange(type)}
            style={{
              ...styles.filterBtn,
              ...(postType === type ? styles.filterBtnActive : {})
            }}
            onMouseEnter={(e) => {
              if (postType !== type) {
                e.target.style.borderColor = '#667eea';
                e.target.style.color = '#667eea';
              }
            }}
            onMouseLeave={(e) => {
              if (postType !== type) {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#4a5568';
              }
            }}
          >
            {type === '' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div style={styles.loading}>
          <p>No posts found</p>
        </div>
      ) : (
        <>
          <div style={styles.postsList}>
            {posts.map(post => (
              <div 
                key={post.id} 
                style={styles.postCard}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              >
                <Link to={`/posts/${post.id}`} style={styles.postLink}>
                  <h2 style={styles.postTitle}>{post.title || 'Untitled'}</h2>
                </Link>
                
                <div style={styles.postMeta}>
                  <span style={styles.postType}>{post.postType}</span>
                  <span>{post.author.firstName} {post.author.lastName}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <p style={styles.postExcerpt}>
                  {post.body?.substring(0, 200)}...
                </p>

                <div style={styles.postFooter}>
                  <div style={styles.postStats}>
                    <span>❤️ {post.likeCount} likes</span>
                    <span>💬 {post.commentCount} comments</span>
                  </div>
                  
                  {canManagePosts() && (
                    <Link 
                      to={`/posts/edit/${post.id}`} 
                      style={styles.editLink}
                      onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
                      onMouseLeave={(e) => e.target.style.color = '#667eea'}
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  ...styles.paginationBtn,
                  ...(page === 1 ? styles.paginationBtnDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (page !== 1) e.target.style.backgroundColor = '#5a67d8';
                }}
                onMouseLeave={(e) => {
                  if (page !== 1) e.target.style.backgroundColor = '#667eea';
                }}
              >
                ← Previous
              </button>
              
              <span style={styles.paginationInfo}>
                Page {page} of {totalPages}
              </span>
              
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  ...styles.paginationBtn,
                  ...(page === totalPages ? styles.paginationBtnDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (page !== totalPages) e.target.style.backgroundColor = '#5a67d8';
                }}
                onMouseLeave={(e) => {
                  if (page !== totalPages) e.target.style.backgroundColor = '#667eea';
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Posts;
