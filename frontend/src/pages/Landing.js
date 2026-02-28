import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  Mic, 
  TrendingUp, 
  Award, 
  Cloud,
  ArrowRight
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const colors = {
    bgPrimary: '#0F0F1A',
    bgSecondary: '#16162A',
    bgTertiary: '#1E1E3A',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#2E2E4A',
  };

  const features = [
    { icon: <FileText size={32} />, title: 'Resume Upload & Parsing', description: 'Upload your resume and our AI will extract and analyze your skills' },
    { icon: <Brain size={32} />, title: 'AI-Based Question Generation', description: 'Get personalized interview questions based on your resume skills' },
    { icon: <Mic size={32} />, title: 'Text & Voice Interview Mode', description: 'Answer questions via text or voice recording' },
    { icon: <TrendingUp size={32} />, title: 'Real-Time Answer Evaluation', description: 'Get instant feedback on your answers with detailed analysis' },
    { icon: <Award size={32} />, title: 'Performance Scoring & Feedback', description: 'Receive comprehensive scores and actionable improvement tips' },
    { icon: <Cloud size={32} />, title: 'Cloud-Based Secure Storage', description: 'Your data is securely stored in the cloud for easy access' }
  ];

  const steps = [
    { number: 1, title: 'Upload Resume', description: 'Upload your resume in PDF or DOC format' },
    { number: 2, title: 'AI Generates Questions', description: 'Our AI creates personalized questions' },
    { number: 3, title: 'Answer via Text/Voice', description: 'Respond to questions your way' },
    { number: 4, title: 'Get Detailed Feedback', description: 'Receive comprehensive analysis' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bgPrimary, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: colors.bgSecondary, borderBottom: `1px solid ${colors.border}`, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: '700', cursor: 'pointer' }}>
            <Brain style={{ color: colors.primary, marginRight: '8px' }} size={28} />
            <span style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Interviewer</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/login')} style={{ padding: '0.5rem 1.5rem', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, fontSize: '1rem', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' }}>Login</button>
            <button onClick={() => navigate('/signup')} style={{ padding: '0.5rem 1.5rem', border: 'none', backgroundColor: colors.primary, color: 'white', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 0 20px rgba(139, 92, 246, 0.4)` }}>Get Started <ArrowRight size={16} /></button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '8rem 2rem 4rem', background: `linear-gradient(135deg, ${colors.bgPrimary} 0%, ${colors.bgSecondary} 50%, ${colors.bgTertiary} 100%)`, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', color: colors.textPrimary, marginBottom: '1.5rem', lineHeight: '1.2' }}>AI Interviewer – Cloud Based Resume Practice System</h1>
          <p style={{ fontSize: '1.25rem', color: colors.textSecondary, marginBottom: '2rem', lineHeight: '1.6' }}>An AI-powered platform that analyzes resumes, generates personalized interview questions, and provides automated feedback</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/signup')} style={{ padding: '1rem 2rem', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 0 30px rgba(139, 92, 246, 0.4)` }}>Get Started</button>
            <button onClick={() => navigate('/login')} style={{ padding: '1rem 2rem', backgroundColor: 'transparent', border: `2px solid ${colors.primary}`, color: colors.primary, borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer' }}>Login</button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ backgroundColor: colors.bgSecondary, padding: '4rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: '3rem' }}>Our Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02, y: -5, boxShadow: `0 8px 30px rgba(139, 92, 246, 0.2)` }} style={{ padding: '2rem', backgroundColor: colors.bgTertiary, borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', cursor: 'default' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: `${colors.primary}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.textPrimary, marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ fontSize: '0.95rem', color: colors.textSecondary, lineHeight: '1.5' }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ backgroundColor: colors.bgPrimary, padding: '4rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {steps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.15 }} whileHover={{ scale: 1.03, y: -5 }} style={{ flex: '1', minWidth: '250px', maxWidth: '280px', padding: '2rem', backgroundColor: colors.bgSecondary, borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: colors.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700', color: 'white', margin: '0 auto 1rem', boxShadow: `0 0 20px rgba(139, 92, 246, 0.4)` }}>{step.number}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: colors.textPrimary, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.9rem', color: colors.textSecondary }}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`, padding: '4rem 2rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>Start Your Mock Interview Today</h2>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>Practice makes perfect. Get ready for your next big opportunity with AI-powered interviews.</p>
          <button onClick={() => navigate('/signup')} style={{ padding: '1rem 2rem', backgroundColor: 'white', color: colors.primary, border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Start Now <ArrowRight size={18} /></button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: colors.bgSecondary, borderTop: `1px solid ${colors.border}`, padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: colors.textMuted }}>© 2026 AI Interviewer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
