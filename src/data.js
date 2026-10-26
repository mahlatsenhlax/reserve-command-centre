// Sample data for a fictional reserve. Coordinates sit in the Limpopo lowveld.
export const RESERVE = {
  name: 'Marula Ridge Nature Reserve',
  center: [-24.42, 31.06],
  zoom: 11,
};

export const SPECIES = [
  { id: 'elephant', name: 'African elephant', colour: '#B9A88F' },
  { id: 'lion', name: 'Lion', colour: '#D9A441' },
  { id: 'leopard', name: 'Leopard', colour: '#E0C35A' },
  { id: 'buffalo', name: 'Cape buffalo', colour: '#8C7B6B' },
  { id: 'giraffe', name: 'Giraffe', colour: '#C98B4E' },
  { id: 'wilddog', name: 'African wild dog', colour: '#9FBF7A' },
  // Rhino locations are never shown exactly: poachers use sighting data.
  { id: 'rhino', name: 'White rhino', colour: '#6FB7D6', sensitive: true },
];

export const speciesById = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

// Small seeded random generator so the sample data is the same on every load.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Typical monthly sightings and yearly trend per species (fraction per year).
const PROFILE = {
  elephant: { base: 14, trend: 0.18 },
  lion: { base: 6, trend: 0.05 },
  leopard: { base: 3, trend: 0.1 },
  buffalo: { base: 11, trend: -0.08 },
  giraffe: { base: 9, trend: 0.04 },
  wilddog: { base: 2, trend: 0.35 },
  rhino: { base: 4, trend: -0.15 },
};

const RANGERS = ['T. Maluleke', 'N. Mokoena', 'S. Baloyi', 'K. Ndlovu'];

export function sampleSightings(today = new Date()) {
  const rand = seeded(42);
  const out = [];
  let id = 1;
  for (let m = 17; m >= 0; m--) {
    const month = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const yearsFromStart = (17 - m) / 12;
    // Dry winter months (May to Sep) bring animals to water and raise sightings.
    const dry = [4, 5, 6, 7, 8].includes(month.getMonth()) ? 1.25 : 0.9;
    for (const sp of SPECIES) {
      const p = PROFILE[sp.id];
      const expected = p.base * (1 + p.trend * yearsFromStart) * dry;
      const n = Math.max(0, Math.round(expected + (rand() - 0.5) * expected * 0.5));
      for (let i = 0; i < n; i++) {
        const day = 1 + Math.floor(rand() * 27);
        const date = new Date(month.getFullYear(), month.getMonth(), day);
        if (date > today) continue;
        out.push({
          id: id++,
          species: sp.id,
          count: sp.id === 'buffalo' ? 5 + Math.floor(rand() * 40)
            : sp.id === 'elephant' ? 1 + Math.floor(rand() * 12)
            : sp.id === 'wilddog' ? 4 + Math.floor(rand() * 10)
            : 1 + Math.floor(rand() * 4),
          lat: RESERVE.center[0] + (rand() - 0.5) * 0.22,
          lng: RESERVE.center[1] + (rand() - 0.5) * 0.3,
          date: date.toISOString().slice(0, 10),
          ranger: RANGERS[Math.floor(rand() * RANGERS.length)],
        });
      }
    }
  }
  return out;
}

// Round a sensitive location to a ~5 km grid so the exact spot is hidden.
export function protectLocation(s) {
  if (!speciesById[s.species]?.sensitive) return s;
  const grid = 0.05;
  return {
    ...s,
    lat: Math.round(s.lat / grid) * grid,
    lng: Math.round(s.lng / grid) * grid,
    protectedLocation: true,
  };
}
