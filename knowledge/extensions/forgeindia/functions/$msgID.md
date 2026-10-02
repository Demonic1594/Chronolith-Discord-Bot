# $msgID

> Returns the message id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `message` | v1.0.0 | none | no | `Message` |

> aliases: $idOfMsg, $messageKaID

## Signature

```fs
$msgID
```

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$msgID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$msgID
```

## Quirks & gotchas

1. Callable by its aliases too: `$idOfMsg`, `$messageKaID` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$msgReactionAddKaro`]($msgReactionAddKaro.md)
- [`$msgHatao`]($msgHatao.md)
- [`$jawabDo`]($jawabDo.md)
