import React, { useState } from 'react';

const AGENT_ICONS = {
  RouteAgent: '🗺️', DisruptionAgent: '🔔', ComplianceAgent: '📋',
  CostAgent: '💰', DigitalTwinAgent: '👁️',
};
const ACTION_COLOR = {
  emergency_reroute: '#ef4444', preemptive_reroute: '#f97316',
  disruption_alert: '#f59e0b', compliance_auto_fix: '#38bdf8',
  consolidation: '#22c55e', rate_alert: '#a78bfa',
  twin_risk_escalation: '#f472b6',
};

export default function AgentsPanel({ agents, actions, onRunCycle }) {
  const [running, setRunning] = useState(false);
  const [cycleResult, setCycleResult] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    try {
      const r = await onRunCycle();
      setCycleResult(r);
    } catch {}
    finally { setRunning(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
      <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1.25rem' }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>AI Agents Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
          {agents.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#0f172a', borderRadius: 8, padding: '10px 12px',
            }}>
              <span style={{ fontSize: 18 }}>{AGENT_ICONS[a.name] || '🤖'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{a.name}</p>
                <p style={{ color: '#475569', fontSize: 11 }}>{a.role}</p>
              </div>
              <span style={{
                background: '#22c55e22', color: '#22c55e',
                padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              }}>{a.status}</span>
            </div>
          ))}
        </div>
        <button onClick={handleRun} disabled={running} style={{
          width: '100%', background: running ? '#1e3a5f' : '#7c3aed',
          color: '#fff', border: 'none', borderRadius: 8, padding: '10px',
          fontSize: 13, fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer',
        }}>
          {running ? '🔄 Running Cycle...' : '▶ Run Agent Cycle'}
        </button>
        {cycleResult && (
          <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px', marginTop: 10 }}>
            <p style={{ color: '#22c55e', fontSize: 12 }}>✓ Cycle complete</p>
            <p style={{ color: '#64748b', fontSize: 11 }}>Actions: {cycleResult.actions_this_cycle?.length || 0} this cycle</p>
            <p style={{ color: '#64748b', fontSize: 11 }}>Total ever: {cycleResult.total_actions_ever}</p>
          </div>
        )}
      </div>

      <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b' }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>Autonomous Action Log</h3>
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {actions.length === 0 ? (
            <p style={{ color: '#475569', padding: '1.5rem', textAlign: 'center', fontSize: 13 }}>No actions yet. Run agent cycle.</p>
          ) : actions.map(a => (
            <div key={a.id} style={{
              padding: '10px 14px', borderBottom: '1px solid #1e293b',
              borderLeft: `3px solid ${ACTION_COLOR[a.action_type] || '#475569'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 14 }}>{AGENT_ICONS[a.agent] || '🤖'}</span>
                <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{a.agent}</span>
                <span style={{
                  background: (ACTION_COLOR[a.action_type] || '#475569') + '22',
                  color: ACTION_COLOR[a.action_type] || '#475569',
                  padding: '1px 6px', borderRadius: 8, fontSize: 10,
                }}>{a.action_type.replace(/_/g, ' ')}</span>
                <span style={{ color: '#1e3a5f', fontSize: 10, marginLeft: 'auto' }}>
                  {a.shipment_id}
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 2, lineHeight: 1.4 }}>{a.description}</p>
              <p style={{ color: '#22c55e', fontSize: 11 }}>Impact: {a.estimated_impact}</p>
              <p style={{ color: '#334155', fontSize: 10, marginTop: 2 }}>
                {a.auto_executed ? '🤖 Auto-executed' : '👤 Escalated to human'} · {new Date(a.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
