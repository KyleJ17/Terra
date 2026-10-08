// netlify/functions/api.mjs  -  Terra backend (Netlify Functions v2 + Netlify Blobs)
// Routes:  GET /api/landmarks   -> today's daily 5 + the full list (for practice)
//          GET /api/leaderboard -> today's top 50 (?clientId=... also returns your own entry)
//          POST /api/score      -> {clientId, name, guesses:[{lat,lon} x5]}  (score is computed here)
import { getStore } from "@netlify/blobs";

const LANDMARKS = [{"name": "Eiffel Tower","cty": "France","lat": 48.858,"lon": 2.294,"clue": "An iron lattice tower raised for a world's fair in 1889."},{"name": "Colosseum","cty": "Italy","lat": 41.89,"lon": 12.492,"clue": "An ancient amphitheatre where gladiators once fought."},{"name": "Big Ben","cty": "United Kingdom","lat": 51.501,"lon": -0.125,"clue": "A famous clock tower beside a river, home to a parliament."},{"name": "Sagrada Família","cty": "Spain","lat": 41.404,"lon": 2.174,"clue": "An unfinished basilica designed by Gaudí, under construction since 1882."},{"name": "Brandenburg Gate","cty": "Germany","lat": 52.516,"lon": 13.378,"clue": "A neoclassical gate that stood beside a Cold War wall."},{"name": "Acropolis of Athens","cty": "Greece","lat": 37.971,"lon": 23.726,"clue": "A hilltop citadel crowned by the Parthenon."},{"name": "Hagia Sophia","cty": "Turkey","lat": 41.008,"lon": 28.98,"clue": "A former cathedral turned mosque, straddling two continents' crossroads."},{"name": "Leaning Tower of Pisa","cty": "Italy","lat": 43.723,"lon": 10.396,"clue": "A bell tower famous for its tilt."},{"name": "Stonehenge","cty": "United Kingdom","lat": 51.179,"lon": -1.826,"clue": "A prehistoric ring of standing stones on a plain."},{"name": "Neuschwanstein Castle","cty": "Germany","lat": 47.558,"lon": 10.75,"clue": "A fairy-tale castle that inspired Disney's."},{"name": "Alhambra","cty": "Spain","lat": 37.177,"lon": -3.588,"clue": "A Moorish palace-fortress above a Spanish city."},{"name": "Red Square","cty": "Russia","lat": 55.754,"lon": 37.62,"clue": "A vast square beside a fortress and onion-domed cathedral."},{"name": "Charles Bridge","cty": "Czechia","lat": 50.086,"lon": 14.411,"clue": "A medieval stone bridge lined with statues."},{"name": "Mont Saint-Michel","cty": "France","lat": 48.636,"lon": -1.511,"clue": "A tidal island topped with an abbey."},{"name": "Atomium","cty": "Belgium","lat": 50.895,"lon": 4.341,"clue": "A giant steel model of an iron crystal built for a 1958 expo."},{"name": "Giza Pyramids","cty": "Egypt","lat": 29.979,"lon": 31.134,"clue": "The last surviving wonder of the ancient world."},{"name": "Abu Simbel","cty": "Egypt","lat": 22.337,"lon": 31.626,"clue": "Rock temples moved to save them from a rising reservoir."},{"name": "Table Mountain","cty": "South Africa","lat": -33.963,"lon": 18.403,"clue": "A flat-topped mountain overlooking a Cape city."},{"name": "Victoria Falls","cty": "Zambia/Zimbabwe","lat": -17.925,"lon": 25.857,"clue": "\"The smoke that thunders\", on the Zambezi."},{"name": "Mount Kilimanjaro","cty": "Tanzania","lat": -3.067,"lon": 37.356,"clue": "Africa's highest peak, a snow-capped volcano."},{"name": "Petra","cty": "Jordan","lat": 30.329,"lon": 35.444,"clue": "A rose-red city carved into canyon rock."},{"name": "Burj Khalifa","cty": "UAE","lat": 25.197,"lon": 55.274,"clue": "The world's tallest building."},{"name": "Western Wall","cty": "Israel","lat": 31.777,"lon": 35.234,"clue": "An ancient limestone wall in a holy old city."},{"name": "Taj Mahal","cty": "India","lat": 27.175,"lon": 78.042,"clue": "A white marble mausoleum built for an emperor's wife."},{"name": "Gateway of India","cty": "India","lat": 18.922,"lon": 72.835,"clue": "A basalt arch overlooking the Arabian Sea."},{"name": "Great Wall of China","cty": "China","lat": 40.432,"lon": 116.57,"clue": "A defensive barrier snaking across mountain ridges."},{"name": "Forbidden City","cty": "China","lat": 39.916,"lon": 116.397,"clue": "A vast imperial palace complex in a capital's centre."},{"name": "Terracotta Army","cty": "China","lat": 34.385,"lon": 109.273,"clue": "Thousands of clay soldiers guarding an emperor's tomb."},{"name": "Angkor Wat","cty": "Cambodia","lat": 13.412,"lon": 103.867,"clue": "The largest religious monument in the world."},{"name": "Petronas Towers","cty": "Malaysia","lat": 3.158,"lon": 101.712,"clue": "Twin skyscrapers linked by a sky bridge."},{"name": "Marina Bay Sands","cty": "Singapore","lat": 1.284,"lon": 103.861,"clue": "A hotel with a ship-shaped rooftop park."},{"name": "Mount Fuji","cty": "Japan","lat": 35.361,"lon": 138.727,"clue": "A near-perfect snow-capped volcanic cone."},{"name": "Tokyo Skytree","cty": "Japan","lat": 35.71,"lon": 139.811,"clue": "The tallest tower in the world's biggest metropolis."},{"name": "Fushimi Inari Shrine","cty": "Japan","lat": 34.967,"lon": 135.773,"clue": "Thousands of vermilion torii gates up a mountain."},{"name": "Burj Al Arab","cty": "UAE","lat": 25.141,"lon": 55.185,"clue": "A sail-shaped luxury hotel on its own island."},{"name": "Borobudur","cty": "Indonesia","lat": -7.608,"lon": 110.204,"clue": "The world's largest Buddhist temple, built of volcanic stone."},{"name": "Mount Everest","cty": "Nepal/China","lat": 27.988,"lon": 86.925,"clue": "The highest point on Earth."},{"name": "Sydney Opera House","cty": "Australia","lat": -33.857,"lon": 151.215,"clue": "Sail-like shells on a harbour."},{"name": "Uluru","cty": "Australia","lat": -25.345,"lon": 131.037,"clue": "A giant red sandstone monolith in the outback."},{"name": "Great Barrier Reef","cty": "Australia","lat": -18.287,"lon": 147.7,"clue": "The largest coral reef system on Earth."},{"name": "Milford Sound","cty": "New Zealand","lat": -44.671,"lon": 167.926,"clue": "A fjord with towering cliffs and waterfalls."},{"name": "Sky Tower","cty": "New Zealand","lat": -36.848,"lon": 174.762,"clue": "The tallest freestanding structure in the southern hemisphere's \"City of Sails\"."},{"name": "Statue of Liberty","cty": "USA","lat": 40.689,"lon": -74.045,"clue": "A copper lady holding a torch in a harbour, a gift from France."},{"name": "Golden Gate Bridge","cty": "USA","lat": 37.82,"lon": -122.479,"clue": "An orange suspension bridge in a foggy bay."},{"name": "Grand Canyon","cty": "USA","lat": 36.107,"lon": -112.113,"clue": "A mile-deep canyon carved by the Colorado River."},{"name": "Mount Rushmore","cty": "USA","lat": 43.879,"lon": -103.459,"clue": "Four presidents carved in granite."},{"name": "Niagara Falls","cty": "Canada/USA","lat": 43.08,"lon": -79.074,"clue": "Thundering falls on a border."},{"name": "CN Tower","cty": "Canada","lat": 43.643,"lon": -79.387,"clue": "A 553 m concrete tower on a Great Lakes shoreline."},{"name": "Space Needle","cty": "USA","lat": 47.621,"lon": -122.349,"clue": "A 1962 world's fair observation tower."},{"name": "Chichén Itzá","cty": "Mexico","lat": 20.684,"lon": -88.568,"clue": "A Maya step pyramid aligned with the equinox."},{"name": "Panama Canal","cty": "Panama","lat": 9.08,"lon": -79.681,"clue": "A waterway linking two oceans."},{"name": "Christ the Redeemer","cty": "Brazil","lat": -22.952,"lon": -43.211,"clue": "A giant statue on a peak above a carnival city."},{"name": "Machu Picchu","cty": "Peru","lat": -13.163,"lon": -72.545,"clue": "An Inca citadel high in the Andes."},{"name": "Iguazu Falls","cty": "Argentina/Brazil","lat": -25.695,"lon": -54.436,"clue": "A chain of waterfalls on a jungle border."},{"name": "Salar de Uyuni","cty": "Bolivia","lat": -20.133,"lon": -67.489,"clue": "The world's largest salt flat, a natural mirror."},{"name": "Easter Island Moai","cty": "Chile","lat": -27.113,"lon": -109.35,"clue": "Giant stone heads on a remote Pacific island."},{"name": "Galápagos Islands","cty": "Ecuador","lat": -0.953,"lon": -90.966,"clue": "Volcanic islands that inspired Darwin."},{"name": "Torres del Paine","cty": "Chile","lat": -50.942,"lon": -73.406,"clue": "Granite spires in Patagonia."},{"name": "Northern Lights, Tromsø","cty": "Norway","lat": 69.649,"lon": 18.956,"clue": "An Arctic city under the aurora."},{"name": "Blue Lagoon","cty": "Iceland","lat": 63.88,"lon": -22.449,"clue": "A geothermal spa in a lava field."},{"name": "Cliffs of Moher","cty": "Ireland","lat": 52.972,"lon": -9.426,"clue": "Sea cliffs towering over the Atlantic."},{"name": "Santorini","cty": "Greece","lat": 36.393,"lon": 25.461,"clue": "White-washed villages on a volcanic caldera rim."},{"name": "Venice Grand Canal","cty": "Italy","lat": 45.434,"lon": 12.339,"clue": "A main waterway of a city built on a lagoon."},{"name": "Dubrovnik Old Town","cty": "Croatia","lat": 42.641,"lon": 18.11,"clue": "A walled \"Pearl of the Adriatic\"."}];

const N = 5, R = 6371;
const today = () => new Date().toISOString().slice(0, 10);

function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
function dailySet(day) {
  const a = LANDMARKS.slice(), rnd = seeded("terra-" + day);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, N);
}
function hav(a, b) {
  const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
const points = (d) => Math.round(5000 * Math.exp(-Math.max(0, d - 25) / 2000));
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export default async (req) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/?/, "");
  const day = today();
  const store = getStore("leaderboard");

  if (req.method === "GET" && route === "landmarks") {
    return json({ day, daily: dailySet(day), all: LANDMARKS });
  }

  if (req.method === "GET" && route === "leaderboard") {
    const clientId = (url.searchParams.get("clientId") || "").slice(0, 64);
    const { blobs } = await store.list({ prefix: day + "/" });
    const rows = (await Promise.all(blobs.slice(0, 500).map((b) => store.get(b.key, { type: "json" }))))
      .filter(Boolean);
    rows.sort((a, b) => b.score - a.score || a.ts - b.ts);
    const me = clientId ? rows.find((r) => r.id === clientId) : null;
    return json({
      day,
      entries: rows.slice(0, 50).map((r) => ({ name: r.name, score: r.score, mine: r.id === clientId })),
      me: me ? { score: me.score } : null,
    });
  }

  if (req.method === "POST" && route === "score") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
    const id = String(body.clientId || "").slice(0, 64);
    const name = String(body.name || "").replace(/[<>]/g, "").trim().slice(0, 20) || "Player";
    const g = body.guesses;
    if (!id || !Array.isArray(g) || g.length !== N ||
        g.some((p) => !p || !Number.isFinite(p.lat) || !Number.isFinite(p.lon) || Math.abs(p.lat) > 90 || Math.abs(p.lon) > 360))
      return json({ error: "invalid guesses" }, 400);
    const key = day + "/" + id;
    if (await store.get(key)) return json({ error: "already played today" }, 409);
    const set = dailySet(day);
    const dists = set.map((t, i) => hav(g[i], t));         // score is computed on the server
    const score = dists.reduce((s, d) => s + points(d), 0);
    await store.setJSON(key, { id, name, score, dists, ts: Date.now() });
    return json({ score, dists });
  }

  return json({ error: "not found" }, 404);
};

export const config = { path: "/api/*" };
