# ○×ゲーム

Vercel デプロイ前提の静的な ○×（まるばつ）ゲーム。Google ログイン対応。

## ローカルで動かす

任意の静的サーバーで開く。例:

```sh
npx serve .
# または
python3 -m http.server 8000
```

`file://` 直接開きでも動くが、Google ログインは認可済みオリジンの関係で動かない。

## Google ログインのセットアップ

1. [Google Cloud Console](https://console.cloud.google.com/) を開く
2. プロジェクトを作成（または既存を選択）
3. 左メニュー **APIs & Services → OAuth consent screen**
   - User Type: External
   - アプリ名・サポートメール等を入力して保存
   - Scopes はデフォルトのままで OK（email, profile, openid）
4. 左メニュー **APIs & Services → Credentials**
   - **+ CREATE CREDENTIALS → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins** に以下を追加:
     - `http://localhost:8000`（ローカル確認用、使うポートに合わせる）
     - `https://<あなたの-vercel-url>.vercel.app`（デプロイ後）
   - **Authorized redirect URIs** は不要（GIS は不要）
5. 発行された **Client ID** を `config.js` の `GOOGLE_CLIENT_ID` に貼る
6. Vercel に push して反映

## Vercel デプロイ

1. https://vercel.com/new
2. このリポジトリを Import
3. Framework Preset: **Other**
4. Deploy
5. 発行された URL を Google Cloud Console の Authorized JavaScript origins に追加
