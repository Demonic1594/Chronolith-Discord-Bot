# $setScheduledEventLocation

> Sets a location for the current scheduled event

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `event` | v2.6.0 | required | yes | — |

## Signature

```fs
$setScheduledEventLocation[location]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `location` | `String` | **yes** | no | The location of the scheduled event |

### Per-parameter notes

- **`location`** (`String`, required): The location of the scheduled event. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Event functions (re)schedule guild scheduled events and set their channel/location metadata.

`$setScheduledEventLocation` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setScheduledEventLocation[value]
```

## Reference implementation (source)

Taken from `src/native/event/setScheduledEventLocation.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.scheduledEvent.entityMetadata ??= {}
        ctx.scheduledEvent.entityMetadata.location = location
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createScheduledEvent`]($createScheduledEvent.md)
- [`$deleteScheduledEvent`]($deleteScheduledEvent.md)
- [`$editScheduledEvent`]($editScheduledEvent.md)
- [`$getScheduledEvent`]($getScheduledEvent.md)
- [`$setScheduledEventChannel`]($setScheduledEventChannel.md)

**Source:** [`src/native/event/setScheduledEventLocation.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/event/setScheduledEventLocation.ts)
