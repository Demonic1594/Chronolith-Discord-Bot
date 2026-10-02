/*
 *  * Chronolith click harness — fabricates ButtonInteractions against the
 *  * component router in THIS process (no gateway). Interaction payloads
 *  * (update/editReply) are captured instead of hitting the API.
 *  *
 *  *   node tests/click.js <customID> [moreIDs...]
 *  */
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");
const { ButtonInteraction } = require("discord.js");
require("dotenv").config();
process.on("unhandledRejection", (e) => console.error("[survived]", (e && (e.code || e.message || "")).toString().slice(0, 200)));

const GUILD_ID = process.env.TEST_GUILD;
const ACTOR_ID = process.env.TEST_AUTHOR;
const captured = [];
const EB = require("discord.js").EmbedBuilder;
const origSetDesc = EB.prototype.setDescription;
EB.prototype.setDescription = function (d) { console.log("[setDescription CALLED]: " + JSON.stringify(String(d).slice(0, 200))); return origSetDesc.call(this, d); };

ButtonInteraction.prototype.update = function (payload) {
    console.log("[update CALLED LIVE] embeds:", (payload.embeds || []).length, "components:", (payload.components || []).length, "content:", JSON.stringify((payload.content || "").slice(0, 40)));
    captured.push({ kind: "update", payload, stack: new Error().stack.split("\n").slice(1, 5).join(" | ") });
    return Promise.resolve({ id: "fake", editReply: async () => ({}), update: async () => ({}) });
};
ButtonInteraction.prototype.deferUpdate = function () {
    captured.push({ kind: "deferUpdate" });
    return Promise.resolve();
};
ButtonInteraction.prototype.reply = function (payload) {
    captured.push({ kind: "reply", payload });
    return Promise.resolve({});
};
ButtonInteraction.prototype.editReply = function (payload) {
    captured.push({ kind: "editReply", payload });
    return Promise.resolve({});
};

const client = new ForgeClient({
    extensions: [new ForgeDB({ type: "better-sqlite3" })],
    intents: ["Guilds", "GuildMembers", "GuildModeration", "GuildMessages", "MessageContent"],
    prefixes: ["%"], events: ["interactionCreate"]
});
const EVENTS_DIR = process.env.EVENTS_DIR || "events";
client.functions.load("functions");
client.commands.load(EVENTS_DIR);

(async () => {
    await client.login(process.env.BOT_TOKEN);
    await new Promise((r) => setTimeout(r, 4000));
    const GUILD_ID = (client.guilds.cache.first() || {}).id;
    const ACTOR_ID = GUILD_ID ? (client.guilds.cache.get(GUILD_ID) || {}).ownerId : null;
    const CH = GUILD_ID ? client.guilds.cache.get(GUILD_ID).channels.cache.find((c) => c.type === 0) : null;
    const CHANNEL_ID = CH ? CH.id : null;
    console.log(`guild=${GUILD_ID} owner=${ACTOR_ID} channel=${CHANNEL_ID}`);
    if (!GUILD_ID) process.exit(2);
    client.on("interactionCreate", (i) => console.log(`[raw listener] interaction arrived: ${i.customId}`));
    const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
    for (const cid of process.argv.slice(2)) {
        captured.length = 0;
        const ix = new ButtonInteraction(client, {
            id: `${Date.now()}99`, application_id: client.user.id, type: 3, version: 1,
            token: "fake-token", guild_id: GUILD_ID,
            channel_id: CHANNEL_ID, locale: "en-US", guild_locale: "en-US",
            data: { custom_id: cid, component_type: 2 },
            entitlements: [], authorizing_integration_owners: {}, context: 0, app_permissions: "8",
            message: {
                id: `${Date.now()}98`, channel_id: CHANNEL_ID, guild_id: GUILD_ID,
                author: { id: client.user.id, username: "Amatsu", discriminator: "0", bot: true },
                content: "", timestamp: new Date().toISOString(), tts: false, pinned: false, type: 0,
                embeds: [], attachments: [], components: [], mentions: []
            },
            user: { id: ACTOR_ID, username: "owner", discriminator: "0", bot: false },
            member: { user: { id: ACTOR_ID }, roles: [], joined_at: new Date().toISOString(), permissions: "8" }
        }, channel);
        client.emit("interactionCreate", ix);
        await new Promise((r) => setTimeout(r, 2500));
        console.log(`\n===== customID: ${cid} → ${captured.length} response(s) =====`);
        if (!captured.length) console.log("(no reply — handler never produced output)");
        for (const c of captured) {
            const p = c.payload || {};
            console.log(`--- ${c.kind} ---`);
            for (const e of p.embeds || []) {
                const d = e.data || e;
                console.log("author:", JSON.stringify(d.author));
                console.log("title:", JSON.stringify(d.title));
                console.log("desc:", (d.description || "").slice(0, 400));
                console.log("color:", d.color, "footer:", JSON.stringify(d.footer));
            }
            console.log("FULL PAYLOAD:", JSON.stringify(p, (k,v)=>v===undefined?null:v).slice(0,600)); console.log("stack:", c.stack);
            if (p.content) console.log("content:", String(p.content).slice(0, 300));
            if (!p.embeds && !p.components && !p.content) console.log(JSON.stringify(p).slice(0, 400));
        }
    }
    process.exit(0);
})().catch((e) => { console.error("harness error:", e); process.exit(2); });
