import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { get } from '../utils/api';

export default function DigitalTwin({ shipment }) {
  const [twin, setTwin] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shipment) return;
    setLoading(true);
    get(`/api/shipments/${shipment.id}/twin`)
      .then(d => { setTwin(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [shipment]);

  if (!shipment) return (
    <div style={card}>
      <p style={{ color: '#475569', textAlign: 'center', padding: '2rem', fontSize: 13 }}>
        Select a shipment from the table to view its Digital Twin
      </p>
    </div>
  );

  const trajData = twin?.risk_trajectory_24h?.map((r, i) => ({
    hour: i, risk: Math.round(r * 100), threshold: 75,
  })) || [];

  const scenarios = twin?.scenarios || {
    best_case: { delay_hours: 0, probability: 0.35 },
    likely: { delay_hours: 24, probability: 0.45 },
    worst_case: { delay_hours: 96, probability: 0.20 },
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <span style={{ fontSize: 22 }}>👁️</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>
            Digital Twin — {shipment.id}
          </h3>
          <p style={{ color: '#475569', fontSize: 11 }}>
            Virtual replica · Live sync every 5s · 24h risk simulation
          </p>
        </div>
        <span style={{ background: '#22c55e22', color: '#22c55e', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>LIVE</span>
      </div>

      {loading ? <p style={{ color: '#475569', fontSize: 13 }}>Syncing twin...</p> : (
        <>
          {/* Route progress */}
          <div style={{ background: '#0f172a', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{shipment.origin}</span>
              <span style={{ color: '#64748b', fontSize: 11 }}>{Math.round(shipment.progress * 100)}% complete</span>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{shipment.destination}</span>
            </div>
            <div style={{ position: 'relative', background: '#1e293b', borderRadius: 6, height: 8 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 6,
                width: `${shipment.progress * 100}%`,
                background: shipment.risk_level === 'critical' ? '#ef4444' : shipment.risk_level === 'high' ? '#f97316' : '#38bdf8',
              }} />
              <div style={{
                position: 'absolute', top: -4, width: 16, height: 16, borderRadius: '50%',
                background: '#38bdf8', border: '2px solid #0a0f1e',
                left: `calc(${shipment.progress * 100}% - 8px)`,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ color: '#475569', fontSize: 10 }}>Current: {shipment.current_location?.name || 'En route'}</span>
              <span style={{ color: '#475569', fontSize: 10 }}>ETA: {new Date(shipment.eta).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Risk trajectory chart */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>24-Hour Risk Trajectory Simulation</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={trajData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#1e293b" tick={{ fill: '#334155', fontSize: 9 }}
                       label={{ value: 'Hours', position: 'insideBottom', fill: '#334155', fontSize: 9 }} />
                <YAxis stroke="#1e293b" tick={{ fill: '#334155', fontSize: 9 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 11 }}
                         formatter={(v) => [`${v}%`, 'Risk']} />
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Alert', fill: '#ef4444', fontSize: 9 }} />
                <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario outcomes */}
          <p style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>What-If Scenarios</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { key: 'best_case', label: 'Best Case', color: '#22c55e', icon: '✓' },
              { key: 'likely', label: 'Most Likely', color: '#f59e0b', icon: '~' },
              { key: 'worst_case', label: 'Worst Case', color: '#ef4444', icon: '⚠' },
            ].map(sc => (
              <div key={sc.key} style={{ background: '#0f172a', borderRadius: 8, padding: '10px', textAlign: 'center', border: `1px solid ${sc.color}33` }}>
                <p style={{ color: sc.color, fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{sc.icon}</p>
                <p style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{sc.label}</p>
                <p style={{ color: sc.color, fontSize: 12, fontWeight: 700 }}>
                  {scenarios[sc.key].delay_hours === 0 ? 'On time' : `+${scenarios[sc.key].delay_hours}h`}
                </p>
                <p style={{ color: '#475569', fontSize: 10 }}>{Math.round(scenarios[sc.key].probability * 100)}% prob</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const card = { background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1.25rem' };
