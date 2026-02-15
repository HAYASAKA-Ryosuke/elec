export type Target = "arduino" | "esp32" | "pico" | "m5stack";

export type PinName = string;
export type PinRole = "io" | "gnd" | "power_in" | "power_out";

export type PinSpec = {
  role?: PinRole;
  vmin?: number;
  vmax?: number;
  optional?: boolean;
  class?: string;
  netRole?: "gnd" | "power" | "signal";
  lowerThan?: string[];
  higherThan?: string[];
  notSameNetWith?: string[];
};

export type ComponentDef = {
  kind: string;
  name: string;
  pins: Record<PinName, PinSpec & { func?: string | readonly string[] }>;
};

export type Part = {
  ref: string;
  type: string;
  props: Record<string, string>;
  pinSpecs: Record<PinName, PinSpec>;
  pins: Record<PinName, { partRef: string; pin: string }>;
};

export type NetConn = { comp: string; pin: string };

export type NetDef = {
  name: string;
  voltage?: number;
  connect: NetConn[];
};

export type I2cConstraint = {
  sda: string;
  scl: string;
  vcc: string;
};

export type CircuitIR = {
  target?: Target;
  components: Array<{
    id: string;
    type: string;
    pins: Array<{
      name: string;
      role?: PinRole;
      vmin?: number;
      vmax?: number;
      optional?: boolean;
      class?: string;
      netRole?: "gnd" | "power" | "signal";
      lowerThan?: string[];
      higherThan?: string[];
      notSameNetWith?: string[];
    }>;
    props: Record<string, string>;
  }>;
  nets: NetDef[];
  constraints: {
    i2c?: I2cConstraint;
  };
};

export function defineComponent<TDef extends ComponentDef>(def: TDef) {
  return function createPart(args: { ref: string }): Part {
    const pins: Part["pins"] = {};
    const pinSpecs: Part["pinSpecs"] = {};
    for (const pin of Object.keys(def.pins)) {
      pins[pin] = { partRef: args.ref, pin };
      const spec = def.pins[pin] ?? {};
      pinSpecs[pin] = {
        role: spec.role,
        vmin: spec.vmin,
        vmax: spec.vmax,
        optional: spec.optional,
        class: spec.class,
        netRole: spec.netRole,
        lowerThan: spec.lowerThan ? [...spec.lowerThan] : undefined,
        higherThan: spec.higherThan ? [...spec.higherThan] : undefined,
        notSameNetWith: spec.notSameNetWith ? [...spec.notSameNetWith] : undefined
      };
    }
    return {
      ref: args.ref,
      type: def.name,
      props: {},
      pinSpecs,
      pins
    };
  };
}

export class CircuitBuilder {
  private readonly parts: Part[] = [];
  private readonly nets = new Map<string, NetConn[]>();
  private readonly netVoltages = new Map<string, number>();
  private i2c?: I2cConstraint;

  constructor(private readonly target?: Target) {}

  addPart(part: Part): Part {
    this.parts.push(part);
    return part;
  }

  setPartProp(partRef: string, key: string, value: string): void {
    const part = this.parts.find((p) => p.ref === partRef);
    if (!part) {
      throw new Error(`part not found: ${partRef}`);
    }
    part.props[key] = value;
  }

  connect(net: string, ...pins: Array<{ partRef: string; pin: string }>): NetDef {
    const entries = this.nets.get(net) ?? [];
    for (const p of pins) {
      entries.push({ comp: p.partRef, pin: p.pin });
    }
    this.nets.set(net, entries);
    return { name: net, connect: [...entries] };
  }

  setI2c(i2c: I2cConstraint): void {
    this.i2c = i2c;
  }

  setNetVoltage(net: string, voltage: number): void {
    if (!this.nets.has(net)) {
      this.nets.set(net, []);
    }
    this.netVoltages.set(net, voltage);
  }

  toIR(): CircuitIR {
    const components = this.parts.map((p) => ({
      id: p.ref,
      type: p.type.toLowerCase(),
      pins: Object.keys(p.pins).map((name) => ({
        name,
        role: p.pinSpecs[name]?.role,
        vmin: p.pinSpecs[name]?.vmin,
        vmax: p.pinSpecs[name]?.vmax,
        optional: p.pinSpecs[name]?.optional,
        class: p.pinSpecs[name]?.class,
        netRole: p.pinSpecs[name]?.netRole,
        lowerThan: p.pinSpecs[name]?.lowerThan ? [...(p.pinSpecs[name]?.lowerThan ?? [])] : undefined,
        higherThan: p.pinSpecs[name]?.higherThan ? [...(p.pinSpecs[name]?.higherThan ?? [])] : undefined,
        notSameNetWith: p.pinSpecs[name]?.notSameNetWith ? [...(p.pinSpecs[name]?.notSameNetWith ?? [])] : undefined
      })),
      props: { ...p.props }
    }));

    const nets: NetDef[] = [];
    for (const [name, connect] of this.nets) {
      nets.push({ name, voltage: this.netVoltages.get(name), connect: [...connect] });
    }

    return {
      target: this.target,
      components,
      nets,
      constraints: {
        i2c: this.i2c
      }
    };
  }
}

export function defineCircuit(input: { target?: Target }): CircuitBuilder {
  return new CircuitBuilder(input.target);
}
