/**
 * A small markdown reader for site pages: headings, paragraphs, lists, bold and links. It builds plain data that is
 * rendered as native text, so HTML in a page shows as text and never runs. Links go only to site paths or https.
 */
export type Inline = { kind: 'text'; text: string; bold: boolean } | { kind: 'link'; text: string; href: string };

export type Block =
  | { kind: 'heading'; level: 1 | 2 | 3; inlines: Inline[] }
  | { kind: 'paragraph'; inlines: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] };

export function safeHref(href: string): string | null {
  if (/^\/(?!\/)[A-Za-z0-9/_.?=&#-]*$/.test(href)) return href;
  return /^https:\/\/[^\s]+$/i.test(href) ? href : null;
}

export function parseInlines(source: string): Inline[] {
  const out: Inline[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > last) out.push({ kind: 'text', text: source.slice(last, match.index), bold: false });
    if (match[1] !== undefined) {
      const href = safeHref(match[2] ?? '');
      out.push(href ? { kind: 'link', text: match[1], href } : { kind: 'text', text: match[1], bold: false });
    } else {
      out.push({ kind: 'text', text: match[3] ?? '', bold: true });
    }
    last = match.index + match[0].length;
  }
  if (last < source.length) out.push({ kind: 'text', text: source.slice(last), bold: false });
  return out;
}

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: Inline[][] } | null = null;
  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', inlines: parseInlines(paragraph.join(' ')) });
    if (list) blocks.push({ kind: 'list', ...list });
    paragraph = [];
    list = null;
  };

  for (const raw of source.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (!line) {
      flush();
    } else if (heading) {
      flush();
      blocks.push({ kind: 'heading', level: (heading[1] ?? '#').length as 1 | 2 | 3, inlines: parseInlines(heading[2] ?? '') });
    } else if (bullet || numbered) {
      const ordered = numbered !== null;
      if (paragraph.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(parseInlines((bullet ?? numbered)?.[1] ?? ''));
    } else {
      if (list) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
