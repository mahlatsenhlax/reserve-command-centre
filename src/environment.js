// Simulated field sensors. In a real reserve these would come from IoT devices.

export const LIMITS = {
  damLow: 30, // % full
  tempHigh: 38, // °C
  humidityLow: 20, // %
};

export function initialReadings() {
  return {
    damNorth: 58,
    damSouth: 34,
    temperature: 31,
    humidity: 28,
    wind: 18,
    rain24h: 0,
    daysSinceRain: 23,
  };
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const drift = (v, step) => v + (Math.random() - 0.5) * step;

export function nextReadings(r) {
  const raining = Math.random() < 0.04;
  const rain = raining ? Math.round(Math.random() * 12 * 10) / 10 : 0;
  return {
    damNorth: clamp(drift(r.damNorth, 1.2) - 0.05 + rain * 0.3, 0, 100),
    damSouth: clamp(drift(r.damSouth, 1.2) - 0.08 + rain * 0.3, 0, 100),
    temperature: clamp(drift(r.temperature, 1.4), 14, 44),
    humidity: clamp(drift(r.humidity, 3) + rain * 2, 5, 95),
    wind: clamp(drift(r.wind, 5), 0, 60),
    rain24h: rain,
    daysSinceRain: rain > 2 ? 0 : r.daysSinceRain,
  };
}

// Simplified fire danger index inspired by the McArthur forest fire danger index.
export function fireRisk(r) {
  const drought = Math.min(10, 2 + r.daysSinceRain / 4);
  const index =
    2 * Math.exp(-0.45 + 0.987 * Math.log(drought) - 0.0345 * r.humidity + 0.0338 * r.temperature + 0.0234 * r.wind);
  const score = Math.round(index);
  const level =
    score >= 50 ? 'Extreme' : score >= 24 ? 'Very high' : score >= 12 ? 'High' : score >= 5 ? 'Moderate' : 'Low';
  return { score, level };
}

export function alertsFor(r) {
  const out = [];
  const risk = fireRisk(r);
  if (['High', 'Very high', 'Extreme'].includes(risk.level))
    out.push({ kind: 'fire', text: `Fire danger is ${risk.level.toLowerCase()} (index ${risk.score}). Restrict open fires and check firebreaks.` });
  if (r.damNorth < LIMITS.damLow) out.push({ kind: 'water', text: `North dam is at ${r.damNorth.toFixed(0)}%. Check the borehole pump.` });
  if (r.damSouth < LIMITS.damLow) out.push({ kind: 'water', text: `South dam is at ${r.damSouth.toFixed(0)}%. Check the borehole pump.` });
  if (r.temperature > LIMITS.tempHigh) out.push({ kind: 'heat', text: `Temperature is ${r.temperature.toFixed(1)} °C. Animals will gather at water points.` });
  if (r.humidity < LIMITS.humidityLow) out.push({ kind: 'dry', text: `Humidity is ${r.humidity.toFixed(0)}%. Vegetation is very dry.` });
  return out;
}
