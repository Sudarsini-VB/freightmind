import React from 'react';

const fmt = (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : String(n);

function Card({ label, value, sub, color = '#38bdf8', bg = '#0c1a2e' }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${color}33`,
      borderRadius: 12, padding: '1rem 1.25rem',
      borderLeft: `3px solid ${color}`,
    }}>
      <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{label}</p>
      <p style={{ color: color, fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{value}</p>
      {sub && <p style={{ color: '#475569', fontSize: 11 }}>{sub}</p>}
    </div>
  );
}

export default function KPICards({ kpis }) {
  if (!kpis) return null;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 12, marginBottom: 20,
    }}>
      <Card label="Total Shipments"     value={kpis.total_shipments}                     sub="Active worldwide"         color="#38bdf8" />
      <Card label="On-Time Rate"        value={`${kpis.on_time_rate}%`}                  sub="Last 24 hours"            color="#22c55e" />
      <Card label="Active Disruptions"  value={kpis.active_disruptions}                  sub="Require action"           color="#f59e0b" />
      <Card label="At-Risk Shipments"   value={kpis.at_risk_shipments}                   sub="High or critical"         color="#ef4444" />
      <Card label="Avg Risk Score"      value={`${kpis.avg_risk_score}/100`}              sub="Across all shipments"     color="#a78bfa" />
      <Card label="Cost Savings Today"  value={fmt(kpis.cost_savings_today)}             sub="AI optimization"          color="#10b981" />
      <Card label="Agent Actions"       value={kpis.autonomous_actions}                  sub="Autonomous today"         color="#f472b6" />
      <Card label="Ports Monitored"     value={kpis.ports_monitored}                     sub="Global coverage"          color="#38bdf8" />
    </div>
  );
}
