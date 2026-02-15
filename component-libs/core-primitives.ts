import { defineComponent } from "../src/index.js";

export const Resistor = defineComponent({
  kind: "Passive",
  name: "resistor",
  pins: {
    "1": {},
    "2": {}
  }
});

export const Capacitor = defineComponent({
  kind: "Passive",
  name: "capacitor",
  pins: {
    "1": {},
    "2": {}
  }
});

export const Led = defineComponent({
  kind: "Passive",
  name: "led",
  pins: {
    A: {},
    K: {}
  }
});

export const Switch = defineComponent({
  kind: "Passive",
  name: "switch",
  pins: {
    "1": {},
    "2": {}
  }
});

export const Ldo3v3 = defineComponent({
  kind: "Power",
  name: "ldo_3v3",
  pins: {
    VIN: { role: "power_in", vmin: 4.5, vmax: 16 },
    VOUT: { role: "power_out", vmin: 3.2, vmax: 3.4 },
    GND: { role: "gnd", vmin: 0, vmax: 0 }
  }
});

export const Boost5v = defineComponent({
  kind: "Power",
  name: "boost_5v",
  pins: {
    VIN: { role: "power_in", vmin: 2.5, vmax: 4.2 },
    VOUT: { role: "power_out", vmin: 4.8, vmax: 5.2 },
    GND: { role: "gnd", vmin: 0, vmax: 0 }
  }
});

export const LevelShifter = defineComponent({
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

export const NmosLowSide = defineComponent({
  kind: "Switch",
  name: "mosfet_nch",
  pins: {
    G: { role: "io", netRole: "signal" },
    D: { role: "io", higherThan: ["S"], notSameNetWith: ["S"] },
    S: { role: "io", netRole: "gnd", lowerThan: ["D"], notSameNetWith: ["D"] }
  }
});

export const PmosHighSide = defineComponent({
  kind: "Switch",
  name: "mosfet_pch",
  pins: {
    G: { role: "io", netRole: "signal" },
    D: { role: "io", lowerThan: ["S"], notSameNetWith: ["S"] },
    S: { role: "io", netRole: "power", higherThan: ["D"], notSameNetWith: ["D"] }
  }
});

export const NpnLowSide = defineComponent({
  kind: "Switch",
  name: "bjt_npn",
  pins: {
    B: { role: "io", netRole: "signal" },
    C: { role: "io", higherThan: ["E"], notSameNetWith: ["E"] },
    E: { role: "io", netRole: "gnd", lowerThan: ["C"], notSameNetWith: ["C"] }
  }
});

export const PnpHighSide = defineComponent({
  kind: "Switch",
  name: "bjt_pnp",
  pins: {
    B: { role: "io", netRole: "signal" },
    C: { role: "io", lowerThan: ["E"], notSameNetWith: ["E"] },
    E: { role: "io", netRole: "power", higherThan: ["C"], notSameNetWith: ["C"] }
  }
});
