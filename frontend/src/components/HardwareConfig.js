import React, { useState, useEffect } from 'react';
import { get } from '../utils/api';

export default function HardwareConfig() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    get('/api/hardware/status').then(setStatus).catch(() => {});
  }, []);

  if (!status) return (
    <div style={card}>
      <p style={{ color: '#475569', padding: '2rem', textAlign: 'center' }}>Loading hardware config...</p>
    </div>
  );

  const comps = status.components || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Mode banner */}
      <div style={{ background: '#0c2340', border: '1px solid #38bdf8', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 32 }}>💻</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#38bdf8', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {status.system_mode === 'full_software' ? '100% Software Mode' : '⚡ Hybrid Mode'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>{status.note}</p>
        </div>
        <div style={{ background: '#22c55e22', border: '1px solid #22c55e44', borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
          <p style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>✓</p>
          <p style={{ color: '#22c55e', fontSize: 11, fontWeight: 600 }}>RUNNING</p>
        </div>
      </div>

      {/* Components grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 10 }}>
        {Object.entries(comps).map(([key, comp]) => (
          <div key={key} style={{
            background: '#111827',
            border: `1px solid ${comp.enabled ? '#22c55e44' : '#1e3a5f'}`,
            borderLeft: `3px solid ${comp.enabled ? '#22c55e' : '#38bdf8'}`,
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>
                {key === 'ais_stream' ? '📡' : key === 'gps_tracker' ? '🛰️' :
                 key === 'iot_sensors' ? '🌡️' : key === 'quantum_backend' ? '⚛️' :
                 key === 'llm_api' ? '🧠' : key === 'weather_api' ? '🌦️' : '📰'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <span style={{
                    background: comp.enabled ? '#22c55e22' : '#38bdf822',
                    color: comp.enabled ? '#22c55e' : '#38bdf8',
                    padding: '1px 7px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                  }}>
                    {comp.enabled ? 'HARDWARE' : 'SOFTWARE SIM'}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5, marginBottom: 6 }}>
                  {comp.description}
                </p>
                <p style={{ color: comp.enabled ? '#22c55e' : '#38bdf8', fontSize: 12 }}>
                  {comp.status}
                </p>
              </div>
            </div>
            {!comp.enabled && comp.get_started && (
              <div style={{ background: '#0f172a', borderRadius: 6, padding: '6px 10px', marginTop: 4 }}>
                <p style={{ color: '#475569', fontSize: 10, marginBottom: 2 }}>To enable real hardware:</p>
                <p style={{ color: '#64748b', fontSize: 11 }}>{comp.get_started}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* How to enable hardware */}
      <div style={card}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, marginBottom: '1rem' }}>
          🔌 How to Enable Real Hardware (All Optional)
        </h3>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
          Add any of these to your <code style={{ background: '#0f172a', padding: '1px 6px', borderRadius: 4, color: '#38bdf8', fontSize: 12 }}>.env</code> file.
          Leave them blank to keep using the software simulator — the system works identically either way.
        </p>
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '1rem', fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', lineHeight: 2 }}>
          <p style={{ color: '#475569', marginBottom: 4 }}># Copy .env.example to .env and fill in what you have:</p>
          {[
            ['AIS_STREAM_API_KEY', 'your_key_here', 'Real vessel AIS positions'],
            ['IBM_QUANTUM_TOKEN',  'your_token',    'IBM Quantum computer'],
            ['DWAVE_API_TOKEN',    'your_token',    'D-Wave quantum annealer'],
            ['ANTHROPIC_API_KEY',  'your_key',      'Claude LLM for RAG'],
            ['OPENAI_API_KEY',     'your_key',      'GPT-4 for RAG'],
            ['MQTT_BROKER_HOST',   'localhost',     'IoT sensor MQTT broker'],
            ['NOAA_API_KEY',       'your_key',      'Live weather data'],
          ].map(([k, v, comment]) => (
            <div key={k} style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#38bdf8', minWidth: 200 }}>{k}</span>
              <span style={{ color: '#64748b' }}>=</span>
              <span style={{ color: '#f59e0b', minWidth: 120 }}>{v}</span>
              <span style={{ color: '#334155' }}>  # {comment}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, background: '#0c2340', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>
            <strong style={{ color: '#38bdf8' }}>No hardware?</strong> That's perfectly fine.
            FreightMind's software simulators generate statistically accurate data based on real
            AIS patterns, NOAA weather models, and GDELT geopolitical event distributions.
            For a portfolio project or demo, the software mode is indistinguishable from real hardware.
          </p>
        </div>
      </div>
    </div>
  );
}

const card = { background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1.25rem' };
