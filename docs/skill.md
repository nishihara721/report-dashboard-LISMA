# レポートダッシュボード（L）

LINEクリックログ・成果ログをデータソースとして、フロー別・メディア別・コード別にパフォーマンスデータを集計・可視化するWebアプリです。広告費の計算方式をメディアごとに設定できます。

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
スプレッドシート（クリックログ・成果ログ・広告費）
      ↓
GAS（手動実行）
      ↓ 広告費設定を取得して計算
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
│   ├── flow/page.tsx             # フロー別ページ
│   ├── media/page.tsx            # メディア別ページ
│   ├── code/page.tsx             # コード別ページ
│   ├── media-cost/               # 広告費設定
│   │   ├── page.tsx              # 広告費設定一覧
│   │   ├── new/page.tsx          # 広告費設定新規追加
│   │   └── edit/[media]/page.tsx # 広告費設定編集
│   └── admin/page.tsx            # ユーザー管理ページ
│
├── client/                       # クライアント用
│   ├── layout.tsx                # クライアント用レイアウト（権限別メニュー）
│   ├── login/page.tsx            # クライアントログインページ
│   ├── summary/page.tsx          # サマリ
│   ├── period/page.tsx           # 期間別
│   ├── flow/page.tsx             # フロー別
│   ├── media/page.tsx            # メディア別
│   └── code/page.tsx             # コード別
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
│   ├── report-by-flow/           # フロー別レポートデータ
│   ├── report-by-media/          # メディア別レポートデータ
│   ├── report-by-code/           # コード別レポートデータ
│   ├── summary/                  # サマリデータ（月別・フロー別・メディア別）
│   ├── flow-values/              # フローの選択肢一覧
│   ├── flow-values-active/       # 直近1週間のフロー一覧
│   ├── media-values/             # メディアの選択肢一覧
│   ├── media-values-active/      # 直近1週間のメディア一覧
│   ├── code-values/              # コードの選択肢一覧
│   ├── code-values-active/       # 直近1週間のコード一覧
│   ├── media-cost-settings/      # 広告費設定の取得・保存・削除
│   ├── notes/                    # メモの取得・保存
│   └── sync/                     # GASからのデータ受け取り・Firestore保存
│
├── components/                   # UIコンポーネント
│   ├── NavBar.tsx                # サイドナビゲーション（PC）・下部ナビ（スマホ）
│   ├── FilterBar.tsx             # 期間フィルター・日別月別切替・列切替
│   ├── SelectorBar.tsx           # チェックボックス選択UI（フロー・メディア・コード）
│   ├── ReportTable.tsx           # 期間別ページのメインコンポーネント
│   ├── FlowReport.tsx            # フロー別ページのメインコンポーネント
│   ├── MediaReport.tsx           # メディア別ページのメインコンポーネント
│   ├── CodeReport.tsx            # コード別ページのメインコンポーネント
│   ├── SummaryTable.tsx          # サマリページのメインコンポーネント
│   ├── RecalcModal.tsx           # 広告費再計算中ポップアップ
│   ├── ColumnToggle.tsx          # 列の表示切替ボタン
│   └── Loading.tsx               # ローディングスピナー
│
├── hooks/                        # カスタムフック（状態管理）
│   ├── useFilterBar.ts           # 期間フィルターの状態管理
│   └── useColumnVisibility.ts    # 列の表示・非表示の状態管理
│
├── lib/                          # サーバー側のロジック
│   ├── db.ts                     # FirestoreからのDBデータ取得・集計・広告費計算
│   ├── firebase.ts               # Firebaseクライアントの設定
│   ├── firebase-admin.ts         # Firebase Admin SDKの設定
│   └── utils.ts                  # 共通の計算・変換関数
│
├── layout.tsx                    # 全ページ共通レイアウト（html/bodyのみ）
└── globals.css                   # グローバルCSS

proxy.ts                          # 管理者ページの認証チェック
apphosting.yaml                   # Firebase App Hostingの設定
GAS.script                        # Google Apps Scriptのコード
```

---

## 各ファイルの役割

### `app/lib/db.ts`
FirestoreからDBデータを取得・集計するメインロジックです。以下の関数を含みます：

| 関数名 | 説明 |
|---|---|
| `getReportDataFromDB` | 期間別レポートデータを取得 |
| `getReportDataByFlowFromDB` | フロー別レポートデータを取得 |
| `getReportDataByMediaFromDB` | メディア別レポートデータを取得 |
| `getReportDataByCodeFromDB` | コード別レポートデータを取得 |
| `getSummaryDataFromDB` | サマリデータ（月別・フロー別・メディア別）を取得 |
| `getFlowValuesFromDB` | フローの選択肢一覧を取得 |
| `getMediaValuesFromDB` | メディアの選択肢一覧を取得 |
| `getCodeValuesFromDB` | コードの選択肢一覧を取得 |
| `getActiveFlowValuesFromDB` | 直近1週間のフロー一覧を取得 |
| `getActiveMediaValuesFromDB` | 直近1週間のメディア一覧を取得 |
| `getActiveCodeValuesFromDB` | 直近1週間のコード一覧を取得 |
| `getMediaCostSettingsFromDB` | 広告費設定を取得 |
| `upsertMediaCostSettingFromDB` | 広告費設定を保存 |
| `deleteMediaCostSettingFromDB` | 広告費設定を削除 |
| `recalcAdCostForMedia` | メディアの広告費を再計算してFirestoreに保存 |
| `getNotesFromDB` | メモを取得 |
| `upsertNoteFromDB` | メモを保存 |
| `getClientUsers` | クライアントユーザー一覧を取得 |
| `createClientUser` | クライアントユーザーを作成 |
| `updateClientUser` | クライアントユーザーを更新 |
| `deleteClientUser` | クライアントユーザーを削除 |
| `getClientUserByUsername` | ユーザー名でクライアントユーザーを検索 |

### `app/lib/firebase-admin.ts`
Firebase Admin SDKの初期化設定です。環境変数 `FB_PROJECT_ID`・`FB_CLIENT_EMAIL`・`FB_PRIVATE_KEY` から認証情報を読み込みます。

### `GAS.script`
スプレッドシートからデータを集計してFirestoreに同期するスクリプトです。広告費設定APIから設定を取得して広告費を計算してから送信します。

### `proxy.ts`
未ログインの管理者ユーザーをログインページにリダイレクトします。クライアント用ページ（`/client/*`）は対象外です。

---

## Firestoreコレクション構成

#### daily_reports_L（期間別）
| フィールド | データ型 | 説明 |
|---|---|---|
| date | string | 日付（例: `2026-07-01`）※ドキュメントIDも同じ |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| calc_ad_cost | number | 計算済み広告費 |
| cpf | number | CPF |
| cpa_val | number | CPA |

#### daily_reports_L_by_flow（フロー別）
| フィールド | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントID: `{date}__{flow}` |
| flow | string | フロー名 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| ad_cost | number | 消化金額 |
| calc_ad_cost | number | 計算済み広告費 |
| cpf | number | CPF |
| cpa_val | number | CPA |

#### daily_reports_L_by_media（メディア別）
| フィールド | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントID: `{date}__{media}` |
| media | string | メディア名 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| ad_cost | number | 消化金額 |
| calc_ad_cost | number | 計算済み広告費 |
| cpf | number | CPF |
| cpa_val | number | CPA |

#### daily_reports_L_by_code（コード別）
| フィールド | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントID: `{date}__{flow}__{media}__{media_no}` |
| flow | string | フロー名 |
| media | string | メディア名 |
| media_no | string | 本数 |
| cl | number | CL数 |
| friend | number | 友だち追加数 |
| cv | number | CV数 |
| ad_cost | number | 消化金額 |
| calc_ad_cost | number | 計算済み広告費 |
| cpf | number | CPF |
| cpa_val | number | CPA |

#### distinct_flow_values / distinct_media_values / distinct_code_values
各値のユニーク一覧。ドキュメントIDが値そのもの。

#### media_cost_settings（広告費設定）
| フィールド | データ型 | 説明 |
|---|---|---|
| updated_at | string | 更新日時 |

サブコレクション `rules`：
| フィールド | データ型 | 説明 |
|---|---|---|
| from_date | string | 適用開始日 ※ドキュメントIDも同じ |
| type | string | 計算方式（`budget`・`affi_cpf`・`affi_cpa`・`budget_cpa`） |
| rate | number | 上乗せ割合（`budget`・`budget_cpa`の場合） |
| cpf | number | 友だち追加単価（`affi_cpf`の場合） |
| cpa | number | 成果単価（`affi_cpa`・`budget_cpa`の場合） |

#### daily_notes（メモ）
| フィールド | データ型 | 説明 |
|---|---|---|
| date | string | 日付 ※ドキュメントIDも同じ |
| note | string | メモ内容 |
| updated_at | string | 更新日時 |

#### client_users（クライアントユーザー）
| フィールド | データ型 | 説明 |
|---|---|---|
| username | string | ログインID |
| password_hash | string | パスワード（bcryptハッシュ） |
| display_name | string | 表示名 |
| is_active | boolean | 有効/無効 |
| pages | array | 閲覧可能ページの配列 |
| created_at | string | 作成日時 |
| updated_at | string | 更新日時 |

---

## 集計ロジック

```
CL数 = クリックログの「LINE追加」かつ「中間ページ」が「中間なし」以外
      + 成果ログの「ボタンクリック」

友だち追加数 = 成果ログの「LINE追加」

CV数 = 成果ログの「CV」

広告費（budget）     = 消化金額 × 上乗せ割合
広告費（affi_cpf）  = 友だち追加単価 × 友だち追加数
広告費（affi_cpa）  = 成果単価 × CV数
広告費（budget_cpa）= 消化金額 × 割合 + 成果単価 × CV数

CPF = 広告費 ÷ 友だち追加数
CPA = 広告費 ÷ CV数
友だち追加率 = 友だち追加数 ÷ CL数
CVR = CV数 ÷ 友だち追加数

コード = フロー × 流入元メディア × 流入元本数
```

---

## 広告費の計算フロー

```
① 管理画面（/media-cost）でメディアごとの計算方式を設定
        ↓
② GAS実行時に /api/media-cost-settings から設定を取得
        ↓
③ コード別・メディア別・フロー別・期間別に広告費を計算
        ↓
④ calc_ad_cost・cpf・cpa_val をFirestoreに保存
        ↓
⑤ レポート表示時は保存済みの値をそのまま表示

※ 広告費設定を変更した場合は自動的に再計算されてFirestoreに保存される
```

---

## スプレッドシートの構成

| シート名 | 用途 |
|---|---|
| クリックログ | CL数（LINE追加かつ中間ページあり）・ボタンクリック |
| 成果ログ | CL数（ボタンクリック）・友だち追加数・CV数 |
| 広告費 | メディア・フロー・本数ごとの消化金額 |

---

## 環境変数

`.env.local` に以下を設定してください（ローカル開発用）：

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
```

---

## 認証・権限

| 機能 | 条件 |
|---|---|
| 管理者ログイン | Googleアカウント（NextAuth） |
| レポート閲覧（管理者） | ログイン必須 |
| メモの編集 | `@5s-inc.jp` ドメインのアカウントのみ |
| ユーザー管理・広告費設定 | `@5s-inc.jp` ドメインのアカウントのみ |
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