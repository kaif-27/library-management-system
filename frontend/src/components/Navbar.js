import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUser, logout } from '../utils';
import { FaBook, FaSignOutAlt, FaTachometerAlt, FaBookOpen, FaUserShield, FaGraduationCap } from 'react-icons/fa';

const Navbar = () => {
  const user = getUser();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <Link to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/'} style={styles.logoLink}>
        <div style={styles.logoIcon}>
          <FaBook size={18} color="white" />
        </div>
        <div>
          <span style={styles.logoText}>LibraryPro</span>
          <span style={styles.logoSub}>Cloud System</span>
        </div>
      </Link>

      <div style={styles.links}>
        {user ? (
          <>
            {user.role === 'admin' ? (
              <>
                <Link style={isActive('/admin') ? styles.activeLink : styles.link} to="/admin">
                  <FaTachometerAlt /> Dashboard
                </Link>
                <Link style={isActive('/books') ? styles.activeLink : styles.link} to="/books">
                  <FaBookOpen /> Manage Books
                </Link>
              </>
            ) : (
              <>
                <Link style={isActive('/student') ? styles.activeLink : styles.link} to="/student">
                  <FaTachometerAlt /> Browse Library
                </Link>
                <Link style={isActive('/mybooks') ? styles.activeLink : styles.link} to="/mybooks">
                  <FaBookOpen /> My Borrowed Books
                </Link>
              </>
            )}

            <div style={styles.userBox}>
              <div style={styles.avatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.nameRow}>
                  <p style={styles.userName}>{user.name}</p>
                  <span style={user.role === 'admin' ? styles.adminBadge : styles.studentBadge}>
                    {user.role === 'admin' ? <><FaUserShield size={10} /> ADMIN</> : <><FaGraduationCap size={10} /> STUDENT</>}
                  </span>
                </div>
                {user.college_id && (
                  <p style={styles.collegeId}>ID: {user.college_id}</p>
                )}
              </div>
            </div>

            <button style={styles.logoutBtn} onClick={logout} title="Sign Out">
              <FaSignOutAlt /> <span style={styles.logoutText}>Logout</span>
            </button>
          </>
        ) : (
          <div style={styles.authLinks}>
            <Link style={isActive('/') ? styles.activeLink : styles.link} to="/">Sign In</Link>
            <Link style={styles.registerBtn} to="/register">Create Account</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '12px 32px',
    borderBottom: '1px solid #ede9fe',
    boxShadow: '0 4px 20px rgba(124,58,237,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1e1b4b',
    letterSpacing: '-0.4px',
    display: 'block',
    lineHeight: '1.2',
  },
  logoSub: {
    fontSize: '11px',
    color: '#8b5cf6',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#475569',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '10px',
    transition: 'all 0.2s',
  },
  activeLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: '#7c3aed',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    padding: '8px 16px',
    borderRadius: '10px',
    backgroundColor: '#f5f3ff',
    boxShadow: 'inset 0 0 0 1px #ddd6fe',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fcfaff',
    border: '1px solid #ede9fe',
    padding: '6px 14px',
    borderRadius: '12px',
    marginLeft: '6px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  userName: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e1b4b',
  },
  adminBadge: {
    fontSize: '10px',
    fontWeight: '800',
    background: '#fee2e2',
    color: '#dc2626',
    padding: '2px 6px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },
  studentBadge: {
    fontSize: '10px',
    fontWeight: '800',
    background: '#ede9fe',
    color: '#7c3aed',
    padding: '2px 6px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },
  collegeId: {
    margin: 0,
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '500',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: '1px solid #ffe4e6',
    padding: '8px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.2s',
  },
  logoutText: {
    display: 'inline',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  registerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    textDecoration: 'none',
    padding: '9px 18px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
  },
};

export default Navbar;