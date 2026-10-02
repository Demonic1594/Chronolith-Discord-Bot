module.exports = {
    name: "p7",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$authorID==$botOwnerID;]
    `
};
