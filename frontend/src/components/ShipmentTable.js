import React, { useState } from 'react';

const RISK_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const STATUS_COLOR = {
  in_transit: '#38bdf8', at_port: '#a78bfa', customs: '#f59e0b',
  delayed: '#f97316', disrupted: '#ef4444', at_risk: '#fbbf24',
  booked: '#64748b', delivered: '#22c55e',
};

export default function ShipmentTable({ shipments, onSelect }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = shipments.filter(s => {
    if (filter !== 'all' && s.risk_level !== filter) return false;
    if (search && !s.id.toLowerCase().includes(search.toLowerCase()) &&
        !s.origin.toLowerCase().includes(search.toLowerCase()) &&
        !s.destination.toLowerCase().includes(search.toLowerCase()) &&
        !s.carrier.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, flex: 1 }}>Live Shipments</h3>
        <input
          placeholder="Search ID, origin, destination..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: 8,
            padding: '6px 12px', color: '#e2e8f0', fontSize: 13, width: 240, outline: 'none',
          }}
        />
        {['all','low','medium','high','critical'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 500,
            background: filter === f ? (RISK_COLOR[f] || '#38bdf8') : '#1e293b',
            color: filter === f ? '#fff' : '#64748b',
          }}>{f}</button>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['ID','Route','Carrier','Cargo','Status','Risk','Progress','Value','Action'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderTop: '1px solid #1e293b', background: i % 2 === 0 ? '#111827' : '#0f172a' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#111827' : '#0f172a'}>
                <td style={{ padding: '10px 12px', color: '#38bdf8', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.id}</td>
                <td style={{ padding: '10px 12px', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 11 }}>{s.origin}</span>
                  <span style={{ color: '#475569', margin: '0 4px' }}>→</span>
                  <span style={{ fontSize: 11 }}>{s.destination}</span>
                </td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.carrier}</td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: 11 }}>{s.cargo_type}</td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{
                    background: (STATUS_COLOR[s.status] || '#64748b') + '22',
                    color: STATUS_COLOR[s.status] || '#64748b',
                    padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                  }}>{s.status.replace('_',' ')}</span>
                </td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{
                    background: (RISK_COLOR[s.risk_level] || '#64748b') + '22',
                    color: RISK_COLOR[s.risk_level] || '#64748b',
                    padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  }}>{s.risk_level} {s.risk_score}</span>
                </td>
                <td style={{ padding: '10px 12px', minWidth: 100 }}>
                  <div style={{ background: '#1e293b', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      width: `${s.progress * 100}%`, height: '100%',
                      background: s.risk_level === 'critical' ? '#ef4444' : s.risk_level === 'high' ? '#f97316' : '#22c55e',
                      borderRadius: 4,
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: '#475569' }}>{Math.round(s.progress * 100)}%</span>
                </td>
                <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  ${(s.value_usd / 1000).toFixed(0)}K
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <button onClick={() => onSelect(s)} style={{
                    background: '#0ea5e933', color: '#38bdf8', border: '1px solid #0ea5e955',
                    borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                  }}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#475569', padding: '2rem', fontSize: 13 }}>No shipments match filter</p>
        )}
      </div>
    </div>
  );
}
