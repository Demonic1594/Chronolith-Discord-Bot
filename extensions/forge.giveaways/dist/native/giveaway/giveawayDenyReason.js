"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const structures_1 = require("../../structures");
exports.default = new forgescript_1.NativeFunction({
    name: "$giveawayDenyReason",
    version: "2.0.0",
    description: "Returns why an entry was refused, inside the giveawayEntryRevoke event",
    unwrap: false,
    output: structures_1.GiveawayDenyReason,
    execute(ctx) {
        const g = ctx.extendedStates?.giveaway?.new;
        return this.success(g?.denyReasonCode ?? undefined);
    }
});
//# sourceMappingURL=giveawayDenyReason.js.map