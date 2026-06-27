import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { connectWallet, payListingFee } from '../lib/wallet';
import { CATEGORIES, LISTING_FEE_LCAI } from '../lib/constants';

const STEPS = ['Connect Wallet', 'Submit Details', 'Review & Pay'];

export default function Submit({ wallet, setWallet, setSigner, signerRef }) {
  const [step, setStep] = useState(wallet ? 1 : 0);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoValid, setPromoValid] = useState(false);
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Utility',
    contract_address: '',
    live_url: '',
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

  function handleImageFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('File must be an image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  }

  function handleFormNext() {
    setError('');
    if (!form.name || !form.description || !form.live_url) {
      setError('Name, description, and live URL are required.');
      return;
    }
    setStep(2);
  }

  async function checkPromo() {
    if (!promoCode.trim()) return;
    setPromoChecking(true);
    setPromoError('');
    setPromoValid(false);
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.trim().toUpperCase())
      .eq('active', true)
      .maybeSingle();
    if (data) {
      setPromoValid(true);
    } else {
      setPromoError('Invalid or inactive promo code.');
    }
    setPromoChecking(false);
  }

  async function handlePay() {
    setError('');
    if (!agreed) { setError('You must agree to the terms before paying.'); return; }
    setLoading(true);
    try {
      // Upload image if provided — non-blocking, submission continues even if upload fails
      let logo_url = '';
      if (imageFile) {
        try {
          const ext = imageFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from('dapp-images')
            .upload(fileName, imageFile, { contentType: imageFile.type });
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from('dapp-images').getPublicUrl(fileName);
            logo_url = urlData.publicUrl;
          }
        } catch (_) {
          // Image upload failed — continue without image
        }
      }

      // Pay — skip if valid promo code
      let hash = 'PROMO-FREE';
      if (!promoValid) {
        hash = await payListingFee(signerRef.current);
      }
      setTxHash(hash);

      // Insert to DB
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
        logo_url: logo_url || null,
        tags,
        wallet_address: wallet,
        tx_hash: hash,
        status: 'pending',
      });

      if (dbErr) throw new Error(dbErr.message);
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Transaction failed or rejected.');
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

        {/* Step 1: Form */}
        {step === 1 && (
          <div style={styles.form}>
            <Field label="dApp Name *">
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

            <Field label="Tags" hint="Comma separated, e.g. blackjack, casino, cards">
              <input
                style={styles.input}
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="defi, swap, yield"
              />
            </Field>

            <Field label="dApp Image">
              <div
                style={{
                  ...styles.dropzone,
                  ...(dragOver ? styles.dropzoneActive : {}),
                }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                ) : (
                  <div style={styles.dropzoneInner}>
                    <div style={styles.dropzoneIcon}>↑</div>
                    <div style={styles.dropzoneText}>Drag & drop or click to upload</div>
                    <div style={styles.dropzoneHint}>PNG, JPG, GIF · Max 5MB</div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleImageFile(e.target.files[0])}
                />
              </div>
              {imagePreview && (
                <button
                  style={styles.removeImg}
                  onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(''); }}
                >
                  Remove image
                </button>
              )}
            </Field>

            <button className="btn-primary" onClick={handleFormNext} style={{ marginTop: 8 }}>
              Continue to Review
            </button>
          </div>
        )}

        {/* Step 2: Review & Pay */}
        {step === 2 && (
          <div style={styles.stepContent}>
            <div style={styles.feeBox}>
              <div style={styles.feeLine}>
                <span style={styles.feeKey}>dApp</span>
                <span style={styles.feeVal}>{form.name}</span>
              </div>
              <div style={styles.feeLine}>
                <span style={styles.feeKey}>Category</span>
                <span style={styles.feeVal}>{form.category}</span>
              </div>
              <div style={styles.feeLine}>
                <span style={styles.feeKey}>Amount</span>
                <span style={styles.feeVal}>{LISTING_FEE_LCAI} LCAI</span>
              </div>
              <div style={styles.feeLine}>
                <span style={styles.feeKey}>Network</span>
                <span style={styles.feeVal}>LightChain AI (9200)</span>
              </div>
            </div>

            {/* Promo Code */}
            <div style={styles.promoBox}>
              <div style={styles.promoRow}>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="Promo code (optional)"
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value); setPromoValid(false); setPromoError(''); }}
                />
                <button
                  className="btn-ghost"
                  onClick={checkPromo}
                  disabled={promoChecking || !promoCode.trim()}
                  style={{ fontSize: 13, padding: '10px 16px', whiteSpace: 'nowrap' }}
                >
                  {promoChecking ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {promoValid && (
                <div style={styles.promoSuccess}>✓ Promo applied — listing is free!</div>
              )}
              {promoError && (
                <div style={styles.promoErr}>{promoError}</div>
              )}
            </div>

            {/* Disclaimer */}
            <div style={styles.disclaimer}>
              <p style={styles.disclaimerText}>
                By submitting, you agree to the following:
              </p>
              <ul style={styles.disclaimerList}>
                <li>The listing fee of <strong style={{ color: '#e6edf3' }}>{LISTING_FEE_LCAI} LCAI is non-refundable</strong>, even if your submission is rejected.</li>
                <li>Content involving child exploitation, pornography, or death-related media is strictly forbidden and will be permanently removed.</li>
                <li>DarkChain reserves the right to remove any listing that violates these terms without notice or refund.</li>
              </ul>
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>I have read and agree to the above terms</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn-ghost" onClick={() => setStep(1)} disabled={loading} style={{ fontSize: 13, padding: '10px 20px' }}>
                Back
              </button>
              <button
                className="btn-primary"
                onClick={handlePay}
                disabled={loading || !agreed}
                style={{ fontSize: 13, padding: '10px 20px' }}
              >
                {loading ? 'Processing...' : promoValid ? 'Submit for Free' : `Pay ${LISTING_FEE_LCAI} LCAI & Submit`}
              </button>
            </div>
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
  stepActive: { background: '#c9004a', borderColor: '#c9004a', color: '#fff' },
  stepDone: { background: '#0d2818', borderColor: '#238636', color: '#3fb950' },
  stepLabel: { fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' },
  stepLine: { width: 32, height: 1, background: '#21262d', margin: '0 8px' },
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
  disclaimer: {
    background: '#0d1117',
    border: '1px solid #30363d',
    padding: 16,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#8b949e',
    marginBottom: 10,
  },
  disclaimerList: {
    fontSize: 13,
    color: '#8b949e',
    lineHeight: 1.7,
    paddingLeft: 20,
    marginBottom: 16,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    fontSize: 13,
    color: '#e6edf3',
    cursor: 'pointer',
  },
  checkbox: {
    marginTop: 2,
    accentColor: '#c9004a',
    flexShrink: 0,
  },
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
  },
  dropzone: {
    width: '100%',
    minHeight: 160,
    background: '#0d1117',
    border: '2px dashed #21262d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    overflow: 'hidden',
  },
  dropzoneActive: {
    borderColor: '#c9004a',
  },
  dropzoneInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 24,
  },
  dropzoneIcon: {
    fontSize: 28,
    color: '#484f58',
  },
  dropzoneText: {
    fontSize: 14,
    color: '#8b949e',
  },
  dropzoneHint: {
    fontSize: 11,
    color: '#484f58',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    display: 'block',
  },
  removeImg: {
    background: 'none',
    border: 'none',
    color: '#484f58',
    fontSize: 12,
    cursor: 'pointer',
    marginTop: 6,
    padding: 0,
    textDecoration: 'underline',
  },
  promoBox: {
    marginBottom: 20,
  },
  promoRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  promoSuccess: {
    color: '#3fb950',
    fontSize: 13,
    marginTop: 8,
  },
  promoErr: {
    color: '#ff6b9d',
    fontSize: 13,
    marginTop: 8,
  },
  successBox: { textAlign: 'center', padding: '80px 0' },
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