#!/usr/bin/env python3
"""Rule tests for fslint v5: each case checks two things.

1. The linter reports exactly the expected rules for the snippet (ForgeScript text).
2. The real ForgeScript interpreter (tools/fsrun.js, offline) does what the rule's message
   claims: the run produces the stated output, or stops with the stated error.

So a rule can't drift from the runtime unnoticed. Cases that need Discord (sending,
fetching) only check (1) and are marked runtime=None.

  FS_MODULE=<dir>/node_modules/@tryforge/forgescript python3 tools/test_fslint.py
  python3 tools/test_fslint.py --no-runtime      # lint expectations only
"""
import json
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import fsparse  # noqa: E402
import fslint_engine as E  # noqa: E402

# (code, rules expected (set of rule ids; info-level experimental/silent-flag ignored), runtime)
# runtime: ("out", text) exact output | ("error", substring) stopped with that error |
#          ("stopped", None) stopped without an error | None (not checked: needs Discord)
CASES = [
    # names
    ("Pong! $pingms", {"glued-name"}, ("out", "Pong! NaNms")),          # offline ping is NaN; online e.g. 42ms
    ("$usernameX", {"glued-name"}, None),
    ("[$giveRole[x]]", {"unknown-function"}, ("out", "[$giveRole[x]]")),
    ("$let[total;1]$total", {"bare-variable"}, ("out", "$total")),
    ("$getChannelCooldownTime[1]", {"compile"}, ("error", "Function $get requires brackets")),
    # compile errors
    ("$let[x;a;b]", {"compile"}, ("error", "expects 2 arguments at most")),
    ("$get[a", {"compile"}, ("error", "missing brace closure")),
    ("$get", {"compile"}, ("error", "requires brackets")),
    # operators
    ("[$#!sum[1;2]]", {"operator-order"}, ("out", "[$#!sum[1;2]]")),
    ("[$!!sum[1;2]]", {"operator-order"}, ("out", "[$!!sum[1;2]]")),
    ("[$!$sum[1;2]]", {"operator-detached"}, ("out", "[$!3]")),
    ("A$#divide[1;abc]B", {"type-gate"}, ("stopped", None)),       # $# hides the error, still stops
    # brackets and escapes
    ("$ping[x]", {"ignored-brackets"}, ("out", "NaN[x]")),
    ("$let[x;a [r] b]$get[x]", {"bracket-in-arg"}, ("out", " b]a [r")),
    ("$let[x;a\\[r\\] b]$get[x]", set(), ("out", "a[r] b")),
    ("$let[x;a\\nb]$get[x]", {"escape"}, ("out", "anb")),
    ("$let[x;a\\\\$sum[1;2]]$get[x]", {"backslash-before-call"}, ("out", "a3")),
    ("$sum[1;2] a\\nb", {"tail-escape"}, ("out", "3 a\\nb")),
    ("\\$sum[1;2]", set(), ("out", "$sum[1;2]")),
    # argument gates (CompiledFunction.resolveArg)
    ("$randomNumber[1;1;True]", {"type-gate"}, ("error", "is not of type Boolean")),
    ("$randomNumber[1;1;yes]", {"type-gate"}, ("error", "is not of type Boolean")),
    ("$randomNumber[1;1;true]", set(), ("out", "1")),
    ("$randomNumber[1;1;]", set(), ("out", "1")),
    ("$randomNumber[]", set(), ("out", "0")),                            # empty field is present: Number("") = 0
    ("$sum[abc;1]", {"type-gate"}, ("error", "is not of type Number")),
    ("$sum[0x10;1e3; 5 ]", set(), ("out", "1021")),
    ("$wait[1.5m]", {"type-gate"}, ("error", "is not of type Time")),
    ("$wait[10ms]", {"type-gate"}, ("error", "is not of type Time")),
    ("$wait[10 m]", {"type-gate"}, ("error", "is not of type Time")),
    ("$addButton[a;b;primary]", {"type-gate", "component-order"}, ("error", "is not of type Enum")),
    ("$addActionRow$addButton[a;b;Primary]ok", set(), ("out", "ok")),
    ("$sendMessage[general;hi]", {"type-gate"}, ("error", "is not of type Channel")),
    ("$color[4E5058]x", {"color-number"}, ("error", "ColorConvert")),
    ("$color[#4E5058]x", set(), ("out", "x")),
    ("$color[123456]x", {"color-number"}, ("out", "x")),               # decimal 123456, not #123456
    # semantics
    ("$jsonLoad[j;{}]$!jsonSet[j;id;123456789012345678901]$jsonStringify[j]", {"json-precision"},
     ("out", '{"id":123456789012345680000}')),
    ('$jsonLoad[j;{}]$!jsonSet[j;id;"123456789012345678901"]$jsonStringify[j]', set(),
     ("out", '{"id":"123456789012345678901"}')),
    ("$jsonSet[k;a;b;1]", {"json-path"}, ("out", "false")),
    ("$arrayLoad[a;,;1,2]$arrayIncludes[a;2]", {"array-includes"}, ("out", "false")),
    ('$arrayLoad[a;,;1,2]$arrayIncludes[a;"2"]', set(), ("out", "true")),
    ("$arrayLoad[a;,;]$arrayLength[a]", {"phantom-element"}, ("out", "1")),
    ("$arrayLoad[a;,]$arrayLength[a]", {"phantom-element"}, ("out", "1")),
    ("$arrayLoad[a]$arrayLength[a]", set(), ("out", "0")),
    ("$arrayLoad[a;]$arrayLength[a]", set(), ("out", "0")),
    ("$arrayLoad[a;,;x;y]$arrayLength[a]", {"arrayload-semicolons"}, ("out", "1")),
    ("$let[hi;$math[23-[$math[2-1]*5]]]hi=$get[hi]", {"bracket-in-arg"}, ("out", "]hi=")),
    ("$math[23-($math[2-1]*5)]", set(), ("out", "18")),
    ("$parseMS[10m]", {"parsems"}, ("error", "is not of type Number")),
    ("[$loop[3;x]]", {"loop-output"}, ("out", "[]")),
    ("$loop[3;$return[x]]", set(), ("out", "xxx")),
    ("$if[yes;a;b]", {"condition"}, ("out", "b")),
    ("$if[a==b==c;x;y]", {"condition"}, ("out", "y")),
    ("$checkCondition[1==1&&2==2]", {"condition"}, ("out", "false")),
    ("$let[x;v][$env[x]]", {"store-confusion"}, ("out", "[]")),
    ('$jsonLoad[j;{"a":1}][$get[j]]', {"store-confusion"}, ("out", "[]")),
    ("$title[hi]$cooldown[k;10s;slow down]", {"gate-sends-container"}, None),
    ("$addOption[a;b;c]", {"component-order"}, None),
    ("$interactionReply[$ephemeral Done]", set(), None),            # args run first: $ephemeral is in time
    ("$defer $ephemeral", {"ephemeral-late"}, None),
    ("Hi <@$authorID>", {"mention-ping"}, None),
    ("$title[x]$description[<@$authorID>]", set(), None),                                     # embeds never ping
    ("$if[$get[a]==1;$ephemeral$interactionReply[x];$interactionReply[y]]", set(), None),   # exclusive branches
    ("$if[$get[a]==1;$interactionReply[x];$ephemeral$interactionReply[y]]", set(), None),
    ("$addActionRow$if[$get[a]==1;$addButton[a;b;Primary]]", set(), None),                  # row ran before the $if
    ("$if[$get[a]==1;$addActionRow;x]$addButton[a;b;Primary]", {"component-order"}, None),  # row only in one branch
    ("$splitText[0]", {"split-order"}, None),
    ("$loop[-1;$return[x]]", {"infinite-loop"}, None),
]

IGNORED = {"experimental", "silent-flag", "deprecated"}  # mention-ping is tested explicitly below


def run_runtime(codes):
    payload = "".join(json.dumps({"id": i, "code": c}) + "\n" for i, c in enumerate(codes))
    p = subprocess.run(["node", str(HERE / "fsrun.js")], input=payload, capture_output=True, text=True,
                       env=dict(os.environ), timeout=600)
    if p.returncode:
        raise SystemExit(p.stderr[-2000:])
    out = {}
    for line in p.stdout.split("\n"):
        if line:
            d = json.loads(line)
            out[d["id"]] = d
    return out


def main():
    no_runtime = "--no-runtime" in sys.argv
    reg = fsparse.Registry.load(["ForgeScript"])
    lint = E.Linter(reg)
    # only run cases with a runtime expectation (some, like $loop[-1], would never finish)
    runnable = {i: c for i, (c, _, r) in enumerate(CASES) if r}
    rt = {} if no_runtime else dict(zip(runnable, run_runtime(list(runnable.values())).values()))
    fails = 0
    for i, (code, want, runtime) in enumerate(CASES):
        got = {f.rule for f in lint.lint(code)} - IGNORED
        problems = []
        if got != want:
            problems.append(f"rules {sorted(got)} != expected {sorted(want)}")
        if runtime and not no_runtime:
            r = rt[i]
            kind, val = runtime
            if kind == "out" and r["result"] != val:
                problems.append(f"runtime output {r['result']!r} != {val!r} (error={r['error']!r})")
            if kind == "error" and (r["result"] is not None or not r["error"] or val not in r["error"]):
                problems.append(f"runtime expected error containing {val!r}, got result={r['result']!r} error={r['error']!r}")
            if kind == "stopped" and (r["result"] is not None):
                problems.append(f"runtime expected the run to stop, got {r['result']!r}")
        if problems:
            fails += 1
            print(f"FAIL {code!r}")
            for p in problems:
                print("     " + p)
    checked = sum(1 for c in CASES if c[2]) if not no_runtime else 0
    print(f"{len(CASES) - fails}/{len(CASES)} cases pass ({checked} also checked on the real interpreter)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
