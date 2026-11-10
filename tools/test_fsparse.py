#!/usr/bin/env python3
"""Differential test: fsparse.py must produce exactly what the real ForgeScript compiler produces.

Every input is compiled twice, by tools/fsref.js (real ForgeScript) and by fsparse.py,
and the JSON outputs (tree, fields, operators, template, rendered text, or the error
message with line and column) must be identical.

Inputs: hand-written edge cases, a seeded fuzzer, and any corpus files given with
--corpus (JSON lines {"id","code"}, e.g. from `node tools/fs_extract.js js .`).

  FS_MODULE=<dir>/node_modules/@tryforge/forgescript python3 tools/test_fsparse.py \
      [--corpus file.jsonl ...] [--fuzz 20000] [--packages ForgeScript,ForgeDB]
"""
import argparse
import json
import os
import random
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import fsparse  # noqa: E402

EDGE_CASES = [
    "", "plain text", "$", "$$", "$ping", "$PING", "$Ping[]", "$ping[x]", "Pong! $pingms", "$pingMS",
    "$httpPingms", "$usernameX", "$giveRole[a;b]", "$getChannelCooldownTime[1]", "$get", "$get[",
    "$get[a", "$get[a;b]", "$let[x;a;b]", "$let[x;a\\;b]$get[x]", "$let[x;a [r] b]$get[x]",
    "$let[x;a\\[b\\]c]$get[x]", "\\$sum[1;2]", "\\\\$sum[1;2]", "[\\$sum[1;2]]", "a\\nb", "\\na$ping\\n",
    "$let[x;a\\nb]$get[x]", "$let[x;a\\\\b]$get[x]", "$let[x;\\$sum\\[1\\;2\\]]$get[x]", "$let[x;\\$sum[1]]$get[x]",
    "$!sum[1;2]", "$#sum[1;2]", "$!#sum[1;2]", "$#!sum[1;2]", "$@[,]randomText[a;b]", "$@[]sum[1;2]",
    "$!#@[;]sum[1;2]", "$@[x\ny]sum[1]", "$if[1==1;a;b]", "$if[$get[a]==$get[b];y;n]", "$if[a!=b]",
    "$if[1<=2;a]", "$if[1>=2;a]", "$if[1<2]", "$if[1>2]", "$if[a==b==c;x]", "$if[=;x]", "$if[\\==a;x]",
    "$if[true]", "$if[$checkCondition[a==b];x;y]", "$if[1==1;$if[2==2;a;b];c]", "$and[1==1;2==2]",
    "$checkCondition[1==1&&2==2]", "$sendMessage[$channelID;hi;true]", "$c[$ping]", "$try[$x;$y;e]",
    "$arrayLoad[a;,;1,2,3]$arrayJoin[a;-]", "$jsonSet[j;a;b;c]", "$log[a]\n$log[b]", "line1\nline2 $ping[",
    "😀$get[", "😀\n😀😀$get[a;b;c]", "a $ping", "$@[a b]ping", "\\", "a\\", "$get[a\\",
    "$ping\\$ping", "$!", "$#", "$@[", "$@[]", "[SYSTEM_FUNCTION(0)]$ping", "\\[SYSTEM_FUNCTION(0)]",
    "\\\\$ping", "$let[a;\\\\$ping]$get[a]", "$let[a;x\\\\$ping]$get[a]", "`${x}` $ping", "$ping`", "${",
    "$sum[1;2;3;4;5]", "$sum[]", "$sum[;]", "$randomNumber[1;2;true;x]", "$ifx[$if[a;b]$elseIf[c;d]$else[e]]",
    "$while[$get[i]<3;$letSum[i;1]]", "$awaitComponent", "$addButton[id;label;Primary]", "$EMBEDCOLOR",
]

ALPHABET = list("$$$$[[]];;;\\\\!#@=<>abcxyz019 \n,.-") + [" ", "😀", "é"]


def fuzz_inputs(reg, n, seed):
    rnd = random.Random(seed)
    names = [k for k in reg.keys]
    pieces = ["$", "[", "]", ";", "\\", "!", "#", "@[", "==", "!=", "<=", ">=", "<", ">", "\n", " ", "x", "1"]
    out = []
    for _ in range(n):
        parts = []
        for _ in range(rnd.randint(1, 14)):
            r = rnd.random()
            if r < 0.4:
                nm = rnd.choice(names)
                parts.append("$" + ("".join(c.upper() if rnd.random() < .2 else c for c in nm)))
                if rnd.random() < 0.2:
                    parts.append(rnd.choice(["ms", "X", "abc", "_1"]))
            elif r < 0.75:
                parts.append(rnd.choice(pieces))
            else:
                parts.append("".join(rnd.choice(ALPHABET) for _ in range(rnd.randint(1, 4))))
        out.append("".join(parts))
    return out


def run_reference(items, env):
    payload = "".join(json.dumps({"id": i, "code": c}) + "\n" for i, c in enumerate(items))
    p = subprocess.run(["node", str(HERE / "fsref.js")], input=payload, capture_output=True,
                       text=True, env=env, timeout=1800)
    if p.returncode:
        raise SystemExit(p.stderr[-2000:])
    res = {}
    for line in p.stdout.split("\n"):  # not splitlines(): JSON leaves \u2028 unescaped
        if not line:
            continue
        d = json.loads(line)
        res[d.pop("id")] = d
    return res


def check_registry(pkgs, env):
    """The function table fsparse builds must equal a real ForgeClient's (names, aliases, fields)."""
    npm = {"ForgeDB": "@tryforge/forge.db:ForgeDB"}
    exts = [npm[p] for p in pkgs if p in npm]
    if len(exts) != len([p for p in pkgs if p != "ForgeScript"]):
        return None
    p = subprocess.run(["node", str(HERE / "fsref.js"), "--client-raw"], capture_output=True, text=True,
                       env={**env, "FS_EXTENSIONS": ",".join(exts)}, timeout=300)
    if p.returncode:
        if "Cannot find module" in p.stderr:
            return "SKIP registry check: an extension package is not installed next to ForgeScript"
        return f"could not build a client: {p.stderr.strip()[-300:]}"
    norm = lambda a: None if a is None else (bool(a["required"]), [(bool(f.get("condition")), bool(f.get("rest"))) for f in a["fields"]])
    real = {r["name"]: (sorted(r["aliases"] or []), norm(r["args"])) for r in json.loads(p.stdout)}
    reg = fsparse.Registry.load(pkgs)
    mine = {f.name: (sorted(f.aliases), None if not f.has_args else (f.required, [(x["condition"], x["rest"]) for x in f.fields]))
            for f in reg.functions}
    diff = sorted(set(real) ^ set(mine)) + [n for n in real if n in mine and real[n] != mine[n]]
    return f"registry vs real client ({len(real)} functions): {len(diff)} differences {diff[:5]}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--corpus", action="append", default=[])
    ap.add_argument("--fuzz", type=int, default=5000)
    ap.add_argument("--seed", type=int, default=20261109)
    ap.add_argument("--packages")
    ap.add_argument("--show", type=int, default=5)
    a = ap.parse_args()

    pkgs = a.packages.split(",") if a.packages else None
    reg = fsparse.Registry.load(pkgs)
    items, labels = [], []
    for c in EDGE_CASES:
        items.append(c); labels.append("edge")
    for path in a.corpus:
        for line in open(path, encoding="utf-8"):
            d = json.loads(line)
            items.append(d["code"]); labels.append(d.get("id", path))
    for c in fuzz_inputs(reg, a.fuzz, a.seed):
        items.append(c); labels.append("fuzz")

    env = dict(os.environ)
    if pkgs:
        env["FS_PACKAGES"] = ",".join(pkgs)
    ref = run_reference(items, env)

    bad = 0
    errors = 0
    for i, code in enumerate(items):
        mine = fsparse.to_json(code, reg)
        if "error" in ref[i]:
            errors += 1
        # recovering mode: same tree when there's no error, same FIRST error when there is
        rec = fsparse.parse(code, reg, recover=True)
        if "error" in ref[i]:
            first = rec.errors[0] if rec.errors else None
            if not first or (first.message, first.line, first.column) != (ref[i]["error"], ref[i]["line"], ref[i]["column"]):
                mine = {"recover-mode-first-error": str(first)}
        elif rec.errors or rec.code != ref[i]["code"] or [fsparse._call_json(c) for c in rec.functions] != ref[i]["functions"]:
            mine = {"recover-mode-differs": [str(e) for e in rec.errors]}
        if mine != ref[i]:
            bad += 1
            if bad <= a.show:
                print(f"MISMATCH [{labels[i]}] {code!r}")
                print("  real   :", json.dumps(ref[i], ensure_ascii=False)[:600])
                print("  fsparse:", json.dumps(mine, ensure_ascii=False)[:600])
    if pkgs:
        msg = check_registry(pkgs, env)
        if msg:
            print(msg)
            if " 0 differences" not in msg and not msg.startswith("SKIP"):
                bad += 1
    print(f"{len(items) - bad}/{len(items)} identical "
          f"({len(EDGE_CASES)} edge cases, {a.fuzz} fuzz, {len(items) - len(EDGE_CASES) - a.fuzz} corpus; "
          f"{errors} were compile errors) packages={a.packages or 'all'}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
