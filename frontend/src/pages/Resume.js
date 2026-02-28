import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Upload, Trash2, Check, Briefcase, GraduationCap, Code, Sparkles, Brain, History, User, LogOut, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Resume = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const c = {
    bgPrimary: '#0F0F1A', bgSecondary: '#16162A', bgTertiary: '#1E1E3A',
    primary: '#8B5CF6', primaryLight: '#A78BFA', textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8', textMuted: '#64748B', border: '#2E2E4A',
    success: '#10B981', danger: '#EF4444'
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
    else fetchResume();
  }, [navigate]);

  const fetchResume = async () => {
    try {
      const response = await axios.get(`${API_URL}/resume`);
      setResume(response.data);
    } catch (e) { console.log('No resume found'); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const response = await axios.post(`${API_URL}/resume/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResume(response.data.resume);
    } catch (e) { alert('Error uploading resume'); }
    finally { setUploading(false); }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      await axios.delete(`${API_URL}/resume`);
      setResume(null);
    } catch (e) { console.error('Error'); }
  };

  const handleViewResume = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to view your resume');
        return;
      }
      
      // Open the resume in a new tab with the token as a query parameter
      const viewUrl = `${API_URL}/resume/view?token=${encodeURIComponent(token)}`;
      window.open(viewUrl, '_blank');
    } catch (e) {
      console.error('Error viewing resume:', e);
      if (e.response) {
        if (e.response.status === 404) {
          alert('Resume not found. Please upload a resume first.');
        } else if (e.response.status === 401) {
          alert('Session expired. Please log in again.');
          logout();
          navigate('/login');
        } else {
          alert(`Error: ${e.response.data?.message || 'Failed to load resume'}`);
        }
      } else if (e.request) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('An error occurred while loading the resume.');
      }
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
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: 'none', backgroundColor: item.id === 'resume' ? `${c.primary}20` : 'transparent', color: item.id === 'resume' ? c.primary : c.textMuted, fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', width: '100%', marginBottom: '0.5rem' }}>
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
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: c.textPrimary, marginBottom: '2rem' }}>My Resume</h1>

        {!resume ? (
          <div style={{ padding: '3rem', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `2px dashed ${c.border}`, textAlign: 'center' }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); const file = e.dataTransfer.files[0]; if (file) handleFileUpload(file); }}
          >
            <div style={{ width: '80px', height: '80px', backgroundColor: `${c.primary}20`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Upload size={36} style={{ color: c.primary }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: c.textPrimary, marginBottom: '0.5rem' }}>Upload Your Resume</h2>
            <p style={{ color: c.textMuted, marginBottom: '1.5rem' }}>Drag and drop your resume here, or click to browse</p>
            <label htmlFor="resume-upload" style={{ display: 'inline-block', padding: '0.875rem 2rem', backgroundColor: c.primary, color: 'white', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
            <input type="file" accept=".pdf,.doc,.docx" id="resume-upload" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e.target.files[0])} disabled={uploading} />
            <p style={{ fontSize: '0.85rem', color: c.textMuted, marginTop: '1.5rem' }}>Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ padding: '24px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: `${c.primary}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} style={{ color: c.primary }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '4px' }}>Resume</h3>
                    <p style={{ fontSize: '0.85rem', color: c.textMuted }}>Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleViewResume} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: c.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                    <Eye size={16} /> View
                  </button>
                  <button onClick={handleDeleteResume} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: `${c.danger}20`, color: c.danger, border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>

            {resume.domain && (
              <div style={{ padding: '20px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={16} style={{ color: c.primary }} /> Domain
                </h4>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 16px', backgroundColor: `${c.success}15`, border: `1px solid ${c.success}30`, borderRadius: '10px', color: c.success, fontWeight: '600' }}>
                  <Check size={16} style={{ marginRight: '8px' }} /> {resume.domain}
                </span>
              </div>
            )}

            {resume.skills && resume.skills.length > 0 && (
              <div style={{ padding: '20px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: c.primaryLight }} /> Extracted Skills ({resume.skills.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {resume.skills.map((skill, i) => (
                    <span key={i} style={{ padding: '8px 14px', backgroundColor: c.bgTertiary, color: c.primaryLight, borderRadius: '20px', fontSize: '0.9rem', fontWeight: '500', border: `1px solid ${c.border}` }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resume.education && resume.education.length > 0 && (
              <div style={{ padding: '20px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={16} style={{ color: c.primary }} /> Education
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {resume.education.map((edu, i) => (
                    <div key={i} style={{ padding: '12px', backgroundColor: c.bgTertiary, borderRadius: '8px' }}>
                      <p style={{ fontWeight: '600', color: c.textPrimary, marginBottom: '4px' }}>{edu.degree}</p>
                      <p style={{ fontSize: '0.85rem', color: c.textMuted }}>{edu.institution} {edu.year && ` - ${edu.year}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resume.experience && resume.experience.length > 0 && (
              <div style={{ padding: '20px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={16} style={{ color: c.primary }} /> Experience
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {resume.experience.map((exp, i) => (
                    <div key={i} style={{ padding: '12px', backgroundColor: c.bgTertiary, borderRadius: '8px' }}>
                      <p style={{ fontWeight: '600', color: c.textPrimary, marginBottom: '4px' }}>{exp.title}</p>
                      <p style={{ fontSize: '0.85rem', color: c.textMuted }}>{exp.company} {exp.duration && ` - ${exp.duration}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Resume;
