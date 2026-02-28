import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', profilePicture: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = {
    bgPrimary: '#0F0F1A',
    bgSecondary: '#16162A',
    bgTertiary: '#1E1E3A',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#2E2E4A',
    danger: '#EF4444',
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(formData.name, formData.email, formData.password, formData.profilePicture);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bgPrimary }}>
      <div style={{ flex: '1', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ maxWidth: '400px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.75rem', fontWeight: '700', marginBottom: '2rem' }}>
            <Brain style={{ marginRight: '8px' }} size={32} />
            <span>AI Interviewer</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>Join Us!</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: '1.6' }}>Create an account to start practicing interviews</p>
        </motion.div>
      </div>

      <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '420px', backgroundColor: colors.bgSecondary, padding: '2.5rem', borderRadius: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: colors.textPrimary, marginBottom: '1.5rem' }}>Create Account</h2>
          
          {error ? (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#EF444420', color: colors.danger, borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: `1px solid ${colors.danger}40` }}>{error}</div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: colors.textSecondary, marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, width: '18px', height: '18px' }} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '1rem', color: colors.textPrimary, boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: colors.textSecondary, marginBottom: '0.5rem' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, width: '18px', height: '18px' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '1rem', color: colors.textPrimary, boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: colors.textSecondary, marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, width: '18px', height: '18px' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '1rem', color: colors.textPrimary, boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: colors.textSecondary, marginBottom: '0.5rem' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: colors.textMuted, width: '18px', height: '18px' }} />
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '1rem', color: colors.textPrimary, boxSizing: 'border-box' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', backgroundColor: loading ? colors.primary + '80' : colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: `0 0 20px ${colors.primary}40` }}>
              {loading ? 'Creating Account...' : 'Signup'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: colors.textMuted }}>
            Already have an account? <Link to="/login" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '500' }}>Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
