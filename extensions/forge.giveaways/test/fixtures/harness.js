"use strict"
/*
 * Boots a real ForgeClient (never logs in) with ForgeDB on better-sqlite3 and
 * ForgeGiveaways, and swaps the three Discord lookups the manager makes for
 * in-memory fakes. Everything else (scheduler, locking, persistence, the
 * renderer, winner drawing) is the real code.
 */
const path = require("path")
const { SnowflakeUtil } = require("discord.js")
const { ForgeClient } = require("@tryforge/forgescript")
const { ForgeDB } = require("@tryforge/forge.db")
const { ForgeGiveaways } = require("../..")

const DAY = 864e5
const snow = (agoMs = 2 * 365 * DAY) => SnowflakeUtil.generate({ timestamp: Date.now() - agoMs }).toString()

async function boot(dir, options = {}) {
    const giveaways = new ForgeGiveaways({ handleSignals: false, entryFlushDelay: 50, messageUpdateDelay: 1000, ...options })
    const client = new ForgeClient({
        intents: ["Guilds"],
        extensions: [giveaways, new ForgeDB({ type: "better-sqlite3", folder: dir })],
    })
    const manager = giveaways.giveawaysManager
    // Never logs in; pretend to be connected so deadlines are not postponed.
    client.isReady = () => true
    await manager.whenReady()

    const sent = []
    let nextMsg = 0
    const messages = new Map()
    const makeMessage = (payload) => {
        const id = snow(0).slice(0, -3) + String(100 + nextMsg++)
        const msg = {
            id,
            payloads: [payload],
            channel: channel,
            edit: async (p) => { msg.payloads.push(p); return msg },
            reply: async (p) => { sent.push({ replyTo: id, ...p }); return makeMessage(p) },
            react: async () => {},
        }
        messages.set(id, msg)
        return msg
    }
    const channel = {
        id: "200000000000000000",
        isTextBased: () => true,
        send: async (p) => { sent.push(p); return makeMessage(p) },
    }

    const members = new Map()
    const guild = {
        id: "300000000000000000",
        name: "Test Guild",
        members: {
            cache: new Map(),
            fetch: async (arg) => {
                if (typeof arg === "string") {
                    const m = members.get(arg)
                    if (!m) throw new Error("Unknown Member")
                    return m
                }
                const out = new Map()
                for (const id of arg.user) if (members.has(id)) out.set(id, members.get(id))
                return out
            },
        },
    }
    // Plain objects are accepted by requirementDenyReason (API member shape).
    const addMember = (id, roles = []) => {
        const m = { id, user: { id }, roles, joined_at: new Date(Date.now() - 365 * DAY).toISOString() }
        members.set(id, m)
        return m
    }

    manager.getChannel = async () => channel
    manager.getGuild = async () => guild
    manager.fetchMessage = async (_c, id) => messages.get(id)

    return { client, giveaways, manager, sent, messages, addMember, members, guild, channel, dir }
}

module.exports = { boot, snow, DAY, dbFile: (dir) => path.join(dir, "giveaways.db") }
