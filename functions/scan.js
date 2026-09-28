/*
 * Chronolith engine — history scanner for filtered purges.
 *
 * $scanMessages[channel;limit]
 *   Returns a JSON array (newest first), capped at `limit`, of
 *   { i: id, a: authorID, c: content, b: bot, p: pinned, e: embeds,
 *     t: attachments, n: mentionCount }
 *
 * SECURITY: the djsEval body only interpolates a validated channel ID and a
 * numeric limit — both internally generated. No user text ever reaches it.
 * (There is no native bulk-history fetch; production bots bridge for this —
 * see the amc audit.) Semicolons inside the eval body are escaped (\;)
 * so they don't split the argument.
 */

module.exports = [
    {
        name: "scanMessages",
        params: ["channel", "limit"],
        code: `
            $return[$djsEval[const ch = ctx.client.channels.cache.get("$env[channel]")\\; if (!ch) return "[]"\\; const ms = await ch.messages.fetch({ limit: Math.min($env[limit], 100) })\\; JSON.stringify(ms.map(m => ({ i: m.id, a: m.author.id, c: (m.content || ""), b: m.author.bot, p: m.pinned, e: m.embeds.length, t: m.attachments.size, n: m.mentions.users.size + m.mentions.roles.size })))]]
        `
    }
];
