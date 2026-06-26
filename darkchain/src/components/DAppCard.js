import React from 'react';
import { Link } from 'react-router-dom';
import { shortenAddress } from '../lib/wallet';

export default function DAppCard({ dapp }) {
  return (
    <Link to={`/dapp/${dapp.id}`} style={styles.card}>
      <div style={styles.top}>
        <div style={styles.logoWrap}>
          {dapp.logo_url ? (
            <img src={dapp.logo_url} alt={dapp.name} style={styles.logo} />
          ) : (
            <div style={styles.logoPlaceholder}>
              {dapp.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div style={styles.info}>
          <div style={styles.name}>{dapp.name}</div>
          <div style={styles.address}>{shortenAddress(dapp.contract_address)}</div>
        </div>
        <span className="tag">{dapp.category}</span>
      </div>

      <p style={styles.desc}>{dapp.description}</p>

      {dapp.tags && dapp.tags.length > 0 && (
        <div style={styles.tags}>
          {dapp.tags.slice(0, 4).map(t => (
            <span key={t} style={styles.tagItem}>#{t}</span>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <span style={styles.live}>↗ Live dApp</span>
        <span style={styles.date}>
          {new Date(dapp.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: 'block',
    background: '#0d1117',
    border: '1px solid #21262d',
    padding: 20,
    textDecoration: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logoWrap: {
    flexShrink: 0,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: 'cover',
    border: '1px solid #21262d',
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    background: '#161b22',
    border: '1px solid #21262d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#c9004a',
    fontFamily: 'Space Mono, monospace',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: 600,
    color: '#e6edf3',
    marginBottom: 2,
  },
  address: {
    fontSize: 11,
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
  },
  desc: {
    fontSize: 13,
    color: '#8b949e',
    lineHeight: 1.5,
    marginBottom: 12,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tags: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  tagItem: {
    fontSize: 11,
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #161b22',
    paddingTop: 12,
    marginTop: 4,
  },
  live: {
    fontSize: 12,
    color: '#c9004a',
    fontWeight: 500,
  },
  date: {
    fontSize: 11,
    color: '#484f58',
  },
};
