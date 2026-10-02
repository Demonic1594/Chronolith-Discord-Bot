# $botDestroy guide

> Community guide for `$botDestroy` (function) — package **ForgeScript**. Approved 2025-06-15. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-80)

To put it simply, **$botDestroy** turns your bot off by destroying the Discord.js client.
It's not a toggle, it's a hard disconnect. To turn it back on you need to restart it manually from wherever you normally launch it.

So, in short, destroying your Discord.js client means it disconnects your bot from Discord, goes offline, stops listening to events, and won’t respond to anything till you restart it.

**Clarifications**
1. You can't "turn it back on" from within Discord or the script after $botDestroy is run, you have to restart your host.
2. It does not kill the Node.js process (unless you explicitly code it to exit after).
3. Once $botDestroy is run, the bot is dead until you manually restart it.
4. You won’t lose any files by doing this, it just stops the bot, it doesn’t delete anything.
