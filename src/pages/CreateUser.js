import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', role: 'student', contactPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setShowCredentials(false);
    setSubmitting(true);

    try {
      const response = await usersAPI.createUser(formData);
      setSuccess(response.data);
      setShowCredentials(true);
      setFormData({ email: '', firstName: '', lastName: '', role: 'student', contactPhone: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const styles = {
    page: { 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: isMobile ? '1rem' : '0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    },
    header: { 
      marginBottom: isMobile ? '1.5rem' : '2rem',
      textAlign: 'center',
      width: '100%'
    },
    title: { 
      fontSize: isMobile ? '1.5rem' : '2rem', 
      color: '#2d3748', 
      marginBottom: '0.5rem',
      textAlign: 'center'
    },
    subtitle: { 
      color: '#718096', 
      fontSize: isMobile ? '0.9rem' : '1.1rem',
      textAlign: 'center'
    },
    container: { 
      background: 'white', 
      borderRadius: '12px', 
      padding: isMobile ? '1.5rem' : '2.5rem', 
      boxShadow: isMobile ? '0 1px 4px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.1)',
      width: '100%'
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '1rem' : '1.5rem'
    },
    alert: { 
      padding: isMobile ? '0.75rem' : '1.25rem', 
      borderRadius: '8px', 
      border: '1px solid',
      textAlign: isMobile ? 'center' : 'left'
    },
    alertError: { backgroundColor: '#fff5f5', color: '#c53030', borderColor: '#feb2b2' },
    alertSuccess: { backgroundColor: '#f0fff4', color: '#22543d', borderColor: '#9ae6b4' },
    formRow: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
      gap: isMobile ? '0.75rem' : '1rem' 
    },
    field: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '0.25rem' : '0.5rem',
      alignItems: isMobile ? 'center' : 'flex-start'
    },
    label: { 
      color: '#2d3748', 
      fontWeight: '600', 
      fontSize: isMobile ? '0.85rem' : '0.95rem',
      textAlign: isMobile ? 'center' : 'left',
      width: isMobile ? '100%' : 'auto'
    },
    input: { 
      padding: isMobile ? '0.65rem 0.85rem' : '0.75rem 1rem', 
      border: isMobile ? '1px solid #e2e8f0' : '2px solid #e2e8f0', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.95rem' : '1rem',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    },
    select: { 
      padding: isMobile ? '0.65rem 0.85rem' : '0.75rem 1rem', 
      border: isMobile ? '1px solid #e2e8f0' : '2px solid #e2e8f0', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.95rem' : '1rem',
      width: '100%'
    },
    hint: { 
      color: '#718096', 
      fontSize: isMobile ? '0.75rem' : '0.85rem', 
      margin: 0,
      textAlign: isMobile ? 'center' : 'left'
    },
    infoBox: { 
      backgroundColor: '#ebf8ff', 
      borderLeft: isMobile ? '3px solid #4299e1' : '4px solid #4299e1', 
      padding: isMobile ? '0.75rem' : '1.25rem', 
      borderRadius: '6px', 
      color: '#2c5282',
      textAlign: isMobile ? 'center' : 'left'
    },
    actions: { 
      paddingTop: '1rem', 
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'center'
    },
    btnCreate: { 
      width: isMobile ? '100%' : '100%', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.85rem 1.5rem' : '1rem 2rem', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.95rem' : '1.05rem', 
      fontWeight: '600', 
      cursor: 'pointer',
      maxWidth: isMobile ? '100%' : '100%'
    },
    credentialsBox: { 
      backgroundColor: '#f7fafc', 
      border: isMobile ? '1px dashed #cbd5e0' : '2px dashed #cbd5e0', 
      borderRadius: '8px', 
      padding: isMobile ? '1rem' : '1.5rem', 
      marginTop: '1rem' 
    },
    credentialItem: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'center' : 'center', 
      padding: isMobile ? '0.5rem' : '0.75rem', 
      backgroundColor: 'white', 
      borderRadius: '6px', 
      marginBottom: '0.5rem', 
      border: '1px solid #e2e8f0',
      gap: isMobile ? '0.5rem' : '0'
    },
    credentialLabel: { 
      fontWeight: '600', 
      color: '#2d3748', 
      minWidth: isMobile ? '100%' : '140px',
      textAlign: isMobile ? 'center' : 'left',
      fontSize: isMobile ? '0.8rem' : '0.9rem'
    },
    credentialValue: { 
      flex: 1, 
      fontFamily: 'monospace', 
      fontSize: isMobile ? '0.75rem' : '0.9rem', 
      color: '#4a5568', 
      wordBreak: 'break-all',
      textAlign: isMobile ? 'center' : 'left',
      padding: isMobile ? '0.25rem 0' : '0'
    },
    copyBtn: { 
      backgroundColor: '#4299e1', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.4rem 0.75rem' : '0.5rem 1rem', 
      borderRadius: '4px', 
      cursor: 'pointer', 
      marginLeft: isMobile ? '0' : '1rem', 
      fontSize: isMobile ? '0.75rem' : '0.85rem',
      width: isMobile ? '100%' : 'auto',
      marginTop: isMobile ? '0.25rem' : '0'
    },
    sectionTitle: { 
      fontSize: isMobile ? '1rem' : '1.25rem', 
      fontWeight: '600', 
      color: '#2d3748', 
      marginBottom: '1rem', 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center', 
      gap: '0.5rem',
      textAlign: 'center'
    },
    infoList: {
      margin: 0, 
      paddingLeft: isMobile ? '1rem' : '1.5rem',
      textAlign: isMobile ? 'left' : 'left'
    },
    infoListItem: {
      margin: '0.5rem 0', 
      lineHeight: '1.5',
      fontSize: isMobile ? '0.85rem' : '1rem'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create New User</h1>
        <p style={styles.subtitle}>Add a new member to the platform</p>
      </div>

      <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={{...styles.alert, ...styles.alertError}}>{error}</div>}

          {success && (
            <div style={{...styles.alert, ...styles.alertSuccess}}>
              <strong style={{display: 'block', marginBottom: '0.5rem', fontSize: isMobile ? '1rem' : '1.1rem', textAlign: 'center'}}>
                ✓ User Created Successfully!
              </strong>
              <p style={{margin: '0.5rem 0', textAlign: 'center'}}>{success.message}</p>
              <p style={{margin: '0.5rem 0', fontStyle: 'italic', textAlign: 'center'}}>
                <strong>Email Status:</strong> {success.emailStatus}
              </p>
              
              {showCredentials && (
                <div style={styles.credentialsBox}>
                  <h3 style={styles.sectionTitle}>
                    <span>📋 User Credentials</span>
                    <span style={{fontSize: isMobile ? '0.75rem' : '0.9rem', fontWeight: 'normal', color: '#718096'}}>
                      (Copy and send to user if email failed)
                    </span>
                  </h3>
                  
                  <div style={styles.credentialItem}>
                    <span style={styles.credentialLabel}>Email:</span>
                    <span style={styles.credentialValue}>{success.user.email}</span>
                    <button 
                      type="button" 
                      style={styles.copyBtn}
                      onClick={() => copyToClipboard(success.user.email)}
                    >
                      Copy Email
                    </button>
                  </div>

                  <div style={styles.credentialItem}>
                    <span style={styles.credentialLabel}>Temporary Password:</span>
                    <span style={styles.credentialValue}>{success.credentials.temporaryPassword}</span>
                    <button 
                      type="button" 
                      style={styles.copyBtn}
                      onClick={() => copyToClipboard(success.credentials.temporaryPassword)}
                    >
                      Copy Password
                    </button>
                  </div>

                  <div style={styles.credentialItem}>
                    <span style={styles.credentialLabel}>Auto-login Token:</span>
                    <span style={styles.credentialValue}>{success.credentials.loginToken}</span>
                    <button 
                      type="button" 
                      style={styles.copyBtn}
                      onClick={() => copyToClipboard(success.credentials.loginToken)}
                    >
                      Copy Token
                    </button>
                  </div>

                  <div style={styles.credentialItem}>
                    <span style={styles.credentialLabel}>Auto-login URL:</span>
                    <span style={styles.credentialValue}>{success.credentials.autoLoginUrl}</span>
                    <button 
                      type="button" 
                      style={styles.copyBtn}
                      onClick={() => copyToClipboard(success.credentials.autoLoginUrl)}
                    >
                      Copy URL
                    </button>
                  </div>

                  <div style={{...styles.credentialItem, backgroundColor: '#fffaf0', borderColor: '#fed7aa'}}>
                    <span style={styles.credentialLabel}>Token Expires:</span>
                    <span style={styles.credentialValue}>
                      {formatDate(success.credentials.tokenExpiresAt)}
                    </span>
                  </div>

                  <div style={{marginTop: '1rem', padding: isMobile ? '0.75rem' : '1rem', backgroundColor: '#fff5f5', borderRadius: '6px', border: '1px solid #fed7d7', textAlign: 'center'}}>
                    <strong style={{color: '#c53030'}}>⚠️ Important:</strong>
                    <p style={{margin: '0.5rem 0 0 0', fontSize: isMobile ? '0.8rem' : '0.9rem', color: '#744210'}}>
                      {success.instructions} The auto-login token is valid for 24 hours. 
                      User should change their password after first login.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={styles.formRow}>
            <div style={styles.field}>
              <label htmlFor="firstName" style={styles.label}>First Name *</label>
              <input 
                id="firstName" 
                name="firstName" 
                type="text" 
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="Enter first name" 
                required 
                style={styles.input} 
              />
            </div>
            <div style={styles.field}>
              <label htmlFor="lastName" style={styles.label}>Last Name *</label>
              <input 
                id="lastName" 
                name="lastName" 
                type="text" 
                value={formData.lastName} 
                onChange={handleChange} 
                placeholder="Enter last name" 
                required 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email Address *</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="user@example.com" 
              required 
              style={styles.input} 
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="role" style={styles.label}>Role *</label>
            <select 
              id="role" 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              required 
              style={styles.select}
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="missionary">Missionary</option>
              <option value="pastor">Pastor/Lecturer</option>
              <option value="secretary">Secretary/Staff</option>
              <option value="admin">Administrator</option>
            </select>
            <p style={styles.hint}>Select the appropriate role for this user</p>
          </div>

          <div style={styles.field}>
            <label htmlFor="contactPhone" style={styles.label}>Contact Phone</label>
            <input 
              id="contactPhone" 
              name="contactPhone" 
              type="tel" 
              value={formData.contactPhone} 
              onChange={handleChange} 
              placeholder="+1 (555) 123-4567" 
              style={styles.input} 
            />
          </div>

          <div style={styles.infoBox}>
            <strong style={{display: 'block', marginBottom: '0.75rem', color: '#2b6cb0', textAlign: 'center'}}>ℹ️ Important Information:</strong>
            <ul style={styles.infoList}>
              <li style={styles.infoListItem}>A temporary password will be automatically generated</li>
              <li style={styles.infoListItem}>The user will receive a welcome email with login credentials</li>
              <li style={styles.infoListItem}>A one-time auto-login link will be included (valid for 24 hours)</li>
              <li style={styles.infoListItem}>Full credentials will be shown for manual sharing if email fails</li>
              <li style={styles.infoListItem}>Users should change their password after first login</li>
            </ul>
          </div>

          <div style={styles.actions}>
            <button 
              type="submit" 
              disabled={submitting} 
              style={styles.btnCreate}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {submitting ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;