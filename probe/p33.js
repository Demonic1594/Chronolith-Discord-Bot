module.exports = {
    name: "p33",
    type: "messageCreate",
    code: `
$nomention
$let[msg;$message]
$let[chs;]
$if[$get[msg]!=;
$arrayLoad[toks; ;$get[msg]]
$arrayForEach[toks;w;
$let[cls;reason]
$if[$toLowerCase[$env[w]]==server;
$let[cls;server]
]
$if[$and[$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true;$isNumber[$env[w]]!=true]==true;
$let[cls;dur]
]
$if[$and[$or[$startsWith[$env[w];<#]==true,$isNumber[$env[w]]==true]==true,$get[cls]==reason]==true;
$let[cls;ch]
]
$if[$get[cls]==ch;
$let[chs;$get[chs]$if[$get[chs]!=;,]$replace[$replace[$env[w];<#;];>;]]
]
]
]
$if[$get[chs]==;
$let[chs;$channelID]
]
$arrayLoad[cl;,;$get[chs]]
$description[msg=($get[msg]) | chs=($get[chs]) | cl-len=($arrayLength[$arrayLoad[t2;,;$get[chs]]]) | ce=($channelExists[$get[chs]]) | server=($get[server])]
    `
};
