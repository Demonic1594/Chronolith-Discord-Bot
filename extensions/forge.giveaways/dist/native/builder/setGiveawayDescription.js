"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forgescript_1 = require("@tryforge/forgescript");
const builder_1 = __importDefault(require("../../functions/builder"));
exports.default = new forgescript_1.NativeFunction({
    name: "$setGiveawayDescription",
    version: "2.0.0",
    description: "Sets extra text shown in the default giveaway message",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "text",
            description: "The value to set",
            rest: false,
            required: true,
            type: forgescript_1.ArgType.String,
        },
    ],
    execute(ctx, [text]) {
        const error = text.length > 2000 ? "Description must be at most 2000 characters" : null;
        if (error)
            return this.customError(error);
        const b = (0, builder_1.default)(ctx);
        b.display = { ...b.display, description: text };
        return this.success();
    }
});
//# sourceMappingURL=setGiveawayDescription.js.map