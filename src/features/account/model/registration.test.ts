import { accountErrorMessage, ageOn, parseDate, validateRegistration, type RegistrationForm } from './registration';

const today = new Date(Date.UTC(2026, 9, 1));
const valid: RegistrationForm = { email: 'fan@example.com', password: 'a long passphrase', dateOfBirth: '2008-10-01', currency: 'ZAR', acceptedTerms: true };

describe('registration rules', () => {
  it('accepts someone who turns eighteen today', () => {
    expect(validateRegistration(valid, today)).toEqual({});
  });

  it('refuses someone who turns eighteen tomorrow', () => {
    expect(validateRegistration({ ...valid, dateOfBirth: '2008-10-02' }, today).dateOfBirth).toMatch(/18 or older/);
  });

  it('rejects impossible and malformed dates', () => {
    expect(parseDate('2001-02-30')).toBeNull();
    expect(parseDate('01/02/2001')).toBeNull();
    expect(parseDate('2001-02-28')).not.toBeNull();
  });

  it('counts age in whole birthdays', () => {
    expect(ageOn(new Date(Date.UTC(1990, 9, 2)), today)).toBe(35);
    expect(ageOn(new Date(Date.UTC(1990, 9, 1)), today)).toBe(36);
  });

  it('lists every problem with the form at once', () => {
    const errors = validateRegistration({ email: 'nope', password: 'short', dateOfBirth: '', currency: 'ZAR', acceptedTerms: false }, today);
    expect(Object.keys(errors).sort()).toEqual(['acceptedTerms', 'dateOfBirth', 'email', 'password']);
  });

  it('explains a self-excluded sign-in without leaking anything for unknown codes', () => {
    expect(accountErrorMessage('account_self_excluded', 'x')).toMatch(/self-excluded/);
    expect(accountErrorMessage('something_internal', 'leak')).toBe('Something went wrong. Try again.');
  });
});
