---
name: ts-circuit-dsl
description: Write and review TypeScript circuit DSL for elec, then generate canonical scm with ts2scm and validate with fmt/lint.
---

# TS Circuit DSL

Use this skill when the user wants to create or modify circuit definitions in TypeScript (`examples/*.ts`) for `elec`.

## Goal

Produce valid, deterministic circuit specs in TS, then convert to canonical `.scm` and validate.

## Required Flow

1. Define component templates with `defineComponent(...)`.
2. Create circuit with `defineCircuit({ target: "pico" | ... })`.
3. Add instances via `addPart(...)`.
4. Set component values via `setPartProp(...)`.
5. Connect nets via `connect(...)`.
6. Define bus constraints (currently `setI2c(...)` for I2C).
7. Export `default c.toIR()`.
8. Run:
- `npm run build`
- `node dist/src/cli.js ts2scm <input.ts> -o <output.scm>`
- `node dist/src/cli.js fmt --check <output.scm>`
- `node dist/src/cli.js lint <output.scm>`

## Rules

- Keep naming stable and explicit (`U_*`, `R_*`, `C_*`, net names).
- Do not mutate IR directly. Use builder APIs.
- Keep outputs deterministic by relying on canonical generator, not manual SCM edits.
- If lint fails, fix TS and regenerate SCM.

## References

- API examples: `references/api-patterns.md`
- Authoring checklist: `references/checklist.md`
