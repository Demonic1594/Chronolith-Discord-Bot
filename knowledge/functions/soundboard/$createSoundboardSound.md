# $createSoundboardSound

> Creates a new soundboard sound, returns sound id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `soundboard` | v2.4.0 | required | yes | `SoundboardSound` |

## Signature

```fs
$createSoundboardSound[guild ID;name;file;emoji;volume;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to create soundboard sound on |
| 2 | `name` | `String` | **yes** | no | The name for the sound |
| 3 | `file` | `String` | **yes** | no | The file for the sound |
| 4 | `emoji` | `String` | no | no | The emoji for the sound |
| 5 | `volume` | `Number` | no | no | The volume for the sound (from 0 to 1) |
| 6 | `reason` | `String` | no | no | The reason for creating the sound |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to create soundboard sound on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`name`** (`String`, required): The name for the sound. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`file`** (`String`, required): The file for the sound. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emoji`** (`String`, optional): The emoji for the sound. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`volume`** (`Number`, optional): The volume for the sound (from 0 to 1). Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`reason`** (`String`, optional): The reason for creating the sound. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Soundboard functions manage Discord soundboard sounds.

`$createSoundboardSound` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createSoundboardSound[123456789012345678;name;value]
```

**Full form (all arguments)**

```fs
$createSoundboardSound[123456789012345678;name;value;:smile:;5;value]
```

## Reference implementation (source)

Taken from `src/native/soundboard/createSoundboardSound.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const parsed = parseSingleEmoji(ctx, emoji)

        let soundFile
        try {
            soundFile = readFileSync(file)
        } catch {
            soundFile = file
        }

        const sound = await guild.soundboardSounds.create({
            name,
            file: soundFile,
            emojiId: parsed?.id || undefined,
            emojiName: parsed?.id ? undefined : parsed?.name || undefined,
            volume: typeof(volume) === "number" ? volume : undefined,
            reason: reason || ctx.reason
        }).catch(ctx.noop)

        return this.success(sound?.soundId)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`emoji`, `volume`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteSoundboardSounds`]($deleteSoundboardSounds.md)
- [`$editSoundboardSound`]($editSoundboardSound.md)
- [`$getSoundboardSound`]($getSoundboardSound.md)
- [`$soundAvailable`]($soundAvailable.md)
- [`$soundCreatedAt`]($soundCreatedAt.md)
- [`$soundEmoji`]($soundEmoji.md)
- [`$soundGuildID`]($soundGuildID.md)
- [`$soundID`]($soundID.md)

**Source:** [`src/native/soundboard/createSoundboardSound.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/soundboard/createSoundboardSound.ts)
