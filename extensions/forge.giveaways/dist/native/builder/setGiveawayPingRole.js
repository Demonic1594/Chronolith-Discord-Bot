"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const builder_1 = __importDefault(require("../../functions/builder"));
const utils_1 = require("../../utils");
exports.default = new forgescript_1.NativeFunction({
    name: "$setGiveawayPingRole",
    version: "2.0.0",
    description: "Sets a role pinged when the giveaway starts (default messages only)",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "role ID",
            description: "The role to ping",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
    ],
    execute(ctx, [role]) {
        const roleID = (0, utils_1.parseSnowflake)(role);
        if (!roleID)
            return this.customError(`Invalid role ID: ${role}`);
        const b = (0, builder_1.default)(ctx);
        b.display = { ...b.display, pingRoleID: roleID };
        return this.success();
    }
});
//# sourceMappingURL=setGiveawayPingRole.js.map