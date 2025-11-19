// ============================================
// FILE: src/pages/CreateUser.js
// ============================================
import React, { useState } from 'react';
import { usersAPI } from '../services/api';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', role: 'student', contactPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await usersAPI.createUser(formData);
      setSuccess({ message: response.data.message, email: formData.email });
      setFormData({ email: '', firstName: '', lastName: '', role: 'student', contactPhone: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    page: { maxWidth: '700px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', color: '#2d3748', marginBottom: '0.5rem' },
    subtitle: { color: '#718096', fontSize: '1.1rem' },
    container: { background: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    alert: { padding: '1.25rem', borderRadius: '8px', border: '1px solid' },
    alertError: { backgroundColor: '#fff5f5', color: '#c53030', borderColor: '#feb2b2' },
    alertSuccess: { backgroundColor: '#f0fff4', color: '#22543d', borderColor: '#9ae6b4' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    label: { color: '#2d3748', fontWeight: '600', fontSize: '0.95rem' },
    input: { padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' },
    select: { padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' },
    hint: { color: '#718096', fontSize: '0.85rem', margin: 0 },
    infoBox: { backgroundColor: '#ebf8ff', borderLeft: '4px solid #4299e1', padding: '1.25rem', borderRadius: '6px', color: '#2c5282' },
    actions: { paddingTop: '1rem', borderTop: '1px solid #e2e8f0' },
    btnCreate: { width: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '600', cursor: 'pointer' },
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
              <strong style={{display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem'}}>✓ User Created Successfully!</strong>
              <p style={{margin: '0.5rem 0'}}>{success.message}</p>
              <p style={{background: 'white', padding: '0.75rem', borderRadius: '6px', marginTop: '0.75rem'}}>
                Welcome email sent to: <strong>{success.email}</strong>
              </p>
            </div>
          )}

          <div style={styles.formRow}>
            <div style={styles.field}>
              <label htmlFor="firstName" style={styles.label}>First Name *</label>
              <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} placeholder="Enter first name" required style={styles.input} />
            </div>
            <div style={styles.field}>
              <label htmlFor="lastName" style={styles.label}>Last Name *</label>
              <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} placeholder="Enter last name" required style={styles.input} />
            </div>
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>Email Address *</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="user@example.com" required style={styles.input} />
          </div>

          <div style={styles.field}>
            <label htmlFor="role" style={styles.label}>Role *</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required style={styles.select}>
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
            <input id="contactPhone" name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleChange} placeholder="+1 (555) 123-4567" style={styles.input} />
          </div>

          <div style={styles.infoBox}>
            <strong style={{display: 'block', marginBottom: '0.75rem', color: '#2b6cb0'}}>ℹ️ Important Information:</strong>
            <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
              <li style={{margin: '0.5rem 0', lineHeight: '1.5'}}>A temporary password will be automatically generated</li>
              <li style={{margin: '0.5rem 0', lineHeight: '1.5'}}>The user will receive a welcome email with login credentials</li>
              <li style={{margin: '0.5rem 0', lineHeight: '1.5'}}>A one-time auto-login link will be included (valid for 24 hours)</li>
              <li style={{margin: '0.5rem 0', lineHeight: '1.5'}}>Users should change their password after first login</li>
            </ul>
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={submitting} style={styles.btnCreate}>
              {submitting ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;