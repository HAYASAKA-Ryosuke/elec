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
- `npm run generate:pico`（`examples/pico_bme280_led.scm` から `out/pico_bme280_led/` を生成）
- `npm run check:all`
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
5. 可能なら `setNetVoltage(...)` でネット電圧を設定
6. `connect(...)` でネット接続
7. `setI2c(...)` でI2C制約を設定
8. `export default c.toIR()` を出力
9. 再利用ライブラリの未使用許容ピンは `optional: true` を付与

ライブラリ運用の推奨:

パッケージ側要件定義:

- 部品定義に `requires` を宣言できます（例: プルアップ抵抗、デカップリングコンデンサ）。
- `lint` はこれを検証し、不足時に `E007` を返します。

- core には基本プリミティブのみを置く
- センサ/モジュールは外部コンポーネントライブラリ化して import する
- このリポジトリ内の例:
  - `component-libs/sensors-bosch.ts`
  - `component-libs/modules-rp.ts`
  - `component-libs/core-primitives.ts`

サンプル:

- `examples/minimal.ts`
- `examples/pico_bme280_led.ts`
- `examples/power_levelshift.ts`（LDO + 昇圧 + レベルシフタ）
- `examples/minimal.scm`
- `examples/pico_bme280_led.scm`
- `examples/power_levelshift.scm`

外部ライブラリ利用例:

```ts
import { BME280 } from "../component-libs/sensors-bosch.js";
import { Pico } from "../component-libs/modules-rp.js";
import { Resistor } from "../component-libs/core-primitives.js";
```

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
- `E004`: 短絡リスク（同一ネットにGND系ピンと電源系ピンが混在）
- `E005`: 過電圧リスク（ネット電圧がピン `vmax` を超過）
- `E006`: トランジスタ/FETの向き・接続リスク
- `E007`: 接続部品不足（コンポーネント定義の `requires` 違反）

## 検証範囲（現状）

`fmt` が行うこと:

- 対応しているS式回路構造をパースして canonical 順へ再整形
- 既知の抵抗/コンデンサ単位表記を正規化
- 同一入力に対して決定的な出力を生成

`lint` が検査すること:

- 参照整合性（component/pin/net の存在）: `E001`
- 未接続ピン: `E002`
- SDA/SCL 両方の I2C プルアップ（対VCC）: `E003`
- ピン役割（`gnd` / `power_in` / `power_out`）とネット電圧に基づく短絡リスク検出: `E004`
- 明示的なネット電圧とピン `vmax` に基づく過電圧リスク検出: `E005`
- BJT/MOSFETのピン接続・向きリスク検出: `E006`
- コンポーネント定義の接続要件（`requires`）違反検出: `E007`

補足:

- `E002` は `optional: true` が付いたピンを未接続エラーにしません。
- `E006` は名前推測ではなく、`net_role` / `lt` / `gt` / `neq` などのピン契約に基づいて判定します。
- `E007` は不足した要件ID/タグ（例: `[flyback_diode]`, `[led_series_resistor]`）を診断メッセージに含みます。

まだ検査しないこと:

- 現在ルール外の電気的妥当性（電流、タイミング、SI/PI）
- ERC相当の完全な電圧ドメイン互換チェック（現状は `setNetVoltage` と `vmin/vmax` 指定前提）
- フットプリント妥当性や製造性
- ファームウェア実行時の正しさ
- 高度なバス制約（I2Cアドレス競合、SPI/UARTプロトコル整合）

## IntentとSkills

- `circuit.scm` はハードウェアの正本
- `intent.scm` は将来追加予定の振る舞い正本（アプリ目的/ルール/テレメトリ）
- intent作成スキル:
  - `skills/intent-authoring/SKILL.md`
  - `skills/intent-authoring/references/intent-template.scm`
- TS DSL作成スキル:
  - `skills/ts-circuit-dsl/SKILL.md`
  - `skills/ts-circuit-dsl/references/api-patterns.md`
