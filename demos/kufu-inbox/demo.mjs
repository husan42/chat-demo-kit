// Kufu 官網用的「真實版」示範：每個畫面都對應 Kufu 已上線的功能。
// 角色：左側＝顧客，右側＝AI 客服或真人客服，置中＝系統在背景做的事。
// 情境：虛構甜點品牌「山嵐手作」的中秋檔期。所有數字皆為範例。
//
// 與 demos/kufu-ai-teammates（概念版）的差別：那份是「店長和 AI 小編聊天」，
// Kufu 沒有這個介面，只能當提案用；這份才適合放官網。
export default {
  title: 'Kufu 收件匣示範',
  lang: 'zh-Hant',

  theme: {
    light: {
      stageA: 'linear-gradient(150deg, #FFE98A 0%, #F4B970 50%, #8A6A3E 100%)',
      stageB: 'linear-gradient(180deg, #7E9C8E 0%, #E8C98A 70%, #F3A76F 100%)'
    }
  },

  ui: {
    composer: '回覆 ',
    search: '搜尋顧客或訊息',
    unread: '未讀',
    sendingTo: '轉給'
  },

  intro: {
    eyebrow: 'KUFU 酷服 · 產品示範',
    headline: 'AI 先接住每則訊息，<mark>處理不了才交給你</mark>',
    lead: 'LINE、Facebook、Instagram 的訊息集中在同一個收件匣。AI 依照你的知識庫回覆、貼標籤、判斷急迫程度；遇到客訴或需要人判斷的，直接轉給真人客服。',
    note: '虛構品牌「山嵐手作」的示範情境，數字皆為範例，畫面為示意。點左側任一則對話，可以看它播放一次。'
  },

  app: {
    brand: 'Kufu',
    user: { name: '小美', org: '山嵐手作 · 客服', initial: '美' },
    defaultConvo: 'lin',
    typingOn: 'u'
  },

  platforms: {
    LINE: { label: 'LINE', color: '#06C755' },
    FB: { label: 'FB', color: '#0866FF' },
    IG: { label: 'IG', color: 'linear-gradient(45deg, #F58529, #DD2A7B 55%, #8134AF)' }
  },

  // 顧客與客服人員都放在這裡（頭像、名稱）
  agents: {
    lin: { name: '林先生', glyph: '林', color: '#F7A873' },
    chen: { name: '陳怡君', glyph: '陳', color: '#8EC1F5' },
    amy: { name: '@amy.eats', glyph: 'A', color: '#E7B6D6' },
    wang: { name: '王小姐', glyph: '王', color: '#8FD1B8' },
    wu: { name: '吳小姐', glyph: '吳', color: '#B7A6F2' },
    ai: { name: 'AI 客服', glyph: 'AI', color: '#FFDD36' },
    mei: { name: '小美', glyph: '美', color: '#F2C0A2' },
    store: { name: '門市人員', glyph: '門', color: '#C9D8A8' }
  },

  convos: [
    {
      // 客訴 → 優先度標高 → 轉真人 → AI 暫停 → 真人處理完 → AI 恢復
      id: 'lin', platform: 'LINE', sub: '客訴 · 已由小美處理', time: '上午 10:41',
      script: [
        { b: '禮盒收到裂了一半，這是要送人的，真的很傻眼' },
        { e: 'priority', label: 'AI 判斷優先度', strong: '高優先級' },
        { u: '非常抱歉讓您收到損壞的禮盒。已經幫您轉給專人處理，會盡快與您聯繫。', as: 'AI 客服', tone: 'ai' },
        { e: 'person', label: '已轉給小美', strong: 'AI 自動回覆暫停' },
        { t: '上午 10:36' },
        { u: '林先生您好，我是客服小美。麻煩拍一張外盒和裂開處的照片，我們今天就補寄新的一盒，不用寄回。', as: '小美', tone: 'human' },
        { b: '（傳送了 2 張照片）這樣可以嗎' },
        { u: '收到，已安排今天下午補寄，物流單號晚點傳給您。真的很抱歉。', as: '小美', tone: 'human' }
      ]
    },
    {
      // 知識庫回覆 + 商品卡片 + AI 標籤
      id: 'chen', platform: 'IG', sub: '私訊 · AI 已回覆', time: '下午 2:19',
      script: [
        { t: '今天 下午 2:14' },
        { b: '請問中秋禮盒可以寄冷凍到金門嗎？' },
        { u: '您好！離島目前無法寄送冷凍商品，但芋頭酥禮盒有常溫款，一樣可以寄到金門喔。', as: 'AI 客服', tone: 'ai' },
        { e: 'book', label: '依知識庫回覆', strong: '配送範圍說明' },
        { b: '常溫的可以放多久？' },
        { u: '常溫款未開封可保存 14 天，收到後放在陰涼處就好。這是禮盒的資訊，給您參考。', as: 'AI 客服', tone: 'ai' },
        { e: 'card', label: '已傳送商品卡片', strong: '中秋芋頭酥禮盒（常溫）' },
        { e: 'tag', label: 'AI 已貼上標籤', strong: '離島配送' },
        { b: '好，我下單了，謝謝' },
        { u: '謝謝您！出貨後會再通知您物流單號。', as: 'AI 客服', tone: 'ai' }
      ]
    },
    {
      // 貼文留言 → 公開回覆 → 私訊商品卡片
      id: 'amy', platform: 'IG', sub: '貼文留言 · 中秋禮盒開賣', time: '週五',
      script: [
        { t: '週五 晚上 9:02' },
        { b: '（在貼文「中秋禮盒開賣」留言）+1 想要兩盒' },
        { e: 'send', label: '已公開回覆留言', strong: '「已私訊您禮盒資訊囉」' },
        { u: '謝謝您的留言！這是中秋禮盒的資訊，點下方按鈕就能選購。', as: '貼文自動回覆', tone: 'ai' },
        { e: 'card', label: '已私訊卡片訊息', strong: '按鈕「立即選購」' },
        { b: '可以指定 9/15 到貨嗎？' },
        { u: '可以的，結帳時在備註寫上到貨日期即可，最晚 9/10 前下單喔。', as: 'AI 客服', tone: 'ai' },
        { e: 'book', label: '依知識庫回覆', strong: '指定到貨日' }
      ]
    },
    {
      // 推播點擊追蹤 → 顧客詢問 → AI 回覆
      id: 'wang', platform: 'LINE', sub: '從推播點進來', time: '週六',
      script: [
        { t: '週六 上午 10:00' },
        { e: 'send', label: '收到推播', strong: '中秋禮盒回購' },
        { e: 'rule', label: '已點擊推播連結，記入', strong: '顧客時間軸' },
        { t: '上午 10:05' },
        { b: '剛看到推播，老客人有優惠嗎？' },
        { u: '有的！一年內買過的老朋友，結帳輸入代碼 MOON10 享 9 折，期限到 9/20。', as: 'AI 客服', tone: 'ai' },
        { e: 'book', label: '依知識庫回覆', strong: '中秋回購優惠' },
        { b: '那我訂三盒' },
        { u: '好的，這是訂購連結，選好數量就能結帳。', as: 'AI 客服', tone: 'ai' },
        { e: 'tag', label: 'AI 已貼上標籤', strong: '回購' }
      ]
    },
    {
      // 知識庫答得出的部分 AI 回，需要門市確認的轉真人
      id: 'wu', platform: 'FB', sub: 'Messenger · 待門市回覆', time: '昨天',
      script: [
        { t: '昨天 晚上 11:48' },
        { b: '你們門市週日有開嗎？想現場買' },
        { u: '週日有營業喔，時間是上午 11 點到晚上 7 點，門市也有禮盒可以直接帶走。', as: 'AI 客服', tone: 'ai' },
        { e: 'book', label: '依知識庫回覆', strong: '門市營業時間' },
        { b: '可以先幫我保留兩盒嗎？' },
        { u: '保留需要門市確認庫存，我幫您轉給門市人員，明天開店後會回覆您。', as: 'AI 客服', tone: 'ai' },
        { e: 'person', label: '已轉真人客服', strong: '門市人員' }
      ]
    }
  ],

  features: {
    title: '看不到的地方，Kufu 也在幫你做',
    lead: '每一則對話背後，系統都在整理顧客資料、追蹤成效。',
    cards: [
      {
        kind: 'handoff',
        title: 'AI 處理不了，就交給真人',
        desc: '客訴、需要確認庫存、知識庫沒有答案的問題，AI 會轉給指定的客服，並暫停這段對話的自動回覆，不會和真人搶著回。',
        agents: ['ai', 'mei', 'ai', 'store']
      },
      {
        kind: 'memory',
        title: '每位顧客都有自己的時間軸',
        desc: '問過什麼、被貼了什麼標籤、點過哪一則推播，全部記在同一張顧客卡上，換誰接手都看得懂。',
        bubbles: [
          '9/08　IG 私訊詢問離島配送',
          '9/08　AI 貼上標籤「離島配送」',
          '9/12　點擊推播「中秋禮盒回購」'
        ],
        event: '顧客時間軸', agent: 'chen'
      },
      {
        kind: 'checklist',
        title: '推播發出去，誰點了都知道',
        desc: '推播裡的連結自動換成追蹤網址，點擊數和點擊的人都看得到。',
        caption: '中秋禮盒回購 · 推播成效',
        rows: [
          ['ok', '發送', '1,247 位'],
          ['ok', '點擊', '312 位（25%）'],
          ['ok', '時間軸', '已記入 312 位顧客']
        ]
      },
      {
        kind: 'checklist',
        title: '貼文留言自動回，漏掉的也看得到',
        desc: '留言自動公開回覆並私訊卡片訊息；沒送出去的，統計頁會標出來。',
        caption: '中秋禮盒開賣 · 貼文自動回覆',
        rows: [
          ['ok', '留言', '已回覆 186 則'],
          ['ok', '私訊', '175 位收到卡片訊息'],
          ['flag', '未送出', '11 位未開放 IG 私訊']
        ]
      }
    ]
  },

  breakdown: {
    title: '畫面上的每一個元素，對應哪個功能',
    lead: '給行銷與設計同事確認用：畫面裡出現的東西，都是 Kufu 已經有的功能。',
    columns: [
      {
        title: '收件匣',
        html: '<ul><li><b>左側清單</b>：LINE、Facebook、Instagram 的對話集中在一起，標示來源平台</li><li><b>AI 客服</b>（主色泡泡）：依知識庫自動回覆</li><li><b>真人客服</b>（深色泡泡）：轉接後由客服接手</li></ul>'
      },
      {
        title: '系統事件',
        html: '<ul><li><b>依知識庫回覆</b>：AI 智能回覆・RAG 知識庫</li><li><b>AI 判斷優先度</b>：AI 優先度智能分類</li><li><b>已貼上標籤</b>：客戶標籤與分類</li><li><b>已轉真人、自動回覆已暫停</b>：轉真人客服</li><li><b>商品卡片、卡片訊息</b>：AI 回覆推薦商品、貼文自動回覆的私訊卡片</li></ul>'
      },
      {
        title: '功能卡片',
        html: '<ul><li><b>時間軸</b>：顧客時間軸</li><li><b>推播成效</b>：推播行銷與點擊追蹤</li><li><b>貼文留言</b>：社群互動監控、貼文自動回覆</li></ul>'
      }
    ],
    note: '上線前請再次核對：畫面為示意，實際介面與用詞以產品為準；「推播點擊記入時間軸」只記錄首次點擊；貼文自動回覆「未送出原因」目前在自動化紀錄與統計頁查看，完整原因明細僅部分商家可見。'
  }
}
