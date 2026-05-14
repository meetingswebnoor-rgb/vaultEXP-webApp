export function calculateInvestmentPerformance(currentValue: number, amountInvested: number) {
  const profitLoss = currentValue - amountInvested;
  
  // Guard against division by zero
  const percentage = amountInvested > 0 
    ? (profitLoss / amountInvested) * 100 
    : 0;
    
  return {
    profitLoss,
    percentage,
    isPositive: profitLoss >= 0
  };
}

export function generateDistributionData(investments: any[]) {
  const typeMap: Record<string, number> = {};
  investments.forEach(inv => {
    const type = inv.type || 'other';
    typeMap[type] = (typeMap[type] || 0) + (inv.currentValue || 0);
  });
  
  const colors = ['#00FF88', '#3B82F6', '#A855F7', '#FB923C', '#F87171'];
  
  return Object.keys(typeMap).map((key, i) => ({
    name: key.replace('_', ' '),
    value: typeMap[key],
    fill: colors[i % colors.length]
  })).sort((a, b) => b.value - a.value); // sort largest to smallest
}

export function generateGrowthData(investments: any[]) {
  if (!investments || investments.length === 0) return [];
  
  // Sort investments by date ascending
  const sorted = [...investments].sort((a, b) => {
    const dateA = new Date(a.purchaseDate || a.createdAt || Date.now()).getTime();
    const dateB = new Date(b.purchaseDate || b.createdAt || Date.now()).getTime();
    return dateA - dateB;
  });

  let cumulativeInvested = 0;
  let cumulativeValue = 0;
  
  const chartData = sorted.map(inv => {
    cumulativeInvested += (inv.amountInvested || 0);
    cumulativeValue += (inv.currentValue || 0);
    
    const dateObj = new Date(inv.purchaseDate || inv.createdAt || Date.now());
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear().toString().substring(2);
    
    return {
      name: `${month} '${year}`,
      invested: cumulativeInvested,
      value: cumulativeValue,
    };
  });
  
  // Deduplicate by name if multiple investments happened in same month, taking the last cumulative sum.
  const deduplicated: any[] = [];
  for (const data of chartData) {
    const existing = deduplicated.find(d => d.name === data.name);
    if (existing) {
      existing.invested = data.invested;
      existing.value = data.value;
    } else {
      deduplicated.push({ ...data });
    }
  }

  // To make it look like a nice line chart even if there's only 1 data point, add a starting point of 0
  if (deduplicated.length === 1) {
    deduplicated.unshift({ name: 'Start', invested: 0, value: 0 });
  }

  return deduplicated;
}
