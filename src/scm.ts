import type { CircuitIR } from "./index.js";

type Pos = { line: number; col: number };
type SExpr = { kind: "atom"; value: string; pos: Pos } | { kind: "list"; items: SExpr[]; pos: Pos };

type ParseError = { message: string; pos: Pos };

function parseError(message: string, pos: Pos): never {
  throw Object.assign(new Error(message), { pos }) as Error & { pos: Pos };
}

function tokenize(input: string): Array<{ t: "(" | ")" | "a"; v?: string; pos: Pos }> {
  const out: Array<{ t: "(" | ")" | "a"; v?: string; pos: Pos }> = [];
  let i = 0;
  let line = 1;
  let col = 1;

  while (i < input.length) {
    const ch = input[i] ?? "";
    if (ch === ";") {
      while (i < input.length && input[i] !== "\n") {
        i += 1;
        col += 1;
      }
      continue;
    }
    if (ch === "\n") {
      i += 1;
      line += 1;
      col = 1;
      continue;
    }
    if (/\s/.test(ch)) {
      i += 1;
      col += 1;
      continue;
    }
    if (ch === "(" || ch === ")") {
      out.push({ t: ch, pos: { line, col } });
      i += 1;
      col += 1;
      continue;
    }
    const start = { line, col };
    let atom = "";
    while (i < input.length) {
      const c = input[i] ?? "";
      if (c === "(" || c === ")" || c === ";" || /\s/.test(c)) break;
      atom += c;
      i += 1;
      col += 1;
    }
    out.push({ t: "a", v: atom, pos: start });
  }

  return out;
}

function parseOne(tokens: ReturnType<typeof tokenize>, idx: { v: number }): SExpr {
  if (idx.v >= tokens.length) parseError("unexpected EOF", { line: 1, col: 1 });
  const t = tokens[idx.v]!;
  if (t.t === "a") {
    idx.v += 1;
    return { kind: "atom", value: t.v ?? "", pos: t.pos };
  }
  if (t.t === ")") {
    parseError("unexpected )", t.pos);
  }
  idx.v += 1;
  const items: SExpr[] = [];
  while (idx.v < tokens.length) {
    const cur = tokens[idx.v]!;
    if (cur.t === ")") {
      idx.v += 1;
      return { kind: "list", items, pos: t.pos };
    }
    items.push(parseOne(tokens, idx));
  }
  parseError("unclosed list", t.pos);
}

function asList(expr: SExpr): SExpr[] {
  if (expr.kind !== "list") parseError("expected list", expr.pos);
  return expr.items;
}

function asAtom(expr: SExpr): string {
  if (expr.kind !== "atom") parseError("expected atom", expr.pos);
  return expr.value;
}

function normalizeResistor(raw: string): string {
  const compact = raw.replace(/\s+/g, "").toLowerCase();
  const m = compact.match(/^([+-]?\d+(?:\.\d+)?)([a-zω]+)$/);
  if (!m) return raw;
  const n = Number(m[1]);
  const u = m[2];
  let ohms: number;
  if (u === "ohm" || u === "ohms" || u === "ω") ohms = n;
  else if (u === "kohm" || u === "kω" || u === "k") ohms = n * 1_000;
  else if (u === "mohm" || u === "mω" || u === "m") ohms = n * 1_000_000;
  else return raw;
  const [scaled, suffix] = ohms >= 1_000_000 ? [ohms / 1_000_000, "MΩ"] : ohms >= 1_000 ? [ohms / 1_000, "kΩ"] : [ohms, "Ω"];
  return `${stripZero(scaled)}${suffix}`;
}

function normalizeCap(raw: string): string {
  const compact = raw.replace(/\s+/g, "").toLowerCase();
  const m = compact.match(/^([+-]?\d+(?:\.\d+)?)([a-z]+)$/);
  if (!m) return raw;
  const n = Number(m[1]);
  const u = m[2];
  let f: number;
  if (u === "f") f = n;
  else if (u === "uf") f = n * 1e-6;
  else if (u === "nf") f = n * 1e-9;
  else if (u === "pf") f = n * 1e-12;
  else return raw;
  const [scaled, suffix] = f >= 1e-6 ? [f / 1e-6, "uF"] : f >= 1e-9 ? [f / 1e-9, "nF"] : [f / 1e-12, "pF"];
  return `${stripZero(scaled)}${suffix}`;
}

function stripZero(n: number): string {
  return n.toFixed(6).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function parseScm(input: string): CircuitIR {
  const tokens = tokenize(input);
  const root = parseOne(tokens, { v: 0 });
  const rootItems = asList(root);
  if (asAtom(rootItems[0]!) !== "circuit") parseError("root must be circuit", root.pos);

  const components: CircuitIR["components"] = [];
  const nets: CircuitIR["nets"] = [];
  let i2c: CircuitIR["constraints"]["i2c"];

  for (const sec of rootItems.slice(1)) {
    const items = asList(sec);
    const head = asAtom(items[0]!);
    if (head === "components") {
      for (const c of items.slice(1)) {
        const ci = asList(c);
        if (asAtom(ci[0]!) !== "comp") parseError("expected comp", c.pos);
        const id = asAtom(ci[1]!);
        let type = "part";
        let pins: string[] = [];
        const props: Record<string, string> = {};

        for (const prop of ci.slice(2)) {
          const pi = asList(prop);
          const phead = asAtom(pi[0]!);
          if (phead === "type") type = asAtom(pi[1]!);
          if (phead === "pins") pins = asList(pi[1]!).map(asAtom);
          if (phead === "props") {
            for (const kv of pi.slice(1)) {
              const pair = asList(kv);
              props[asAtom(pair[0]!)] = asAtom(pair[1]!);
            }
          }
        }

        components.push({ id, type, pins, props });
      }
    }
    if (head === "nets") {
      for (const n of items.slice(1)) {
        const ni = asList(n);
        if (asAtom(ni[0]!) !== "net") parseError("expected net", n.pos);
        const name = asAtom(ni[1]!);
        const connSec = asList(ni[2]!);
        if (asAtom(connSec[0]!) !== "connect") parseError("expected connect", n.pos);
        const connect = connSec.slice(1).map((x) => {
          const pair = asList(x);
          return { comp: asAtom(pair[0]!), pin: asAtom(pair[1]!) };
        });
        nets.push({ name, connect });
      }
    }
    if (head === "constraints") {
      for (const c of items.slice(1)) {
        const ci = asList(c);
        if (asAtom(ci[0]!) !== "i2c") continue;
        const map: Record<string, string> = {};
        for (const kv of ci.slice(1)) {
          const pair = asList(kv);
          map[asAtom(pair[0]!)] = asAtom(pair[1]!);
        }
        i2c = { sda: map.sda, scl: map.scl, vcc: map.vcc };
      }
    }
  }

  return { components, nets, constraints: { i2c } };
}

export function toScm(ir: CircuitIR): string {
  const lines: string[] = [];
  lines.push("(circuit");

  const components = [...ir.components].sort((a, b) => a.id.localeCompare(b.id));
  lines.push("  (components");
  for (const c of components) {
    lines.push(`    (comp ${c.id}`);
    lines.push(`      (type ${c.type})`);
    const pins = [...c.pins].sort((a, b) => a.localeCompare(b));
    lines.push(`      (pins (${pins.join(" ")}))`);
    lines.push("      (props");
    for (const key of Object.keys(c.props).sort((a, b) => a.localeCompare(b))) {
      let value = c.props[key] ?? "";
      if (c.type === "resistor" && key === "value") value = normalizeResistor(value);
      if (c.type === "capacitor" && key === "value") value = normalizeCap(value);
      lines.push(`        (${key} ${value})`);
    }
    lines.push("      )");
    lines.push("    )");
  }
  lines.push("  )");

  const nets = [...ir.nets].sort((a, b) => a.name.localeCompare(b.name));
  lines.push("  (nets");
  for (const n of nets) {
    lines.push(`    (net ${n.name}`);
    lines.push("      (connect");
    const conns = [...n.connect].sort((a, b) => a.comp.localeCompare(b.comp) || a.pin.localeCompare(b.pin));
    for (const c of conns) {
      lines.push(`        (${c.comp} ${c.pin})`);
    }
    lines.push("      )");
    lines.push("    )");
  }
  lines.push("  )");

  lines.push("  (constraints");
  if (ir.constraints.i2c) {
    lines.push("    (i2c");
    lines.push(`      (scl ${ir.constraints.i2c.scl})`);
    lines.push(`      (sda ${ir.constraints.i2c.sda})`);
    lines.push(`      (vcc ${ir.constraints.i2c.vcc})`);
    lines.push("    )");
  }
  lines.push("  )");
  lines.push(")");
  return `${lines.join("\n")}\n`;
}

export type LintDiag = { file: string; line: number; col: number; code: string; message: string };

export function lintScm(file: string, ir: CircuitIR): LintDiag[] {
  const diags: LintDiag[] = [];

  const compMap = new Map(ir.components.map((c) => [c.id, c]));
  const connected = new Set<string>();
  const pinNets = new Map<string, Set<string>>();

  for (const n of ir.nets) {
    for (const c of n.connect) {
      const comp = compMap.get(c.comp);
      if (!comp) {
        diags.push({ file, line: 1, col: 1, code: "E001", message: `undefined component '${c.comp}'` });
        continue;
      }
      if (!comp.pins.includes(c.pin)) {
        diags.push({ file, line: 1, col: 1, code: "E001", message: `undefined pin '${c.comp}.${c.pin}'` });
        continue;
      }
      const k = `${c.comp}.${c.pin}`;
      connected.add(k);
      const s = pinNets.get(k) ?? new Set<string>();
      s.add(n.name);
      pinNets.set(k, s);
    }
  }

  for (const comp of ir.components) {
    for (const pin of comp.pins) {
      const k = `${comp.id}.${pin}`;
      if (!connected.has(k)) {
        diags.push({ file, line: 1, col: 1, code: "E002", message: `unconnected pin '${k}'` });
      }
    }
  }

  const i2c = ir.constraints.i2c;
  if (i2c) {
    const netSet = new Set(ir.nets.map((n) => n.name));
    for (const [k, v] of Object.entries(i2c)) {
      if (!netSet.has(v)) {
        diags.push({ file, line: 1, col: 1, code: "E001", message: `undefined net in i2c constraint: ${k}='${v}'` });
      }
    }

    let sdaOk = false;
    let sclOk = false;

    for (const comp of ir.components) {
      if (comp.type !== "resistor" || comp.pins.length !== 2) continue;
      const [p0, p1] = comp.pins;
      const n0 = pinNets.get(`${comp.id}.${p0}`) ?? new Set<string>();
      const n1 = pinNets.get(`${comp.id}.${p1}`) ?? new Set<string>();

      const isPullup = (signal: string): boolean =>
        (n0.has(signal) && n1.has(i2c.vcc)) || (n1.has(signal) && n0.has(i2c.vcc));

      if (isPullup(i2c.sda)) sdaOk = true;
      if (isPullup(i2c.scl)) sclOk = true;
    }

    if (!sdaOk) diags.push({ file, line: 1, col: 1, code: "E003", message: `missing pull-up resistor between '${i2c.sda}' and '${i2c.vcc}'` });
    if (!sclOk) diags.push({ file, line: 1, col: 1, code: "E003", message: `missing pull-up resistor between '${i2c.scl}' and '${i2c.vcc}'` });
  }

  diags.sort((a, b) =>
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.col - b.col ||
    a.code.localeCompare(b.code) ||
    a.message.localeCompare(b.message)
  );
  return diags;
}

export function parseScmSafe(input: string): { ok: true; value: CircuitIR } | { ok: false; error: ParseError } {
  try {
    return { ok: true, value: parseScm(input) };
  } catch (e) {
    const err = e as Error & { pos?: Pos };
    return {
      ok: false,
      error: {
        message: err.message,
        pos: err.pos ?? { line: 1, col: 1 }
      }
    };
  }
}
