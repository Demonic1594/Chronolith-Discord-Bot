"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = require("../handlers");
const runEvent_1 = __importDefault(require("../functions/runEvent"));
exports.default = new handlers_1.GiveawaysEventHandler({
    name: "giveawayEdit",
    version: "1.1.0",
    description: "This event is fired when a giveaway was edited or its duration changed",
    listener: async function (old, newer) {
        (0, runEvent_1.default)(this, "giveawayEdit", newer, { giveaway: { new: newer, old } });
    },
});
//# sourceMappingURL=giveawayEdit.js.map