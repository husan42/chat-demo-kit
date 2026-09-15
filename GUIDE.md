# 劇本撰寫指南

## 一、要準備的素材

1. **功能清單**：每個功能變成一位小編（建議 4–7 位）
2. **每個功能一個真實的例外情境**：產品真的會碰到、小編必須停下來問人的狀況。這是整份 demo 有沒有說服力的關鍵
3. **設計系統色碼**：主色、底色，其餘沿用預設值即可

品牌名稱和數字用虛構的，並在頁面上標註。

---

## 二、`demo.mjs` 欄位

```js
export default {
  title: '頁籤與分享時顯示的名稱',
  lang: 'zh-Hant',

  theme: { light: { ... }, dark: { ... } },   // 選填，只寫要覆蓋的
  font: { family: '"Noto Sans TC"', href: 'Google Fonts 網址' },  // 選填
  ui: { replay: '播放這段對話', ... },         // 選填，介面文字

  intro: { eyebrow, headline, lead, note },   // headline 可用 <mark> 做螢光筆效果
  app: { brand, user: { name, org, initial }, defaultConvo, typingOn },
  platforms: { LINE: { label: 'LINE', color: '#06C755' } },  // 選填，對話來源標示
  agents: { ... },
  convos: [ ... ],
  features: { title, lead, cards: [ ... ] },  // 選填
  breakdown: { title, lead, columns: [{ title, html }], note }  // 選填
}
```

### 哪些欄位可以放 HTML

劇本檔是你自己寫的程式碼，所以不做過濾。下面這些欄位會**原樣當 HTML 放進頁面**，可以用 `<b>`、`<mark>`、`<br>`；要顯示 `<`、`&` 這類符號時請寫成 `&lt;`、`&amp;`：

- `intro` 的全部欄位
- `script` 的 `b`（小編訊息）
- `features` 的 `title`、`lead`，以及每張卡的 `title`、`desc`、`bubbles`
- `breakdown` 的全部欄位（`columns[].html` 可以放整段結構）

其餘欄位（小編名稱、`u` 使用者訊息、事件、清單、時間、`app` 裡的文字）一律當純文字顯示，寫 HTML 會原樣顯示出標籤。

### 兩種角色對應

同一套程式可以演兩種情境，差別只在劇本怎麼寫：

| | 概念版（Grok Bot 式） | 收件匣版（真實產品畫面） |
|---|---|---|
| 範例 | `demos/kufu-ai-teammates` | `demos/kufu-inbox` |
| 左側清單 | AI 小編 | 顧客對話，加 `platform` 標示來源 |
| 右側 `u` | 使用者（老闆） | AI 客服或真人客服，用 `as` 標名稱、`tone` 分顏色 |
| 左側 `b` | AI 小編 | 顧客 |
| `app.typingOn` | `'b'`（預設，小編在打字） | `'u'`（客服在打字） |

**要放上官網的，請用收件匣版**，並確認畫面上每個元素都是產品真的有的功能；概念版適合提案與簡報。

### agents（小編）

```js
agents: {
  post: { name: '貼文留言管家', glyph: '留', color: '#F7A873' }
}
```

`glyph` 是頭像上的字（一到兩字），`color` 是頭像底色（頭像文字固定是深色，請挑淺色底）。收件匣版的顧客、客服人員也放在這裡。

### convos（對話）

```js
{
  id: 'post',                   // 一般對話：對應 agents 的 key
  sub: 'IG / FB 貼文與直播留言', // 標題旁的副標
  time: '晚上 10:21',           // 左側清單的時間
  platform: 'IG',               // 選填，對應 platforms 的 key
  preview: '左側清單的預覽文字',  // 選填，預設取最後一則回覆
  script: [ ...步驟 ]
}
// 群組對話
{ id: 'group', group: ['post', 'cast'], name: '中秋禮盒作戰群', sub: '...', time: '週五', script: [...] }
```

`app.defaultConvo` 決定打開頁面時先顯示哪一段（靜態顯示完整內容，點擊才播放）。

### script 步驟（每步只能是其中一種）

| 寫法 | 畫面 |
|---|---|
| `{ t: '週三 下午 3:12' }` | 置中灰色時間戳記 |
| `{ u: '使用者說的話' }` | 靠右、主色泡泡 |
| `{ u: '回覆內容', as: '小美', tone: 'human' }` | 靠右泡泡，上方標回覆者；`tone: 'ai'` 主色、`'human'` 深色 |
| `{ b: '小編說的話，可用 <b>粗體</b>' }` | 靠左泡泡，先出現「輸入中」 |
| `{ c: [['ok', '留言', '已回覆 186 則'], ['flag', '待你判斷', '3 則']] }` | 打勾清單，`flag` 那行黃底加旗子 |
| `{ e: 'clock', label: '已建立例行任務', strong: '直播留言自動私訊' }` | 置中淡色系統事件 |

- 群組對話裡的 `b`、`c` 必須加 `from: 'agentId'`
- 事件圖示 `e`：`clock`（例行任務）、`send`（發送）、`rule`（記錄）、`handoff`（交接）、`tool`（接上工具）、`book`（知識庫）、`priority`（優先度）、`tag`（標籤）、`person`（轉真人）、`card`（卡片）、`pause`（暫停）

### features.cards（功能卡，五種）

```js
{ kind: 'computer', title, desc, label: '即時查詢', status: '查詢中', task: '登入物流後台，查 214 筆訂單' }
{ kind: 'watch',    title, desc, banner: '「推播小編」正在觀看學習', cursor: '你' }
{ kind: 'memory',   title, desc, bubbles: ['小編的話', '...'], event: '已更新記憶', agent: 'crm' }
{ kind: 'handoff',  title, desc, agents: ['post', 'cast', 'chief'] }  // 依序輪播 A→B、B→C
{ kind: 'checklist', title, desc, caption: '推播成效', rows: [['ok', '發送', '1,247 位'], ['flag', '未送出', '11 位']] }
```

放 2 張或 4 張排版最好看。

### theme 可覆蓋的色彩

`brand` `brandHover` `brandInk`（主色泡泡上的文字色）`ground` `card` `panel`（功能卡底色）`bubble` `text` `text2` `muted` `border` `sidebar` `active` `flag` `flagBg` `ok` `shadow` `stageA`（「工具」卡背景）`stageB`（「觀看」卡背景）

---

## 三、寫劇本的規則

每段對話照這六步：

1. 使用者用**一句口語**交代事情
2. 小編先講好規則：「什麼情況我會先問你，不會亂猜」
3. 系統事件：`已建立例行任務 · 任務名`
4. 時間戳記跳開（例如週三下午 → 週五晚上），表示小編在背景做完
5. 打勾清單 3–4 行，最後一行是 `flag`：「待你判斷 → N 件」
6. 只問**一個**具體例外；使用者回一句話，小編結案（可以再加 `rule` 事件「已記住 · 這次的決定」）

---

## 四、最容易寫壞的地方

- **例外太空泛**：「有一筆資料異常，要處理嗎？」沒有說服力。要有人名、日期、金額，而且是產品真的會碰到的邊界狀況
- **一次問好幾個問題**：這個形式的賣點是「例外才來找你」，問三個就變成在交代工作給人
- **數字加不起來**：例如 186 則留言 = 172 私訊 + 3 客訴 + 11 關閉私訊。細心的讀者會去算
- **把還沒做的功能寫得像現成的**：用在行銷頁前逐一核對，構想要在 `breakdown.note` 標註或直接拿掉
- **高風險產業讓 AI 自己下判斷**：醫療、法律、金融類的例外，一律寫成「轉給專業人員」，不要寫成 AI 自己處理

`node build.mjs` 會檢查欄位格式（步驟類型、`from` 對不對得上、圖示名稱等），**但不會檢查內容**，上面這五點要靠人看。
