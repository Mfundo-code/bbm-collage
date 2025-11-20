// src/components/DashboardLayout.js
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout, canManagePosts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home', description: 'Daily mission updates' },
    { path: '/dashboard/suggestions', icon: '💡', label: 'Suggestions', description: 'Share your ideas' },
    { path: '/dashboard/announcements', icon: '📢', label: 'Announcements', description: 'Important notices' },
    { path: '/dashboard/testimonies', icon: '🙏', label: 'Testimonies', description: 'Share experiences' },
    { path: '/dashboard/sunday-services', icon: '⛪', label: 'Sunday Services', description: 'Worship services' },
    { path: '/dashboard/missionaries', icon: '🌍', label: 'Missionaries', description: 'Mission work updates' },
    { path: '/dashboard/alumni', icon: '🎓', label: 'Alumni', description: 'Graduate network' },
    { path: '/dashboard/homiletics', icon: '📖', label: 'Homiletics', description: 'Sermon resources' },
  ];

  const styles = {
    layout: {
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
    },
    sidebar: {
      width: isCollapsed ? '80px' : '280px',
      backgroundColor: '#1e293b',
      color: 'white',
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      flexShrink: 0,
    },
    sidebarHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
    },
    siteName: {
      fontSize: '1.1rem',
      fontWeight: '600',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap',
    },
    collapseBtn: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      color: '#cbd5e1',
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '0.25rem',
      borderRadius: '4px',
    },
    nav: {
      flex: 1,
      padding: '1rem 0',
      overflowY: 'auto',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      color: '#cbd5e1',
      textDecoration: 'none',
      transition: 'all 0.2s',
      borderLeft: '3px solid transparent',
    },
    navItemActive: {
      backgroundColor: '#334155',
      color: 'white',
      borderLeftColor: '#3b82f6',
    },
    navIcon: {
      fontSize: '1.25rem',
      minWidth: '24px',
      textAlign: 'center',
    },
    navLabel: {
      marginLeft: '0.75rem',
      fontWeight: '500',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap',
    },
    navDescription: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      marginTop: '0.25rem',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease',
    },
    userSection: {
      padding: '1.5rem',
      borderTop: '1px solid #334155',
      backgroundColor: '#0f172a',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease',
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      textTransform: 'capitalize',
    },
    logoutBtn: {
      width: '100%',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '0.75rem',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '0.9rem',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    topHeader: {
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '1rem 2rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    pageTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0,
    },
    content: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      backgroundColor: '#f8fafc',
    },
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>⛪</div>
          <div style={styles.siteName}>MBS Platform</div>
          <button 
            style={styles.collapseBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) ? styles.navItemActive : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = '#334155';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.navLabel}>{item.label}</div>
                {!isCollapsed && (
                  <div style={styles.navDescription}>{item.description}</div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {!isCollapsed && (
              <div style={styles.userDetails}>
                <div style={styles.userName}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={styles.userRole}>{user?.role}</div>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            {isCollapsed ? '🚪' : 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.topHeader}>
          <h1 style={styles.pageTitle}>
            {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
          </h1>
        </div>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;