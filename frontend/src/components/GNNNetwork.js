import React, { useState, useEffect } from 'react';
import { get, post } from '../utils/api';

const NODE_COLOR = { port: '#38bdf8', warehouse: '#a78bfa', factory: '#f59e0b' };

export default function GNNNetwork() {
  const [data, setData] = useState(null);
  const [stress, setStress] = useState(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    get('/api/gnn/graph').then(setData).catch(() => {});
    get('/api/gnn/network-stress').then(setStress).catch(() => {});
  }, []);

  const runPropagation = async () => {
    if (!selected.length) return;
    const result = await post('/api/gnn/propagate', { disrupted_nodes: selected });
    setStress(result);
  };

  const nodeRisks = stress?.node_risks || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <span style={{ fontSize: 20 }}>🕸️</span>
          <div>
            <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>GNN Supply Chain Graph</h3>
            <p style={{ color: '#475569', fontSize: 11 }}>Graph Neural Network · {data?.nodes?.length || 0} nodes · {data?.edges?.length || 0} edges</p>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>Click nodes to simulate disruption propagation:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(data?.nodes || []).map(n => {
              const risk = nodeRisks[n.id]?.risk || 0;
              const isSelected = selected.includes(n.id);
              return (
                <button key={n.id} onClick={() => {
                  setSelected(prev => prev.includes(n.id) ? prev.filter(x=>x!==n.id) : [...prev, n.id]);
                }} style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  background: isSelected ? '#ef444433' : risk > 0.7 ? '#f9741622' : risk > 0.5 ? '#f59e0b22' : '#1e293b',
                  color: isSelected ? '#ef4444' : NODE_COLOR[n.type] || '#94a3b8',
                  border: `1px solid ${isSelected ? '#ef4444' : NODE_COLOR[n.type] + '44' || '#334155'}`,
                  fontWeight: isSelected ? 700 : 400,
                }}>
                  {n.name}
                  {risk > 0 && <span style={{ marginLeft: 4, opacity: 0.7 }}>{Math.round(risk*100)}%</span>}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={runPropagation} disabled={!selected.length} style={{
          width: '100%', background: selected.length ? '#7c3aed' : '#1e293b',
          color: '#fff', border: 'none', borderRadius: 8, padding: '9px',
          fontSize: 13, fontWeight: 600, cursor: selected.length ? 'pointer' : 'not-allowed', marginBottom: '1rem',
        }}>
          🕸️ Simulate Disruption Propagation
        </button>

        <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
          {[['port','Port'],['warehouse','Warehouse'],['factory','Factory']].map(([t,l]) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: NODE_COLOR[t] }} />
              <span style={{ color: '#64748b' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>
          Propagation Analysis
        </h3>
        {stress ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Network Stress', value: `${Math.round(stress.network_stress_index*100)}%`, color: stress.network_stress_index>0.6?'#ef4444':stress.network_stress_index>0.4?'#f59e0b':'#22c55e' },
                { label: 'Affected Nodes', value: `${stress.affected_nodes_count}/${stress.total_nodes}`, color: '#f97316' },
              ].map(m => (
                <div key={m.label} style={{ background: '#0f172a', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: 10, marginBottom: 3 }}>{m.label}</p>
                  <p style={{ color: m.color, fontSize: 18, fontWeight: 700 }}>{m.value}</p>
                </div>
              ))}
            </div>
            <p style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>Critical propagation path:</p>
            {(stress.critical_propagation_path || []).map((n, i) => (
              <div key={n.node} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ color: '#475569', fontSize: 10, minWidth: 16 }}>#{i+1}</span>
                <span style={{ color: '#e2e8f0', fontSize: 12, flex: 1 }}>{n.name}</span>
                <div style={{ width: 60, background: '#1e293b', borderRadius: 3, height: 5 }}>
                  <div style={{ width: `${n.risk*100}%`, height: '100%', background: n.risk>0.7?'#ef4444':n.risk>0.5?'#f97316':'#f59e0b', borderRadius: 3 }} />
                </div>
                <span style={{ color: n.risk>0.7?'#ef4444':'#f59e0b', fontSize: 11, minWidth: 32 }}>{Math.round(n.risk*100)}%</span>
              </div>
            ))}
            <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
              <p style={{ color: '#64748b', fontSize: 10, marginBottom: 3 }}>Method</p>
              <p style={{ color: '#94a3b8', fontSize: 11 }}>{stress.method}</p>
            </div>
          </>
        ) : <p style={{ color: '#475569', fontSize: 13 }}>Select nodes and run simulation</p>}
      </div>
    </div>
  );
}

const card = { background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1.25rem' };
