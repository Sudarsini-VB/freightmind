import React, { useState, useRef, useEffect } from 'react';

const QUICK = [
  'What is the Red Sea disruption risk right now?',
  'Which carrier has best on-time performance?',
  'What documents are needed for EU customs?',
  'How does quantum route optimization work?',
  'What is CBAM and how does it affect logistics?',
  'What are current freight rates Shanghai to Rotterdam?',
];

export default function RAGChat({ onQuery }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I am FreightMind Intelligence — powered by RAG (Retrieval-Augmented Generation). I have access to freight regulations, port advisories, carrier data, market intelligence, and real-time shipment context. Ask me anything.',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await onQuery(q);
      let content = res.answer;
      if (res.suggested_actions?.length) {
        content += '\n\nSuggested actions:\n' + res.suggested_actions.map(a => `• ${a}`).join('\n');
      }
      if (res.sources?.length) {
        content += '\n\nSources: ' + res.sources.map(s => s.title).join(', ');
      }
      setMessages(prev => [...prev, { role: 'assistant', content, confidence: res.confidence, intent: res.intent }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that query. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#111827', borderRadius: 12, border: '1px solid #1e3a5f', display: 'flex', flexDirection: 'column', height: 520, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>🧠</span>
        <div>
          <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600 }}>FreightMind Intelligence</h3>
          <p style={{ color: '#475569', fontSize: 11 }}>RAG · FAISS Vector Store · Knowledge Base · LLM</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: 12,
              background: m.role === 'user' ? '#0ea5e9' : '#1e293b',
              color: '#e2e8f0', fontSize: 13, lineHeight: 1.6,
              borderBottomRightRadius: m.role === 'user' ? 4 : 12,
              borderBottomLeftRadius: m.role === 'assistant' ? 4 : 12,
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
              {m.confidence && (
                <div style={{ marginTop: 6, fontSize: 10, color: '#475569' }}>
                  Confidence: {Math.round(m.confidence * 100)}% · Intent: {m.intent}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: 12, color: '#475569', fontSize: 13 }}>
              Searching knowledge base...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {QUICK.slice(0, 3).map(q => (
            <button key={q} onClick={() => send(q)} style={{
              background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 20,
              padding: '3px 10px', color: '#64748b', fontSize: 11, cursor: 'pointer',
            }}>{q.length > 40 ? q.slice(0, 40) + '...' : q}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about disruptions, routes, regulations, rates..."
            style={{
              flex: 1, background: '#1e293b', border: '1px solid #334155',
              borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none',
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}
