'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

// ── Sparkline SVG data ─────────────────────────────────────────
const SPARKLINE_POINTS = [
  { x: 0,   y: 68 },
  { x: 14,  y: 55 },
  { x: 28,  y: 62 },
  { x: 42,  y: 38 },
  { x: 56,  y: 45 },
  { x: 70,  y: 28 },
  { x: 84,  y: 35 },
  { x: 98,  y: 18 },
  { x: 112, y: 25 },
  { x: 126, y: 10 },
  { x: 140, y: 15 },
];

// Build smooth SVG cubic bezier path
function buildSplinePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

// Build fill area path
function buildFillPath(points: { x: number; y: number }[], height: number): string {
  const linePath = buildSplinePath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  return `${linePath} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
}

const CHART_H = 80;
const splinePath = buildSplinePath(SPARKLINE_POINTS);
const fillPath = buildFillPath(SPARKLINE_POINTS, CHART_H);

// ── Time filters ──────────────────────────────────────────────
const TIME_FILTERS = ['1D', '1W', '1M', '3M', '1Y'] as const;
type TimeFilter = typeof TIME_FILTERS[number];

// ── Period data ───────────────────────────────────────────────
const PERIOD_DATA: Record<TimeFilter, { value: string; delta: string; up: boolean }> = {
  '1D': { value: '$2,480,000',   delta: '+$14,024 (0.6%)',  up: true  },
  '1W': { value: '$2,480,000',   delta: '+$84,320 (3.5%)',  up: true  },
  '1M': { value: '$2,480,000',   delta: '+$224,100 (9.7%)', up: true  },
  '3M': { value: '$2,480,000',   delta: '-$42,000 (1.7%)',  up: false },
  '1Y': { value: '$2,480,000',   delta: '+$684,400 (38%)',  up: true  },
};

// ── Allocation bars ───────────────────────────────────────────
const ALLOCATIONS = [
  { label: 'Businesses',  pct: 55, color: '#FB923C' },
  { label: 'Properties',  pct: 30, color: '#3B82F6' },
  { label: 'Investments', pct: 15, color: '#8B5CF6' },
];

export function PortfolioCard() {
  const [hidden, setHidden] = useState(false);
  const [period, setPeriod] = useState<TimeFilter>('1D');
  const data = PERIOD_DATA[period];

  return (
    <div className="mx-5 mt-3">
      <div
        className="relative rounded-3xl overflow-hidden border border-vault-green/15
                   bg-gradient-to-br from-[#0D1F17] via-vault-card to-[#0A1510]"
        style={{ boxShadow: '0 0 40px rgba(0,255,136,0.08), 0 8px 32px rgba(0,0,0,0.4)' }}
      >
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,136,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Glow orb */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full
                        bg-vault-green/10 blur-3xl pointer-events-none" />

        <div className="relative p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                Total Portfolio
              </p>
              <div className="flex items-baseline gap-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={hidden ? 'hidden' : 'shown'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="font-display text-[28px] font-bold text-white tracking-tight"
                  >
                    {hidden ? '••••••' : data.value}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Delta badge */}
              <motion.div
                className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2.5 py-0.5
                            text-[11px] font-semibold
                            ${data.up
                              ? 'bg-vault-green/15 text-vault-green border border-vault-green/20'
                              : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}
                key={period}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {data.up
                  ? <TrendingUp size={10} />
                  : <TrendingDown size={10} />}
                {hidden ? '••••' : data.delta}
              </motion.div>
            </div>

            {/* Hide/show balance */}
            <motion.button
              id="portfolio-toggle-visibility"
              whileTap={{ scale: 0.85 }}
              onClick={() => setHidden(h => !h)}
              className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10
                         flex items-center justify-center text-gray-400
                         hover:text-white transition-colors"
            >
              {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
            </motion.button>
          </div>

          {/* Sparkline Chart */}
          <div className="relative h-[80px] -mx-1 mb-3">
            <svg
              viewBox={`0 0 140 ${CHART_H}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Line gradient */}
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00FF88" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00FF88" stopOpacity="1" />
                </linearGradient>
                {/* Fill gradient */}
                <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00FF88" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00FF88" stopOpacity="0" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="lineGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Fill area */}
              <motion.path
                d={fillPath}
                fill="url(#fillGrad)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />

              {/* Glow line (thick, blurred) */}
              <path
                d={splinePath}
                fill="none"
                stroke="#00FF88"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.3"
                filter="url(#lineGlow)"
              />

              {/* Main line */}
              <motion.path
                d={splinePath}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="1.8"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />

              {/* End dot */}
              <motion.circle
                cx={SPARKLINE_POINTS[SPARKLINE_POINTS.length - 1].x}
                cy={SPARKLINE_POINTS[SPARKLINE_POINTS.length - 1].y}
                r="3.5"
                fill="#00FF88"
                filter="url(#lineGlow)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
              />
            </svg>
          </div>

          {/* Time filter pills */}
          <div className="flex items-center justify-between mb-4">
            {TIME_FILTERS.map((t) => (
              <motion.button
                key={t}
                id={`portfolio-period-${t.toLowerCase()}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPeriod(t)}
                className={`relative px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                  period === t
                    ? 'text-vault-green'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {period === t && (
                  <motion.span
                    layoutId="period-pill"
                    className="absolute inset-0 rounded-xl bg-vault-green/15 border border-vault-green/25"
                  />
                )}
                <span className="relative">{t}</span>
              </motion.button>
            ))}
          </div>

          {/* Allocation bars */}
          <div>
            {/* Segmented bar */}
            <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-3">
              {ALLOCATIONS.map((a) => (
                <motion.div
                  key={a.label}
                  style={{ backgroundColor: a.color, width: `${a.pct}%` }}
                  className="rounded-full"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-1">
              {ALLOCATIONS.map((a) => (
                <div key={a.label} className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                    <span className="text-[9px] font-medium text-gray-500">{a.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-white">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
