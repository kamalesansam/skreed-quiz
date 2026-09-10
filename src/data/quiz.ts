/**
 * The Shade Diagnosis. Content from "Skreed Shade Diagnosis Quiz.pdf" (launch campaign India).
 * 12 questions, 10 options each, one option per outcome. Most-picked outcome wins; Q1 breaks ties.
 */

export type OutcomeId =
  | 'spark'
  | 'main'
  | 'warm'
  | 'curator'
  | 'wanderer'
  | 'rebel'
  | 'dreamer'
  | 'strategist'
  | 'architect'
  | 'icon';

export type Finish = 'Gloss' | 'Matte';

export type Outcome = {
  id: OutcomeId;
  name: string;
  tagline: string;
  family: string;
  familySlug: string;
  shade: string;
  hex: string;
  finish: Finish;
  confidence: number;
  rarity: number;
  personality: string;
  colour: string;
  compatible: string[];
};

export const OUTCOMES: Record<OutcomeId, Outcome> = {
  spark: {
    id: 'spark',
    name: 'The Spark',
    tagline: 'Main energy, no permission needed.',
    family: 'Mellow Yellow',
    familySlug: 'mellow-yellow',
    shade: 'Sunflower',
    hex: '#F4D41D',
    finish: 'Gloss',
    confidence: 91,
    rarity: 9,
    personality:
      "You're the reason the group chat is active at 11pm. Rooms feel different when you walk in. Brighter, faster, more fun. You don't wait for permission to be the main energy.",
    colour: 'High-voltage brights with just enough warmth to keep them from feeling harsh.',
    compatible: ['Classic Red', 'Watermelon', 'Lime', 'Sky Blue', 'Bronze'],
  },
  main: {
    id: 'main',
    name: 'The Main Character',
    tagline: 'Attention just tends to arrive.',
    family: 'Roaring Red',
    familySlug: 'roaring-red',
    shade: 'Classic Red',
    hex: '#EF1123',
    finish: 'Gloss',
    confidence: 97,
    rarity: 6,
    personality:
      "You don't chase attention. It just tends to arrive. Bold decisions, strong opinions, zero interest in blending in. Every story you tell somehow becomes the best one in the room.",
    colour: 'Rich, saturated, and completely unapologetic.',
    compatible: ['Golden', 'Fuchsia', 'Charcoal', 'Midnight Blue', 'Wine'],
  },
  warm: {
    id: 'warm',
    name: 'The Warm Optimist',
    tagline: 'Golden hour, all year round.',
    family: 'Blushing Coral',
    familySlug: 'blushing-coral',
    shade: 'Clementine',
    hex: '#F78628',
    finish: 'Gloss',
    confidence: 93,
    rarity: 13,
    personality:
      "You're the friend people call with good news first. Warm without trying, welcoming without performing it. You make people feel like they've known you longer than they have.",
    colour: 'Sun-warmed tones that feel like golden hour, all year round.',
    compatible: ['Buttercup', 'Blush', 'Sand', 'Cream', 'Sky Blue'],
  },
  curator: {
    id: 'curator',
    name: 'The Quiet Curator',
    tagline: 'Nothing stays unless it earns its place.',
    family: 'Frosty White',
    familySlug: 'frosty-white',
    shade: 'Porcelain',
    hex: '#EFF1F0',
    finish: 'Matte',
    confidence: 94,
    rarity: 11,
    personality:
      "You edit your life the way you'd edit a gallery. Nothing stays unless it earns its place. You're drawn to things that feel considered rather than loud, and people read your restraint as confidence, not shyness.",
    colour: "Soft, warm neutrals with quiet depth. Your palette doesn't shout. It doesn't need to.",
    compatible: ['Sage', 'Stone Blue', 'Taupe', 'Cool Grey', 'Pastel Violet'],
  },
  wanderer: {
    id: 'wanderer',
    name: 'The Grounded Wanderer',
    tagline: 'Experience over show.',
    family: 'Basic Brown',
    familySlug: 'basic-brown',
    shade: 'Cinnamon',
    hex: '#BA7237',
    finish: 'Matte',
    confidence: 90,
    rarity: 15,
    personality:
      "Steady, dependable, and quietly adventurous. You're the one people trust to figure it out, whether that's a group trip or a group crisis. You value experience over show.",
    colour: 'Earthy, textured tones that feel lived-in and real.',
    compatible: ['Sage', 'Stone Blue', 'Terracotta', 'Oatmeal', 'Mauve'],
  },
  rebel: {
    id: 'rebel',
    name: 'The Romantic Rebel',
    tagline: 'Feeling first, no regrets.',
    family: 'Playful Pink',
    familySlug: 'playful-pink',
    shade: 'Bubblegum',
    hex: '#F086C6',
    finish: 'Gloss',
    confidence: 89,
    rarity: 14,
    personality:
      "Soft on the outside, stubborn underneath. You lead with feeling, not logic, and you've never once regretted it. Sentimental about the little things, allergic to anything that feels forced.",
    colour: 'Playful, expressive brights with an unmistakably soft edge.',
    compatible: ['Lavender', 'Aqua', 'Neon Yellow', 'Mint', 'Silver'],
  },
  dreamer: {
    id: 'dreamer',
    name: 'The Dreamer',
    tagline: 'Half here, half somewhere more interesting.',
    family: 'Vivid Violet',
    familySlug: 'vivid-violet',
    shade: 'Amethyst',
    hex: '#8554D1',
    finish: 'Matte',
    confidence: 92,
    rarity: 10,
    personality:
      "Half in this world, half somewhere more interesting. You notice things other people miss and you're always a little bit mid-thought. Deeply creative, gently mysterious.",
    colour: 'Rich, imaginative tones that shift depending on the light.',
    compatible: ['Turquoise', 'Blush', 'Mist', 'Sage', 'Pale Yellow'],
  },
  strategist: {
    id: 'strategist',
    name: 'The Calm Strategist',
    tagline: 'Three steps ahead, quietly.',
    family: 'Blissful Blue',
    familySlug: 'blissful-blue',
    shade: 'Navy Blue',
    hex: '#0E305B',
    finish: 'Matte',
    confidence: 95,
    rarity: 5,
    personality:
      "You're the one everyone looks at when things go sideways, because you don't. Composed under pressure, three steps ahead, quietly running the show without needing credit for it.",
    colour: 'Cool, clear tones that feel controlled without feeling cold.',
    compatible: ['Stone', 'Sand', 'Olive', 'Ivory', 'Terracotta'],
  },
  architect: {
    id: 'architect',
    name: 'The Quiet Architect',
    tagline: 'Timeless over trendy.',
    family: 'Go Green',
    familySlug: 'go-green',
    shade: 'Sage',
    hex: '#96A880',
    finish: 'Matte',
    confidence: 96,
    rarity: 8,
    personality:
      "Thoughtful, observant, and quietly confident. You don't chase attention. Your style is intentional, and you're drawn to things that feel timeless rather than trendy. You have a calming presence.",
    colour: 'Grounded, muted tones with understated sophistication. Balanced, modern, quietly distinctive.',
    compatible: ['Stone Blue', 'Clay', 'Taupe', 'Dove Grey', 'Pastel Violet'],
  },
  icon: {
    id: 'icon',
    name: 'The Understated Icon',
    tagline: 'Memorable without the noise.',
    family: 'Stormy Grey',
    familySlug: 'stormy-grey',
    shade: 'Graphite',
    hex: '#424548',
    finish: 'Matte',
    confidence: 93,
    rarity: 10,
    personality:
      "You've never needed to be loud to be memorable. Effortlessly composed, quietly self-assured. You're proof that confidence doesn't require noise. People notice you precisely because you're not trying to be noticed.",
    colour: 'Deep, quiet neutrals with a precise edge. Nothing extra, nothing missing.',
    compatible: ['Ivory', 'Navy Blue', 'Wine', 'Rust', 'Forest'],
  },
};

export const OUTCOME_LIST: Outcome[] = [
  OUTCOMES.spark,
  OUTCOMES.main,
  OUTCOMES.warm,
  OUTCOMES.curator,
  OUTCOMES.wanderer,
  OUTCOMES.rebel,
  OUTCOMES.dreamer,
  OUTCOMES.strategist,
  OUTCOMES.architect,
  OUTCOMES.icon,
];

export const OUTCOME_SLUGS = OUTCOME_LIST.map((o) => o.id);

export function outcomeBySlug(slug: string | undefined): Outcome | null {
  if (!slug) return null;
  return (OUTCOMES as Record<string, Outcome>)[slug] ?? null;
}

export type GlyphId =
  | 'bead'
  | 'beads'
  | 'stage'
  | 'frame'
  | 'sun'
  | 'flame'
  | 'mountain'
  | 'car'
  | 'book'
  | 'flower'
  | 'cup'
  | 'rain'
  | 'pillars'
  | 'star'
  | 'heart'
  | 'cake'
  | 'blob'
  | 'ring'
  | 'cube'
  | 'wave'
  | 'lamp'
  | 'plant';

export type CakeDeco =
  | 'candles'
  | 'plain'
  | 'sprinkles'
  | 'drizzle'
  | 'nuts'
  | 'ombre'
  | 'flowers'
  | 'berries'
  | 'matcha';

export type WallpaperStyle =
  | 'graphic'
  | 'gradient'
  | 'chaos'
  | 'sunset'
  | 'nature'
  | 'hearts'
  | 'abstract'
  | 'line'
  | 'botanical'
  | 'clock';

export type Option = {
  id: string;
  label: string;
  outcome: OutcomeId;
  /** 3D illustration id (visual questions) */
  glyph?: GlyphId;
  /** three colours used by the 3D illustration and tile tint */
  palette?: string[];
  /** cake decoration for the cake glyph */
  deco?: CakeDeco;
  /** 2D wallpaper art for the wallpaper question */
  wallpaper?: WallpaperStyle;
  /** shade name for the swatch question */
  shade?: string;
  /** optional pre-rendered illustration (drop a PNG in /public/illustrations and reference it here) */
  image?: string;
};

export type Question = {
  id: string;
  prompt: string;
  kind: 'visual' | 'text';
  options: Option[];
};

const o = (
  id: string,
  outcome: OutcomeId,
  label: string,
  extra: Partial<Option> = {},
): Option => ({ id, outcome, label, ...extra });

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    kind: 'visual',
    prompt: 'Which shade calls to you first?',
    options: [
      o('q1-spark', 'spark', 'Sunflower', { glyph: 'bead', shade: 'Sunflower', palette: ['#F4D41D', '#FFF164', '#F7BC34'] }),
      o('q1-main', 'main', 'Classic Red', { glyph: 'bead', shade: 'Classic Red', palette: ['#EF1123', '#F3342E', '#AB091B'] }),
      o('q1-warm', 'warm', 'Clementine', { glyph: 'bead', shade: 'Clementine', palette: ['#F78628', '#FF9F40', '#E67300'] }),
      o('q1-curator', 'curator', 'Porcelain', { glyph: 'bead', shade: 'Porcelain', palette: ['#EFF1F0', '#F7F7F7', '#B3BAB0'] }),
      o('q1-wanderer', 'wanderer', 'Cinnamon', { glyph: 'bead', shade: 'Cinnamon', palette: ['#BA7237', '#D08647', '#7F5229'] }),
      o('q1-rebel', 'rebel', 'Bubblegum', { glyph: 'bead', shade: 'Bubblegum', palette: ['#F086C6', '#FFACD0', '#E64C95'] }),
      o('q1-dreamer', 'dreamer', 'Amethyst', { glyph: 'bead', shade: 'Amethyst', palette: ['#8554D1', '#B944EA', '#492376'] }),
      o('q1-strategist', 'strategist', 'Navy Blue', { glyph: 'bead', shade: 'Navy Blue', palette: ['#0E305B', '#074882', '#0E1442'] }),
      o('q1-architect', 'architect', 'Sage', { glyph: 'bead', shade: 'Sage', palette: ['#96A880', '#BAEAA0', '#717D67'] }),
      o('q1-icon', 'icon', 'Graphite', { glyph: 'bead', shade: 'Graphite', palette: ['#424548', '#686B6F', '#393F44'] }),
    ],
  },
  {
    id: 'q2',
    kind: 'text',
    prompt: 'Which compliment would make you happiest?',
    options: [
      o('q2-main', 'main', '"You\'re unforgettable."'),
      o('q2-curator', 'curator', '"You have effortless, quiet taste."'),
      o('q2-spark', 'spark', '"You make every room brighter."'),
      o('q2-warm', 'warm', '"You make everyone feel instantly at ease."'),
      o('q2-wanderer', 'wanderer', '"People always count on you."'),
      o('q2-rebel', 'rebel', '"You wear your heart on your sleeve."'),
      o('q2-dreamer', 'dreamer', '"You\'re incredibly creative."'),
      o('q2-architect', 'architect', '"You feel effortlessly authentic."'),
      o('q2-strategist', 'strategist', '"You always stay calm under pressure."'),
      o('q2-icon', 'icon', '"You don\'t care what anyone thinks."'),
    ],
  },
  {
    id: 'q3',
    kind: 'visual',
    prompt: 'Pick your ideal Sunday.',
    options: [
      o('q3-main', 'main', 'Front row at a concert, lights blazing', { glyph: 'stage', palette: ['#EF1123', '#0E1442', '#F7BC34'] }),
      o('q3-curator', 'curator', 'A minimalist museum, alone with the art', { glyph: 'frame', palette: ['#EFF1F0', '#B3BAB0', '#54524D'] }),
      o('q3-spark', 'spark', 'A rooftop party that starts at noon', { glyph: 'sun', palette: ['#F4D41D', '#08BCF4', '#FF7C22'] }),
      o('q3-warm', 'warm', 'A beach bonfire with your whole friend group', { glyph: 'flame', palette: ['#F78628', '#FFBCAC', '#0E305B'] }),
      o('q3-wanderer', 'wanderer', 'A long hike with zero phone signal', { glyph: 'mountain', palette: ['#BA7237', '#96A880', '#E2D6C6'] }),
      o('q3-rebel', 'rebel', 'A spontaneous road trip, no destination', { glyph: 'car', palette: ['#F086C6', '#04DCF7', '#D6F430'] }),
      o('q3-dreamer', 'dreamer', 'Getting lost in a bookstore for hours', { glyph: 'book', palette: ['#8554D1', '#572048', '#F4B6BB'] }),
      o('q3-architect', 'architect', 'A slow walk through a botanical garden', { glyph: 'flower', palette: ['#96A880', '#DFA4F8', '#C17956'] }),
      o('q3-strategist', 'strategist', 'A quiet morning, coffee, and a plan', { glyph: 'cup', palette: ['#0E305B', '#E1C39F', '#F7F6E4'] }),
      o('q3-icon', 'icon', 'A rainy day, a good playlist, total silence', { glyph: 'rain', palette: ['#424548', '#767B89', '#ACACAC'] }),
    ],
  },
  {
    id: 'q4',
    kind: 'text',
    prompt: "What's your comfort drink?",
    options: [
      o('q4-main', 'main', 'Espresso, straight up'),
      o('q4-curator', 'curator', 'Oat milk latte, no sugar'),
      o('q4-spark', 'spark', 'Fresh lemonade'),
      o('q4-warm', 'warm', 'Masala chai, extra ginger'),
      o('q4-wanderer', 'wanderer', 'Filter coffee, no sugar'),
      o('q4-rebel', 'rebel', 'Strawberry milkshake'),
      o('q4-dreamer', 'dreamer', 'Butterfly pea tea (the one that changes colour)'),
      o('q4-architect', 'architect', 'Matcha latte'),
      o('q4-strategist', 'strategist', 'Iced lemon water'),
      o('q4-icon', 'icon', 'Black coffee'),
    ],
  },
  {
    id: 'q5',
    kind: 'visual',
    prompt: 'Which aesthetic feels like you?',
    options: [
      o('q5-main', 'main', 'Old Hollywood glam', { glyph: 'star', palette: ['#EF1123', '#F7BC34', '#171717'] }),
      o('q5-curator', 'curator', 'Quiet luxury', { glyph: 'pillars', palette: ['#E8D2BD', '#F3F2ED', '#896950'] }),
      o('q5-spark', 'spark', 'Dopamine decor', { glyph: 'beads', palette: ['#F4D41D', '#FE0094', '#26FF00'] }),
      o('q5-warm', 'warm', 'Coastal grandma', { glyph: 'wave', palette: ['#F78628', '#9ADEEE', '#F0E8DB'] }),
      o('q5-wanderer', 'wanderer', 'Y2K', { glyph: 'ring', palette: ['#C6A884', '#ACACAC', '#FF5FFF'] }),
      o('q5-rebel', 'rebel', 'Cottagecore', { glyph: 'flower', palette: ['#F086C6', '#96A880', '#F3F2ED'] }),
      o('q5-dreamer', 'dreamer', 'Dark academia', { glyph: 'book', palette: ['#4A154D', '#59402C', '#8554D1'] }),
      o('q5-architect', 'architect', 'Scandi minimalism', { glyph: 'pillars', palette: ['#EFF1F0', '#C3A082', '#96A880'] }),
      o('q5-strategist', 'strategist', 'Clean girl', { glyph: 'blob', palette: ['#F4B6BB', '#F7F6E4', '#0E305B'] }),
      o('q5-icon', 'icon', 'Monochrome minimalism', { glyph: 'cube', palette: ['#424548', '#F7F7F7', '#171717'] }),
    ],
  },
  {
    id: 'q6',
    kind: 'visual',
    prompt: 'Pick your dream trip.',
    options: [
      o('q6-main', 'main', 'Vegas, lights on all night', { glyph: 'star', palette: ['#EF1123', '#F7BC34', '#0E1442'] }),
      o('q6-curator', 'curator', 'A boutique hotel, off the guidebook', { glyph: 'lamp', palette: ['#EFF1F0', '#896950', '#E8D2BD'] }),
      o('q6-spark', 'spark', 'Rio, during Carnival', { glyph: 'beads', palette: ['#F4D41D', '#26FF00', '#FE0094'] }),
      o('q6-warm', 'warm', 'A hammock in Bali, no plans', { glyph: 'sun', palette: ['#F78628', '#6BE5B4', '#E1C39F'] }),
      o('q6-wanderer', 'wanderer', 'A cabin in the Himalayas', { glyph: 'mountain', palette: ['#BA7237', '#EAEFF3', '#084F3D'] }),
      o('q6-rebel', 'rebel', 'Paris', { glyph: 'heart', palette: ['#F086C6', '#F3F2ED', '#424548'] }),
      o('q6-dreamer', 'dreamer', 'Santorini at sunset', { glyph: 'sun', palette: ['#8554D1', '#F78628', '#EFF1F0'] }),
      o('q6-strategist', 'strategist', 'A quiet lake in Switzerland', { glyph: 'wave', palette: ['#0E305B', '#9ADEEE', '#EAEFF3'] }),
      o('q6-architect', 'architect', 'A vineyard in Tuscany', { glyph: 'beads', palette: ['#96A880', '#572048', '#E1C39F'] }),
      o('q6-icon', 'icon', 'Reykjavik, off-season', { glyph: 'mountain', palette: ['#424548', '#EAEFF3', '#608592'] }),
    ],
  },
  {
    id: 'q7',
    kind: 'text',
    prompt: 'Your friends would call you the one who...',
    options: [
      o('q7-main', 'main', 'Makes every plan actually happen'),
      o('q7-curator', 'curator', 'Has impeccable, effortless taste'),
      o('q7-spark', 'spark', 'Is always up for anything, any time'),
      o('q7-warm', 'warm', 'Checks in on everyone, always'),
      o('q7-wanderer', 'wanderer', 'Never once flakes'),
      o('q7-rebel', 'rebel', 'Feels everything, loudly and honestly'),
      o('q7-dreamer', 'dreamer', 'Is always three ideas ahead of everyone else'),
      o('q7-strategist', 'strategist', 'Has a plan for the backup plan'),
      o('q7-architect', 'architect', 'Somehow makes everything look intentional'),
      o('q7-icon', 'icon', 'Says less, but means more'),
    ],
  },
  {
    id: 'q8',
    kind: 'visual',
    prompt: 'Pick your ideal desk setup.',
    options: [
      o('q8-main', 'main', 'A bold statement piece, front and centre', { glyph: 'cube', palette: ['#EF1123', '#171717', '#F7BC34'] }),
      o('q8-curator', 'curator', 'Clean surface, one plant, nothing extra', { glyph: 'plant', palette: ['#EFF1F0', '#96A880', '#C3A082'] }),
      o('q8-spark', 'spark', 'String lights and stickers, everywhere', { glyph: 'beads', palette: ['#F4D41D', '#04DCF7', '#FE0094'] }),
      o('q8-warm', 'warm', 'Photos of everyone you love', { glyph: 'frame', palette: ['#F78628', '#F0E8DB', '#C17956'] }),
      o('q8-wanderer', 'wanderer', "A well-worn notebook, a plant that's survived years", { glyph: 'book', palette: ['#BA7237', '#96A880', '#E2D6C6'] }),
      o('q8-rebel', 'rebel', 'Pink everything, no exceptions', { glyph: 'heart', palette: ['#F086C6', '#FFD2E9', '#FF5FFF'] }),
      o('q8-dreamer', 'dreamer', 'Fairy lights, half-finished sketches', { glyph: 'ring', palette: ['#8554D1', '#F4D41D', '#F5E3FB'] }),
      o('q8-strategist', 'strategist', 'Colour-coded planner, zero clutter', { glyph: 'pillars', palette: ['#0E305B', '#08BCF4', '#F4D41D'] }),
      o('q8-architect', 'architect', 'Wood, linen, one perfect lamp', { glyph: 'lamp', palette: ['#96A880', '#C3A082', '#EFE6D5'] }),
      o('q8-icon', 'icon', 'Matte black, everything', { glyph: 'cube', palette: ['#424548', '#171717', '#5E5D61'] }),
    ],
  },
  {
    id: 'q9',
    kind: 'text',
    prompt: 'Pick a movie night.',
    options: [
      o('q9-main', 'main', 'Big blockbuster, opening night'),
      o('q9-curator', 'curator', "An arthouse film nobody's heard of yet"),
      o('q9-spark', 'spark', 'A rom-com with your loudest friends'),
      o('q9-warm', 'warm', "A feel-good favourite you've seen ten times"),
      o('q9-wanderer', 'wanderer', 'A slow, beautiful documentary'),
      o('q9-rebel', 'rebel', 'Anything that makes you cry, honestly'),
      o('q9-dreamer', 'dreamer', "Something surreal you'll be thinking about for days"),
      o('q9-strategist', 'strategist', 'A tightly plotted thriller'),
      o('q9-architect', 'architect', 'A quiet indie film, barely any dialogue'),
      o('q9-icon', 'icon', "You didn't pick. You just showed up"),
    ],
  },
  {
    id: 'q10',
    kind: 'visual',
    prompt: 'Which phone wallpaper feels like you?',
    options: [
      o('q10-main', 'main', 'Bold, graphic pattern', { wallpaper: 'graphic', palette: ['#EF1123', '#171717', '#F7F6F3'] }),
      o('q10-curator', 'curator', 'A soft, single-tone gradient', { wallpaper: 'gradient', palette: ['#EFF1F0', '#B3BAB0', '#F7F7F7'] }),
      o('q10-spark', 'spark', 'Bright and a little chaotic', { wallpaper: 'chaos', palette: ['#F4D41D', '#FE0094', '#04DCF7', '#26FF00'] }),
      o('q10-warm', 'warm', 'A warm sunset photo', { wallpaper: 'sunset', palette: ['#F78628', '#F086C6', '#8554D1'] }),
      o('q10-wanderer', 'wanderer', 'A nature shot, completely unedited', { wallpaper: 'nature', palette: ['#96A880', '#BA7237', '#08BCF4'] }),
      o('q10-rebel', 'rebel', 'Hearts. Obviously', { wallpaper: 'hearts', palette: ['#F086C6', '#FFD2E9', '#FE0094'] }),
      o('q10-dreamer', 'dreamer', 'Abstract art you found at 2am', { wallpaper: 'abstract', palette: ['#8554D1', '#00E8D9', '#F4D41D'] }),
      o('q10-strategist', 'strategist', 'A minimal line drawing', { wallpaper: 'line', palette: ['#0E305B', '#F7F6E4', '#08BCF4'] }),
      o('q10-architect', 'architect', 'A muted botanical print', { wallpaper: 'botanical', palette: ['#96A880', '#E2D6C6', '#717D67'] }),
      o('q10-icon', 'icon', 'Just the lock screen clock. Nothing else', { wallpaper: 'clock', palette: ['#424548', '#F7F7F7', '#686B6F'] }),
    ],
  },
  {
    id: 'q11',
    kind: 'visual',
    prompt: 'Pick a birthday cake.',
    options: [
      o('q11-main', 'main', 'Red velvet, extra tall, candles blazing', { glyph: 'cake', deco: 'candles', palette: ['#AB091B', '#F7F7EF', '#F7BC34'] }),
      o('q11-curator', 'curator', 'A single-tier vanilla, unfrosted, perfect', { glyph: 'cake', deco: 'plain', palette: ['#F7F7EF', '#E8D2BD', '#EFF1F0'] }),
      o('q11-spark', 'spark', 'Rainbow sprinkle explosion', { glyph: 'cake', deco: 'sprinkles', palette: ['#F4D41D', '#FE0094', '#04DCF7'] }),
      o('q11-warm', 'warm', 'Warm caramel drizzle, everyone gets a slice first', { glyph: 'cake', deco: 'drizzle', palette: ['#F78628', '#BA7237', '#F7F6E4'] }),
      o('q11-wanderer', 'wanderer', 'Classic carrot cake, homemade', { glyph: 'cake', deco: 'nuts', palette: ['#C88737', '#F3F2ED', '#F78628'] }),
      o('q11-rebel', 'rebel', 'Pink ombre, way too much frosting', { glyph: 'cake', deco: 'ombre', palette: ['#F086C6', '#FFD2E9', '#FE0094'] }),
      o('q11-dreamer', 'dreamer', "Something with edible flowers nobody's tried before", { glyph: 'cake', deco: 'flowers', palette: ['#8554D1', '#DFA4F8', '#F4B6BB'] }),
      o('q11-strategist', 'strategist', 'A neat, minimalist blueberry cheesecake', { glyph: 'cake', deco: 'berries', palette: ['#F7F6E4', '#1D1968', '#E1C39F'] }),
      o('q11-architect', 'architect', 'Matcha layer cake, understated', { glyph: 'cake', deco: 'matcha', palette: ['#96A880', '#F3F2ED', '#476D3E'] }),
      o('q11-icon', 'icon', 'You skipped cake, went for coffee', { glyph: 'cup', palette: ['#424548', '#F7F6E4', '#7A583F'] }),
    ],
  },
  {
    id: 'q12',
    kind: 'text',
    prompt: "What's your karaoke energy?",
    options: [
      o('q12-main', 'main', 'A power ballad, mic drop ending'),
      o('q12-curator', 'curator', "You don't really do karaoke, but if pressed, something timeless"),
      o('q12-spark', 'spark', 'Anything the whole room can scream-sing together'),
      o('q12-warm', 'warm', 'A feel-good throwback everyone loves'),
      o('q12-wanderer', 'wanderer', 'An old classic nobody expects you to know all the words to'),
      o('q12-rebel', 'rebel', 'A heartbreak anthem, fully committed'),
      o('q12-dreamer', 'dreamer', 'Something obscure that somehow makes everyone stop and listen'),
      o('q12-strategist', 'strategist', 'You picked the song in advance and rehearsed it once'),
      o('q12-architect', 'architect', 'You sing backup, perfectly, and let someone else have the spotlight'),
      o('q12-icon', 'icon', "You didn't sign up, but you'll clap for everyone"),
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export const GENS = [
  { id: 'prism', name: 'Prism Gen', range: '17 to 25' },
  { id: 'pigment', name: 'Pigment Pros', range: '26 to 34' },
  { id: 'patina', name: 'Patina', range: '35 and up' },
] as const;

export type GenId = (typeof GENS)[number]['id'];

export const COPY = {
  eyebrow: 'Skreed India launch',
  title: 'There are 240 personalities. Which one are you?',
  intro:
    'Everyone thinks they know their favourite colour. Almost nobody knows the colour that actually fits them.',
  instructions:
    "Answer instinctively. Don't overthink it. Your first choice is usually the correct one. Takes under 5 minutes.",
  cta: 'Start the diagnosis',
  analysing: [
    'Analysing response',
    'Cross-checking personality profile',
    'Matching behavioural traits',
    'Comparing against 240 shade profiles',
    'Diagnosis complete',
  ],
  closing: 'There are 240 personalities. This is yours.',
  shop: 'Your signature shade is waiting. Shop the case that matches your diagnosis.',
};
