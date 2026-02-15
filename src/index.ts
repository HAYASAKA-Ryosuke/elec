export type Target = "arduino" | "esp32" | "pico" | "m5stack";

export type PinName = string;

export type ComponentDef = {
  kind: string;
  name: string;
  pins: Record<PinName, { func?: string | readonly string[] }>;
};

export type Part = {
  ref: string;
  type: string;
  props: Record<string, string>;
  pins: Record<PinName, { partRef: string; pin: string }>;
};

export type NetConn = { comp: string; pin: string };

export type NetDef = {
  name: string;
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
    pins: string[];
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
    for (const pin of Object.keys(def.pins)) {
      pins[pin] = { partRef: args.ref, pin };
    }
    return {
      ref: args.ref,
      type: def.name,
      props: {},
      pins
    };
  };
}

export class CircuitBuilder {
  private readonly parts: Part[] = [];
  private readonly nets = new Map<string, NetConn[]>();
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

  toIR(): CircuitIR {
    const components = this.parts.map((p) => ({
      id: p.ref,
      type: p.type.toLowerCase(),
      pins: Object.keys(p.pins),
      props: { ...p.props }
    }));

    const nets: NetDef[] = [];
    for (const [name, connect] of this.nets) {
      nets.push({ name, connect: [...connect] });
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
