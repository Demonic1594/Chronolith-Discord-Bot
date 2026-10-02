module.exports = {
    name: "p34",
    type: "messageCreate",
    code: `
$nomention
$let[server;false]
$let[chs;$channelID]
$let[n;0]
$arrayLoad[cl;,;$get[chs]]
$let[cllen;$arrayLength[cl]]
$arrayForEach[cl;c;
$if[$and[$channelExists[$get[c]]==true;$get[server]==false]==true;
$letSum[n;1]
]
]
$description[server=($get[server]) | chs=($get[chs]) | cllen=($get[cllen]) | ce=($channelExists[$get[chs]]) | n=($get[n])]
    `
};
