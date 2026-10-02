# Discord Utilities

> Community guide for `None` (none) — package **BotForge Developer API**. Approved 2026-07-24. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-291)

The Discord endpoint `/v1/discord` provides standard static lists and advanced calculations for Discord gateway intents, permissions, OAuth2 scopes, and gateway events. This helps developers easily check intents and permissions programmatically.

### 1. Retrieving Standard Metadata Lists
Retrieve the list of predefined Discord objects by specifying the `resource` query parameter.

**Endpoint:**
```http
GET /v1/discord?resource={resourceType} HTTP/1.1
Host: api.botforge.org
```

**Resource Choices:**
* `intents`: Returns standard Discord Gateway Intent flags with their bit values and privileged status.
* `permissions`: Returns Discord Permission bits grouped by category (e.g., General, Text, Voice).
* `scopes`: Returns standard Discord OAuth2 Scopes.
* `events`: Returns standard Discord Gateway events and their corresponding required Gateway Intent.

**Example Request:**
```http
GET /v1/discord?resource=permissions HTTP/1.1
Host: api.botforge.org
```

<div class="response-preview-embed my-6" data-200='{"success":true,"permissions":[{"category":"General Server Permissions","permissions":[{"name":"View Channel","value":"1024","description":"Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels"},{"name":"Manage Channels","value":"16","description":"Allows management and editing of channels"},{"name":"Manage Roles","value":"268435456","description":"Allows management and editing of roles"},{"name":"Manage Guild Expressions","value":"1073741824","description":"Allows for editing and deleting emojis, stickers, and soundboard sounds created by all users"},{"name":"Create Guild Expressions","value":"8796093022208","description":"Allows for creating emojis, stickers, and soundboard sounds, and editing and deleting those created by the current user"},{"name":"View Audit Log","value":"128","description":"Allows for viewing of audit logs"},{"name":"View Guild Insights","value":"524288","description":"Allows for viewing guild insights"},{"name":"View Creator Monetization Analytics","value":"2199023255552","description":"Allows for viewing role subscription insights"},{"name":"Manage Webhooks","value":"536870912","description":"Allows management and editing of webhooks"},{"name":"Manage Guild","value":"32","description":"Allows management and editing of the guild"}]},{"category":"Membership Permissions","permissions":[{"name":"Create Instant Invite","value":"1","description":"Allows creation of instant invites"},{"name":"Change Nickname","value":"67108864","description":"Allows for modification of own nickname"},{"name":"Manage Nicknames","value":"134217728","description":"Allows for modification of other users nicknames"},{"name":"Kick Members","value":"2","description":"Allows kicking members"},{"name":"Ban Members","value":"4","description":"Allows banning members"},{"name":"Moderate Members","value":"1099511627776","description":"Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels"}]},{"category":"Text Channel Permissions","permissions":[{"name":"Send Messages","value":"2048","description":"Allows for sending messages in a channel and creating threads in a forum (does not allow sending messages in threads)"},{"name":"Send Messages In Threads","value":"274877906944","description":"Allows for sending messages in threads"},{"name":"Create Public Threads","value":"34359738368","description":"Allows for creating public and announcement threads"},{"name":"Create Private Threads","value":"68719476736","description":"Allows for creating private threads"},{"name":"Manage Threads","value":"17179869184","description":"Allows for deleting and archiving threads, and viewing all private threads"},{"name":"Send Tts Messages","value":"4096","description":"Allows for sending of /tts messages"},{"name":"Manage Messages","value":"8192","description":"Allows for deletion of other users messages"},{"name":"Embed Links","value":"16384","description":"Links sent by users with this permission will be auto-embedded"},{"name":"Attach Files","value":"32768","description":"Allows for uploading images and files"},{"name":"Read Message History","value":"65536","description":"Allows for reading of message history"},{"name":"Mention Everyone","value":"131072","description":"Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel"},{"name":"Add Reactions","value":"64","description":"Allows for adding new reactions to messages. This permission does not apply to reacting with an existing reaction on a message."},{"name":"Use External Emojis","value":"262144","description":"Allows the usage of custom emojis from other servers"},{"name":"Use External Stickers","value":"137438953472","description":"Allows the usage of custom stickers from other servers"},{"name":"Send Voice Messages","value":"70368744177664","description":"Allows sending voice messages"},{"name":"Send Polls","value":"562949953421312","description":"Allows sending polls"},{"name":"Pin Messages","value":"2251799813685248","description":"Allows pinning and unpinning messages"},{"name":"Bypass Slowmode","value":"4503599627370496","description":"Allows bypassing slowmode restrictions"}]},{"category":"Voice Channel Permissions","permissions":[{"name":"Connect","value":"1048576","description":"Allows for joining of a voice channel"},{"name":"Speak","value":"2097152","description":"Allows for speaking in a voice channel"},{"name":"Stream","value":"512","description":"Allows the user to go live"},{"name":"Mute Members","value":"4194304","description":"Allows for muting members in a voice channel"},{"name":"Deafen Members","value":"8388608","description":"Allows for deafening of members in a voice channel"},{"name":"Move Members","value":"16777216","description":"Allows for moving of members between voice channels"},{"name":"Use Vad","value":"33554432","description":"Allows for using voice-activity-detection in a voice channel"},{"name":"Priority Speaker","value":"256","description":"Allows for using priority speaker in a voice channel"},{"name":"Use Soundboard","value":"4398046511104","description":"Allows for using soundboard in a voice channel"},{"name":"Use External Sounds","value":"35184372088832","description":"Allows the usage of custom soundboard sounds from other servers"},{"name":"Set Voice Channel Status","value":"281474976710656","description":"Allows setting voice channel status"}]},{"category":"Events Permissions","permissions":[{"name":"Manage Events","value":"8589934592","description":"Allows for editing and deleting scheduled events created by all users"},{"name":"Create Events","value":"17592186044416","description":"Allows for creating scheduled events, and editing and deleting those created by the current user"}]},{"category":"Stage Channel Permissions","permissions":[{"name":"Request To Speak","value":"4294967296","description":"Allows for requesting to speak in stage channels."}]},{"category":"Application Permissions","permissions":[{"name":"Use Application Commands","value":"2147483648","description":"Allows members to use application commands, including slash commands and context menu commands."},{"name":"Use Embedded Activities","value":"549755813888","description":"Allows for using Activities (applications with the EMBEDDED flag)"},{"name":"Use External Apps","value":"1125899906842624","description":"Allows user-installed apps to send public responses."}]},{"category":"Advanced Permissions","permissions":[{"name":"Administrator","value":"8","description":"Allows all permissions and bypasses channel permission overwrites"}]}]}' data-400='{"success":false,"error":"Invalid resource type."}' data-401='{"success":false,"error":"Invalid or missing API key."}' data-404='{"success":false,"error":"Discord resource not found."}'></div>

---

### 2. Advanced Calculators
You can perform bitwise calculations and metadata analysis using `resource=calculate` alongside specific parameters:

#### A. Evaluate Permissions by Integer Value
Pass a permissions bit field integer to see which specific permissions are granted.
* **Parameter:** `permissions` (String representation of a bitwise integer)

**Example Request:**
```http
GET /v1/discord?resource=calculate&permissions=8 HTTP/1.1
Host: api.botforge.org
```

<div class="response-preview-embed my-6" data-200='{"success":true,"input_value":"8","is_administrator":true,"total_granted":45,"granted_permissions":["Create Instant Invite","Kick Members","Ban Members","Administrator","Manage Channels","Manage Guild","Add Reactions","View Audit Log","Priority Speaker","Stream","View Channel","Send Messages","Send Tts Messages","Manage Messages","Embed Links","Attach Files","Read Message History","Mention Everyone","Use External Emojis","View Guild Insights","Connect","Speak","Mute Members","Deafen Members","Move Members","Use Vad","Change Nickname","Manage Nicknames","Manage Roles","Manage Webhooks","Request To Speak","Manage Events","Use Application Commands","Use Embedded Activities","Moderate Members","Manage Threads","Create Public Threads","Create Private Threads","Use External Stickers","Manage Guild Expressions","Use Soundboard","Use External Sounds","Send Voice Messages","Create Events","View Creator Monetization Analytics"],"granted_by_category":{"Advanced Permissions":[{"name":"Administrator","description":"Allows all permissions and bypasses channel permission overwrites","value":"8"}]}}' data-400='{"success":false,"error":"Invalid permissions value."}' data-401='{"success":false,"error":"Invalid or missing API key."}' data-404='{"success":false,"error":"Discord resource not found."}'></div>

#### B. Calculate Permissions Integer from Names
Pass a comma-separated list of permission names to compute the resulting bitwise permission integer.
* **Parameter:** `permission_names` (Comma-separated permission names)

**Example Request:**
```http
GET /v1/discord?resource=calculate&permission_names=View Channel,Send Messages HTTP/1.1
Host: api.botforge.org
```

<div class="response-preview-embed my-6" data-200='{"success":true,"calculated_value":"3072","matched_names":["View Channel","Send Messages"],"unmatched_names":[]}' data-400='{"success":false,"error":"Missing calculator parameters."}' data-401='{"success":false,"error":"Invalid or missing API key."}' data-404='{"success":false,"error":"Discord resource not found."}'></div>

#### C. Calculate Required Gateway Intents from Gateway Events
Pass a comma-separated list of Discord gateway events to identify which Gateway Intents must be enabled in your bot configuration (and if any of them are privileged).
* **Parameter:** `events` (Comma-separated event names)

**Example Request:**
```http
GET /v1/discord?resource=calculate&events=MessageCreate,GuildMemberAdd HTTP/1.1
Host: api.botforge.org
```

<div class="response-preview-embed my-6" data-200='{"success":true,"matched_events":["MessageCreate","GuildMemberAdd"],"unmatched_events":[],"required_intents":["GuildMessages","DirectMessages","GuildMembers"],"has_privileged_intents":true,"privileged_intents":["GuildMembers"]}' data-400='{"success":false,"error":"Missing calculator parameters."}' data-401='{"success":false,"error":"Invalid or missing API key."}' data-404='{"success":false,"error":"Discord resource not found."}'></div>

#### D. Calculate Events Received from Gateway Intents
Pass a bitwise integer or a comma-separated list of intent names to calculate which Gateway Events your client will receive.
* **Parameters:** `intents` (Bitwise integer) OR `intent_names` (Comma-separated names)

**Example Request (using `intent_names`):**
```http
GET /v1/discord?resource=calculate&intent_names=Guilds,GuildMembers HTTP/1.1
Host: api.botforge.org
```

<div class="response-preview-embed my-6" data-200='{"success":true,"active_intents":["Guilds","GuildMembers"],"total_received_events":11,"received_events":["Ready","GuildCreate","GuildUpdate","GuildDelete","ChannelCreate","ChannelUpdate","ChannelDelete","GuildMemberAdd","GuildMemberUpdate","GuildMemberRemove","InteractionCreate"]}' data-400='{"success":false,"error":"Invalid intents value."}' data-401='{"success":false,"error":"Invalid or missing API key."}' data-404='{"success":false,"error":"Discord resource not found."}'></div>
