# Mental models — the framings that make ForgeScript predictable

## 1. It's a template engine with side effects, not a language

The compiler replaces `$fn[...]` tokens with their results inside a plain-text template (literally a generated JS template function — see `../knowledge/core/forgescript-internals.md`). Everything confusing flows from this:

- There are no variables in the language sense — `$let` writes into an environment map that lives **per execution**, and text interpolation stringifies whatever comes out.
- "Return values" only exist between a child function and its parent argument slot. At top level, a function's result is just... text that gets sent.
- Order is left-to-right, innermost-first, and *that's the entire execution model*. No precedence, no laziness (except `unwrap:false` raw-code args).

When I'm confused by a snippet, I mentally rewrite it as "what string does this produce, and what side effects happened along the way?"

## 2. Functions are side-effectful ops; the container is the accumulator

Output isn't "returned", it's **accumulated**: `$title`, `$addField`, `$addButton` mutate a message container that gets sent at the end. Practical consequences:

- Embed/component functions' *order* matters; their "return value" is irrelevant.
- `$stop`/`$onlyIf`-style gates make sense because they kill execution before the container is sent.
- `$onlyIf[cond;msg]` **sends the message itself then stops** (verified in source) — it doesn't "return an error".

## 3. Types are a gate, not a conversion layer

`unwrap:true` functions pass every arg through a resolver (`../knowledge/core/arg-types.md`). The resolver mostly *validates* rather than converts: snowflake-or-nothing for entities, literal `true`/`false` for booleans, `https`-only for URLs. A failed gate aborts the whole command. So when writing code, I think of args as **contracts**: my job is to satisfy the resolver before the function ever runs.

The sneaky one: optional args left empty skip validation entirely and arrive as `null` — implementations each invent their own default. That's where "works on my machine" behavior lives.

## 4. Raw-code functions are the escape hatch into "real" programming

`unwrap:false` (`$if`, `$while`, `$try`, `$ifx`, `$async`, `$function`) receive **source text**, not values. They compile and run it when they choose. That's why:

- `;` inside their args separates *statements*, not list items.
- Inner functions don't run until the branch is taken — expensive calls inside a false `$if` branch never execute.
- `$while` bodies re-compile per iteration by design; state must flow through `$let`/`$get`.

## 5. Pointers make signatures positional contracts

`Member`, `Role`, `Message`, `Reaction`, etc. resolve *against an earlier argument* (their `pointer`) or the event context. A signature like `$roleMembers[guildID;roleID]` isn't two independent lookups — it's "resolve guild from arg 0, then find the role inside it". Reordering args doesn't just change meaning, it breaks resolution outright (silently — the lookup just misses).

## 6. The event context is the hidden argument to everything

Every function silently depends on what the triggering event provided: `$message` needs a message, `$memberX` needs a guild, `$customID` needs an interaction. Half of "why does my code error in slash commands but not prefix commands" is **context availability**, not the functions themselves. When porting a command between event types, I inventory the context first (`../knowledge/events/_INDEX.md` lists what fires with what intents).

## 7. Experimental flags exist even though the docs hide them

The docs site doesn't render `experimental`/`deprecated`, but the source carries them (25 + 5 functions — see `experimental-map.md`). I treat the flags as *upstream's own uncertainty*: fine to use, but I write such code defensively (wrap in `$try`, avoid building load-bearing abstractions on them).
