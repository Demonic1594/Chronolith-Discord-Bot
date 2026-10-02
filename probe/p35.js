module.exports = {
    name: "p35",
    type: "messageCreate",
    code: `
$nomention
$let[server;false]
$let[cond1;$get[server]==false]
$let[cond2;$channelExists[$channelID]==true]
$let[and1;$and[$get[cond2];$get[server]==false]]
$let[and2;$and[$channelExists[$channelID]==true;$get[server]==false]]
$description[
c1=($get[cond1]) | c2=($get[cond2]) | and-sep=($get[and1]) | and-comma=($get[and2]) | raw-and=($and[$channelExists[$channelID]==true;$get[server]==false]) | strfalse=($checkCondition[$get[server]==false])]
    `
};
