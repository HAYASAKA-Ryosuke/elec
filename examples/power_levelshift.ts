import { Boost5v, Ldo3v3, LevelShifter } from "../component-libs/core-primitives.js";
import { Pico } from "../component-libs/modules-rp.js";
import { defineCircuit, defineComponent } from "../src/index.js";

const Uart5vDevice = defineComponent({
  kind: "Peripheral",
  name: "uart_5v_device",
  pins: {
    VCC: { role: "power_in", vmin: 4.5, vmax: 5.5 },
    GND: { role: "gnd", vmin: 0, vmax: 0 },
    RX: { role: "io", vmin: 0, vmax: 5.5 },
    TX: { role: "io", vmin: 0, vmax: 5.5 }
  }
});

const c = defineCircuit({ target: "pico" });

const uPico = c.addPart(Pico({ ref: "U_PICO" }));
const uLdo = c.addPart(Ldo3v3({ ref: "U_LDO" }));
const uBoost = c.addPart(Boost5v({ ref: "U_BOOST" }));
const uLsh = c.addPart(LevelShifter({ ref: "U_LSH" }));
const uDev5 = c.addPart(Uart5vDevice({ ref: "U_DEV5" }));

c.connect("VBAT", uLdo.pins.VIN, uBoost.pins.VIN);
c.connect("VCC_3V3", uLdo.pins.VOUT, uPico.pins.VCC, uLsh.pins.LV);
c.connect("VCC_5V", uBoost.pins.VOUT, uLsh.pins.HV, uDev5.pins.VCC);
c.connect("GND", uLdo.pins.GND, uBoost.pins.GND, uPico.pins.GND, uLsh.pins.GND, uDev5.pins.GND);

c.connect("UART_TX_3V3", uPico.pins.UART_TX, uLsh.pins.A1);
c.connect("UART_TX_5V", uLsh.pins.B1, uDev5.pins.RX);
c.connect("UART_RX_5V", uDev5.pins.TX, uLsh.pins.B2);
c.connect("UART_RX_3V3", uLsh.pins.A2, uPico.pins.UART_RX);

c.setNetVoltage("VBAT", 3.7);
c.setNetVoltage("VCC_3V3", 3.3);
c.setNetVoltage("VCC_5V", 5.0);
c.setNetVoltage("GND", 0);
c.setNetVoltage("UART_TX_3V3", 3.3);
c.setNetVoltage("UART_TX_5V", 5.0);
c.setNetVoltage("UART_RX_5V", 5.0);
c.setNetVoltage("UART_RX_3V3", 3.3);

export default c.toIR();
