# Anki Battle

AnkiWeb 上の学習進捗を複数ユーザーで比較するための、ローカル実行向けダッシュボードです。

指定した Anki デッキの進捗を定期取得し、ユーザーごとの順位、全体進捗、学習済み・学習中・未学習の割合、100 語単位の進捗を表示します。

## 主な機能

- AnkiWeb アカウントを最大 4 人程度設定して進捗を比較
- 指定デッキの `new`、`learn`、`review`、成熟済みカード数を集計
- 全体進捗率を基準にランキング表示
- 100 語ごとのチャンク進捗をバーで表示
- サーバー起動時に初回取得し、以後は設定した間隔で自動更新
- 最新 snapshot を `data/snapshots/` に保存して画面表示

## 前提

- Node.js
- npm
- AnkiWeb アカウント
- 比較対象のユーザーが同じ名前のデッキを持っていること

このアプリは AnkiWeb にログインしてデッキ一覧情報を取得します。`credentials.toml` には AnkiWeb のメールアドレスとパスワードを保存するため、公開リポジトリに含めないでください。

## セットアップ

依存関係をインストールします。

```bash
npm install
```

設定ファイルを作成します。

```bash
cp credentials.example.toml credentials.toml
```

`credentials.toml` を編集します。

```toml
[users.alice]
name = "Alice"
email = "alice@example.com"
password = "your-password"

[users.bob]
name = "Bob"
email = "bob@example.com"
password = "your-password"

[anki]
deck_name = "TOEIC L＆R TEST 出る単特急　金のフレーズ"
fetch_interval_minutes = 10
```

`users` のキー名、上の例では `alice` や `bob`、が画面上のユーザー名として表示されます。不要なユーザーは削除またはコメントアウトしてください。

## 起動

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで次の URL を開きます。

```text
http://localhost:3000
```

起動直後に初回取得が実行されます。取得が終わるまでは「データがまだありません」と表示される場合があります。

ポートを変更する場合は `PORT` を指定します。

```bash
PORT=3001 npm run dev
```

## データの保存先

取得した最新データはユーザーごとに保存されます。

```text
data/snapshots/<user>_latest.json
```

`data/snapshots/` と `credentials.toml` は `.gitignore` に含まれています。

## 進捗とランキング

各デッキの子デッキをチャンクとして扱い、次の値を集計します。

- `mature`: デッキ内総数から `new`、`learn`、`review` を引いた数
- `inProgress`: `learn + review`
- `newCount`: 未学習カード数
- `total_progress_pct`: `(mature + inProgress) / totalIncludingChildren`

ランキングは `total_progress_pct` の降順です。同率の場合は `mature_total` が多いユーザーが上位になります。

## コマンド

```bash
npm run dev
```

カスタム Next.js サーバーを開発モードで起動します。cron による定期取得もこのサーバーから開始されます。

```bash
npm run build
```

本番ビルドを作成します。

```bash
npm run start
```

本番モードでカスタムサーバーを起動します。

```bash
npm run lint
```

ESLint を実行します。

## 注意事項

- AnkiWeb の仕様変更によりログインやデッキ情報取得が動かなくなる可能性があります。
- 2 要素認証、追加認証、アクセス制限などが有効なアカウントでは取得に失敗する可能性があります。
- `deck_name` は AnkiWeb 上のデッキ名と一致している必要があります。空白は正規化されますが、名前そのものが違う場合は見つかりません。
- このアプリはローカル利用を想定しています。外部公開する場合は認証、通信経路、認証情報管理を別途設計してください。
