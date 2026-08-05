# 開発用コマンド

---

## ローカル開発

```bash
# パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

`http://localhost:3000` にアクセスして確認できます。

---

## デプロイ

GitHubの `main` ブランチにpushすると、Vercelに自動デプロイされます。

```bash
git add .
git commit -m "変更内容"
git push
```
