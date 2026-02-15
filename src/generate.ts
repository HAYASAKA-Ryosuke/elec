import type { CircuitIR } from "./index.js";

type GeneratedFile = {
  path: string;
  content: string;
};

type NetMap = Map<string, Array<{ comp: string; pin: string }>>;

function buildNetMap(ir: CircuitIR): NetMap {
  const map: NetMap = new Map();
  for (const net of [...ir.nets].sort((a, b) => a.name.localeCompare(b.name))) {
    const conns = [...net.connect].sort((a, b) => a.comp.localeCompare(b.comp) || a.pin.localeCompare(b.pin));
    map.set(net.name, conns);
  }
  return map;
}

function findNetForPin(netMap: NetMap, comp: string, pin: string): string | undefined {
  const names = [...netMap.keys()].sort((a, b) => a.localeCompare(b));
  for (const net of names) {
    const conns = netMap.get(net) ?? [];
    if (conns.some((c) => c.comp === comp && c.pin === pin)) {
      return net;
    }
  }
  return undefined;
}

function renderWiring(ir: CircuitIR): string {
  const lines: string[] = [];
  lines.push("# Wiring Summary");
  lines.push("");

  const comps = [...ir.components].sort((a, b) => a.id.localeCompare(b.id));
  lines.push("## Components");
  for (const c of comps) {
    lines.push(`- ${c.id}: ${c.type}`);
  }
  lines.push("");

  lines.push("## Nets");
  for (const net of [...ir.nets].sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`- ${net.name}`);
    for (const c of [...net.connect].sort((a, b) => a.comp.localeCompare(b.comp) || a.pin.localeCompare(b.pin))) {
      lines.push(`  - ${c.comp}.${c.pin}`);
    }
  }
  lines.push("");

  if (ir.constraints.i2c) {
    lines.push("## I2C Constraint");
    lines.push(`- SDA net: ${ir.constraints.i2c.sda}`);
    lines.push(`- SCL net: ${ir.constraints.i2c.scl}`);
    lines.push(`- VCC net: ${ir.constraints.i2c.vcc}`);
    lines.push("");
  }

  lines.push("## Notes");
  lines.push("- GPIO pin numbers are placeholders in generated code.");
  lines.push("- Set actual RP2040 GPIO numbers before deployment.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function renderPicoMainPy(ir: CircuitIR): string {
  const netMap = buildNetMap(ir);

  const pico = [...ir.components]
    .sort((a, b) => a.id.localeCompare(b.id))
    .find((c) => c.type === "pico");
  const bme = [...ir.components]
    .sort((a, b) => a.id.localeCompare(b.id))
    .find((c) => c.type === "bme280");

  const sdaNet = ir.constraints.i2c?.sda ?? "I2C_SDA";
  const sclNet = ir.constraints.i2c?.scl ?? "I2C_SCL";

  const picoSdaPinName = pico?.pins.some((p) => p.name === "I2C_SDA") ? "I2C_SDA" : "<SET_GPIO_PIN>";
  const picoSclPinName = pico?.pins.some((p) => p.name === "I2C_SCL") ? "I2C_SCL" : "<SET_GPIO_PIN>";

  const ledNet = pico ? findNetForPin(netMap, pico.id, "LED_GPIO") : undefined;
  const hasLed = Boolean(ledNet);

  const lines: string[] = [];
  lines.push("from machine import I2C, Pin");
  lines.push("import time");
  lines.push("");
  lines.push("# Replace these placeholders with actual RP2040 GPIO numbers.");
  lines.push(`SDA_GPIO = 0  # net=${sdaNet}, logical_pin=${picoSdaPinName}`);
  lines.push(`SCL_GPIO = 1  # net=${sclNet}, logical_pin=${picoSclPinName}`);
  if (hasLed) {
    lines.push(`LED_GPIO = 25  # net=${ledNet}`);
  }
  lines.push("");
  lines.push("# BME280 default address is often 0x76 (sometimes 0x77). Adjust if needed.");
  lines.push("BME280_ADDR = 0x76");
  lines.push("");
  lines.push("i2c = I2C(0, scl=Pin(SCL_GPIO), sda=Pin(SDA_GPIO), freq=400000)");
  if (hasLed) {
    lines.push("led = Pin(LED_GPIO, Pin.OUT)");
  }
  lines.push("");
  lines.push("def read_bme280_raw_temp():");
  lines.push("    # Minimal placeholder read (chip-id register). Replace with full driver for production.");
  lines.push("    chip_id = i2c.readfrom_mem(BME280_ADDR, 0xD0, 1)[0]");
  lines.push("    return chip_id");
  lines.push("");
  lines.push("while True:");
  lines.push("    try:");
  lines.push("        chip_id = read_bme280_raw_temp()");
  if (bme) {
    lines.push(`        print(\"${bme.id} chip-id:\", hex(chip_id))`);
  } else {
    lines.push("        print(\"BME280 chip-id:\", hex(chip_id))");
  }
  if (hasLed) {
    lines.push("        led.toggle()");
  }
  lines.push("    except Exception as e:");
  lines.push("        print(\"I2C/BME280 error:\", e)");
  lines.push("    time.sleep(1)");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

export function generateForPico(ir: CircuitIR): GeneratedFile[] {
  const files: GeneratedFile[] = [
    { path: "main.py", content: renderPicoMainPy(ir) },
    { path: "wiring.md", content: renderWiring(ir) }
  ];

  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}
