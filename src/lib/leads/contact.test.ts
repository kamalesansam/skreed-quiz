import { describe, expect, it } from 'vitest';
import { normalizeContact } from './contact';

describe('normalizeContact', () => {
  describe('email', () => {
    it('accepts an address and lowercases it', () => {
      expect(normalizeContact('Sam@Example.COM')).toEqual({ type: 'email', value: 'sam@example.com' });
    });

    it('trims surrounding whitespace', () => {
      expect(normalizeContact('  sam@example.com\n')).toEqual({ type: 'email', value: 'sam@example.com' });
    });

    it('rejects addresses without a dotted domain or with spaces', () => {
      expect(normalizeContact('sam@example')).toBeNull();
      expect(normalizeContact('sam@example.c')).toBeNull();
      expect(normalizeContact('sam @example.com')).toBeNull();
      expect(normalizeContact('@example.com')).toBeNull();
      expect(normalizeContact('sam@@example.com')).toBeNull();
    });
  });

  describe('whatsapp', () => {
    it('turns a bare 10-digit Indian number into +91', () => {
      expect(normalizeContact('9876543210')).toEqual({ type: 'whatsapp', value: '+919876543210' });
    });

    it('strips spaces and dashes first', () => {
      expect(normalizeContact('98765 43210')).toEqual({ type: 'whatsapp', value: '+919876543210' });
      expect(normalizeContact('98765-43210')).toEqual({ type: 'whatsapp', value: '+919876543210' });
      expect(normalizeContact(' 98765 - 43210 ')).toEqual({ type: 'whatsapp', value: '+919876543210' });
    });

    it('accepts every leading digit from 6 to 9', () => {
      for (const d of ['6', '7', '8', '9']) {
        expect(normalizeContact(`${d}123456789`)).toEqual({ type: 'whatsapp', value: `+91${d}123456789` });
      }
    });

    it('rejects a 10-digit number that does not start 6 to 9', () => {
      expect(normalizeContact('1234567890')).toBeNull();
      expect(normalizeContact('5123456789')).toBeNull();
    });

    it('keeps a number given with a plus and 8 to 15 digits', () => {
      expect(normalizeContact('+91 98765 43210')).toEqual({ type: 'whatsapp', value: '+919876543210' });
      expect(normalizeContact('+44 7911 123456')).toEqual({ type: 'whatsapp', value: '+447911123456' });
      expect(normalizeContact('+12345678')).toEqual({ type: 'whatsapp', value: '+12345678' });
      expect(normalizeContact('+123456789012345')).toEqual({ type: 'whatsapp', value: '+123456789012345' });
    });

    it('rejects a plus number outside 8 to 15 digits', () => {
      expect(normalizeContact('+1234567')).toBeNull();
      expect(normalizeContact('+1234567890123456')).toBeNull();
    });

    it('strips brackets', () => {
      expect(normalizeContact('(+91) 98765-43210')).toEqual({ type: 'whatsapp', value: '+919876543210' });
      expect(normalizeContact('[98765] 43210')).toEqual({ type: 'whatsapp', value: '+919876543210' });
    });

    it('rejects letters mixed into a number', () => {
      expect(normalizeContact('+91 98765 abcde')).toBeNull();
    });
  });

  describe('rejects', () => {
    it('a short number', () => {
      expect(normalizeContact('12345')).toBeNull();
    });

    it('plain words', () => {
      expect(normalizeContact('hello')).toBeNull();
    });

    it('empty and whitespace-only input', () => {
      expect(normalizeContact('')).toBeNull();
      expect(normalizeContact('   ')).toBeNull();
    });
  });
});
