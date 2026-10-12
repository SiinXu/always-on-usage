# DESIGN v3 — "Instrument"

## Design Read
v1 (paper + orange) and v2 (Carbon tables + newspaper serif, IBM Plex) were both rejected as ugly. Surveyed ui-hub data.json (2357 items; 1924 styles, 103 libs) and read preview images directly. Rejected clusters: enterprise grey (lib-carbondesignsystem-com, lib-ant-design), editorial serif (refero-design, www-shapeof-ai gradient), glow/mesh (www-shadergradient-co, live-orbs).

Chosen: refined dark product UI with ONE luminous accent, data-first.
- `previews/www-beautifului-dev.webp` — near-black framed column, hatched diagonal gutters, #111 panels, mono labels → page frame + body hatch.
- `previews/lib-tremor-so.webp` and `previews/lib-ui-shadcn-com-charts.webp` — tight bold sans display, pill badge above H1, primary + ghost CTA pair, metric-number cards → hero, pill, stats strip.
- `previews/ui-elevenlabs-io.webp` — restraint: monochrome with a single color moment.

## System
- Type: Geist (display 700, -0.035em) + Noto Sans SC; Geist Mono for labels, numbers, risk chips.
- Color: dark default #09090b / panels #111113 / lines #232327; accent signal lime #c6f432 (text #4d7c0f in light). Risk: green / amber / rose, only on chips and meter.
- Tables: bordered panel, mono uppercase row labels, muted cells that brighten on hover. No cards grid.
- Calculator: 5-segment risk meter colored by level + large risk chip.
- Light mode via prefers-color-scheme + ◐ toggle (localStorage).
- No gradients, glow, glass, or emoji.
Shots: shots/v3/{home,calculator,compare}-{dark,light}-{desk,mob}.png
