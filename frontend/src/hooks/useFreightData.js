import { useState, useEffect, useRef, useCallback } from 'react';
import { get, post, wsUrl } from '../utils/api';

export function useFreightData() {
  const [kpis, setKpis] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [disruptions, setDisruptions] = useState([]);
  const [ports, setPorts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [actions, setActions] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  const fetchAll = useCallback(async () => {
    try {
      const [k, s, d, p, ag, ac, f] = await Promise.all([
        get('/api/dashboard'),
        get('/api/shipments'),
        get('/api/disruptions'),
        get('/api/ports'),
        get('/api/agents'),
        get('/api/agents/actions'),
        get('/api/forecast'),
      ]);
      setKpis(k);
      setShipments(s.shipments || []);
      setDisruptions(d.alerts || []);
      setPorts(p.ports || []);
      setAgents(ag.agents || []);
      setActions(ac.actions || []);
      setForecasts(f.forecasts || []);
      setLoading(false);
    } catch (e) {
      console.error('Fetch error:', e);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 8000);

    const ws = new WebSocket(wsUrl());
    wsRef.current = ws;
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.kpis) setKpis(data.kpis);
        if (data.shipment_update) {
          setLiveEvents(prev => [data.shipment_update, ...prev].slice(0, 20));
        }
      } catch {}
    };
    ws.onerror = () => {};

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [fetchAll]);

  const runAgents = async () => {
    const result = await post('/api/agents/run', {});
    await fetchAll();
    return result;
  };

  const queryRAG = async (question, context) => {
    return post('/api/rag/query', { question, context });
  };

  const optimizeRoute = async (origin, destination, cargo_value, priority) => {
    return post('/api/quantum/optimize', { origin, destination, cargo_value, priority });
  };

  const predictDisruption = async (shipmentId) => {
    return get(`/api/disruptions/${shipmentId}/predict`);
  };

  return {
    kpis, shipments, disruptions, ports, agents, actions,
    forecasts, liveEvents, loading,
    runAgents, queryRAG, optimizeRoute, predictDisruption, refresh: fetchAll,
  };
}
