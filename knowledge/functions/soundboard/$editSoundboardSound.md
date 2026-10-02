# $editSoundboardSound

> Edits given soundboard sound, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `soundboard` | v2.4.0 | required | yes | `Boolean` |

## Signature

```fs
$editSoundboardSound[guild ID;sound ID;name;emoji;volume;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to edit soundboard sound on |
| 2 | `sound ID` | `SoundboardSound` | **yes** | no | The soundboard sound to edit |
| 3 | `name` | `String` | no | no | The new name for the sound |
| 4 | `emoji` | `String` | no | no | The new emoji for the sound |
| 5 | `volume` | `Number` | no | no | The new volume for the sound (from 0 to 1) |
| 6 | `reason` | `String` | no | no | The reason for editing the sound |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to edit soundboard sound on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`sound ID`** (`SoundboardSound`, required): The soundboard sound to edit. Expects a soundboard sound ID. Fetched from the pointer guild's soundboardSounds manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`name`** (`String`, optional): The new name for the sound. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emoji`** (`String`, optional): The new emoji for the sound. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`volume`** (`Number`, optional): The new volume for the sound (from 0 to 1). Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`reason`** (`String`, optional): The reason for editing the sound. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Soundboard functions manage Discord soundboard sounds.

`$editSoundboardSound` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editSoundboardSound[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editSoundboardSound[123456789012345678;123456789012345678;name;:smile:;5;value]
```

## Reference implementation (source)

Taken from `src/native/soundboard/editSoundboardSound.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const parsed = parseSingleEmoji(ctx, emoji)
        const value = emoji === "" ? null : undefined

        return this.success(!!(await sound.edit({
            name: name || undefined,
            emojiId: parsed?.id || value,
            emojiName: parsed?.id ? null : parsed?.name || value,
            volume: typeof(volume) === "number" ? volume : undefined,
            reason: reason || ctx.reason
        }).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`, `emoji`, `volume`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createSoundboardSound`]($createSoundboardSound.md)
- [`$deleteSoundboardSounds`]($deleteSoundboardSounds.md)
- [`$getSoundboardSound`]($getSoundboardSound.md)
- [`$soundAvailable`]($soundAvailable.md)
- [`$soundCreatedAt`]($soundCreatedAt.md)
- [`$soundEmoji`]($soundEmoji.md)
- [`$soundGuildID`]($soundGuildID.md)
- [`$soundID`]($soundID.md)

**Source:** [`src/native/soundboard/editSoundboardSound.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/soundboard/editSoundboardSound.ts)
