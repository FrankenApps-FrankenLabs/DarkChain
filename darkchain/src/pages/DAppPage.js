import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { shortenAddress } from '../lib/wallet';

export default function DAppPage() {
  const { id } = useParams();
  const [dapp, setDapp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('dapps')
        .select('*')
        .eq('id', id)
        .eq('status', 'approved')
        .single();
      setDapp(data);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!dapp) return (
    <div style={styles.loading}>
      dApp not found. <Link to="/" style={{ color: '#c9004a' }}>Back to index</Link>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/" style={styles.back}>← Back to index</Link>

        <div style={styles.header}>
          <div style={styles.logoWrap}>
            {dapp.logo_url ? (
              <img src={dapp.logo_url} alt={dapp.name} style={styles.logo} />
            ) : (
              <div style={styles.logoPlaceholder}>
                {dapp.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.name}>{dapp.name}</h1>
            <span className="tag">{dapp.category}</span>
          </div>
        </div>

        <p style={styles.desc}>{dapp.description}</p>

        <a
          href={dapp.live_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: 'inline-block', marginBottom: 40 }}
        >
          Launch dApp ↗
        </a>

        <div style={styles.meta}>
          {dapp.contract_address && (
            <MetaRow label="Contract"
              value={dapp.contract_address}
              mono />
          )}
          <MetaRow label="Submitter" value={dapp.wallet_address} mono />
          <MetaRow label="Listed"
            value={new Date(dapp.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric'
            })} />
          <MetaRow label="Network" value="LightChain AI · Chain 9200" />
        </div>

        {dapp.tags && dapp.tags.length > 0 && (
          <div style={styles.tags}>
            {dapp.tags.map(t => (
              <span key={t} style={styles.tagItem}>#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ label, value, mono }) {
  return (
    <div style={styles.metaRow}>
      <span style={styles.metaKey}>{label}</span>
      <span style={{
        ...styles.metaVal,
        ...(mono ? { fontFamily: 'Space Mono, monospace', fontSize: 12 } : {}),
      }}>{value}</span>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', padding: '48px 24px' },
  container: { maxWidth: 720, margin: '0 auto' },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
    gap: 8,
  },
  back: {
    display: 'inline-block',
    color: '#8b949e',
    fontSize: 13,
    marginBottom: 32,
    textDecoration: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  logoWrap: { flexShrink: 0 },
  logo: {
    width: 64,
    height: 64,
    objectFit: 'cover',
    border: '1px solid #21262d',
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    background: '#161b22',
    border: '1px solid #21262d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: '#c9004a',
    fontFamily: 'Space Mono, monospace',
  },
  headerInfo: { display: 'flex', flexDirection: 'column', gap: 8 },
  name: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 28,
    fontWeight: 700,
    color: '#e6edf3',
  },
  desc: {
    fontSize: 15,
    color: '#8b949e',
    lineHeight: 1.7,
    marginBottom: 28,
    maxWidth: 560,
  },
  meta: {
    background: '#0d1117',
    border: '1px solid #21262d',
    marginBottom: 24,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #161b22',
    gap: 16,
  },
  metaKey: {
    fontSize: 12,
    color: '#484f58',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    flexShrink: 0,
  },
  metaVal: {
    fontSize: 13,
    color: '#e6edf3',
    textAlign: 'right',
    wordBreak: 'break-all',
  },
  tags: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  tagItem: {
    fontSize: 12,
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
  },
};
