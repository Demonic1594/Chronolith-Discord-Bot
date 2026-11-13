/**
 * Truncates text to a Discord limit, appending an ellipsis when cut.
 */
export declare function truncate(text: string, max: number): string;
/**
 * Joins items with a separator into as few chunks as possible, none longer
 * than `max` characters. Used to announce any number of winners without
 * hitting Discord's 2000 character message limit.
 */
export declare function chunkJoin(items: readonly string[], sep: string, max: number): string[];
/** Splits an array into slices of at most `size` items. */
export declare function chunk<T>(items: readonly T[], size: number): T[][];
/**
 * Extracts a snowflake from a raw id or a mention such as `<@&123>`/`<@!123>`.
 * Returns null for anything else.
 */
export declare function parseSnowflake(input: string | null | undefined): string | null;
/**
 * Turns a millisecond duration into a compact human string, e.g. "1y 3d 4h".
 */
export declare function formatDuration(ms: number): string;
//# sourceMappingURL=text.d.ts.map