# elec

TypeScript-first circuit DSL toolchain.

## Quick Start

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Generate SCM from TS: `npm run ts2scm`
4. Validate canonical form: `npm run fmt:check`
5. Run semantic checks: `npm run lint`

## Commands

- `npm run build`
- `npm run ts2scm` (generates `examples/minimal.scm` from `examples/minimal.ts`)
- `npm run fmt` / `npm run fmt:check`
- `npm run lint`
- Arbitrary TS -> SCM:
  - `node dist/src/cli.js ts2scm examples/pico_bme280_led.ts -o examples/pico_bme280_led.scm`
- Arbitrary SCM checks:
  - `node dist/src/cli.js fmt --check <file.scm>`
  - `node dist/src/cli.js lint <file.scm>`

## How To Write TS Circuit

Use this pattern:

1. Define components with `defineComponent(...)`
2. Create circuit with `defineCircuit({ target: "pico" })`
3. Add parts with `addPart(...)`
4. Set values with `setPartProp(...)` (for resistors/capacitors etc.)
5. Connect nets with `connect(...)`
6. Set I2C constraint with `setI2c(...)`
7. Export `default c.toIR()`

See examples:

- `examples/minimal.ts`
- `examples/pico_bme280_led.ts`
- `examples/minimal.scm`
- `examples/pico_bme280_led.scm`

## DSL flow

1. Write circuit in TypeScript (`defineComponent`, `CircuitBuilder`)
2. Export IR as default export
3. Convert to canonical S-expression (`ts2scm`)
4. Run `fmt` and `lint` as quality gates

## After SCM Is Generated

Recommended flow:

1. Run `fmt --check` on the SCM
2. Run `lint` on the SCM
3. Commit both `*.ts` and `*.scm` together
4. Let CI gate the PR with `build -> ts2scm -> fmt:check -> lint`

If `fmt --check` fails, run `fmt` to rewrite canonical form.
If `lint` fails, fix TS source and regenerate SCM.

## Intent And Skills

- `circuit.scm` is the hardware source of truth.
- `intent.scm` is planned as a separate behavior source of truth (app goals/rules/telemetry).
- Skill template for intent authoring is included at:
  - `skills/intent-authoring/SKILL.md`
  - `skills/intent-authoring/references/intent-template.scm`
- Skill for TypeScript circuit DSL authoring is included at:
  - `skills/ts-circuit-dsl/SKILL.md`
  - `skills/ts-circuit-dsl/references/api-patterns.md`

## Lint rules

- `E001`: undefined component/pin/net reference
- `E002`: unconnected pin
- `E003`: missing I2C pull-up (both SDA and SCL required)
