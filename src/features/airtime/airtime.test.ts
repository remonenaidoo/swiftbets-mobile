import { buyErrorMessage, localNumber } from './api/airtime';

describe('localNumber', () => {
  it('reads spaced and international forms as the same local number', () => {
    expect(localNumber('082 123 4567')).toBe('0821234567');
    expect(localNumber('+27 82 123 4567')).toBe('0821234567');
  });

  it('refuses a landline or a short number', () => {
    expect(localNumber('011 123 4567')).toBeNull();
    expect(localNumber('082 123')).toBeNull();
  });
});

describe('buyErrorMessage', () => {
  it('explains a known refusal plainly', () => {
    expect(buyErrorMessage('insufficient_funds', 'x')).toBe('Your balance is too low for this purchase.');
  });

  it('falls back to the server message for an unknown code', () => {
    expect(buyErrorMessage('something_else', 'Server said no.')).toBe('Server said no.');
  });
});
