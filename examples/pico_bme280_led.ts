import { Capacitor, Led, Resistor, Switch } from "../component-libs/core-primitives.js";
import { Pico } from "../component-libs/modules-rp.js";
import { BME280 } from "../component-libs/sensors-bosch.js";
import { defineCircuit } from "../src/index.js";

const c = defineCircuit({ target: "pico" });

const uPico = c.addPart(Pico({ ref: "U_PICO" }));
const uBme = c.addPart(BME280({ ref: "U_BME280" }));
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
