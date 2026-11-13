"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeGiveaways = void 0;
const forgescript_1 = require("@tryforge/forgescript");
const discord_js_1 = require("discord.js");
const managers_1 = require("./managers");
const handlers_1 = require("./handlers");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const structures_1 = require("./structures");
const error_1 = require("./functions/error");
const noop_1 = __importDefault(require("./functions/noop"));
const package_json_1 = require("../package.json");
class ForgeGiveaways extends forgescript_1.ForgeExtension {
    options;
    name = "forge.giveaways";
    description = package_json_1.description;
    version = package_json_1.version;
    requireExtensions = ["forge.db"];
    emitter = new tiny_typed_emitter_1.TypedEmitter();
    giveawaysManager;
    commands;
    constructor(options = {}) {
        super();
        this.options = options;
        const o = this.options;
        o.useDefault ??= true;
        o.useReactions ??= false;
        o.emoji ||= "🎉";
        o.buttonLabel ||= "Join";
        o.buttonStyle ??= discord_js_1.ButtonStyle.Success;
        o.showEntryCount ??= true;
        o.dmWinners ??= false;
        o.entryFlushDelay = Math.max(0, o.entryFlushDelay ?? 1000);
        o.messageUpdateDelay = Math.max(1000, o.messageUpdateDelay ?? 5000);
        o.handleSignals ??= true;
        o.colors = { active: "Green", paused: "Yellow", ended: "Red", cancelled: "Grey", ...o.colors };
        o.messages = { ...structures_1.DEFAULT_MESSAGES, ...o.messages };
    }
    async init(client) {
        this.commands = new managers_1.GiveawaysCommandManager(client);
        forgescript_1.EventManager.load("ForgeGiveawaysEvents", __dirname + "/events");
        this.load(__dirname + "/native");
        if (this.options.useReactions) {
            new handlers_1.GiveawaysReactionHandler(client);
            if (!client.options.intents.has("GuildMessageReactions")) {
                forgescript_1.Logger.warn(`[ForgeGiveaways] Intent "GuildMessageReactions" must be defined for reactions to function`);
            }
        }
        else {
            new handlers_1.GiveawaysInteractionHandler(client);
        }
        if (this.options.events?.length)
            client.events.load("ForgeGiveawaysEvents", this.options.events);
        if (!this.options.useDefault && !this.options.events?.includes("giveawayStart")) {
            throw new Error(error_1.GiveawaysErrorType.MissingStartEvent);
        }
        // The manager exists right away; its methods wait for the database.
        this.giveawaysManager = new managers_1.GiveawaysManager(client, this);
        if (this.options.handleSignals)
            this.#handleSignals();
        await new structures_1.Database(this.emitter).init();
        this.giveawaysManager._onDatabaseReady();
    }
    #handleSignals() {
        for (const signal of ["SIGINT", "SIGTERM"]) {
            process.once(signal, () => {
                this.giveawaysManager.destroy().catch(noop_1.default).finally(() => {
                    // Re-raise with the default handler unless someone else handles it.
                    if (process.listenerCount(signal) === 0)
                        process.kill(process.pid, signal);
                });
            });
        }
    }
}
exports.ForgeGiveaways = ForgeGiveaways;
__exportStar(require("./handlers"), exports);
__exportStar(require("./managers"), exports);
__exportStar(require("./structures"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map