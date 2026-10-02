# study/ — the ForgeScript curriculum (kindergarten → PhD)

> Why this exists: `../../knowledge/` holds verified facts and `../` holds judgment, but *fluency* is a third thing — the ability to recall instantly, compose correctly under pressure, and debug by reflex. This folder trains fluency. It is written by me, for me (and any agent/human), as a study program over the entire corpus.

## How to study (the method)

Three parallel tracks at every level — train all three, they use different "muscles":

| Track | Trains | Exercise form |
|---|---|---|
| **READ** | comprehension — what does this code do? | predict output / find the bug by reading |
| **WRITE** | composition — produce correct code from a spec | build snippets/systems against requirements |
| **FIX** | debugging — repair broken code | diagnose the failure mode and correct it |

Study loop per level: read the lessons → do exercises WITHOUT looking at answers → check the key → for every miss, find the underlying rule in `../../knowledge/` and re-derive it → log the miss in `ledger.md`. A level is "passed" when you can clear its FIX track in one sitting with zero rule-lookup misses.

## The levels

| File | Level | You are done when… |
|---|---|---|
| `00-kindergarten.md` | Foundations | every token in a snippet is identifiable in one pass |
| `01-elementary.md` | Types & data | you can predict arg-gate pass/fail before running |
| `02-middle-school.md` | Control & arrays | loops/filters compose without thinking about `$env[i]` bases |
| `03-highschool.md` | Interactions & UI | a full component flow (defer→buttons→update) is muscle memory |
| `04-college.md` | Systems in-language | custom functions, JSON pipelines, HTTP, persistence — correctly scoped |
| `05-masters.md` | Architecture | you design the *shape* of a bot (TS bridges, caches, namespaces) before writing any command |
| `06-phd.md` | The language itself | you can reason about performance, drift, and compiler edge cases from first principles |
| `exam-comprehensive.md` | Doctoral exam | 8 hard build/diagnose problems, model solutions included |
| `banks/` | Generated drill banks | 300+ machine-verified rapid-recall items (the one generated corner of wisdom/ — see note) |
| `ledger.md` | Progress | scores and rule-misses per session |

Note on `banks/`: these files are FACT derivatives auto-built from metadata by `../../knowledge/_tools/build_drills.py` — regenerable, never hand-edited. Everything else in wisdom/ stays hand-written; the drill builder writes **only** into `banks/`.

## Standing rules for this curriculum

1. Every code sample in the lessons is verified against `../../knowledge/` (or marks its uncertainty explicitly).
2. Exercises must be attempted cold. Looking answers up mid-exercise trains recognition, not recall.
3. Answer keys include *why*, not just *what* — the rule behind each answer is the actual learning unit.
4. When the underlying library drifts (post-`refresh.sh`), lessons 00–06 may contain stale specifics: re-verify any rule against `../../knowledge/` before trusting it in production code. The drill banks regenerate with the data.
