"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = require("../handlers");
const runEvent_1 = __importDefault(require("../functions/runEvent"));
exports.default = new handlers_1.GiveawaysEventHandler({
    name: "giveawayEntryRemove",
    version: "1.0.0",
    description: "This event is fired when a giveaway entry is removed",
    listener: async function (old, newer, obj, user) {
        (0, runEvent_1.default)(this, "giveawayEntryRemove", obj, { giveaway: { new: newer, old }, user: { new: user } });
    },
});
//# sourceMappingURL=giveawayEntryRemove.js.map