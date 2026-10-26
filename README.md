# 🦒 Reserve Command Centre

A React dashboard that brings wildlife monitoring, environmental sensing and population forecasting together for a nature reserve, on one screen.

**Live demo:** https://mahlatsenhlax.github.io/reserve-command-centre/

> Built by **Mahlatse Nchabeleng**, a software development lead with a Diploma in Nature Conservation, to show how IT can support conservation work. The reserve, sightings and sensor readings are fictional sample data.

## The problem

Reserve managers juggle three questions every day:

1. **Where are the animals?** Rangers log sightings, but the records often sit in notebooks or spreadsheets.
2. **Is the environment safe?** Low dams and high fire danger need action before they become emergencies.
3. **Which species need attention?** Falling sighting numbers can be an early warning of a population problem.

Reserve Command Centre answers all three in one place.

## Features

### 🗺️ Wildlife sightings
- Interactive map of sightings, sized by group size and coloured by species
- Filter by species and time period (30 days, 90 days, 12 months)
- Log a new sighting by clicking the map and filling in a short form
- **Protects sensitive species:** rhino locations are rounded to a ~5 km zone and never shown as exact points, because sighting data can be used by poachers
- Sightings by species chart and a table of the latest records
- New sightings are saved in your browser (no account or server needed)

### 🌡️ Environment monitor
- Simulated live sensor feed for two dams, temperature, humidity, wind and rainfall
- **Fire danger rating** (Low to Extreme), using a simplified version of the McArthur fire danger index
- Automatic alerts when dams drop below 30%, temperature passes 38 °C, humidity falls below 20%, or fire danger is high
- Live temperature and humidity trend chart, with a pause button

### 📈 Sightings forecast
- Linear regression on the last 12 months of sightings per species
- 6-month forecast with a likely range band
- Plain-language trend summary, for example "sightings are falling at about 15% a year"

## Tech stack

| Area | Tools |
|---|---|
| Front end | React 18, Vite |
| Map | Leaflet, React-Leaflet, OpenStreetMap tiles |
| Charts | Recharts |
| Forecasting | Linear regression in JavaScript |
| CI/CD | GitHub Actions builds and deploys on every push to `main` |
| Hosting | GitHub Pages |

Every tool used is free and open source. No API keys are required.

## Run it locally

You need [Node.js](https://nodejs.org) 18 or later.

```bash
git clone https://github.com/mahlatsenhlax/reserve-command-centre.git
cd reserve-command-centre
npm install
npm run dev
```

Then open the address Vite prints, usually http://localhost:5173/reserve-command-centre/.

## Project structure

```
src/
├── App.jsx            Page layout and saved sightings
├── Sightings.jsx      Map, filters, chart, log form and table
├── Environment.jsx    Sensor gauges, fire danger and alerts
├── Forecast.jsx       Forecast chart and trend summary
├── data.js            Sample reserve, species and sightings
├── environment.js     Sensor simulation and fire danger index
├── forecast.js        Monthly totals and regression
└── styles.css         Styling
.github/workflows/
└── deploy.yml         Build and deploy to GitHub Pages
```

## Ideas for next steps

- Replace simulated sensors with real IoT devices or a SCADA feed (for example Ignition)
- Store sightings in a shared cloud database so a whole ranger team can use it
- A React Native app for logging sightings offline in the field
- Image recognition to identify species from camera-trap photos

## Licence

MIT. Free to use and adapt.
