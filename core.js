// Only these counters cross the boundary between the recording and the report.
function summarize(har) {
  const entries = har?.log?.entries;
  if (!Array.isArray(entries)) throw Error("Arquivo sem lista de requisições HAR.");
  if (entries.length > 50000) throw Error("Limite de 50 mil requisições por captura.");
  const status = { "1xx": 0, "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, desconhecido: 0 };
  const latency = [0, 0, 0, 0, 0];
  for (const entry of entries) {
    if (!entry || typeof entry.request !== "object" || !entry.request ||
        typeof entry.response !== "object" || !entry.response ||
        Array.isArray(entry.request) || Array.isArray(entry.response))
      throw Error("Uma entrada não contém requisição e resposta válidas.");
    const code = entry.response.status;
    const family = Number.isInteger(code) && code >= 100 && code < 600
      ? Math.floor(code / 100) + "xx" : "desconhecido";
    status[family]++;
    const ms = entry.time;
    const bucket = !Number.isFinite(ms) || ms < 0 ? 4 :
      ms < 100 ? 0 : ms < 500 ? 1 : ms < 2000 ? 2 : 3;
    latency[bucket]++;
  }
  return { requests: entries.length, status, latency };
}
if (typeof module !== "undefined") module.exports = { summarize };
