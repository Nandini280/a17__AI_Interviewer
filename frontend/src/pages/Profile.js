import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, FileText, LogOut, Camera, Save, Trash2, Brain, History, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState('');

  const c = {
    bgPrimary: '#0F0F1A', bgSecondary: '#16162A', bgTertiary: '#1E1E3A',
    primary: '#8B5CF6', primaryLight: '#A78BFA', textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8', textMuted: '#64748B', border: '#2E2E4A',
    success: '#10B981', danger: '#EF4444'
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
    else {
      setFormData({ ...formData, name: user?.name || '', email: user?.email || '' });
      fetchResume();
    }
  }, [navigate, user]);

  const fetchResume = async () => {
    try {
      const response = await axios.get(`${API_URL}/resume`);
      setResume(response.data);
    } catch (e) { console.log('No resume'); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/profile`, 
        { name: formData.name, password: formData.password },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setMessage('Profile updated successfully!');
    } catch (e) { setMessage('Error updating profile'); }
  };

  const handleDeleteResume = async () => {
    try {
      await axios.delete(`${API_URL}/resume`);
      setResume(null);
    } catch (e) { console.error('Error'); }
  };

  const handleViewResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/resume/view`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (e) {
      console.error('Error viewing resume');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const sidebarItems = [
    { id: 'dashboard', icon: <Brain size={20} />, label: 'Dashboard', path: '/dashboard' },
    { id: 'resume', icon: <FileText size={20} />, label: 'My Resume', path: '/resume' },
    { id: 'history', icon: <History size={20} />, label: 'Past Interviews', path: '/past-interviews' },
    { id: 'profile', icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: c.bgPrimary }}>
      <aside style={{ width: '260px', backgroundColor: c.bgSecondary, borderRight: `1px solid ${c.border}`, position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: '700' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.primary} strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
            <span style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Interviewer</span>
          </div>
        </div>
        <nav style={{ padding: '1rem', flex: 1 }}>
          {sidebarItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: 'none', backgroundColor: item.id === 'profile' ? `${c.primary}20` : 'transparent', color: item.id === 'profile' ? c.primary : c.textMuted, fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', width: '100%', marginBottom: '0.5rem' }}>
              {item.icon} <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem', borderTop: `1px solid ${c.border}` }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '14px 24px', border: 'none', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: 'white', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', borderRadius: '10px', width: '90%', margin: '0 auto', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)' }}>
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: '1', marginLeft: '260px', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: c.textPrimary, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <User size={32} style={{ color: c.primary }} /> Profile Settings
        </h1>

        <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
          <div style={{ backgroundColor: c.bgSecondary, borderRadius: '16px', padding: '24px', border: `1px solid ${c.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <User size={40} style={{ color: 'white' }} />
                <div style={{ position: 'absolute', bottom: '0', right: '0', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: c.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={14} style={{ color: 'white' }} />
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: c.textPrimary }}>{user?.name || 'User'}</h2>
                <p style={{ color: c.textMuted, fontSize: '0.9rem' }}>{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: c.textSecondary, marginBottom: '8px', fontSize: '0.9rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: c.textMuted }} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      style={{ width: '100%', padding: '12px 12px 12px 40px', backgroundColor: c.bgTertiary, border: `1px solid ${c.border}`, borderRadius: '8px', color: c.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: c.textSecondary, marginBottom: '8px', fontSize: '0.9rem' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: c.textMuted }} />
                    <input type="email" value={formData.email} disabled
                      style={{ width: '100%', padding: '12px 12px 12px 40px', backgroundColor: c.bgTertiary, border: `1px solid ${c.border}`, borderRadius: '8px', color: c.textMuted, fontSize: '1rem', boxSizing: 'border-box', opacity: 0.6 }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: c.textSecondary, marginBottom: '8px', fontSize: '0.9rem' }}>New Password (leave blank to keep current)</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: c.textMuted }} />
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter new password"
                      style={{ width: '100%', padding: '12px 12px 12px 40px', backgroundColor: c.bgTertiary, border: `1px solid ${c.border}`, borderRadius: '8px', color: c.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: c.textSecondary, marginBottom: '8px', fontSize: '0.9rem' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: c.textMuted }} />
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password"
                      style={{ width: '100%', padding: '12px 12px 12px 40px', backgroundColor: c.bgTertiary, border: `1px solid ${c.border}`, borderRadius: '8px', color: c.textPrimary, fontSize: '1rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {message && <p style={{ color: message.includes('success') ? c.success : c.danger, fontSize: '0.9rem' }}>{message}</p>}

                <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: c.primary, color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>

          <div style={{ backgroundColor: c.bgSecondary, borderRadius: '16px', padding: '24px', border: `1px solid ${c.border}` }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} style={{ color: c.primary }} /> Your Resume
            </h3>
            
            {resume ? (
              <div style={{ padding: '16px', backgroundColor: c.bgTertiary, borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={24} style={{ color: c.primary }} />
                    <div>
                      <p style={{ color: c.textPrimary, fontWeight: '500' }}>Resume</p>
                      <p style={{ color: c.textMuted, fontSize: '0.85rem' }}>Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleViewResume} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: c.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}>
                      <Eye size={16} /> View
                    </button>
                    <button onClick={handleDeleteResume} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: `${c.danger}20`, color: c.danger, border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: c.bgTertiary, borderRadius: '12px', border: `2px dashed ${c.border}` }}>
                <FileText size={32} style={{ color: c.textMuted, marginBottom: '8px' }} />
                <p style={{ color: c.textMuted }}>No resume uploaded yet</p>
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: 'transparent', color: c.danger, border: `1px solid ${c.danger}`, borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
