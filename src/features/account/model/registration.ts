/** Mirrors identity's rules so the form can say what is wrong before a round trip; identity stays the authority. */
export const minimumAge = 18;
export const minimumPasswordLength = 10;

export interface RegistrationForm {
  email: string;
  password: string;
  dateOfBirth: string;
  currency: 'ZAR' | 'USD';
  acceptedTerms: boolean;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationForm, string>>;

export function ageOn(dateOfBirth: Date, today: Date): number {
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (today.getUTCMonth() === dateOfBirth.getUTCMonth() && today.getUTCDate() < dateOfBirth.getUTCDate());
  if (beforeBirthday) {
    age -= 1;
  }
  return age;
}

/** Parses YYYY-MM-DD strictly; anything else, or an impossible date, is null. */
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCMonth() === Number(match[2]) - 1 ? date : null;
}

export function validateRegistration(form: RegistrationForm, today: Date): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (form.password.length < minimumPasswordLength) {
    errors.password = `Use at least ${minimumPasswordLength} characters.`;
  }
  const dateOfBirth = parseDate(form.dateOfBirth);
  if (!dateOfBirth) {
    errors.dateOfBirth = 'Enter your date of birth as YYYY-MM-DD.';
  } else if (ageOn(dateOfBirth, today) < minimumAge) {
    errors.dateOfBirth = `You must be ${minimumAge} or older to open an account.`;
  }
  if (!form.acceptedTerms) {
    errors.acceptedTerms = 'Confirm you are 18 or older and accept the terms.';
  }
  return errors;
}

/** What to tell the customer for each refusal identity can return. */
export function accountErrorMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Email or password is incorrect.';
    case 'account_locked':
      return 'Too many failed attempts. Try again in a few minutes or reset your password.';
    case 'account_suspended':
    case 'account_closed':
      return 'This account cannot sign in. Contact support.';
    case 'account_self_excluded':
      return 'This account is self-excluded and cannot sign in until the exclusion ends.';
    case 'underage':
      return `You must be ${minimumAge} or older to open an account.`;
    case 'token_invalid':
      return 'This link has expired or was already used. Request a new one.';
    case 'password_weak':
    case 'email_invalid':
    case 'currency_not_supported':
    case 'country_not_supported':
      return fallback;
    default:
      return 'Something went wrong. Try again.';
  }
}
