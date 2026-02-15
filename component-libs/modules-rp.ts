import { defineComponent } from "../src/index.js";

export const Pico = defineComponent({
  kind: "Module",
  name: "pico",
  pins: {
    VCC: { role: "power_in", vmin: 1.8, vmax: 3.6 },
    GND: { role: "gnd", vmin: 0, vmax: 0 },
    I2C_SDA: { role: "io", vmin: 0, vmax: 3.6, optional: true },
    I2C_SCL: { role: "io", vmin: 0, vmax: 3.6, optional: true },
    LED_GPIO: { role: "io", vmin: 0, vmax: 3.6, optional: true },
    RUN: { role: "io", vmin: 0, vmax: 3.6, optional: true },
    UART_TX: { role: "io", vmin: 0, vmax: 3.6, optional: true },
    UART_RX: { role: "io", vmin: 0, vmax: 3.6, optional: true }
  }
});
