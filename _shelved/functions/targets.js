/*
 * Chronolith engine — target resolution.
 *
 * $resolveTargets[guild;args;channel;msgid]
 *   args   = the command's argument string
 *   Parses leading targets (mentions, usernames, user IDs — findUser handles
 *   all three; also strips <@!/<> wrappers), stopping at the first token that
 *   resolves to nothing. Everything after becomes the reason. If NOTHING
 *   resolved and the invocation is a reply, the replied-to message's author
 *   becomes the sole target (message-based targeting).
 *
 *   Returns JSON: {"ids":"id1,id2", "reason":"..."}  (ids capped at 10)
 */

module.exports = [
    {
        name: "resolveTargets",
        params: ["guild", "args", "channel", "msgid"],
        code: `
            $arrayLoad[toks; ;$env[args]]
            $let[ids;]
            $let[reason;]
            $let[n;0]
            $arrayForEach[toks;tok;
                $if[$get[n]<10;
                    $if[$get[reason]==;
                        $let[cand;$replace[$replace[$replace[$env[tok];<@;];!;];>;]]
                        $try[$let[uid;$findUser[$get[cand]]];$let[uid;]]
                        $if[$get[uid]!=;
                            $let[ids;$if[$get[ids]!=;$get[ids],]$get[uid]]
                            $letSum[n;1]
                        ;
                            $let[reason;$trim[$get[reason] $env[tok]]]
                        ]
                    ;
                        $let[reason;$trim[$get[reason] $env[tok]]]
                    ]
                ;
                    $let[reason;$trim[$get[reason] $env[tok]]]
                ]
            ]
            $if[$get[ids]==;
                $if[$env[msgid]!=;
                    $let[ref;$djsEval[
                        (() => {
                            const ch = ctx.client.channels.cache.get(ctx.getEnvironmentKey("channel"))\\;
                            if (!ch) return ""\\;
                            const msg = ch.messages.cache.get(ctx.getEnvironmentKey("msgid"))\\;
                            if (!msg || !msg.reference) return ""\\;
                            return msg.reference.messageId || ""\\;
                        })()
                    ]]
                    $if[$get[ref]!=;
                        $try[$let[ids;$getMessage[$env[channel];$get[ref];authorID]];$let[ids;]]
                    ]
                ]
            ]
            $jsonLoad[res;{}]
            $jsonSet[res;ids;"$get[ids]"]
            $jsonSet[res;reason;"$trim[$get[reason]]"]
            $return[$jsonStringify[res]]
        `
    }
];
