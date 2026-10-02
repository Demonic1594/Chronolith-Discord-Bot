# $setScheduledEventChannel

> Sets a channel for the current scheduled event

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `event` | v2.6.0 | required | yes | — |

## Signature

```fs
$setScheduledEventChannel[channel ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The voice channel of the scheduled event |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The voice channel of the scheduled event. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Event functions (re)schedule guild scheduled events and set their channel/location metadata.

`$setScheduledEventChannel` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setScheduledEventChannel[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/event/setScheduledEventChannel.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.scheduledEvent.channel = channel as VoiceBasedChannel
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createScheduledEvent`]($createScheduledEvent.md)
- [`$deleteScheduledEvent`]($deleteScheduledEvent.md)
- [`$editScheduledEvent`]($editScheduledEvent.md)
- [`$getScheduledEvent`]($getScheduledEvent.md)
- [`$setScheduledEventLocation`]($setScheduledEventLocation.md)

**Source:** [`src/native/event/setScheduledEventChannel.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/event/setScheduledEventChannel.ts)
