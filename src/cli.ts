import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join, resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";

import { generateForPico } from "./generate.js";
import type { CircuitIR } from "./index.js";
import { lintScm, parseScmSafe, toScm } from "./scm.js";

function usage(): void {
  console.error("Usage:\n  elec ts2scm <input.ts|.js> -o <output.scm>\n  elec fmt [--check] <files...>\n  elec lint <files...>\n  elec generate --target pico --input <circuit.scm> --out-dir <dir>");
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function loadTsEntry(entry: string): Promise<CircuitIR> {
  const abs = resolve(entry);
  let importPath = abs;

  if (entry.endsWith(".ts")) {
    const rel = relative(process.cwd(), abs).replace(/\\/g, "/");
    const compiled = resolve("dist", rel.replace(/\.ts$/, ".js"));
    if (await exists(compiled)) {
      importPath = compiled;
    } else {
      throw new Error(`compiled JS not found: ${compiled}. run 'npm run build' first`);
    }
  }

  const mod = (await import(pathToFileURL(importPath).href)) as { default?: CircuitIR };
  if (!mod.default) {
    throw new Error("module default export is missing");
  }
  return mod.default;
}

async function cmdTs2Scm(args: string[]): Promise<number> {
  if (args.length < 3) return 2;
  const input = args[0];
  const outFlag = args[1];
  const output = args[2];
  if (outFlag !== "-o") return 2;

  try {
    const ir = await loadTsEntry(input);
    const scm = toScm(ir);
    await writeFile(output, scm, "utf8");
    return 0;
  } catch (e) {
    console.error(`E000: ${(e as Error).message}`);
    return 2;
  }
}

async function cmdFmt(args: string[]): Promise<number> {
  let check = false;
  const files: string[] = [];
  for (const a of args) {
    if (a === "--check") check = true;
    else files.push(a);
  }
  if (files.length === 0) return 2;

  const changed: string[] = [];
  for (const file of files) {
    const input = await readFile(file, "utf8");
    const parsed = parseScmSafe(input);
    if (!parsed.ok) {
      console.error(`${file}:${parsed.error.pos.line}:${parsed.error.pos.col}: E000: parse error: ${parsed.error.message}`);
      return 2;
    }
    const out = toScm(parsed.value);
    if (out !== input) {
      if (check) {
        changed.push(file);
      } else {
        await writeFile(file, out, "utf8");
      }
    }
  }

  if (changed.length > 0) {
    for (const file of changed) {
      console.error(`${file}:0:0: E100: would reformat`);
    }
    return 1;
  }
  return 0;
}

async function cmdLint(args: string[]): Promise<number> {
  if (args.length === 0) return 2;
  const all = [] as ReturnType<typeof lintScm>;

  for (const file of args) {
    const input = await readFile(file, "utf8");
    const parsed = parseScmSafe(input);
    if (!parsed.ok) {
      console.error(`${file}:${parsed.error.pos.line}:${parsed.error.pos.col}: E000: parse error: ${parsed.error.message}`);
      return 2;
    }
    all.push(...lintScm(file, parsed.value));
  }

  if (all.length === 0) return 0;
  for (const d of all) {
    console.error(`${d.file}:${d.line}:${d.col}: ${d.code}: ${d.message}`);
  }
  return 1;
}

async function cmdGenerate(args: string[]): Promise<number> {
  let target = "";
  let input = "";
  let outDir = "";

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1] ?? "";
    if (arg === "--target") {
      target = next;
      i += 1;
      continue;
    }
    if (arg === "--input") {
      input = next;
      i += 1;
      continue;
    }
    if (arg === "--out-dir") {
      outDir = next;
      i += 1;
      continue;
    }
  }

  if (!target || !input || !outDir) {
    return 2;
  }
  if (target !== "pico") {
    console.error(`E000: unsupported target '${target}'`);
    return 2;
  }

  const inputText = await readFile(input, "utf8");
  const parsed = parseScmSafe(inputText);
  if (!parsed.ok) {
    console.error(`${input}:${parsed.error.pos.line}:${parsed.error.pos.col}: E000: parse error: ${parsed.error.message}`);
    return 2;
  }

  const lint = lintScm(input, parsed.value);
  if (lint.length > 0) {
    for (const d of lint) {
      console.error(`${d.file}:${d.line}:${d.col}: ${d.code}: ${d.message}`);
    }
    console.error("E000: generation aborted because lint failed");
    return 1;
  }

  const files = generateForPico(parsed.value);
  await mkdir(outDir, { recursive: true });
  for (const f of files) {
    await writeFile(join(outDir, f.path), f.content, "utf8");
  }
  return 0;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    usage();
    return 2;
  }

  const cmd = args[0];
  const rest = args.slice(1);
  switch (cmd) {
    case "ts2scm":
      return cmdTs2Scm(rest);
    case "fmt":
      return cmdFmt(rest);
    case "lint":
      return cmdLint(rest);
    case "generate":
      return cmdGenerate(rest);
    default:
      usage();
      return 2;
  }
}

main().then((code) => process.exit(code));
