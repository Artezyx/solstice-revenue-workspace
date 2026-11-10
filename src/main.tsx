import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Stage = "Discovery" | "Proposal" | "Negotiation" | "Won";
type Deal = { id: number; account: string; value: number; stage: Stage };
const startingDeals: Deal[] = [
  { id: 1, account: "Northwind Logistics", value: 120000, stage: "Proposal" },
  { id: 2, account: "Atlas Retail", value: 85000, stage: "Negotiation" },
  { id: 3, account: "Monarch Systems", value: 210000, stage: "Discovery" },
];
const stages: Stage[] = ["Discovery", "Proposal", "Negotiation", "Won"];
const probability: Record<Stage, number> = { Discovery: 0.15, Proposal: 0.4, Negotiation: 0.7, Won: 1 };
const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

function App() {
  const [deals, setDeals] = useState<Deal[]>(startingDeals);
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const forecast = useMemo(() => deals.reduce((sum, deal) => sum + deal.value * probability[deal.stage], 0), [deals]);
  function addDeal(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!account.trim() || !Number.isFinite(value) || value <= 0) return;
    setDeals((current) => [...current, { id: Date.now(), account: account.trim(), value, stage: "Discovery" }]);
    setAccount("");
    setAmount("");
  }
  return (
    <main>
      <header><span className="eyebrow">SOLSTICE / SALES OPERATIONS</span><h1>Revenue Workspace</h1><p>Opportunity pipeline and weighted revenue forecast.</p></header>
      <section className="metrics">
        <article><small>Open opportunities</small><strong>{deals.filter((deal) => deal.stage !== "Won").length}</strong></article>
        <article><small>Total pipeline</small><strong>{money(deals.reduce((sum, deal) => sum + deal.value, 0))}</strong></article>
        <article><small>Weighted forecast</small><strong>{money(forecast)}</strong></article>
      </section>
      <section className="panel"><h2>New opportunity</h2><form onSubmit={addDeal}><input required placeholder="Account name" value={account} onChange={(e) => setAccount(e.target.value)}/><input required type="number" min="1" placeholder="Amount in MXN" value={amount} onChange={(e) => setAmount(e.target.value)}/><button type="submit">Create opportunity</button></form></section>
      <section className="panel"><h2>Pipeline</h2><div className="table-wrap"><table><thead><tr><th>Account</th><th>Value</th><th>Stage</th><th>Weighted value</th></tr></thead><tbody>{deals.map((deal) => <tr key={deal.id}><td>{deal.account}</td><td>{money(deal.value)}</td><td><select aria-label={`Stage for ${deal.account}`} value={deal.stage} onChange={(e) => setDeals((all) => all.map((d) => d.id === deal.id ? { ...d, stage: e.target.value as Stage } : d))}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></td><td>{money(deal.value * probability[deal.stage])}</td></tr>)}</tbody></table></div></section>
      <footer>Demonstration data · Local state · No production data</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
