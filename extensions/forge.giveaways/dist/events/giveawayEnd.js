"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = require("../handlers");
const runEvent_1 = __importDefault(require("../functions/runEvent"));
exports.default = new handlers_1.GiveawaysEventHandler({
    name: "giveawayEnd",
    version: "1.0.0",
    description: "This event is fired when a giveaway has ended",
    listener: async function (gw) {
        (0, runEvent_1.default)(this, "giveawayEnd", gw, { giveaway: { new: gw } });
    },
});
//# sourceMappingURL=giveawayEnd.js.map