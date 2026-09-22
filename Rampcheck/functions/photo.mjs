// Mini-servidor: recibe la foto de la pantalla del sistema del aeropuerto
// y devuelve las llegadas/salidas leídas con IA (Claude visión).
// La clave vive acá, nunca en la app.

export default async (req) => {
  if (req.method === "OPTIONS") return cors(new Response("", { status: 204 }));
  if (req.method !== "POST") return cors(json({ error: "method" }, 405));

  let body = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const image = String(body.image || "");
  const stands = Array.isArray(body.stands) ? body.stands.slice(0, 400) : [];

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return cors(json({ error: "no_key" }, 500));
  if (!image.startsWith("data:image")) return cors(json({ error: "no_image" }, 400));

  // separar el base64 del data URL
  const m = image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!m) return cors(json({ error: "bad_image" }, 400));
  const mediaType = m[1];
  const b64 = m[2];

  const system = [
    "Sos un asistente que lee una captura de la pantalla del sistema de un aeropuerto (lista de vuelos) y devuelve JSON.",
    "",
    "Cada fila es un vuelo. Filas VERDES = llegadas (arrivals). Filas AZULES = salidas (departures).",
    "Estructura de una fila: arriba está el número de vuelo, la hora, un estado (letra o número), y a la derecha el PLATZ (ej E19, A23, B39).",
    "Debajo: matrícula, tipo de avión (ej 333, 77W, 763), origen.",
    "Y una fila de 6 NÚMEROS en este orden EXACTO: [1] kg de equipaje (wagen), [2] kg de post, [3] contenedores vacíos, [4] dolly, [5] tráiler, [6] tráiler gigante.",
    "",
    "Devolvé SOLO un JSON válido, sin texto extra:",
    '{ "flights": [ { "stand":"E19", "flight":"TG970", "type":"777", "time":"07:30", "isDeparture":false, "wagenKg":465, "postKg":0, "empties":0, "dolly":14, "trailer":12 } ] }',
    "",
    "Reglas:",
    "- isDeparture = true si la fila es AZUL (salida), false si es VERDE (llegada).",
    '- time = la hora estimada/relevante de la fila en formato "HH:MM" (la segunda hora si hay dos; para salidas, la hora de salida). Si no se lee, "".',
    "- wagenKg = 1er número, postKg = 2do, empties = 3ro, dolly = 4to, trailer = 5to.",
    "- Si un número no se lee o no está, poné 0.",
    "- stand debe ser el código del platz tal cual (mayúsculas).",
    "- Incluí TODAS las filas que puedas leer (verdes y azules).",
    stands.length ? ("Platz válidos (usá el más parecido si hay duda): " + stands.join(", ")) : ""
  ].join("\n");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
            { type: "text", text: "Leé todas las filas de esta pantalla y devolvé el JSON." }
          ]
        }]
      })
    });
    const data = await r.json();
    const txt = (data && data.content && data.content[0] && data.content[0].text) || "{}";
    const mt = txt.match(/\{[\s\S]*\}/);
    return cors(new Response(mt ? mt[0] : '{"flights":[]}', { headers: { "content-type": "application/json" } }));
  } catch (e) {
    return cors(json({ error: "upstream" }, 502));
  }
};

export const config = { path: "/api/photo" };

function json(o, s) { return new Response(JSON.stringify(o), { status: s || 200, headers: { "content-type": "application/json" } }); }
function cors(resp) {
  resp.headers.set("access-control-allow-origin", "*");
  resp.headers.set("access-control-allow-headers", "content-type");
  resp.headers.set("access-control-allow-methods", "POST, OPTIONS");
  return resp;
}
