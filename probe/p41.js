module.exports = {
    name: "p41",
    type: "messageCreate",
    code: `
$nomention
$let[msg;$message]
$let[server;0]
$let[chs;]
$let[dur;]
$let[reason;]
$if[$get[msg]!=;
$arrayLoad[toks; ;$get[msg]]
$arrayForEach[toks;w;
$let[cls;other]
$if[$toLowerCase[$env[w]]==server;
$let[cls;server]
$let[server;1]
]
$if[$and[$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true,$isNumber[$env[w]]!=true]==true;
$let[cls;dur]
$let[dur;$env[w]]
]
$if[$and[$or[$startsWith[$env[w];<#]==true,$isNumber[$env[w]]==true]==true,$get[cls]==other]==true;
$let[cls;ch]
$let[chs;$get[chs]$if[$get[chs]!=;,]$replace[$replace[$env[w];<#;];>;]]
]
$if[$get[cls]==other;
$let[reason;$get[reason] $env[w]]
]
]
]
$if[$get[chs]==;
$let[chs;$channelID]
]
$arrayLoad[cl;,;$get[chs]]
$let[n;0]
$arrayForEach[cl;c;
$if[$and[$channelExists[$get[c]]==true,$get[server]==0]==true;
$letSum[n;1]
]
]
$description[msg=($get[msg]) | server=($get[server]) | chs=($get[chs]) | cl-len=($arrayLength[cl]) | ce=($channelExists[$channelID]) | n=($get[n])]
    `
};
