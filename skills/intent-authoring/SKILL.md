---
name: intent-authoring
description: Create and validate intent.scm from product requirements, align it with circuit.scm, and prepare deterministic inputs for code generation.
---

# Intent Authoring

Use this skill when the task is to translate human requirements into `intent.scm` for `elec` workflows.

## Inputs

- Requirement text (`spec.md`, chat text, ticket text)
- Optional `circuit.scm` (recommended for consistency checks)

## Output Contract

Produce:

1. `intent.scm` in canonical field order
2. Short assumptions list
3. Short mismatch report against `circuit.scm` (if provided)

## Canonical Intent Shape

Use this minimal shape and field order:

```lisp
(intent
  (app <app_name>)
  (read <sensor_name> (interval_ms <int>))
  (rule (if (<predicate>)) (then (<action>)))
  (telemetry (stdout <true|false>))
)
```

If a section is unknown, keep it explicit with safe defaults rather than omitting silently.

## Workflow

1. Extract requirements into structured slots: app/read/rules/telemetry.
2. Choose deterministic defaults when missing:
- `interval_ms`: `1000`
- `telemetry.stdout`: `true`
- No dangerous actuator actions unless explicitly requested.
3. If `circuit.scm` exists, verify referenced sensors/actuators are physically present.
4. Render `intent.scm` in canonical order shown above.
5. Run validator commands if available:
- `elec intent fmt intent.scm`
- `elec intent lint intent.scm [--circuit circuit.scm]`
6. If validator commands are unavailable, still emit `intent.scm` and clearly report validation gap.

## Safety Constraints

- Do not infer destructive behavior (e.g., relay activation) from vague text.
- Keep thresholds conservative when not specified.
- Flag contradictions instead of guessing (e.g., "no telemetry" + "send logs").

## Reference Files

- Template: `references/intent-template.scm`
- Review checklist: `references/review-checklist.md`
