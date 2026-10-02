# BotForge Developer API — complete reference (verified)

> Base: `https://api.botforge.org`. Every behavior below was exercised live during the knowledge-base build (2026-09-26). Anonymous tier requires no key.

## Authentication & rate limits

- Auth: `X-API-Key` header, or `?key=` query fallback.
- Tiers: **anonymous** (no key), **public**, **private** (per-key).
- Anonymous rate limit: **5 requests per minute**, one shared bucket across ALL `/v1/` endpoints. Exceed → HTTP 429 + `{"success":false,"error":"Too Many Requests: Rate limit is 5 requests per minute for this tier."}`.
- **Public-key tier (verified 2026-09-29 with a `bf_pub_…` key): 60 requests per minute** — same shared bucket, 12× the anonymous ceiling. The 429 body names the tier limit verbatim, which is how to probe any key's ceiling. Anonymous pacing ≥12.5s/call; public-key pacing ~1.15s/call (a full 96-guide sweep takes ~2 min).
- A public key does **NOT** unlock the analytics endpoints: `{"success":false,"error":"Forbidden: Analytics endpoints require a private API key."}` (verified).
- **Client fingerprinting matters**: Python-urllib's default User-Agent gets HTTP 403 on `/v1/guides?id=…` while curl succeeds from the same host — use curl (or override the UA) for scripted harvests. `sync_guides.py` shells out to curl for this reason.
- The bare `api.botforge.org` root serves a self-describing JSON manifest of all endpoints (no key needed).

## Public endpoints

### `GET /v1/extensions` — extension registry
No params: `{success, extensions: [13 packages]}` — each entry carries `packageName`, `packageDescription`, `authorName`, `leadDev`, `githubPackageOwner/Name`, `npmPackageOwner/Name`, `mainBranch`, `branches`, and **raw metadata URLs** (`functionsUrl`, `eventsUrl`, `enumsUrl`, `changelogsUrl`, `readmeBaseUrl` — all `raw.githubusercontent.com`, effectively unrate-limited), `official`, `verified`, `lastUpdated`.

- `?name=ForgeScript` → single profile (`{success, extension}`).
- `?name=ForgeScript&resource=functions` → `{success, extension, resource, query, total_items, data: [...]}` — full function metadata: `name`, `aliases`, `version`, `description`, `brackets`, `unwrap`, `args[{name, description, type, rest, required, condition}]`, `output[]`, `category`. Same works for `resource=events` (`name/version/description/intents[]`) and `resource=enums` (dict name→values).

### `GET /v1/guides` — community guides
- Bare: `{success, guides: [96], pagination: {total_records, total_pages, current_page, limit}}`; `?page=`/`?limit=` (limit up to 100 returns everything in one call).
- `?id=281` → `{success, guide}` with full `content` (markdown), `guideType` (`specific`), `targetType` (`function`/`event`/...), `targetName`, `packageName`, `createdAt`, `approvedAt`, `url`.
- `?search=<text>` filters by title/content.
- **Snapshot 2026-09-29** (public key): still exactly 96 approved guides, all byte-identical to the 2026-09-26 harvest after `\r\n` normalization; the 12 function catalogs also unchanged (all "missing" local names are alias pages).
- **Incremental sync**: `python3 sync_guides.py [--check|--force]` in this folder detects new/edited guides, writes `guide-<id>.md`, and rebuilds `_INDEX.md` (sorted package asc, date desc, id asc).

### `GET /v1/discord` — Discord reference data
- `?resource=intents` → 21 `{name, value(bit), privileged, py, go, description}`
- `?resource=permissions` → 8 categories × `{name, value, description}` (52 total)
- `?resource=scopes` → 29 `{name, description, checked(default), requiresApproval}`
- `?resource=events` → 14 gateway events `{name, intents[], description}`
- `?resource=calculate&intents=<number>` → `{active_intents: [...]}`
- `?resource=calculate&permissions=<number>` → `{input_value, is_administrator, total_granted, granted_permissions: [...]}`
- Numeric strings only — name lists are rejected (`Invalid intents value. Must be a valid numeric string.`); missing params → 400 that self-describes accepted keys.

### `POST /v1/validate` — ForgeScript syntax validator
Body `{"code": "..."}`. Full behavior, blind spots, and false-positive quirks: see [`../validate/README.md`](../validate/README.md). Shares the 5/min bucket.

## Private endpoints (require private key)

| Endpoint | Purpose |
|---|---|
| `GET /v1/analytics/views?package_name=&item_type=&item_name=` | Docs view counts (total & unique) |
| `GET /v1/analytics/feedback?...` | Helpfulness ratings (useful/unuseful counts) |
| `GET /v1/analytics/api?start_date=&end_date=&endpoint=&auth_tier=` | API usage volume & performance stats |

## Host quirks (important for agents)

| Host | curl | webfetch pipeline |
|---|---|---|
| `api.botforge.org` | ✅ works | ✅ |
| `docs.botforge.org` | ❌ 403 (Cloudflare) | ✅ (returns SPA shell) |
| `tools.botforge.org` | ❌ 403 (interactive challenge) | ✅ |

The docs SPA is client-rendered — even successful fetches return empty shells ("Loading..."). The API + the registry's raw-GitHub metadata URLs are the real data surface.

## Recipes

```bash
# registry once, then live on raw GitHub (no rate limits)
curl -s https://api.botforge.org/v1/extensions | jq -r '.extensions[].packageName'
# decode a permissions integer
curl -s "https://api.botforge.org/v1/discord?resource=calculate&permissions=8"
# validate code
curl -s -X POST https://api.botforge.org/v1/validate -H 'Content-Type: application/json' -d '{"code":"$log[hi]"}'
```

Offline alternative for the discord data + calculators: the recreated tools in this folder ([`intents-calculator.html`](intents-calculator.html), [`permissions-calculator.html`](permissions-calculator.html)) embed the same datasets.
