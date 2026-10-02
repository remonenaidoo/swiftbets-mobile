import { launchRefusal } from './api/casino';

describe('casino launch refusals', () => {
  it('explains a self-exclusion or limit plainly', () => {
    expect(launchRefusal('casino_restricted')).toContain('self-exclusion');
  });

  it('falls back to a retry message for anything unexpected', () => {
    expect(launchRefusal('something_else')).toBe('The game could not start. Try again.');
  });
});
