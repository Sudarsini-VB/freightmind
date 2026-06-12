import React, { useState, useEffect } from 'react';
import { get } from '../utils/api';

const TYPE_ICON = { container_vessel: '🚢', truck: '🚛', reefer_truck: '❄️' };
const SEV_COLOR = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' };

export default function IoTFleet() {
  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('fleet');

  useEffect(() => {
    const fetchAll = () => {
      get('/api/iot/fleet').then(setSummary).catch(() => {});
      get('/api/iot/vehicles').then(d => setVehicles(d.vehicles || [])).catch(() => {});
      get('/api/iot/events').then(d => setEvents(d.events || [])).catch(() => {});
    };
    fetchAll();
    const interval = setInterval(fetchAll, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Summary strip */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
          {[
            { label: 'Fleet Size',        value: summary.fleet_size,                  color: '#38bdf8', icon: '🌐' },
            { label: 'Active Alerts',     value: summary.active_alerts,               color: summary.active_alerts > 0 ? '#ef4444' : '#22c55e', icon: '🔔' },
            { label: 'Critical',          value: summary.critical_alerts,             color: '#ef4444', icon: '🚨' },
            { label: 'Dark Vessels',      value: summary.dark_vessels,                color: summary.dark_vessels > 0 ? '#f97316' : '#22c55e', icon: '📡' },
            { label: 'Temp Excursions',   value: summary.temp_excursions,             color: summary.temp_excursions > 0 ? '#ef4444' : '#22c55e', icon: '🌡️' },
            { label: 'Events/min',        value: summary.telemetry_events_per_min,    color: '#a78bfa', icon: '⚡' },
            { label: 'Stream Latency',    value: `${summary.stream_latency_ms}ms`,    color: '#22c55e', icon: '⏱️' },
            { label: 'Kafka Topics',      value: summary.kafka_topics?.length || 3,   color: '#f59e0b', icon: '📨' },
          ].map(m => (
            <div key={m.label} style={{ background: '#111827', border: `1px solid ${m.color}33`, borderLeft: `3px solid ${m.color}`, borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ color: '#475569', fontSize: 10, marginBottom: 3 }}>{m.icon} {m.label}</p>
              <p style={{ color: m.color, fontSize: 20, fontWeight: 700 }}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Kafka topics display */}
      {summary?.kafka_topics && (
        <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', padding: '1rem 1.25rem' }}>
          <p style={{ color: '#64748b', fontSize: 11, marginBottom: 8 }}>📨 Kafka Streaming Topics (like Condense/Zeliot architecture)</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {summary.kafka_topics.map(t => (
              <div key={t} style={{ background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
                {t}
              </div>
            ))}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#475569' }}>
              + consumers: AI Predictor · Digital Twin · Alert Engine · Dashboard
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', overflow: 'hidden' }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', gap: 8 }}>
          {[['fleet','🌐 Fleet Overview'],['vessels','🚢 Vessels'],['cold','❄️ Cold Chain'],['events','🔔 Event Log']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12,
              background: tab === id ? '#0ea5e933' : 'transparent',
              color: tab === id ? '#38bdf8' : '#64748b', fontWeight: tab === id ? 600 : 400,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ maxHeight: 480, overflowY: 'auto' }}>

          {tab === 'fleet' && (
            <div>
              {vehicles.map(v => (
                <div key={v.vehicle_id} style={{ padding: '10px 14px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>{TYPE_ICON[v.vehicle_type] || '🚗'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{v.vehicle_name}</span>
                      <span style={{ color: '#475569', fontSize: 11 }}>{v.carrier}</span>
                      <span style={{ color: '#64748b', fontSize: 11 }}>→ {v.route}</span>
                      {v.alerts?.length > 0 && (
                        <span style={{ background: '#ef444422', color: '#ef4444', padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                          {v.alerts.length} alert{v.alerts.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b', flexWrap: 'wrap' }}>
                      <span>📍 {v.position?.lat?.toFixed(3)}, {v.position?.lng?.toFixed(3)}</span>
                      {v.vessel && <>
                        <span>⚡ {v.vessel.speed_knots} kn</span>
                        <span>🌊 {v.vessel.wave_height_m}m waves</span>
                        <span>⛽ {v.vessel.fuel_consumption_mt_day} MT/day</span>
                        <span style={{ color: v.vessel.ais_signal ? '#22c55e' : '#ef4444' }}>
                          {v.vessel.ais_signal ? '📡 AIS OK' : '📡 AIS DARK'}
                        </span>
                      </>}
                      {v.vehicle && <>
                        <span>⚡ {v.vehicle.speed_kmh} km/h</span>
                        <span style={{ color: v.vehicle.fuel_level_pct < 20 ? '#ef4444' : '#64748b' }}>
                          ⛽ {v.vehicle.fuel_level_pct?.toFixed(0)}%
                        </span>
                        <span>🌡️ {v.vehicle.engine_temp_c}°C engine</span>
                      </>}
                      {v.cold_chain && (
                        <span style={{ color: v.cold_chain.temp_excursion ? '#ef4444' : '#22c55e' }}>
                          ❄️ {v.cold_chain.temp_c}°C (set: {v.cold_chain.setpoint_c}°C)
                          {v.cold_chain.temp_excursion ? ' ⚠ EXCURSION' : ' ✓'}
                        </span>
                      )}
                    </div>
                    {v.alerts?.map((a, i) => (
                      <div key={i} style={{ marginTop: 4, background: (SEV_COLOR[a.severity]||'#f59e0b')+'11', borderLeft: `2px solid ${SEV_COLOR[a.severity]||'#f59e0b'}`, padding: '3px 8px', borderRadius: 4, fontSize: 11, color: SEV_COLOR[a.severity]||'#f59e0b' }}>
                        [{a.code}] {a.msg}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'vessels' && (
            <div>
              {vehicles.filter(v => v.vehicle_type === 'container_vessel').map(v => (
                <div key={v.vehicle_id} style={{ padding: '12px 14px', borderBottom: '1px solid #1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>🚢</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{v.vehicle_name}</span>
                    <span style={{ color: '#475569', fontSize: 12 }}>{v.carrier}</span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>{v.route}</span>
                    <span style={{ marginLeft: 'auto', color: v.vessel?.ais_signal ? '#22c55e' : '#ef4444', fontSize: 11, fontWeight: 600 }}>
                      {v.vessel?.ais_signal ? '● AIS ACTIVE' : '● AIS DARK'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 6 }}>
                    {[
                      ['Speed', `${v.vessel?.speed_knots} kn`],
                      ['Heading', `${v.vessel?.heading_deg}°`],
                      ['Wave Ht', `${v.vessel?.wave_height_m}m`],
                      ['Wind', `${v.vessel?.wind_speed_knots} kn`],
                      ['Fuel/day', `${v.vessel?.fuel_consumption_mt_day} MT`],
                      ['Engine', `${v.vessel?.engine_rpm} RPM`],
                    ].map(([k,val]) => (
                      <div key={k} style={{ background: '#0f172a', borderRadius: 6, padding: '6px 8px' }}>
                        <p style={{ color: '#475569', fontSize: 9, marginBottom: 1 }}>{k}</p>
                        <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'cold' && (
            <div>
              {vehicles.filter(v => v.vehicle_type === 'reefer_truck').map(v => (
                <div key={v.vehicle_id} style={{ padding: '12px 14px', borderBottom: '1px solid #1e293b', borderLeft: `3px solid ${v.cold_chain?.temp_excursion ? '#ef4444' : '#22c55e'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>❄️</span>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{v.vehicle_name}</span>
                    <span style={{ color: '#475569', fontSize: 12 }}>{v.carrier}</span>
                    <span style={{ marginLeft: 'auto' }}>
                      {v.cold_chain?.temp_excursion
                        ? <span style={{ background: '#ef444422', color: '#ef4444', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>⚠ EXCURSION</span>
                        : <span style={{ background: '#22c55e22', color: '#22c55e', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>✓ NORMAL</span>
                      }
                    </span>
                  </div>
                  {v.cold_chain && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                      {[
                        ['Actual Temp', `${v.cold_chain.temp_c}°C`, v.cold_chain.temp_excursion ? '#ef4444' : '#22c55e'],
                        ['Setpoint', `${v.cold_chain.setpoint_c}°C`, '#38bdf8'],
                        ['Humidity', `${v.cold_chain.humidity_pct}%`, '#a78bfa'],
                        ['Door', v.cold_chain.door_open ? 'OPEN ⚠' : 'Closed ✓', v.cold_chain.door_open ? '#ef4444' : '#22c55e'],
                      ].map(([k,val,color]) => (
                        <div key={k} style={{ background: '#0f172a', borderRadius: 6, padding: '7px 10px', textAlign: 'center' }}>
                          <p style={{ color: '#475569', fontSize: 9, marginBottom: 2 }}>{k}</p>
                          <p style={{ color: color, fontSize: 14, fontWeight: 700 }}>{val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'events' && (
            <div>
              {events.length === 0 && <p style={{ color: '#475569', padding: '1.5rem', textAlign: 'center', fontSize: 13 }}>No events yet. Fleet data updating every 4s.</p>}
              {events.map((e, i) => (
                <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 10, alignItems: 'flex-start', borderLeft: `2px solid ${SEV_COLOR[e.severity]||'#475569'}` }}>
                  <span style={{ fontSize: 14 }}>{e.severity === 'critical' ? '🚨' : e.severity === 'high' ? '⚠️' : '💡'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 2 }}>
                      <span style={{ color: SEV_COLOR[e.severity]||'#f59e0b', fontSize: 11, fontWeight: 600 }}>[{e.code}]</span>
                      <span style={{ color: '#94a3b8', fontSize: 11 }}>{e.vehicle_name}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 12 }}>{e.msg}</p>
                  </div>
                  <span style={{ color: '#334155', fontSize: 10, whiteSpace: 'nowrap' }}>{new Date(e.ts || e.timestamp || Date.now()).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
