export interface MatchInfo {
  index: number;
  text: string;
  groups: (string | undefined)[];
  named?: Record<string, string>;
}

export type BuildResult =
  | { ok: true; re: RegExp }
  | { ok: false; error: string };

const MAX_MATCHES = 1000;

export function buildRegex(pattern: string, flags: string): BuildResult {
  if (!pattern) return { ok: false, error: '' };
  try {
    // always global internally so matchAll works, "g" off just means first match only
    const f = flags.includes('g') ? flags : flags + 'g';
    return { ok: true, re: new RegExp(pattern, f) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function findMatches(re: RegExp, text: string, global: boolean): MatchInfo[] {
  const out: MatchInfo[] = [];
  for (const m of text.matchAll(re)) {
    out.push({
      index: m.index ?? 0,
      text: m[0],
      groups: m.slice(1),
      named: m.groups,
    });
    if (!global || out.length >= MAX_MATCHES) break;
  }
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderHighlighted(text: string, matches: MatchInfo[]): string {
  let html = '';
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.text.length === 0) return; // can't highlight empty matches
    html += escapeHtml(text.slice(cursor, m.index));
    html += `<mark class="m${i % 2}">${escapeHtml(m.text)}</mark>`;
    cursor = m.index + m.text.length;
  });
  html += escapeHtml(text.slice(cursor));
  // trailing newline would collapse in the backdrop and desync it from the textarea
  return html + '\n';
}
