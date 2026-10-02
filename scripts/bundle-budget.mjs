// Fails when the web export's JavaScript, gzipped, exceeds the budget. Usage: node scripts/bundle-budget.mjs dist [kilobytes]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const [dist = 'dist', budgetKb = '400'] = process.argv.slice(2);
const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
const js = files(join(dist, '_expo')).filter((f) => f.endsWith('.js'));
const kb = js.reduce((sum, f) => sum + gzipSync(readFileSync(f), { level: 9 }).length, 0) / 1024;

console.log(`bundle: ${kb.toFixed(0)} KB gzipped across ${js.length} files (budget ${budgetKb} KB)`);
if (kb > Number(budgetKb)) {
  console.error(`bundle: over budget by ${(kb - Number(budgetKb)).toFixed(0)} KB`);
  process.exit(1);
}
