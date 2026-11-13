"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = truncate;
exports.chunkJoin = chunkJoin;
exports.chunk = chunk;
exports.parseSnowflake = parseSnowflake;
exports.formatDuration = formatDuration;
/**
 * Truncates text to a Discord limit, appending an ellipsis when cut.
 */
function truncate(text, max) {
    if (text.length <= max)
        return text;
    return text.slice(0, Math.max(0, max - 1)) + "…";
}
/**
 * Joins items with a separator into as few chunks as possible, none longer
 * than `max` characters. Used to announce any number of winners without
 * hitting Discord's 2000 character message limit.
 */
function chunkJoin(items, sep, max) {
    const chunks = [];
    let current = "";
    for (const item of items) {
        const next = current ? current + sep + item : item;
        if (next.length > max && current) {
            chunks.push(current);
            current = item;
        }
        else {
            current = next;
        }
    }
    if (current)
        chunks.push(current);
    return chunks;
}
/** Splits an array into slices of at most `size` items. */
function chunk(items, size) {
    const out = [];
    for (let i = 0; i < items.length; i += size)
        out.push(items.slice(i, i + size));
    return out;
}
const SNOWFLAKE = /^\d{17,20}$/;
/**
 * Extracts a snowflake from a raw id or a mention such as `<@&123>`/`<@!123>`.
 * Returns null for anything else.
 */
function parseSnowflake(input) {
    if (!input)
        return null;
    const id = input.trim().replace(/^<[@#][!&]?(\d+)>$/, "$1");
    return SNOWFLAKE.test(id) ? id : null;
}
/**
 * Turns a millisecond duration into a compact human string, e.g. "1y 3d 4h".
 */
function formatDuration(ms) {
    if (!Number.isFinite(ms) || ms <= 0)
        return "0s";
    const units = [
        ["y", 365 * 864e5], ["w", 7 * 864e5], ["d", 864e5], ["h", 36e5], ["m", 6e4], ["s", 1e3],
    ];
    const parts = [];
    let rest = Math.floor(ms);
    for (const [label, size] of units) {
        const n = Math.floor(rest / size);
        if (n) {
            parts.push(`${n}${label}`);
            rest -= n * size;
        }
        if (parts.length === 3)
            break;
    }
    return parts.join(" ") || "0s";
}
//# sourceMappingURL=text.js.map