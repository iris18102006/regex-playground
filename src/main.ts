import './style.css';
import { buildRegex, findMatches, renderHighlighted, type MatchInfo } from './regex';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const patternEl = $<HTMLInputElement>('pattern');
const textEl = $<HTMLTextAreaElement>('text');
const backdrop = $<HTMLDivElement>('backdrop');
const errorEl = $<HTMLParagraphElement>('error');
const countEl = $<HTMLParagraphElement>('count');
const listEl = $<HTMLUListElement>('matches');
const flagEls = document.querySelectorAll<HTMLInputElement>('.flag input');

function currentFlags(): string {
  return [...flagEls].filter((f) => f.checked).map((f) => f.value).join('');
}

function renderList(matches: MatchInfo[]) {
  listEl.replaceChildren();
  matches.forEach((m, i) => {
    const li = document.createElement('li');
    const head = document.createElement('div');
    head.textContent = `#${i + 1}  "${m.text}"  at ${m.index}`;
    li.appendChild(head);

    m.groups.forEach((g, gi) => {
      const row = document.createElement('div');
      row.className = 'group';
      row.textContent = `group ${gi + 1}: ${g === undefined ? 'undefined' : `"${g}"`}`;
      li.appendChild(row);
    });

    if (m.named) {
      for (const [name, val] of Object.entries(m.named)) {
        const row = document.createElement('div');
        row.className = 'group';
        row.textContent = `${name}: "${val}"`;
        li.appendChild(row);
      }
    }
    listEl.appendChild(li);
  });
}

function update() {
  const text = textEl.value;
  const flags = currentFlags();
  const res = buildRegex(patternEl.value, flags);

  if (!res.ok) {
    errorEl.textContent = res.error;
    backdrop.innerHTML = renderHighlighted(text, []);
    countEl.textContent = '';
    listEl.replaceChildren();
    return;
  }

  errorEl.textContent = '';
  const matches = findMatches(res.re, text, flags.includes('g'));
  backdrop.innerHTML = renderHighlighted(text, matches);
  countEl.textContent = `${matches.length} match${matches.length === 1 ? '' : 'es'}`;
  renderList(matches);
}

textEl.addEventListener('scroll', () => {
  backdrop.scrollTop = textEl.scrollTop;
  backdrop.scrollLeft = textEl.scrollLeft;
});
patternEl.addEventListener('input', update);
textEl.addEventListener('input', update);
flagEls.forEach((f) => f.addEventListener('change', update));

update();

const presetEl = $<HTMLSelectElement>('preset');
presetEl.addEventListener('change', () => {
  if (!presetEl.value) return;
  patternEl.value = presetEl.value;
  update();
});
