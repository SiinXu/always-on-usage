# DESIGN — v2 visual redesign (2026-10-12)

**Design Read:** editorial data report for people sizing agent quotas — a Carbon-grade data-table system with a data-journalism serif voice; restrained motion (3/10), medium density (5/10).

## Survey (ui-hub/data.json, 2357 items)
Facet counts: rt component-demo 1924 · motion 184 · component-library 178 · skill 79 · tokens-spec 51 · design-system 48 · inspiration 38 · anti-slop 30. vs minimal 1021 · enterprise 805 · material 326 · soft 259 · playful 215 · dark-tech 102 · gradient 78 · editorial 25 · swiss 19 · glass 6.
Sampled contact sheets: every `cs/*-table*` / `*-chart*` shot (~36), every 3rd input/slider/form/select shot, every 8th `site/*` shot (~36), all `cover/*`.

**Strong for a comparison + calculator product**
- Enterprise data tables: `cs-lib-carbondesignsystem-com-table.webp`, `cs-lib-ant-design-table.webp`, `cs-lib-www-radix-ui-com-themes-table.webp`, `cs-www-shadcn-svelte-com-table.webp` — sunk header row, hairline rows, no zebra, no card shadows.
- Number-led tables: `cs-lib-picocss-com-table.webp`, `cs-lib-mui-com-material-ui-table.webp` (big tabular figures read as "data").
- Serif-light display over grid tiles: `lib-carbondesignsystem-com.webp` (Carbon, https://carbondesignsystem.com) and `ued-carbon-themes.webp`; `ued-uber-base` / Base Web (swiss tag) for square edges + 2px rule.
- Editorial restraint: `land-book-com.webp`, `ued-curated-design.webp`, `refero-design.webp`, `ued-apple-hig.webp`; Practical Typography (https://practicaltypography.com) for measure/line-height; Vercel Web Interface Guidelines (swiss) for focus/hit-area rules.
- Square tags with status dot: Carbon tag pattern; `cs-lib-semi-design-table.webp` status chips.

**Rejected (AI-slop / wrong fit)**
- Dark-tech aurora heroes: `21st-dev.webp`, `beui-dev.webp`, `uiverse-io.webp`, `ued-text-effects.webp`, `kibo-ui` — glow, mesh, centred hero; competes with data.
- Gradient blobs: `lovable-dev.webp`, `lib-preline-co.webp` purple-blue mesh.
- 3D/playful: `ued-3dicons.webp`, `lib-lenis-darkroom-engineering.webp` — spectacle over legibility.
- Chart demos with pastel fills (`cs-lib-mantine-dev-chart.webp`, `cs-lib-primereact-org-chart.webp`) — decorative.
- Previous v1 (paper #f6f6f4 + orange + Instrument Serif) — orange read as warning palette, too close to ui-hub v4; dropped entirely.

## System
- Type: IBM Plex Serif 300 (display, italic accent word) · Plex Sans (UI) · Plex Mono uppercase 12px labels/counters. CJK fallback Songti / PingFang.
- Light: canvas #f4f4f4, panel #fff, sunk #e8e8e8, ink #161616/#525252/#8d8d8d, accent cobalt #0f62fe.
- Dark (designed, not inverted): #161616/#1f1f1f/#262626, accent #78a9ff, risk tones re-tinted for dark.
- Risk: square tinted tags with dot — low green, med amber, high red (semantic only, never decorative).
- Shape: radius 0–2px; 2px ink rule tops each data block (table, case list, article dl); calculator is a stack of field rows with a full-width accent submit bar.
- Structure: numbered sections (01, 02…) via CSS counters; numbered case index rows.
- Motion: colour transitions only, respects reduced-motion. No infinite animation.
- Mobile 390: nav scrolls in its own row, table scrolls inside `.tw`, body `overflow-x:hidden` safety.
