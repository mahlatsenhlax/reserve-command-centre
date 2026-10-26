import { useEffect, useState } from 'react';
import Sightings from './Sightings.jsx';
import Environment from './Environment.jsx';
import Forecast from './Forecast.jsx';
import { RESERVE, sampleSightings } from './data.js';

const STORAGE_KEY = 'rcc-sightings-v1';

function loadSightings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // storage unavailable: fall back to sample data
  }
  return sampleSightings();
}

export default function App() {
  const [sightings, setSightings] = useState(loadSightings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sightings));
    } catch {
      // ignore: the app still works without saving
    }
  }, [sightings]);

  const add = (s) => setSightings((all) => [...all, { ...s, id: Date.now() }]);
  const reset = () => setSightings(sampleSightings());

  return (
    <>
      <header className="top">
        <div>
          <h1>Reserve Command Centre</h1>
          <p className="subtitle">{RESERVE.name}, Limpopo · sample data</p>
        </div>
        <a className="credit" href="https://mahlatsenhlax.github.io">Built by Mahlatse Nchabeleng</a>
      </header>
      <main className="grid">
        <Sightings sightings={sightings} onAdd={add} onReset={reset} />
        <Environment />
        <Forecast sightings={sightings} />
      </main>
      <footer>
        Map data © OpenStreetMap contributors. Reserve, sightings and sensor readings are fictional, for demonstration.
      </footer>
    </>
  );
}
