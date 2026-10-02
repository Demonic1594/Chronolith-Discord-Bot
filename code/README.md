# code/ — user-submitted ForgeScript ground truth

**Submissions are hypotheses, not specs.** They may be outdated (written against older versions), subtly wrong (1-based reflexes, sibling-language habits), or contain upstream's own contradictions. They are still the highest-value evidence of *what people actually run and write* — but every claim must be diffed before it's believed.

## Conventions

- One file (or folder) per submission, kept exactly as received: `code/<name>/...`. Never edited in place.
- Analysis happens elsewhere — never inline in these files.

## The intake protocol (mandatory for every submission)

1. **Understand** — read it fully; identify every function, field, and behavioral claim it makes.
2. **Diff** — verify each against `../knowledge/` (metadata, signatures, coercion rules) and the harvested source (`execute()` bodies). Alias-check every "unknown" function before declaring absence.
3. **Explain to myself** — write how it *actually* behaves/operates/will work, mechanistically, in `../wisdom/` (the deep-dive files). Where the submission's mental model differs from the mechanism, say so explicitly.
4. **Correct if outdated or broken** — build my own version that is correct *for current `main`*, inside the wisdom file (a fixed recipe/skeleton), NOT by editing the submission.
5. **Verify the correction** — re-check the corrected version against knowledge + wisdom end to end: every function exists, every signature matches, every index/type/shape agrees with the docs, links resolve. A correction that isn't verified is just a newer bug.
6. **Record the audit** — append findings to `../wisdom/meta-lessons.md` (including bugs found in MY OWN prior outputs — those are audit targets too).

## Truth status of audited submissions

| Submission | Status | Notes |
|---|---|---|
| `advanced-timeout-system/` | ✅ current | verified against source; author updates match code |
| `id-search/` | ✅ current | all 69 functions verified; only composition semantics to learn |
| `autocomplete-tutorial/` | ✅ current | zero contradictions |
| `custom-functions-tutorial/` | ⚠️ incomplete | correct but omits direct invocation; my docs also had the two-system conflation — corrected |
| `migration-guide/` | ⚠️ self-contradicting | textSplit section says "we don't use $textSplit" then a DEPRECATED note reverses it — both paths exist; arrays recommended. Corrected version in `../wisdom/migration-map.md` |
| `amc/` | ✅ production | deployed music bot on pinned 2.7.1 — 221 functions verified, zero contradictions; led to documenting the off-registry Edge extension |
| `botforge-starter-kit/` | ✅ production | starter bot on 2.6.0 — zero contradictions in its code; exposed the `type:`-required shape my event examples lacked |
| `forgescriptbot/` | ✅ maintainer-canon | the lead dev's docs-bot on `#dev` — 108 fns verified; canon for class exports, eval shape, `$httpRequest` status returns; flags crosscheck passed |
