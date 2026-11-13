import { ArgType, NativeFunction } from "@tryforge/forgescript";
import { GiveawayProperty } from "../../properties/giveaway";
export declare enum GiveawayFilter {
    all = "all",
    active = "active",
    paused = "paused",
    ended = "ended"
}
declare const _default: NativeFunction<[{
    name: string;
    description: string;
    rest: false;
    required: true;
    type: ArgType.Guild;
}, {
    name: string;
    description: string;
    rest: false;
    type: ArgType.Enum;
    enum: typeof GiveawayFilter;
}, {
    name: string;
    description: string;
    rest: false;
    type: ArgType.Enum;
    enum: typeof GiveawayProperty;
}, {
    name: string;
    description: string;
    rest: false;
    type: ArgType.String;
}], true>;
export default _default;
//# sourceMappingURL=getGuildGiveaways.d.ts.map