import { Capacitor, Resistor } from "../component-libs/core-primitives.js";
import { Pico } from "../component-libs/modules-rp.js";
import { BME280 } from "../component-libs/sensors-bosch.js";
import { defineCircuit } from "../src/index.js";

const c = defineCircuit({ target: "pico" });

const u1 = c.addPart(Pico({ ref: "U_MCU" }));
const u2 = c.addPart(BME280({ ref: "U_BME280" }));
const rSda = c.addPart(Resistor({ ref: "R_SDA" }));
const rScl = c.addPart(Resistor({ ref: "R_SCL" }));
const c1 = c.addPart(Capacitor({ ref: "C1" }));

c.setPartProp("R_SDA", "value", "4.7kΩ");
c.setPartProp("R_SCL", "value", "4700ohm");
c.setPartProp("C1", "value", "0.1uF");

c.connect("VCC_3V3", u1.pins.VCC, u2.pins.VCC, rSda.pins["2"], rScl.pins["2"], c1.pins["1"]);
c.connect("GND", u1.pins.GND, u2.pins.GND, c1.pins["2"]);
c.connect("I2C_SDA", u1.pins.I2C_SDA, u2.pins.SDA, rSda.pins["1"]);
c.connect("I2C_SCL", u1.pins.I2C_SCL, u2.pins.SCL, rScl.pins["1"]);
 c.setNetVoltage("VCC_3V3", 3.3);
 c.setNetVoltage("GND", 0);

c.setI2c({
  sda: "I2C_SDA",
  scl: "I2C_SCL",
  vcc: "VCC_3V3"
});

export default c.toIR();
