import { defineCircuit, defineComponent } from "../src/index.js";

const Pico = defineComponent({
  kind: "Module",
  name: "pico",
  pins: {
    VCC: { role: "power_in", vmin: 1.8, vmax: 3.6 },
    GND: { role: "gnd", vmin: 0, vmax: 0 },
    I2C_SDA: { role: "io", vmin: 0, vmax: 3.6 },
    I2C_SCL: { role: "io", vmin: 0, vmax: 3.6 },
    LED_GPIO: { role: "io", vmin: 0, vmax: 3.6 },
    RUN: { role: "io", vmin: 0, vmax: 3.6 }
  }
});

const Bme280 = defineComponent({
  kind: "IC",
  name: "bme280",
  pins: {
    VCC: { role: "power_in", vmin: 1.71, vmax: 3.6 },
    GND: { role: "gnd", vmin: 0, vmax: 0 },
    SDA: { role: "io", vmin: 0, vmax: 3.6 },
    SCL: { role: "io", vmin: 0, vmax: 3.6 }
  }
});

const Resistor = defineComponent({
  kind: "Passive",
  name: "resistor",
  pins: {
    "1": {},
    "2": {}
  }
});

const Capacitor = defineComponent({
  kind: "Passive",
  name: "capacitor",
  pins: {
    "1": {},
    "2": {}
  }
});

const Led = defineComponent({
  kind: "Passive",
  name: "led",
  pins: {
    A: {},
    K: {}
  }
});

const Switch = defineComponent({
  kind: "Passive",
  name: "switch",
  pins: {
    "1": {},
    "2": {}
  }
});

const c = defineCircuit({ target: "pico" });

const uPico = c.addPart(Pico({ ref: "U_PICO" }));
const uBme = c.addPart(Bme280({ ref: "U_BME280" }));
const rSda = c.addPart(Resistor({ ref: "R_SDA" }));
const rScl = c.addPart(Resistor({ ref: "R_SCL" }));
const cBme = c.addPart(Capacitor({ ref: "C_BME" }));
const rLed = c.addPart(Resistor({ ref: "R_LED" }));
const d1 = c.addPart(Led({ ref: "D1" }));
const swReset = c.addPart(Switch({ ref: "SW_RESET" }));
const rRun = c.addPart(Resistor({ ref: "R_RUN" }));

c.setPartProp("R_SDA", "value", "4.7kΩ");
c.setPartProp("R_SCL", "value", "4.7kΩ");
c.setPartProp("C_BME", "value", "0.1uF");
c.setPartProp("R_LED", "value", "330ohm");
c.setPartProp("R_RUN", "value", "10kohm");

c.connect("VCC_3V3", uPico.pins.VCC, uBme.pins.VCC, rSda.pins["2"], rScl.pins["2"], cBme.pins["1"], rRun.pins["2"]);
c.connect("GND", uPico.pins.GND, uBme.pins.GND, cBme.pins["2"], d1.pins.K, swReset.pins["2"]);
c.connect("I2C_SDA", uPico.pins.I2C_SDA, uBme.pins.SDA, rSda.pins["1"]);
c.connect("I2C_SCL", uPico.pins.I2C_SCL, uBme.pins.SCL, rScl.pins["1"]);
c.connect("LED_SIG", uPico.pins.LED_GPIO, rLed.pins["1"]);
c.connect("LED_ANODE", rLed.pins["2"], d1.pins.A);
c.connect("RUN", uPico.pins.RUN, swReset.pins["1"], rRun.pins["1"]);
 c.setNetVoltage("VCC_3V3", 3.3);
 c.setNetVoltage("GND", 0);
 c.setNetVoltage("RUN", 3.3);
 c.setNetVoltage("LED_SIG", 3.3);
 c.setNetVoltage("LED_ANODE", 3.3);

c.setI2c({
  sda: "I2C_SDA",
  scl: "I2C_SCL",
  vcc: "VCC_3V3"
});

export default c.toIR();
