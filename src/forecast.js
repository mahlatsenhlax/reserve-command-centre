// Monthly totals and a simple linear-regression forecast per species.

export function monthKey(date) {
  return date.slice(0, 7);
}

export function lastMonths(n, today = new Date()) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

export function monthlyCounts(sightings, speciesId, months) {
  const counts = Object.fromEntries(months.map((m) => [m, 0]));
  for (const s of sightings) {
    if (s.species !== speciesId) continue;
    const k = monthKey(s.date);
    if (k in counts) counts[k] += 1;
  }
  return months.map((m) => counts[m]);
}

function regression(values) {
  const n = values.length;
  const xs = values.map((_, i) => i);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  xs.forEach((x, i) => {
    num += (x - mx) * (values[i] - my);
    den += (x - mx) ** 2;
  });
  const slope = den ? num / den : 0;
  return { slope, intercept: my - slope * mx };
}

function addMonths(key, k) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + k, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Fit on the last 12 complete months (the current month is still in progress).
export function forecast(sightings, speciesId, today = new Date(), ahead = 6) {
  const months = lastMonths(13, today).slice(0, 12);
  const history = monthlyCounts(sightings, speciesId, months);
  const { slope, intercept } = regression(history);
  const residuals = history.map((v, i) => v - (intercept + slope * i));
  const spread = Math.sqrt(residuals.reduce((a, r) => a + r * r, 0) / history.length);

  const rows = months.map((m, i) => ({ month: m, actual: history[i] }));
  const last = rows[rows.length - 1];
  last.forecast = last.actual; // joins the forecast line to the actual line
  for (let k = 1; k <= ahead; k++) {
    const value = Math.max(0, intercept + slope * (history.length - 1 + k));
    rows.push({
      month: addMonths(months[months.length - 1], k),
      forecast: Math.round(value * 10) / 10,
      range: [Math.max(0, Math.round((value - spread) * 10) / 10), Math.round((value + spread) * 10) / 10],
    });
  }
  const avg = history.reduce((a, b) => a + b, 0) / history.length;
  const yearlyChange = avg ? (slope * 12) / avg : 0;
  return { rows, yearlyChange };
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-ZA', { month: 'short', year: '2-digit' });
}
