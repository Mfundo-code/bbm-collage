import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollmentYears, setEnrollmentYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [classYears, setClassYears] = useState([]);
  const [filters, setFilters] = useState({
    program: '',
    classYear: '',
    enrollmentYear: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    contactPhone: '',
    profilePhoto: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    graduationDate: '',
    program: '',
    classYear: '',
    tags: [],
    notes: ''
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    contactPhone: '',
    profilePhoto: '',
    enrollmentDate: '',
    graduationDate: '',
    program: '',
    classYear: '',
    tags: [],
    notes: ''
  });

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    fetchStudents();
    fetchFilters();
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getStudents(filters);
      setStudents(response.data.items || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [enrollmentRes, programsRes, classYearsRes] = await Promise.all([
        studentsAPI.getEnrollmentYears(),
        studentsAPI.getPrograms(),
        studentsAPI.getClassYears()
      ]);
      setEnrollmentYears(enrollmentRes.data || []);
      setPrograms(programsRes.data || []);
      setClassYears(classYearsRes.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleFileUpload = async (e, formType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const url = await fileUpload.uploadFile(file);

      if (formType === 'create') {
        setCreateFormData(prev => ({ ...prev, profilePhoto: url }));
      } else {
        setEditFormData(prev => ({ ...prev, profilePhoto: url }));
      }

      setSuccess('Photo uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await studentsAPI.createStudent(createFormData);

      const creds = response.data?.credentials;
      if (creds) {
        setCredentials({ 
          email: creds.email, 
          password: creds.temporaryPassword,
          autoLoginUrl: creds.autoLoginUrl
        });
      }

      setSuccess('Student created successfully!');
      setShowCreateForm(false);
      fetchStudents();
      setCreateFormData({
        email: '', firstName: '', lastName: '', contactPhone: '', profilePhoto: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        graduationDate: '', program: '', classYear: '',
        tags: [], notes: ''
      });

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await studentsAPI.updateStudent(selectedStudent.user.id, editFormData);
      setSuccess('Student updated successfully!');
      setShowEditForm(false);
      fetchStudents();
      setSelectedStudent(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditForm = (student) => {
    setEditFormData({
      firstName: student.user.firstName || '',
      lastName: student.user.lastName || '',
      contactPhone: student.user.contactPhone || '',
      profilePhoto: student.user.profilePhoto || '',
      enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : '',
      graduationDate: student.graduationDate ? student.graduationDate.split('T')[0] : '',
      program: student.program || '',
      classYear: student.classYear || '',
      tags: student.tags || [],
      notes: student.notes || ''
    });
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentsAPI.deleteStudent(userId);
      setSuccess('Student deleted successfully');
      fetchStudents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  const handleFollow = async (studentId) => {
    try {
      await studentsAPI.followStudent(studentId);
      fetchStudents();
    } catch (error) {
      console.error('Error following student:', error);
    }
  };

  const handleUnfollow = async (studentId) => {
    try {
      await studentsAPI.unfollowStudent(studentId);
      fetchStudents();
    } catch (error) {
      console.error('Error unfollowing student:', error);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'secretary' || user?.role === 'pastor';
  const canEdit = (student) => isAdmin || user?.id === student.user.id;

  const copyCredentials = async () => {
    if (!credentials) return;
    const payload = `Email: ${credentials.email}\nPassword: ${credentials.password}\n\nAuto-login URL: ${credentials.autoLoginUrl}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      } else {
        const ta = document.createElement('textarea');
        ta.value = payload;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied('both');
      setTimeout(() => setCopied(''), 2500);
    } catch (err) {
      console.error('Copy failed', err);
      setError('Unable to copy credentials to clipboard');
    }
  };

  const openView = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const addTag = (formType, tag) => {
    if (!tag.trim()) return;
    if (formType === 'create') {
      setCreateFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (formType, index) => {
    if (formType === 'create') {
      setCreateFormData(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    }
  };

  const getStudentStatus = (student) => {
    if (student.graduationDate && new Date(student.graduationDate) <= new Date()) {
      return 'Graduated';
    }
    return 'Active';
  };

  // Responsive styles
  const styles = {
    page: { 
      maxWidth: '1200px', 
      margin: isMobile ? '1rem auto' : '2rem auto', 
      width: isMobile ? '92%' : '95%', 
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial' 
    },
    header: { 
      marginBottom: isMobile ? '1rem' : '1.5rem', 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between', 
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '1rem' : '0'
    },
    headerLeft: { flex: 1 },
    title: { 
      fontSize: isMobile ? '1.5rem' : '1.9rem', 
      color: '#0f172a', 
      margin: 0 
    },
    subtitle: { 
      color: '#64748b', 
      fontSize: isMobile ? '0.85rem' : '0.95rem', 
      marginTop: '0.25rem' 
    },
    createBtn: { 
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.9rem' : '0.6rem 1.1rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.85rem' : '0.95rem', 
      boxShadow: '0 6px 18px rgba(14,165,233,0.12)',
      alignSelf: isMobile ? 'flex-start' : 'auto'
    },
    alert: { 
      padding: isMobile ? '0.75rem' : '0.85rem', 
      borderRadius: '10px', 
      marginBottom: isMobile ? '0.75rem' : '1rem', 
      border: '1px solid',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    alertError: { backgroundColor: '#fff1f2', color: '#9f1239', borderColor: '#fecaca' },
    alertSuccess: { backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#bbf7d0' },
    loading: { 
      textAlign: 'center', 
      padding: isMobile ? '3rem 1rem' : '4rem 2rem', 
      color: '#64748b',
      fontSize: isMobile ? '1rem' : '1.1rem'
    },
    empty: { 
      textAlign: 'center', 
      padding: isMobile ? '3rem 1rem' : '4rem 2rem', 
      color: '#64748b', 
      backgroundColor: 'white', 
      borderRadius: '12px',
      fontSize: isMobile ? '0.95rem' : '1rem'
    },
    grid: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '1rem' : '1.25rem' 
    },
    filters: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '1rem', 
      marginBottom: isMobile ? '1rem' : '1.5rem',
      flexWrap: 'wrap'
    },
    filter: { 
      padding: isMobile ? '0.65rem' : '0.5rem', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.95rem' : '0.9rem',
      minWidth: isMobile ? '100%' : '150px'
    },

    studentCard: { 
      width: '100%', 
      background: 'linear-gradient(180deg, #fff, #fbfbff)', 
      borderRadius: '8px', 
      padding: isMobile ? '1rem' : '1.25rem', 
      boxShadow: '0 6px 18px rgba(15,23,42,0.05)', 
      cursor: 'default', 
      transition: 'transform 0.18s ease, box-shadow 0.18s ease', 
      border: '1px solid rgba(15,23,42,0.03)' 
    },
    studentHeader: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.75rem' : '1rem', 
      marginBottom: isMobile ? '0.5rem' : '0.75rem' 
    },
    studentPhoto: { 
      width: isMobile ? '72px' : '96px', 
      height: isMobile ? '72px' : '96px', 
      borderRadius: '10px', 
      objectFit: 'cover', 
      border: '2px solid #eef2ff' 
    },
    studentInfo: { flex: 1, width: isMobile ? '100%' : 'auto' },
    studentName: { 
      fontSize: isMobile ? '1rem' : '1.1rem', 
      fontWeight: 800, 
      color: '#0f172a', 
      margin: '0 0 0.25rem 0' 
    },
    studentProgram: { 
      color: '#8b5cf6', 
      fontSize: isMobile ? '0.85rem' : '0.95rem', 
      fontWeight: 700, 
      marginBottom: '0.4rem' 
    },
    studentDetails: { 
      color: '#475569', 
      fontSize: isMobile ? '0.85rem' : '0.9rem', 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.25rem' : '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '0.4rem' 
    },
    detailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    tags: { 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '0.5rem', 
      marginBottom: isMobile ? '0.75rem' : '1rem' 
    },
    tag: { 
      backgroundColor: '#e0e7ff', 
      color: '#3730a3', 
      padding: '0.25rem 0.5rem', 
      borderRadius: '6px', 
      fontSize: isMobile ? '0.7rem' : '0.75rem', 
      fontWeight: 600 
    },
    actions: { 
      display: 'flex', 
      gap: '0.5rem', 
      flexWrap: 'wrap', 
      marginTop: '0.5rem' 
    },
    followBtn: { 
      flex: isMobile ? 1 : 'none', 
      backgroundColor: '#0ea5e9', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      minWidth: isMobile ? '60px' : 'auto'
    },
    viewBtn: { 
      flex: isMobile ? 1 : 'none',
      backgroundColor: '#7c3aed', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      minWidth: isMobile ? '60px' : 'auto'
    },
    editBtn: { 
      flex: isMobile ? 1 : 'none',
      backgroundColor: '#f59e0b', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      minWidth: isMobile ? '60px' : 'auto'
    },
    deleteBtn: { 
      flex: isMobile ? 1 : 'none',
      backgroundColor: '#ef4444', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.6rem' : '0.55rem 0.65rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer', 
      fontSize: isMobile ? '0.8rem' : '0.88rem',
      minWidth: isMobile ? '60px' : 'auto'
    },

    modalOverlay: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(2,6,23,0.45)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000, 
      padding: isMobile ? '0.5rem' : '1.25rem', 
      overflowY: 'auto' 
    },
    modalContent: { 
      background: 'white', 
      borderRadius: '12px', 
      width: '100%', 
      maxWidth: isMobile ? '95%' : '720px', 
      maxHeight: isMobile ? '95vh' : '90vh', 
      overflowY: 'auto' 
    },
    modalHeader: { 
      padding: isMobile ? '0.9rem' : '1.1rem', 
      borderBottom: '1px solid #eef2ff', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'sticky', 
      top: 0, 
      backgroundColor: 'white', 
      zIndex: 1 
    },
    modalTitle: { 
      fontSize: isMobile ? '1.1rem' : '1.25rem', 
      color: '#0f172a', 
      margin: 0 
    },
    closeBtn: { 
      background: 'none', 
      border: 'none', 
      fontSize: isMobile ? '1.5rem' : '1.35rem', 
      cursor: 'pointer', 
      color: '#475569' 
    },
    modalBody: { 
      padding: isMobile ? '1rem' : '1.25rem' 
    },
    form: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: isMobile ? '0.75rem' : '1rem' 
    },
    formRow: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
      gap: isMobile ? '0.75rem' : '0.75rem' 
    },
    field: { 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.5rem' 
    },
    label: { 
      fontWeight: 700, 
      color: '#0f172a', 
      fontSize: isMobile ? '0.85rem' : '0.9rem' 
    },
    input: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem' 
    },
    textarea: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem', 
      fontFamily: 'inherit', 
      resize: 'vertical', 
      minHeight: '100px' 
    },
    select: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px solid #eef2ff', 
      borderRadius: '8px', 
      fontSize: isMobile ? '0.9rem' : '0.95rem' 
    },
    fileLabel: { 
      padding: isMobile ? '0.5rem' : '0.6rem', 
      border: '1px dashed #7dd3fc', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      textAlign: 'center', 
      color: '#0369a1', 
      fontWeight: 700, 
      transition: 'all 0.2s',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    fileInput: { display: 'none' },
    preview: { 
      width: isMobile ? '100px' : '120px', 
      height: isMobile ? '100px' : '120px', 
      borderRadius: '12px', 
      objectFit: 'cover', 
      margin: '0.75rem auto', 
      display: 'block', 
      border: '2px solid #eef2ff' 
    },
    formActions: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.5rem' : '0.65rem', 
      justifyContent: 'flex-end', 
      paddingTop: '0.75rem', 
      borderTop: '1px solid #eef2ff' 
    },
    cancelBtn: { 
      backgroundColor: '#64748b', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.75rem' : '0.55rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 700, 
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      width: isMobile ? '100%' : 'auto'
    },
    submitBtn: { 
      backgroundColor: '#06b6d4', 
      color: 'white', 
      border: 'none', 
      padding: isMobile ? '0.5rem 0.75rem' : '0.55rem 1rem', 
      borderRadius: '10px', 
      fontWeight: 800, 
      cursor: 'pointer',
      fontSize: isMobile ? '0.85rem' : '0.9rem',
      width: isMobile ? '100%' : 'auto'
    },
    credBox: { 
      padding: isMobile ? '0.75rem' : '1rem', 
      borderRadius: '8px', 
      background: '#f8fafc', 
      border: '1px dashed #e6eef7', 
      marginBottom: '0.75rem'
    },
    credHeader: {
      fontWeight: 800,
      marginBottom: '0.5rem',
      fontSize: isMobile ? '0.9rem' : '1rem'
    },
    credValue: {
      wordBreak: 'break-all',
      fontSize: isMobile ? '0.85rem' : '0.9rem'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: 700,
      marginLeft: '0.5rem'
    },
    activeStatus: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    graduatedStatus: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    },
    viewModalContent: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '1rem' : '1rem',
      alignItems: isMobile ? 'flex-start' : 'center'
    },
    viewModalImage: {
      width: isMobile ? '100%' : '110px',
      height: isMobile ? '140px' : '110px',
      borderRadius: '12px',
      objectFit: 'cover'
    },
    tagInput: { 
      display: 'flex', 
      gap: '0.5rem', 
      marginBottom: '0.5rem',
      flexDirection: isMobile ? 'column' : 'row'
    },
    tagList: { 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '0.5rem' 
    },
    smallBtn: { 
      padding: isMobile ? '0.4rem 0.5rem' : '0.45rem 0.6rem', 
      borderRadius: '8px', 
      border: 'none', 
      fontWeight: 700, 
      cursor: 'pointer',
      fontSize: isMobile ? '0.8rem' : '0.85rem'
    }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.loading}>Loading students...</div></div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Students</h1>
          <p style={styles.subtitle}>Manage current Mission Bible School students</p>
        </div>
        {isAdmin && (
          <button 
            style={styles.createBtn} 
            onClick={() => setShowCreateForm(true)}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 20px rgba(14,165,233,0.2)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 6px 18px rgba(14,165,233,0.12)'; }}
          >
            + Add Student
          </button>
        )}
      </div>

      {error && <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>}
      {success && <div style={{ ...styles.alert, ...styles.alertSuccess }}>{success}</div>}

      {/* Filters */}
      <div style={styles.filters}>
        <select
          value={filters.program}
          onChange={(e) => setFilters({...filters, program: e.target.value})}
          style={styles.filter}
        >
          <option value="">All Programs</option>
          {programs.map(program => (
            <option key={program} value={program}>{program}</option>
          ))}
        </select>
        
        <select
          value={filters.classYear}
          onChange={(e) => setFilters({...filters, classYear: e.target.value})}
          style={styles.filter}
        >
          <option value="">All Class Years</option>
          {classYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={filters.enrollmentYear}
          onChange={(e) => setFilters({...filters, enrollmentYear: e.target.value})}
          style={styles.filter}
        >
          <option value="">All Enrollment Years</option>
          {enrollmentYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {students.length === 0 ? (
        <div style={styles.empty}>
          <p>No students found.</p>
          {isAdmin && (
            <button 
              style={{...styles.createBtn, marginTop: '1rem'}} 
              onClick={() => setShowCreateForm(true)}
            >
              + Add First Student
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {students.map(student => {
            const status = getStudentStatus(student);
            return (
              <div
                key={student.user.id}
                style={styles.studentCard}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={styles.studentHeader}>
                  <img
                    src={student.user.profilePhoto || '/default-avatar.png'}
                    alt={student.user.firstName}
                    style={styles.studentPhoto}
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                  />
                  <div style={styles.studentInfo}>
                    <h3 style={styles.studentName}>
                      {student.user.firstName} {student.user.lastName}
                      <span style={{
                        ...styles.statusBadge,
                        ...(status === 'Active' ? styles.activeStatus : styles.graduatedStatus)
                      }}>
                        {status}
                      </span>
                    </h3>
                    <div style={styles.studentProgram}>
                      {student.program || 'No program specified'}
                      {student.classYear && ` • Class of ${student.classYear}`}
                    </div>
                    <div style={styles.studentDetails}>
                      <div style={styles.detailItem}>
                        📅 Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                      </div>
                      {student.graduationDate && (
                        <div style={styles.detailItem}>
                          🎓 Graduation: {new Date(student.graduationDate).toLocaleDateString()}
                        </div>
                      )}
                      {student.user.contactPhone && (
                        <div style={styles.detailItem}>
                          📞 {student.user.contactPhone}
                        </div>
                      )}
                      <div style={styles.detailItem}>
                        ✉️ {student.user.email}
                      </div>
                    </div>
                  </div>
                </div>

                {student.tags && student.tags.length > 0 && (
                  <div style={styles.tags}>
                    {student.tags.slice(0, isMobile ? 3 : 4).map((tag, index) => (
                      <span key={index} style={styles.tag}>{tag}</span>
                    ))}
                    {student.tags.length > (isMobile ? 3 : 4) && (
                      <span style={styles.tag}>+{student.tags.length - (isMobile ? 3 : 4)} more</span>
                    )}
                  </div>
                )}

                {student.notes && (
                  <p style={{ 
                    color: '#334155', 
                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                    marginBottom: '1rem',
                    lineHeight: '1.4'
                  }}>
                    {student.notes.length > 100 ? `${student.notes.substring(0, 100)}...` : student.notes}
                  </p>
                )}

                <div style={styles.actions}>
                  <button 
                    style={styles.followBtn} 
                    onClick={() => handleFollow(student.user.id)}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Follow
                  </button>
                  <button 
                    style={styles.viewBtn} 
                    onClick={() => openView(student)}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    View
                  </button>
                  {canEdit(student) && (
                    <button 
                      style={styles.editBtn} 
                      onClick={() => openEditForm(student)}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Edit
                    </button>
                  )}
                  {isAdmin && (
                    <button 
                      style={styles.deleteBtn} 
                      onClick={() => handleDelete(student.user.id)}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Add New Student</h2>
              <button style={styles.closeBtn} onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleCreateSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>First Name *</label>
                    <input
                      type="text"
                      value={createFormData.firstName}
                      onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Last Name *</label>
                    <input
                      type="text"
                      value={createFormData.lastName}
                      onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    value={createFormData.contactPhone}
                    onChange={(e) => setCreateFormData({ ...createFormData, contactPhone: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Profile Photo</label>
                  <label style={styles.fileLabel}>
                    {uploading ? 'Uploading...' : '📷 Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'create')}
                      style={styles.fileInput}
                      disabled={uploading}
                    />
                  </label>
                  {createFormData.profilePhoto && (
                    <img src={createFormData.profilePhoto} alt="Preview" style={styles.preview} />
                  )}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Enrollment Date *</label>
                    <input
                      type="date"
                      value={createFormData.enrollmentDate}
                      onChange={(e) => setCreateFormData({ ...createFormData, enrollmentDate: e.target.value })}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Expected Graduation</label>
                    <input
                      type="date"
                      value={createFormData.graduationDate}
                      onChange={(e) => setCreateFormData({ ...createFormData, graduationDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Program</label>
                    <input
                      type="text"
                      value={createFormData.program}
                      onChange={(e) => setCreateFormData({ ...createFormData, program: e.target.value })}
                      style={styles.input}
                      placeholder="e.g., Bible & Theology"
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Class Year</label>
                    <input
                      type="text"
                      value={createFormData.classYear}
                      onChange={(e) => setCreateFormData({ ...createFormData, classYear: e.target.value })}
                      style={styles.input}
                      placeholder="e.g., 2024"
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Tags</label>
                  <div style={styles.tagInput}>
                    <input
                      type="text"
                      placeholder="Add a tag (e.g., NQF5, Leadership)"
                      style={{ ...styles.input, flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('create', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={styles.smallBtn}
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        addTag('create', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={styles.tagList}>
                    {createFormData.tags.map((tag, index) => (
                      <span key={index} style={styles.tag}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag('create', index)}
                          style={{ marginLeft: '0.25rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    value={createFormData.notes}
                    onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
                    style={styles.textarea}
                    placeholder="Any additional notes about the student..."
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && selectedStudent && (
        <div style={styles.modalOverlay} onClick={() => setShowEditForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Student</h2>
              <button style={styles.closeBtn} onClick={() => setShowEditForm(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <form onSubmit={handleEditSubmit} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>First Name</label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Last Name</label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    value={editFormData.contactPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Profile Photo</label>
                  <label style={styles.fileLabel}>
                    {uploading ? 'Uploading...' : '📷 Upload New Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'edit')}
                      style={styles.fileInput}
                      disabled={uploading}
                    />
                  </label>
                  {editFormData.profilePhoto && (
                    <img src={editFormData.profilePhoto} alt="Preview" style={styles.preview} />
                  )}
                </div>

                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Enrollment Date</label>
                    <input
                      type="date"
                      value={editFormData.enrollmentDate}
                      onChange={(e) => setEditFormData({ ...editFormData, enrollmentDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Graduation Date</label>
                    <input
                      type="date"
                      value={editFormData.graduationDate}
                      onChange={(e) => setEditFormData({ ...editFormData, graduationDate: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.label}>Program</label>
                    <input
                      type="text"
                      value={editFormData.program}
                      onChange={(e) => setEditFormData({ ...editFormData, program: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Class Year</label>
                    <input
                      type="text"
                      value={editFormData.classYear}
                      onChange={(e) => setEditFormData({ ...editFormData, classYear: e.target.value })}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Tags</label>
                  <div style={styles.tagInput}>
                    <input
                      type="text"
                      placeholder="Add a tag"
                      style={{ ...styles.input, flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('edit', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      style={styles.smallBtn}
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        addTag('edit', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={styles.tagList}>
                    {editFormData.tags.map((tag, index) => (
                      <span key={index} style={styles.tag}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag('edit', index)}
                          style={{ marginLeft: '0.25rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.formActions}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowEditForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div style={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedStudent.user.firstName} {selectedStudent.user.lastName}</h2>
              <button style={styles.closeBtn} onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.viewModalContent}>
                <img 
                  src={selectedStudent.user.profilePhoto || '/default-avatar.png'} 
                  alt="pic" 
                  style={styles.viewModalImage} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: isMobile ? 16 : 18 }}>
                    {selectedStudent.program || 'No program specified'}
                    {selectedStudent.classYear && ` • Class of ${selectedStudent.classYear}`}
                    <span style={{
                      ...styles.statusBadge,
                      ...(getStudentStatus(selectedStudent) === 'Active' ? styles.activeStatus : styles.graduatedStatus),
                      marginLeft: '10px'
                    }}>
                      {getStudentStatus(selectedStudent)}
                    </span>
                  </div>
                  <div style={{ color: '#475569', marginTop: 6 }}>
                    📅 Enrolled: {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                  </div>
                  {selectedStudent.graduationDate && (
                    <div style={{ color: '#475569', marginTop: 6 }}>
                      🎓 Graduation: {new Date(selectedStudent.graduationDate).toLocaleDateString()}
                    </div>
                  )}
                  <div style={{ color: '#475569', marginTop: 6 }}>✉️ {selectedStudent.user.email}</div>
                  {selectedStudent.user.contactPhone && (
                    <div style={{ color: '#475569', marginTop: 6 }}>📞 {selectedStudent.user.contactPhone}</div>
                  )}
                </div>
              </div>

              {selectedStudent.tags && selectedStudent.tags.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: isMobile ? 15 : 16 }}>Tags</h3>
                  <div style={styles.tags}>
                    {selectedStudent.tags.map((tag, index) => (
                      <span key={index} style={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.notes && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: isMobile ? 15 : 16 }}>Notes</h3>
                  <p style={{ color: '#334155', lineHeight: 1.5, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                    {selectedStudent.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credentials modal */}
      {credentials && (
        <div style={styles.modalOverlay} onClick={() => setCredentials(null)}>
          <div style={{ ...styles.modalContent, maxWidth: isMobile ? '95%' : 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New Student Account Created</h3>
              <button style={styles.closeBtn} onClick={() => setCredentials(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.credBox}>
                <div style={styles.credHeader}>Email</div>
                <div style={styles.credValue}>{credentials.email}</div>
              </div>

              <div style={styles.credBox}>
                <div style={styles.credHeader}>Temporary Password</div>
                <div style={styles.credValue}>{credentials.password}</div>
              </div>

              <div style={styles.credBox}>
                <div style={styles.credHeader}>Auto-login URL (Valid for 24 hours)</div>
                <div style={styles.credValue}>
                  <a href={credentials.autoLoginUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0ea5e9' }}>
                    {credentials.autoLoginUrl}
                  </a>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: 8 }}>
                <button style={styles.cancelBtn} onClick={() => setCredentials(null)}>Close</button>
                <button style={{ ...styles.submitBtn, width: isMobile ? '100%' : 'auto' }} onClick={() => { copyCredentials(); setSuccess('Credentials copied to clipboard.'); setTimeout(() => setSuccess(''), 2500); }}>
                  {copied === 'both' ? 'Copied' : 'Copy All Credentials'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;