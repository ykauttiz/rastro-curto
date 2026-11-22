"use strict";
const el = id => document.getElementById(id);
let captures = [null, null];
const versions = [0, 0];
const groups = [
  ["Duração por requisição", ["Abaixo de 100 ms", "100 a <500 ms", "500 a <2.000 ms", "2.000 ms ou mais", "Sem medição"], r => r.latency],
  ["Resposta HTTP", ["1xx", "2xx", "3xx", "4xx", "5xx", "Desconhecido"], r => Object.values(r.status)]
];
let bulletin = "";
function cell(row, tag, text, scope) {
  const item = document.createElement(tag);
  if (scope) item.scope = scope;
  item.textContent = text;
  row.append(item);
}
function render() {
  const [a, b] = captures;
  el("report").hidden = !a;
  el("clear").hidden = !a && !b;
  el("tables").replaceChildren();
  bulletin = "";
  if (!a) return;
  const count = n => n + (n === 1 ? " requisição" : " requisições");
  const summary = "A · " + count(a.requests) + (b ? "   /   B · " + count(b.requests) : "");
  el("summary").textContent = summary;
  const lines = ["Rastro Curto", summary];
  for (const [title, labels, values] of groups) {
    const first = values(a), second = b && values(b);
    const table = document.createElement("table");
    table.createCaption().textContent = title;
    const head = table.createTHead().insertRow();
    const columns = b ? ["Faixa", "A", "B", "Δ B−A"] : ["Faixa", "A"];
    columns.forEach(c => cell(head, "th", c, "col"));
    lines.push("", title, columns.join(" | "));
    const body = table.createTBody();
    labels.forEach((label, i) => {
      const row = body.insertRow();
      const counts = [first[i]];
      if (b) counts.push(second[i], second[i] - first[i]);
      cell(row, "th", label, "row");
      counts.forEach(v => cell(row, "td", v));
      lines.push([label, ...counts].join(" | "));
    });
    const card = document.createElement("div");
    card.className = "card";
    card.append(table);
    el("tables").append(card);
  }
  bulletin = lines.join("\n") + "\n";
}
function reset() {
  captures = [null, null];
  ["a", "b"].forEach((id,i) => { versions[i]++; el(id).value = ""; });
  render();
}
["a", "b"].forEach((id, i) => {
  el(id).addEventListener("change", async event => {
    const file = event.target.files[0];
    const version = ++versions[i];
    captures[i] = null;
    render();
    if (!file) { el("message").textContent = "Seleção removida."; return; }
    try {
      if (file.size > 12 * 1024 * 1024) throw Error("Use uma captura de até 12 MiB.");
      const raw = await file.text();
      if (version !== versions[i]) return;
      let har;
      try { har = JSON.parse(raw.replace(/^\uFEFF/, "")); }
      catch { throw Error("O arquivo não é JSON válido."); }
      captures[i] = summarize(har);
      el("message").textContent = captures[0] ? "Boletim atualizado." : "B está pronta. Selecione A para comparar.";
    } catch (error) {
      if (version !== versions[i]) return;
      el("message").textContent = error.message;
    }
    event.target.value = "";
    render();
  });
});
el("demo").onclick = () => {
  reset();
  captures = [[80,240,275,850,2300,2600],[70,180,260,380,610,750]].map((times, index) =>
    summarize({log:{entries:times.map((time,i) => ({time,request:{},response:{status:i===5 && index===0 ? 503 : 200}}))}}));
  render();
  el("message").textContent = "Exemplo fictício carregado. Compare as duas colunas do boletim.";
  el("mesa").focus();
};
el("clear").onclick = () => { reset(); el("message").textContent = "Sessão limpa."; el("a").focus(); };
el("download").onclick = () => {
  const url = URL.createObjectURL(new Blob([bulletin], {type:"text/plain;charset=utf-8"}));
  const link = document.createElement("a");
  link.href = url;
  link.download = "rastro-curto.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const theme = el("theme");
try {
  const saved = localStorage.getItem("rastro-curto.tema");
  if (["light","dark"].includes(saved)) theme.value = saved;
} catch {}
document.documentElement.dataset.theme = theme.value;
theme.onchange = () => {
  document.documentElement.dataset.theme = theme.value;
  try { localStorage.setItem("rastro-curto.tema", theme.value); } catch {}
};
