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
- `npm run generate:pico` (from `examples/pico_bme280_led.scm` to `out/pico_bme280_led/`)
- `npm run check:all`
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
5. Define net voltage with `setNetVoltage(...)` when known (recommended)
6. Connect nets with `connect(...)`
7. Set I2C constraint with `setI2c(...)`
8. Export `default c.toIR()`
9. For reusable module libraries, mark non-required pins as `optional: true`

Library-first recommendation:

Package-side requirement definition:

- Components can declare `requires` (e.g., pull-up resistor, decoupling capacitor).
- `lint` enforces these and reports `E007` if missing.

- Keep only primitives in core.
- Put sensors/modules in external component libraries and import them.
- Example imports in this repo:
  - `component-libs/sensors-bosch.ts`
  - `component-libs/modules-rp.ts`
  - `component-libs/core-primitives.ts`

See examples:

- `examples/minimal.ts`
- `examples/pico_bme280_led.ts`
- `examples/power_levelshift.ts` (LDO + boost + level shifter)
- `examples/minimal.scm`
- `examples/pico_bme280_led.scm`
- `examples/power_levelshift.scm`

Example (external library style):

```ts
import { BME280 } from "../component-libs/sensors-bosch.js";
import { Pico } from "../component-libs/modules-rp.js";
import { Resistor } from "../component-libs/core-primitives.js";
```

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
- `E004`: short-circuit risk (ground pins + power pins on same net)
- `E005`: overvoltage risk (net voltage exceeds pin `vmax`)
- `E006`: transistor/FET orientation or connection risk
- `E007`: connection component missing (component `requires` contract violation)

## Validation Scope (Current)

What `fmt` does:

- Parses supported circuit S-expression and rewrites to canonical order.
- Normalizes known resistor/capacitor unit formats.
- Produces deterministic canonical output for identical input.

What `lint` checks:

- Reference consistency (component/pin/net existence): `E001`
- Unconnected pins: `E002`
- I2C pull-up presence on both SDA and SCL to VCC: `E003`
- Short-circuit risk using pin roles (`gnd`, `power_in`, `power_out`) and net voltage: `E004`
- Overvoltage risk using explicit net voltage vs pin `vmax`: `E005`
- Orientation/connection risk for BJT/MOSFET pin usage: `E006`
- Connection-component requirements declared in component definitions (`requires`): `E007`

Notes:

- `E002` ignores pins explicitly marked `optional: true`.
- `E006` is contract-based (pin constraints like `net_role`, `lt`, `gt`, `neq`), not name-pattern based.
- `E007` reports the missing requirement id/tag (for example `[flyback_diode]`, `[led_series_resistor]`).

What is not checked yet:

- Full electrical validity (current limits, timing, SI/PI)
- Complete ERC-grade voltage/domain compatibility (current checks require explicit `setNetVoltage` and pin ranges)
- Footprint/package validity and PCB manufacturability
- Runtime firmware correctness
- Advanced bus semantics (I2C address conflicts, SPI/UART protocol constraints)
