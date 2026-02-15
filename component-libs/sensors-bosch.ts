import { defineComponent } from "../src/index.js";

export const BME280 = defineComponent({
  kind: "IC",
  name: "bme280",
  pins: {
    VCC: { role: "power_in", vmin: 1.71, vmax: 3.6 },
    GND: { role: "gnd", vmin: 0, vmax: 0 },
    SDA: { role: "io", vmin: 0, vmax: 3.6 },
    SCL: { role: "io", vmin: 0, vmax: 3.6 }
  }
});
