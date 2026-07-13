/* ============================================================
   C8 · COLOPHON + METHOD (light) — whitepaper §0.5-R3.
   What it looks like: the credits page of a printed annual
   report — sources with retrieval dates, the source-discrepancy
   register (shown, not hidden), assumptions, analysis links,
   then credits/contact.
   What it does: renders everything from data/sources.json so the
   method register has exactly one editable home. No animation —
   a methods page should hold still.
   ============================================================ */
import sources from '../../data/sources.json';

export function initChapter() {
  const c8 = document.querySelector('#c8');

  const tbody = c8.querySelector('#c8-sources tbody');
  for (const source of sources.sources) {
    const row = document.createElement('tr');
    row.innerHTML =
      `<td class="mono">${source.date}</td>` +
      `<td><strong>${source.outlet}</strong> — ${source.item}</td>` +
      `<td>${source.used_for}</td>`;
    tbody.appendChild(row);
  }

  const discrepancies = c8.querySelector('#c8-discrepancies');
  for (const d of sources.discrepancies) {
    const item = document.createElement('div');
    item.className = 'register-item';
    item.innerHTML =
      `<p class="mono">${d.topic}</p>` +
      `<div><p>${d.versions}</p><p class="mono">${d.treatment}</p></div>`;
    discrepancies.appendChild(item);
  }

  const assumptions = c8.querySelector('#c8-assumptions');
  for (const a of sources.assumptions) {
    const li = document.createElement('li');
    li.textContent = a;
    assumptions.appendChild(li);
  }
}
