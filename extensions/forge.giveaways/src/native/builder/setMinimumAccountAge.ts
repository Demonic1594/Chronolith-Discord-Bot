import { ArgType, NativeFunction } from "@tryforge/forgescript"
import { requirements } from "../../functions/builder"

export default new NativeFunction({
    name: "$setMinimumAccountAge",
    version: "2.0.0",
    description: "Sets the minimum Discord account age required to enter",
    unwrap: true,
    brackets: true,
    args: [
        {
            name: "time",
            description: "The minimum age, e.g. 7d",
            rest: false,
            required: true,
            type: ArgType.Time,
        },
    ],
    execute(ctx, [time]) {
        if (!(time >= 0)) return this.customError("Time must not be negative")
        requirements(ctx).minAccountAge = time
        return this.success()
    }
})
