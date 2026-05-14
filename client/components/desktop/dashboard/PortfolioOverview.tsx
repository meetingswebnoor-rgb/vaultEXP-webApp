'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

// ── Chart data ────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TOTAL   = [180000,195000,188000,210000,205000,225000,218000,232000,228000,241000,238000,248500];
const BUSINESSES= [60000, 68000, 65000, 74000, 71000, 82000, 79000, 86000, 84000, 88000, 85000, 84200];
const PROPERTIES= [80000, 82000, 80000, 86000, 88000, 90000, 92000, 95000, 98000,102000,108000,120000];
const INVESTMENTS=[40000, 45000, 43000, 50000, 46000, 53000, 47000, 51000, 46000, 51000, 45000, 44300];

const W = 580; const H = 160; const PAD = { t:16, b:24, l:8, r:8 };
const INNER_W = W - PAD.l - PAD.r;
const INNER_H = H - PAD.t - PAD.b;

function scale(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((v) => ({
    x: PAD.l + (values.indexOf(v) / (values.length - 1)) * INNER_W,
    y: PAD.t + (1 - (v - min) / (max - min)) * INNER_H,
  }));
}

function smooth(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]; const c = pts[i];
    const cx = (p.x + c.x) / 2;
    d += ` C ${cx} ${p.y} ${cx} ${c.y} ${c.x} ${c.y}`;
  }
  return d;
}

function fill(pts: { x: number; y: number }[], bottom: number) {
  const line = smooth(pts);
  return `${line} L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
}

const PERIODS = ['1M','3M','6M','1Y','All'] as const;
type Period = typeof PERIODS[number];

const PERIOD_DATA: Record<Period, { v: string; delta: string; up: boolean }> = {
  '1M': { v: '$248,500', delta: '+$10,200 (4.3%)',  up: true  },
  '3M': { v: '$248,500', delta: '+$23,600 (10.5%)', up: true  },
  '6M': { v: '$248,500', delta: '+$43,500 (21.2%)', up: true  },
  '1Y': { v: '$248,500', delta: '+$68,500 (38.0%)', up: true  },
  'All':{ v: '$248,500', delta: '+$148,500 (148%)', up: true  },
};

const KEY_METRICS = [
  { label: 'Best Month',  value: '+$23,000', sub: 'Jun 2024', color: 'text-vault-green'  },
  { label: 'Avg Monthly', value: '+$5,700',  sub: 'Per month', color: 'text-blue-400'   },
  { label: 'Total Gain',  value: '$68,500',  sub: 'All time',  color: 'text-purple-400' },
  { label: 'ROI',         value: '38%',      sub: 'Annualised', color: 'text-orange-400' },
];

interface PortfolioOverviewProps {
  totalValue?: number;
  stats?: any;
}

export function PortfolioOverview({ totalValue, stats }: PortfolioOverviewProps) {
  const [period, setPeriod] = useState<Period>('1Y');
  const data = PERIOD_DATA[period];

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const displayValue = totalValue !== undefined ? fmt(totalValue) : data.v;

  const totalPts  = useMemo(() => scale(TOTAL),   []);
  const busPts    = useMemo(() => scale(BUSINESSES),  []);
  const propPts   = useMemo(() => scale(PROPERTIES), []);
  const invPts    = useMemo(() => scale(INVESTMENTS), []);
  const bottom    = PAD.t + INNER_H;

  const totalLine = useMemo(() => smooth(totalPts), [totalPts]);
  const totalFill = useMemo(() => fill(totalPts, bottom), [totalPts, bottom]);
  const busLine   = useMemo(() => smooth(busPts),   [busPts]);
  const propLine  = useMemo(() => smooth(propPts),  [propPts]);
  const invLine   = useMemo(() => smooth(invPts),   [invPts]);

  return (
    <div id="overview-section" className="rounded-2xl border border-vault-border/60 overflow-hidden
                    bg-gradient-to-br from-vault-card to-vault-darker"
         style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.3)' }}>

      {/* ── Card Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between px-7 pt-6 pb-0">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Total Portfolio Value
          </p>
          <div className="flex items-end gap-3">
            <h2 className="font-display text-4xl font-bold text-white tracking-tight">
              {displayValue}
            </h2>
            <div className={`flex items-center gap-1 mb-1 rounded-full px-2.5 py-1 text-[12px] font-semibold
                            ${data.up
                              ? 'bg-vault-green/12 text-vault-green border border-vault-green/20'
                              : 'bg-red-500/12 text-red-400 border border-red-500/20'}`}>
              {data.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {data.delta}
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-vault-darker/60 border border-vault-border/40
                        rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              id={`portfolio-period-${p.toLowerCase()}`}
              onClick={() => setPeriod(p)}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p ? 'text-vault-green' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {period === p && (
                <motion.span
                  layoutId="portfolio-period-pill"
                  className="absolute inset-0 rounded-lg bg-vault-green/12 border border-vault-green/20"
                />
              )}
              <span className="relative">{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-0 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 180 }}>
          <defs>
            <linearGradient id="pgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00FF88" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="pgLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00FF88" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00FF88" />
            </linearGradient>
            <filter id="pgGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={PAD.l} y1={PAD.t + f * INNER_H}
              x2={W - PAD.r} y2={PAD.t + f * INNER_H}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1"
            />
          ))}

          {/* Businesses line (secondary, orange) */}
          <path d={busLine} fill="none" stroke="#FB923C" strokeWidth="1.2"
                strokeOpacity="0.35" strokeLinecap="round" />

          {/* Properties line (secondary, blue) */}
          <path d={propLine} fill="none" stroke="#3B82F6" strokeWidth="1.2"
                strokeOpacity="0.35" strokeLinecap="round" />

          {/* Investments line (secondary, purple) */}
          <path d={invLine} fill="none" stroke="#8B5CF6" strokeWidth="1.2"
                strokeOpacity="0.35" strokeLinecap="round" />

          {/* Total fill */}
          <motion.path
            d={totalFill} fill="url(#pgFill)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          />

          {/* Total glow line */}
          <path d={totalLine} fill="none" stroke="#00FF88" strokeWidth="3"
                strokeOpacity="0.25" filter="url(#pgGlow)" strokeLinecap="round" />

          {/* Total line */}
          <motion.path
            d={totalLine} fill="none" stroke="url(#pgLine)" strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />

          {/* End dot */}
          <circle cx={totalPts[totalPts.length - 1].x} cy={totalPts[totalPts.length - 1].y}
                  r="4" fill="#00FF88" filter="url(#pgGlow)" />
          <circle cx={totalPts[totalPts.length - 1].x} cy={totalPts[totalPts.length - 1].y}
                  r="2.5" fill="#00FF88" />

          {/* Month labels */}
          {MONTHS.map((m, i) => {
            const x = PAD.l + (i / (MONTHS.length - 1)) * INNER_W;
            if (i % 2 !== 0) return null;
            return (
              <text key={m} x={x} y={H - 4} textAnchor="middle"
                    fontSize="9" fill="rgba(255,255,255,0.25)" fontFamily="Inter">
                {m}
              </text>
            );
          })}
        </svg>

        {/* Chart legend */}
        <div className="flex items-center gap-4 px-3 pb-4 pt-1">
          {[
            { color: '#00FF88', label: 'Total Portfolio' },
            { color: '#FB923C', label: 'Businesses' },
            { color: '#3B82F6', label: 'Properties' },
            { color: '#8B5CF6', label: 'Investments' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[11px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Key Metrics Row ───────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-0 border-t border-vault-border/40">
        {KEY_METRICS.map((m, i) => (
          <div
            key={m.label}
            className={`px-6 py-4 ${i < 3 ? 'border-r border-vault-border/40' : ''}`}
          >
            <p className="text-[11px] text-gray-600 mb-1">{m.label}</p>
            <p className={`text-[15px] font-bold ${m.color}`}>{m.value}</p>
            <p className="text-[10px] text-gray-700 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
