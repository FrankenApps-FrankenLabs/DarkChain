import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { shortenAddress } from '../lib/wallet';

export default function Navbar({ wallet, onConnect }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
          <span style={styles.logoAccent}>DARK</span>
          <span style={styles.logoMain}>CHAIN</span>
          <span style={styles.logoDot} />
        </Link>

        {/* Desktop links */}
        <div className="nav-links">
          <Link to="/" style={{
            ...styles.link,
            ...(location.pathname === '/' ? styles.linkActive : {})
          }}>Index</Link>
          <Link to="/submit" style={{
            ...styles.link,
            ...(location.pathname === '/submit' ? styles.linkActive : {})
          }}>List dApp</Link>
        </div>

        {/* Desktop wallet */}
        <div className="nav-right">
          {wallet ? (
            <div style={styles.walletBadge}>
              <span style={styles.walletDot} />
              {shortenAddress(wallet)}
            </div>
          ) : (
            <button className="btn-primary" onClick={onConnect} style={styles.connectBtn}>
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Index</Link>
          <Link to="/submit" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>List dApp</Link>
          <div style={{ height: 16 }} />
          {wallet ? (
            <div style={styles.mobileWallet}>
              <span style={styles.walletDot} />
              {shortenAddress(wallet)}
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={() => { onConnect(); setMenuOpen(false); }}
              style={{ padding: '12px 24px', fontSize: '16px', width: '100%' }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    borderBottom: '1px solid #21262d',
    background: 'rgba(8,10,15,0.95)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0 48px',
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoAccent: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 'clamp(16px, 3vw, 26px)',
    fontWeight: 700,
    color: '#c9004a',
    letterSpacing: '0.08em',
  },
  logoMain: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 'clamp(16px, 3vw, 26px)',
    fontWeight: 700,
    color: '#e6edf3',
    letterSpacing: '0.08em',
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#c9004a',
    marginLeft: 6,
    marginBottom: 10,
    boxShadow: '0 0 8px #c9004a',
    flexShrink: 0,
  },
  link: {
    color: '#8b949e',
    fontSize: 18,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.15s',
    letterSpacing: '0.02em',
  },
  linkActive: { color: '#e6edf3' },
  connectBtn: { padding: '12px 24px', fontSize: '16px' },
  walletBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#0d1117',
    border: '1px solid #21262d',
    padding: '10px 20px',
    fontSize: 16,
    fontFamily: 'Space Mono, monospace',
    color: '#8b949e',
  },
  walletDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: '#3fb950',
    boxShadow: '0 0 6px #3fb950',
    flexShrink: 0,
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #21262d',
    background: '#080a0f',
    padding: '16px 24px 24px',
  },
  mobileLink: {
    color: '#8b949e',
    fontSize: 18,
    fontWeight: 500,
    textDecoration: 'none',
    padding: '14px 0',
    borderBottom: '1px solid #21262d',
    letterSpacing: '0.02em',
  },
  mobileWallet: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#8b949e',
    fontSize: 14,
    fontFamily: 'Space Mono, monospace',
  },
};