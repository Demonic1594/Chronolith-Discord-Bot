/*
 * Chronolith engine — staff notes.
 *
 *   guild var `noteCount`    → last note number
 *   guild var `note_<n>`     → JSON { u: target, c: content, by: staff, ts: ms }
 *   guild var `nlist_<uid>`  → CSV of note numbers for that user
 *
 * $addNote[guild;target;by;content]   → returns the note number
 * $noteGet[guild;n]                   → note JSON (or empty)
 * $noteDel[guild;n]                   → removes the record + index entry
 * $userNotes[guild;user]              → CSV of that user's note numbers
 */

module.exports = [
    {
        name: "addNote",
        params: ["guild", "target", "by", "content"],
        code: `
            $let[n;$math[$getGuildVar[noteCount;$env[guild];0] + 1]]
            $setGuildVar[noteCount;$get[n];$env[guild]]
            $jsonLoad[nt;{}]
            $jsonSet[nt;u;"$env[target]"]
            $jsonSet[nt;c;$env[content]]
            $jsonSet[nt;by;"$env[by]"]
            $jsonSet[nt;ts;$getTimestamp]
            $setGuildVar[note_$get[n];$jsonStringify[nt];$env[guild]]
            $let[prev;$getGuildVar[nlist_$env[target];$env[guild];]]
            $if[$get[prev]!=;
                $setGuildVar[nlist_$env[target];$get[prev],$get[n];$env[guild]];
                $setGuildVar[nlist_$env[target];$get[n];$env[guild]]
            ]
            $return[$get[n]]
        `
    },
    {
        name: "noteGet",
        params: ["guild", "n"],
        code: `
            $return[$getGuildVar[note_$env[n];$env[guild];]]
        `
    },
    {
        name: "noteDel",
        params: ["guild", "n"],
        code: `
            $let[nt;$getGuildVar[note_$env[n];$env[guild];]]
            $if[$get[nt]==;
                $return[0]
            ]
            $jsonLoad[c;$get[nt]]
            $setGuildVar[note_$env[n];;$env[guild]]
            $let[uid;$env[c;u]]
            $arrayLoad[cs;,;$getGuildVar[nlist_$get[uid];$env[guild];]]
            $let[i;$arrayIndexOf[cs;$env[n]]]
            $if[$get[i]!=-1;
                $arraySplice[cs;$get[i];1]
                $setGuildVar[nlist_$get[uid];$arrayJoin[cs;,];$env[guild]]
            ]
            $return[1]
        `
    },
    {
        // Edit content; original author/creation preserved, editor recorded.
        name: "noteEdit",
        params: ["guild", "n", "by", "content"],
        code: `
            $let[nt;$getGuildVar[note_$env[n];$env[guild];]]
            $if[$get[nt]==;
                $return[0]
            ]
            $jsonLoad[c;$get[nt]]
            $jsonSet[c;c;$env[content]]
            $jsonSet[c;eb;$env[by]]
            $jsonSet[c;ets;$getTimestamp]
            $setGuildVar[note_$env[n];$jsonStringify[c];$env[guild]]
            $return[1]
        `
    },
    {
        name: "userNotes",
        params: ["guild", "user"],
        code: `
            $return[$getGuildVar[nlist_$env[user];$env[guild];]]
        `
    }
];
