module.exports = {
    name: "p4",
    type: "messageCreate",
    code: `
$nomention
$let[scan;$scanMessages[$channelID;10]]
$description[scan result head: ($checkContains[$get[scan];i:;1]) len ($charCount[$get[scan]])]
    `
};
