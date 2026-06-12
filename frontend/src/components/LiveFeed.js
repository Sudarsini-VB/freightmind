import React from 'react';

const EVENT_COLOR = {
  'Position updated': '#38bdf8',
  'Port entry confirmed': '#22c55e',
  'Customs cleared': '#a78bfa',
  'Risk score recalculated': '#f59e0b',
  'AI agent acted': '#f472b6',
};

export default function LiveFeed({ events, ports }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', overflow: 'hidden' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>Live Event Feed</h3>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto', padding: '0.5rem 0' }}>
          {events.length === 0 ? (
            <p style={{ color: '#475569', padding: '1rem', textAlign: 'center', fontSize: 12 }}>Waiting for live events...</p>
          ) : events.map((e, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderBottom: '1px solid #0f172a',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: EVENT_COLOR[e.event] || '#475569', flexShrink: 0,
              }} />
              <span style={{ color: '#38bdf8', fontSize: 11, fontWeight: 600, minWidth: 70 }}>{e.id}</span>
              <span style={{ color: '#94a3b8', fontSize: 11, flex: 1 }}>{e.event}</span>
              {e.risk_score && (
                <span style={{ color: e.risk_score > 60 ? '#ef4444' : '#22c55e', fontSize: 10, fontWeight: 600 }}>
                  {e.risk_score}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', overflow: 'hidden' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>Port Congestion</h3>
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto', padding: '0.5rem 0' }}>
          {ports.slice(0, 10).map(p => (
            <div key={p.code} style={{ padding: '8px 14px', borderBottom: '1px solid #0f172a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 500, flex: 1 }}>{p.name}</span>
                <span style={{ color: '#475569', fontSize: 10 }}>{p.country}</span>
                <span style={{
                  background: p.status === 'critical' ? '#ef444422' : p.status === 'high' ? '#f9741622' : '#22c55e22',
                  color: p.status === 'critical' ? '#ef4444' : p.status === 'high' ? '#f97316' : '#22c55e',
                  padding: '1px 6px', borderRadius: 8, fontSize: 10,
                }}>{p.status}</span>
              </div>
              <div style={{ background: '#1e293b', borderRadius: 3, height: 4 }}>
                <div style={{
                  width: `${p.congestion_pct}%`, height: '100%', borderRadius: 3,
                  background: p.congestion_level > 0.8 ? '#ef4444' : p.congestion_level > 0.6 ? '#f97316' : '#22c55e',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ color: '#475569', fontSize: 10 }}>{p.congestion_pct}% capacity</span>
                <span style={{ color: '#475569', fontSize: 10 }}>{p.avg_wait_days}d avg wait</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
