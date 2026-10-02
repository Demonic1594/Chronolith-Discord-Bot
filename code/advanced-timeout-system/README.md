# This system ensures your timeouts continue to run even after a bot restart, accurately accounting for lost time.

## Setup & Requirements
### 1. Prerequisites
- *The `clientReady` event must be included in your index file (required to resume stored timeouts).*
- *`ForgeDB` package must be installed and initialized for persistent storage.*

### 2. File Configuration
- **Add the following files to your project:**
> **[baseTimeoutFunctions.js](<https://pastefy.app/2UGEC0Ww>): Contains all custom functions (including system function): `$advancedTimeout`, `$stopAdvancedTimeout`, `$advancedTimeoutExists`, `$timeoutRawData`.**
> **[timeoutsHandler.js](<https://pastefy.app/72n9ziKA>): Contains the handler to resume timeouts after restart. Uses `clientReady` event.**

- **Optional:**
> **[timeoutCommands.js](<https://pastefy.app/qPf3vLVk>): Contains all management commands and interactions: `timeoutslist`, `stopalltimeouts`.**
> **[embedTimeoutFunctions.js](<https://pastefy.app/rzAjcOzF]): Contains all functions for management commands: `$displayTimeoutsListContainer`, `$generateTimeoutListPages`.**
## How to Use
### Syntax:
```Bash
$advancedTimeout[$escapeCode[code];time;id;data?]
```
### Explanation:
> `code` - The code to execute. Must be inside the `$escapeCode` function.
> `time` - How long to wait for before running this code. Bypasses the 32-bit limit.
> `id` - A unique ID for this timeout.
> `data?` - The data to include in the code in JSON format.
### Example:
```bash
$!advancedTimeout[$esc[
  $sendMessage[{channel};{content}]
];1m;sendHi;{"channel": "$channelID", "content": "Hi!"}]
```

> **The function will return boolean value based on the successful execution**
## Why use `$escapeCode[]`?
> *Custom functions cannot naturally delay the execution of other functions passed as arguments. Without `$escapeCode[]` (or `$esc[]`), your code would run immediately instead of waiting. The escape function 'freezes' the code, turning it into a string format so that it can be stored in a database and executed later.*
## The Power of JSON Data
> *Since bots can't get `$authorID`, `$channelID` or similar functions after a restart (in the `clientReady` event), we store them as JSON data.*
> *Placeholders like `{channel}` inside your `$esc[]` block are automatically replaced by the values provided in the `data` field.*
## Stopping a Timeout
### To cancel a timeout early, simply use:
> **`$stopAdvancedTimeout[id]` — This will remove the timeout from the database and return true if successful.**
