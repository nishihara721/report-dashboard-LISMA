# レポートダッシュボード

LISMA engageのデータを集計・可視化するWebアプリです。

---

## 技術スタック

| 項目 | 使用技術 |
|---|---|
| フレームワーク | Next.js 15（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| データベース | Firebase Firestore |
| DB同期 | Google Apps Script（GAS） |
| 管理者認証 | NextAuth.js（Googleログイン） |
| クライアント認証 | ID・パスワード（独自実装） |
| ホスティング | Firebase App Hosting |

---

## データの流れ

```
スプレッドシート
      ↓
GAS（手動実行）
      ↓
Next.js API（/api/sync）
      ↓
Firebase Firestore
      ↓
ブラウザ ← Next.js ← Firestore
```

---

## フォルダ構成

```
app/
├── (admin)/                      # 管理者用ルートグループ
│   ├── layout.tsx                # 管理者用レイアウト（NavBar含む）
│   ├── login/page.tsx            # Googleログインページ
│   ├── summary/page.tsx          # サマリページ
│   ├── period/page.tsx           # 期間別ページ
│   ├── popup/page.tsx            # ポップアップ別ページ
│   ├── scenario/page.tsx         # シナリオ別ページ
│   ├── exit/page.tsx             # 離脱地点別ページ
│   ├── appeal/page.tsx           # 訴求別ページ
│   ├── shared/page.tsx           # 期間別（共有用）ページ
│   └── admin/page.tsx            # ユーザー管理ページ
│
├── client/                       # クライアント用
│   ├── layout.tsx                # クライアント用レイアウト（権限別メニュー）
│   ├── login/page.tsx            # クライアントログインページ
│   ├── shared/page.tsx           # 期間別（共有用）
│   ├── summary/page.tsx          # サマリ
│   ├── period/page.tsx           # 期間別
│   ├── popup/page.tsx            # ポップアップ別
│   ├── scenario/page.tsx         # シナリオ別
│   ├── exit/page.tsx             # 離脱地点別
│   └── appeal/page.tsx           # 訴求別
│
├── api/                          # APIルート（サーバー側の処理）
│   ├── auth/[...nextauth]/       # 管理者認証（Googleログイン）
│   ├── client/
│   │   ├── login/                # クライアントログイン
│   │   ├── logout/               # クライアントログアウト
│   │   └── me/                   # クライアントセッション確認
│   ├── admin/
│   │   └── users/                # クライアントユーザーCRUD
│   │       └── [id]/             # ユーザー更新・削除
│   ├── report/                   # 期間別レポートデータ
│   ├── report-by-p/              # ポップアップ別レポートデータ
│   ├── report-by-s/              # シナリオ別レポートデータ
│   ├── report-by-exit/           # 離脱地点別レポートデータ
│   ├── report-by-appeal/         # 訴求別レポートデータ
│   ├── report-shared/            # 期間別（共有用）レポートデータ
│   ├── summary/                  # サマリデータ（月別・p別・s別）
│   ├── p-values/                 # ポップアップの選択肢一覧
│   ├── p-values-active/          # 直近1週間のポップアップ一覧
│   ├── s-values/                 # シナリオの選択肢一覧
│   ├── s-values-active/          # 直近1週間のシナリオ一覧
│   ├── exit-values/              # 離脱地点の選択肢一覧
│   ├── appeal-values/            # 訴求の選択肢一覧
│   ├── appeal-values-active/     # 直近1週間の訴求一覧
│   ├── notes/                    # メモの取得・保存
│   ├── price-rules/              # 成果単価ルール（空配列を返す）
│   └── sync/                     # GASからのデータ受け取り・Firestore保存
│
├── components/                   # UIコンポーネント
│   ├── NavBar.tsx                # サイドナビゲーション（PC）・下部ナビ（スマホ）
│   ├── FilterBar.tsx             # 期間フィルター・日別月別切替・列切替
│   ├── SelectorBar.tsx           # チェックボックス選択UI（p・s・離脱地点・訴求）
│   ├── ReportTableCore.tsx       # テーブル本体（全ページ共通）
│   ├── ColumnToggle.tsx          # 列の表示切替ボタン
│   ├── Loading.tsx               # ローディングスピナー
│   ├── SessionProviderWrapper.tsx # NextAuth SessionProviderのラッパー
│   ├── ReportTable.tsx           # 期間別ページのメインコンポーネント
│   ├── SharedReportTable.tsx     # 期間別（共有用）ページのメインコンポーネント
│   ├── PopupReport.tsx           # ポップアップ別ページのメインコンポーネント
│   ├── ScenarioReport.tsx        # シナリオ別ページのメインコンポーネント
│   ├── ExitReport.tsx            # 離脱地点別ページのメインコンポーネント
│   ├── AppealReport.tsx          # 訴求別ページのメインコンポーネント
│   └── SummaryTable.tsx          # サマリページのメインコンポーネント
│
├── hooks/                        # カスタムフック（状態管理）
│   ├── useFilterBar.ts           # 期間フィルターの状態管理
│   └── useColumnVisibility.ts    # 列の表示・非表示の状態管理
│
├── lib/                          # サーバー側のロジック
│   ├── db.ts                     # FirestoreからのDBデータ取得・集計
│   ├── firebase.ts               # Firebaseクライアントの設定
│   ├── firebase-admin.ts         # Firebase Admin SDKの設定
│   └── utils.ts                  # 共通の計算・変換関数
│
├── layout.tsx                    # 全ページ共通レイアウト（html/bodyのみ）
└── globals.css                   # グローバルCSS

proxy.ts                          # 管理者ページの認証チェック
apphosting.yaml                   # Firebase App Hostingの設定
```

---

## 各ファイルの役割

### `app/lib/db.ts`
FirestoreからDBデータを取得・集計するメインロジックです。
期間別・ポップアップ別・シナリオ別・離脱地点別・訴求別・共有用・サマリ・クライアントユーザー管理の各データを取得・操作します。

### `app/lib/firebase.ts`
Firebaseクライアントの初期化設定です。フロントエンド側で使用します。

### `app/lib/firebase-admin.ts`
Firebase Admin SDKの初期化設定です。サーバー側のAPI処理で使用します。環境変数 `FB_PROJECT_ID`・`FB_CLIENT_EMAIL`・`FB_PRIVATE_KEY` から認証情報を読み込みます。

### `app/lib/utils.ts`
アプリ全体で使い回す共通の計算・変換関数をまとめています。

| 関数名 | 説明 |
|---|---|
| `calcRate` | 割合をパーセント文字列で返す |
| `toYYYYMMDD` | 日付を `YYYY/MM/DD` 形式に変換 |

### `app/components/ReportTableCore.tsx`
全ページで使用するテーブルの本体です。日別・月別の表示切替、総計行の表示、列の表示切替、メモの編集・URLリンク表示に対応しています。

### `app/components/FilterBar.tsx`
期間フィルター・日別月別切替・列切替をまとめたUIコンポーネントです。全レポートページで共通して使用しています。

### `app/hooks/useFilterBar.ts`
フィルターの状態（期間プリセット・日付範囲・表示モード）を管理するカスタムフックです。`apiDateRange` プロパティでAPIへのクエリパラメータを自動生成します。

### `app/client/layout.tsx`
クライアントユーザー専用のレイアウトです。ログイン状態の確認と、権限に応じたメニューの表示を管理します。

### `proxy.ts`
未ログインの管理者ユーザーをログインページにリダイレクトします。クライアント用ページ（`/client/*`）は対象外で、独自認証で管理しています。

### `apphosting.yaml`
Firebase App Hostingの設定ファイルです。環境変数・シークレットの設定を管理します。

---

## Firestoreコレクション構成

Firestoreはドキュメント指向のNoSQLデータベースです。以下のコレクションを使用しています。

#### daily_reports（日次レポート）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| date | string | 日付（例: `2026-07-01`）※ドキュメントIDも同じ |
| pv | number | PV数 |
| imp | number | imp数 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| billing | number | 請求額 |

#### daily_reports_by_p（ポップアップ別）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントID: `{date}__{p_value}` |
| p_value | string | ポップアップの識別値 |
| pv | number | PV数 |
| imp | number | imp数 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| billing | number | 請求額 |

#### daily_reports_by_s（シナリオ別）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントID: `{date}__{s_value}` |
| s_value | string | シナリオの識別値 |
| pv | number | PV数 |
| imp | number | imp数 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| billing | number | 請求額 |

#### daily_reports_by_exit（離脱地点別）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントID: `{date}__{exit_value}` |
| exit_value | string | 離脱地点の識別値 |
| pv | number | PV数 |
| imp | number | imp数 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |

#### daily_reports_by_appeal（訴求別）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントID: `{date}__{appeal_value}` |
| appeal_value | string | 訴求の識別値 |
| pv | number | PV数 |
| imp | number | imp数 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| billing | number | 請求額 |

#### daily_reports_shared（期間別共有用）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントIDも同じ |
| cv | number | CV数 |
| unit_price | number | 成果単価 |
| billing | number | 請求額 |

#### daily_notes（メモ）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントIDも同じ |
| note | string | メモ内容 |
| updated_at | string | 更新日時 |

#### client_users（クライアントユーザー）
| フィールド名 | データ型 | 説明 |
|---|---|---|
| username | string | ログインID |
| password_hash | string | パスワード（bcryptハッシュ） |
| display_name | string | 表示名 |
| is_active | boolean | 有効/無効 |
| pages | array | 閲覧可能ページの配列 |
| created_at | string | 作成日時 |
| updated_at | string | 更新日時 |

#### distinct_p_values / distinct_s_values / distinct_exit_values / distinct_appeal_values
各値のユニーク一覧。ドキュメントIDが値そのもの。

#### summary_by_p / summary_by_s
p別・s別のサマリ集計データ。ドキュメントIDが値そのもの。

---

## Firestoreの複合インデックス

以下のコレクションで複合インデックスが必要です（初回アクセス時にエラーメッセージ内のURLから作成）：

| コレクション | フィールド1 | フィールド2 |
|---|---|---|
| `daily_reports_by_p` | `p_value` 昇順 | `date` 昇順 |
| `daily_reports_by_s` | `s_value` 昇順 | `date` 昇順 |
| `daily_reports_by_exit` | `exit_value` 昇順 | `date` 昇順 |
| `daily_reports_by_appeal` | `appeal_value` 昇順 | `date` 昇順 |

---

## 集計ロジック

```
PV数          = 【データ】セッション数の「合計」列
訴求別PV数    = 【データ】セッション数の訴求名列
imp数         = 【データ】フリップデスクの「自動ポップアップ表示回数」列
CL数          = flipdesk: フリップデスクの「ポップアップ内のクリック数」
                clicklog: クリックログの「LINE追加」件数
友だち追加数   = 【データ】友だちデータの行数カウント
CV数          = 【データ】成果ログの行数カウント

請求額        = 【データ】成果ログの「成果単価」列の合計
成果単価      = 請求額 ÷ CV数

imp率         = imp数 ÷ PV数
CTR           = CL数 ÷ imp数
友だち追加率   = 友だち追加数 ÷ CL数
CVR           = CV数 ÷ 友だち追加数

期間別(共有用)
  CV数        = 【データ】基幹数値のB列
  成果単価     = 【データ】基幹数値のC列
  請求額      = 【データ】基幹数値のD列
```

---

## スプレッドシートの構成

| シート名 | 用途 |
|---|---|
| 【データ】セッション数 | PV数・訴求別PV数（ヘッダーが4行目） |
| 【データ】フリップデスク | imp数・CL数（`CL_SOURCE=flipdesk` の場合） |
| 【データ】友だちデータ | 友だち追加数 |
| 【データ】成果ログ | CV数・成果単価 |
| 【データ】クリックログ | CL数（`CL_SOURCE=clicklog` の場合） |
| 【データ】基幹数値 | 期間別（共有用）のCV数・成果単価・請求額 |

---

## 環境変数

`.env.local` に以下を設定してください（ローカル開発用）。

```env
# Firebase クライアント設定
NEXT_PUBLIC_FIREBASE_API_KEY=控えたapiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=控えたauthDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=控えたprojectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=控えたstorageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=控えたmessagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=控えたappId

# Firebase Admin SDK（FIREBASEプレフィックスは予約済みのためFBを使用）
FB_PROJECT_ID=控えたproject_id
FB_CLIENT_EMAIL=控えたclient_email
FB_PRIVATE_KEY="控えたprivate_key"

# NextAuth（Googleログイン）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ランダムな文字列
GOOGLE_CLIENT_ID=OAuthクライアントID
GOOGLE_CLIENT_SECRET=OAuthクライアントシークレット

# GASとの認証用シークレット
SYNC_SECRET=任意のランダムな文字列

# Google Sheets API（サマリ用）
GOOGLE_SHEETS_ID=スプレッドシートのID
GOOGLE_SERVICE_ACCOUNT_EMAIL=サービスアカウントのメールアドレス
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 期間別（共有用）ページの表示/非表示（省略時は非表示）
# NEXT_PUBLIC_ 変数はビルド時に埋め込まれるため、変更後は再デプロイが必要
NEXT_PUBLIC_ENABLE_SHARED_REPORT=true
```

本番環境（Firebase App Hosting）では `apphosting.yaml` でシークレットを管理します。

---

## 認証・権限

| 機能 | 条件 |
|---|---|
| 管理者ログイン | Googleアカウント（NextAuth） |
| レポート閲覧（管理者） | ログイン必須 |
| メモの編集 | `@5s-inc.jp` ドメインのアカウントのみ |
| ユーザー管理画面 | `@5s-inc.jp` ドメインのアカウントのみ |
| クライアントログイン | ID・パスワード（Cookie認証） |
| クライアントのページ閲覧 | 管理者が付与した権限のページのみ |

---

## 料金

| サービス | 料金 |
|---|---|
| Firebase App Hosting | Blazeプラン必須・無料枠内はほぼ$0 |
| Firestore | Sparkプラン無料枠内はほぼ$0 |
| **合計** | **ほぼ$0/月（社内ツール規模の場合）** |

Blazeプランへのクレジットカード登録は必要ですが、今回の規模では無料枠内に収まる可能性が高いです。