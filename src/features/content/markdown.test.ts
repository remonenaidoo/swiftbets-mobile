import { parseMarkdown } from './markdown';

describe('parseMarkdown', () => {
  it('reads headings, lists, bold and site links', () => {
    const blocks = parseMarkdown('## Tools\n\n- **Deposit limits**: cap deposits\n- See [help](/help)\n\nCall **0800 006 008**.');

    expect(blocks.map((b) => b.kind)).toEqual(['heading', 'list', 'paragraph']);
    expect(blocks[1]).toMatchObject({ ordered: false, items: [[{ text: 'Deposit limits', bold: true }, { text: ': cap deposits' }], [{ text: 'See ' }, { kind: 'link', href: '/help' }]] });
  });

  it('keeps HTML as text and drops unsafe links', () => {
    const blocks = parseMarkdown('<script>alert(1)</script> [win](javascript:alert(1)) [x](//evil.example)');

    expect(JSON.stringify(blocks)).not.toContain('"kind":"link"');
    expect(blocks[0]?.kind === 'paragraph' && blocks[0].inlines[0]).toEqual({ kind: 'text', text: '<script>alert(1)</script> ', bold: false });
  });
});
