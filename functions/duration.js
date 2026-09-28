/*
 * Chronolith engine — duration text → milliseconds conversion.
 *
 * $durationToMs[10m] → 600000
 * $durationToMs[1h30m] → 5400000
 * $durationToMs[2d] → 172800000
 * $durationToMs[banana] → 0 (invalid, no error)
 *
 * $parseMS in this engine does the OPPOSITE (ms → human string).
 * This function fills the gap for any code that needs to parse
 * user-provided duration text.
 */

module.exports = [
    {
        name: "durationToMs",
        params: ["text"],
        code: `
            $let[total;0]
            $let[num;]
            $arrayLoad[chars; ;$replace[$replace[$replace[$replace[$env[text];s; S ];m; M ];h; H ];d; D ]]
            $let[result;$djsEval[
                (() => {
                    const text = "$env[text]"\\;
                    let total = 0, match\\;
                    const re = /(\\d+(?:\\.\\d+)?)\\s*([smhdw])/gi\\;
                    while ((match = re.exec(text)) !== null) {
                        const n = parseFloat(match[1])\\;
                        const unit = match[2].toLowerCase()\\;
                        const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 }[unit] || 0\\;
                        total += n * ms\\;
                    }
                    return String(Math.floor(total))\\;
                })()
            ]]
            $return[$get[result]]
        `
    }
];
