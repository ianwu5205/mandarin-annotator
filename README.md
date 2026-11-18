# 字字有聲

Vue 3 + Vite + Tailwind CSS 4 華語拼音／注音工具。

[開啟華語雙拼編輯器](https://ianwu5205.github.io/mandarin-annotator/)

## 開發

```sh
npm install
npm run dev
```

開啟終端機顯示的本機網址，不能直接以 file:// 開啟 index.html。

## 驗證與建置

```sh
npm test
npm run build
npm run preview
```

建置結果位於 dist/，可部署到靜態網站空間。

- 輸入華語即時產生上方拼音、右側直排注音與聲調。
- 支援範例文字、清空、換行、字級調整及列印／另存 PDF。
- pinyin-pro 透過 npm 安裝並由 Vite 一起打包，執行時不從 CDN 載入字庫；Google Noto 字型仍需網路，無網路時使用系統字型。
- 多音字依上下文判讀，特殊人名、地名與臺灣慣用讀音請人工確認。
- src/App.vue 為互動畫面，src/phonetics.js 為拼音與注音轉換，src/style.css 為 Tailwind 入口及主題。
