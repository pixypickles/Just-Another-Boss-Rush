# ありきたりなボス5戦 — GitHub Pages版 v13

## 更新内容
- リフレクトウォールを完全な円形へ修正
- 半透明の面＋外円＋内円の表示へ変更
- 細長い縦画面では、戦闘エリアを上側の正方形領域へ固定
- ジョイスティックとABCDボタンを下側の操作領域へ移動
- 狭い画面では操作UIを自動縮小

## GitHubへの反映
`index.html`、`style.css`、`game.js`、`.nojekyll` を上書きしてください。
古い表示が残る場合は公開URL末尾に `?v=13` を付けてください。


## v14 changes
- Clear any normal mode once to unlock Awakening Musou Mode (saved in localStorage).
- Awakening mode is solo-only, removes all skill cooldowns, and strengthens bosses.

## 追加調整
- 魔法使いのライフドレイン使用時、吸収範囲を示す半透明の紫色の円が表示され、中心へ縮小します。
- 魔法使いのC「ミニトルネード」が効果中、範囲内の敵弾を消します。
