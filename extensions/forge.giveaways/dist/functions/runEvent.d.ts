import { ForgeClient } from "@tryforge/forgescript";
import type { IGiveawayEvents } from "../handlers/GiveawaysEventHandler";
import type { ExtendedSendable, ExtendedStates } from "../types";
/**
 * Runs every command registered for a giveaway event. A failing command is
 * logged and does not stop the others.
 */
export default function runEvent(client: ForgeClient, name: keyof IGiveawayEvents, obj: ExtendedSendable, states?: ExtendedStates): void;
//# sourceMappingURL=runEvent.d.ts.map