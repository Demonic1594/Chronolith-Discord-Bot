# Autocomplete deep dive — dynamic slash options, verified end to end

> Source: `../../code/autocomplete-tutorial/` (submitted 2026-09-26). Every claim in the tutorial was checked against metadata and `execute()` source — **zero contradictions**; this file adds the mechanics the tutorial implies but doesn't explain.

## The full pipeline (source-verified)

1. Command `data.options[].autocomplete: true` → Discord fires an **autocomplete interaction** on each keystroke in that option.
2. Event file `{ type: "interactionCreate", allowedInteractionTypes: ['autocomplete'], code }` — `allowedInteractionTypes` is a BaseCommand field whose filter maps `'autocomplete'` → `interaction.isAutocomplete()` (also valid: `'button'`, select-menu types, etc. — same mechanism the timeout system used).
3. Inside the handler: `$focusedOptionName` / `$focusedOptionValue` read the focused option (`options.getFocused(true)`, guarded to autocomplete interactions — both return nothing otherwise).
4. `$addChoice[name*;value*]` pushes `{name, value}` into `ctx.container.choices` — **the container accumulates choices like it accumulates embeds/buttons**.
5. `$autocomplete` literally does `ctx.container.send(ctx.obj)` — responds to the interaction with the accumulated choices. The tutorial's "(optional)" is right: the interpreter's end-of-run container send would deliver the same payload; calling `$autocomplete` explicitly just makes intent obvious.

## The two-component contract

`$onlyIf[$and[$applicationCommandName==choose;$focusedOptionName==choice]]` — the handler must scope itself to **command + option** or it will answer autocomplete for *every* autocomplete-enabled option in the bot (wrong suggestions or empty responses elsewhere). The command-name check uses `$applicationCommandName` (note: requires `id` arg in metadata but the bare form is used here — brackets optional).

Discord hard-caps choices at **25**. The tutorial's `$loop[25; ...; i; true]` with a `$get[currentChoice]==; $break` guard is the standard safe iteration: counts 1→25 via `$env[i]`, breaks on exhaustion. Remember `$arrayAt` on a missing index returns empty → the break condition.

## `$arrayMap` is map AND filter in one call (the non-obvious core)

From `execute()`: for each element it sets the element var, runs the raw code, and **collects only `$return` values**:

```fs
$arrayMap[options;opt;
    $if[$checkContains[$toLowerCase[$env[opt]];$toLowerCase[$get[focusedValue]]];
        $return[$env[opt]]
    ]
;options]
```

- No `$return` → element **dropped** — `$if[cond;$return[x]]` with no else is the filter idiom.
- `$return` values are `parseJSON`d — strings stay strings, but `{"a":1}` comes back as an object (useful for building JSON payloads in map).
- 4th arg = output var name: given, the result array lands in env under that name and the function returns empty; omitted, it returns the JSON-serialized array. **Naming output = input filters in place** (the tutorial's move).

Also confirmed: `$includes` is an alias of `$checkContains[text*;matches*]` — substring match, case-**sensitive**, hence the `$toLowerCase` wrapping on both sides in the tutorial.

## Reusable skeleton (minimal verified shape)

```js
// commands/choose.js
{ data: { type: 1, name: 'choose', description: 'Pick',
    options: [{ name: 'choice', type: 3, description: '...', required: false, autocomplete: true }] },
  code: `You chose: $option[choice]` }

// events/autocomplete.js
{ type: "interactionCreate", allowedInteractionTypes: ['autocomplete'],
  code: `
    $onlyIf[$and[$applicationCommandName==choose;$focusedOptionName==choice]]
    $let[q;$focusedOptionValue]
    $arrayLoad[options; ;One Two Three]
    $if[$get[q]!=;
        $arrayMap[options;opt;
            $if[$checkContains[$toLowerCase[$env[opt]];$toLowerCase[$get[q]]];$return[$env[opt]]]
        ;options]
    ]
    $loop[25;
        $let[choice;$arrayAt[options;$math[$env[i] - 1]]]
        $if[$get[choice]==;$break]
        $addChoice[$get[choice];$get[choice]]
    ;i;true]
  ` }
```

The trailing bare `true` in the submitted advanced example appears to be author style (guards against an empty final expression); harmless either way with the container send.

## Where this generalizes

Same event + `allowedInteractionTypes` + container-accumulation pattern powers: button handlers (`$customID` routing), modal submits (`$awaitModalSubmit` + `$addTextInput`), and select menus — the autocomplete case is just the cleanest demonstration of "accumulate into container, send once."
