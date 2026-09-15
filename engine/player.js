// 播放引擎：讀取 build.mjs 注入的 window.DEMO，畫出整頁並播放對話。
// 劇本內容一律由 demo.mjs 提供，這個檔案不放任何專案專屬文字。
(function () {
  var D = window.DEMO;
  var ui = D.ui;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ICON = {
    clock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.3 1.5"/></svg>',
    send: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M14 2 2 7l5 2 2 5z"/><path d="m7 9 3-3"/></svg>',
    rule: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3.5h10M3 8h10M3 12.5h6"/></svg>',
    handoff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 8h10M9 4.5 12.5 8 9 11.5"/></svg>',
    tool: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 2v4M10 2v4M4 6h8v2a4 4 0 0 1-8 0zM8 12v2"/></svg>',
    ok: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8.5 3.2 3L13 4.5"/></svg>',
    flag: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.5 1.8h1.4v12.6H3.5z"/><path d="M5 2.3h8.2l-2 3.2 2 3.2H5z"/></svg>'
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function avatar(id, cls) {
    var a = D.agents[id];
    return '<span class="av ' + (cls || '') + '" style="background:' + a.color + '" aria-hidden="true">' + esc(a.glyph) + '</span>';
  }
  function convoAvatar(c) {
    if (c.group) return '<span class="av-group" aria-hidden="true">' + avatar(c.group[0]) + avatar(c.group[1]) + '</span>';
    return avatar(c.id);
  }
  function nameOf(c) { return c.name || D.agents[c.id].name; }
  function lastLine(c) {
    for (var i = c.script.length - 1; i >= 0; i--) {
      if (c.script[i].b) return c.script[i].b.replace(/<[^>]+>/g, '');
    }
    return '';
  }

  // ---------- 功能卡片的示意畫面 ----------
  function mockList() {
    var widths = [62, 48, 70, 40, 55];
    return '<div class="mock" aria-hidden="true">' +
      '<div class="mock-bar"><i></i><i></i><i></i><span></span></div>' +
      '<div class="mock-body"><div class="mock-side"><i></i><i></i><i></i><i></i></div>' +
      '<div class="mock-main"><div class="mock-top"><span class="mock-search"></span><span class="mock-btn"></span></div>' +
      widths.map(function (w) { return '<div class="mock-row"><i></i><span style="width:' + w + '%"></span><b></b></div>'; }).join('') +
      '</div></div><span class="mock-cursor"></span></div>';
  }
  function mockDash(label) {
    var bars = [38, 26, 52, 34, 60, 42, 74, 50, 66, 80];
    return '<div class="mock mock-dash" aria-hidden="true">' +
      '<div class="mock-bar"><i></i><i></i><i></i><span></span></div>' +
      '<div class="mock-body"><div class="mock-side"><i></i><i></i><i></i><i></i></div>' +
      '<div class="mock-main"><div class="mock-top"><span class="mock-search"></span><span class="mock-btn"></span><span class="mock-btn"></span></div>' +
      '<div class="mock-stats"><span></span><span></span><span></span></div>' +
      '<div class="mock-bars">' + bars.map(function (h) { return '<i style="height:' + h + '%"></i>'; }).join('') + '</div>' +
      '</div></div><span class="mock-you"><svg viewBox="0 0 12 12"><path d="M1 1l9 4-4 1.2L4.6 10z"/></svg><em>' + esc(label) + '</em></span></div>';
  }
  function featureStage(f, i) {
    if (f.kind === 'computer') {
      return '<div class="fc-stage fc-computer">' +
        '<div class="fc-panel-head"><strong>' + esc(f.label) + '</strong><span class="fc-status"><i class="fc-spin"></i>' + esc(f.status) + '</span></div>' +
        '<div class="fc-task">' + esc(f.task) + '</div>' +
        '<div class="fc-shot">' + mockList() + '</div></div>';
    }
    if (f.kind === 'watch') {
      return '<div class="fc-stage fc-stage-b"><div class="fc-banner"><span>' + esc(f.banner) + '</span><span aria-hidden="true">×</span></div>' + mockDash(f.cursor) + '</div>';
    }
    if (f.kind === 'memory') {
      return '<div class="fc-stage fc-plain"><div class="fc-mem">' +
        f.bubbles.map(function (b) { return '<div class="fc-bubble">' + b + '</div>'; }).join('') +
        '<div class="fc-mem-event">' + esc(f.event) + '<span class="fc-chip">' + avatar(f.agent, 'xs') + esc(D.agents[f.agent].name) + '</span></div>' +
        '</div></div>';
    }
    // handoff
    return '<div class="fc-stage fc-plain"><div class="fc-relay" data-relay="' + i + '"></div></div>';
  }

  // ---------- 整頁骨架 ----------
  var intro = D.intro;
  var html =
    '<header class="intro">' +
      (intro.eyebrow ? '<div class="eyebrow">' + intro.eyebrow + '</div>' : '') +
      '<h1>' + intro.headline + '</h1>' +
      (intro.lead ? '<p>' + intro.lead + '</p>' : '') +
      (intro.note ? '<div class="demo-note">' + intro.note + '</div>' : '') +
    '</header>' +
    '<section class="window" aria-label="' + esc(D.app.brand) + ' 示範畫面">' +
      '<aside class="side">' +
        '<div class="side-top"><div class="lights" aria-hidden="true"><i></i><i></i><i></i></div>' +
        '<div class="brandmark"><b aria-hidden="true"></b>' + esc(D.app.brand) + '</div></div>' +
        '<div class="search" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="7" r="5"/><path d="m11 11 3.5 3.5"/></svg>' + esc(ui.search) + '</div>' +
        '<ul class="list" id="list"></ul>' +
        '<div class="side-foot"><div class="me">' + esc(D.app.user.initial) + '</div>' +
        '<div><div>' + esc(D.app.user.name) + '</div><div class="me-sub">' + esc(D.app.user.org) + '</div></div></div>' +
      '</aside>' +
      '<div class="chat">' +
        '<div class="chat-head"><div class="chat-title" id="chatTitle"></div>' +
        '<button class="btn" id="replay" type="button"><svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z"/></svg>' + esc(ui.replay) + '</button></div>' +
        '<div class="scroll" id="scroll" aria-live="polite"></div>' +
        '<div class="composer" aria-hidden="true"><span class="plus">+</span><span class="ph" id="composerPh"></span>' +
        '<span class="mic"><svg viewBox="0 0 16 16" fill="currentColor"><rect x="5.5" y="1.5" width="5" height="9" rx="2.5"/><path d="M3 7.5a5 5 0 0 0 10 0" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 12.5v2.5" stroke="currentColor" stroke-width="1.5"/></svg></span></div>' +
      '</div>' +
    '</section>';

  if (D.features) {
    html += '<section class="features">' +
      '<h2>' + D.features.title + '</h2>' + (D.features.lead ? '<p>' + D.features.lead + '</p>' : '') +
      '<div class="fc-grid">' + D.features.cards.map(function (f, i) {
        return '<article class="fc">' +
          '<div class="fc-text"><h3>' + f.title + '</h3><p>' + f.desc + '</p></div>' +
          featureStage(f, i) +
        '</article>';
      }).join('') + '</div></section>';
  }

  if (D.breakdown) {
    var bd = D.breakdown;
    html += '<section class="breakdown"><h2>' + bd.title + '</h2>' + (bd.lead ? '<p>' + bd.lead + '</p>' : '') +
      '<div class="cols">' + bd.columns.map(function (col) {
        return '<article class="col"><h3>' + col.title + '</h3>' + col.html + '</article>';
      }).join('') + '</div>' +
      (bd.note ? '<div class="honest">' + bd.note + '</div>' : '') +
      '</section>';
  }
  document.getElementById('app').innerHTML = html;

  // 接力卡片：依序顯示「A 傳給 B」「B 傳給 C」…
  Array.prototype.forEach.call(document.querySelectorAll('[data-relay]'), function (el) {
    var f = D.features.cards[+el.getAttribute('data-relay')];
    var step = 0;
    function draw() {
      var from = f.agents[step % (f.agents.length - 1)];
      var to = f.agents[step % (f.agents.length - 1) + 1];
      el.innerHTML = avatar(from) +
        '<span class="fc-pill"><span class="fc-dots"><i></i><i></i><i></i></span>' + esc(ui.sendingTo) + esc(D.agents[to].name) + '…</span>' +
        avatar(to);
      step++;
    }
    draw();
    if (!reduce) setInterval(draw, 2600);
  });

  // ---------- 對話 ----------
  var listEl = document.getElementById('list');
  var scrollEl = document.getElementById('scroll');
  var titleEl = document.getElementById('chatTitle');
  var phEl = document.getElementById('composerPh');
  var current = null;
  var runId = 0;
  var seen = {};
  seen[D.app.defaultConvo] = true;

  function renderList() {
    listEl.innerHTML = D.convos.map(function (c) {
      var active = current && current.id === c.id;
      return '<li><button class="item" type="button" data-id="' + esc(c.id) + '" aria-current="' + active + '">' +
        convoAvatar(c) +
        '<span class="item-text"><span class="item-name">' + esc(nameOf(c)) + '</span><span class="item-preview">' + esc(lastLine(c)) + '</span></span>' +
        '<span class="item-meta"><span>' + esc(c.time) + '</span>' + (seen[c.id] ? '' : '<i class="dot" aria-label="' + esc(ui.unread) + '"></i>') + '</span>' +
        '</button></li>';
    }).join('');
  }

  function senderHead(s) {
    return s.from ? '<div class="sender">' + avatar(s.from, 'sm') + esc(D.agents[s.from].name) + '</div>' : '';
  }

  function stepEl(s) {
    var el = document.createElement('div');
    if (s.t) { el.className = 'stamp'; el.textContent = s.t; return el; }
    if (s.e) {
      el.className = 'event';
      el.innerHTML = ICON[s.e] + '<span>' + esc(s.label) + (s.strong ? ' · <strong>' + esc(s.strong) + '</strong>' : '') + '</span>';
      return el;
    }
    if (s.u) {
      el.className = 'row u';
      el.innerHTML = '<div class="bubble">' + esc(s.u) + '</div>';
      return el;
    }
    el.className = 'row b';
    if (s.c) {
      el.innerHTML = senderHead(s) + '<div class="bubble checks">' + s.c.map(function (r) {
        return '<div class="check ' + r[0] + '">' + ICON[r[0]] + '<span class="k">' + esc(r[1]) + '</span><span class="v">→ ' + esc(r[2]) + '</span></div>';
      }).join('') + '</div>';
      return el;
    }
    el.innerHTML = senderHead(s) + '<div class="bubble">' + s.b + '</div>';
    return el;
  }

  function header(c) {
    titleEl.innerHTML = convoAvatar(c) + '<div style="min-width:0"><strong>' + esc(nameOf(c)) + '</strong> <span>' + esc(c.sub || '') + '</span></div>';
    phEl.textContent = ui.composer + nameOf(c);
  }

  function toBottom() { scrollEl.scrollTop = scrollEl.scrollHeight; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function showStatic(c) {
    runId++;
    scrollEl.classList.add('static');
    scrollEl.innerHTML = '';
    c.script.forEach(function (s) { scrollEl.appendChild(stepEl(s)); });
    toBottom();
  }

  async function play(c) {
    if (reduce) { showStatic(c); return; }
    var my = ++runId;
    scrollEl.classList.remove('static');
    scrollEl.innerHTML = '';
    for (var i = 0; i < c.script.length; i++) {
      var s = c.script[i];
      if (s.b || s.c) {
        var typing = document.createElement('div');
        typing.className = 'row b';
        typing.innerHTML = senderHead(s) + '<div class="typing" aria-label="' + esc(ui.typing) + '"><i></i><i></i><i></i></div>';
        scrollEl.appendChild(typing); toBottom();
        await wait(s.c ? 1300 : 700 + Math.min(900, (s.b || '').length * 12));
        if (my !== runId) return;
        typing.remove();
      } else {
        await wait(s.t ? 450 : s.e ? 600 : 750);
        if (my !== runId) return;
      }
      scrollEl.appendChild(stepEl(s)); toBottom();
    }
  }

  function select(id, animate) {
    current = D.convos.filter(function (c) { return c.id === id; })[0];
    seen[id] = true;
    renderList();
    header(current);
    if (animate) play(current); else showStatic(current);
  }

  listEl.addEventListener('click', function (ev) {
    var btn = ev.target.closest('.item');
    if (btn) select(btn.getAttribute('data-id'), true);
  });
  document.getElementById('replay').addEventListener('click', function () { play(current); });

  select(D.app.defaultConvo, false);
})();
