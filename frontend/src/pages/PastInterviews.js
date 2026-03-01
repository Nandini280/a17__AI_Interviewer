import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Brain, 
  FileText, 
  History, 
  User, 
  LogOut,
  Calendar,
  TrendingUp,
  Mic,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const PastInterviews = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    } else {
      fetchInterviews();
    }
  }, [navigate]);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/interview/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(response.data.interviews);
    } catch (error) {
      console.error('Error fetching interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteInterview = async (e, interviewId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/interview/${interviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInterviews();
    } catch (error) {
      alert('Error deleting interview');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    if (filter === 'high') return interview.overallScore >= 80;
    if (filter === 'medium') return interview.overallScore >= 50 && interview.overallScore < 80;
    if (filter === 'low') return interview.overallScore < 50;
    return true;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getScoreTrend = () => {
    if (interviews.length < 2) return null;
    const recent = interviews.slice(0, 3).reduce((sum, i) => sum + i.overallScore, 0) / Math.min(3, interviews.length);
    const older = interviews.slice(3, 6).reduce((sum, i) => sum + i.overallScore, 0) / Math.min(3, interviews.length - 3);
    return recent - older;
  };

  const menuItems = [
    { id: 'dashboard', icon: <Brain size={20} />, label: 'Dashboard', path: '/dashboard' },
    { id: 'resume', icon: <FileText size={20} />, label: 'My Resume', path: '/resume' },
    { id: 'history', icon: <History size={20} />, label: 'Past Interviews', path: '/past-interviews' },
    { id: 'profile', icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <Brain style={{ color: '#8B5CF6', marginRight: '8px' }} size={24} />
            <span style={styles.logoText}>AI Interviewer</span>
          </div>
        </div>
        
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              style={activeTab === item.id ? {...styles.navItem, ...styles.navItemActive} : styles.navItem}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Past Interviews</h1>
            <p style={styles.subtitle}>View and review your previous interview sessions</p>
          </div>
          
          <div style={styles.filterSection}>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Scores</option>
              <option value="high">High (80+)</option>
              <option value="medium">Medium (50-79)</option>
              <option value="low">Low (Below 50)</option>
            </select>
          </div>
        </header>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              <History size={24} />
            </div>
            <div>
              <p style={styles.statValue}>{interviews.length}</p>
              <p style={styles.statLabel}>Total Interviews</p>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#dcfce7'}}>
              <TrendingUp size={24} style={{ color: '#10B981' }} />
            </div>
            <div>
              <p style={styles.statValue}>
                {interviews.length > 0 
                  ? Math.round(interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length)
                  : 0}%
              </p>
              <p style={styles.statLabel}>Average Score</p>
            </div>
          </div>

          {getScoreTrend() !== null && (
            <div style={styles.statCard}>
              <div style={{
                ...styles.statIcon,
                backgroundColor: getScoreTrend() >= 0 ? '#dcfce7' : '#fef2f2'
              }}>
                <TrendingUp size={24} style={{ color: getScoreTrend() >= 0 ? '#10B981' : '#EF4444' }} />
              </div>
              <div>
                <p style={{...styles.statValue, color: getScoreTrend() >= 0 ? '#10B981' : '#EF4444'}}>
                  {getScoreTrend() >= 0 ? '+' : ''}{Math.round(getScoreTrend())}%
                </p>
                <p style={styles.statLabel}>Score Trend</p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Loading interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div style={styles.emptyState}>
            <History size={64} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>No interviews found</p>
            <button 
              onClick={() => navigate('/dashboard')}
              style={styles.startBtn}
            >
              <Mic size={20} style={{ marginRight: '8px' }} />
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div style={styles.interviewList}>
            {filteredInterviews.map((interview, index) => (
              <motion.div 
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.interviewCard}
                onClick={() => navigate(`/results/${interview.id}`)}
              >
                <div style={styles.cardLeft}>
                  <div style={styles.dateBox}>
                    <Calendar size={20} style={{ color: '#8B5CF6' }} />
                    <span>{formatDate(interview.date)}</span>
                  </div>
                  <div style={styles.titleBox}>
                    <span style={styles.interviewTitle}>{interview.title || 'Mock Interview'}</span>
                  </div>
                  <div style={styles.skillsList}>
                    {interview.skillsTested?.slice(0, 3).map((skill, i) => (
                      <span key={i} style={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
                
                <div style={styles.cardRight}>
                  <div style={styles.scoreSection}>
                    <span style={{
                      ...styles.score,
                      backgroundColor: getScoreColor(interview.overallScore)
                    }}>
                      {interview.overallScore}%
                    </span>
                    <div style={styles.scoreLabels}>
                      <span>Technical: {interview.technicalScore}%</span>
                      <span>Comm: {interview.communicationScore}%</span>
                    </div>
                  </div>
                  <div style={styles.statusBadge}>
                    {interview.status === 'completed' ? (
                      <span style={styles.completedBadge}>Completed</span>
                    ) : (
                      <span style={styles.inProgressBadge}>In Progress</span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteInterview(e, interview.id)} 
                    style={styles.deleteBtn}
                    title="Delete Interview"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0F0F1A'
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#16162A',
    borderRight: '1px solid #2E2E4A',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh'
  },
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #2E2E4A'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  logoText: {
    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  nav: {
    flex: '1',
    padding: '1rem'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94A3B8',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '8px',
    width: '100%',
    marginBottom: '0.5rem',
    transition: 'all 0.2s'
  },
  navItemActive: {
    backgroundColor: '#8B5CF620',
    color: '#A78BFA',
    fontWeight: '500'
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid #2E2E4A'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '14px 24px',
    border: 'none',
    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '10px',
    width: '90%',
    margin: '0 auto',
    textTransform: 'uppercase',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
    transition: 'all 0.2s'
  },
  main: {
    flex: '1',
    marginLeft: '260px',
    padding: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: '0.25rem'
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: '1rem'
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  filterSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #2E2E4A',
    borderRadius: '8px',
    fontSize: '0.9rem',
    backgroundColor: '#16162A',
    color: '#F8FAFC',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#16162A',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    border: '1px solid #2E2E4A'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#8B5CF620',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#A78BFA'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#F8FAFC'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#94A3B8'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    color: '#94A3B8'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #2E2E4A',
    borderTopColor: '#8B5CF6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    backgroundColor: '#16162A',
    borderRadius: '12px',
    border: '1px solid #2E2E4A'
  },
  interviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  interviewCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: '#16162A',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    border: '1px solid #2E2E4A',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flex: 1
  },
  dateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#F8FAFC',
    fontWeight: '500'
  },
  titleBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  interviewTitle: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: '1rem'
  },
  skillsList: {
    display: 'flex',
    gap: '0.5rem'
  },
  skillTag: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#1E1E3A',
    color: '#A78BFA',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    border: '1px solid #2E2E4A'
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  scoreSection: {
    textAlign: 'right'
  },
  score: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1.1rem'
  },
  scoreLabels: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.8rem',
    color: '#64748B',
    marginTop: '0.25rem'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center'
  },
  completedBadge: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#10B98120',
    color: '#10B981',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  inProgressBadge: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#F59E0B20',
    color: '#F59E0B',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    color: '#EF4444',
    border: '1px solid #EF4444',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  startBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.875rem 1.5rem',
    backgroundColor: '#8B5CF6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default PastInterviews;
