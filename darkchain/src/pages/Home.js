import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../lib/constants';
import DAppCard from '../components/DAppCard';

export default function Home() {
  const [dapps, setDapps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchDapps();
  }, []);

  async function fetchDapps() {
    const { data } = await supabase
      .from('dapps')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    setDapps(data || []);
    setLoading(false);
  }

  const filtered = dapps.filter(d => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || d.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.eyebrow}>LightChain AI · Chain ID 9200</div>
          <h1 style={styles.heroTitle}>
            DARK<span style={styles.accent}>CHAIN</span>
          </h1>
          <p style={styles.heroSub}>
            The index of dApps built on LightChain AI. Every project in one place.
          </p>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNum}>{dapps.length}</span>
              <span style={styles.statLabel}>Listed dApps</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>{CATEGORIES.length}</span>
              <span style={styles.statLabel}>Categories</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>9200</span>
              <span style={styles.statLabel}>Chain ID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.filterInner}>
          <input
            style={styles.search}
            placeholder="Search dApps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={styles.cats}>
            {['All', ...CATEGORIES].map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  ...styles.catBtn,
                  ...(category === c ? styles.catBtnActive : {}),
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            {dapps.length === 0
              ? 'No dApps listed yet. Be the first.'
              : 'No results found.'}
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(d => (
              <DAppCard key={d.id} dapp={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh' },
  hero: {
    borderBottom: '1px solid #21262d',
    background: 'linear-gradient(180deg, #0d0f14 0%, #080a0f 100%)',
    padding: '64px 24px 48px',
  },
  heroInner: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  eyebrow: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 11,
    color: '#484f58',
    letterSpacing: '0.1em',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 'clamp(48px, 8vw, 80px)',
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: '#e6edf3',
    marginBottom: 16,
  },
  accent: { color: '#c9004a' },
  heroSub: {
    fontSize: 16,
    color: '#8b949e',
    maxWidth: 480,
    lineHeight: 1.6,
    marginBottom: 40,
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  statNum: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 28,
    fontWeight: 700,
    color: '#e6edf3',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#484f58',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statDivider: {
    width: 1,
    height: 32,
    background: '#21262d',
  },
  filterBar: {
    borderBottom: '1px solid #21262d',
    background: '#080a0f',
    padding: '16px 24px',
    position: 'sticky',
    top: 60,
    zIndex: 90,
  },
  filterInner: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  search: {
    background: '#0d1117',
    border: '1px solid #21262d',
    color: '#e6edf3',
    padding: '8px 14px',
    fontSize: 14,
    outline: 'none',
    width: 240,
  },
  cats: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  catBtn: {
    background: 'transparent',
    border: '1px solid #21262d',
    color: '#8b949e',
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  catBtnActive: {
    background: '#c9004a',
    borderColor: '#c9004a',
    color: '#fff',
  },
  content: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 16,
  },
  empty: {
    color: '#484f58',
    fontSize: 14,
    textAlign: 'center',
    padding: '80px 0',
    fontFamily: 'Space Mono, monospace',
  },
};
