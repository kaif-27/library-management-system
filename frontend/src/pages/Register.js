import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaBook, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', college_id: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.college_id) {
      setError('All fields are required!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/register`, form);
      setMessage(res.data.message || 'Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed! Email may already exist.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoBox}><FaBook size={24} color="white" /></div>
            <div>
              <span style={styles.logoText}>LibraryPro</span>
              <span style={styles.logoSub}>Student Enrollment</span>
            </div>
          </div>
          <h1 style={styles.heroTitle}>Join our digital <span style={styles.accent}>library</span> today.</h1>
          <p style={styles.heroDesc}>
            Create your verified student account to borrow course textbooks, track return deadlines, and avoid late fee penalties.
          </p>
          <div style={styles.steps}>
            {[
              { num: '01', title: 'Register Account', desc: 'Enter your valid college roll/enrollment ID' },
              { num: '02', title: 'Browse Books', desc: 'Instant access to current catalog stock' },
              { num: '03', title: 'Borrow with 1-Click', desc: 'Auto-calculated 14-day loan duration' },
            ].map((s, i) => (
              <div key={i} style={styles.step}>
                <div style={styles.stepNum}>{s.num}</div>
                <div>
                  <p style={styles.stepTitle}>{s.title}</p>
                  <p style={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card} className="glass-card">
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Student Registration 🎓</h2>
            <p style={styles.cardSub}>Fill in your student credentials to register</p>
          </div>

          {message && <div style={styles.success}>✅ {message}</div>}
          {error && <div style={styles.error}>⚠️ {error}</div>}

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name *</label>
              <div style={styles.inputRow}>
                <FaUser style={styles.icon} />
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Kaif Patel"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>College ID / Roll No *</label>
              <div style={styles.inputRow}>
                <FaIdCard style={styles.icon} />
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. 02FE24BCI031"
                  value={form.college_id}
                  onChange={(e) => setForm({ ...form, college_id: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>College Email Address *</label>
              <div style={styles.inputRow}>
                <FaEnvelope style={styles.icon} />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="student@college.edu or email@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <div style={styles.inputRow}>
                <FaLock style={styles.icon} />
                <input
                  style={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a secure password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              {loading ? 'Creating Account...' : 'Complete Registration →'}
            </button>
          </form>

          <p style={styles.loginText}>
            Already registered? <Link to="/" style={styles.link}>Sign In to Portal</Link>
          </p>
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
    marginBottom: '36px',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  },
  stepNum: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '800',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
  },
  stepTitle: {
    color: '#1e1b4b',
    fontWeight: '700',
    fontSize: '14px',
    margin: '0 0 2px',
  },
  stepDesc: {
    color: '#64748b',
    fontSize: '13px',
    margin: 0,
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
    maxWidth: '460px',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '36px',
    boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)',
    border: '1px solid #ede9fe',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
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
  success: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#16a34a',
    fontSize: '13px',
    fontWeight: '600',
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
    gap: '16px',
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
  loginText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '13px',
  },
  link: {
    color: '#7c3aed',
    fontWeight: '700',
    textDecoration: 'none',
  },
};

export default Register;