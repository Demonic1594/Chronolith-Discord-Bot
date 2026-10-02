# Level 04 — College: systems inside the language

**Prerequisite:** 03. **Passing:** you can design a custom-function library, a JSON pipeline, and an HTTP integration that each fail gracefully.

## Lesson 1: custom functions — authoring & the two registries

Author (module file via `functions:` folder, or `client.functions.add`, or `new ForgeFunction({...})` maintainer-style):

```js
new ForgeFunction({
  name: "admin",
  params: ["guild", "user"],              // string = required String; objects for type/optional/rest
  code: `$return[$hasPerms[$env[guild];$env[user];Administrator]]`
})
```

Params → env keys (read `$env[name]`). Body runs in a **cloned context**: `doNotSend` (never sends its own message), `allowTopLevelReturn` (`$return` = the output), env is a shallow copy (writes don't escape — return values out). Registered names become real callable functions: `$admin[guild;user]` direct, or `$callFunction[name;args]` for dynamic names. Sibling system: `$fn[name;code;params…]` defines context-local helpers, called with `$callFn[name;args]` — params come AFTER the code. `UnknownXName: function` vs `local function` tells you which registry you mismatched.

## Lesson 2: JSON pipelines

`$jsonLoad[var;jsonText]` parses into env → read paths with `$env[var;k1;k2;0]` → mutate with `$jsonSet[var;k;v]`/`$jsonDelete` → serialize `$jsonStringify[var]`. `[\]` is the escaped empty-array literal. `$jsonEntries[var]` → `[key, value]` pairs (index 0 = key). `Object`-shaped state survives restarts only through a DB — the timeout-system flow: `$jsonLoad[timeouts;$getGlobalVar[timeouts;{}]]` → mutate → `$setGlobalVar[timeouts;$env[timeouts]]`.

## Lesson 3: HTTP — staged request, status return

```fs
$httpSetContentType[Json]                       ← parsing override (Json/Text/…)
$httpAddHeader[Authorization;Bearer $get[t]]    ← staged options
$httpSetBody[{"q":"hi"}]
$if[$httpRequest[https://api.example.com/v1/x;GET;res]==200;
  $jsonLoad[data;$env[res]]
  $env[data;items;0;name];
  request failed]
```

`$httpRequest[url*;method*;var?]` **returns the HTTP status**; body lands in the env var auto-typed (JSON→object, image→base64, else text). Options auto-clear after each call. `https` only. Rate-limit awareness: cache hot results (Edge tables or a DB), don't call APIs per keystroke.

## Lesson 4: freeze/thaw — code as data

`$escapeCode[...]` (alias `$esc`) returns raw source (nothing inside resolves). Round-trip: escape → store (`{N}` for newlines if it crosses DB text) → later `$replace[...;{N};\n]` → `$try[$eval[code;false]]`. Custom functions unwrap args (that's WHY escaping is needed). Code crossing JSON instead of args can skip `$esc` (JSON strings don't split on `;`).

## Lesson 5: timers & intervals

`$setTimeout[code*;time;name]` / `$clearTimeout[name]` (returns bool); `$setInterval[code*;time;name]` / `$clearInterval[name*]`. Named for a reason: namespace the keys (`task-$guildID`), clear on cleanup. Timers >24.8 days hit the 32-bit limit — re-arm recursively from an absolute `endTime` (timeout-system pattern) or persist + resweep on `clientReady`.

## Lesson 6: error strategy as architecture

- Gates (`$onlyIf[cond;]` empty msg = silent stop) for *expected* failures.
- `$try[code;catch;errVar]` for *risky* calls; log `$get[errVar]` in dev.
- `$#fn` per-call silencing for known-flaky calls.
- Errors abort the command: put gates FIRST, expensive work AFTER.

## Exercises — READ

R1. `$callFn[helper;5]` where helper was defined with `$fn[helper;$log[$env[x]];x]` → console shows?
R2. `$jsonSet[db;user;{"n":1}]$env[db;user;n]` → ?
R3. `$httpRequest[http://x.dev;a;GET]` → ?
R4. A `$setTimeout` fires after bot restart — what happened to it?

## Exercises — WRITE

W1. Custom function `banCheck[guild;user]` → `true`/`false`, no message output.
W2. Store a per-user economy in ForgeDB: `!work` adds random 5–25, gated 1h, replies balance. (Use `$setUserVar/$getUserVar`.)
W3. Fetch `https://api.x.dev/ping` once per minute into cache table `net`, keyed `ping`; command reads cache, never the API.

## Exercises — FIX

F1. Custom `fetchIt` returns the body but ALSO posts an empty message. Cause?
F2. `$eval[$escapeCode[$log[hi]]]` prints nothing, no error. Why?
F3. Every restart, all cooldowns reset. Structural fix?

## Answer key

- R1: `5` — `$callFn` stores arg into env key `x` (param name), body logs it.
- R2: `1`.
- R3: Fails the URL gate — `http://` (no s) is rejected outright.
- R4: Nothing — native timers are in-memory. Restart-persistent work needs DB persistence + `clientReady` resweep with absolute end times.
- W1: `new ForgeFunction({ name:"banCheck", params:["guild","user"], code:"$return[$isBanned[$env[guild];$env[user]]]" })` (adapt to the real ban-check function your version has — verify in knowledge/functions/lookup).
- W2: `$cooldown[$authorID-work;1h;You already worked.]$let[pay;$randomNumber[5;25]]$setUserVar[balance;$math[$getUserVar[balance]+$get[pay]]]Earned $get[pay]! Balance: $getUserVar[balance]`
- W3: `$setInterval[$let[st;$httpRequest[https://api.x.dev/ping;GET]]$setCache[net;ping;$get[st]];1m]` in a startup event; command: `$getCache[net;ping]` (treat 200 check as refinement).
- F1: The body's stray text output — custom functions discard it, but a *send-family* call inside posts. Remove the send (or set `doNotSend` semantics: don't call `$sendMessage` inside; `$return` values instead).
- F2: `$escapeCode` freezes the text `$log[hi]`; `$eval` then runs it → it logs `hi` to CONSOLE and returns empty — nothing was wrong; your expectation was. (Read the function, not the intent.)
- F3: `$cooldown` state is in-memory. Use a DB-stored timestamp: `$setUserVar[lastWork;$getTimestamp]` + `$onlyIf[$math[($getTimestamp-$getUserVar[lastWork])<3600000];...]`, or the timeout system's persistent pattern.

## Flashcards

| Prompt | Answer |
|---|---|
| Custom fn output mechanism | `$return[...]` (top-level) |
| Env inside custom fns | cloned shallow copy — writes don't escape |
| Params in `$fn[...]` order | AFTER the code: `[name; code; params…]` |
| `$httpRequest` returns | the HTTP status code |
| Body goes to | env var (auto-typed; default name `result`) |
| Freeze function | `$escapeCode`/`$esc` |
| Empty-array JSON literal | `[\]` |
| `$jsonEntries` order | `[key, value]` |
| Timer names are | required for cleanup — namespace them |
| 24.8-day timer limit fix | recursive re-arm from absolute endTime |
