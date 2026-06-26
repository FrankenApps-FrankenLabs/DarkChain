import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ADMIN_PASSWORD } from '../lib/constants';
import { shortenAddress } from '../lib/wallet';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [dapps, setDapps] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
    } else {
      setPwError('Wrong password.');
    }
  }

  useEffect(() => {
    if (authed) fetchDapps();
  }, [authed, filter]);

  async function fetchDapps() {
    setLoading(true);
    const { data } = await supabase
      .from('dapps')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false });
    setDapps(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    await supabase.from('dapps').update({ status }).eq('id', id);
    fetchDapps();
  }

  async function deleteDapp(id) {
    if (!window.confirm('Delete this listing permanently?')) return;
    await supabase.from('dapps').delete().eq('id', id);
    fetchDapps();
  }

  if (!authed) {
    return (
      <div style={styles.page}>
        <div style={styles.loginBox}>
          <h2 style={styles.loginTitle}>ADMIN</h2>
          <input
            type="password"
            style={styles.input}
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          {pwError && <div style={styles.err}>{pwError}</div>}
          <button className="btn-primary" onClick={handleLogin} style={{ width: '100%' }}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Panel</h1>
          <div style={styles.filterBtns}>
            {['pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f ? styles.filterBtnActive : {}),
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : dapps.length === 0 ? (
          <div style={styles.empty}>No {filter} submissions.</div>
        ) : (
          <div style={styles.list}>
            {dapps.map(d => (
              <div key={d.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.cardName}>{d.name}</div>
                    <div style={styles.cardMeta}>
                      {d.category} · {shortenAddress(d.wallet_address)} ·{' '}
                      {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`status-${d.status}`} style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>
                    {d.status}
                  </span>
                </div>

                <p style={styles.cardDesc}>{d.description}</p>

                <div style={styles.cardLinks}>
                  <a href={d.live_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                    ↗ Live URL
                  </a>
                  {d.contract_address && (
                    <span style={styles.mono}>{d.contract_address}</span>
                  )}
                  {d.tx_hash && (
                    <span style={styles.mono}>tx: {d.tx_hash.slice(0, 20)}...</span>
                  )}
                </div>

                <div style={styles.actions}>
                  {d.status !== 'approved' && (
                    <button
                      className="btn-primary"
                      onClick={() => updateStatus(d.id, 'approved')}
                      style={{ padding: '7px 16px', fontSize: 13 }}
                    >
                      Approve
                    </button>
                  )}
                  {d.status !== 'rejected' && (
                    <button
                      className="btn-ghost"
                      onClick={() => updateStatus(d.id, 'rejected')}
                      style={{ padding: '7px 16px', fontSize: 13 }}
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteDapp(d.id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', padding: '48px 24px' },
  loginBox: {
    maxWidth: 320,
    margin: '120px auto 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  loginTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 24,
    color: '#e6edf3',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: '0.1em',
  },
  input: {
    width: '100%',
    background: '#0d1117',
    border: '1px solid #21262d',
    color: '#e6edf3',
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
  },
  err: { color: '#ff6b9d', fontSize: 13 },
  container: { maxWidth: 900, margin: '0 auto' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 28,
    color: '#e6edf3',
  },
  filterBtns: { display: 'flex', gap: 8 },
  filterBtn: {
    background: 'transparent',
    border: '1px solid #21262d',
    color: '#8b949e',
    padding: '6px 14px',
    fontSize: 12,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
  },
  filterBtnActive: {
    borderColor: '#c9004a',
    color: '#c9004a',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: '#0d1117',
    border: '1px solid #21262d',
    padding: 20,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#e6edf3',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
  },
  cardDesc: {
    fontSize: 13,
    color: '#8b949e',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  cardLinks: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  link: {
    color: '#c9004a',
    fontSize: 13,
    textDecoration: 'none',
  },
  mono: {
    fontSize: 11,
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
  },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  deleteBtn: {
    background: 'transparent',
    border: '1px solid #30363d',
    color: '#484f58',
    padding: '7px 16px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'Space Grotesk, sans-serif',
    transition: 'color 0.15s, border-color 0.15s',
  },
  empty: {
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
    fontSize: 13,
    textAlign: 'center',
    padding: '60px 0',
  },
};
