import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { get } from '../utils/api';

export default function ESGPanel() {
  const [report, setReport] = useState(null);
  const [carriers, setCarriers] = useState([]);

  useEffect(() => {
    get('/api/esg/fleet-report').then(setReport).catch(() => {});
    get('/api/esg/carriers').then(d => setCarriers(d.carriers || [])).catch(() => {});
  }, []);

  if (!report) return <div style={card}><p style={{ color: '#475569', padding: '2rem', textAlign: 'center' }}>Loading ESG data...</p></div>;

  const carrierData = Object.entries(report.carrier_emissions_kg || {}).map(([k, v]) => ({
    name: k.split(' ')[0], co2: Math.round(v / 1000),
  }));

  const CII_COLOR = { A: '#22c55e', B: '#86efac', C: '#f59e0b', D: '#f97316', E: '#ef4444' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {[
          { label: 'Total CO₂ (tonnes)', value: report.summary?.total_co2_tonnes?.toLocaleString(), color: '#22c55e', icon: '🌿' },
          { label: 'CBAM Liability', value: `€${(report.summary?.total_cbam_liability_eur||0).toLocaleString()}`, color: '#f59e0b', icon: '⚖️' },
          { label: 'Shipments Tracked', value: report.summary?.shipments_tracked, color: '#38bdf8', icon: '📊' },
          { label: 'IMO 2030 Gap', value: `${report.summary?.imo_2030_target_gap_pct}%`, color: '#a78bfa', icon: '🎯' },
        ].map(m => (
          <div key={m.label} style={{ background: '#111827', border: `1px solid ${m.color}33`, borderLeft: `3px solid ${m.color}`, borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{m.icon} {m.label}</p>
            <p style={{ color: m.color, fontSize: 22, fontWeight: 700 }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Emissions by carrier */}
        <div style={card}>
          <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: '1rem' }}>CO₂ by Carrier (tonnes)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={carrierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12 }} />
              <Bar dataKey="co2" fill="#22c55e" radius={[4, 4, 0, 0]} name="CO₂ tonnes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div style={card}>
          <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: '1rem' }}>Monthly CO₂ Trend vs Target</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={report.monthly_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="co2_tonnes" stroke="#22c55e" strokeWidth={2} dot={false} name="Actual" />
              <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CII Ratings */}
      <div style={card}>
        <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: '1rem' }}>Carrier CII Ratings 2026</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
          {carriers.map(c => (
            <div key={c.carrier} style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', border: `1px solid ${CII_COLOR[c.cii_rating] || '#334155'}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500 }}>{c.carrier}</span>
                <span style={{ background: (CII_COLOR[c.cii_rating]||'#64748b')+'33', color: CII_COLOR[c.cii_rating]||'#64748b', padding: '1px 7px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{c.cii_rating}</span>
              </div>
              <p style={{ color: '#475569', fontSize: 10 }}>Green fuel: {c.green_fuel_pct}%</p>
              <div style={{ background: '#1e293b', borderRadius: 3, height: 4, marginTop: 4 }}>
                <div style={{ width: `${Math.min(c.cii_score * 80, 100)}%`, height: '100%', background: CII_COLOR[c.cii_rating]||'#64748b', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance status */}
      <div style={card}>
        <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: '1rem' }}>Regulatory Compliance Status</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(report.compliance || {}).map(([k, v]) => (
            <div key={k} style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14 }}>{v.startsWith('✓') ? '✅' : '⚠️'}</span>
              <div>
                <p style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{k.replace(/_/g, ' ')}</p>
                <p style={{ color: '#94a3b8', fontSize: 12 }}>{v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const card = { background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1.25rem' };
