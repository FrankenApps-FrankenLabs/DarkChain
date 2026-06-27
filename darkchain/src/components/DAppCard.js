import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function DAppCard({ dapp, wallet }) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchLikes = useCallback(async () => {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('dapp_id', dapp.id);
    setLikes(count || 0);

    if (wallet) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('dapp_id', dapp.id)
        .eq('wallet_address', wallet.toLowerCase())
        .maybeSingle();
      setLiked(!!data);
    }
  }, [dapp.id, wallet]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  async function handleLike(e) {
    e.stopPropagation();
    if (!wallet) { alert('Connect your wallet to like dApps.'); return; }
    if (liked) return;
    await supabase.from('likes').insert({
      dapp_id: dapp.id,
      wallet_address: wallet.toLowerCase(),
    });
    setLiked(true);
    setLikes(l => l + 1);
  }

  async function handleReport(e) {
    e.stopPropagation();
    setReportOpen(true);
  }

  async function submitReport(e) {
    e.stopPropagation();
    if (!reportText.trim()) return;
    setReportLoading(true);
    await supabase.from('reports').insert({
      dapp_id: dapp.id,
      wallet_address: wallet ? wallet.toLowerCase() : 'anonymous',
      reason: reportText.trim(),
    });
    setReportLoading(false);
    setReportSent(true);
    setTimeout(() => { setReportOpen(false); setReportSent(false); setReportText(''); }, 2000);
  }

  return (
    <div style={styles.card}>
      {/* Image — clicks to live URL */}
      <a href={dapp.live_url} target="_blank" rel="noopener noreferrer" style={styles.imageLink}>
        {dapp.logo_url ? (
          <img src={dapp.logo_url} alt={dapp.name} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span style={styles.placeholderText}>{dapp.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <span className="tag" style={styles.categoryBadge}>{dapp.category}</span>
      </a>

      {/* Bottom row */}
      <div style={styles.bottom}>
        {/* Info — also clicks to live URL */}
        <a href={dapp.live_url} target="_blank" rel="noopener noreferrer" style={styles.infoLink}>
          <div style={styles.name}>{dapp.name}</div>
          <p style={styles.desc}>{dapp.description}</p>
          {dapp.tags && dapp.tags.length > 0 && (
            <div style={styles.tags}>
              {dapp.tags.slice(0, 3).map(t => (
                <span key={t} style={styles.tagItem}>#{t}</span>
              ))}
            </div>
          )}
        </a>

        {/* Like + Report */}
        <div style={styles.actions}>
          <button
            onClick={handleLike}
            style={{ ...styles.actionBtn, ...(liked ? styles.actionBtnLiked : {}) }}
            title={liked ? 'Already liked' : 'Like'}
          >
            <span style={styles.actionIcon}>♥</span>
            <span style={styles.actionCount}>{likes}</span>
          </button>
          <button
            onClick={handleReport}
            style={styles.actionBtn}
            title="Report"
          >
            <span style={styles.actionIcon}>⚑</span>
          </button>
        </div>
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div style={styles.modalOverlay} onClick={() => setReportOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>Report dApp</div>
            {reportSent ? (
              <div style={{ color: '#3fb950', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
                Report submitted. Thanks.
              </div>
            ) : (
              <>
                <p style={styles.modalDesc}>Briefly describe the issue:</p>
                <textarea
                  style={styles.reportInput}
                  placeholder="e.g. broken link, scam, inappropriate content..."
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <div style={styles.modalActions}>
                  <button className="btn-ghost" onClick={() => setReportOpen(false)} style={{ fontSize: 13, padding: '8px 16px' }}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={submitReport} disabled={reportLoading || !reportText.trim()} style={{ fontSize: 13, padding: '8px 16px' }}>
                    {reportLoading ? 'Sending...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#0d1117',
    border: '1px solid #21262d',
    overflow: 'hidden',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    position: 'relative',
  },
  imageLink: {
    display: 'block',
    position: 'relative',
    textDecoration: 'none',
  },
  image: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    display: 'block',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    background: '#161b22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #21262d',
  },
  placeholderText: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 48,
    fontWeight: 700,
    color: '#c9004a',
    opacity: 0.4,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bottom: {
    display: 'flex',
    gap: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoLink: {
    flex: 1,
    textDecoration: 'none',
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: '#e6edf3',
    marginBottom: 6,
    fontFamily: 'Space Mono, monospace',
  },
  desc: {
    fontSize: 13,
    color: '#8b949e',
    lineHeight: 1.5,
    marginBottom: 8,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tags: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagItem: {
    fontSize: 11,
    color: '#484f58',
    fontFamily: 'Space Mono, monospace',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
  },
  actionBtn: {
    background: 'transparent',
    border: '1px solid #21262d',
    color: '#484f58',
    width: 48,
    height: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: 2,
    transition: 'all 0.15s',
  },
  actionBtnLiked: {
    borderColor: '#c9004a',
    color: '#c9004a',
  },
  actionIcon: { fontSize: 16, lineHeight: 1 },
  actionCount: { fontSize: 11, fontFamily: 'Space Mono, monospace', lineHeight: 1 },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    background: '#0d1117',
    border: '1px solid #21262d',
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 16,
    color: '#e6edf3',
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 13,
    color: '#8b949e',
    marginBottom: 12,
  },
  reportInput: {
    width: '100%',
    background: '#161b22',
    border: '1px solid #21262d',
    color: '#e6edf3',
    padding: '10px 12px',
    fontSize: 13,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'Space Grotesk, sans-serif',
    marginBottom: 16,
  },
  modalActions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  },
};