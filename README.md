# ありきたりなボス5戦

**Just Another Boss Rush**

GitHub Pagesでそのまま公開できる静的ゲームです。

## 公開方法

1. このフォルダの中身をGitHubリポジトリのルートへ配置します。
2. GitHubの **Settings → Pages** を開きます。
3. **Deploy from a branch**、`main`、`/(root)` を選択して保存します。
4. 表示されたPages URLをスマートフォンで開きます。

## ファイル構成

```text
index.html
style.css
game.js
.nojekyll
assets/
```

画像を読み込み終えるまでスタートボタンは無効です。読み込みに失敗した場合は、不足しているファイル名がタイトル画面に表示されます。

## 操作

- 移動: WASD / 矢印 / 左スティック
- A: J
- B: K
- C: L
- D（操作キャラ交代）: I
