# elec

TypeScriptファーストの回路DSLツールチェーンです。

## クイックスタート

1. 依存関係をインストール: `npm install`
2. ビルド: `npm run build`
3. TSからSCMを生成: `npm run ts2scm`
4. canonical整形チェック: `npm run fmt:check`
5. 静的検証: `npm run lint`

## コマンド

- `npm run build`
- `npm run ts2scm`（`examples/minimal.ts` から `examples/minimal.scm` を生成）
- `npm run fmt` / `npm run fmt:check`
- `npm run lint`
- 任意TS -> SCM:
  - `node dist/src/cli.js ts2scm examples/pico_bme280_led.ts -o examples/pico_bme280_led.scm`
- 任意SCMの検証:
  - `node dist/src/cli.js fmt --check <file.scm>`
  - `node dist/src/cli.js lint <file.scm>`

## TypeScript回路DSLの書き方

基本パターン:

1. `defineComponent(...)` で部品テンプレートを定義
2. `defineCircuit({ target: "pico" })` で回路を作成
3. `addPart(...)` で部品インスタンスを追加
4. `setPartProp(...)` で抵抗値・容量値などを設定
5. `connect(...)` でネット接続
6. `setI2c(...)` でI2C制約を設定
7. `export default c.toIR()` を出力

サンプル:

- `examples/minimal.ts`
- `examples/pico_bme280_led.ts`
- `examples/minimal.scm`
- `examples/pico_bme280_led.scm`

## DSLフロー

1. TypeScriptで回路を記述
2. `c.toIR()` をデフォルトエクスポート
3. `ts2scm` で canonical なS式に変換
4. `fmt` / `lint` で品質ゲートを通す

## SCM生成後にやること

1. `fmt --check` を実行
2. `lint` を実行
3. `*.ts` と `*.scm` をセットでコミット
4. CI（`build -> ts2scm -> fmt:check -> lint`）でゲート

`fmt --check` が失敗したら `fmt` で整形します。
`lint` が失敗したらTS側を修正して再生成します。

## Lintルール

- `E001`: 未定義参照（component/pin/net）
- `E002`: 未接続ピン
- `E003`: I2Cプルアップ欠落（SDA/SCL両方必須）

## IntentとSkills

- `circuit.scm` はハードウェアの正本
- `intent.scm` は将来追加予定の振る舞い正本（アプリ目的/ルール/テレメトリ）
- intent作成スキル:
  - `skills/intent-authoring/SKILL.md`
  - `skills/intent-authoring/references/intent-template.scm`
- TS DSL作成スキル:
  - `skills/ts-circuit-dsl/SKILL.md`
  - `skills/ts-circuit-dsl/references/api-patterns.md`
