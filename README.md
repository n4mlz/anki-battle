# Anki Battle

Anki の学習進捗を友人と競い合う Web ダッシュボード。最大4名の AnkiWeb アカウントから定期的に学習データを取得し、共通デッキの進捗を3色のプログレスバーで比較できます。

## 使い方

### 1. セットアップ

```bash
git clone <this-repo>
cd anki-battle
npm install
cp credentials.example.toml credentials.toml
```

### 2. credentials.toml を編集

```toml
[users.alice]
name = "Alice"
email = "alice@example.com"
password = "your-ankiweb-password"

[users.bob]
name = "Bob"
email = "bob@example.com"
password = "your-ankiweb-password"

[anki]
deck_name = "デッキ名"        # 全員共通のデッキ名
fetch_interval_minutes = 10    # 取得間隔（分）
```

- ユーザーは最大4名。不要なセクションはコメントアウトで無効化
- デッキ名は AnkiWeb 上での表示名と完全一致させること（全角/半角スペースは正規化されます）
- `credentials.toml` は `.gitignore` 対象です

### 3. 起動

```bash
npm run dev
```

`http://localhost:3000` を開きます。起動直後に初回のデータ取得が行われ、以降は設定した間隔で自動更新されます。

## 画面の見方

```
┌──────────────────────┐
│  1  Alice    3時間前  │ ← 順位・名前・最終同期
│                      │
│  全体 ████░░░░ 4%    │ ← 3色の全体進捗バー
│  卒業■ 着手■ 未着手░  │    緑=卒業 青=学習中 灰=未着手
│                      │
│  100語ごとの進捗       │
│  1 2 3 4 5           │ ← 2段のチャンクバー
│  █████░░░░           │    各100語単位の内訳
│  6 7 8 9 10          │
│  ██░░░░░░░           │
└──────────────────────┘
```

## 技術構成

- **Next.js** (App Router) + **TypeScript**
- **shadcn/ui** + **Tailwind CSS** v4
- **@bufbuild/protobuf** — AnkiWeb の内部 API 通信
- **node-cron** — 定期データ取得
- **Recharts** — （将来の履歴グラフ用にインストール済み）

## ライセンス

MIT
