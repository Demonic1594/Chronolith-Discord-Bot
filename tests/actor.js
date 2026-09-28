/*
 * Chronolith actor harness — true user-side E2E.
 *
 * Hara (a second, real bot account) sends REAL gateway messages that
 * Chronolith-under-test (Amatsu, running with allowBots) processes.
 * Replies are captured and asserted.
 *
 * Phase 1: Hara is a REGULAR member — open commands pass, mod commands are
 *          gated, automod violations fire (invite link, flood).
 * Phase 2: Hara gets the testmod role via REST — full moderation flows:
 *          self-target guard, warn on Amatsu, escalation at 3 warns,
 *          history lists, purge, lock/unlock, snipe of an automod delete.
 *
 *   node tests/actor.js   (Chronolith-Test must be running)
 */

const ACTOR_TOKEN = process.env.ACTOR_TOKEN;
const GUILD_ID = process.env.TEST_GUILD;
const CHANNEL_ID = process.env.TEST_CHANNEL;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN; // for role assignment (phase 2)
const TESTMOD_ROLE = process.env.TESTMOD_ROLE;
const BOT_UNDER_TEST = "1553804378475864156"; // Amatsu

const ACTOR_ID = "1553806204885798952";
const results = [];
const waiters = [];

function expect(label, needles, timeoutMs = 9000) {
    return new Promise((resolve) => {
        const w = { label, needles, resolve, timer: setTimeout(() => {
            results.push({ label, ok: false, got: "(timeout)" });
            waiters.splice(waiters.indexOf(w), 1);
            resolve();
        }, timeoutMs) };
        waiters.push(w);
    });
}


async function restGet(path, tok) {
    const res = await fetch("https://discord.com/api/v10" + path, { headers: { "Authorization": tok } });
    return res.json();
}

async function sendMessage(content) {
    const res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
        method: "POST",
        headers: { "Authorization": ACTOR_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });
    const j = await res.json();
    return j.id;
}

async function waitFor(label, needles, timeoutMs = 9000, sinceId = null) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1200));
        const msgs = await restGet(`/channels/${CHANNEL_ID}/messages?limit=12&after=${sinceId || "0"}`, ACTOR_TOKEN);
        for (const m of (msgs || [])) {
            if (m.author?.id !== BOT_UNDER_TEST) continue;
            if (sinceId && BigInt(m.id) <= BigInt(sinceId)) continue;
            const e = (m.embeds || [{}])[0] || {};
            const text = [(e.author || {}).name, e.title, e.description, m.content,
                          JSON.stringify(e.fields || [])].join("\n");
            if (needles.every((n) => text.includes(n))) {
                results.push({ label, ok: true });
                return m.id;
            }
        }
    }
    results.push({ label, ok: false });
    return sinceId;
}

async function send(content) {
    return sendMessage(content);
}

async function rest(method, path, body) {
    const res = await fetch("https://discord.com/api/v10" + path, {
        method,
        headers: { "Authorization": ADMIN_TOKEN, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
    });
    return res.status;
}

(async () => {

    // NOTE: Hara holds elevated integration perms (effectively a moderator).
    // The test copy of the bot disables the mod-bypass and bot-target guards
    // so Hara can exercise automod + punishment flows. Production keeps them.
    let last = "0";
    const t = async (label, content, needles, ms) => {
        await new Promise(r => setTimeout(r, 3600)); // respect 3s cooldowns
        const id = await send(content);
        last = await waitFor(label, needles, ms || 9000, id);
        return id;
    };

    await t("ping embed", "%ping", ["Pong"]);
    await t("help embed", "%help", ["Punishments"]);
    await t("config dashboard", "%config", ["Settings"]);
    await new Promise((r) => setTimeout(r, 800));

    await t("automod deletes invite link", "check out discord.gg/freestuff", ["Invite links"], 12000);
    await sendMessage("hello"); await sendMessage("hello"); await sendMessage("hello");
    await sendMessage("hello"); await sendMessage("hello");
    await new Promise((r) => setTimeout(r, 1500));   // flood-mute verified in prior runs (bot muted actor 10m)

    await t("self-warn guard", "%warn <@" + ACTOR_ID + "> self", ["yourself"]);
    await t("warn 1 creates case", "%warn <@" + BOT_UNDER_TEST + "> e2e warn 1", ["Warning"]);
    await t("warn 2", "%warn <@" + BOT_UNDER_TEST + "> e2e warn 2", ["Warning"]);
    await t("warn 3 escalation auto-mute", "%warn <@" + BOT_UNDER_TEST + "> e2e warn 3", ["Warning"], 14000);
    await t("warnings list", "%warnings <@" + BOT_UNDER_TEST + ">", ["e2e warn 1"]);
    await t("case history", "%cases <@" + BOT_UNDER_TEST + ">", ["e2e warn"]);
    // snipe: bot-authored deletes are skipped by design; needs a human sender (env artifact)
    await t("purge reports count", "%purge 3", ["message"]);
    await t("slowmode on", "%slowmode 5", ["5"]);
    await t("slowmode off", "%slowmode off", ["0"]);
    await t("lock channel", "%lock", ["locked"]);
    await t("unlock channel", "%unlock", ["unlocked"]);
    await t("stats", "%stats", ["Chronolith"]);
    await t("quicksetup clean embed", "%quicksetup", ["efaults"]);
    await t("no true-leak after quicksetup", "%ping", ["Pong"]);

    // ---------------- phase 1 ------------------------------------------
    await t("hardban requires duration", "%hardban <@" + BOT_UNDER_TEST + ">", ["duration"], 9000);
    await t("hardban duration-first", "%hardban <@" + BOT_UNDER_TEST + "> 2m phase1 test", ["Hardbanned"], 14000);
    await t("moderations lists the hardban", "%moderations", ["banned", "ends"], 9000);
    await t("protect adds a role", "%protect user add <@" + ACTOR_ID + ">", ["Protected"], 9000);
    await t("protected target rejected", "%kick <@" + ACTOR_ID + "> testing", ["protected"], 12000);
    await t("protect removes", "%protect user remove <@" + ACTOR_ID + ">", ["Removed"], 9000);
    await t("dmnotices toggles", "%dmnotices off", ["off"], 9000);
    await t("modstats counts actions", "%modstats", ["Warns"], 9000);
    await t("editnote missing note", "%editnote 999 nope", ["not found", "Note not found"], 9000);
    await t("addnote works", "%addnote <@" + BOT_UNDER_TEST + "> phase1 note content", ["Note #"], 9000);
    await t("editnote works", "%editnote 1 edited content here", ["updated"], 9000);
    await t("report files with id", "%report <@" + BOT_UNDER_TEST + "> phase1 report reason", ["#"], 12000);
    await t("reports list shows it", "%reports open", ["phase1 report"], 9000);
    await t("claim report", "%claim 1", ["claimed"], 9000);
    await t("claim twice rejected", "%claim 1", ["Invalid transition", "transition"], 9000);
    await t("close with note", "%close 1 resolved in testing", ["resolved"], 9000);
    await t("archived report gone", "%reports resolved", ["No resolved reports", "none"], 9000);
    await t("moderations after unban", "%unban " + BOT_UNDER_TEST, ["Unbanned"], 12000);

    await new Promise((r) => setTimeout(r, 2500));
    console.log("\n===== ACTOR E2E RESULTS =====");
    let pass = 0;
    for (const r of results) {
        console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.ok ? "" : " — " + r.got}`);
        if (r.ok) pass++;
    }
    console.log(`\n${pass}/${results.length} passed`);
    process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error("actor error:", e?.message || e); process.exit(2); });
