import React, { useState } from 'react';

const PORTS = [
  { code: 'SHA', name: 'Shanghai' }, { code: 'SIN', name: 'Singapore' },
  { code: 'RTM', name: 'Rotterdam' }, { code: 'LAX', name: 'Los Angeles' },
  { code: 'DXB', name: 'Dubai' }, { code: 'HBG', name: 'Hamburg' },
  { code: 'PUS', name: 'Busan' }, { code: 'BOM', name: 'Mumbai' },
  { code: 'NYC', name: 'New York' }, { code: 'TYO', name: 'Tokyo' },
  { code: 'CMB', name: 'Colombo' }, { code: 'ANR', name: 'Antwerp' },
];

export default function QuantumOptimizer({ onOptimize }) {
  const [origin, setOrigin] = useState('SHA');
  const [dest, setDest] = useState('RTM');
  const [value, setValue] = useState(500000);
  const [priority, setPriority] = useState('balanced');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await onOptimize(origin, dest, value, priority);
      setResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sel = (val, onChange, opts) => (
    <select value={val} onChange={e => onChange(e.target.value)} style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
      padding: '8px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', flex: 1,
    }}>
      {opts.map(o => <option key={o.code || o.value} value={o.code || o.value}>{o.name || o.label}</option>)}
    </select>
  );

  return (
    <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1.25rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <span style={{ fontSize: 22 }}>⚛️</span>
        <div>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>Quantum Route Optimizer</h3>
          <p style={{ color: '#475569', fontSize: 11 }}>QAOA algorithm · {loading ? 'Running...' : '256 shots · 4 layers'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 4 }}>Origin Port</label>
          {sel(origin, setOrigin, PORTS)}
        </div>
        <div>
          <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 4 }}>Destination Port</label>
          {sel(dest, setDest, PORTS)}
        </div>
        <div>
          <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 4 }}>Cargo Value (USD)</label>
          <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} style={{
            width: '100%', background: '#1e293b', border: '1px solid #334155',
            borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none',
          }} />
        </div>
        <div>
          <label style={{ color: '#64748b', fontSize: 11, display: 'block', marginBottom: 4 }}>Optimization Priority</label>
          {sel(priority, setPriority, [
            { value: 'balanced', label: 'Balanced' },
            { value: 'cost', label: 'Lowest Cost' },
            { value: 'speed', label: 'Fastest' },
            { value: 'reliability', label: 'Most Reliable' },
          ])}
        </div>
      </div>

      <button onClick={run} disabled={loading || origin === dest} style={{
        width: '100%', background: loading ? '#1e3a5f' : 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
        color: '#fff', border: 'none', borderRadius: 8, padding: '11px',
        fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '1rem',
      }}>
        {loading ? '⚛️ Running QAOA Optimization...' : '⚛️ Run Quantum Optimization'}
      </button>

      {result && (
        <div style={{ background: '#0f172a', borderRadius: 10, padding: '1rem' }}>
          <p style={{ color: '#22c55e', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>✓ Optimization Complete</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Cost Saving', value: `$${result.cost_saving_usd?.toLocaleString()}`, color: '#22c55e' },
              { label: 'Time Saving', value: `${result.time_saving_days} days`, color: '#38bdf8' },
              { label: 'Reliability', value: `${Math.round(result.reliability_score * 100)}%`, color: '#a78bfa' },
            ].map(m => (
              <div key={m.label} style={{ background: '#1e293b', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <p style={{ color: '#475569', fontSize: 10, marginBottom: 2 }}>{m.label}</p>
                <p style={{ color: m.color, fontSize: 16, fontWeight: 700 }}>{m.value}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
            <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Optimized Route</p>
            <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{result.route_summary}</p>
          </div>
          <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>AI Explanation</p>
            <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5 }}>{result.explanation}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: '#475569' }}>
            <span>Backend: {result.backend}</span>
            <span>Candidates: {result.candidates_scored}</span>
            <span>Improvement: {result.improvement_pct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
