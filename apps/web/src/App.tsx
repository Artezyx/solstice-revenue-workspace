import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from './api';
import { formatCents, nextStage, stageLabels } from './format';
import type { Metrics, Opportunity } from './types';
export function App(){
 const [items,setItems]=useState<Opportunity[]>([]);
 const [metrics,setMetrics]=useState<Metrics|null>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [company,setCompany]=useState('');
 const [value,setValue]=useState('15000');
 const [probability,setProbability]=useState('50');
 const refresh=useCallback(async()=>{
  try{const [page,summary]=await Promise.all([api.page(),api.metrics()]);setItems(page.items);setMetrics(summary);setError('');}
  catch(e){setError(String(e));}
 },[]);
 useEffect(()=>{void refresh()},[refresh]);
 async function create(event:FormEvent){event.preventDefault();setBusy(true);
  try{const cents=Math.round(Number(value)*100);await api.create(company,cents,Number(probability));setCompany('');await refresh();}
  catch(e){setError(String(e))}finally{setBusy(false)}
 }
 async function advance(item:Opportunity){const stage=nextStage(item.stage);if(!stage)return;setBusy(true);
  try{await api.advance(item,stage);await refresh()}catch(e){setError(`Update failed: ${String(e)}`);await refresh()}finally{setBusy(false)}
 }
 return <div className="layout"><aside><div className="logo">SOLSTICE <span>REVENUE</span></div><p>Pipeline Intelligence</p><nav><a href="#dashboard">Dashboard</a><a href="#deals">Opportunities</a></nav><small>Portfolio demo · Local authentication fixture</small></aside>
 <main id="dashboard"><header><div><span className="eyebrow">SALES ENGINEERING / DASHBOARD</span><h1>Revenue Workspace</h1><p>Monitor deals, forecast revenue and control pipeline transitions.</p></div><button onClick={()=>void refresh()}>Refresh</button></header>
 {error && <div role="alert" className="error">{error}</div>}
 <section className="kpis"><article><small>Open opportunities</small><strong>{metrics?.openCount ?? '—'}</strong></article><article><small>Open pipeline</small><strong>{formatCents(metrics?.openPipelineCents ?? 0)}</strong></article><article><small>Weighted forecast</small><strong>{formatCents(metrics?.weightedForecastCents ?? 0)}</strong></article><article><small>Closed won</small><strong>{formatCents(metrics?.wonCents ?? 0)}</strong></article></section>
 <section className="panel"><h2>New opportunity</h2><form onSubmit={e=>void create(e)}><label>Company<input required minLength={2} maxLength={150} value={company} onChange={e=>setCompany(e.target.value)} placeholder="Example: Northstar Cloud"/></label><label>Value (USD)<input required min="1" type="number" step="0.01" value={value} onChange={e=>setValue(e.target.value)}/></label><label>Probability (%)<input required type="number" min="0" max="100" value={probability} onChange={e=>setProbability(e.target.value)}/></label><button disabled={busy}>Create</button></form></section>
 <section className="panel" id="deals"><h2>Opportunity pipeline</h2><table><thead><tr><th>Company</th><th>Value</th><th>Probability</th><th>Stage</th><th>Action</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td>{item.company}</td><td>{formatCents(item.valueCents)}</td><td>{item.probability}%</td><td><span className="tag">{stageLabels[item.stage]}</span></td><td>{nextStage(item.stage)?<button disabled={busy} onClick={()=>void advance(item)}>Move to {stageLabels[nextStage(item.stage)!]}</button>:<small>Closed</small>}</td></tr>)}</tbody></table>{items.length===0&&<p>No opportunities yet. Create your first deal above.</p>}</section>
 </main></div>
}
