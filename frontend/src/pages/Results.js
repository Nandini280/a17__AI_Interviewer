import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Brain, 
  FileText, 
  History, 
  User, 
  LogOut,
  Download, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  MessageCircle,
  Award,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswers, setExpandedAnswers] = useState({});

  const c = {
    bgPrimary: '#0F0F1A',
    bgSecondary: '#16162A',
    bgTertiary: '#1E1E3A',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#2E2E4A',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/interview/results/${id}`);
      setResults(response.data);
    } catch (error) {
      alert('Error loading results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (score) => {
    if (score >= 90) return c.success;
    if (score >= 80) return c.success;
    if (score >= 70) return c.warning;
    if (score >= 60) return c.warning;
    return c.danger;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return c.success;
    if (score >= 50) return c.warning;
    return c.danger;
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent performance! Keep up the great work.';
    if (score >= 70) return 'Good effort! Keep practicing to improve.';
    if (score >= 60) return 'Not bad! Room for improvement.';
    return 'Needs more practice. Don\'t give up!';
  };

  const toggleAnswer = (index) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const downloadReport = () => {
    const report = `
AI Interview Results
====================
Date: ${new Date(results.createdAt).toLocaleDateString()}

Overall Score: ${results.overallScore}/100 (Grade: ${getGrade(results.overallScore)})
Technical Score: ${results.technicalScore}/100
Communication Score: ${results.communicationScore}/100
Confidence Level: ${results.confidenceLevel}

Strengths:
${results.strengths?.map(s => `- ${s}`).join('\n') || 'N/A'}

Weaknesses:
${results.weaknesses?.map(w => `- ${w}`).join('\n') || 'N/A'}

Improvement Tips:
${results.improvementTips?.map(t => `- ${t}`).join('\n') || 'N/A'}

Questions & Answers:
${results.answers?.map((a, i) => `
Q${i + 1}: ${a.questionText}
Answer: ${a.answerText}
Score: ${a.scores?.overall}/100
Feedback: ${a.feedback}
`).join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const startNewInterview = async () => {
    try {
      const response = await axios.post(`${API_URL}/interview/start`);
      navigate(`/interview/${response.data.interviewId}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Error starting interview');
    }
  };

  // SVG circle calculations
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (results?.overallScore / 100) * circumference;

  const menuItems = [
    { id: 'dashboard', icon: <Brain size={20} />, label: 'Dashboard', path: '/dashboard' },
    { id: 'resume', icon: <FileText size={20} />, label: 'My Resume', path: '/resume' },
    { id: 'history', icon: <History size={20} />, label: 'Past Interviews', path: '/past-interviews' },
    { id: 'profile', icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: c.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: c.textSecondary }}>
          <div style={{ width: '40px', height: '40px', border: `3px solid ${c.border}`, borderTopColor: c.primary, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: c.bgPrimary }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', backgroundColor: c.bgSecondary, borderRight: `1px solid ${c.border}`, position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: '700' }}>
            <Brain style={{ color: c.primary, marginRight: '8px' }} size={24} />
            <span style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.primaryLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Interviewer</span>
          </div>
        </div>
        <nav style={{ padding: '1rem', flex: 1 }}>
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: 'none', backgroundColor: 'transparent', color: c.textMuted, fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', width: '100%', marginBottom: '0.5rem', transition: 'all 0.2s' }}>
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

      {/* Main Content */}
      <main style={{ flex: '1', marginLeft: '240px', padding: '0' }}>
        {/* Header Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${c.primary} 0%, #7C3AED 100%)`,
            padding: '40px 24px',
            textAlign: 'center',
            borderRadius: '0 0 24px 24px',
            boxShadow: `0 4px 20px ${c.primary}40`
          }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            Interview Completed!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>Here's your detailed performance analysis</p>
        </motion.div>

        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          {/* Overall Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ backgroundColor: c.bgSecondary, borderRadius: '16px', padding: '32px', marginBottom: '24px', border: `1px solid ${c.border}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
              {/* Circular Score */}
              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="75" cy="75" r={radius} fill="none" stroke={c.border} strokeWidth="12" />
                  <motion.circle 
                    cx="75" 
                    cy="75" 
                    r={radius} 
                    fill="none" 
                    stroke={getScoreColor(results.overallScore)} 
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeDashoffset }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '700', color: c.textPrimary }}>{results.overallScore}</span>
                  <span style={{ fontSize: '1rem', color: c.textMuted }}>/100</span>
                </div>
              </div>

              {/* Score Details */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: '700', color: getGradeColor(results.overallScore), marginBottom: '8px' }}>
                  Grade: {getGrade(results.overallScore)}
                </div>
                <p style={{ color: getScoreColor(results.overallScore), fontSize: '1.1rem', fontWeight: '500' }}>
                  {getScoreMessage(results.overallScore)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Three Score Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}
          >
            {/* Technical Score */}
            <div style={{ backgroundColor: c.bgSecondary, borderRadius: '12px', padding: '24px', textAlign: 'center', border: `1px solid ${c.border}` }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: `${c.primary}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: c.primary }}>
                <TrendingUp size={24} />
              </div>
              <p style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '8px' }}>Technical</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: getScoreColor(results.technicalScore) }}>{results.technicalScore}/100</p>
            </div>

            {/* Communication Score */}
            <div style={{ backgroundColor: c.bgSecondary, borderRadius: '12px', padding: '24px', textAlign: 'center', border: `1px solid ${c.border}` }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: `${c.success}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: c.success }}>
                <MessageCircle size={24} />
              </div>
              <p style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '8px' }}>Communication</p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: getScoreColor(results.communicationScore) }}>{results.communicationScore}/100</p>
            </div>

            {/* Confidence */}
            <div style={{ backgroundColor: c.bgSecondary, borderRadius: '12px', padding: '24px', textAlign: 'center', border: `1px solid ${c.border}` }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: `${c.warning}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: c.warning }}>
                <Award size={24} />
              </div>
              <p style={{ fontSize: '0.85rem', color: c.textSecondary, marginBottom: '8px' }}>Confidence</p>
              <span style={{ 
                display: 'inline-block',
                padding: '8px 16px', 
                backgroundColor: `${getScoreColor(results.overallScore)}20`, 
                color: getScoreColor(results.overallScore),
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}>
                {results.confidenceLevel}
              </span>
            </div>
          </motion.div>

          {/* Strengths & Weaknesses */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ backgroundColor: c.bgSecondary, borderRadius: '16px', padding: '24px', marginBottom: '24px', border: `1px solid ${c.border}` }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Strengths */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.success, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} /> Strengths
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {results.strengths?.map((strength, index) => (
                    <li key={index} style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: c.bgTertiary, borderRadius: '8px', color: c.textSecondary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: c.success }}>✓</span> {strength}
                    </li>
                  )) || <li style={{ color: c.textMuted, fontSize: '0.9rem' }}>No specific strengths identified</li>}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.warning, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} /> Weak Areas
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {results.weaknesses?.map((weakness, index) => (
                    <li key={index} style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: c.bgTertiary, borderRadius: '8px', color: c.textSecondary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: c.warning }}>⚠</span> {weakness}
                    </li>
                  )) || <li style={{ color: c.textMuted, fontSize: '0.9rem' }}>No major weaknesses identified</li>}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Improvement Tips */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ backgroundColor: c.bgSecondary, borderRadius: '16px', padding: '24px', marginBottom: '24px', border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.primary}` }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>💡</span> Improvement Tips
            </h3>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, counterReset: 'tip-counter' }}>
              {results.improvementTips?.map((tip, index) => (
                <li key={index} style={{ padding: '12px 16px', marginBottom: '8px', backgroundColor: c.bgTertiary, borderRadius: '8px', color: c.textSecondary, fontSize: '0.95rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: c.primary, 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.8rem', 
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Question-wise Review */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ backgroundColor: c.bgSecondary, borderRadius: '16px', padding: '24px', marginBottom: '24px', border: `1px solid ${c.border}` }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: c.textPrimary, marginBottom: '16px' }}>
              Question-wise Review
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.answers?.map((answer, index) => (
                <div key={index} style={{ backgroundColor: c.bgTertiary, borderRadius: '12px', overflow: 'hidden' }}>
                  <button 
                    onClick={() => toggleAnswer(index)}
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      backgroundColor: 'transparent', 
                      border: 'none', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      color: c.textPrimary
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        backgroundColor: c.primary, 
                        color: 'white', 
                        borderRadius: '6px', 
                        fontSize: '0.85rem', 
                        fontWeight: '600' 
                      }}>
                        Q{index + 1}
                      </span>
                      <span style={{ fontSize: '0.95rem', color: c.textSecondary, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {answer.questionText}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        backgroundColor: getScoreColor(answer.scores?.overall), 
                        color: 'white', 
                        borderRadius: '6px', 
                        fontSize: '0.85rem', 
                        fontWeight: '600' 
                      }}>
                        {answer.scores?.overall}/100
                      </span>
                      {expandedAnswers[index] ? <ChevronUp size={20} color={c.textMuted} /> : <ChevronDown size={20} color={c.textMuted} />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedAnswers[index] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ padding: '16px', borderTop: `1px solid ${c.border}`, backgroundColor: c.bgSecondary }}
                      >
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: c.textMuted, marginBottom: '4px' }}>Question:</h4>
                          <p style={{ color: c.textPrimary, fontSize: '0.95rem' }}>{answer.questionText}</p>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: c.textMuted, marginBottom: '4px' }}>Your Answer:</h4>
                          <p style={{ color: c.textSecondary, fontSize: '0.9rem', lineHeight: '1.5' }}>{answer.answerText || 'No answer provided'}</p>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: c.textMuted, marginBottom: '4px' }}>Feedback:</h4>
                          <p style={{ color: getScoreColor(answer.scores?.overall), fontSize: '0.9rem' }}>{answer.feedback}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '24px' }}
          >
            <button 
              onClick={downloadReport}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '14px 28px', 
                backgroundColor: 'transparent', 
                border: `2px solid ${c.primary}`, 
                borderRadius: '10px', 
                color: c.primary, 
                fontWeight: '600', 
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Download size={20} /> Download Report
            </button>
            <button 
              onClick={startNewInterview}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '14px 28px', 
                backgroundColor: c.primary, 
                border: 'none', 
                borderRadius: '10px', 
                color: 'white', 
                fontWeight: '600', 
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${c.primary}40`,
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={20} /> Start New Interview
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Results;
