// ============================================
// FILE: src/components/Layout.js
// ============================================
import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, isAdmin, isSecretary } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const styles = {
    layout: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f5f7fa',
    },
    header: {
      backgroundColor: '#2d3748',
      color: 'white',
      padding: '1rem 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '2rem',
      flexWrap: 'wrap',
    },
    siteTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: 'white',
      cursor: 'pointer',
    },
    nav: {
      display: 'flex',
      gap: '1.5rem',
      flex: '1',
      flexWrap: 'wrap',
    },
    navLink: {
      color: '#cbd5e0',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      transition: 'all 0.2s',
      fontWeight: '500',
      textDecoration: 'none',
      backgroundColor: 'transparent',
    },
    navLinkActive: {
      backgroundColor: '#4299e1',
      color: 'white',
    },
    navLinkHover: {
      backgroundColor: '#4a5568',
      color: 'white',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    userName: {
      fontWeight: '600',
      fontSize: '0.95rem',
    },
    userRole: {
      fontSize: '0.8rem',
      color: '#cbd5e0',
      textTransform: 'capitalize',
    },
    logoutBtn: {
      backgroundColor: '#fc8181',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1.2rem',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '1rem',
    },
    main: {
      flex: '1',
      maxWidth: '1400px',
      width: '100%',
      margin: '0 auto',
      padding: '2rem',
    },
    footer: {
      backgroundColor: '#2d3748',
      color: '#cbd5e0',
      padding: '1.5rem 2rem',
      textAlign: 'center',
      marginTop: 'auto',
    },
  };

  return (
    <div style={styles.layout}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.siteTitle} onClick={() => navigate('/dashboard')}>
            Mission Bible School
          </div>
          
          <nav style={styles.nav}>
            <Link 
              to="/dashboard" 
              style={{
                ...styles.navLink,
                ...(isActive('/dashboard') ? styles.navLinkActive : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard')) {
                  e.target.style.backgroundColor = styles.navLinkHover.backgroundColor;
                  e.target.style.color = styles.navLinkHover.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard')) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = styles.navLink.color;
                }
              }}
            >
              Dashboard
            </Link>
            <Link 
              to="/posts" 
              style={{
                ...styles.navLink,
                ...(isActive('/posts') ? styles.navLinkActive : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive('/posts')) {
                  e.target.style.backgroundColor = styles.navLinkHover.backgroundColor;
                  e.target.style.color = styles.navLinkHover.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/posts')) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = styles.navLink.color;
                }
              }}
            >
              Posts
            </Link>
            {(isAdmin() || isSecretary()) && (
              <Link 
                to="/users/create" 
                style={{
                  ...styles.navLink,
                  ...(isActive('/users/create') ? styles.navLinkActive : {})
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/users/create')) {
                    e.target.style.backgroundColor = styles.navLinkHover.backgroundColor;
                    e.target.style.color = styles.navLinkHover.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/users/create')) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = styles.navLink.color;
                  }
                }}
              >
                Create User
              </Link>
            )}
          </nav>
          
          <div style={styles.headerRight}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>
                {user?.firstName || user?.email}
              </span>
              <span style={styles.userRole}>{user?.role}</span>
            </div>
            <button 
              onClick={handleLogout} 
              style={styles.logoutBtn}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f56565'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#fc8181'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Mission Bible School. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
