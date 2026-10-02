# Security notes — the dangerous surfaces

ForgeScript executes as the bot process. Everything below is me thinking like an attacker with access to command authoring or user input.

## The `unsafe` category is exactly what it says

`$djsEval`, `$eval`, `$exec` and friends run arbitrary JS/shell in the bot's Node process. Rules I hold myself to:

1. **Never interpolate user input into them.** `$djsEval[client.users.fetch($message[1])]` is fine (an ID); `$djsEval[$message]` is remote code execution with a message wrapper.
2. Check for a native function first — 1,120 exist; the unsafe escape hatch is almost never needed (`../knowledge/functions/unsafe/`).
3. If a command must use unsafe functions, it belongs in an owner-only command gated by `$onlyIf[$authorID==OWNER_ID;...]` at minimum — and even then, keep secrets out.

## Secret hygiene

- Tokens: `$clientToken` **does exist** (alias of `$botToken`, verified in live metadata — my earlier "doesn't exist" note was wrong), and `client.token` is reachable through `$djsEval` anyway. Assume **any `$djsEval` exposure is token exposure**.
- **Committed-token case study (community audit 2026-09-28):** `UndefinedBlastro/ayra` ships a *live* bot token hardcoded in `index.js` — a real, findable-in-10-seconds leak in a public repo. When auditing anyone's bot, `git grep -iE 'token|MT[A-Za-z0-9]{20,}'` is step zero. Discord tokens base64-start with `MT` and carry a `.` two-part suffix — grep for that pattern, not the word "token".
- **Env-secret-baking (Akira pattern):** injecting an env secret into ForgeScript source via a JS template literal (`$encrypt[...${process.env.KEY}...]`) works but the secret becomes part of the compiled FS code — one `$debug`/error dump away from the logs. Keep secrets in the JS layer; pass only derived values into FS code.
- `$log[...]` prints resolved values to console — never log secrets, API keys from `$httpAddHeader`, or full `$httpResult` bodies in shared logs.
- `$httpRequest` with user-influenced URLs = SSRF surface (attacker points the bot at internal endpoints). Whitelist domains in command logic before passing URLs.
- Webhook functions (`$webhookSend` etc.) with stored tokens: treat the token like a password; don't echo it into `$log` or embeds.

## Input trust boundaries

User-controlled text enters via: `$message[...]`, interaction options, component `customID`s, modal inputs, and awaited messages (`$awaitMessage`). Before that text reaches:

- **URL/Time/Json-typed args** — the resolver gates them (good), but String args don't gate anything.
- **`$eval`-family** — see above; that's RCE.
- **Mention/emoji parsing** — mostly inert, but echoes back into output (XSS isn't a thing in Discord text, but phishing-lookalike text is).
- **Cooldown keys** — `$cooldown[$message[1];...]` keys on user input = cooldown bypass by varying the key. Key on IDs, not text.

## Resource exhaustion

- `$while` with a non-mutating condition = infinite loop in the bot process. `$wait[$get[userTime]]` with huge durations. `$fetchAllMessages`-style calls on big channels. Loops bounded by user input deserve a hard cap:
  `...$let[i;0]$while[$and[$get[i]<50;$get[i]<$get[userCap]];$let[i;$sum[$get[i];1]]...]`

## Data-exfil channels to remember

`$httpRequest` + `$httpAddHeader` (arbitrary outbound), `$exec` (shell), `$djsEval` (fs/network via Node), webhook execution, `$sendDM` (message spam → bot bans). When reviewing someone's command file, these are the five things I grep for first.
