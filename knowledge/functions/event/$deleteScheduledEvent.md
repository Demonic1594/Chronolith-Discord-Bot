# $deleteScheduledEvent

> Deletes a scheduled event from a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `event` | v2.6.0 | required | yes | `Boolean` |

## Signature

```fs
$deleteScheduledEvent[guild ID;event ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to delete scheduled event from |
| 2 | `event ID` | `ScheduledEvent` | **yes** | no | The scheduled event to delete |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to delete scheduled event from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`event ID`** (`ScheduledEvent`, required): The scheduled event to delete. Expects a scheduled event ID. Fetched from the pointer guild's scheduledEvents manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Event functions (re)schedule guild scheduled events and set their channel/location metadata.

`$deleteScheduledEvent` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteScheduledEvent[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/event/deleteScheduledEvent.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            await event.delete()
        } catch (error) {
            ctx.noop(error)
            return this.success(false)
        }

        return this.success(true)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createScheduledEvent`]($createScheduledEvent.md)
- [`$editScheduledEvent`]($editScheduledEvent.md)
- [`$getScheduledEvent`]($getScheduledEvent.md)
- [`$setScheduledEventChannel`]($setScheduledEventChannel.md)
- [`$setScheduledEventLocation`]($setScheduledEventLocation.md)

**Source:** [`src/native/event/deleteScheduledEvent.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/event/deleteScheduledEvent.ts)
