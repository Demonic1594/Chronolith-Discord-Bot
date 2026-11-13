"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const builder_1 = __importDefault(require("../../functions/builder"));
exports.default = new forgescript_1.NativeFunction({
    name: "$setGiveawayColor",
    version: "2.0.0",
    description: "Sets the embed color of the default giveaway message",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "color",
            description: "The color, e.g. #ff00ff",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.Color,
        },
    ],
    execute(ctx, [color]) {
        const b = (0, builder_1.default)(ctx);
        b.display = { ...b.display, color };
        return this.success();
    }
});
//# sourceMappingURL=setGiveawayColor.js.map