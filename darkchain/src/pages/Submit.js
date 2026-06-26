import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { connectWallet, payListingFee } from '../lib/wallet';
import { CATEGORIES, LISTING_FEE_LCAI } from '../lib/constants';

const STEPS = ['Connect Wallet', 'Pay Fee', 'Submit Details'];

export default function Submit({ wallet, setWallet, setSigner, signerRef }) {
  const [step, setStep] = useState(wallet ? 1 : 0);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Utility',
    contract_address: '',
    live_url: '',
    logo_url: '',
    tags: '',
  });

  async function handleConnect() {
    setError('');
    setLoading(true);
    try {
      const { address, signer } = await connectWallet();
      setWallet(address);
      signerRef.current = signer;
      setSigner(signer);
      setStep(1);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function handlePay() {
    setError('');
    setLoading(true);
    try {
      const hash = await payListingFee(signerRef.current);
      setTxHash(hash);
      setStep(2);
    } catch (e) {
      setError(e.message || 'Transaction failed or rejected.');
    }
    setLoading(false);
  }

  async function handleSubmit() {
    setError('');
    if (!form.name || !form.description || !form.live_url) {
      setError('Name, description, and live URL are required.');
      return;
    }
    setLoading(true);
    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      const { error: dbErr } = await supabase.from('dapps').insert({
        name: form.name,
        description: form.description,
        category: form.category,
        contract_address: form.contract_address || null,
        live_url: form.live_url,
        logo_url: form.logo_url || null,
        tags,
        wallet_address: wallet,
        tx_hash: txHash,
        status: 'pending',
      });

      if (dbErr) throw new Error(dbErr.message);
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Submission received</h2>
            <p style={styles.successText}>
              Your dApp is pending review. Once approved it'll appear in the index.
              Usually within 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>List Your dApp</h1>
          <p style={styles.sub}>
            One-time listing fee: <span style={styles.fee}>{LISTING_FEE_LCAI} LCAI</span>
          </p>
        </div>

        {/* Step indicator */}
        <div style={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s} style={styles.stepWrap}>
              <div style={{
                ...styles.stepNum,
                ...(i === step ? styles.stepActive : {}),
                ...(i < step ? styles.stepDone : {}),
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{
                ...styles.stepLabel,
                color: i === step ? '#e6edf3' : '#484f58',
              }}>{s}</span>
              {i < STEPS.length - 1 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* Step 0: Connect */}
        {step === 0 && (
          <div style={styles.stepContent}>
            <p style={styles.stepDesc}>Connect your LightChain wallet to continue.</p>
            <button className="btn-primary" onClick={handleConnect} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}

        {/* Step 1: Pay */}
        {step === 1 && (
          <div style={styles.stepContent}>
            <p style={styles.stepDesc}>
              Send <strong style={{ color: '#e6edf3' }}>{LISTING_FEE_LCAI} LCAI</strong> to
              complete your listing. This is a one-time fee.
            </p>
            <div style={styles.feeBox}>
              <div style={styles.feeLine}>
                <span style={styles.feeKey}>Amount</span>
                <span style={styles.feeVal}>{LISTING_FEE_LCAI} LCAI</span>
              </div>
              <div style={styles.feeLine}>
                <span style={styles.feeKey}>Network</span>
                <span style={styles.feeVal}>LightChain AI (9200)</span>
              </div>
            </div>
            <button className="btn-primary" onClick={handlePay} disabled={loading}>
              {loading ? 'Waiting for transaction...' : `Pay ${LISTING_FEE_LCAI} LCAI`}
            </button>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <div style={styles.form}>
            {txHash && (
              <div className="success-msg" style={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                Payment confirmed · {txHash.slice(0, 20)}...
              </div>
            )}

            <Field label="dApp Name *" required>
              <input
                style={styles.input}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. FrankenBet"
                maxLength={60}
              />
            </Field>

            <Field label="Description *">
              <textarea
                style={{ ...styles.input, height: 100, resize: 'vertical' }}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What does your dApp do? Keep it clear and concise."
                maxLength={400}
              />
            </Field>

            <Field label="Category *">
              <select
                style={styles.input}
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Live URL *">
              <input
                style={styles.input}
                value={form.live_url}
                onChange={e => setForm({ ...form, live_url: e.target.value })}
                placeholder="https://yourdapp.vercel.app"
              />
            </Field>

            <Field label="Contract Address">
              <input
                style={styles.input}
                value={form.contract_address}
                onChange={e => setForm({ ...form, contract_address: e.target.value })}
                placeholder="0x..."
              />
            </Field>

            <Field label="Logo URL">
              <input
                style={styles.input}
                value={form.logo_url}
                onChange={e => setForm({ ...form, logo_url: e.target.value })}
                placeholder="https://... (optional)"
              />
            </Field>

            <Field label="Tags" hint="Comma separated, e.g. blackjack, casino, cards">
              <input
                style={styles.input}
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="defi, swap, yield"
              />
            </Field>

            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={styles.label}>{label}</label>
      {hint && <div style={styles.hint}>{hint}</div>}
      {children}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', padding: '48px 24px' },
  container: { maxWidth: 600, margin: '0 auto' },
  header: { marginBottom: 40 },
  title: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 32,
    fontWeight: 700,
    color: '#e6edf3',
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: '#8b949e' },
  fee: { color: '#c9004a', fontWeight: 600 },
  steps: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 40,
    gap: 0,
  },
  stepWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  stepNum: {
    width: 28,
    height: 28,
    background: '#161b22',
    border: '1px solid #30363d',
    color: '#484f58',
    fontSize: 12,
    fontFamily: 'Space Mono, monospace',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepActive: {
    background: '#c9004a',
    borderColor: '#c9004a',
    color: '#fff',
  },
  stepDone: {
    background: '#0d2818',
    borderColor: '#238636',
    color: '#3fb950',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  stepLine: {
    width: 32,
    height: 1,
    background: '#21262d',
    margin: '0 8px',
  },
  stepContent: { padding: '32px 0' },
  stepDesc: { color: '#8b949e', fontSize: 14, marginBottom: 24, lineHeight: 1.6 },
  feeBox: {
    background: '#0d1117',
    border: '1px solid #21262d',
    padding: 16,
    marginBottom: 24,
  },
  feeLine: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #161b22',
  },
  feeKey: { fontSize: 13, color: '#8b949e' },
  feeVal: { fontSize: 13, color: '#e6edf3', fontFamily: 'Space Mono, monospace' },
  form: { paddingTop: 8 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#8b949e',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  hint: { fontSize: 11, color: '#484f58', marginBottom: 6 },
  input: {
    width: '100%',
    background: '#0d1117',
    border: '1px solid #21262d',
    color: '#e6edf3',
    padding: '10px 12px',
    fontSize: 14,
    outline: 'none',
    display: 'block',
    transition: 'border-color 0.15s',
  },
  successBox: {
    textAlign: 'center',
    padding: '80px 0',
  },
  successIcon: {
    width: 64,
    height: 64,
    background: '#0d2818',
    border: '1px solid #238636',
    color: '#3fb950',
    fontSize: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  successTitle: {
    fontFamily: 'Space Mono, monospace',
    fontSize: 24,
    color: '#e6edf3',
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#8b949e',
    lineHeight: 1.6,
    maxWidth: 360,
    margin: '0 auto',
  },
};
