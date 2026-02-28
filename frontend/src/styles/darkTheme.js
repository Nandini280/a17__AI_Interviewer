export const darkTheme = {
  colors: {
    bgPrimary: '#0F0F1A',
    bgSecondary: '#16162A',
    bgTertiary: '#1E1E3A',
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#7C3AED',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#2E2E4A',
  },
  animations: {
    fast: '150ms',
    base: '250ms',
    slow: '400ms',
    easeSmooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  }
};

export const darkStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: darkTheme.colors.bgPrimary,
    color: darkTheme.colors.textPrimary,
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
  card: {
    backgroundColor: darkTheme.colors.bgSecondary,
    borderRadius: '16px',
    border: `1px solid ${darkTheme.colors.border}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  input: {
    backgroundColor: darkTheme.colors.bgTertiary,
    border: `1px solid ${darkTheme.colors.border}`,
    borderRadius: '8px',
    color: darkTheme.colors.textPrimary,
    padding: '12px 16px',
    outline: 'none',
    transition: `all ${darkTheme.animations.base} ${darkTheme.animations.easeSmooth}`,
  },
  buttonPrimary: {
    backgroundColor: darkTheme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${darkTheme.animations.base} ${darkTheme.animations.easeSmooth}`,
    boxShadow: `0 0 20px rgba(139, 92, 246, 0.3)`,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    color: darkTheme.colors.primary,
    border: `2px solid ${darkTheme.colors.primary}`,
    borderRadius: '8px',
    padding: '10px 22px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: `all ${darkTheme.animations.base} ${darkTheme.animations.easeSmooth}`,
  },
  textPrimary: {
    color: darkTheme.colors.textPrimary,
  },
  textSecondary: {
    color: darkTheme.colors.textSecondary,
  },
  textMuted: {
    color: darkTheme.colors.textMuted,
  },
};

export default darkTheme;
