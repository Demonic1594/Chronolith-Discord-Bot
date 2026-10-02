# $botToken guide

> Community guide for `$botToken` (function) — package **ForgeScript**. Approved 2025-06-15. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-81)

This is definitely a function you don't want anyone using except yourself. It returns your Bot's Token.

You are the only person that should know your Bot's Token. Only trusted development team members should ever have access, and only if it's absolutely necessary.

So what can someone do with your Bot Token if they get it?
Anything you can do. No restrictions.

They can:
- Log in as your bot
- Send messages as your bot
- Ban or kick users
- Spam servers
- Delete channels
- Join or leave servers
- Abuse any admin permissions your bot has

Basically, they can take full control of your bot and destroy everything it's connected to. All of this will appear as if your bot is doing it, not them.

If your token gets leaked or exposed, your bot is compromised. You need to reset it immediately through:
https://discord.com/developers/applications

1. Never $log your token to the console.
2. Never upload it to GitHub, or anywhere else.
3. Never screenshot it.
4. Never send it over Discord messages.

Treat your token like a root password. If someone else has it, you lose everything.
