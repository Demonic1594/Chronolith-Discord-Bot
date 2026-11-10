/*
 * Chronolith engine — duration text → milliseconds conversion.
 *
 * $durationToMs[10m] → 600000
 * $durationToMs[1h30m] → 5400000
 * $durationToMs[2d] → 172800000
 * $durationToMs[banana] → 0 (invalid, no error)
 *
 * $parseMS in this engine does the OPPOSITE (ms → human string).
 * NOTE (2026-09-28): native $parseString IS a text→ms converter (returns 0
 * on failure — KB-verified on 2.7.1), but it rejects decimal amounts
 * ("1.5h" fails) and has no week unit; this fn supports both deliberately.
 * Do not "simplify" this away without checking those two behaviors.
 *
 * The JavaScript below is escaped twice: once for ForgeScript (\\ ; [ ] $ get a
 * backslash, or the first ] would end $djsEval's argument) and once for this
 * template literal (each backslash doubled). Edit the plain JS and regenerate
 * it with fsextract.fs_escape + js_template_escape (tools/fslint.py --escape).
 */

module.exports = [
    {
        name: "durationToMs",
        params: ["text"],
        code: `
            $let[result;$djsEval[
                (() => {
                    const text = String(ctx.getEnvironmentKey("text") ?? "")\\;
                    let total = 0, match\\;
                    const re = /(\\\\d+(?:\\\\.\\\\d+)?)\\\\s*(\\[smhdw\\])/gi\\;
                    while ((match = re.exec(text)) !== null) {
                        const n = parseFloat(match\\[1\\])\\;
                        const unit = match\\[2\\].toLowerCase()\\;
                        const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 }\\[unit\\] || 0\\;
                        total += n * ms\\;
                    }
                    return String(Math.floor(total))\\;
                })()
            ]]
            $return[$get[result]]
        `
    }
];
