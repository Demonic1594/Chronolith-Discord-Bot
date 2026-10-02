# $try guide

> Community guide for `$try` (function) — package **ForgeScript**. Approved 2025-06-27. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-178)

`$try[]` runs code and handles possible errors gracefully.

**Syntax:**  
```fs
$try[code;catch code;error variable?]
```

- `code` — the code to attempt to run  
- `catch code` — code to run if an error occurs  
- `error variable?` — optional variable name to store the error message

**Example:**  
```fs
$try[$userAvatar[3747747474783];$sendMessage[$channelID;Caught error: $env[err]];err]
```

If the user ID is invalid, it catches the error and sends the error message.

Use this to prevent your bot from crashing on unexpected errors.
