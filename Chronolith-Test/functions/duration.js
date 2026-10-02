/*
 *  * Chronolith engine — duration text → milliseconds conversion.
 *  *
 *  * $durationToMs[10m] → 600000
 *  * $durationToMs[1h30m] → 5400000
 *  * $durationToMs[2d] → 172800000
 *  * $durationToMs[banana] → 0 (invalid, no error)
 *  *
 *  * DSL constraints on the $djsEval body (learned the hard way):
 *  *   - NO square brackets anywhere: a bare ] terminates the djsEval argument
 *  *     (array/object indexing like t[i] or units[ch] is what broke every
 *  *     previous version of this body)
 *  *   - plain semicolons are fine (djsEval rest args are rejoined with ;)
 *  *   - no backslashes anywhere (the DSL escape layer strips them)
 *  * Deliberately supports decimals ("1.5h") and weeks, which native
 *  * $parseString rejects (KB-verified on forgescript 2.7.1).
 */

module.exports = [
    {
        name: "durationToMs",
        params: ["text"],
        code: `
            $let[result;$djsEval[
                (() => {
                    const t = String(ctx.getEnvironmentKey("text")).toLowerCase();
                    const unitOf = (c) => c === "s" ? 1000 : c === "m" ? 60000 : c === "h" ? 3600000 : c === "d" ? 86400000 : c === "w" ? 604800000 : 0;
                    let total = 0, num = "";
                    for (const ch of t) {
                        const ms = unitOf(ch);
                        if (ms > 0) {
                            const n = parseFloat(num);
                            if (!isNaN(n)) { total += n * ms; }
                            num = "";
                        } else if (ch === "." || (ch >= "0" && ch <= "9")) {
                            num += ch;
                        } else {
                            num = "";
                        }
                    }
                    return String(Math.floor(total));
                })()
            ]]
            $return[$get[result]]
        `
    }
];
