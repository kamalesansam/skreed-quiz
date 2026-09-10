# The Shade Diagnosis: experience concept

Skreed India launch quiz. "There are 240 personalities. Which one are you?"

## Design read

An interactive launch quiz for colour-first Indian consumers (Prism Gen 17 to 25, Pigment Pros 26 to 34, Patina 35+), built as a playful-premium lab report on the brand's own materials: paper, ink, and the 240 shades. Type is Poppins Bold for headlines and Inter for everything else, per the brand guidelines. Only the Classics (solid) families appear. No prints.

Dials: design variance 7, motion 8, visual density 3.

## The idea in one line

Your answers are pigment. The quiz collects them in a vial, the lab reads the mix, and the interface slowly takes on your colour before it tells you who you are.

## Three acts, three grounds

| Act | Ground | What happens |
|---|---|---|
| 1. Intake | Paper (#F7F6F3) | Landing. A lab bench of 240 pigment beads you can push around, the real Skreed case spinning through the spectrum as you scroll, and the 10 diagnoses locked behind a horizontal strip. |
| 2. The test | Paper, tinting toward your leading shade | 12 samples. Each answer drops a bead of that outcome's colour into a vial on the side. The buttons, focus rings and the little case in the header drift toward whichever colour is winning. |
| 3. Read-out | Ink (#171717), then your shade | The terminal read-out on ink while the beads converge, then the full-bleed result in your shade with the real case rendered in it. |

The theme switch from paper to ink to colour is the one deliberate colour-block moment. Everything else stays on one ground.

## Signature moments

1. **Preloader.** A counter runs 0 to 100 while a strip of all 240 shades fills left to right. Nothing generic. It also gives the case model time to load.
2. **The bench (hero).** Ballpit physics, 240 shades, the cursor is a bead that shoves the others. Touch works too. Headline set in Poppins on paper, left aligned, case entering from the right.
3. **Scroll the spectrum.** A pinned section where the actual Skreed case (the GLB from the product team, meshopt-compressed to 574 KB) rotates a full turn and its shell sweeps through 40 shades as you scroll. A live read-out names the shade under your thumb. Three text beats: 10 families, 24 shades each, 240 personalities.
4. **The locked strip.** The 10 diagnoses scroll horizontally as you scroll down. Each card shows only its bead and a masked name. Taking the test unlocks yours.
5. **The vial.** The progress bar is a glass vial. Each answer is a bead that drops in with a spring and settles as a stripe. By question 12 you are looking at your own pigment stack. It reappears on the result card and in the share image.
6. **3D illustrated answers.** Visual questions use small three-dimensional illustrations (glossy shade beads, a cake with candles, a bonfire, a hammock sun) rendered live in a single WebGL context and tinted with the option's palette. Hover spins them, press squashes them, and the pick bursts into particles of that colour.
7. **The read-out.** Terminal lines on ink: "Analysing response", "Cross-checking personality profile", "Matching behavioural traits", "Comparing against 240 shade profiles", "Diagnosis complete." The bead field collapses to one point and blooms in your shade.
8. **The report.** Personality profile, colour profile, recommended shade with its hex, finish, confidence score (counting up), rarity, and five compatible shades as draggable beads with momentum. The real case, in your shade, rotates as you scroll the report. One CTA: shop the case for the device you told us.
9. **Sharing.** WhatsApp, Instagram Story (a 1080 x 1920 card generated on the spot), Facebook, LinkedIn, copy link. Shared links open a server-rendered result page with its own preview image, so the card shows up in chats.
10. **Sound, opt in.** Soft ticks on selection and the brand's own "Go Beyond Basic" chime on the reveal. Off by default.

## States we design for

Empty (fresh start), loading (preloader, lazy 3D, skeleton on the share image), error (boundary with restart), no internet (banner; the quiz works offline, only shop and share need the network), slow network (fonts self-hosted, 3D loads after the page), permission denied (share and clipboard fall back to download and long-press), session expired (progress saved for 24 hours, then a clean start), form validation (inline, under the field), success (the reveal). Reduced motion and no-WebGL both get a flat, still version of every screen.

## Stack decision (ADR-1)

**Status:** accepted, 10 September 2026.

**Context.** The quiz has to feel like a premium animated site, run well on mid-range Android phones, ship to Vercel, and be maintainable by the team afterwards. Sam's reference points were Skiper UI, React Bits, ThreeUI, Animaster and a set of award-style portfolio sites.

**Options.** (A) Single HTML file with GSAP: fastest, no build, but every 3D or share feature becomes hand-rolled and the component libraries suggested are React. (B) Next.js with TypeScript, Tailwind v4, Motion, React Three Fiber, GSAP: the libraries suggested plug straight in, server-rendered share pages are trivial, deploys to Vercel with zero config. (C) Vite plus React: same libraries, but no server routes for share previews.

**Decision.** B. TypeScript rather than plain JavaScript because every library here ships types and the compiler catches the mistakes that break animation code silently. Plain .js files still work in the same project.

**Consequences.** One WebGL context for all 3D tiles through drei's View, a second for the background field, never more than two at once. React Bits components live in src/components as owned code. Motion for UI physics, GSAP only inside the React Bits text components, Three.js only inside src/components/three.

## Assets that would make it better (from Sam)

Everything runs today without these. Each one is a drop-in.

1. Product renders of the 10 recommended shades on an iPhone 17 Pro Max (Sunflower, Classic Red, Clementine, Porcelain, Cinnamon, Bubblegum, Amethyst, Navy Blue, Sage, Graphite), transparent PNG, about 1600 px tall. Used on the result and the share card next to the 3D case.
2. A logomark PNG at 1024 px, white and black, for the Open Graph image (the SVG is in place, so this is optional).
3. Confirmation of the two finishes. The PDF lists "Satin" for the Warm Optimist and the Dreamer; the store sells Gloss and Matte, so the build uses Gloss and Matte.
4. Confirmation of the Calm Strategist family. The PDF says Playful Pink; Navy Blue is Blissful Blue, so the build uses Blissful Blue.
5. The final launch URL (for share links and the preview image) and a GTM or GA4 container id.
6. Optional: the texture packs Sam linked (grit, light leaks, scribbles, VHS) as PNGs in public/textures. The film-grain overlay uses a procedural noise until then.
7. Optional: 3D illustration renders from Morflax, Endless Tools, Craftwork or Creatoom for any option tile. Each option in src/data/quiz.ts accepts an image path and will show it instead of the live 3D glyph.
