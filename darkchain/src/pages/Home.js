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
          <h1 className="hero-title">
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
    padding: '100px 48px 80px',
  },
  heroInner: {
    maxWidth: '100%',
    margin: '0 auto',
    paddingLeft: '2vw',
  },
  eyebrow: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 15,
    color: '#484f58',
    letterSpacing: '0.1em',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  accent: { color: '#c9004a' },
  heroSub: {
    fontSize: 22,
    color: '#8b949e',
    maxWidth: 700,
    lineHeight: 1.6,
    marginBottom: 56,
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 48,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statNum: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 52,
    fontWeight: 700,
    color: '#e6edf3',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#484f58',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statDivider: {
    width: 1,
    height: 52,
    background: '#21262d',
  },
  filterBar: {
    borderBottom: '1px solid #21262d',
    background: '#080a0f',
    padding: '20px 48px',
    position: 'sticky',
    top: 80,
    zIndex: 90,
  },
  filterInner: {
    maxWidth: '100%',
    margin: '0 auto',
    display: 'flex',
    gap: 20,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  search: {
    background: '#0d1117',
    border: '1px solid #21262d',
    color: '#e6edf3',
    padding: '12px 20px',
    fontSize: 16,
    outline: 'none',
    width: 340,
  },
  cats: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  catBtn: {
    background: 'transparent',
    border: '1px solid #21262d',
    color: '#8b949e',
    padding: '8px 18px',
    fontSize: 14,
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
    maxWidth: '100%',
    margin: '0 auto',
    padding: '56px 48px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
    gap: 24,
  },
  empty: {
    color: '#484f58',
    fontSize: 18,
    textAlign: 'center',
    padding: '120px 0',
    fontFamily: 'Space Mono, monospace',
  },
};