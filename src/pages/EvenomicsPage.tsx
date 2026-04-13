import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// Scoped CSS for Evenomics page — self-contained design system
const scopedStyles = `
.evenomics-page {
  --ev-bg: #060608;
  --ev-bg-2: #0c0c10;
  --ev-surface: #111118;
  --ev-surface-2: #1a1a24;
  --ev-surface-3: #22222e;
  --ev-border: rgba(47,184,133,0.10);
  --ev-border-2: rgba(47,184,133,0.20);
  --ev-text: #e8e8ed;
  --ev-text-muted: #8a8a9a;
  --ev-text-dim: #555566;
  --ev-emerald: #2fb885;
  --ev-emerald-glow: rgba(47,184,133,0.15);
  --ev-gold: #d4a84b;
  --ev-gold-glow: rgba(212,168,75,0.12);
  --ev-green: #44ff88;
  --ev-green-glow: rgba(68,255,136,0.10);
  --ev-blue: #4488ff;
  --ev-red: #ff4466;
  --ev-section-gap: clamp(4rem, 8vw, 7rem);

  background: var(--ev-bg);
  color: var(--ev-text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  padding-top: 1rem;
}

.evenomics-page * { box-sizing: border-box; }

/* Layout */
.ev-container { max-width: 1000px; margin: 0 auto; padding: 0 clamp(1.2rem, 4vw, 2.5rem); }
.ev-section { padding: var(--ev-section-gap) 0; position: relative; }

/* Typography */
.ev-eyebrow {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--ev-emerald); margin-bottom: 0.6rem;
}
.ev-title {
  font-size: clamp(1.8rem, 4.5vw, 2.8rem); font-weight: 800; line-height: 1.15;
  margin-bottom: 0.6rem; color: var(--ev-text);
}
.ev-title span {
  background: linear-gradient(135deg, #2fb885 0%, #2fb4a5 40%, #d4a84b 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.ev-sub {
  font-size: clamp(0.95rem, 2vw, 1.1rem); color: var(--ev-text-muted);
  max-width: 600px; line-height: 1.6;
}

/* Divider */
.ev-divider {
  height: 1px; border: none; margin: 0;
  background: linear-gradient(90deg, transparent, var(--ev-border-2), transparent);
}

/* Scroll reveal */
.ev-reveal {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.ev-reveal.ev-visible { opacity: 1; transform: translateY(0); }
.ev-reveal-d1 { transition-delay: 0.1s; }
.ev-reveal-d2 { transition-delay: 0.2s; }
.ev-reveal-d3 { transition-delay: 0.3s; }

/* Hero */
.ev-hero {
  min-height: 70vh; display: flex; align-items: center; justify-content: center;
  text-align: center; position: relative; overflow: hidden; padding: 3rem 0;
}
.ev-hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 50% at 50% 40%, rgba(47,184,133,0.06) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 30% 60%, rgba(212,168,75,0.04) 0%, transparent 60%);
  pointer-events: none;
}
.ev-hero-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 1rem; border-radius: 100px;
  background: var(--ev-emerald-glow); border: 1px solid rgba(47,184,133,0.25);
  font-size: 0.72rem; font-weight: 600; color: var(--ev-emerald); margin-bottom: 1.5rem;
}
.ev-hero-badge .ev-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--ev-emerald);
  animation: ev-pulse-dot 2s infinite;
}
@keyframes ev-pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(47,184,133,0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(47,184,133,0); }
}
.ev-hero h1 {
  font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 900; line-height: 1.08;
  margin-bottom: 1.2rem; letter-spacing: -0.02em; color: var(--ev-text);
}
.ev-hero h1 span {
  background: linear-gradient(135deg, #2fb885, #2fb4a5, #68d4ab, #d4a84b);
  background-size: 200% 200%; animation: ev-gradient-shift 6s ease infinite;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
@keyframes ev-gradient-shift {
  0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; }
}
.ev-hero-sub {
  font-size: clamp(1rem, 2.2vw, 1.25rem); color: var(--ev-text-muted);
  max-width: 560px; margin: 0 auto 2rem; line-height: 1.65;
}
.ev-hero-stats { display: flex; gap: 2.5rem; justify-content: center; flex-wrap: wrap; }
.ev-hero-stat { text-align: center; }
.ev-hero-stat .ev-val { font-size: 1.8rem; font-weight: 800; }
.ev-hero-stat .ev-lbl {
  font-size: 0.7rem; color: var(--ev-text-dim); text-transform: uppercase;
  letter-spacing: 0.1em; margin-top: 0.15rem;
}

/* Free Grid */
.ev-free-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem; margin-top: 2rem;
}
.ev-free-card {
  background: var(--ev-surface); border: 1px solid var(--ev-border);
  border-radius: 14px; padding: 1.2rem 1rem; position: relative;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
}
.ev-free-card:hover {
  border-color: var(--ev-emerald); transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(47,184,133,0.08);
}
.ev-free-card .ev-fc-icon { font-size: 1.5rem; margin-bottom: 0.6rem; }
.ev-free-card .ev-fc-name { font-size: 0.85rem; font-weight: 600; color: var(--ev-text); margin-bottom: 0.25rem; }
.ev-free-card .ev-fc-desc { font-size: 0.72rem; color: var(--ev-text-muted); line-height: 1.5; }
.ev-free-card .ev-fc-badge {
  position: absolute; top: 0.8rem; right: 0.8rem;
  font-size: 0.55rem; font-weight: 700; color: var(--ev-green);
  background: rgba(68,255,136,0.08); padding: 0.15rem 0.5rem;
  border-radius: 100px; border: 1px solid rgba(68,255,136,0.15);
}
.ev-free-callout {
  text-align: center; margin-top: 2rem; padding: 1.2rem;
  background: linear-gradient(135deg, rgba(47,184,133,0.06), rgba(212,168,75,0.04));
  border: 1px solid var(--ev-border); border-radius: 14px;
  font-size: 0.9rem; color: var(--ev-text-muted);
}
.ev-free-callout strong { color: var(--ev-emerald); }

/* Money Flow */
.ev-money-flow {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.4rem; margin: 2.5rem 0 2rem;
}
.ev-flow-step { display: flex; align-items: center; justify-content: center; gap: 0.8rem; width: 100%; }
.ev-flow-node {
  background: var(--ev-surface); border: 1px solid var(--ev-border-2);
  border-radius: 14px; padding: 1rem 1.4rem; text-align: center; min-width: 160px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.ev-flow-node:hover { transform: scale(1.03); box-shadow: 0 4px 20px rgba(47,184,133,0.1); }
.ev-flow-node.ev-you {
  border-color: rgba(68,255,136,0.3);
  background: linear-gradient(135deg, var(--ev-surface), rgba(68,255,136,0.04));
}
.ev-flow-node.ev-pool {
  border-color: rgba(47,184,133,0.4);
  background: linear-gradient(135deg, var(--ev-surface), rgba(47,184,133,0.06));
  padding: 1.3rem 2rem;
}
.ev-flow-node.ev-platform {
  border-color: rgba(255,68,102,0.2);
  background: linear-gradient(135deg, var(--ev-surface), rgba(255,68,102,0.03));
  min-width: 100px; padding: 0.7rem 1rem;
}
.ev-flow-node .ev-fn-amount { font-size: 1.5rem; font-weight: 800; }
.ev-flow-node.ev-pool .ev-fn-amount { font-size: 1.8rem; }
.ev-flow-node .ev-fn-label { font-size: 0.7rem; color: var(--ev-text-muted); margin-top: 0.15rem; }
.ev-flow-arrow {
  color: var(--ev-text-dim); font-size: 1.4rem; line-height: 1;
  animation: ev-arrow-pulse 2s ease infinite; text-align: center;
}
@keyframes ev-arrow-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
.ev-flow-split { display: flex; align-items: flex-start; justify-content: center; gap: 2rem; width: 100%; flex-wrap: wrap; }
.ev-flow-split-line { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.ev-flow-pct { font-size: 0.65rem; color: var(--ev-text-dim); font-weight: 600; }
.ev-flow-recipients { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-top: 0.5rem; }
.ev-flow-recipient { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.ev-flow-recipient .ev-fr-icon { font-size: 1.6rem; }
.ev-flow-recipient .ev-fr-label { font-size: 0.65rem; color: var(--ev-text-muted); }

/* Social Features */
.ev-social-features {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.6rem; margin-top: 2rem;
}
.ev-social-feat {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.8rem 1rem; background: var(--ev-surface);
  border: 1px solid var(--ev-border); border-radius: 10px;
  font-size: 0.8rem; color: var(--ev-text-muted); transition: border-color 0.3s;
}
.ev-social-feat:hover { border-color: var(--ev-emerald); }
.ev-social-feat .ev-check { color: var(--ev-green); font-weight: 700; font-size: 1rem; flex-shrink: 0; }

/* Analogy */
.ev-analogy {
  margin-top: 1.5rem; padding: 1rem 1.2rem;
  background: linear-gradient(135deg, rgba(47,184,133,0.05), rgba(212,168,75,0.03));
  border: 1px solid var(--ev-border); border-radius: 12px;
  font-size: 0.82rem; color: var(--ev-text-muted); line-height: 1.6; font-style: italic;
}

/* Calculator panels */
.ev-calc-layout {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
  margin-top: 2rem; align-items: start;
}
.ev-calc-panel {
  background: var(--ev-surface); border: 1px solid var(--ev-border);
  border-radius: 14px; padding: 1.5rem;
}
.ev-calc-panel h3 {
  font-size: 0.8rem; font-weight: 600; color: var(--ev-text-muted);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.2rem;
}
.ev-slider-group { margin-bottom: 1.2rem; }
.ev-slider-group:last-of-type { margin-bottom: 0; }
.ev-slider-label {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.82rem; color: var(--ev-text-muted); margin-bottom: 0.5rem;
}
.ev-slider-label strong { color: var(--ev-emerald); font-weight: 700; font-size: 0.9rem; }
.evenomics-page input[type="range"] {
  width: 100%; height: 6px; border-radius: 3px;
  background: var(--ev-surface-2); -webkit-appearance: none; cursor: pointer; outline: none;
}
.evenomics-page input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: var(--ev-emerald); cursor: pointer;
  box-shadow: 0 0 10px rgba(47,184,133,0.3); transition: box-shadow 0.2s;
}
.evenomics-page input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 16px rgba(47,184,133,0.5);
}
.ev-result-card {
  background: var(--ev-surface); border: 1px solid var(--ev-border-2);
  border-radius: 14px; padding: 1.5rem; text-align: center;
}
.ev-result-card .ev-result-label {
  font-size: 0.72rem; color: var(--ev-text-dim); text-transform: uppercase;
  letter-spacing: 0.1em; margin-bottom: 0.3rem;
}
.ev-result-card .ev-result-value { font-size: 2.5rem; font-weight: 800; line-height: 1.1; }
.ev-result-card .ev-result-sub { font-size: 0.78rem; color: var(--ev-text-muted); margin-top: 0.4rem; }
.ev-result-row { display: flex; gap: 1rem; margin-top: 1rem; justify-content: center; }
.ev-result-mini { text-align: center; flex: 1; background: var(--ev-surface-2); border-radius: 10px; padding: 0.8rem; }
.ev-result-mini .ev-rm-val { font-size: 1.1rem; font-weight: 700; }
.ev-result-mini .ev-rm-lbl { font-size: 0.6rem; color: var(--ev-text-dim); margin-top: 0.1rem; }

/* Comparison Table */
.ev-compare-wrapper { margin-top: 2rem; overflow-x: auto; }
.ev-compare-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; min-width: 600px; }
.ev-compare-table th {
  padding: 0.8rem 0.6rem; text-align: center; font-weight: 600; font-size: 0.72rem;
  text-transform: uppercase; letter-spacing: 0.08em; color: var(--ev-text-dim);
  border-bottom: 1px solid var(--ev-border-2);
}
.ev-compare-table th:first-child { text-align: left; }
.ev-compare-table th.ev-eve-col { color: var(--ev-emerald); background: rgba(47,184,133,0.04); border-radius: 10px 10px 0 0; }
.ev-compare-table td { padding: 0.7rem 0.6rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.03); }
.ev-compare-table td:first-child { text-align: left; color: var(--ev-text-muted); font-weight: 500; }
.ev-compare-table td.ev-eve-col { background: rgba(47,184,133,0.04); }
.ev-compare-table .ev-bad { color: var(--ev-red); }
.ev-compare-table .ev-ok { color: var(--ev-gold); }
.ev-compare-table .ev-good { color: var(--ev-green); font-weight: 700; }
.ev-compare-table tr:last-child td.ev-eve-col { border-radius: 0 0 10px 10px; }
.ev-compare-table tr:hover td { background: rgba(255,255,255,0.015); }
.ev-compare-table tr:hover td.ev-eve-col { background: rgba(47,184,133,0.07); }

/* Savings calc */
.ev-savings-calculator {
  display: flex; align-items: center; gap: 2rem; margin-top: 2rem; padding: 1.5rem;
  background: var(--ev-surface); border: 1px solid var(--ev-border);
  border-radius: 14px; flex-wrap: wrap; justify-content: center;
}
.ev-savings-slider { flex: 1; min-width: 250px; }
.ev-savings-result { text-align: center; min-width: 180px; }
.ev-savings-result .ev-sr-val { font-size: 2.2rem; font-weight: 800; color: var(--ev-green); }
.ev-savings-result .ev-sr-lbl { font-size: 0.72rem; color: var(--ev-text-muted); margin-top: 0.2rem; }

/* Bottom line */
.ev-bottomline { text-align: center; padding: 5rem 0 4rem; }
.ev-tldr {
  max-width: 700px; margin: 2rem auto 0;
  background: linear-gradient(135deg, rgba(47,184,133,0.06), rgba(212,168,75,0.04));
  border: 1px solid var(--ev-border-2); border-radius: 16px; padding: 2rem; text-align: left;
}
.ev-tldr h3 {
  font-size: 0.75rem; font-weight: 700; color: var(--ev-emerald);
  text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 1rem;
}
.ev-tldr-item {
  display: flex; align-items: flex-start; gap: 0.6rem;
  margin-bottom: 0.8rem; font-size: 0.9rem; color: var(--ev-text-muted); line-height: 1.55;
}
.ev-tldr-item:last-child { margin-bottom: 0; }
.ev-tldr-item .ev-ti-num {
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
  background: var(--ev-emerald-glow); border: 1px solid rgba(47,184,133,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700; color: var(--ev-emerald); margin-top: 0.15rem;
}
.ev-tldr-item strong { color: var(--ev-text); font-weight: 600; }

.ev-cta-link {
  display: inline-flex; align-items: center; gap: 0.5rem;
  margin-top: 2rem; padding: 0.8rem 1.8rem;
  background: linear-gradient(135deg, var(--ev-emerald), #2fb4a5);
  color: #fff; font-weight: 700; font-size: 0.9rem;
  text-decoration: none; border-radius: 100px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(47,184,133,0.3);
}
.ev-cta-link:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(47,184,133,0.4); }

.ev-footer {
  text-align: center; padding: 2rem 0; color: var(--ev-text-dim);
  font-size: 0.68rem; border-top: 1px solid var(--ev-border);
}
.ev-footer a { color: var(--ev-emerald); text-decoration: none; }

/* Builder visuals */
.ev-builder-flow { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; margin: 2rem 0; }
.ev-builder-tier { display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap; }
.ev-builder-node {
  background: var(--ev-surface); border: 1px solid var(--ev-border);
  border-radius: 12px; padding: 1rem 1.2rem; text-align: center;
  min-width: 140px; transition: transform 0.3s, border-color 0.3s;
}
.ev-builder-node:hover { transform: translateY(-2px); border-color: var(--ev-gold); }
.ev-builder-node.ev-origin {
  border-color: rgba(212,168,75,0.4);
  background: linear-gradient(135deg, var(--ev-surface), rgba(212,168,75,0.06));
  padding: 1.2rem 1.6rem;
}
.ev-builder-node .ev-bn-name { font-size: 0.78rem; font-weight: 600; }
.ev-builder-node .ev-bn-price { font-size: 1.1rem; font-weight: 800; color: var(--ev-gold); margin-top: 0.15rem; }
.ev-builder-node .ev-bn-detail { font-size: 0.62rem; color: var(--ev-text-dim); margin-top: 0.1rem; }
.ev-builder-node .ev-bn-royalty { font-size: 0.68rem; color: var(--ev-green); font-weight: 600; margin-top: 0.3rem; }
.ev-builder-stats { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-top: 1.5rem; }
.ev-builder-stat {
  text-align: center; background: var(--ev-surface); border: 1px solid var(--ev-border);
  border-radius: 12px; padding: 1rem 1.5rem; min-width: 150px;
}
.ev-builder-stat .ev-bs-val { font-size: 1.6rem; font-weight: 800; }
.ev-builder-stat .ev-bs-lbl {
  font-size: 0.65rem; color: var(--ev-text-dim); text-transform: uppercase;
  letter-spacing: 0.08em; margin-top: 0.15rem;
}

/* Amplified engagement */
.ev-amplify-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; align-items: start; }
.ev-amplify-how {
  background: var(--ev-surface); border: 1px solid var(--ev-border);
  border-radius: 14px; padding: 1.5rem;
}
.ev-amplify-how h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--ev-text); }
.ev-amplify-step { display: flex; gap: 0.8rem; margin-bottom: 1rem; align-items: flex-start; }
.ev-amplify-step:last-child { margin-bottom: 0; }
.ev-amplify-step .ev-as-num {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; margin-top: 0.1rem;
}
.ev-as-num.ev-gold-num { background: var(--ev-gold-glow); border: 1px solid rgba(212,168,75,0.3); color: var(--ev-gold); }
.ev-as-num.ev-green-num { background: var(--ev-green-glow); border: 1px solid rgba(68,255,136,0.2); color: var(--ev-green); }
.ev-as-num.ev-emerald-num { background: var(--ev-emerald-glow); border: 1px solid rgba(47,184,133,0.3); color: var(--ev-emerald); }
.ev-amplify-step .ev-as-text { font-size: 0.85rem; color: var(--ev-text-muted); line-height: 1.55; }
.ev-amplify-step .ev-as-text strong { color: var(--ev-text); font-weight: 600; }
.ev-amplify-compare { display: flex; gap: 1.5rem; justify-content: center; align-items: flex-end; flex-wrap: wrap; }
.ev-amplify-bar { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.ev-amplify-bar .ev-ab-fill { width: 60px; border-radius: 8px 8px 4px 4px; }
.ev-amplify-bar .ev-ab-label { font-size: 0.65rem; color: var(--ev-text-dim); text-align: center; max-width: 80px; }
.ev-amplify-bar .ev-ab-value { font-size: 0.9rem; font-weight: 700; }
.ev-amplify-callout {
  text-align: center; margin-top: 1.5rem; padding: 1rem 1.2rem;
  background: linear-gradient(135deg, rgba(212,168,75,0.06), rgba(47,184,133,0.04));
  border: 1px solid rgba(212,168,75,0.15); border-radius: 14px;
  font-size: 0.85rem; color: var(--ev-text-muted); line-height: 1.6;
}
.ev-amplify-callout strong { color: var(--ev-gold); }
.ev-amplify-callout em { color: var(--ev-emerald); font-style: normal; font-weight: 600; }

@media (max-width: 768px) {
  .ev-calc-layout { grid-template-columns: 1fr; }
  .ev-amplify-grid { grid-template-columns: 1fr; }
  .ev-hero h1 { font-size: 2rem; }
  .ev-hero-stats { gap: 1.5rem; }
  .ev-hero-stat .ev-val { font-size: 1.4rem; }
  .ev-free-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  .ev-savings-calculator { flex-direction: column; }
  .ev-compare-wrapper { margin-left: -1rem; margin-right: -1rem; padding: 0 1rem; }
}
@media (max-width: 480px) {
  .ev-free-grid { grid-template-columns: 1fr; }
  .ev-social-features { grid-template-columns: 1fr; }
  .ev-flow-split { flex-direction: column; align-items: center; }
}
`;

// Economics engine
const CUT = 0.07;
const DAYS = 30;
const FEE = 10;
const AVG_POSTS = 5;
const AVG_ENGAGE = 100;

function fmt(n: number): string {
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 10000) return '$' + (n / 1000).toFixed(1) + 'K';
  if (Math.abs(n) >= 1000) return '$' + Math.round(n).toLocaleString();
  if (Math.abs(n) >= 100) return '$' + Math.round(n);
  return '$' + n.toFixed(2);
}

function dailyPool(users: number, biz: number): number {
  return ((users * FEE * (1 - CUT)) / DAYS) + (biz / DAYS);
}

function assumedBiz(users: number): number {
  return users < 500 ? 0 : Math.pow(users / 1000, 1.5) * 300;
}

function creatorShare(users: number, posts: number, engage: number): number {
  const totalEngagement = users * AVG_POSTS * AVG_ENGAGE;
  const yourEngagement = posts * engage;
  const adjusted = totalEngagement - (AVG_POSTS * AVG_ENGAGE) + yourEngagement;
  return adjusted > 0 ? yourEngagement / adjusted : 0;
}

export function EvenomicsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculator state
  const creatorUsersRef = useRef<HTMLInputElement>(null);
  const creatorPostsRef = useRef<HTMLInputElement>(null);
  const creatorEngageRef = useRef<HTMLInputElement>(null);
  const builderDownloadsRef = useRef<HTMLInputElement>(null);
  const builderPriceRef = useRef<HTMLInputElement>(null);
  const savingsRevRef = useRef<HTMLInputElement>(null);

  // Creator calc outputs
  const vCreatorUsersRef = useRef<HTMLElement>(null);
  const vCreatorPostsRef = useRef<HTMLElement>(null);
  const vCreatorEngageRef = useRef<HTMLElement>(null);
  const vCreatorWeeklyRef = useRef<HTMLDivElement>(null);
  const vCreatorPoolRef = useRef<HTMLElement>(null);
  const vCreatorDailyRef = useRef<HTMLDivElement>(null);
  const vCreatorMonthlyRef = useRef<HTMLDivElement>(null);
  const vCreatorVsAvgRef = useRef<HTMLDivElement>(null);

  // Builder calc outputs
  const vBuilderDownloadsRef = useRef<HTMLElement>(null);
  const vBuilderPriceRef = useRef<HTMLElement>(null);
  const vBuilderRevenueRef = useRef<HTMLDivElement>(null);
  const vBuilderYoursRef = useRef<HTMLDivElement>(null);
  const vBuilderPlatformRef = useRef<HTMLDivElement>(null);

  // Savings calc outputs
  const vSavingsRevRef = useRef<HTMLElement>(null);
  const vSavingsAmountRef = useRef<HTMLDivElement>(null);

  const updateCreatorCalc = useCallback(() => {
    const users = +(creatorUsersRef.current?.value || 10000);
    const posts = +(creatorPostsRef.current?.value || 10);
    const engage = +(creatorEngageRef.current?.value || 200);

    const biz = assumedBiz(users);
    const dp = dailyPool(users, biz);
    const share = creatorShare(users, posts, engage);
    const daily = dp * share;
    const weekly = daily * 7;
    const monthly = daily * 30;
    const avgShare = creatorShare(users, AVG_POSTS, AVG_ENGAGE);
    const avgDaily = dp * avgShare;
    const multiplier = avgDaily > 0 ? daily / avgDaily : 0;

    if (vCreatorUsersRef.current) vCreatorUsersRef.current.textContent = users.toLocaleString();
    if (vCreatorPostsRef.current) vCreatorPostsRef.current.textContent = String(posts);
    if (vCreatorEngageRef.current) vCreatorEngageRef.current.textContent = engage.toLocaleString();
    if (vCreatorWeeklyRef.current) vCreatorWeeklyRef.current.textContent = fmt(weekly);
    if (vCreatorPoolRef.current) vCreatorPoolRef.current.textContent = fmt(dp);
    if (vCreatorDailyRef.current) vCreatorDailyRef.current.textContent = fmt(daily);
    if (vCreatorMonthlyRef.current) vCreatorMonthlyRef.current.textContent = fmt(monthly);
    if (vCreatorVsAvgRef.current) vCreatorVsAvgRef.current.textContent = multiplier.toFixed(1) + 'x';
  }, []);

  const updateBuilderCalc = useCallback(() => {
    const downloads = +(builderDownloadsRef.current?.value || 100);
    const price = +(builderPriceRef.current?.value || 25);
    const gross = downloads * price;
    const yours = gross * (1 - CUT);
    const platform = gross * CUT;

    if (vBuilderDownloadsRef.current) vBuilderDownloadsRef.current.textContent = downloads.toLocaleString();
    if (vBuilderPriceRef.current) vBuilderPriceRef.current.textContent = '$' + price;
    if (vBuilderRevenueRef.current) vBuilderRevenueRef.current.textContent = fmt(yours);
    if (vBuilderYoursRef.current) vBuilderYoursRef.current.textContent = fmt(yours);
    if (vBuilderPlatformRef.current) vBuilderPlatformRef.current.textContent = fmt(platform);
  }, []);

  const updateSavingsCalc = useCallback(() => {
    const rev = +(savingsRevRef.current?.value || 5000);
    const avgTake = 0.41;
    const annualSavings = (rev * (avgTake - CUT)) * 12;

    if (vSavingsRevRef.current) vSavingsRevRef.current.textContent = fmt(rev);
    if (vSavingsAmountRef.current) vSavingsAmountRef.current.textContent = '+' + fmt(annualSavings);
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ev-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    const container = containerRef.current;
    if (container) {
      container.querySelectorAll('.ev-reveal').forEach(el => observer.observe(el));
    }

    // Init calculators
    updateCreatorCalc();
    updateBuilderCalc();
    updateSavingsCalc();

    return () => observer.disconnect();
  }, [updateCreatorCalc, updateBuilderCalc, updateSavingsCalc]);

  return (
    <>
      <style>{scopedStyles}</style>
      <div className="evenomics-page" ref={containerRef}>

        {/* HERO */}
        <section className="ev-hero ev-section">
          <div className="ev-container">
            <div className="ev-reveal">
              <div className="ev-hero-badge"><span className="ev-dot"></span> Evenomics</div>
            </div>
            <h1 className="ev-reveal ev-reveal-d1">A platform where<br /><span>your money works for you</span></h1>
            <p className="ev-hero-sub ev-reveal ev-reveal-d2">
              No ads. No data harvesting. No hidden fees.<br />
              Here's exactly where every dollar goes — and how it comes back.
            </p>
            <div className="ev-hero-stats ev-reveal ev-reveal-d3">
              <div className="ev-hero-stat"><div className="ev-val" style={{ color: 'var(--ev-green)' }}>$0</div><div className="ev-lbl">Core OS cost</div></div>
              <div className="ev-hero-stat"><div className="ev-val" style={{ color: 'var(--ev-emerald)' }}>$10<span style={{ fontSize: '0.8rem', opacity: 0.6 }}>/mo</span></div><div className="ev-lbl">Social layer</div></div>
              <div className="ev-hero-stat"><div className="ev-val" style={{ color: 'var(--ev-gold)' }}>93%</div><div className="ev-lbl">Goes to you</div></div>
              <div className="ev-hero-stat"><div className="ev-val" style={{ color: 'var(--ev-red)' }}>7%</div><div className="ev-lbl">Platform keeps</div></div>
            </div>
          </div>
        </section>

        <hr className="ev-divider" />

        {/* FREE LAYER */}
        <section className="ev-section">
          <div className="ev-container">
            <div className="ev-eyebrow ev-reveal">What you get for free</div>
            <h2 className="ev-title ev-reveal">A complete operating system. <span>$0. Forever.</span></h2>
            <p className="ev-sub ev-reveal">Before we talk about the $10 social layer — here's what EVE gives you for absolutely nothing. No trial. No catch.</p>
            <div className="ev-free-grid">
              {[
                { icon: '🤖', name: 'Your Personal AI', desc: 'A local AI that learns you over time. Private. Gets smarter daily.' },
                { icon: '🎨', name: 'Creative Suite', desc: 'Flow Studio, 3D editor, code graph IDE, visual programming.' },
                { icon: '🗣️', name: 'Voice & Audio', desc: 'Speech-to-text, text-to-speech, voice commands. All local.' },
                { icon: '🖼️', name: 'Image Generation', desc: 'Stable Diffusion on your device. No cloud. No per-image fees.' },
                { icon: '🏥', name: 'Medical Tools', desc: 'Patient monitoring, telehealth, HIPAA-compliant workflows.' },
                { icon: '🥽', name: 'VR Experiences', desc: 'Spatial computing, VRM companions, immersive environments.' },
                { icon: '🛠️', name: 'Developer Portal', desc: 'Build, test, and publish modules. Full IDE included.' },
                { icon: '🔒', name: 'Total Privacy', desc: 'No tracking. No ads. No data harvesting. Period.' },
                { icon: '⭐', name: 'Marketplace Access', desc: 'Browse and install thousands of community modules.' },
              ].map((card, i) => (
                <div key={card.name} className={`ev-free-card ev-reveal ${i > 0 ? `ev-reveal-d${Math.min(i % 4 + 1, 3)}` : ''}`}>
                  <div className="ev-fc-icon">{card.icon}</div>
                  <div className="ev-fc-name">{card.name}</div>
                  <div className="ev-fc-desc">{card.desc}</div>
                  <div className="ev-fc-badge">FREE</div>
                </div>
              ))}
            </div>
            <div className="ev-free-callout ev-reveal">
              <strong>All of this is yours. Forever. $0.</strong> — The social layer ($10/mo) is the only thing that costs anything.
            </div>
          </div>
        </section>

        <hr className="ev-divider" />

        {/* $10 SOCIAL LAYER */}
        <section className="ev-section">
          <div className="ev-container">
            <div className="ev-eyebrow ev-reveal">The social layer</div>
            <h2 className="ev-title ev-reveal">Where does <span>your $10</span> go?</h2>
            <p className="ev-sub ev-reveal">Every subscription flows into one shared pool — released to the community daily.</p>

            <div className="ev-money-flow ev-reveal">
              <div className="ev-flow-step">
                <div className="ev-flow-node ev-you">
                  <div className="ev-fn-amount" style={{ color: 'var(--ev-text)' }}>$10<span style={{ fontSize: '0.7rem', opacity: 0.5 }}>/mo</span></div>
                  <div className="ev-fn-label">Your subscription</div>
                </div>
              </div>
              <div className="ev-flow-arrow">↓</div>
              <div className="ev-flow-split">
                <div className="ev-flow-split-line">
                  <div className="ev-flow-pct">93% — $9.30</div>
                  <div className="ev-flow-arrow">↓</div>
                  <div className="ev-flow-node ev-pool">
                    <div className="ev-fn-amount" style={{ color: 'var(--ev-emerald)' }}>Community Pool</div>
                    <div className="ev-fn-label">Distributed to creators every day</div>
                  </div>
                </div>
                <div className="ev-flow-split-line">
                  <div className="ev-flow-pct">7% — $0.70</div>
                  <div className="ev-flow-arrow">↓</div>
                  <div className="ev-flow-node ev-platform">
                    <div className="ev-fn-amount" style={{ color: 'var(--ev-red)', fontSize: '1rem' }}>Platform</div>
                    <div className="ev-fn-label">Keeps the lights on</div>
                  </div>
                </div>
              </div>
              <div className="ev-flow-arrow">↓</div>
              <div className="ev-flow-recipients">
                <div className="ev-flow-recipient"><div className="ev-fr-icon">🎬</div><div className="ev-fr-label">Creators you enjoy</div></div>
                <div className="ev-flow-recipient"><div className="ev-fr-icon">🛠️</div><div className="ev-fr-label">Builders of tools you use</div></div>
                <div className="ev-flow-recipient"><div className="ev-fr-icon">🏢</div><div className="ev-fr-label">Businesses add to the pool too</div></div>
              </div>
            </div>

            <p className="ev-sub ev-reveal" style={{ textAlign: 'center', margin: '0 auto' }}>
              Your likes, comments, and shares are your votes. They directly determine which creators earn from the pool each day.
            </p>

            <div className="ev-social-features ev-reveal">
              {['Access all creator content', 'No ads, ever', 'No algorithmic manipulation', 'Your engagement pays creators directly', 'Export your data anytime', 'No tracking or profiling'].map(f => (
                <div key={f} className="ev-social-feat"><span className="ev-check">✓</span> {f}</div>
              ))}
            </div>

            <div className="ev-analogy ev-reveal">
              💡 Think of it like a shared tip jar. Everyone puts in $10. Every day the jar is emptied and split among the creators who made the best content — and <em>you</em> decide "best" with your engagement.
            </div>
          </div>
        </section>

        <hr className="ev-divider" />

        {/* AMPLIFIED ENGAGEMENT */}
        <section className="ev-section">
          <div className="ev-container">
            <div className="ev-eyebrow ev-reveal">For businesses & supporters</div>
            <h2 className="ev-title ev-reveal">Put in more, <span>weigh more</span></h2>
            <p className="ev-sub ev-reveal">Anyone can contribute beyond the $10 subscription. In return, their engagement carries more weight.</p>

            <div className="ev-amplify-grid">
              <div className="ev-amplify-how ev-reveal">
                <h3>How it works</h3>
                <div className="ev-amplify-step">
                  <span className="ev-as-num ev-gold-num">1</span>
                  <div className="ev-as-text"><strong>Contribute extra.</strong> Put additional money into the community pool beyond your $10/month.</div>
                </div>
                <div className="ev-amplify-step">
                  <span className="ev-as-num ev-green-num">2</span>
                  <div className="ev-as-text"><strong>Your engagement amplifies.</strong> A regular subscriber's like = 1 view. A supporter's like might equal 3, 5, or more views.</div>
                </div>
                <div className="ev-amplify-step">
                  <span className="ev-as-num ev-emerald-num">3</span>
                  <div className="ev-as-text"><strong>Creators you engage with rise.</strong> Your engagement carries more weight, boosting the creators you love.</div>
                </div>
              </div>
              <div className="ev-reveal ev-reveal-d1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ev-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Engagement weight per interaction</div>
                </div>
                <div className="ev-amplify-compare">
                  {[
                    { value: '1x', height: 50, color: 'var(--ev-surface-3)', textColor: 'var(--ev-text-muted)', label: 'Regular subscriber' },
                    { value: '3x', height: 100, color: 'linear-gradient(to top, rgba(212,168,75,0.3), rgba(212,168,75,0.6))', textColor: 'var(--ev-gold)', label: 'Small supporter' },
                    { value: '5x', height: 150, color: 'linear-gradient(to top, rgba(212,168,75,0.4), rgba(212,168,75,0.8))', textColor: 'var(--ev-gold)', label: 'Medium supporter' },
                    { value: '10x', height: 220, color: 'linear-gradient(to top, rgba(68,255,136,0.3), rgba(68,255,136,0.7))', textColor: 'var(--ev-green)', label: 'Major supporter' },
                  ].map(bar => (
                    <div key={bar.label} className="ev-amplify-bar">
                      <div className="ev-ab-value" style={{ color: bar.textColor }}>{bar.value}</div>
                      <div className="ev-ab-fill" style={{ height: bar.height, background: bar.color }}></div>
                      <div className="ev-ab-label">{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="ev-amplify-callout ev-reveal">
              <strong>This isn't advertising.</strong> No contracts, no #ad disclosures. Supporters simply engage with content they genuinely like — their engagement just carries more weight. Creators rise on merit, <em>amplified by real support</em>.
            </div>
          </div>
        </section>

        <hr className="ev-divider" />

        {/* CREATOR EARNINGS */}
        <section className="ev-section">
          <div className="ev-container">
            <div className="ev-eyebrow ev-reveal">For creators</div>
            <h2 className="ev-title ev-reveal">More content + more engagement = <span>bigger share</span></h2>
            <p className="ev-sub ev-reveal">No contracts. No sponsorship negotiations. Just create, engage, and earn your slice of the daily pool.</p>

            <div className="ev-calc-layout">
              <div className="ev-calc-panel ev-reveal">
                <h3>Adjust the scenario</h3>
                <div className="ev-slider-group">
                  <div className="ev-slider-label">People on the platform <strong ref={vCreatorUsersRef}>10,000</strong></div>
                  <input type="range" ref={creatorUsersRef} min="1000" max="100000" defaultValue="10000" step="1000" onInput={updateCreatorCalc} />
                </div>
                <div className="ev-slider-group">
                  <div className="ev-slider-label">Your posts this month <strong ref={vCreatorPostsRef}>10</strong></div>
                  <input type="range" ref={creatorPostsRef} min="1" max="50" defaultValue="10" onInput={updateCreatorCalc} />
                </div>
                <div className="ev-slider-group">
                  <div className="ev-slider-label">Avg engagement per post <strong ref={vCreatorEngageRef}>200</strong></div>
                  <input type="range" ref={creatorEngageRef} min="1" max="5000" defaultValue="200" step="10" onInput={updateCreatorCalc} />
                </div>
              </div>
              <div className="ev-reveal ev-reveal-d1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="ev-result-card">
                  <div className="ev-result-label">Your weekly earnings</div>
                  <div className="ev-result-value" style={{ color: 'var(--ev-green)' }} ref={vCreatorWeeklyRef}>$4.34</div>
                  <div className="ev-result-sub">from a <strong ref={vCreatorPoolRef} style={{ color: 'var(--ev-emerald)' }}>$3,100</strong>/day pool</div>
                </div>
                <div className="ev-result-row">
                  <div className="ev-result-mini"><div className="ev-rm-val" style={{ color: 'var(--ev-emerald)' }} ref={vCreatorDailyRef}>$0.62</div><div className="ev-rm-lbl">Daily</div></div>
                  <div className="ev-result-mini"><div className="ev-rm-val" style={{ color: 'var(--ev-emerald)' }} ref={vCreatorMonthlyRef}>$19</div><div className="ev-rm-lbl">Monthly</div></div>
                  <div className="ev-result-mini"><div className="ev-rm-val" style={{ color: 'var(--ev-gold)' }} ref={vCreatorVsAvgRef}>2.0x</div><div className="ev-rm-lbl">vs Average Creator</div></div>
                </div>
              </div>
            </div>

            <div className="ev-analogy ev-reveal">
              💡 The pool grows with every new subscriber. At 10,000 users, the daily pool is over $3,000. At 100,000 users, it's over $30,000/day. The earlier you start creating, the bigger your share as the platform grows.
            </div>
          </div>
        </section>

        <hr className="ev-divider" />

        {/* BUILDER EARNINGS */}
        <section className="ev-section">
          <div className="ev-container">
            <div className="ev-eyebrow ev-reveal">For builders</div>
            <h2 className="ev-title ev-reveal">Build once. <span>Earn every download.</span></h2>
            <p className="ev-sub ev-reveal">Your module lives in the Exchange. Every device that installs it pays your price. You keep 93%.</p>

            <div className="ev-calc-layout">
              <div className="ev-calc-panel ev-reveal">
                <h3>Your module</h3>
                <div className="ev-slider-group">
                  <div className="ev-slider-label">Downloads this month <strong ref={vBuilderDownloadsRef}>100</strong></div>
                  <input type="range" ref={builderDownloadsRef} min="1" max="5000" defaultValue="100" step="10" onInput={updateBuilderCalc} />
                </div>
                <div className="ev-slider-group">
                  <div className="ev-slider-label">Module price <strong ref={vBuilderPriceRef}>$25</strong></div>
                  <input type="range" ref={builderPriceRef} min="1" max="200" defaultValue="25" step="1" onInput={updateBuilderCalc} />
                </div>
              </div>
              <div className="ev-reveal ev-reveal-d1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="ev-result-card">
                  <div className="ev-result-label">Your monthly revenue</div>
                  <div className="ev-result-value" style={{ color: 'var(--ev-green)' }} ref={vBuilderRevenueRef}>$2,325</div>
                  <div className="ev-result-sub">after the 7% platform fee</div>
                </div>
                <div className="ev-result-row">
                  <div className="ev-result-mini"><div className="ev-rm-val" style={{ color: 'var(--ev-green)' }} ref={vBuilderYoursRef}>$2,325</div><div className="ev-rm-lbl">You keep (93%)</div></div>
                  <div className="ev-result-mini"><div className="ev-rm-val" style={{ color: 'var(--ev-red)' }} ref={vBuilderPlatformRef}>$175</div><div className="ev-rm-lbl">Platform (7%)</div></div>
                </div>
              </div>
            </div>

            {/* Cascading Royalties */}
            <div style={{ marginTop: '3rem' }}>
              <h3 className="ev-reveal" style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--ev-text)' }}>Your work compounds</h3>
              <p className="ev-reveal" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--ev-text-muted)', marginBottom: '1.5rem' }}>When others remix or build on your module, you earn cascading royalties — on every downstream sale.</p>
              <div className="ev-builder-flow ev-reveal">
                <div className="ev-builder-tier">
                  <div className="ev-builder-node ev-origin"><div className="ev-bn-name">Your Module</div><div className="ev-bn-price">$25</div><div className="ev-bn-detail">100 downloads/mo</div></div>
                </div>
                <div className="ev-flow-arrow" style={{ fontSize: '1.2rem' }}>↓ ↓ ↓</div>
                <div className="ev-builder-tier">
                  <div className="ev-builder-node"><div className="ev-bn-name">Remix A</div><div className="ev-bn-price">$40</div><div className="ev-bn-detail">80 downloads</div><div className="ev-bn-royalty">↑ $446 to you</div></div>
                  <div className="ev-builder-node"><div className="ev-bn-name">Remix B</div><div className="ev-bn-price">$30</div><div className="ev-bn-detail">120 downloads</div><div className="ev-bn-royalty">↑ $502 to you</div></div>
                </div>
                <div className="ev-flow-arrow" style={{ fontSize: '1.2rem' }}>↓ ↓</div>
                <div className="ev-builder-tier">
                  <div className="ev-builder-node"><div className="ev-bn-name">Remix C</div><div className="ev-bn-price">$50</div><div className="ev-bn-detail">60 downloads</div><div className="ev-bn-royalty">↑ $418 to you</div></div>
                </div>
              </div>
              <div className="ev-builder-stats ev-reveal">
                <div className="ev-builder-stat"><div className="ev-bs-val" style={{ color: 'var(--ev-gold)' }}>$2,325</div><div className="ev-bs-lbl">Direct Sales</div></div>
                <div className="ev-builder-stat"><div className="ev-bs-val" style={{ color: 'var(--ev-green)' }}>+$1,366</div><div className="ev-bs-lbl">Downstream Royalties</div></div>
                <div className="ev-builder-stat"><div className="ev-bs-val" style={{ color: 'var(--ev-emerald)' }}>$3,691<span style={{ fontSize: '0.7rem', opacity: 0.6 }}>/mo</span></div><div className="ev-bs-lbl">Total Passive Income</div></div>
              </div>
            </div>
          </div>
        </section>

        <hr className="ev-divider" />

        {/* COMPARISON */}
        <section className="ev-section">
          <div className="ev-container">
            <div className="ev-eyebrow ev-reveal">The difference</div>
            <h2 className="ev-title ev-reveal">Why EVE is <span>different</span></h2>
            <p className="ev-sub ev-reveal">You're not cheaper — you're more profitable. Ownership + transparency + low fees = you keep more.</p>

            <div className="ev-compare-wrapper ev-reveal">
              <table className="ev-compare-table">
                <thead>
                  <tr>
                    <th></th><th>YouTube</th><th>TikTok</th><th>OnlyFans</th><th>Twitch</th><th className="ev-eve-col">EVE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Platform take</td><td className="ev-bad">45%</td><td className="ev-bad">50%</td><td className="ev-bad">20%</td><td className="ev-bad">50%</td><td className="ev-good ev-eve-col">7%</td></tr>
                  <tr><td>Own your audience</td><td className="ev-bad">No</td><td className="ev-bad">No</td><td className="ev-bad">No</td><td className="ev-bad">No</td><td className="ev-good ev-eve-col">Yes</td></tr>
                  <tr><td>Export subscribers</td><td className="ev-bad">No</td><td className="ev-bad">No</td><td className="ev-bad">No</td><td className="ev-bad">No</td><td className="ev-good ev-eve-col">Yes</td></tr>
                  <tr><td>Payout speed</td><td className="ev-ok">30 days</td><td className="ev-ok">30 days</td><td className="ev-ok">7 days</td><td className="ev-ok">15 days</td><td className="ev-good ev-eve-col">Instant</td></tr>
                  <tr><td>Exclusivity required</td><td className="ev-ok">No</td><td className="ev-ok">No</td><td className="ev-bad">Often</td><td className="ev-bad">Yes</td><td className="ev-good ev-eve-col">Never</td></tr>
                  <tr><td>Algorithm transparency</td><td className="ev-bad">None</td><td className="ev-bad">None</td><td className="ev-ok">Some</td><td className="ev-bad">None</td><td className="ev-good ev-eve-col">Full</td></tr>
                  <tr><td>Set your own pricing</td><td className="ev-bad">No</td><td className="ev-bad">No</td><td className="ev-good">Yes</td><td className="ev-ok">Limited</td><td className="ev-good ev-eve-col">Yes</td></tr>
                </tbody>
              </table>
            </div>

            {/* Savings Calculator */}
            <div className="ev-savings-calculator ev-reveal">
              <div className="ev-savings-slider">
                <div className="ev-slider-label">If you earn monthly <strong ref={vSavingsRevRef}>$5,000</strong></div>
                <input type="range" ref={savingsRevRef} min="100" max="50000" defaultValue="5000" step="100" onInput={updateSavingsCalc} />
              </div>
              <div className="ev-savings-result">
                <div className="ev-sr-val" ref={vSavingsAmountRef}>+$23,400</div>
                <div className="ev-sr-lbl">more in your pocket per year on EVE<br />vs. the average platform</div>
              </div>
            </div>
          </div>
        </section>

        <hr className="ev-divider" />

        {/* BOTTOM LINE */}
        <section className="ev-bottomline ev-section">
          <div className="ev-container">
            <div className="ev-eyebrow ev-reveal">The bottom line</div>
            <h2 className="ev-title ev-reveal" style={{ textAlign: 'center' }}>Your money. <span>Your community.</span></h2>

            <div className="ev-tldr ev-reveal">
              <h3>TL;DR</h3>
              {[
                { text: <><strong>The entire OS is free.</strong> AI, creative tools, medical tools, VR, privacy — all $0, forever.</> },
                { text: <><strong>The social layer costs $10/month.</strong> That's the only paid thing. No upsells. No tiers.</> },
                { text: <><strong>93% goes to the community.</strong> Your subscription enters a shared pool distributed to creators daily.</> },
                { text: <><strong>Your engagement is your vote.</strong> Likes, comments, shares — they decide who earns.</> },
                { text: <><strong>Supporters amplify the pool.</strong> Businesses and individuals can contribute extra. Their engagement carries more weight.</> },
                { text: <><strong>Builders keep 93% of every module sale</strong> — plus cascading royalties when others build on their work.</> },
                { text: <><strong>The platform keeps just 7%.</strong> Compare that to YouTube (45%), TikTok (50%), or Twitch (50%).</> },
              ].map((item, i) => (
                <div key={i} className="ev-tldr-item">
                  <span className="ev-ti-num">{i + 1}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            <Link to="/" className="ev-cta-link ev-reveal">
              Visit the Exchange →
            </Link>
          </div>
        </section>

        <footer className="ev-footer">
          <div className="ev-container">
            <div>Hermetic Labs — EVE OS</div>
            <div style={{ marginTop: '0.3rem', color: 'var(--ev-text-dim)' }}>
              Money can buy exposure attempts, not guaranteed survival.
              Your content lives or dies by real engagement.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
