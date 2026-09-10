/**
 * Contact normalisation for the lead form. See the spec's "Lead capture" section.
 * Pure and dependency free so it can run in the browser (inline validation) and on the server.
 */

export type ContactType = 'email' | 'whatsapp';
export type Contact = { type: ContactType; value: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Ten digits starting 6 to 9: an Indian mobile number without a country code. */
const INDIAN_MOBILE = /^[6-9]\d{9}$/;
/** A plus sign followed by 8 to 15 digits: any number given with its country code. */
const WITH_COUNTRY_CODE = /^\+\d{8,15}$/;

/**
 * Returns the canonical contact, or null when the input is not an email address
 * or a WhatsApp number we can message.
 *
 * - Emails are lowercased.
 * - Numbers lose spaces, dashes and brackets. A bare 10-digit Indian number gets "+91".
 */
export function normalizeContact(raw: string): Contact | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes('@')) {
    const email = trimmed.toLowerCase();
    return EMAIL.test(email) ? { type: 'email', value: email } : null;
  }

  const digits = trimmed.replace(/[\s\-()[\]]/g, '');
  if (INDIAN_MOBILE.test(digits)) return { type: 'whatsapp', value: `+91${digits}` };
  if (WITH_COUNTRY_CODE.test(digits)) return { type: 'whatsapp', value: digits };
  return null;
}
