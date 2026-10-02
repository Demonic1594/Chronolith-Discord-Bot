/* Lexer-accurate bracket scanner: a ']' with no open function = leaked to output. */
const fs = require("fs");
const path = require("path");
const FN = /\$[!#]?[a-zA-Z_][\w]*/g;

function scan(file) {
    const code = require(path.resolve(file)).code;
    if (typeof code !== "string") return;
    let depth = 0, line = 1, leaks = [];
    for (let i = 0; i < code.length; i++) {
        const c = code[i];
        if (c === "\n") line++;
        if (c === "\\") { i++; continue; }
        if (c === "$") {
            FN.lastIndex = i;
            const m = FN.exec(code);
            if (m && m.index === i) {
                let j = i + m[0].length;
                while (code[j] === " ") j++; // $fn [ allows spaces? no — treat direct
                if (code[j] === "[") { depth++; i = j; continue; }
                i = i + m[0].length - 1; continue;
            }
            continue;
        }
        if (c === "]") {
            depth--;
            if (depth < 0) { leaks.push({ line, col: i }); depth = 0; }
        }
    }
    if (leaks.length) console.log(file, "→ leaked ] at", leaks.map((l) => `L${l.line}`).join(","));
}

for (const dir of ["prefixesCmd", "slashesCmd", "events"]) {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((f) => {
        const p = path.join(d, f.name);
        if (f.isDirectory()) walk(p); else if (f.name.endsWith(".js")) scan(p);
    });
    walk(dir);
}
for (const f of fs.readdirSync("functions").filter((x) => x.endsWith(".js"))) scan(path.join("functions", f));
console.log("scan complete");
