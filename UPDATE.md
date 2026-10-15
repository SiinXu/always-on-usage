# One update cycle

The site is static. New public cases go into `content-inbox/ingest.json`. The value `last_ingest` in that file drives the **Last updated** time shown on the site (footer of every page, the home "Dots and Muse: newly added" band, and the `/stories/` header). Each browser renders it in the reader's locale (10 locales) with `Intl.DateTimeFormat`.

```bash
cd /workspace/always-on-usage
npm run update            # collect → apply → extract → build → deploy → verify → commit + push
```

The stages can also run one at a time: `npm run update -- collect`, `-- apply`, `-- extract`, `-- build`, `-- deploy`, `-- verify commit`. Flags: `--no-deploy`, `--no-push`, `--since=2026-10-01`.

## Stages

| # | Stage | Who | What happens |
|---|-------|-----|--------------|
| 0 | **X fetch** | **agent (x MCP)** | Run `search_posts_all` once per query in `scripts/sources.json → x_queries_for_runner` (8 queries: the three products, use-case variants of each, always-on agents, and named use cases such as rent, groceries, inbox, PRs, flights, job search). Use expansions `author_id,attachments.media_keys`, tweet fields `created_at,public_metrics,note_tweet` and media fields `url,preview_image_url`. **On HTTP 429, wait 60 s, then 120 s, then 240 s, and then give up on that query and move to the next one** (`x_runner_notes`). Save each raw response (use `write_to_file`) as `content-inbox/inbox/x/<query-key>-<timestamp>.json`. A plain array of `{id,author,text,date,likes,media}` is also accepted. |
| 1 | collect | script, headless | Sources, each best effort with its own skip log: **Hacker News** (Algolia API, more queries per product); **Reddit** `.json` and then **Reddit RSS** (`search.rss`; both are usually refused from datacenter IPs, so they get logged and skipped); **YouTube** (the public search page sorted by upload date, then each watch page for the full description, upload date and views; `products.*.youtube`); **GitHub search API** (repositories plus issues and discussions created since the cutoff; unauthenticated, so there is a 6.5 s pause between calls; `products.*.github`); **Medium** tag feeds (`medium_tags`; article pages return 403 but the feeds carry the full post); **dev.to** public API by tag (`devto_tags`); and official RSS (OpenAI, Meta Newsroom). It also normalises the X files from step 0 and moves them to `inbox/x/done/`. Dedupe works on normalised URL: X uses the post id and YouTube uses `yt:<video id>`. Dedupe runs against `public-cases.json`, `x-cases.json`, `ingest.json`, `queue/pending.json` and `queue/rejected.json`. A keyword filter decides the product. Excluded topics (crypto, memecoins, referral or invite codes and so on, matched on word boundaries) are dropped. Output: `content-inbox/queue/pending.json`. |
| 2 | **translate and curate** | **agent (LLM)** | For each pending item that is a real usage case, guide, warning or comparison, read the original. Then write one object into `content-inbox/queue/translated.json`. Use only facts in the source; never invent a result, quote or prompt. Items that are not usage (model launches, news, ads) go into `content-inbox/queue/rejected.json` as `{"id","url","reason"}`. |
| 3 | apply | script | Validates every translated item: https URL, author, product ∈ {openai-dots, meta-muse, grok-bot, multi}, type ∈ {field-case, guide, quota-report, comparison}, all 10 locales with a non-empty title and summary, a canonical X URL for X posts, no excluded topics, and not already published. Valid items are appended to `ingest.json` with `added_at`, and `last_ingest` is set to now. Invalid items stay in `translated.json` with an `errors` list. |
| 3b | extract | script | `scripts/extract_sources.py` fetches verbatim source material for public cases and for newly ingested GitHub, YouTube or forum items that arrived without an outline or media. It reads the README's first paragraph, bullets and images; the video description, chapters and thumbnail; or the forum first post, images and reply count. Results go to `content-inbox/source-extract.json`, keyed by URL. The step is incremental: only new URLs and earlier errors are fetched again. The case pages show this as "来源原文摘录", "视频章节" or "来源里的步骤 / 要点", always untranslated and marked as verbatim. |
| 4 | build | script | `BASE=/ node gen.mjs && vite build`. Each item gets a stable page at `/cases/<x-author-postid \| yt-id \| gh-owner-repo \| medium-slug \| hn-id \| web-…>.html`. Every case page shows a **资料完整度** checklist (author and link, what was built, verbatim excerpt, media, steps or chapters, verbatim prompt, results or numbers, risks, related entries). Each field is ✓ or —, and — means the source didn't give it; it is never filled in. Aggregate pages are rebuilt from the same data: `/topics/` (one page per scenario), `/compare-use-cases.html` (scenario × product counts) and `/digest/` (ISO weeks by post date, weeks with ≥5 items). |
| 5 | deploy | script **or agent (Cloudflare MCP)** | `scripts/mk_worker.mjs` packs `dist/` into one Worker and writes `/workspace/cf_deploy_v6.js`. If `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set, the script uploads the Worker itself. Otherwise the agent calls the Cloudflare MCP tool `execute` with `{"code":"$file:/workspace/cf_deploy_v6.js"}` and then runs `npm run update -- verify commit`. |
| 6 | verify | script | Polls https://usage.incidental.site/ until the page contains the new `last_ingest`. Propagation takes about 20 s. |
| 7 | commit + push | script | `git add -A && git commit -m "ingest: N items, last_ingest …" && git push` |

### translated.json item shape

Optional fields shown on the case page when the source has them: `outline` (array of verbatim steps or chapters), `prompt` (a verbatim prompt or config quoted by the author), `views` (YouTube). Leave them out when the source doesn't have them.

```json
{"id":"x:2105612186450297061","url":"https://x.com/AI_MrWhite/status/2105612186450297061",
 "source":"x","source_name":"X","author":"AI_MrWhite","date":"2026-10-01","likes":0,
 "product":"openai-dots","type":"field-case","media":["https://pbs.twimg.com/media/….jpg"],
 "text":"<verbatim post text, shown as the author's own words>",
 "tr":{"zh-CN":{"title":"…","summary":"…"},"zh-TW":{…},"en":{…},"ja":{…},"ko":{…},"ms":{…},"vi":{…},"fr":{…},"es":{…},"de":{…}}}
```

Translation rules:
- Write the summary from the source: what was built, how, and the stated result.
- If the source has no number, there is no number.
- Do not use promotional hooks.
- Leave brand names (Dots, Muse, Grok Bot) as they are.

## Which steps need agent tools

- **x MCP** is needed for step 0. X has no headless public API on this box.
- **LLM** is needed for step 2: the relevance call and the 10-locale title and summary. There is no headless translation, so untranslated items wait in `queue/pending.json`. Nothing reaches the site untranslated.
- **Cloudflare MCP** is needed for step 5, but only when no API token is in the environment.
- Everything else runs headless: HN, RSS, YouTube, GitHub, Medium, dev.to, Reddit best effort, source extraction, dedupe, validation, build, verify and git.
- Not collectable from this box (checked on 2026-10-15): Reddit (403 or login wall for .json, RSS and pages), Product Hunt (JS-only pages), Substack search (no public endpoint), and Medium article pages (403; use the feeds instead).

## Files

- `scripts/update.mjs`: the pipeline.
- `scripts/sources.json`: queries, RSS feeds, product match rules and exclusions.
- `scripts/mk_worker.mjs`: packs `dist/` for deploy. All files are concatenated into one buffer and compressed with **brotli at a 16 MB window**, so the shared page chrome compresses across pages: about 33 MB of HTML packs to about 1.7 MB. The Worker inflates the buffer once per isolate with `node:zlib` (`nodejs_compat`) and serves byte ranges from an index. The deploy snippet must stay under 4 MB.
- `scripts/extract_sources.py`: verbatim README, video and forum excerpts → `content-inbox/source-extract.json`.
- `content-inbox/ingest.json`: published incremental items plus `last_ingest`.
- `content-inbox/queue/{pending,translated,rejected}.json`: the work queue.
- `content-inbox/inbox/x/`: raw X responses dropped there by the runner.
- `content-inbox/x-cases.json` + `x-stories-i18n.json` + `x-source-posts.json`: the long-form X stories under `/stories/`. Each story has zh-CN facts, rewrites in the other 9 locales, and the verbatim post text and media re-fetched from X.
