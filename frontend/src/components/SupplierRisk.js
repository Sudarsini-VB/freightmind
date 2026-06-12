import React, { useState, useEffect } from 'react';
import { get } from '../utils/api';

const RISK_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function SupplierRisk() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    get('/api/suppliers').then(d => setSuppliers(d.suppliers || [])).catch(() => {});
  }, []);

  return (
    <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>Supplier Risk Intelligence</h3>
        <p style={{ color: '#475569', fontSize: 11 }}>Multi-dimensional risk scoring across your supply base</p>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Supplier','Country','Sector','Tier','Geo Risk','Financial','On-Time','Overall Risk','Annual Spend'].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: '#475569', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={s.id} style={{ borderTop: '1px solid #1e293b', background: i%2===0?'#111827':'#0f172a' }}>
                <td style={{ padding: '9px 12px', color: '#e2e8f0', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.name}</td>
                <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{s.country}</td>
                <td style={{ padding: '9px 12px', color: '#94a3b8', whiteSpace: 'nowrap', fontSize: 11 }}>{s.sector}</td>
                <td style={{ padding: '9px 12px', color: '#64748b', textAlign: 'center' }}>{s.tier}</td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, background: '#1e293b', borderRadius: 3, height: 5 }}>
                      <div style={{ width: `${s.geo_risk*100}%`, height: '100%', background: s.geo_risk>0.6?'#ef4444':s.geo_risk>0.4?'#f59e0b':'#22c55e', borderRadius: 3 }} />
                    </div>
                    <span style={{ color: '#94a3b8', minWidth: 28, fontSize: 11 }}>{Math.round(s.geo_risk*100)}%</span>
                  </div>
                </td>
                <td style={{ padding: '9px 12px', color: s.financial_stability > 0.7 ? '#22c55e' : '#f59e0b' }}>{Math.round(s.financial_stability*100)}%</td>
                <td style={{ padding: '9px 12px', color: s.on_time_rate > 0.85 ? '#22c55e' : '#f59e0b' }}>{Math.round(s.on_time_rate*100)}%</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ background: (RISK_COLOR[s.risk_level]||'#64748b')+'22', color: RISK_COLOR[s.risk_level]||'#64748b', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                    {s.risk_level}
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  ${(s.annual_spend_usd/1000000).toFixed(1)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
