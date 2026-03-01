import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Brain, FileText, Mic, History, User, LogOut, Upload, Sparkles, Calendar, Briefcase, Play, ChevronRight, Clock, Trophy, TrendingUp, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api` 
  : (process.env.NODE_ENV === 'production' ? 'https://a17-backend.vercel.app/api' : '/api');

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [resume, setResume] = useState(null);
  const [stats, setStats] = useState({ totalInterviews: 0, averageScore: 0, skillsIdentified: 0 });
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [interviewSkills, setInterviewSkills] = useState([]);

  const c = {
    bgPrimary: '#0F0F1A', bgSecondary: '#16162A', bgTertiary: '#1E1E3A',
    primary: '#8B5CF6', primaryLight: '#A78BFA', textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8', textMuted: '#64748B', border: '#2E2E4A',
    success: '#10B981', danger: '#EF4444'
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
    else { fetchResume(); fetchDashboardStats(); fetchRecentInterviews(); }
  }, [navigate]);

  const fetchResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/resume`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResume(response.data);
    } catch (e) { 
      console.log('No resume'); 
      setResume(null);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/interview/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (e) { 
      console.log('Error');
      setStats({ totalInterviews: 0, averageScore: 0, skillsIdentified: 0 });
    }
  };

  const fetchRecentInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/interview/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const interviews = response.data.interviews || [];
      setRecentInterviews(interviews.slice(0, 4));
      
      const allSkills = [];
      interviews.forEach(interview => {
        if (interview.skillsTested && interview.status === 'completed') {
          interview.skillsTested.forEach(skill => {
            if (!allSkills.includes(skill)) {
              allSkills.push(skill);
            }
          });
        }
      });
      setInterviewSkills(allSkills);
    } catch (e) { 
      console.log('Error');
      setRecentInterviews([]);
      setInterviewSkills([]);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${API_URL}/resume/upload`, formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        } 
      });
      setResume(response.data.resume);
      fetchDashboardStats();
    } catch (e) { alert('Error uploading'); }
  };

  const handleDeleteResume = async () => {
    const token = localStorage.getItem('token');
    try { 
      await axios.delete(`${API_URL}/resume`, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      setResume(null); 
    }
    catch (e) { console.error('Error'); }
  };

  const handleViewResume = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to view your resume');
        return;
      }
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

const startInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to start an interview');
        navigate('/login');
        return;
      }
      
      const response = await axios.post(`${API_URL}/interview/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Start interview response:', response.data);
      
      if (response.data.interviewId) {
        navigate(`/interview/${response.data.interviewId}`);
      } else {
        alert('Error: No interview ID returned from server');
      }
    } catch (e) { 
      console.error('Start interview error:', e);
      console.error('Error response:', e.response?.data);
      
      const errorMsg = e.response?.data?.message || 'Error starting interview. Please make sure you have uploaded a resume with extractable skills.';
      alert(errorMsg); 
    }
  };

  const getScoreColor = (score) => score >= 80 ? c.success : score >= 50 ? '#F59E0B' : c.danger;
  
  const getTimeAgo = (date) => {
    const h = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60));
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'Yesterday' : `${d} days ago`;
  };

  const handleDeleteInterview = async (e, interviewId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/interview/${interviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecentInterviews();
      fetchDashboardStats();
    } catch (e) {
      alert('Error deleting interview');
    }
  };

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.averageScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: c.bgPrimary }}>
      <aside style={{ width: '260px', backgroundColor: c.bgSecondary, borderRight: `1px solid ${c.border}`, position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: '700' }}>
            <Brain style={{ color: c.primary, marginRight: '8px' }} size={24} />
            <span style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Interviewer</span>
          </div>
        </div>
        <nav style={{ padding: '1rem', flex: 1 }}>
          {[
            { id: 'dashboard', icon: <Brain size={20} />, label: 'Dashboard', path: '/dashboard' },
            { id: 'resume', icon: <FileText size={20} />, label: 'My Resume', path: '/resume' },
            { id: 'history', icon: <History size={20} />, label: 'Past Interviews', path: '/past-interviews' },
            { id: 'profile', icon: <User size={20} />, label: 'Profile', path: '/profile' }
          ].map(item => (
            <button key={item.id} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: 'none', backgroundColor: item.id === 'dashboard' ? `${c.primary}20` : 'transparent', color: item.id === 'dashboard' ? c.primary : c.textMuted, fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', width: '100%', marginBottom: '0.5rem' }}>
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
        <div style={{ background: `linear-gradient(135deg, ${c.bgTertiary} 0%, ${c.bgSecondary} 100%)`, borderRadius: '16px', padding: '32px', marginBottom: '24px', borderLeft: `4px solid ${c.primary}`, boxShadow: `0 0 30px ${c.primary}25`, border: `1px solid ${c.primary}50` }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: c.textPrimary, marginBottom: '0.5rem' }}>Welcome back, {user?.name || 'User'}!</h1>
          <p style={{ color: c.textSecondary, fontSize: '1rem', marginBottom: '8px' }}>Ready to practice for your next interview?</p>
          {stats.totalInterviews > 0 && <p style={{ color: c.primary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={14} /> You're on a {stats.totalInterviews}-interview streak!</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: c.bgSecondary, borderRadius: '12px', border: `1px solid ${c.border}` }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: `${c.primary}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.primary, marginBottom: '12px' }}><Mic size={22} /></div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: c.textPrimary }}>{stats.totalInterviews}</p>
                <p style={{ fontSize: '0.875rem', color: c.textSecondary }}>Total Interviews</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: c.bgSecondary, borderRadius: '12px', border: `1px solid ${c.border}` }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#10B98120', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.success, marginBottom: '12px' }}><TrendingUp size={22} /></div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: c.textPrimary }}>{stats.averageScore}%</p>
                <p style={{ fontSize: '0.875rem', color: c.textSecondary }}>Average Score</p>
              </div>
              <div style={{ padding: '20px', backgroundColor: c.bgSecondary, borderRadius: '12px', border: `1px solid ${c.border}` }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#A78BFA20', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.primaryLight, marginBottom: '12px' }}><Sparkles size={22} /></div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: c.textPrimary }}>{stats.skillsIdentified}</p>
                <p style={{ fontSize: '0.875rem', color: c.textSecondary }}>Skills Identified</p>
              </div>
            </div>

            <div style={{ padding: '24px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: c.textPrimary, marginBottom: '20px' }}>Your Resume</h2>
              {!resume ? (
                <div style={{ border: `2px dashed ${c.border}`, borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                  <Upload size={40} style={{ color: c.primary, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: c.textPrimary, marginBottom: '0.5rem' }}>Drag and drop your resume here</p>
                  <p style={{ color: c.textMuted, marginBottom: '1rem' }}>or</p>
                  <input type="file" id="dash-upload" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e.target.files[0])} />
                  <label htmlFor="dash-upload" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: c.primary, color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                    Browse Files
                  </label>
                  <p style={{ fontSize: '0.875rem', color: c.textMuted, marginTop: '1rem' }}>Supported: PDF, DOC, DOCX</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: c.bgTertiary, borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: `${c.primary}20`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                      <FileText size={24} style={{ color: c.primary }} />
                    </div>
                    <div style={{ flex: '1' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '4px' }}>Resume</h3>
                      <p style={{ fontSize: '0.8rem', color: c.textMuted }}>Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleViewResume} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: c.primary, color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}><Eye size={14} /> View</button>
                      <button onClick={handleDeleteResume} style={{ padding: '6px 12px', backgroundColor: `${c.danger}20`, color: c.danger, border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                  {resume.domain && <div style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 12px', backgroundColor: `${c.success}15`, border: `1px solid ${c.success}30`, borderRadius: '8px', marginBottom: '16px' }}><Briefcase size={14} style={{ marginRight: '6px', color: c.success }} /><span style={{ color: c.success, fontWeight: '500', fontSize: '0.85rem' }}>{resume.domain}</span></div>}
                  {resume.skills && resume.skills.length > 0 && <div><h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '12px', display: 'flex', alignItems: 'center' }}><Sparkles size={14} style={{ marginRight: '6px', color: c.primaryLight }} /> Extracted Skills</h4><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{resume.skills.map((skill, i) => <span key={i} style={{ padding: '6px 12px', backgroundColor: c.bgTertiary, color: c.primaryLight, borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', border: `1px solid ${c.border}` }}>{skill}</span>)}</div></div>}
                  {resume && <button onClick={startInterview} style={{ width: '100%', padding: '16px', backgroundColor: c.primary, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}><Mic size={20} /> Start Mock Interview</button>}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ padding: '24px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '16px' }}>Quick Actions</h3>
              <button onClick={startInterview} style={{ width: '100%', padding: '16px', backgroundColor: c.primary, color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}><Play size={18} fill="white" /> Start Mock Interview</button>
              <input type="file" id="dash-upload-new" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e.target.files[0])} />
              <label htmlFor="dash-upload-new" style={{ width: '100%', padding: '12px', backgroundColor: c.bgTertiary, color: c.textSecondary, border: `1px solid ${c.border}`, borderRadius: '10px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', boxSizing: 'border-box' }}><Upload size={16} /> Upload New Resume</label>
              <button onClick={() => navigate('/past-interviews')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: c.primaryLight, background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer' }}>View All Past Interviews <ChevronRight size={16} /></button>
            </div>

            <div style={{ padding: '24px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '16px' }}>Recent Activity</h3>
              {recentInterviews.length === 0 ? <div style={{ textAlign: 'center', padding: '20px', color: c.textMuted }}><History size={32} style={{ marginBottom: '8px', opacity: 0.5 }} /><p>No interviews yet</p></div> : 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentInterviews.map((interview, i) => (
                  <div key={interview.id || i} style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: c.bgTertiary, borderRadius: '10px', gap: '12px' }}>
                    <div style={{ flex: '1', cursor: 'pointer' }} onClick={() => navigate(`/results/${interview.id}`)}>
                      <p style={{ fontSize: '0.9rem', fontWeight: '500', color: c.textPrimary }}>{interview.title || `Interview #${i + 1}`}</p>
                      <p style={{ fontSize: '0.75rem', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {getTimeAgo(interview.date)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ padding: '6px 10px', backgroundColor: `${getScoreColor(interview.overallScore)}20`, borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: getScoreColor(interview.overallScore) }}>{interview.overallScore || 0}%</span>
                      </div>
                      <button onClick={(e) => handleDeleteInterview(e, interview.id)} style={{ padding: '6px', backgroundColor: 'transparent', color: c.danger, border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>}
              {recentInterviews.length > 0 && <button onClick={() => navigate('/past-interviews')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: c.primaryLight, background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', marginTop: '16px' }}>View All Activity <ChevronRight size={16} /></button>}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '24px', backgroundColor: c.bgSecondary, borderRadius: '16px', border: `1px solid ${c.border}` }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '24px' }}>Skill Progress and Achievements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', alignItems: 'stretch' }}>
            <div style={{ padding: '0 16px', textAlign: 'center', borderRight: `1px solid ${c.border}` }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '16px' }}>OVERALL SCORE</p>
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r={radius} fill="none" stroke={c.border} strokeWidth="6" />
                  <circle cx="40" cy="40" r={radius} fill="none" stroke={c.primary} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: c.textPrimary }}>{stats.averageScore}%</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '0 16px', borderRight: `1px solid ${c.border}` }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '16px' }}>TOP SKILLS</p>
              {interviewSkills.length > 0 ? interviewSkills.slice(0, 3).map((skill, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: c.textSecondary }}>{skill}</span>
                  <div style={{ height: '4px', backgroundColor: c.bgTertiary, borderRadius: '2px', marginTop: '2px' }}>
                    <div style={{ height: '100%', width: `${75 - i * 10}%`, backgroundColor: c.primary, borderRadius: '2px' }} />
                  </div>
                </div>
              )) : (
                <p style={{ color: c.textMuted, fontSize: '0.85rem' }}>
                  {stats.totalInterviews > 0 ? 'No skills data available' : 'Take an interview to see your skills'}
                </p>
              )}
            </div>
            <div style={{ padding: '0 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: c.textSecondary, marginBottom: '16px' }}>LATEST BADGE</p>
              {stats.totalInterviews > 0 ? (
                <>
                  <Trophy size={32} style={{ color: c.primary, marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: c.textPrimary }}>Interview Master</p>
                  <p style={{ fontSize: '0.75rem', color: c.textMuted }}>Earned {stats.totalInterviews} interview{stats.totalInterviews !== 1 ? 's' : ''} ago</p>
                </>
              ) : (
                <p style={{ color: c.textMuted, fontSize: '0.85rem' }}>Complete interviews to earn badges</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
