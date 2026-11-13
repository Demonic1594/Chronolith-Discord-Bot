"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const handlers_1 = require("../handlers");
const structures_1 = require("../structures");
const __1 = require("..");
const error_1 = require("../functions/error");
const noop_1 = __importDefault(require("../functions/noop"));
exports.default = new handlers_1.GiveawaysEventHandler({
    name: "giveawayStart",
    version: "1.0.0",
    description: "This event is fired when a giveaway has started. With default messages disabled it must $return the ID of the giveaway message it sent",
    listener: async function (gw) {
        const client = this.getExtension(__1.ForgeGiveaways, true);
        const manager = client.giveawaysManager;
        const commands = client.commands.get("giveawayStart");
        const custom = !client.options.useDefault;
        if (custom && commands.length !== 1) {
            await manager.discard(gw.id).catch(noop_1.default);
            throw new Error(commands.length ? error_1.GiveawaysErrorType.MultipleStartEvents : error_1.GiveawaysErrorType.MissingStartEvent);
        }
        if (!commands.length)
            return;
        const command = commands[0];
        const ctx = new structures_1.Context({
            obj: gw,
            command,
            client: this,
            states: { giveaway: { new: gw } },
            data: command.compiled.code,
            allowTopLevelReturn: true,
        });
        const result = await Promise.resolve(forgescript_1.Interpreter.run(ctx)).catch(noop_1.default);
        if (!custom)
            return;
        const msg = await manager.fetchMessage(gw.channelID, typeof result === "string" ? result.trim() : undefined);
        if (msg) {
            await manager.attachMessage(gw.id, msg.id);
        }
        else {
            (0, error_1.throwGiveawaysError)(error_1.GiveawaysErrorType.MessageNotDetermined, gw.id);
            await manager.discard(gw.id);
        }
    },
});
//# sourceMappingURL=giveawayStart.js.map