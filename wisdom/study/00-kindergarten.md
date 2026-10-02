# Level 00 — Kindergarten: what even is a ForgeScript command

**Prerequisite:** none. **Passing:** token-fluency (below).

## Lesson 1: the four token kinds

Any `.js` command file's `code` string contains exactly four kinds of tokens. Read ANY snippet by classifying each token:

1. **Plain text** — becomes the output message verbatim: `Hello!`
2. **Function calls** — `$name[args]`: `$username[$authorID]`
3. **Escapes** — `\X` makes X literal: `\[`, `\;`, `\$`, `\\`
4. **Whitespace** — literal (multi-line text is fine; it all becomes message content)

Everything else you'll learn is detail about #2.

## Lesson 2: the anatomy of a call

```
$sendMessage[123456789012345678;Hello there;false]
│└──name───┘└────────────args separated by ; ────────────┘
└─ $ introduces every function; names are case-insensitive ($LOG = $log)
```

- `[` `]` wrap the args. `;` separates them. That's the whole grammar.
- Some functions take no args and may be used bare: `$ping`, `$defer`. Some REQUIRE brackets; a few can't have them. When unsure: check the function's page (facts table says `brackets: required/optional/none`).
- Nesting = function calls inside other calls' args: `$username[$authorID]` — inner runs first, its result becomes the outer arg's text. Always innermost-first, left-to-right.

## Lesson 3: prefixes (the three universal modifiers)

After the `$`, before the name, you may see:

| Form | Name | Effect |
|---|---|---|
| `$!fn[...]` | negation | run it, throw away the output |
| `$#fn[...]` | silent | run it, swallow its errors |
| `$@[sep]fn[...]` | count | output = number of `sep`-separated pieces of the result |

They stack (`$!#fn`). If a snippet surprises you, check for these first — invisible at a glance in dense code.

## Lesson 4: where code lives

```js
module.exports = {
    name: "ping",                // trigger word after the prefix
    type: "messageCreate",       // REQUIRED: the event this binds to
    code: `Pong! ($ping ms)$reply`
}
```

That's a complete command. `type` selects the Discord event; the client's `prefixes` list decides what word triggers it. (`aliases`, `description`, `usage` are optional metadata.) `$reply` used bare marks the outgoing message as a reply to the trigger; its full form is `$reply[channel ID*;message ID*;disable ping]` — NOT aoi's `$reply[text]`. An earlier revision of this lesson taught `$reply[Pong! ...;no]`, which fails the Channel type gate.

## Worked example (read this aloud, token by token)

```fs
Hello $username[$authorID], you have $sum[2;3] notifications!
```

- `Hello ` — text
- `$username[$authorID]` — outer call, inner call `$authorID` runs first → the caller's ID → username of that ID
- `, you have ` — text
- `$sum[2;3]` — 5
- ` notifications!` — text

Output: `Hello Nicky, you have 5 notifications!`

## Exercises — READ (predict)

R1. `$log[Hi]` → what appears in Discord? (Careful: what IS `$log`?)
R2. `$math[$sum[1;2]*10]` → ?
R3. `Cost: \$5 \[sale\]` → ?
R4. `$!ping ms` → ?

## Exercises — WRITE

W1. A command that replies with the author's tag (`$userTag`).
W2. Output the text `2;3` literally (the semicolon must survive).
W3. Same as W1 but the function's output must NOT appear (side effects only) — pick the right modifier.

## Exercises — FIX

F1. `$username` displays nothing for a user with ID `123...`. Snippet: `$username`. What's missing?
F2. `$sendMessage[channelID;hi]` sends to a channel literally named "channelID". Why?
F3. `I have $sum[2;3 lives` → broken. Why?

## Answer key

- R1: **Nothing in Discord** — `$log` prints to the host *console*. Track which functions output to console vs message!
- R2: 30. Innermost first: `$sum[1;2]`→3, then `$math[3*10]`.
- R3: `Cost: $5 [sale]` — escapes make the next character literal.
- R4: ` ms` — `$!ping` runs (negation) and discards output; only the text " ms" remains. (`$ping` bare has no brackets needed.)
- W1: `$userTag[$authorID]`
- W2: `2\;3` (escape the semicolon or it splits args)
- W3: `$!userTag[$authorID]` — modifiers sit between `$` and the name; the call still executes, its output vanishes.
- F1: `$username` takes an ID arg and needs brackets here: `$username[123...]`.
- F2: `channelID` is just text — the *function* `$channelID` would resolve it. Inside an arg you pass IDs or calls, never bare field names.
- F3: Unclosed bracket on `$sum` — compile error `missing brace closure`.

## Flashcards (cover the right column)

| Prompt | Answer |
|---|---|
| Arg separator | `;` |
| Inner or outer function first? | Inner, then outer |
| `$!fn` | negation — discard output |
| `$#fn` | silent — swallow errors |
| `$@[x]fn` | count pieces of output split by x |
| Function names case-sensitive? | No |
| `$log` goes to… | the host console, not Discord |
| Command file field that's REQUIRED | `type` |
| How to write a literal `]` | `\]` |
