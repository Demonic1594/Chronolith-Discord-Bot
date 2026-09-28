/*
 * Chronolith engine — mass ban.
 * $massBan[guild;mod;ids]  (ids = one string of space-separated snowflakes)
 * Returns the number of users banned; each ban gets its own case + modlog.
 */

module.exports = [
    {
        name: "massBan",
        params: ["guild", "mod", "ids"],
        code: `
            $arrayLoad[ids; ;$env[ids]]
            $let[done;0]
            $arrayForEach[ids;u;
                $if[$env[u]!=;
                    $if[$env[u]!=$env[mod];
                        $#ban[$env[guild];$env[u];Mass ban by moderator]
                        $let[n;$newCase[$env[guild];ban;$env[u];$env[mod];;Mass ban]
                        $modlogPost[$env[guild];$get[n];ban;$env[u];$env[mod];;Mass ban]
                        $dmNotify[$env[u];$env[guild];ban;;$get[n];Mass ban]
                        $letSum[done;1]
                    ]
                ]
            ]
            ]
            $return[$get[done]]
        `
    }
];
