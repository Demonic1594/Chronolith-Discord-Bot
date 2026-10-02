# $deleteSoundboardSounds

> Deletes given soundboard sounds, returns the count of sounds deleted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `soundboard` | v2.4.0 | required | yes | `Number` |

> aliases: $deleteSoundboardSound

## Signature

```fs
$deleteSoundboardSounds[guild ID;sounds]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to delete soundboard sounds from |
| 2 | `sounds` | `SoundboardSound` | **yes** | yes | The soundboard sounds to delete |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to delete soundboard sounds from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`sounds`** (`SoundboardSound` , rest, required): The soundboard sounds to delete. Expects a soundboard sound ID. Fetched from the pointer guild's soundboardSounds manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Soundboard functions manage Discord soundboard sounds.

`$deleteSoundboardSounds` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `sounds` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$deleteSoundboardSounds[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/soundboard/deleteSoundboardSounds.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        let count = 0
        for (let i = 0, len = sounds.length; i < len; i++) {
            const sound = sounds[i]
            const success = await sound.delete(ctx.reason).then(x => true).catch(ctx.noop)
            if (success) count++
        }

        return this.success(count)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$deleteSoundboardSound` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createSoundboardSound`]($createSoundboardSound.md)
- [`$editSoundboardSound`]($editSoundboardSound.md)
- [`$getSoundboardSound`]($getSoundboardSound.md)
- [`$soundAvailable`]($soundAvailable.md)
- [`$soundCreatedAt`]($soundCreatedAt.md)
- [`$soundEmoji`]($soundEmoji.md)
- [`$soundGuildID`]($soundGuildID.md)
- [`$soundID`]($soundID.md)

**Source:** [`src/native/soundboard/deleteSoundboardSounds.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/soundboard/deleteSoundboardSounds.ts)
