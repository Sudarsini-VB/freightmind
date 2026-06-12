import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import KPICards from './components/KPICards';
import ShipmentTable from './components/ShipmentTable';
import DisruptionsPanel from './components/DisruptionsPanel';
import QuantumOptimizer from './components/QuantumOptimizer';
import RAGChat from './components/RAGChat';
import AgentsPanel from './components/AgentsPanel';
import ChartsPanel from './components/ChartsPanel';
import LiveFeed from './components/LiveFeed';
import DigitalTwin from './components/DigitalTwin';
import ESGPanel from './components/ESGPanel';
import SupplierRisk from './components/SupplierRisk';
import GNNNetwork from './components/GNNNetwork';
import IoTFleet from './components/IoTFleet';
import HardwareConfig from './components/HardwareConfig';
import { useFreightData } from './hooks/useFreightData';

const NAV = [
  {id:'dashboard', icon:'📊', label:'Dashboard'},
  {id:'iot',       icon:'📡', label:'IoT Fleet'},
  {id:'shipments', icon:'🚢', label:'Shipments'},
  {id:'disruptions',icon:'⚠️',label:'Disruptions'},
  {id:'twin',      icon:'👁️', label:'Digital Twin'},
  {id:'quantum',   icon:'⚛️', label:'Quantum'},
  {id:'intelligence',icon:'🧠',label:'Intelligence'},
  {id:'agents',    icon:'🤖', label:'Agents'},
  {id:'gnn',       icon:'🕸️', label:'GNN Graph'},
  {id:'esg',       icon:'🌿', label:'ESG'},
  {id:'suppliers', icon:'🏭', label:'Suppliers'},
  {id:'analytics', icon:'📈', label:'Analytics'},
  {id:'hardware',  icon:'🔌', label:'Hardware'},
];

function Banner({alert, onDismiss}) {
  if (!alert) return null;
  return (
    <div style={{background:'#450a0a',borderBottom:'1px solid #ef4444',padding:'7px 1rem',display:'flex',alignItems:'center',gap:10}}>
      <span style={{fontSize:15}}>🚨</span>
      <span style={{color:'#fca5a5',fontSize:12,flex:1}}>
        <b>{alert.shipment_id}</b>: {alert.description} — <i>{alert.ai_recommendation}</i>
      </span>
      <button onClick={onDismiss} style={{background:'transparent',border:'none',color:'#f87171',cursor:'pointer',fontSize:18,lineHeight:1}}>×</button>
    </div>
  );
}

function ShipDetail({ship, onClose}) {
  if (!ship) return null;
  return (
    <div style={{background:'#111827',borderRadius:12,border:'1px solid #1e3a5f',padding:'1.25rem',marginTop:12}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:'1rem'}}>
        <h3 style={{color:'#e2e8f0',fontSize:14,fontWeight:600,flex:1}}>📦 {ship.id} — Details</h3>
        <button onClick={onClose} style={{background:'transparent',border:'none',color:'#475569',cursor:'pointer',fontSize:20}}>×</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:8,marginBottom:10}}>
        {[['Route',`${ship.origin} → ${ship.destination}`],['Carrier',ship.carrier],
          ['Cargo',ship.cargo_type],['Weight',`${(ship.weight_kg/1000).toFixed(1)}t`],
          ['Value',`$${(ship.value_usd/1000).toFixed(0)}K`],['Risk',`${ship.risk_score}/100 (${ship.risk_level})`],
          ['Status',ship.status?.replace(/_/g,' ')],['Progress',`${Math.round(ship.progress*100)}%`],
          ['ETA',new Date(ship.eta).toLocaleDateString()],
          ['Quantum',ship.quantum_route_optimized?'✓ Optimized':'Not optimized']
        ].map(([k,v])=>(
          <div key={k} style={{background:'#0f172a',borderRadius:8,padding:'8px 10px'}}>
            <p style={{color:'#475569',fontSize:10,marginBottom:2}}>{k}</p>
            <p style={{color:'#e2e8f0',fontSize:12,fontWeight:500}}>{v}</p>
          </div>
        ))}
      </div>
      {ship.ai_recommendation&&(
        <div style={{background:'#0c1f38',borderRadius:8,padding:'9px 12px',borderLeft:'3px solid #38bdf8'}}>
          <p style={{color:'#38bdf8',fontSize:10,marginBottom:2}}>💡 AI Recommendation</p>
          <p style={{color:'#94a3b8',fontSize:12,lineHeight:1.5}}>{ship.ai_recommendation}</p>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [tab, setTab]           = useState('dashboard');
  const [selectedShip, setShip] = useState(null);
  const [notif, setNotif]       = useState(null);
  const [user, setUser]         = useState(()=>{
    try { return localStorage.getItem('fm_token') ? {name:'User'} : null; }
    catch { return null; }
  });

  const {kpis,shipments,disruptions,ports,agents,actions,
         forecasts,liveEvents,loading,
         runAgents,queryRAG,optimizeRoute,predictDisruption} = useFreightData();

  useEffect(()=>{
    const c=disruptions.find(d=>d.severity==='critical');
    if(c&&!notif) setNotif(c);
  },[disruptions]);

  if (!user) return <Login onLogin={u=>setUser(u)} />;

  const col2 = {display:'grid',gridTemplateColumns:'1fr 260px',gap:14};
  const col1 = {display:'flex',flexDirection:'column',gap:12};

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',color:'#e2e8f0',display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{background:'#080d1a',borderBottom:'1px solid #1e293b',padding:'0 1rem',
                   display:'flex',alignItems:'center',height:50,gap:6,position:'sticky',top:0,zIndex:200}}>
        <span style={{fontSize:20}}>🚢</span>
        <span style={{color:'#38bdf8',fontWeight:700,fontSize:16,marginRight:4}}>FreightMind</span>
        <span style={{background:'#0ea5e911',color:'#38bdf8',padding:'1px 5px',borderRadius:4,
                      fontSize:9,border:'1px solid #0ea5e922',marginRight:10}}>v2.0</span>
        <div style={{display:'flex',gap:2,flex:1,overflowX:'auto'}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{
              background:tab===n.id?'#0ea5e91a':'transparent',
              color:tab===n.id?'#38bdf8':'#64748b',
              border:tab===n.id?'1px solid #0ea5e933':'1px solid transparent',
              borderRadius:7,padding:'4px 8px',fontSize:11,cursor:'pointer',
              fontWeight:tab===n.id?600:400,whiteSpace:'nowrap'
            }}>{n.icon} {n.label}</button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite'}}/>
            <span style={{color:'#475569',fontSize:10}}>Live</span>
          </div>
          {disruptions.length>0&&(
            <span onClick={()=>setTab('disruptions')} style={{background:'#ef444422',color:'#ef4444',
              border:'1px solid #ef444433',borderRadius:20,padding:'2px 7px',fontSize:10,fontWeight:600,cursor:'pointer'}}>
              {disruptions.length} alerts
            </span>
          )}
          <span style={{color:'#475569',fontSize:11}}>👤 {user?.name}</span>
          <button onClick={()=>{localStorage.removeItem('fm_token');setUser(null);}} style={{
            background:'transparent',border:'1px solid #1e293b',borderRadius:5,
            padding:'3px 8px',color:'#475569',fontSize:10,cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <Banner alert={notif} onDismiss={()=>setNotif(null)} />

      {loading ? (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
          <div style={{fontSize:48}}>🚢</div>
          <p style={{color:'#38bdf8',fontSize:16}}>Loading FreightMind...</p>
          <p style={{color:'#475569',fontSize:12}}>AI · Quantum · RAG · Agents · GNN · ESG · IoT</p>
        </div>
      ) : (
        <div style={{flex:1,padding:'1.25rem',maxWidth:1600,margin:'0 auto',width:'100%'}}>

          {tab==='dashboard'&&(
            <div style={col1}>
              <KPICards kpis={kpis}/>
              <div style={col2}>
                <div style={col1}>
                  <ShipmentTable shipments={shipments.slice(0,8)} onSelect={s=>{setShip(s);setTab('shipments');}}/>
                  {disruptions.length>0&&<DisruptionsPanel disruptions={disruptions.slice(0,3)} onPredict={predictDisruption}/>}
                </div>
                <LiveFeed events={liveEvents} ports={ports}/>
              </div>
            </div>
          )}

          {tab==='iot'&&<IoTFleet/>}

          {tab==='shipments'&&(
            <div style={col1}>
              <ShipmentTable shipments={shipments} onSelect={setShip}/>
              <ShipDetail ship={selectedShip} onClose={()=>setShip(null)}/>
            </div>
          )}

          {tab==='disruptions'&&(
            <div style={col2}>
              <DisruptionsPanel disruptions={disruptions} onPredict={predictDisruption}/>
              <LiveFeed events={liveEvents} ports={ports}/>
            </div>
          )}

          {tab==='twin'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <DigitalTwin shipment={selectedShip||shipments[0]}/>
              <div style={col1}>
                <div style={{background:'#111827',borderRadius:12,border:'1px solid #1e3a5f',padding:'1.25rem'}}>
                  <h3 style={{color:'#e2e8f0',fontSize:14,fontWeight:600,marginBottom:10}}>Select Shipment</h3>
                  <div style={{maxHeight:300,overflowY:'auto',display:'flex',flexDirection:'column',gap:4}}>
                    {shipments.slice(0,12).map(s=>(
                      <div key={s.id} onClick={()=>setShip(s)} style={{
                        padding:'7px 10px',borderRadius:8,cursor:'pointer',
                        background:selectedShip?.id===s.id?'#1e3a5f':'#0f172a',
                        border:`1px solid ${selectedShip?.id===s.id?'#38bdf8':'transparent'}`,
                        display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{color:'#38bdf8',fontSize:11,fontWeight:600,minWidth:68}}>{s.id}</span>
                        <span style={{color:'#94a3b8',fontSize:11,flex:1}}>{s.origin} → {s.destination}</span>
                        <span style={{color:s.risk_level==='critical'?'#ef4444':s.risk_level==='high'?'#f97316':'#f59e0b',fontSize:11}}>{s.risk_score}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <LiveFeed events={liveEvents} ports={[]}/>
              </div>
            </div>
          )}

          {tab==='quantum'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <QuantumOptimizer onOptimize={optimizeRoute}/>
              <div style={{background:'#111827',borderRadius:12,border:'1px solid #1e3a5f',padding:'1.25rem'}}>
                <h3 style={{color:'#e2e8f0',fontSize:15,fontWeight:600,marginBottom:'1rem'}}>⚛️ QAOA Explained</h3>
                {[['What it solves','Vehicle Routing Problem (VRP) — finding best global shipping route'],
                  ['Why quantum?','Checks 2^N route combinations simultaneously via superposition'],
                  ['QAOA layers','4 circuit layers — more layers = better quality solution'],
                  ['Shots','256 quantum measurements per optimization run'],
                  ['Real result','DHL + IBM: 12% route cost reduction in European network (2024)'],
                  ['Backend','CPU sim now → IBM Qiskit → D-Wave: one .env line change'],
                  ['Hardware needed?','NO — software simulator runs identically'],
                  ['Production ETA','Full quantum hardware: 2027-2028'],
                ].map(([k,v])=>(
                  <div key={k} style={{padding:'7px 0',borderBottom:'1px solid #1e293b',display:'flex',gap:12}}>
                    <span style={{color:'#475569',fontSize:11,minWidth:120}}>{k}</span>
                    <span style={{color:'#94a3b8',fontSize:12,lineHeight:1.5}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='intelligence'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:14}}>
              <RAGChat onQuery={queryRAG}/>
              <div style={{background:'#111827',borderRadius:12,border:'1px solid #1e3a5f',padding:'1.25rem'}}>
                <h3 style={{color:'#e2e8f0',fontSize:14,fontWeight:600,marginBottom:'1rem'}}>📚 Knowledge Base</h3>
                {[
                  {cat:'⚖️ Regulations',items:['EU CBAM 2026','IMO CII 2025','EU ICS2','WTO Rules']},
                  {cat:'🚢 Disruptions', items:['Red Sea Crisis','LA Congestion','Panama Drought']},
                  {cat:'📊 Market',       items:['Freight Rates 2026','Carrier Rankings','US-China Tariffs']},
                  {cat:'🔒 Security',    items:['Maritime Cyber','Zero-Trust Architecture']},
                  {cat:'⚛️ Quantum',     items:['QAOA Logistics','DHL-IBM Pilot 2024']},
                  {cat:'📡 IoT/Kafka',   items:['Streaming Architecture','Cold Chain','AIS Dark Vessel']},
                ].map(g=>(
                  <div key={g.cat} style={{marginBottom:10}}>
                    <p style={{color:'#64748b',fontSize:10,marginBottom:4}}>{g.cat}</p>
                    {g.items.map(item=>(
                      <div key={item} style={{background:'#0f172a',borderRadius:5,padding:'4px 9px',marginBottom:3,fontSize:11,color:'#94a3b8'}}>{item}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='agents'&&<AgentsPanel agents={agents} actions={actions} onRunCycle={runAgents}/>}
          {tab==='gnn'&&<GNNNetwork/>}
          {tab==='esg'&&<ESGPanel/>}
          {tab==='suppliers'&&<SupplierRisk/>}
          {tab==='hardware'&&<HardwareConfig/>}

          {tab==='analytics'&&(
            <div style={col1}>
              <KPICards kpis={kpis}/>
              <ChartsPanel shipments={shipments} forecasts={forecasts}/>
            </div>
          )}

        </div>
      )}
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#0f172a}
        ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}
        *{box-sizing:border-box}
        button:focus{outline:none}
      `}</style>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  state={hasError:false,error:null};
  static getDerivedStateFromError(e){return{hasError:true,error:e};}
  render(){
    if(!this.state.hasError) return this.props.children;
    return(
      <div style={{minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{background:'#111827',border:'1px solid #ef4444',borderRadius:12,padding:'2rem',maxWidth:480,textAlign:'center'}}>
          <p style={{fontSize:36,marginBottom:12}}>⚠️</p>
          <h2 style={{color:'#ef4444',marginBottom:8}}>Something went wrong</h2>
          <p style={{color:'#64748b',fontSize:13,marginBottom:20}}>{this.state.error?.message}</p>
          <button onClick={()=>window.location.reload()} style={{background:'#0ea5e9',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',cursor:'pointer',fontSize:14,fontWeight:600}}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default function App(){return <ErrorBoundary><Dashboard/></ErrorBoundary>;}
