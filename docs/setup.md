# レポートダッシュボード 導入手順書（Firebase版）
 
---
 
## 全体の流れ
 
```
① Googleの準備
        ↓
② Firebaseの準備
        ↓
③ Firebase App Hostingへのデプロイ
        ↓
④ スプレッドシートの準備
        ↓
⑤ GASの設定
        ↓
⑥ 動作確認
```
 
---
 
## ① Googleの準備

### 1-1. サービスアカウントの作成（スプシへのAPIアクセス用） （※全案件共通）

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「ライブラリ」から「Google Sheets API」を有効化
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「サービスアカウント」を選択
   - [「APIとサービス」](https://gyazo.com/11c76a7169b748d69e756805c9992e48)
   - [「認証情報」](https://gyazo.com/8f2125de8bf347475f9b766098e869fa)
   - [「認証情報を作成」→「サービスアカウント」](https://gyazo.com/4514624c4d2284609deb126bbf300bc4)
5. サービスアカウントを作成後、「キー」タブから「JSONキーを作成」
   - [サービスアカウント名、サービスアカウントIDを入力後、「作成して閉じる」ボタンをクリック](https://gyazo.com/5fa9d3fd84cefec4638ad169e902c9d2)
   - [作成されたサービスアカウントをクリック](https://gyazo.com/0d397843d4db90ed1a830d9b1411fc73)
   - [「キー」](https://gyazo.com/7c32a4681164a8724bec9c2b9c6a04ee)
   - [「新しい鍵を作成」](https://gyazo.com/c2fa1cf1305fa85204cf5400fd46a1fc)
   - [「JSON」にチェックを入れて作成](https://gyazo.com/3f2fec5dd796a9af9771e1df3209500f)
6. ダウンロードしたJSONファイルから以下を控える：
   - `client_email`（例: `xxxxx@xxxxx.iam.gserviceaccount.com`）
   - `private_key`（`-----BEGIN PRIVATE KEY-----` から始まる文字列）

### 1-2. OAuthクライアントIDの作成（Googleログイン用） （※全案件共通）

1. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」を選択
   - [「APIとサービス」](https://gyazo.com/11c76a7169b748d69e756805c9992e48)
   - [「認証情報」](https://gyazo.com/8f2125de8bf347475f9b766098e869fa)
   - [「OAuthクライアントID」](https://gyazo.com/b97dd5d08f2ec1fc0e2d42cdbba6e6a1)
2. アプリケーションの種類：「ウェブアプリケーション」を選択
3. 名前を入力（例：ファーマフーズ株式会社｜ニューモ）
4. 作成後、以下を控える：
   - クライアントID
   - クライアントシークレット

---

## ② Firebaseの準備
 
### 2-1. プロジェクト作成
 
1. [firebase.google.com](https://firebase.google.com) にアクセス
2. 「コンソールへ移動」をクリック
3. 「プロジェクトを追加」をクリック
4. プロジェクト名を入力（例: `report-dashboard`）
5. Googleアナリティクスは「無効」でOK
6. 「プロジェクトを作成」をクリック
 
### 2-2. BlazeプランにアップグレードF
 
Firebase App Hostingの使用にはBlazeプランへのアップグレードが必要です。
 
1. 作成したプロジェクトを開く
2. 左下の「アップグレード」をクリック
3. Blazeプランを選択
4. クレジットカードを登録
 
### 2-3. Firestoreの有効化
 
1. 左メニュー「Firestore Database」をクリック
2. 「データベースを作成」をクリック
3. 以下を設定：
   - データベースID: 任意（例: `report-dashboard`）※控えておく
   - ロケーション: `asia-northeast1`（東京）
   - セキュリティルール: 「本番環境モード」を選択
4. 「作成」をクリック
 
### 2-4. Firestoreの複合インデックスを作成
 
以下のAPIにアクセスしてエラーメッセージ内のURLからインデックスを作成します。
デプロイ後に各APIにアクセスしてインデックスを作成してください。
 
必要なインデックス：
 
| コレクション | フィールド1 | フィールド2 |
|---|---|---|
| `daily_reports_by_p` | `p_value` 昇順 | `date` 昇順 |
| `daily_reports_by_s` | `s_value` 昇順 | `date` 昇順 |
| `daily_reports_by_exit` | `exit_value` 昇順 | `date` 昇順 |
| `daily_reports_by_appeal` | `appeal_value` 昇順 | `date` 昇順 |
 
### 2-5. ウェブアプリの登録
 
1. 「プロジェクトの設定」→「全般」タブ
2. 「マイアプリ」→「ウェブアプリを追加」をクリック
3. アプリ名を入力（例: `report-dashboard`）
4. 「このアプリの Firebase Hosting も設定します」は**チェックなし**でOK
5. 「アプリを登録」をクリック
6. 表示された設定情報を控える：
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```
 
### 2-6. サービスアカウントキーの取得
 
1. 「プロジェクトの設定」→「サービスアカウント」タブ
2. 「新しい秘密鍵の生成」をクリック
3. JSONファイルをダウンロード
4. 以下の値を控える：
   - `project_id`
   - `client_email`
   - `private_key`
---
 
## ③ Firebase App Hostingへのデプロイ
 
### 3-1. Firebase CLIのインストール
 
```bash
sudo npm install -g firebase-tools
```
 
### 3-2. Firebaseにログイン
 
```bash
firebase login
```
 
### 3-3. GitHubリポジトリの準備
 
1. [github.com/nishihara721/report-dashboard-firebase](https://github.com/nishihara721/report-dashboard-firebase) をフォーク
   またはリポジトリをクローンして新しいリポジトリにpush
### 3-4. Firebase App Hostingを初期化
 
```bash
firebase init apphosting
```
 
以下を選択：
- `Use an existing project` → 作成したFirebaseプロジェクトを選択
- `Create a new backend`
- Region: `asia-east1`
- Backend name: 任意（例: `report-dashboard`）
- Runtime: `nodejs22`
- Root directory: そのままEnter
- Agent skills: `N`
### 3-5. シークレットの登録
 
以下のコマンドで各シークレットを登録してください：
 
```bash
firebase apphosting:secrets:set NEXTAUTH_SECRET
firebase apphosting:secrets:set NEXTAUTH_URL
firebase apphosting:secrets:set GOOGLE_CLIENT_ID
firebase apphosting:secrets:set GOOGLE_CLIENT_SECRET
firebase apphosting:secrets:set FB_PROJECT_ID
firebase apphosting:secrets:set FB_CLIENT_EMAIL
firebase apphosting:secrets:set FB_PRIVATE_KEY
firebase apphosting:secrets:set SYNC_SECRET
firebase apphosting:secrets:set GOOGLE_SHEETS_ID
firebase apphosting:secrets:set GOOGLE_SERVICE_ACCOUNT_EMAIL
firebase apphosting:secrets:set GOOGLE_PRIVATE_KEY
```
 
各コマンドの質問には以下を選択：
- `Production`
- アクセス権限の付与: `Y`
- `apphosting.yaml` への追加: `Y`
### 3-6. `apphosting.yaml` を修正
 
```yaml
runConfig:
  minInstances: 0
 
env:
  - variable: NEXTAUTH_SECRET
    secret: NEXTAUTH_SECRET
  - variable: NEXTAUTH_URL
    secret: NEXTAUTH_URL
  - variable: GOOGLE_CLIENT_ID
    secret: GOOGLE_CLIENT_ID
  - variable: GOOGLE_CLIENT_SECRET
    secret: GOOGLE_CLIENT_SECRET
  - variable: FB_PROJECT_ID
    secret: FB_PROJECT_ID
  - variable: FB_CLIENT_EMAIL
    secret: FB_CLIENT_EMAIL
  - variable: FB_PRIVATE_KEY
    secret: FB_PRIVATE_KEY
  - variable: SYNC_SECRET
    secret: SYNC_SECRET
  - variable: GOOGLE_SHEETS_ID
    secret: GOOGLE_SHEETS_ID
  - variable: GOOGLE_SERVICE_ACCOUNT_EMAIL
    secret: GOOGLE_SERVICE_ACCOUNT_EMAIL
  - variable: GOOGLE_PRIVATE_KEY
    secret: GOOGLE_PRIVATE_KEY
  - variable: NEXT_PUBLIC_ENABLE_SHARED_REPORT
    value: "true"
    availability:
      - BUILD
      - RUNTIME
```
 
**注意：** `variable` と `secret` の名前を必ず一致させてください。
 
### 3-7. `app/lib/firebase-admin.ts` のデータベースIDを設定
 
```typescript
export const adminDb = getFirestore('あなたのデータベースID');
```
 
2-3で設定したデータベースIDを入力してください。
 
### 3-8. 初回デプロイ
 
```bash
git add .
git commit -m "initial deploy"
git push
firebase deploy
```
 
デプロイ完了後、表示されたURLを控える（例: `https://xxx--yyy.asia-east1.hosted.app`）
 
### 3-9. OAuthリダイレクトURIの追加
 
Google Cloud Consoleに戻り、OAuthクライアントIDの承認済みリダイレクトURIに追加：
 
```
https://あなたのFirebaseURL/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```
 
### 3-10. `NEXTAUTH_URL` のシークレットを更新
 
```bash
firebase apphosting:secrets:set NEXTAUTH_URL
```
 
値にFirebaseのURL（例: `https://xxx--yyy.asia-east1.hosted.app`）を入力
 
### 3-11. 再デプロイ
 
```bash
firebase deploy
```
 
---
 
## ④ スプレッドシートの準備
 
### 必要なシート構成
 
以下のシートを用意してください。**列名は必ず以下の通りにしてください。**
 
---
 
#### 【データ】セッション数
- ヘッダーが **4行目** にある
- 必須列：
| 列名 | 説明 |
|---|---|
| `日付` | 日付（例: 2026/03/18） |
| `合計` | PV数の合計 |
| `訴求名` | 訴求別のPV数（訴求ごとに列を追加） |
 
---
 
#### 【データ】フリップデスク
- ヘッダーが **1行目** にある
- 必須列：
| 列名 | 説明 |
|---|---|
| `日付` | 日付 |
| `自動ポップアップ表示回数` | imp数 |
| `ポップアップ内のクリック数` | CL数（`CL_SOURCE=flipdesk` の場合） |
| `p` | ポップアップの識別値（例: p01） |
| `s` | シナリオの識別値（例: s01） |
| `離脱地点` | 離脱地点の識別値（例: LP離脱） |
| `訴求` | 訴求の識別値 |
 
---
 
#### 【データ】友だちデータ
- ヘッダーが **1行目** にある
- 必須列：
| 列名 | 説明 |
|---|---|
| `友だち追加日時` | 日時（例: 2026/3/18 16:38） |
| `p` | ポップアップの識別値 |
| `s` | シナリオの識別値 |
| `離脱地点` | 離脱地点の識別値 |
| `訴求` | 訴求の識別値 |
 
---
 
#### 【データ】成果ログ
- ヘッダーが **1行目** にある
- 必須列：
| 列名 | 説明 |
|---|---|
| `成果日時` | 日時（例: 2026/03/18 18:52:00） |
| `p` | ポップアップの識別値 |
| `s` | シナリオの識別値 |
| `成果単価` | 1件あたりの単価（数値） |
| `訴求` | 訴求の識別値 |
 
---
 
#### 【データ】クリックログ（`CL_SOURCE=clicklog` の場合のみ）
- ヘッダーが **1行目** にある
- 必須列：
| 列名 | 説明 |
|---|---|
| `クリック日時` | 日時 |
| `CV/追加` | 種別（`LINE追加` の行をCL数としてカウント） |
| `p` | ポップアップの識別値 |
| `s` | シナリオの識別値 |
| `離脱地点` | 離脱地点の識別値 |
 
---
 
#### 【データ】基幹数値（期間別共有用を使う場合のみ）
 
| 列 | 列名 | 説明 |
|---|---|---|
| A列 | 日付 | 日付 |
| B列 | CV数 | CV数 |
| C列 | 成果単価 | 成果単価 |
| D列 | 請求額 | 請求額 |
 
---
 
### サービスアカウントへの共有設定
 
スプレッドシートを開き、「共有」からサービスアカウントのメールアドレス（`client_email`）を **閲覧者** として追加してください。
 
---
 
## ⑤ GASの設定
 
### 5-1. スクリプトの設置
 
1. スプレッドシートのメニュー「拡張機能」→「Apps Script」を開く
2. GASのコード（`syncToSupabase` 関数）を貼り付け
3. 以下の箇所を実際の値に変更：
```javascript
const NEXT_APP_URL = 'https://あなたのFirebaseURL';
const SYNC_SECRET = 'Firebaseシークレットに設定したSYNC_SECRETと同じ値';
 
// 訴求として扱わない列名のリスト
const excludeColumns = ['日付', '合計', '除外したい列名'];
```
 
### 5-2. 初回データ投入
 
1. GASの画面で `syncToSupabase` 関数を選択
2. 「実行」ボタンをクリック
3. 初回は権限の許可を求められるので「許可」をクリック
4. ログに `syncレスポンス: 200 {"success":true}` と表示されれば成功
 
---
 
## ⑥ 動作確認
 
1. Firebaseのデプロイ先URLにアクセス
2. Googleアカウントでログイン
3. 各ページでデータが表示されることを確認
4. `/admin` ページでクライアントユーザーを作成
5. `/client/login` にアクセスしてクライアントログインを確認
---
 
## ユーザー管理
 
### 管理者がクライアントユーザーを作成する手順
 
1. `https://あなたのFirebaseURL/admin` にアクセス（`@5s-inc.jp` アカウントのみ）
2. 「ユーザーを追加」をクリック
3. クライアント名・ログインID・パスワード・閲覧可能ページを設定
4. 作成後、以下をクライアントに共有：
   - ログインURL: `https://あなたのFirebaseURL/client/login`
   - ログインID
   - パスワード
---
 
## 新しい案件を追加する場合
 
1. Firebaseで新しいプロジェクトを作成（②の手順を繰り返す）
2. Firebase CLIで新しいプロジェクトに切り替え：
```bash
   firebase use --add
```
3. シークレットを登録して再デプロイ
4. 新しいスプレッドシートにサービスアカウントを共有
5. GASを設置して `NEXT_APP_URL` と `SYNC_SECRET` を更新
---
 
## 環境変数一覧
 
`.env.local` に以下を設定してください（ローカル開発用）：
 
```env
# Firebase クライアント設定
NEXT_PUBLIC_FIREBASE_API_KEY=控えたapiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=控えたauthDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=控えたprojectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=控えたstorageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=控えたmessagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=控えたappId
 
# Firebase Admin SDK
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
 
# 期間別（共有用）ページの表示/非表示
NEXT_PUBLIC_ENABLE_SHARED_REPORT=true
```
 
---
 
## トラブルシューティング
 
| 症状 | 原因 | 対処法 |
|---|---|---|
| `5 NOT_FOUND` エラー | FirestoreのデータベースIDが違う | `firebase-admin.ts` のデータベースIDを確認 |
| `9 FAILED_PRECONDITION` エラー | Firestoreの複合インデックスが未作成 | エラーメッセージ内のURLからインデックスを作成 |
| ログインできない | OAuthのリダイレクトURI未設定 | Google Cloud ConsoleでURIを追加 |
| データが表示されない | GASが未実行 | GASで `syncToSupabase` を手動実行 |
| シークレットが反映されない | 再デプロイが必要 | `firebase deploy` を実行 |
| `FIREBASE_` プレフィックスエラー | Firebaseの予約済みプレフィックス | `FB_` プレフィックスを使用する |
 