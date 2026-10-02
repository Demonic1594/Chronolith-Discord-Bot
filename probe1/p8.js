module.exports = {
    name: "p8",
    type: "messageCreate",
    code: `
$nomention
$let[chs;]
$if[$get[chs]==;
$let[chs;$channelID]
]
$arrayLoad[cl;,;$get[chs]]
$let[n;0]
$arrayForEach[cl;c;
$if[$and[$channelExists[$get[c]]==true;false]==false;
$letSum[n;1]
]
]
$description[chs=($get[chs]) | n=($get[n]) | ce=($channelExists[$get[chs]])]
    `
};
