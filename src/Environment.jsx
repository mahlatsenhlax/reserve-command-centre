import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { initialReadings, nextReadings, fireRisk, alertsFor, LIMITS } from './environment.js';

function Gauge({ label, value, unit, max = 100, warn }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`gauge${warn ? ' warn' : ''}`}>
      <div className="gauge-label">{label}</div>
      <div className="gauge-value">
        {value.toFixed(unit === '%' ? 0 : 1)}
        <span>{unit}</span>
      </div>
      <div className="gauge-bar" aria-hidden="true"><div style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function Environment() {
  const [readings, setReadings] = useState(initialReadings);
  const [history, setHistory] = useState([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => {
      setReadings((r) => {
        const next = nextReadings(r);
        const time = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setHistory((h) => [...h.slice(-29), { time, temperature: +next.temperature.toFixed(1), humidity: +next.humidity.toFixed(0) }]);
        return next;
      });
    }, 2500);
    return () => clearInterval(t);
  }, [paused]);

  const risk = fireRisk(readings);
  const alerts = alertsFor(readings);

  return (
    <section className="panel" aria-labelledby="env-title">
      <div className="panel-head">
        <h2 id="env-title">Environment monitor</h2>
        <button className="link-btn" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Resume live feed' : 'Pause live feed'}
        </button>
      </div>
      <p className="note">Simulated sensor feed, updating every 2.5 seconds.</p>

      <div className={`risk risk-${risk.level.replace(' ', '-').toLowerCase()}`}>
        <div>
          <div className="risk-label">Fire danger</div>
          <div className="risk-level">{risk.level}</div>
        </div>
        <div className="risk-score">Index {risk.score}<br /><span>{readings.daysSinceRain} days since rain</span></div>
      </div>

      <div className="gauges">
        <Gauge label="North dam" value={readings.damNorth} unit="%" warn={readings.damNorth < LIMITS.damLow} />
        <Gauge label="South dam" value={readings.damSouth} unit="%" warn={readings.damSouth < LIMITS.damLow} />
        <Gauge label="Temperature" value={readings.temperature} unit="°C" max={45} warn={readings.temperature > LIMITS.tempHigh} />
        <Gauge label="Humidity" value={readings.humidity} unit="%" warn={readings.humidity < LIMITS.humidityLow} />
        <Gauge label="Wind" value={readings.wind} unit="km/h" max={60} />
        <Gauge label="Rain (last reading)" value={readings.rain24h} unit="mm" max={20} />
      </div>

      <div className="chart-box" style={{ height: 180 }}>
        <ResponsiveContainer>
          <LineChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: 'var(--muted)', fontSize: 11 }} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)' }} />
            <Line type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="var(--ochre)" dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="var(--water)" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3 className="sub">Alerts</h3>
      {alerts.length === 0 ? (
        <p className="note">All readings are within normal limits.</p>
      ) : (
        <ul className="alerts" aria-live="polite">
          {alerts.map((a) => <li key={a.text} className={`alert-${a.kind}`}>{a.text}</li>)}
        </ul>
      )}
    </section>
  );
}
