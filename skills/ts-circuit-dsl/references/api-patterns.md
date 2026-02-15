# API Patterns

## Minimal Pattern

```ts
import { defineCircuit, defineComponent } from "../src/index.js";

const Part = defineComponent({
  kind: "Passive",
  name: "resistor",
  pins: { "1": {}, "2": {} }
});

const c = defineCircuit({ target: "pico" });
const r1 = c.addPart(Part({ ref: "R1" }));

c.setPartProp("R1", "value", "4.7kΩ");
c.connect("NET_A", r1.pins["1"]);
c.connect("NET_B", r1.pins["2"]);

export default c.toIR();
```

## I2C Pattern

- Ensure SDA/SCL each have pull-up resistors to VCC.
- Set I2C constraint:

```ts
c.setI2c({ sda: "I2C_SDA", scl: "I2C_SCL", vcc: "VCC_3V3" });
```

## Existing examples

- `examples/minimal.ts`
- `examples/pico_bme280_led.ts`
