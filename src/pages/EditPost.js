// ============================================
// FILE: src/pages/EditPost.js
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '', body: '', postType: 'announcement', tags: '', pinned: false, allowComments: true, allowLikes: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getPost(id);
      const post = response.data;
      setFormData({
        title: post.title || '', body: post.body || '', postType: post.postType, tags: post.tags.join(', '),
        pinned: post.pinned, allowComments: post.allowComments, allowLikes: post.allowLikes
      });
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const postData = {...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(t => t), attachments: []};
      await postsAPI.updatePost(id, postData);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    page: {maxWidth: '900px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'},
    title: {fontSize: '2rem', color: '#2d3748', marginBottom: '2rem'},
    form: {background: 'white', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'},
    field: {marginBottom: '1.5rem'},
    label: {display: 'block', color: '#2d3748', fontWeight: '600', marginBottom: '0.5rem'},
    input: {width: '100%', padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit'},
    textarea: {width: '100%', padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', fontFamily: 'inherit'},
    select: {width: '100%', padding: '0.75rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem'},
    checkboxes: {display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', backgroundColor: '#f7fafc', borderRadius: '8px', marginBottom: '2rem'},
    checkboxLabel: {display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#2d3748', fontWeight: '500'},
    actions: {display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0'},
    btnSecondary: {background: 'white', border: '2px solid #e2e8f0', color: '#718096', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem'},
    btnPrimary: {background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '1rem'},
  };

  if (loading) return <div style={{textAlign: 'center', padding: '4rem'}}>Loading...</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Edit Post</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label htmlFor="title" style={styles.label}>Title</label>
          <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required style={styles.input} />
        </div>
        <div style={styles.field}>
          <label htmlFor="postType" style={styles.label}>Post Type</label>
          <select id="postType" name="postType" value={formData.postType} onChange={handleChange} style={styles.select}>
            <option value="announcement">Announcement</option>
            <option value="event">Event</option>
            <option value="news">News</option>
            <option value="update">Update</option>
          </select>
        </div>
        <div style={styles.field}>
          <label htmlFor="body" style={styles.label}>Content</label>
          <textarea id="body" name="body" value={formData.body} onChange={handleChange} rows="12" required style={styles.textarea} />
        </div>
        <div style={styles.field}>
          <label htmlFor="tags" style={styles.label}>Tags</label>
          <input id="tags" name="tags" type="text" value={formData.tags} onChange={handleChange} style={styles.input} />
        </div>
        <div style={styles.checkboxes}>
          <label style={styles.checkboxLabel}><input type="checkbox" name="pinned" checked={formData.pinned} onChange={handleChange} /><span>Pin this post</span></label>
          <label style={styles.checkboxLabel}><input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleChange} /><span>Allow comments</span></label>
          <label style={styles.checkboxLabel}><input type="checkbox" name="allowLikes" checked={formData.allowLikes} onChange={handleChange} /><span>Allow likes</span></label>
        </div>
        <div style={styles.actions}>
          <button type="button" onClick={() => navigate(`/posts/${id}`)} style={styles.btnSecondary}>Cancel</button>
          <button type="submit" disabled={submitting} style={styles.btnPrimary}>{submitting ? 'Updating...' : 'Update Post'}</button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;