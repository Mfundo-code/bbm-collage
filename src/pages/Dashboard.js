// ============================================
// FILE: src/pages/Dashboard.js
// ============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, canManagePosts } = useAuth();

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const response = await postsAPI.getPosts({ page: 1, pageSize: 5 });
      setPosts(response.data.items);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    dashboard: {
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      marginBottom: '2rem',
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
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '3rem',
    },
    statCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    statIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.8rem',
      flexShrink: '0',
    },
    statContent: {
      flex: '1',
    },
    statLabel: {
      color: '#718096',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#2d3748',
    },
    statText: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2d3748',
      textTransform: 'capitalize',
    },
    section: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      color: '#2d3748',
    },
    viewAllLink: {
      color: '#667eea',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'color 0.2s',
    },
    loading: {
      textAlign: 'center',
      padding: '3rem',
      color: '#718096',
    },
    empty: {
      textAlign: 'center',
      padding: '3rem',
      color: '#718096',
    },
    createBtnLink: {
      display: 'inline-block',
      marginTop: '1rem',
      backgroundColor: '#667eea',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'background-color 0.2s',
    },
    postsPreview: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    postCard: {
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1.5rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      position: 'relative',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
    },
    pinnedBadge: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      backgroundColor: '#fef5e7',
      color: '#d97706',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
    },
    postTitle: {
      color: '#2d3748',
      fontSize: '1.2rem',
      marginBottom: '0.75rem',
    },
    postBody: {
      color: '#4a5568',
      lineHeight: '1.6',
      marginBottom: '1rem',
    },
    postMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#718096',
      fontSize: '0.9rem',
      marginBottom: '0.75rem',
    },
    postAuthor: {
      fontWeight: '600',
    },
    postStats: {
      display: 'flex',
      gap: '1.5rem',
      color: '#718096',
      fontSize: '0.9rem',
    },
    quickActions: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    quickActionsTitle: {
      fontSize: '1.5rem',
      color: '#2d3748',
      marginBottom: '1.5rem',
    },
    actionButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    },
    actionBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      textAlign: 'center',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'block',
    },
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome back, {user?.firstName || user?.email}!</h1>
        <p style={styles.subtitle}>Here's what's happening in your community</p>
      </div>

      <div style={styles.statsGrid}>
        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{...styles.statIcon, backgroundColor: '#667eea'}}>📝</div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Recent Posts</h3>
            <p style={styles.statNumber}>{posts.length}</p>
          </div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{...styles.statIcon, backgroundColor: '#48bb78'}}>👥</div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Your Role</h3>
            <p style={styles.statText}>{user?.role}</p>
          </div>
        </div>

        <div 
          style={styles.statCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }}
        >
          <div style={{...styles.statIcon, backgroundColor: '#ed8936'}}>⭐</div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Status</h3>
            <p style={styles.statText}>Active</p>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Announcements</h2>
          <Link 
            to="/posts" 
            style={styles.viewAllLink}
            onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
            onMouseLeave={(e) => e.target.style.color = '#667eea'}
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>
            <p>No posts yet</p>
            {canManagePosts() && (
              <Link 
                to="/posts/create" 
                style={styles.createBtnLink}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5a67d8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
              >
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <div style={styles.postsPreview}>
            {posts.map(post => (
              <Link 
                to={`/posts/${post.id}`} 
                key={post.id} 
                style={styles.postCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {post.pinned && <span style={styles.pinnedBadge}>📌 Pinned</span>}
                <h3 style={styles.postTitle}>{post.title || 'Untitled Post'}</h3>
                <p style={styles.postBody}>
                  {post.body?.substring(0, 150)}...
                </p>
                <div style={styles.postMeta}>
                  <span style={styles.postAuthor}>
                    By {post.author.firstName} {post.author.lastName}
                  </span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.postStats}>
                  <span>❤️ {post.likeCount}</span>
                  <span>💬 {post.commentCount}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {canManagePosts() && (
        <div style={styles.quickActions}>
          <h2 style={styles.quickActionsTitle}>Quick Actions</h2>
          <div style={styles.actionButtons}>
            <Link 
              to="/posts/create" 
              style={styles.actionBtn}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ➕ Create New Post
            </Link>
            <Link 
              to="/users/create" 
              style={styles.actionBtn}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              👤 Add New User
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;