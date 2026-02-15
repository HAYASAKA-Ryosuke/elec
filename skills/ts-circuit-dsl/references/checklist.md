# TS DSL Checklist

1. Component refs are unique.
2. Each pin name used in `connect(...)` exists in its component definition.
3. Passive values are provided where needed (`value` prop).
4. I2C constraints are defined when I2C nets exist.
5. Both SDA and SCL pull-ups are present to VCC.
6. `export default c.toIR()` is present.
7. Generated SCM passes fmt/lint.
