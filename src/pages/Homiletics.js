import React, { useState, useEffect } from 'react';
import { homileticsAPI } from '../services/api';
import { fileUpload } from '../services/fileUpload';
import { useAuth } from '../context/AuthContext';

const Homiletics = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sermonDocFile, setSermonDocFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    sermonDoc: '',
    audioFile: ''
  });
  const [students, setStudents] = useState([]);
  const { user, canManagePosts } = useAuth();

  useEffect(() => {
    fetchEntries();
    fetchStudents();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await homileticsAPI.getHomiletics();
      setEntries(response.data.items);
    } catch (error) {
      console.error('Error fetching homiletics entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    // This would typically come from a students API
    // For now, we'll mock some data
    setStudents([
      { id: '1', user: { firstName: 'John', lastName: 'Doe' } },
      { id: '2', user: { firstName: 'Jane', lastName: 'Smith' } },
      { id: '3', user: { firstName: 'Mike', lastName: 'Johnson' } },
    ]);
  };

  const handleSermonDocSelect = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate PDF files only
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file for the sermon document');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check file size (max 3GB = 3 * 1024 * 1024 * 1024 bytes)
      const maxSize = 3 * 1024 * 1024 * 1024; // 3GB in bytes
      if (file.size > maxSize) {
        alert('File must be less than 3GB');
        e.target.value = '';
        return;
      }
      
      setSermonDocFile(file);
    }
  };

  const handleAudioFileSelect = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate audio files
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        e.target.value = '';
        return;
      }
      
      // Check file size (max 3GB)
      const maxSize = 3 * 1024 * 1024 * 1024; // 3GB in bytes
      if (file.size > maxSize) {
        alert('Audio file must be less than 3GB');
        e.target.value = '';
        return;
      }
      
      setAudioFile(file);
    }
  };

  const removeSermonDoc = () => {
    setSermonDocFile(null);
  };

  const removeAudioFile = () => {
    setAudioFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sermonDocFile || !audioFile) {
      alert('Please select both sermon document and audio file');
      return;
    }

    setUploading(true);

    try {
      console.log('Starting file uploads...');
      console.log('Sermon doc:', sermonDocFile);
      console.log('Audio file:', audioFile);

      // Upload both files with better error handling
      const uploadPromises = [
        fileUpload.uploadFile(sermonDocFile).catch(error => {
          console.error('Sermon doc upload failed:', error);
          throw new Error(`Sermon document upload failed: ${error.message}`);
        }),
        fileUpload.uploadFile(audioFile).catch(error => {
          console.error('Audio file upload failed:', error);
          throw new Error(`Audio file upload failed: ${error.message}`);
        })
      ];

      const [sermonDocUrl, audioFileUrl] = await Promise.all(uploadPromises);
      
      console.log('Upload successful:', { sermonDocUrl, audioFileUrl });

      // Create the homiletics entry
      await homileticsAPI.createHomiletics({
        ...formData,
        sermonDoc: sermonDocUrl,
        audioFile: audioFileUrl
      });
      
      // Reset form
      setFormData({
        studentId: '',
        title: '',
        sermonDoc: '',
        audioFile: ''
      });
      setSermonDocFile(null);
      setAudioFile(null);
      setShowForm(false);
      
      // Refresh entries
      await fetchEntries();
      
    } catch (error) {
      console.error('Error creating homiletics entry:', error);
      alert(`Failed to create entry: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this homiletics entry?')) return;
    try {
      await homileticsAPI.deleteHomiletics(entryId);
      setEntries(entries.filter(e => e.id !== entryId));
    } catch (error) {
      console.error('Error deleting homiletics entry:', error);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
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
      maxWidth: '1000px',
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
    addBtn: {
      backgroundColor: '#dc2626',
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
    },
    textarea: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '80px',
    },
    select: {
      padding: '0.75rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
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
    },
    submitBtn: {
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    loading: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b',
    },
    empty: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#64748b',
      backgroundColor: 'white',
      borderRadius: '12px',
    },
    entries: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    entryCard: {
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: '4px solid #dc2626',
    },
    expired: {
      borderLeftColor: '#6b7280',
      opacity: 0.7,
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
    },
    entryInfo: {
      flex: 1,
    },
    entryTitle: {
      fontSize: '1.25rem',
      color: '#1e293b',
      margin: '0 0 0.5rem 0',
    },
    entryMeta: {
      display: 'flex',
      gap: '1rem',
      color: '#64748b',
      fontSize: '0.9rem',
      flexWrap: 'wrap',
    },
    studentName: {
      fontWeight: '600',
      color: '#dc2626',
    },
    duration: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    expiry: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    expiredBadge: {
      backgroundColor: '#6b7280',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
    },
    activeBadge: {
      backgroundColor: '#059669',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '600',
    },
    entryContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      marginTop: '1.5rem',
    },
    documentSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    audioSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
      margin: 0,
    },
    documentLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'background-color 0.2s',
    },
    audioPlayer: {
      width: '100%',
      borderRadius: '8px',
    },
    deleteBtn: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '0.5rem',
      borderRadius: '4px',
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading homiletics entries...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Homiletics</h1>
        {canManagePosts() && (
          <button 
            style={styles.addBtn}
            onClick={() => setShowForm(true)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            + Add Entry
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formOverlay}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Add Homiletics Entry</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Student *</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.user.firstName} {student.user.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.field}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter sermon title"
                  style={styles.input}
                  required
                />
              </div>
              
              {/* Sermon Document Upload */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Sermon Document (PDF) *
                  <span style={{fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem'}}>
                    PDF files only (max 3GB)
                  </span>
                </label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleSermonDocSelect}
                  style={{...styles.input, padding: '0.5rem'}}
                  disabled={uploading}
                />
                {sermonDocFile && (
                  <div style={fileUploadStyles.fileItem}>
                    <span style={fileUploadStyles.fileName}>
                      {sermonDocFile.name} ({(sermonDocFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB)
                    </span>
                    <button
                      type="button"
                      style={fileUploadStyles.removeFile}
                      onClick={removeSermonDoc}
                      disabled={uploading}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              
              {/* Audio File Upload */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Audio File *
                  <span style={{fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem'}}>
                    Audio files (max 3GB)
                  </span>
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileSelect}
                  style={{...styles.input, padding: '0.5rem'}}
                  disabled={uploading}
                />
                {audioFile && (
                  <div style={fileUploadStyles.fileItem}>
                    <span style={fileUploadStyles.fileName}>
                      {audioFile.name} ({(audioFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB)
                    </span>
                    <button
                      type="button"
                      style={fileUploadStyles.removeFile}
                      onClick={removeAudioFile}
                      disabled={uploading}
                    >
                      ×
                    </button>
                  </div>
                )}
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
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitBtn}
                  disabled={uploading || !sermonDocFile || !audioFile}
                >
                  {uploading ? 'Adding...' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div style={styles.empty}>
          <p>No homiletics entries available.</p>
        </div>
      ) : (
        <div style={styles.entries}>
          {entries.map(entry => {
            const expired = entry.expiresAt ? isExpired(entry.expiresAt) : false;
            return (
              <div 
                key={entry.id} 
                style={{
                  ...styles.entryCard,
                  ...(expired ? styles.expired : {})
                }}
              >
                <div style={styles.entryHeader}>
                  <div style={styles.entryInfo}>
                    <h3 style={styles.entryTitle}>{entry.title}</h3>
                    <div style={styles.entryMeta}>
                      <span style={styles.studentName}>
                        By {entry.student.user.firstName} {entry.student.user.lastName}
                      </span>
                      <span>Uploaded: {new Date(entry.uploadedAt).toLocaleString()}</span>
                      {entry.audioDuration && (
                        <span style={styles.duration}>
                          🎵 {formatDuration(entry.audioDuration)}
                        </span>
                      )}
                      {entry.expiresAt && (
                        <span style={styles.expiry}>
                          {expired ? '📅 Expired' : `📅 Expires: ${new Date(entry.expiresAt).toLocaleString()}`}
                        </span>
                      )}
                      {entry.expiresAt && (
                        <span style={expired ? styles.expiredBadge : styles.activeBadge}>
                          {expired ? 'EXPIRED' : 'ACTIVE'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {canManagePosts() && (
                    <button 
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteEntry(entry.id)}
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div style={styles.entryContent}>
                  <div style={styles.documentSection}>
                    <h4 style={styles.sectionTitle}>Sermon Document</h4>
                    <a
                      href={entry.sermonDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.documentLink}
                    >
                      📄 View Sermon Notes
                    </a>
                  </div>

                  <div style={styles.audioSection}>
                    <h4 style={styles.sectionTitle}>Audio Sermon</h4>
                    <audio 
                      controls 
                      style={styles.audioPlayer}
                    >
                      <source src={entry.audioFile} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Homiletics;