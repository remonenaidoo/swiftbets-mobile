/* global __dirname, describe, it, expect */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

// The policy nginx sends with every page of the site (deploy/nginx.conf).
const csp = /set \$csp "([^"]+)"/.exec(readFileSync(join(__dirname, '../../deploy/nginx.conf'), 'utf8'))[1];
const directive = (name) => csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? '';

describe('site content security policy', () => {
  it('lets the casino frame only this site and the configured provider origins', () => {
    expect(directive('frame-src')).toBe("frame-src 'self' $frame_origins");
  });

  it('never allows inline or evaluated scripts', () => {
    expect(directive('script-src')).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  });
});
