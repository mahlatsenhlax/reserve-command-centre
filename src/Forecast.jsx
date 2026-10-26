import { useMemo, useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { SPECIES, speciesById } from './data.js';
import { forecast, monthLabel } from './forecast.js';

export default function Forecast({ sightings }) {
  const [species, setSpecies] = useState('wilddog');
  const { rows, yearlyChange } = useMemo(() => forecast(sightings, species), [sightings, species]);
  const data = rows.map((r) => ({ ...r, label: monthLabel(r.month) }));
  const pct = Math.round(yearlyChange * 100);
  const trend = pct > 5 ? 'rising' : pct < -5 ? 'falling' : 'stable';
  const colour = speciesById[species].colour;

  return (
    <section className="panel" aria-labelledby="fc-title">
      <div className="panel-head">
        <h2 id="fc-title">Sightings forecast</h2>
        <label>
          <span className="vh">Species to forecast</span>
          <select value={species} onChange={(e) => setSpecies(e.target.value)}>
            {SPECIES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>
      <p className={`trend trend-${trend}`}>
        {speciesById[species].name} sightings are <strong>{trend}</strong>
        {trend !== 'stable' && <> at about {Math.abs(pct)}% a year</>}.
      </p>
      <div className="chart-box" style={{ height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area dataKey="range" name="Likely range" fill={colour} fillOpacity={0.15} stroke="none" isAnimationActive={false} />
            <Line dataKey="actual" name="Monthly sightings" stroke={colour} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            <Line dataKey="forecast" name="Forecast" stroke={colour} strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="note">Linear regression on the last 12 months of sightings, projected 6 months ahead. Sightings reflect ranger effort as well as population, so treat this as an early signal, not a census.</p>
    </section>
  );
}
