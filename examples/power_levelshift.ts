import { defineCircuit, defineComponent } from "../src/index.js";

const Pico = defineComponent({
  kind: "Module",
  name: "pico",
  pins: {
    VCC: { role: "power_in", vmin: 1.8, vmax: 3.6 },
    GND: { role: "gnd", vmin: 0, vmax: 0 },
    UART_TX: { role: "io", vmin: 0, vmax: 3.6 },
    UART_RX: { role: "io", vmin: 0, vmax: 3.6 }
  }
});

const Ldo3v3 = defineComponent({
  kind: "Power",
  name: "ldo_3v3",
  pins: {
    VIN: { role: "power_in", vmin: 4.5, vmax: 16 },
    VOUT: { role: "power_out", vmin: 3.2, vmax: 3.4 },
    GND: { role: "gnd", vmin: 0, vmax: 0 }
  }
});

const Boost5v = defineComponent({
  kind: "Power",
  name: "boost_5v",
  pins: {
    VIN: { role: "power_in", vmin: 2.5, vmax: 4.2 },
    VOUT: { role: "power_out", vmin: 4.8, vmax: 5.2 },
    GND: { role: "gnd", vmin: 0, vmax: 0 }
  }
});

const LevelShifter = defineComponent({
  kind: "Interface",
  name: "level_shifter",
  pins: {
    LV: { role: "power_in", vmin: 1.65, vmax: 3.6 },
    HV: { role: "power_in", vmin: 4.5, vmax: 5.5 },
    GND: { role: "gnd", vmin: 0, vmax: 0 },
    A1: { role: "io", vmin: 0, vmax: 3.6 },
    B1: { role: "io", vmin: 0, vmax: 5.5 },
    A2: { role: "io", vmin: 0, vmax: 3.6 },
    B2: { role: "io", vmin: 0, vmax: 5.5 }
  }
});

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
