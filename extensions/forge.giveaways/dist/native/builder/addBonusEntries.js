"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const builder_1 = __importDefault(require("../../functions/builder"));
const utils_1 = require("../../utils");
exports.default = new forgescript_1.NativeFunction({
    name: "$addBonusEntries",
    version: "2.0.0",
    description: "Gives members with a role extra entries (tickets); bonuses from several roles add up",
    aliases: ["$addBonusEntry"],
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "role ID",
            description: "The role granting the bonus",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
        {
            name: "amount",
            description: "How many extra entries the role gives",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Number,
        },
    ],
    execute(ctx, [role, amount]) {
        const roleID = (0, utils_1.parseSnowflake)(role);
        if (!roleID)
            return this.customError(`Invalid role ID: ${role}`);
        if (!Number.isInteger(amount) || amount < 1)
            return this.customError("Amount must be a whole number of at least 1");
        const b = (0, builder_1.default)(ctx);
        b.bonusEntries = [...(b.bonusEntries ?? []).filter((x) => x.roleID !== roleID), { roleID, amount }];
        return this.success();
    }
});
//# sourceMappingURL=addBonusEntries.js.map