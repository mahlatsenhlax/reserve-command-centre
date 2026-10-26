import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RESERVE, SPECIES, speciesById, protectLocation } from './data.js';

function ClickToPlace({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function Sightings({ sightings, onAdd, onReset }) {
  const [filter, setFilter] = useState('all');
  const [range, setRange] = useState(90);
  const [form, setForm] = useState({ species: 'elephant', count: 1, date: today(), ranger: '' });
  const [pick, setPick] = useState(null);
  const [message, setMessage] = useState('');

  const visible = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - range);
    const sinceKey = since.toISOString().slice(0, 10);
    return sightings
      .filter((s) => s.date >= sinceKey && (filter === 'all' || s.species === filter))
      .map(protectLocation);
  }, [sightings, filter, range]);

  const bySpecies = useMemo(
    () =>
      SPECIES.map((sp) => ({
        name: sp.name,
        colour: sp.colour,
        sightings: visible.filter((s) => s.species === sp.id).length,
      })).sort((a, b) => b.sightings - a.sightings),
    [visible],
  );

  const recent = [...visible].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);

  function submit(e) {
    e.preventDefault();
    if (!pick) {
      setMessage('Click the map to set where the animals were seen.');
      return;
    }
    onAdd({ ...form, count: Number(form.count), lat: pick[0], lng: pick[1], ranger: form.ranger.trim() || 'Visitor' });
    setPick(null);
    setMessage(`${speciesById[form.species].name} sighting added.`);
  }

  return (
    <section className="panel span-2" aria-labelledby="sight-title">
      <div className="panel-head">
        <h2 id="sight-title">Wildlife sightings</h2>
        <div className="filters">
          <label>
            <span className="vh">Species</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All species</option>
              {SPECIES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>
            <span className="vh">Time period</span>
            <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 12 months</option>
            </select>
          </label>
        </div>
      </div>

      <div className="sight-grid">
        <div className="map-wrap">
          <MapContainer center={RESERVE.center} zoom={RESERVE.zoom} scrollWheelZoom={false} className="map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickToPlace onPick={setPick} />
            {visible.map((s) => (
              <CircleMarker
                key={s.id}
                center={[s.lat, s.lng]}
                radius={s.protectedLocation ? 12 : 4 + Math.min(8, Math.sqrt(s.count) * 1.5)}
                pathOptions={{
                  color: speciesById[s.species].colour,
                  fillColor: speciesById[s.species].colour,
                  fillOpacity: s.protectedLocation ? 0.15 : 0.7,
                  weight: s.protectedLocation ? 1 : 1.5,
                  dashArray: s.protectedLocation ? '4 4' : null,
                }}
              >
                <Popup>
                  <strong>{speciesById[s.species].name}</strong> × {s.count}<br />
                  {s.date} · {s.ranger}
                  {s.protectedLocation && <><br /><em>Location hidden to protect this species.</em></>}
                </Popup>
              </CircleMarker>
            ))}
            {pick && <CircleMarker center={pick} radius={9} pathOptions={{ color: '#ffffff', weight: 2, fillOpacity: 0 }} />}
          </MapContainer>
          <p className="note">Rhino sightings show as faded zones, not exact points, so the data can’t help poachers.</p>
        </div>

        <div>
          <h3 className="sub">Sightings by species</h3>
          <div className="chart-box" style={{ height: 230 }}>
            <ResponsiveContainer>
              <BarChart data={bySpecies} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'var(--text)', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)' }} />
                <Bar dataKey="sightings" radius={[0, 3, 3, 0]}>
                  {bySpecies.map((d) => <Cell key={d.name} fill={d.colour} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="sub">Log a sighting</h3>
          <form className="log-form" onSubmit={submit}>
            <label>Species
              <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>
                {SPECIES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label>Number seen
              <input type="number" min="1" max="500" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} required />
            </label>
            <label>Date
              <input type="date" max={today()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
            <label>Recorded by
              <input type="text" placeholder="Your name" value={form.ranger} onChange={(e) => setForm({ ...form, ranger: e.target.value })} />
            </label>
            <p className="pick">{pick ? `Location set: ${pick[0].toFixed(4)}, ${pick[1].toFixed(4)}` : 'Click the map to set the location.'}</p>
            <button type="submit" className="btn">Add sighting</button>
            <p className="note" role="status" aria-live="polite">{message}</p>
          </form>
        </div>
      </div>

      <h3 className="sub">Latest sightings</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Species</th><th>Count</th><th>Recorded by</th><th>Location</th></tr></thead>
          <tbody>
            {recent.map((s) => (
              <tr key={s.id}>
                <td>{s.date}</td>
                <td><span className="dot" style={{ background: speciesById[s.species].colour }} />{speciesById[s.species].name}</td>
                <td>{s.count}</td>
                <td>{s.ranger}</td>
                <td>{s.protectedLocation ? 'Hidden' : `${s.lat.toFixed(3)}, ${s.lng.toFixed(3)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="link-btn" onClick={onReset}>Reset to sample data</button>
    </section>
  );
}
