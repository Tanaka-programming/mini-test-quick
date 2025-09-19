# LINEミニアプリ - getDummy() テスト

このプロジェクトは、LINE LIFF（LINE Front-end Framework）を使用して`liff.$commonProfile.getDummy()`メソッドをテストするためのミニアプリです。

## 機能

- LIFF SDKの初期化
- ユーザープロフィール情報の取得
- `liff.$commonProfile.getDummy()`メソッドのテスト
- モックデータの提供（getDummy()が利用できない場合）
- レスポンシブなUIデザイン

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. LIFF IDの設定

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. 新しいプロバイダーまたは既存のプロバイダーを選択
3. 新しいチャネルを作成（LIFFアプリ）
4. LIFFアプリを追加し、エンドポイントURLを設定
5. 生成されたLIFF IDを`app.js`の`liffId`変数に設定

```javascript
// app.js の 7行目を編集
this.liffId = 'YOUR_LIFF_ID'; // 実際のLIFF IDに置き換え
```

### 3. ローカルサーバーの起動

```bash
# 開発用サーバー（自動リロード付き）
npm run dev

# または通常のサーバー
npm start
```

### 4. HTTPSでのアクセス

LIFFアプリはHTTPS環境でのみ動作します。以下の方法でHTTPS環境を構築できます：

#### 方法1: ngrokを使用（推奨）

```bash
# ngrokをインストール
npm install -g ngrok

# ローカルサーバーを起動
npm start

# 別のターミナルでngrokを実行
ngrok http 3000
```

ngrokが提供するHTTPS URLをLINE Developers ConsoleのエンドポイントURLに設定してください。

#### 方法2: 自己署名証明書を使用

```bash
# mkcertをインストール（Windows）
# https://github.com/FiloSottile/mkcert#windows

# 証明書を生成
mkcert -install
mkcert localhost 127.0.0.1 ::1

# HTTPSサーバーで起動
npx http-server -p 3000 -S -C localhost+2.pem -K localhost+2-key.pem
```

## 使用方法

1. ブラウザでアプリにアクセス
2. LIFFの初期化状況を確認
3. 「ダミーデータを取得」ボタンをクリック
4. `liff.$commonProfile.getDummy()`の結果を確認

## ファイル構成

```
mini-test-getDummy()/
├── index.html          # メインHTMLファイル
├── app.js             # JavaScriptアプリケーション
├── styles.css         # CSSスタイル
├── package.json       # 依存関係とスクリプト
└── README.md          # このファイル
```

## 主要な機能

### LIFF初期化
- LIFF SDKの非同期初期化
- エラーハンドリング
- ステータス表示

### プロフィール取得
- `liff.getProfile()`を使用したユーザー情報取得
- ログイン状態の確認
- プロフィール情報の表示

### ダミーデータ取得
- `liff.$commonProfile.getDummy()`の実装
- メソッドが利用できない場合のモックデータ提供
- エラーハンドリング

### UI機能
- レスポンシブデザイン
- リアルタイムステータス更新
- データのリフレッシュとクリア機能

## トラブルシューティング

### LIFF初期化エラー
- LIFF IDが正しく設定されているか確認
- HTTPS環境でアクセスしているか確認
- LINE Developers Consoleでアプリが有効になっているか確認

### getDummy()メソッドが利用できない場合
- アプリは自動的にモックデータを表示します
- コンソールでエラーメッセージを確認してください

### プロフィール取得エラー
- ユーザーがログインしているか確認
- 適切なスコープが設定されているか確認

## 開発者向け情報

### カスタマイズ
- `app.js`でアプリケーションロジックを変更
- `styles.css`でUIデザインを調整
- `index.html`でページ構造を変更

### デバッグ
- ブラウザの開発者ツールでコンソールログを確認
- ネットワークタブでAPI呼び出しを監視

## ライセンス

MIT License

## 注意事項

- このアプリはテスト用です
- 本番環境では適切なセキュリティ対策を実装してください
- LIFF IDは機密情報として管理してください
