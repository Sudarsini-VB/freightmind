import React from 'react';

const SEV_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const TYPE_ICON = {
  weather: '🌪', port_congestion: '⚓', geopolitical: '⚠️',
  customs_hold: '📋', labor_strike: '✊', cyber_attack: '🔒',
  carrier_issue: '🔧',
};

export default function DisruptionsPanel({ disruptions, onPredict }) {
  if (!disruptions.length) return (
    <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#22c55e', fontSize: 15 }}>✓ No active disruptions</p>
      <p style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>All shipments running normally</p>
    </div>
  );

  return (
    <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>
          Active Disruptions
          <span style={{ marginLeft: 8, background: '#ef444422', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>
            {disruptions.length}
          </span>
        </h3>
      </div>
      <div style={{ maxHeight: 420, overflowY: 'auto' }}>
        {disruptions.map(d => (
          <div key={d.id} style={{
            padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b',
            borderLeft: `3px solid ${SEV_COLOR[d.severity] || '#f59e0b'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{TYPE_ICON[d.type] || '⚠️'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{d.shipment_id}</span>
                  <span style={{
                    background: (SEV_COLOR[d.severity] || '#f59e0b') + '22',
                    color: SEV_COLOR[d.severity] || '#f59e0b',
                    padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                  }}>{d.severity}</span>
                  <span style={{ color: '#475569', fontSize: 11 }}>{d.type.replace('_',' ')}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>{d.description}</p>
                <p style={{ color: '#38bdf8', fontSize: 12, marginBottom: 6, fontStyle: 'italic' }}>
                  💡 {d.ai_recommendation}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b' }}>
                  <span>⏱ +{d.predicted_delay_hours}h delay</span>
                  <span>💰 ${(d.financial_impact_usd/1000).toFixed(0)}K impact</span>
                  <span>🎯 {Math.round(d.confidence * 100)}% confidence</span>
                </div>
                {d.alternative_routes?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ color: '#475569', fontSize: 11, marginBottom: 4 }}>Alternative routes:</p>
                    {d.alternative_routes.map((r, i) => (
                      <div key={i} style={{ background: '#0f172a', borderRadius: 6, padding: '4px 8px', marginBottom: 3, fontSize: 11, color: '#94a3b8' }}>
                        {r.route} · +${r.extra_cost_usd?.toLocaleString()} · {r.reliability ? `${Math.round(r.reliability*100)}% reliable` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => onPredict(d.shipment_id)} style={{
                background: '#7c3aed22', color: '#a78bfa', border: '1px solid #7c3aed44',
                borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>AI Predict</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
