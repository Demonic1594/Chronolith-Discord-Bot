# $discriminator guide

> Community guide for `$discriminator` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-111)

`$discriminator[...]` returns the **discriminator** (the 4-digit tag like `#1234`) of a user.

⚠️ As of March 2024, **Discord removed discriminators**, so $discriminator will return `0` for all users now, however $discriminator is still useful to check bot's discriminators, as those still exist.

### Example:

`$discriminator[947382910238192661]`  
→ Returns the discriminator of that user ID, for bots it returns the 4-digit discriminator, for users it will just return 0.

This function is mostly for legacy compatibility.
