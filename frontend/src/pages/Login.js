import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, isAuthenticated, getUser } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaBook, FaEye, FaEyeSlash, FaUserShield, FaGraduationCap } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      navigate(user?.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = res.data.user.role === 'admin' ? '/admin' : '/student';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password!');
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}><FaBook size={24} color="white" /></div>
            <div>
              <span style={styles.logoText}>LibraryPro</span>
              <span style={styles.logoSub}>Cloud Ecosystem</span>
            </div>
          </div>
          <h1 style={styles.heroTitle}>Manage your library <span style={styles.accent}>smarter.</span></h1>
          <p style={styles.heroDesc}>
            A unified digital workspace built for colleges to organize book loans, automate late fine calculations, and streamline student borrowing.
          </p>
          <div style={styles.featureList}>
            {[
              { icon: '📖', text: 'Real-time book availability and search catalog' },
              { icon: '⚡', text: 'Instant 14-day loan issuing and automated due dates' },
              { icon: '💰', text: 'Live fine tracker (₹2/day) with return receipts' },
              { icon: '🛡️', text: 'Role-based portals for students and administrators' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card} className="glass-card">
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Sign In 👋</h2>
            <p style={styles.cardSub}>Access your student or administrator account</p>
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputRow}>
                <FaEnvelope style={styles.icon} />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputRow}>
                <FaLock style={styles.icon} />
                <input
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in to Portal →'}
            </button>
          </form>

          <p style={styles.registerText}>
            New student member? <Link to="/register" style={styles.link}>Create Student Account</Link>
          </p>

          <div style={styles.hint}>
            <p style={styles.hintTitle}>⚡ Quick Demo Accounts</p>
            <div style={styles.demoButtons}>
              <button
                type="button"
                style={styles.demoBtn}
                onClick={() => fillDemo('admin@library.com', 'password')}
              >
                <FaUserShield color="#7c3aed" /> Admin Demo
              </button>
              <button
                type="button"
                style={styles.demoBtn}
                onClick={() => fillDemo('kaif@gmail.com', 'password')}
              >
                <FaGraduationCap color="#0284c7" /> Student Demo
              </button>
            </div>
            <p style={styles.hintNote}>Click to autofill credentials instantly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: 'calc(100vh - 65px)',
    flexWrap: 'wrap',
  },
  left: {
    flex: '1 1 500px',
    background: 'linear-gradient(135deg, #fbfbfe 0%, #f5f3ff 50%, #ede9fe 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
  },
  leftContent: {
    maxWidth: '480px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '36px',
  },
  logoBox: {
    width: '46px',
    height: '46px',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e1b4b',
    display: 'block',
    lineHeight: '1.2',
  },
  logoSub: {
    fontSize: '11px',
    color: '#7c3aed',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  heroTitle: {
    fontSize: '38px',
    fontWeight: '800',
    color: '#1e1b4b',
    lineHeight: '1.2',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  accent: {
    color: '#7c3aed',
  },
  heroDesc: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.7',
    marginBottom: '32px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  featureIcon: {
    fontSize: '18px',
  },
  featureText: {
    color: '#334155',
    fontSize: '14px',
    fontWeight: '500',
  },
  right: {
    flex: '1 1 450px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#ffffff',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)',
    border: '1px solid #ede9fe',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1e1b4b',
  },
  cardSub: {
    color: '#64748b',
    fontSize: '14px',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '11px',
    padding: '11px 14px',
    transition: 'all 0.2s',
  },
  icon: {
    color: '#7c3aed',
    fontSize: '15px',
    flexShrink: 0,
  },
  input: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
    backgroundColor: 'transparent',
    color: '#1e293b',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px',
  },
  btn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '11px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
    marginTop: '6px',
    transition: 'transform 0.2s',
  },
  registerText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  link: {
    color: '#7c3aed',
    fontWeight: '700',
    textDecoration: 'none',
  },
  hint: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '14px',
    textAlign: 'center',
  },
  hintTitle: {
    color: '#475569',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '10px',
  },
  demoButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  demoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    backgroundColor: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1e293b',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  hintNote: {
    color: '#94a3b8',
    fontSize: '11px',
    margin: 0,
  },
};

export default Login;