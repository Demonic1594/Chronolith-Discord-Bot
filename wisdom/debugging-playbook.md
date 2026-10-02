# Debugging playbook — symptom → root cause

My decision tree when ForgeScript code misbehaves. Work top to bottom; most bugs die in the first three levels.

## Level 0: Did it even compile?

Compile errors print with line/column (`CompilerError`). The four that exist:
- `Function $x requires brackets` → called bare, brackets are mandatory.
- `Function $x is missing brace closure` → unclosed `[` (validator catches this one reliably).
- `Function $x expects N arguments at most` → too many `;` pieces for a non-rest signature — usually an **unescaped `;` inside text**.
- `Function $x is not registered` → typo, or an extension function used before the extension loaded. Remember: names are case-insensitive and aliases resolve, so suspect *spelling* and *extension load order*, not casing.

## Level 1: The arg-type gate (this is ~50% of all bugs)

If a command errors with `InvalidArgType <value> for arg <name>`, run the checklist (`../knowledge/core/arg-types.md`):

| Symptom | Real cause |
|---|---|
| ID passed but rejected | Not a 16-23 digit snowflake — you passed `<@id>`, a username, or full URL |
| `maybe` / `yes` rejected on a bool arg | Booleans accept ONLY `true`/`false` |
| URL rejected | It's `http://` — the check literally requires `https` |
| `abc` rejected on number | `Number("abc")` is NaN — resolver rejects |
| Emoji rejected | Must be `<:name:id>`, raw id, or CDN URL — bare `:smile:` unicode only works for some emoji arg variants |
| Permission rejected | camelCase `PermissionFlagsBits` key — no spaces |
| Time rejected | Number (ms) or `10m`-style — `10 minutes` fails |

`MissingArg $x for arg <name>` = a required arg resolved to null — usually an empty slot or an exhausted rest arg.

## Level 2: Pointer order (silent, no error)

Entity args (Member/Role/Message/Reaction/...) resolve **against an earlier argument** or the context. Symptoms: function "does nothing", returns empty, or errors on a follow-up fetch — with no invalid-type error anywhere. Fix: check the signature's param order in `../knowledge/functions/...`; the guild/channel/message arg almost always must come *first*.

## Level 3: Context availability

Function silently empty/absent in a specific event: the event didn't provide the entity. Classic cases:
- `$message`/`$message[...]` — message commands only, not interactions (use `$input[...]`/slash option accessors there).
- `$memberX` functions — need a guild context; DMs break them.
- `$oldMessage`/`$newMessage[property]` — only inside `messageUpdate`-style events, and old state needs caching.
- `$customID`/`$isButton` — only inside component interaction events.

## Level 4: Control-flow misunderstandings

- `$if` ran BOTH "sides"? You wrote `;`-separated code in a branch and forgot branches are single statements — use `$ifx` blocks.
- Loop body uses `$let` but value resets: the body re-runs raw code — verify the `$let` is inside the body, the `$get` outside.
- `$while` never ends: the condition arg is raw text — inner `$checkCondition` etc. must re-evaluate each iteration; make sure something in the condition actually mutates.
- "Nothing was sent": a gate (`$onlyIf`, `$cooldown`) fired and **sent its own message then stopped** — check gates, don't add output below them expecting it to run.

## Level 5: Output-shape surprises

- Array/object prints as JSON with indentation — that's `successJSON` (4-space). Not a bug.
- Function returned a *count* — someone used `$@[sep]fn[...]` prefix, or the function itself returns counts.
- Empty output but no error — negation prefix `$!fn` (discards output), or output type is `Unknown` and the impl returned `undefined` (check its `execute()` in the knowledge page).
- BigInt values in JSON come out as strings (source replaces them).

## Level 6: Runtime/Discord-side

Clean code, still failing: permissions (bot lacks the Discord permission — many impls use `notAllowed()` and just stop), missing intents (privileged ones must be portal-enabled), rate limits, entity deleted between resolve and act. The `notAllowed` family produces **no error text** by design — that's the usual suspect for "does nothing with zero errors".

## Instrumentation that works

```fs
$log[stage1 args=$message author=$authorID]      ← breadcrumb logging to console
$try[...;$let[e;$get[err]]...;err]               ← capture real error messages
$c[inline comment]                               ← annotate without side effects
```

And before blaming code: run the validator (`../knowledge/validate/README.md`) for bracket/arg-count sanity — while remembering it can't see unknown functions or type errors.

## Level 7: Engine coercion (the silent data corruption layer)

When output "looks right" but contains wrong IDs, wrong users, or wrong numbers:

| Symptom | Root cause | Check |
|---|---|---|
| User IDs in stored data end in `...000` or `...800` | `$jsonSet` coerced the snowflake to a JS Number (precision loss past 2^53) | grep for `$jsonSet.*\$env\[` without surrounding quotes |
| `$arrayIncludes` always returns false with snowflake needles | parseJSON on the needle converted it to a Number — never matches the string array | Replace with `$arraySome[arr;x;$checkCondition[$env[x]==needle]]` |
| Function that "should work" silently does nothing | `$parseMS` received text instead of a Number — arg gate killed the whole run | Check the KB's param TYPE: Number params reject all text |
| Array length is +1 what you expect | `$arrayLoad[name;sep;""]` on empty → `[""]` phantom | Guard the empty case before arrayLoad |
| `%modrole` / `%protect` features "don't work" | Same as arrayIncludes coercion — role/user IDs never match | Same fix as above |

## Level 8: Tooling bugs (when the generator is the bug)

If generated commands have unexpected semicolons, missing negations, or wrong output:

1. **Check the generator's post-processing** — is `_fix_seps` depth-aware? (off-by-one in nest tracking converts commas OUTSIDE $or/$and into semicolons)
2. **Check _postfix negation** — is it producing `$!$fn` instead of `$!fn`?
3. **Check for stale files** — the generator only writes, never deletes old files from previous iterations
4. **Run node --check on every generated file** — JS syntax errors from unescaped backticks
5. **Compare a known-good command** — if one file is right and another wrong, diff their spec entries in the generator
