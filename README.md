# elec

TypeScript-first circuit DSL toolchain.

## Commands

- `npm run build`
- `npm run ts2scm` (generates `examples/minimal.scm` from `examples/minimal.ts`)
- `npm run fmt` / `npm run fmt:check`
- `npm run lint`

## DSL flow

1. Write circuit in TypeScript (`defineComponent`, `CircuitBuilder`)
2. Export IR as default export
3. Convert to canonical S-expression (`ts2scm`)
4. Run `fmt` and `lint` as quality gates

## Lint rules

- `E001`: undefined component/pin/net reference
- `E002`: unconnected pin
- `E003`: missing I2C pull-up (both SDA and SCL required)
