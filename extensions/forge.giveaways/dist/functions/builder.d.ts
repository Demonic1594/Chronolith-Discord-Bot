import { Context } from "@tryforge/forgescript";
import { IGiveawayBuilder } from "../structures/Context";
/** Returns the giveaway builder of a context, creating it on first use. */
export default function builder(ctx: Context): IGiveawayBuilder;
/** Returns the requirements of a context, creating them on first use. */
export declare function requirements(ctx: Context): Partial<import("../structures/Giveaway").IGiveawayRequirements>;
//# sourceMappingURL=builder.d.ts.map