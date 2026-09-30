/*
 * Chronolith — component router (interactionCreate, buttons only).
 *
 * CustomID protocols (delimiter "-", payloads digit-only):
 *   help-<page>-<authorID>   → help pagination (wraps around)
 *   tkclose-<authorID>       → locks the ticket channel the button lives in
 *   verify-<guildID>-<userID>→ verification (works in DMs — the guild rides
 *                              in the CustomID because $guildID is empty there)
 *
 * Buttons are usable by their owner or by any moderator.
 */

module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
        $arrayLoad[id;-;$customID]
        $let[verb;$arrayAt[id;0]]

        $if[$get[verb]==verify;
            $let[vg;$arrayAt[id;1]]
            $let[vu;$arrayAt[id;2]]
            $if[$authorID!=$get[vu];
                $ephemeral
                $interactionReply[This verification link belongs to someone else.]
                $stop
            ]
            $!jsonLoad[cfg;$getGuildVar[cfg;$get[vg];{}]]
            $try[$memberRemoveRoles[$get[vg];$authorID;$env[cfg;verify;role]];]
            $ephemeral
            $interactionReply[
                $description[You are verified — welcome to **$guildName[$get[vg]]**.]
                $color[248046]
                $footer[Chronolith • Verification]
                    $timestamp
            ]
            $stop
        ]

        $onlyIf[$guildID!=;]
        $let[owner;$arrayAt[id;2]]

        $if[$get[verb]==help;
            $let[page;$arrayAt[id;1]]
            $let[allowed;$if[$authorID==$get[owner];true;$isMod[$guildID;$authorID]]]
            $if[$get[allowed]!=true;
                $ephemeral
                $interactionReply[This menu belongs to <@$get[owner]> — run /help or %help yourself.]
                $stop
            ]
            $if[$get[page]<0;
                $let[page;$math[$helpPages-1]]
            ]
            $if[$get[page]>=$helpPages;
                $let[page;0]
            ]
            $interactionUpdate[
                $author[Chronolith;$userAvatar[$botID;32;png]]
                $description[$helpPage[$get[page]]]
                $color[5865F2]
                $footer[Chronolith • Page $math[$get[page]+1] of $helpPages]
                $addActionRow
                $addButton[help-$math[$get[page]-1]-$get[owner];◀;Primary]
                $addButton[help-$math[$get[page]+1]-$get[owner];▶;Primary]
            ]
        ]

        $if[$get[verb]==bunban;
            $let[tgt;$arrayAt[id;1]]
            $onlyIf[$isMod[$guildID;$authorID]==true;
                $ephemeral
                $interactionReply[⛔ You need moderator permissions.]
                $stop
            ]
            $let[r;$punish[unban;$guildID;$authorID;$get[tgt];;Unban — one-click follow-up on the ban]]
            $if[$checkContains[$get[r];⛔]==true;
                $ephemeral
                $interactionReply[$get[r]]
            ;
                $interactionUpdate[
                    $title[**__The Ban Hammer retracts.__**]
                    $author[$serverName[$guildID];$guildIcon[$guildID]]
                    $color[$actionColor[unban]]
                    $description[• **Action :** \`unban\`
> **Member:** [$username[$get[tgt]]\\](https://discord.com/users/$get[tgt])
> **Reason:** \`Unbanned via one-click follow-up\`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
                    $thumbnail[$userAvatar[$authorID;128;png]]
                    $footer[Chronolith • Moderation]
                    $timestamp
                ]
            ]
        ]
        $if[$get[verb]==bban;
            $let[tgt;$arrayAt[id;1]]
            $onlyIf[$isMod[$guildID;$authorID]==true;
                $ephemeral
                $interactionReply[⛔ You need moderator permissions.]
                $stop
            ]
            $let[r;$punish[ban;$guildID;$authorID;$get[tgt];;Re-banned via one-click follow-up]]
            $if[$checkContains[$get[r];⛔]==true;
                $ephemeral
                $interactionReply[$get[r]]
            ;
                $interactionUpdate[
                    $title[**__The Ban Hammer has spoken!__**]
                    $author[$serverName[$guildID];$guildIcon[$guildID]]
                    $color[$actionColor[ban]]
                    $description[• **Action :** \`ban\`
> **Member:** [$username[$get[tgt]]\\](https://discord.com/users/$get[tgt])
> **Reason:** \`Re-banned via one-click follow-up\`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
                    $thumbnail[$userAvatar[$authorID;128;png]]
                    $footer[Chronolith • Moderation]
                    $timestamp
                ]
            ]
        ]
        $if[$get[verb]==tkclose;
            $let[owner;$arrayAt[id;1]]
            $let[allowed;$if[$authorID==$get[owner];true;$isMod[$guildID;$authorID]]]
            $if[$get[allowed]!=true;
                $ephemeral
                $interactionReply[Only the ticket owner or a moderator can close this.]
                $stop
            ]
            $!removeChannelPerms[$channelID;$guildID;SendMessages]
            $interactionUpdate[
                $author[Ticket;$userAvatar[$botID;64;png]]
                $title[Ticket closed]
                $color[F23F24]
                $description[Closed by <@$authorID>. The channel is now read-only — a moderator may delete it after review.]
                $footer[Chronolith • Tickets]
                    $timestamp
            ]
        ]
    `
};
