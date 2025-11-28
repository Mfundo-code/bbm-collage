// src/components/DashboardLayout.js
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout, canManagePosts } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [learningDropdown, setLearningDropdown] = useState(false);

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
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setLearningDropdown(false);
  };

  // Unified, subtle palette
  const PALETTE = {
    bgSidebar: '#0f1724', // deep charcoal
    bgMain: '#f7faf9', // very light background
    primary: '#0ea5a4', // teal
    primaryDark: '#0b8a7f',
    mutedText: '#94a3b8',
    card: '#ffffff',
    logout: '#374151',
    logoutHover: '#1f2937',
  };

  const styles = {
    layout: {
      height: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: PALETTE.bgMain,
    },
    sidebar: {
      width: isCollapsed ? '80px' : '280px',
      backgroundColor: PALETTE.bgSidebar,
      color: 'white',
      transition: 'width 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      flexShrink: 0,
      boxShadow: '2px 0 8px rgba(2,6,23,0.2)'
    },
    sidebarHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
    },
    siteName: {
      fontSize: '1.05rem',
      fontWeight: '600',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap',
      color: 'rgba(255,255,255,0.92)'
    },
    collapseBtn: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      color: 'rgba(203,213,225,0.9)',
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
      color: 'rgba(203,213,225,0.9)',
      textDecoration: 'none',
      transition: 'all 0.15s ease',
      borderLeft: '3px solid transparent',
      borderRadius: '8px',
      margin: '0.25rem 0',
    },
    navItemActive: {
      backgroundColor: 'rgba(14,165,164,0.08)',
      color: PALETTE.primary,
      borderLeftColor: PALETTE.primary,
    },
    navIcon: {
      fontSize: '1.25rem',
      minWidth: '24px',
      textAlign: 'center',
      opacity: 0.95,
    },
    navLabel: {
      marginLeft: '0.75rem',
      fontWeight: '500',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap',
      color: 'rgba(255,255,255,0.95)'
    },
    navDescription: {
      fontSize: '0.75rem',
      color: PALETTE.mutedText,
      marginTop: '0.25rem',
      opacity: isCollapsed ? 0 : 1,
      transition: 'opacity 0.3s ease',
    },
    userSection: {
      padding: '1.5rem',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      backgroundColor: 'transparent',
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
      width: '44px',
      height: '44px',
      borderRadius: '10px',
      background: PALETTE.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '0.95rem',
      color: 'white',
      boxShadow: '0 6px 12px rgba(14,165,164,0.12)'
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontWeight: '700',
      fontSize: '0.95rem',
      color: 'rgba(255,255,255,0.95)'
    },
    userRole: {
      fontSize: '0.75rem',
      color: PALETTE.mutedText,
      textTransform: 'capitalize',
    },
    logoutBtn: {
      width: '100%',
      backgroundColor: PALETTE.logout,
      color: 'white',
      border: 'none',
      padding: '0.65rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
      fontSize: '0.9rem',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: PALETTE.bgMain,
    },
    /* UPDATED: align buttons to the right and use the unified primary */
    buttonBar: {
      display: 'flex',
      gap: '1rem',
      padding: '1.25rem 2rem',
      backgroundColor: PALETTE.bgMain,
      borderBottom: '1px solid rgba(16,24,32,0.04)',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    buttonContainer: {
      position: 'relative',
    },
    mainButton: {
      backgroundColor: PALETTE.primary,
      color: 'white',
      border: 'none',
      padding: '0.6rem 1.2rem',
      borderRadius: '10px',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: 'transform 0.08s ease, box-shadow 0.12s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 8px 20px rgba(14,165,164,0.08)'
    },
    /* UPDATED: position dropdown to align with the right edge */
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 'auto',
      right: 0,
      backgroundColor: PALETTE.card,
      border: '1px solid rgba(2,6,23,0.06)',
      borderRadius: '8px',
      boxShadow: '0 6px 18px rgba(2,6,23,0.06)',
      zIndex: 1000,
      minWidth: '200px',
      marginTop: '0.5rem',
    },
    dropdownItem: {
      display: 'block',
      width: '100%',
      padding: '0.75rem 1rem',
      border: 'none',
      backgroundColor: 'transparent',
      textAlign: 'left',
      cursor: 'pointer',
      fontSize: '0.95rem',
      color: '#0f1724',
      transition: 'background-color 0.12s',
    },
    content: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto',
      backgroundColor: PALETTE.bgMain,
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
                  e.currentTarget.style.backgroundColor = 'rgba(14,165,164,0.04)';
                  e.currentTarget.style.color = PALETTE.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(203,213,225,0.9)';
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
            onMouseEnter={(e) => e.target.style.backgroundColor = PALETTE.logoutHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = PALETTE.logout}
          >
            {isCollapsed ? '🚪' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Button Bar */}
        <div style={styles.buttonBar}>
          <div style={styles.buttonContainer}>
            <button 
              style={styles.mainButton}
              onClick={() => setLearningDropdown(!learningDropdown)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(14,165,164,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(14,165,164,0.08)'; }}
            >
              📚 Learning {learningDropdown ? '▲' : '▼'}
            </button>
            {learningDropdown && (
              <div style={styles.dropdown}>
                <button 
                  style={styles.dropdownItem}
                  onClick={() => handleNavigation('/dashboard/nqf5')}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f6f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  NQF 5
                </button>
                <button 
                  style={styles.dropdownItem}
                  onClick={() => handleNavigation('/dashboard/continues-learning')}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f6f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Continues Learning
                </button>
              </div>
            )}
          </div>
          
          <button 
            style={styles.mainButton}
            onClick={() => handleNavigation('/dashboard/outreaches')}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(14,165,164,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(14,165,164,0.08)'; }}
          >
            🌍 Outreaches
          </button>
          
          <button 
            style={styles.mainButton}
            onClick={() => handleNavigation('/dashboard/mentorship')}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(14,165,164,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(14,165,164,0.08)'; }}
          >
            👥 Mentorship
          </button>
          
          <button 
            style={styles.mainButton}
            onClick={() => handleNavigation('/dashboard/prayer-wall')}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(14,165,164,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(14,165,164,0.08)'; }}
          >
            🙏 Prayer Wall
          </button>
        </div>

        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
