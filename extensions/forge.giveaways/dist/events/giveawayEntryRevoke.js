"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlers_1 = require("../handlers");
const runEvent_1 = __importDefault(require("../functions/runEvent"));
exports.default = new handlers_1.GiveawaysEventHandler({
    name: "giveawayEntryRevoke",
    version: "1.0.0",
    description: "This event is fired when someone tried to enter a giveaway but was refused; use $giveawayDenyReason for why",
    listener: async function (gw, obj, user, reason) {
        const revoked = gw.clone();
        revoked.denyReasonCode = reason ?? null;
        (0, runEvent_1.default)(this, "giveawayEntryRevoke", obj, { giveaway: { new: revoked }, user: { new: user } });
    },
});
//# sourceMappingURL=giveawayEntryRevoke.js.map