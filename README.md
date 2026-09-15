# chat-demo-kit

把產品功能做成「AI 小編對話」形式的互動 demo 頁。形式參考 xAI Grok Bot 官網（x.ai/bot）：

- 仿桌面 App 視窗：左邊是 AI 小編清單，右邊是對話；點左邊的小編，對話會逐則播放
- 每段對話的節奏都一樣：交代一句話 → 小編講好規則 → 建立例行任務 → 背景做完、交出打勾清單 → **只問一個例外** → 一句話結案
- 四種功能卡：在你的工具裡工作、做一次給它看、越用越懂、互相接力
- 支援亮色／暗色主題、手機寬度、減少動態效果的系統設定

**播放程式只有一份，每個 demo 只要寫一份劇本檔。**

## 快速開始

```bash
cp -r demos/starter demos/my-product   # 1. 複製起手範例
# 2. 編輯 demos/my-product/demo.mjs
node build.mjs my-product               # 3. 建置（會先檢查劇本有沒有寫錯）
open dist/my-product.html               # 4. 用瀏覽器打開
```

需要 Node.js 18 以上，不用安裝任何套件。

要分享成 Claude Artifact 的話，發布 `dist/<name>.artifact.html`（不含 `<html>`、`<head>`、`<body>` 標籤的版本）。

## 目錄

```
engine/
  player.js     播放程式：讀劇本、畫整頁、播放對話與功能卡動畫
  style.css     版面與元件樣式（顏色全部走 CSS 變數）
demos/
  starter/                起手範例：虛構牙醫診所（4 段對話、2 張功能卡）
  kufu-ai-teammates/      完整範例：Kufu 客服系統（7 段對話、4 張功能卡、設計拆解）
build.mjs       把 engine 與 demo.mjs 組成單一 HTML，輸出到 dist/
GUIDE.md        劇本欄位說明、寫劇本的規則、常見錯誤
PROMPT.md       直接貼給 Claude 的 prompt 範本
```

`dist/` 不進版控，每次用 `node build.mjs` 重新產生。

## 讓 Claude 幫你寫

最快的方式是把 [PROMPT.md](PROMPT.md) 的範本填好後貼給 Claude Code，並在這個 repo 的目錄底下執行。
