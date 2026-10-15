# One update cycle

The site is static. New public cases go into `content-inbox/ingest.json`. The value `last_ingest` in that file drives the **Last updated** time shown on the site (footer of every page, the home "Dots and Muse: newly added" band, and the `/stories/` header). Each browser renders it in the reader's locale (10 locales) with `Intl.DateTimeFormat`.

```bash
cd /workspace/always-on-usage
npm run update            # collect → apply → build → deploy → verify → commit + push
```

The stages can also run one at a time: `npm run update -- collect`, `-- apply`, `-- build`, `-- deploy`, `-- verify commit`. Flags: `--no-deploy`, `--no-push`, `--since=2026-10-01`.

## Stages

| # | Stage | Who | What happens |
|---|-------|-----|--------------|
| 0 | **X fetch** | **agent (x MCP)** | Run `search_posts_all` with the queries in `scripts/sources.json → x_queries_for_runner`. Use expansions `author_id,attachments.media_keys`, tweet fields `created_at,public_metrics,note_tweet` and media fields `url,preview_image_url`. Save each raw response (use `write_to_file`) as `content-inbox/inbox/x/<anything>.json`. A plain array of `{id,author,text,date,likes,media}` is also accepted. |
| 1 | collect | script, headless | Hacker News (Algolia API), official RSS (OpenAI, Meta Newsroom) and Reddit `.json` (best effort: Reddit returns 403 to datacenter IPs, so the script logs it and skips). It also normalises the X files from step 0 and moves them to `inbox/x/done/`. Items are deduped by normalised URL / X post id against `public-cases.json`, `x-cases.json`, `ingest.json`, `queue/pending.json` and `queue/rejected.json`. A keyword filter decides the product. Excluded topics (crypto, memecoins, referral codes and so on) are dropped. Output: `content-inbox/queue/pending.json`. |
| 2 | **translate and curate** | **agent (LLM)** | For each pending item that is a real usage case, guide, warning or comparison, read the original. Then write one object into `content-inbox/queue/translated.json`. Use only facts in the source; never invent a result, quote or prompt. Items that are not usage (model launches, news, ads) go into `content-inbox/queue/rejected.json` as `{"id","url","reason"}`. |
| 3 | apply | script | Validates every translated item: https URL, author, product ∈ {openai-dots, meta-muse, grok-bot, multi}, type ∈ {field-case, guide, quota-report, comparison}, all 10 locales with a non-empty title and summary, a canonical X URL for X posts, no excluded topics, and not already published. Valid items are appended to `ingest.json` with `added_at`, and `last_ingest` is set to now. Invalid items stay in `translated.json` with an `errors` list. |
| 4 | build | script | `BASE=/ node gen.mjs && vite build`. Each item gets a stable page at `/cases/<x-author-postid \| hn-id \| web-…>.html`. |
| 5 | deploy | script **or agent (Cloudflare MCP)** | `scripts/mk_worker.mjs` packs `dist/` into one Worker and writes `/workspace/cf_deploy_v6.js`. If `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set, the script uploads the Worker itself. Otherwise the agent calls the Cloudflare MCP tool `execute` with `{"code":"$file:/workspace/cf_deploy_v6.js"}` and then runs `npm run update -- verify commit`. |
| 6 | verify | script | Polls https://usage.incidental.site/ until the page contains the new `last_ingest`. Propagation takes about 20 s. |
| 7 | commit + push | script | `git add -A && git commit -m "ingest: N items, last_ingest …" && git push` |

### translated.json item shape

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
- Everything else runs headless: HN, RSS, Reddit best effort, dedupe, validation, build, verify and git.

## Files

- `scripts/update.mjs`: the pipeline.
- `scripts/sources.json`: queries, RSS feeds, product match rules and exclusions.
- `scripts/mk_worker.mjs`: packs `dist/` for deploy.
- `content-inbox/ingest.json`: published incremental items plus `last_ingest`.
- `content-inbox/queue/{pending,translated,rejected}.json`: the work queue.
- `content-inbox/inbox/x/`: raw X responses dropped there by the runner.
- `content-inbox/x-cases.json` + `x-stories-i18n.json` + `x-source-posts.json`: the long-form X stories under `/stories/`. Each story has zh-CN facts, rewrites in the other 9 locales, and the verbatim post text and media re-fetched from X.
