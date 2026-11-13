"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runEvent;
const forgescript_1 = require("@tryforge/forgescript");
const __1 = require("..");
const Context_1 = require("../structures/Context");
const noop_1 = __importDefault(require("./noop"));
/**
 * Runs every command registered for a giveaway event. A failing command is
 * logged and does not stop the others.
 */
function runEvent(client, name, obj, states) {
    const commands = client.getExtension(__1.ForgeGiveaways, true).commands.get(name);
    for (const command of commands) {
        const ctx = new Context_1.Context({ obj, command, client, states, data: command.compiled.code });
        Promise.resolve(forgescript_1.Interpreter.run(ctx)).catch(noop_1.default);
    }
}
//# sourceMappingURL=runEvent.js.map