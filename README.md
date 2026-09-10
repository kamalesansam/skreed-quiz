# The Shade Diagnosis

Skreed India launch quiz. "There are 240 personalities. Which one are you?"

Next.js 16, TypeScript, Tailwind v4, Motion, React Three Fiber. Deploys to Vercel with no configuration.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` before deploying so share links and preview images point at the live domain.

## Where things live

| Path | What |
|---|---|
| `src/data/quiz.ts` | Every question, option, outcome and line of copy. Edit content here. |
| `src/data/devices.ts` | Device list and the verified skreed.com en-in product handles per family. |
| `src/data/shades.json` | All 240 shades with hex values, from the CMYK sheet. |
| `src/components/quiz/` | The screens: Preloader, Landing, ProfileStep, QuestionStep, Analyzing, ResultView, ShareBar. |
| `src/components/three/` | Everything WebGL: the case model, the 3D option illustrations, the bead field. |
| `src/components/ui/` | Logo masks, buttons, toasts, offline banner, burst layer. |
| `src/components/` (root) | React Bits components owned as code: Ballpit, BlurText, SplitText, CountUp, ShinyText. |
| `src/lib/` | Scoring, storage, share, sound, analytics, the story-card renderer. |
| `src/app/result/[slug]` | Shareable result pages with their own preview image (`/api/og`). |
| `public/models/skreed-case.glb` | The Skreed case, meshopt-compressed from the product team's model. |
| `docs/concept.md` | The experience concept, stack decision and the asset wishlist. |

## Swapping in real assets

- Any option in `src/data/quiz.ts` accepts `image: '/illustrations/name.png'` and will show that instead of the live 3D glyph.
- Drop a grain texture at `public/textures/grain.png` and set `--grain: url(/textures/grain.png)` on `:root` in `globals.css`.
- The reveal chime is `public/audio/chime.mp3`, the brand's "Go Beyond Basic" closing chime.

## Analytics

Set `NEXT_PUBLIC_GTM_ID` to load Google Tag Manager. Events: `quiz_start`, `quiz_profile`, `quiz_answer`, `quiz_complete`, `quiz_share`, `product_view_click`, `lead_submit`, `lead_success`, `lead_error`, `quiz_retake`.
