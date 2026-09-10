/**
 * Device list and verified skreed.com en-in product handles.
 * Handles verified against the Shopify Admin API on 2026-09-10 (all ACTIVE, in stock).
 * Store links always use the /en-in/ market path so rupee prices show.
 */

export type SeriesKey =
  | 'iphone17'
  | 'iphone16'
  | 'iphone15'
  | 's26'
  | 's25'
  | 'pixel10'
  | 'airpods4'
  | 'airpodspro2'
  | 'airpodspro3'
  | 'other';

export type Device = { id: string; label: string; series: SeriesKey };
export type DeviceGroup = { label: string; devices: Device[] };

export const DEVICE_GROUPS: DeviceGroup[] = [
  {
    label: 'iPhone 17 series',
    devices: [
      { id: 'ip17', label: 'iPhone 17', series: 'iphone17' },
      { id: 'ip17air', label: 'iPhone 17 Air', series: 'iphone17' },
      { id: 'ip17pro', label: 'iPhone 17 Pro', series: 'iphone17' },
      { id: 'ip17promax', label: 'iPhone 17 Pro Max', series: 'iphone17' },
    ],
  },
  {
    label: 'iPhone 16 series',
    devices: [
      { id: 'ip16', label: 'iPhone 16', series: 'iphone16' },
      { id: 'ip16plus', label: 'iPhone 16 Plus', series: 'iphone16' },
      { id: 'ip16pro', label: 'iPhone 16 Pro', series: 'iphone16' },
      { id: 'ip16promax', label: 'iPhone 16 Pro Max', series: 'iphone16' },
    ],
  },
  {
    label: 'iPhone 15 series',
    devices: [
      { id: 'ip15', label: 'iPhone 15', series: 'iphone15' },
      { id: 'ip15plus', label: 'iPhone 15 Plus', series: 'iphone15' },
      { id: 'ip15pro', label: 'iPhone 15 Pro', series: 'iphone15' },
      { id: 'ip15promax', label: 'iPhone 15 Pro Max', series: 'iphone15' },
    ],
  },
  {
    label: 'Samsung Galaxy',
    devices: [
      { id: 's26', label: 'Galaxy S26', series: 's26' },
      { id: 's26plus', label: 'Galaxy S26+', series: 's26' },
      { id: 's26ultra', label: 'Galaxy S26 Ultra', series: 's26' },
      { id: 's25', label: 'Galaxy S25', series: 's25' },
      { id: 's25plus', label: 'Galaxy S25+', series: 's25' },
      { id: 's25ultra', label: 'Galaxy S25 Ultra', series: 's25' },
    ],
  },
  {
    label: 'Google Pixel',
    devices: [
      { id: 'px10', label: 'Pixel 10', series: 'pixel10' },
      { id: 'px10pro', label: 'Pixel 10 Pro', series: 'pixel10' },
      { id: 'px10proxl', label: 'Pixel 10 Pro XL', series: 'pixel10' },
    ],
  },
  {
    label: 'AirPods',
    devices: [
      { id: 'ap4', label: 'AirPods 4', series: 'airpods4' },
      { id: 'appro2', label: 'AirPods Pro 2', series: 'airpodspro2' },
      { id: 'appro3', label: 'AirPods Pro 3', series: 'airpodspro3' },
    ],
  },
  {
    label: 'Other',
    devices: [{ id: 'other', label: 'Something else', series: 'other' }],
  },
];

export const ALL_DEVICES: Device[] = DEVICE_GROUPS.flatMap((g) => g.devices);

export function deviceById(id: string | undefined | null): Device | null {
  if (!id) return null;
  return ALL_DEVICES.find((d) => d.id === id) ?? null;
}

const FAMILIES = [
  'basic-brown',
  'blissful-blue',
  'blushing-coral',
  'frosty-white',
  'go-green',
  'mellow-yellow',
  'playful-pink',
  'roaring-red',
  'stormy-grey',
  'vivid-violet',
] as const;

type FamilySlug = (typeof FAMILIES)[number];

const map = (fn: (f: FamilySlug) => string): Record<string, string> =>
  Object.fromEntries(FAMILIES.map((f) => [f, fn(f)]));

const HANDLES: Record<SeriesKey, Record<string, string> | null> = {
  iphone17: map((f) => `${f}-case-iphone-17-series`),
  iphone16: {
    ...map((f) => `${f}-case-iphone-16-series`),
    'blissful-blue': 'blissful-blue-iphone-16-series',
    'mellow-yellow': 'mellow-yellow-iphone-16-series',
    'roaring-red': 'roaring-red-iphone-16-series',
    'vivid-violet': 'vivid-violet-iphone-16-series',
  },
  iphone15: map((f) => `${f}-case-iphone-15-series`),
  s26: map((f) => `${f}-case-samsung-galaxy-s26-series`),
  s25: {
    ...map((f) => `${f}-case-samsung-galaxy-s24-series-copy`),
    'blissful-blue': 'blissful-blue-case-samsung-galaxy-s25-series',
    'playful-pink': 'playful-pink-case-samsung-galaxy-s25-series',
    'vivid-violet': 'vivid-violet-case-samsung-galaxy-s25-series',
  },
  pixel10: map((f) => `${f}-case-google-pixel-10-series`),
  airpods4: map((f) => `${f}-airpods-4-case`),
  airpodspro2: map((f) => `${f}-airpods-pro-2-case`),
  airpodspro3: map((f) => `${f}-airpods-pro-3-case`),
  other: null,
};

export const STORE = 'https://www.skreed.com/en-in';

/** The en-in product handle for a family on a device series, or null when the store has no such page (unknown series, "other"). */
export function handleFor(familySlug: string, series: SeriesKey): string | null {
  return HANDLES[series]?.[familySlug] ?? null;
}

/**
 * Normalise a model label so the quiz's device labels ("Galaxy S25+") compare equal to the
 * storefront's Model option values ("Samsung Galaxy S25+", "Samsung Galaxy S26 Plus").
 * Lowercase, drop the brand words samsung, google and apple, spell "+" as " plus", collapse whitespace.
 */
export function normalizeModel(label: string): string {
  return label
    .toLowerCase()
    .replace(/\+/g, ' plus')
    .replace(/\b(samsung|google|apple)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function shopUrl(familySlug: string, familyName: string, series: SeriesKey | undefined): string {
  const handle = series ? handleFor(familySlug, series) : null;
  if (handle) return `${STORE}/products/${handle}`;
  return `${STORE}/search?q=${encodeURIComponent(familyName)}`;
}
