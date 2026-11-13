import { Logger } from "@tryforge/forgescript"

/** Logs an error from a fire-and-forget promise instead of crashing. */
export default (...args: any[]) => {
    Logger.error("[ForgeGiveaways]", ...args)
}
