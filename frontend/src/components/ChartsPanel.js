import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { get } from '../utils/api';

export default function ChartsPanel({ shipments, forecasts }) {
  const [demandData, setDemandData] = useState([]);

  useEffect(() => {
    get('/api/forecast/demand?route=Shanghai%20%E2%86%92%20Rotterdam&days=14')
      .then(r => setDemandData(r.forecast?.slice(0, 14) || []))
      .catch(() => {});
  }, []);

  const riskDist = [
    { name: 'Low', value: shipments.filter(s => s.risk_level === 'low').length, color: '#22c55e' },
    { name: 'Medium', value: shipments.filter(s => s.risk_level === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: shipments.filter(s => s.risk_level === 'high').length, color: '#f97316' },
    { name: 'Critical', value: shipments.filter(s => s.risk_level === 'critical').length, color: '#ef4444' },
  ];

  const portData = forecasts.map(f => ({
    route: f.route.split('→')[0].trim(),
    volume: f.predicted_volume_teu,
    trend: f.trend,
  }));

  const cardStyle = { background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1.25rem' };
  const titleStyle = { color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: '1rem' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      <div style={cardStyle}>
        <p style={titleStyle}>Demand Forecast — SHA→RTM (14 days)</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={demandData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} interval={3} />
            <YAxis stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12 }} />
            <Line type="monotone" dataKey="volume_teu" stroke="#38bdf8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="lower" stroke="#22c55e" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="upper" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p style={{ color: '#475569', fontSize: 10, textAlign: 'center', marginTop: 4 }}>Blue=forecast · Green=lower · Orange=upper bound</p>
      </div>

      <div style={cardStyle}>
        <p style={titleStyle}>Risk Distribution ({shipments.length} shipments)</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie data={riskDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {riskDist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1 }}>
            {riskDist.map(r => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color }} />
                <span style={{ color: '#94a3b8', fontSize: 12, flex: 1 }}>{r.name}</span>
                <span style={{ color: r.color, fontSize: 14, fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <p style={titleStyle}>Lane Volume Forecast (TEU)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={portData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis type="number" stroke="#334155" tick={{ fill: '#475569', fontSize: 10 }} />
            <YAxis type="category" dataKey="route" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 10 }} width={70} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', fontSize: 12 }} />
            <Bar dataKey="volume" fill="#7c3aed" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
