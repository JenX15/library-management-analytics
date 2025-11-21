// js/data.js
// Responsible only for fetching the static data.json
const DATA_URL = 'data/data.json';

async function fetchInitialData() {
  const resp = await fetch(DATA_URL, { cache: 'no-store' });
  if (!resp.ok) throw new Error('Could not load data.json');
  return resp.json();
}
