(function () {
  'use strict';

  if (typeof ANALYSIS === 'undefined') { document.getElementById('app').textContent = 'No analysis data found.'; return; }
  window.__THINK__ = ANALYSIS;

  var data = ANALYSIS;
  var app = document.getElementById('app');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SKINS = [
    { id: 'aurora', label: 'Aurora', sw: 'linear-gradient(135deg,#7c3aed,#ec4899)' },
    { id: 'storybook', label: 'Storybook', sw: 'linear-gradient(135deg,#ff8a5b,#ff5e7e)' },
    { id: 'blueprint', label: 'Blueprint', sw: 'linear-gradient(135deg,#4cc9f0,#4361ee)' },
    { id: 'terminal', label: 'Terminal', sw: 'linear-gradient(135deg,#39ff14,#00e5b0)' }
  ];
  function skinLabel(id) { for (var i = 0; i < SKINS.length; i++) if (SKINS[i].id === id) return SKINS[i].label; return id; }
  function validSkin(id) { return SKINS.some(function (s) { return s.id === id; }); }

  var state = {
    audience: (data.meta && data.meta.audience) || 'beginner',
    skin: (data.meta && validSkin(data.meta.skin)) ? data.meta.skin : 'aurora'
  };
  var quizState = {};

  var kindColors = { file: '#a78bfa', function: '#60a5fa', module: '#22d3ee', step: '#34d399', section: '#fbbf24', class: '#f472b6' };
  function kc(k) { return kindColors[k] || '#7c3aed'; }

  function esc(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Skin ──
  function applySkin(id) {
    state.skin = id;
    document.documentElement.setAttribute('data-skin', id);
    var n = document.getElementById('skinname'); if (n) n.textContent = skinLabel(id);
    app.querySelectorAll('.skin-opt[data-skin]').forEach(function (o) { o.classList.toggle('active', o.getAttribute('data-skin') === id); });
    var m = document.getElementById('skinmenu'); if (m) m.classList.add('hidden');
  }

  // ── Shared bits ──
  function codeWindow(code, lang) {
    if (!code) return '';
    return '<div class="code-window"><div class="code-bar"><span class="tl r"></span><span class="tl y"></span><span class="tl g"></span><span class="lang">' + esc(lang || 'code') + '</span></div><div class="code-body">' + esc(code) + '</div></div>';
  }
  function techToggle(id, technical) {
    if (!technical || state.audience !== 'beginner') return '';
    return '<button class="tech-toggle" data-tech="' + id + '">⚙ Show the technical detail</button><div class="tech-content hidden" id="tech-' + id + '">' + esc(technical) + '</div>';
  }
  function pickText(plain, technical) { return (state.audience === 'dev' && technical) ? technical : plain; }

  // ── Diagram ──
  function buildDiagram(nodes, edges, rootId) {
    if (!nodes || !nodes.length) return '';
    var nodeMap = {}; nodes.forEach(function (n) { nodeMap[n.id] = n; });
    var childrenOf = {}, hasParent = {};
    (edges || []).forEach(function (e) { (childrenOf[e.from] = childrenOf[e.from] || []).push(e.to); hasParent[e.to] = true; });
    var roots = [];
    if (rootId && nodeMap[rootId]) roots.push(rootId);
    nodes.forEach(function (n) { if (!hasParent[n.id] && roots.indexOf(n.id) === -1) roots.push(n.id); });
    var pos = [], visited = {}, rowMax = {};
    function visit(id, depth) { if (visited[id]) return; visited[id] = true; var x = rowMax[depth] === undefined ? 0 : rowMax[depth] + 1; rowMax[depth] = x; pos.push({ id: id, x: x, y: depth }); (childrenOf[id] || []).forEach(function (k) { visit(k, depth + 1); }); }
    roots.forEach(function (r) { visit(r, 0); });
    nodes.forEach(function (n) { if (!visited[n.id]) visit(n.id, 0); });

    var bw = 168, bh = 50, px = 46, py = 44, off = 30, W = 0, H = 0, posMap = {};
    pos.forEach(function (p) { posMap[p.id] = p; W = Math.max(W, p.x * (bw + px) + bw + off * 2); H = Math.max(H, p.y * (bh + py) + bh + off * 2); });
    var s = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><defs>'];
    Object.keys(kindColors).forEach(function (k) { var c = kindColors[k]; s.push('<linearGradient id="g-' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c + '" stop-opacity="0.28"/><stop offset="1" stop-color="' + c + '" stop-opacity="0.10"/></linearGradient>'); });
    s.push('<marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0,0 L9,3.5 L0,7 Z" fill="#8585a3"/></marker></defs>');
    (edges || []).forEach(function (e) {
      var a = posMap[e.from], b = posMap[e.to]; if (!a || !b) return;
      var x1, y1, x2, y2;
      if (a.y === b.y) { x1 = a.x * (bw + px) + off + bw; y1 = a.y * (bh + py) + off + bh / 2; x2 = b.x * (bw + px) + off; y2 = y1; }
      else { x1 = a.x * (bw + px) + off + bw / 2; y1 = a.y * (bh + py) + off + bh; x2 = b.x * (bw + px) + off + bw / 2; y2 = b.y * (bh + py) + off; }
      var my = (y1 + y2) / 2;
      s.push('<path d="M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' + x2 + ',' + my + ' ' + x2 + ',' + y2 + '" fill="none" stroke="#8585a3" stroke-width="1.6" opacity="0.45" marker-end="url(#arr)"/>');
      if (e.label) s.push('<text x="' + ((x1 + x2) / 2) + '" y="' + (my - 5) + '" text-anchor="middle" fill="#8585a3" font-size="10.5">' + esc(e.label) + '</text>');
    });
    pos.forEach(function (p) {
      var n = nodeMap[p.id]; if (!n) return;
      // kind goes into an SVG attribute (url(#g-kind)); only allow known keys so a crafted
      // analysis.json can't break out of the attribute and inject markup.
      var x = p.x * (bw + px) + off, y = p.y * (bh + py) + off, c = kc(n.kind), kind = kindColors[n.kind] ? n.kind : 'function';
      var label = n.label.length > 19 ? n.label.slice(0, 17) + '…' : n.label;
      s.push('<g class="dnode"><rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="13" fill="url(#g-' + kind + ')" stroke="' + c + '" stroke-width="1.8"/><circle cx="' + (x + 16) + '" cy="' + (y + bh / 2) + '" r="4" fill="' + c + '"/><text x="' + (x + 30) + '" y="' + (y + bh / 2 + 4) + '" fill="currentColor" font-size="12.5" font-weight="600">' + esc(label) + '</text></g>');
    });
    s.push('</svg>');
    return s.join('');
  }

  function quizList(questions, prefix) {
    var h = '';
    questions.forEach(function (q, i) {
      var qid = prefix + '-' + i;
      h += '<div class="quiz-q-block" data-qid="' + qid + '"><div class="quiz-qnum">QUESTION ' + (i + 1) + ' OF ' + questions.length + '</div><div class="quiz-q">' + esc(q.q) + '</div><ul class="quiz-choices">';
      q.choices.forEach(function (c, ci) { h += '<li class="quiz-choice" data-qid="' + qid + '" data-ci="' + ci + '"><span class="pick"></span><span>' + esc(c) + '</span></li>'; });
      h += '</ul><div class="quiz-explain hidden" data-explain="' + qid + '">' + esc(q.explain) + '</div></div>';
    });
    return h;
  }
  var quizMeta = {}; // qid -> {answer, total, group}

  // ════════════ BLOCK RENDERERS ════════════
  var R = {};

  R.hook = function (b) {
    var h = '<section class="hook" id="block-top">';
    h += '<div class="hook-badge"><span>✨</span> ' + esc(b.kicker || 'Interactive Lesson') + '</div>';
    h += '<div class="hero-mascot"></div>';
    h += '<h1>' + esc(b.headline || data.meta.title) + '</h1>';
    if (b.body) h += '<p class="hook-body">' + esc(b.body) + '</p>';
    h += '<button class="hook-cta" data-scroll="next">Let\'s go <span>↓</span></button>';
    h += '<div class="scroll-hint">↓</div></section>';
    return h;
  };

  R.analogy = function (b) {
    var h = '<div class="wrap block reveal"><div class="eyebrow">Think of it like…</div>';
    if (b.title) h += '<div class="b-title">' + esc(b.title) + '</div>';
    h += '<div class="analogy-card glass">';
    if (b.realWorld) h += '<div class="analogy-real"><span class="lead-emoji">' + esc(b.emoji || '💡') + '</span>' + esc(b.realWorld) + '</div>';
    if (b.mapping && b.mapping.length) {
      h += '<div class="analogy-map">';
      b.mapping.forEach(function (m) {
        h += '<div class="map-row"><div class="map-cell map-from"><b>Real world</b>' + esc(m.from) + '</div><div class="map-arrow">→</div><div class="map-cell map-to"><b>In the code</b>' + esc(m.to) + '</div>';
        if (m.note) h += '<div class="map-note">' + esc(m.note) + '</div>';
        h += '</div>';
      });
      h += '</div>';
    }
    h += '</div></div>';
    return h;
  };

  R.concept = function (b, i) {
    var h = '<div class="wrap block reveal">';
    if (b.title) h += '<div class="b-title">' + (b.emoji ? esc(b.emoji) + ' ' : '') + esc(b.title) + '</div>';
    h += '<div class="concept-card glass">';
    if (b.body) h += '<div class="concept-body">' + esc(pickText(b.body, b.technical)) + '</div>';
    if (b.code) h += codeWindow(b.code, b.lang);
    h += techToggle('c' + i, b.technical);
    h += '</div></div>';
    return h;
  };

  R.code = function (b, i) {
    var h = '<div class="wrap block reveal">';
    if (b.title) h += '<div class="b-title">' + esc(b.title) + '</div>';
    h += '<div class="concept-card glass">';
    if (b.explain) h += '<div class="code-explain">' + esc(b.explain) + '</div>';
    h += codeWindow(b.code, b.lang);
    h += '</div></div>';
    return h;
  };

  R.steps = function (b) {
    var h = '<div class="wrap block reveal">';
    if (b.title) h += '<div class="b-title">' + esc(b.title) + '</div>';
    (b.steps || []).forEach(function (st, i) {
      h += '<div class="step reveal"><div class="step-num">' + (i + 1) + '</div><div><div class="step-title">' + esc(st.title) + '</div><div class="narration"><div class="who"><span class="av"></span> Your guide</div>' + esc(st.body) + '</div>';
      if (st.code) h += codeWindow(st.code, st.lang);
      h += '</div></div>';
    });
    h += '</div>';
    return h;
  };

  R.flow = function (b) {
    var h = '<div class="wrap block reveal"><div class="eyebrow">How it connects</div>';
    if (b.title) h += '<div class="b-title">' + esc(b.title) + '</div>';
    h += '<div class="glass diagram-wrap">' + buildDiagram(b.nodes, b.edges, b.rootId) + '</div></div>';
    return h;
  };

  R.architecture = function (b) {
    var groups = b.groups || [], edges = b.edges || [];
    var nodeW = 188, nodeH = 60, colGap = 22, laneLabelH = 28, rowGap = 58, leftPad = 18, topPad = 14;
    var palette = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#22d3ee'];
    var pos = {}, nodeSvgs = [], laneSvgs = [], y = topPad, maxW = 0;

    groups.forEach(function (g, gi) {
      var color = palette[gi % palette.length];
      var laneY = y;
      var items = g.items || [];
      var rowW = leftPad + items.length * (nodeW + colGap);
      laneSvgs.push('<rect x="' + (leftPad - 6) + '" y="' + (laneY - 4) + '" width="' + (Math.max(rowW, 160) - leftPad + 12) + '" height="' + (laneLabelH + nodeH + 10) + '" rx="14" fill="' + color + '" fill-opacity="0.04" stroke="' + color + '" stroke-opacity="0.18" stroke-width="1"/>');
      laneSvgs.push('<text x="' + leftPad + '" y="' + (laneY + 16) + '" fill="' + color + '" font-size="11" font-weight="700" letter-spacing="1">' + esc(g.label.toUpperCase()) + '</text>');
      var nodeY = laneY + laneLabelH;
      items.forEach(function (it, i) {
        var x = leftPad + i * (nodeW + colGap);
        pos[it.id] = { x: x, y: nodeY, w: nodeW, h: nodeH };
        var parts = it.file.split('/');
        var name = parts.length > 1 ? parts.slice(-2).join('/') : parts[0];
        if (name.length > 26) name = '…' + name.slice(-25);
        var role = it.role ? (it.role.length > 28 ? it.role.slice(0, 26) + '…' : it.role) : '';
        nodeSvgs.push('<g class="dnode"><rect x="' + x + '" y="' + nodeY + '" width="' + nodeW + '" height="' + nodeH + '" rx="11" fill="' + color + '" fill-opacity="0.12" stroke="' + color + '" stroke-width="1.6"/><rect x="' + x + '" y="' + nodeY + '" width="4" height="' + nodeH + '" rx="2" fill="' + color + '"/><text x="' + (x + 16) + '" y="' + (nodeY + 25) + '" fill="currentColor" font-size="13" font-weight="700">' + esc(name) + '</text>' + (role ? '<text x="' + (x + 16) + '" y="' + (nodeY + 43) + '" fill="#8585a3" font-size="10.5">' + esc(role) + '</text>' : '') + '</g>');
        maxW = Math.max(maxW, x + nodeW);
      });
      y = nodeY + nodeH + rowGap;
    });

    var W = maxW + leftPad, H = y;
    var edgeSvgs = [];
    edges.forEach(function (e) {
      var a = pos[e.from], t = pos[e.to]; if (!a || !t) return;
      var sx = a.x + a.w / 2, sy, tx = t.x + t.w / 2, ty;
      if (t.y >= a.y) { sy = a.y + a.h; ty = t.y; } else { sy = a.y; ty = t.y + t.h; }
      var my = (sy + ty) / 2;
      edgeSvgs.push('<path d="M' + sx + ',' + sy + ' C' + sx + ',' + my + ' ' + tx + ',' + my + ' ' + tx + ',' + ty + '" fill="none" stroke="#8585a3" stroke-width="1.5" opacity="0.45" marker-end="url(#aarr)"/>');
      if (e.label) edgeSvgs.push('<text x="' + ((sx + tx) / 2) + '" y="' + (my - 3) + '" text-anchor="middle" fill="#8585a3" font-size="10">' + esc(e.label) + '</text>');
    });

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><defs><marker id="aarr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M0,0 L9,3.5 L0,7 Z" fill="#8585a3"/></marker></defs>' + laneSvgs.join('') + edgeSvgs.join('') + nodeSvgs.join('') + '</svg>';
    var h = '<div class="wrap block reveal"><div class="eyebrow">Architecture</div>';
    if (b.title) h += '<div class="b-title">' + esc(b.title) + '</div>';
    h += '<div class="glass diagram-wrap">' + svg + '</div></div>';
    return h;
  };

  R.compare = function (b) {
    var h = '<div class="wrap block reveal">';
    if (b.title) h += '<div class="b-title">' + esc(b.title) + '</div>';
    h += '<div class="compare-grid">';
    function col(side, cls, defIcon) {
      if (!side) return '';
      var s = '<div class="compare-col glass ' + cls + '"><div class="compare-label">' + (cls === 'bad' ? '✕' : '✓') + ' ' + esc(side.label || '') + '</div>';
      if (side.body) s += '<div class="compare-body">' + esc(side.body) + '</div>';
      if (side.code) s += codeWindow(side.code, side.lang);
      return s + '</div>';
    }
    h += col(b.left, 'bad') + col(b.right, 'good');
    h += '</div></div>';
    return h;
  };

  R.aha = function (b) {
    var h = '<div class="wrap block reveal"><div class="aha"><div class="aha-icon">💡</div><div class="aha-label">' + esc(b.title || 'The key insight') + '</div><div class="aha-text">' + esc(b.insight) + '</div></div></div>';
    return h;
  };

  R.quiz = function (b, i) {
    var prefix = 'q' + i;
    (b.questions || []).forEach(function (q, qi) { quizMeta[prefix + '-' + qi] = { answer: q.answer, group: prefix }; });
    var h = '<div class="wrap block reveal" style="text-align:center"><div class="eyebrow">Final Challenge</div><div class="b-title">🏆 ' + esc(b.title || 'Test your understanding') + '</div></div>';
    h += '<div class="wrap block reveal" style="padding-top:0"><div class="quiz-card glass">' + quizList(b.questions || [], prefix) + '<div class="quiz-result hidden" data-result="' + prefix + '"></div></div></div>';
    return h;
  };

  R.recap = function (b) {
    var h = '<div class="wrap block reveal">';
    if (b.title) h += '<div class="b-title">' + esc(b.title) + '</div>';
    else h += '<div class="b-title">Recap</div>';
    h += '<div class="recap-card glass"><ul class="recap-list">';
    (b.points || []).forEach(function (p) { h += '<li>' + esc(p) + '</li>'; });
    h += '</ul></div></div>';
    return h;
  };

  R.glossary = function (b) {
    var h = '<div class="wrap block reveal"><div class="eyebrow">Your Vocabulary</div><div class="b-title">' + esc(b.title || 'Words worth knowing') + '</div><div class="glossary-grid">';
    (b.terms || []).forEach(function (g) {
      var def = state.audience === 'dev' && g.technical ? g.technical : g.plain;
      h += '<div class="flip"><div class="flip-inner"><div class="flip-face flip-front"><div class="term">' + esc(g.term) + '</div><div class="hint">tap to reveal →</div></div><div class="flip-face flip-back">' + esc(def) + '</div></div></div>';
    });
    h += '</div></div>';
    return h;
  };

  // ════════════ CHROME ════════════
  function chrome() {
    var h = '<div class="bg-layer"><div class="bg-blob b1"></div><div class="bg-blob b2"></div><div class="bg-blob b3"></div></div><div class="bg-grid"></div>';
    h += '<div class="scroll-progress" id="scrollbar"></div>';
    h += '<div class="controls"><button class="ctrl-btn" data-act="audience"><span class="dot"></span>' + (state.audience === 'beginner' ? 'Beginner' : 'Technical') + '</button>';
    h += '<div class="skin-picker"><button class="ctrl-btn" data-act="skin-toggle">🎨 <span id="skinname">' + skinLabel(state.skin) + '</span></button><div class="skin-menu hidden" id="skinmenu">';
    SKINS.forEach(function (s) { h += '<button class="skin-opt' + (state.skin === s.id ? ' active' : '') + '" data-skin="' + s.id + '"><span class="sw" style="background:' + s.sw + '"></span>' + s.label + '</button>'; });
    h += '<div class="skin-divider"></div><button class="skin-opt" data-act="skin-random">🎲 Surprise me</button></div></div></div>';
    return h;
  }
  function footer() {
    return '<div class="footer"><div class="ft-logo">Think-In-HTML</div>Turn any code into a lesson · <a href="https://github.com/vibhusharma101/Think-In-HTML" target="_blank" rel="noopener">View on GitHub</a></div>';
  }

  // ════════════ RENDER ════════════
  function render() {
    var scrollY = window.scrollY;
    quizMeta = {};
    quizState = {}; // a full re-render rebuilds the quiz DOM; reset answers so it stays in sync
    var h = chrome() + '<div class="lesson">';
    (data.blocks || []).forEach(function (b, i) {
      var fn = R[b.type];
      if (fn) h += fn(b, i);
    });
    h += '</div>' + footer();
    if (window.__thinkScroll) { window.removeEventListener('scroll', window.__thinkScroll); window.__thinkScroll = null; }
    app.innerHTML = h;
    bindEvents();
    initObservers();
    window.scrollTo(0, scrollY);
  }

  // ════════════ EVENTS ════════════
  function bindEvents() {
    app.querySelectorAll('[data-act]').forEach(function (el) {
      el.addEventListener('click', function (ev) {
        var a = el.getAttribute('data-act');
        if (a === 'audience') { state.audience = state.audience === 'beginner' ? 'dev' : 'beginner'; render(); }
        else if (a === 'skin-toggle') { ev.stopPropagation(); var m = document.getElementById('skinmenu'); if (m) m.classList.toggle('hidden'); }
        else if (a === 'skin-random') { var o = SKINS.filter(function (s) { return s.id !== state.skin; }); applySkin(o[Math.floor(Math.random() * o.length)].id); }
      });
    });
    app.querySelectorAll('.skin-opt[data-skin]').forEach(function (el) { el.addEventListener('click', function () { applySkin(el.getAttribute('data-skin')); }); });

    app.querySelectorAll('[data-scroll="next"]').forEach(function (el) {
      el.addEventListener('click', function () {
        var hook = document.getElementById('block-top');
        var next = hook ? hook.nextElementSibling : null;
        if (next) next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });

    app.querySelectorAll('[data-tech]').forEach(function (el) {
      el.addEventListener('click', function () { var c = document.getElementById('tech-' + el.getAttribute('data-tech')); if (c) { c.classList.toggle('hidden'); el.textContent = c.classList.contains('hidden') ? '⚙ Show the technical detail' : '⚙ Hide the technical detail'; } });
    });

    app.querySelectorAll('.flip').forEach(function (el) { el.addEventListener('click', function () { el.classList.toggle('flipped'); }); });

    app.querySelectorAll('.quiz-choice').forEach(function (el) {
      el.addEventListener('click', function () {
        var qid = el.getAttribute('data-qid'), ci = parseInt(el.getAttribute('data-ci'), 10);
        if (quizState[qid] !== undefined) return;
        quizState[qid] = ci;
        var meta = quizMeta[qid]; if (!meta) return;
        var block = app.querySelector('.quiz-q-block[data-qid="' + qid + '"]');
        block.querySelectorAll('.quiz-choice').forEach(function (ch) {
          var cci = parseInt(ch.getAttribute('data-ci'), 10);
          ch.classList.add('disabled');
          if (cci === meta.answer) { ch.classList.add('correct'); ch.querySelector('.pick').textContent = '✓'; }
          else if (cci === ci) { ch.classList.add('wrong'); ch.querySelector('.pick').textContent = '✕'; }
        });
        var ex = app.querySelector('[data-explain="' + qid + '"]'); if (ex) ex.classList.remove('hidden');
        maybeFinishQuiz(meta.group);
      });
    });

    if (!window.__thinkDocBound) {
      window.__thinkDocBound = true;
      document.addEventListener('click', function (ev) { var m = document.getElementById('skinmenu'); if (m && !m.classList.contains('hidden') && !(ev.target.closest && ev.target.closest('.skin-picker'))) m.classList.add('hidden'); });
    }
  }

  function maybeFinishQuiz(group) {
    var ids = Object.keys(quizMeta).filter(function (id) { return quizMeta[id].group === group; });
    var answered = ids.filter(function (id) { return quizState[id] !== undefined; });
    if (answered.length < ids.length) return;
    var correct = 0; ids.forEach(function (id) { if (quizState[id] === quizMeta[id].answer) correct++; });
    var total = ids.length, pct = correct / total;
    var msg = pct === 1 ? 'Perfect! You nailed it 🎉' : pct >= 0.7 ? 'Great work! 🌟' : pct >= 0.5 ? 'Nice try — review and go again 💪' : 'Keep going — learning takes reps 📚';
    var res = app.querySelector('[data-result="' + group + '"]');
    if (res) { res.innerHTML = '<div class="quiz-score-num">' + correct + '/' + total + '</div><div class="quiz-badge">' + esc(msg) + '</div>'; res.classList.remove('hidden'); }
    if (pct >= 0.7 && !reduceMotion) confetti();
  }

  function confetti() {
    var colors = ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#fbbf24', '#22d3ee'], pieces = [];
    for (var i = 0; i < 90; i++) {
      var el = document.createElement('div'); el.className = 'confetti';
      el.style.background = colors[i % colors.length]; el.style.left = Math.random() * 100 + 'vw';
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(el);
      pieces.push({ el: el, x: 0, y: 0, vy: 2 + Math.random() * 4, vx: (Math.random() - 0.5) * 3, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 14 });
    }
    var start = Date.now();
    function tick() {
      var done = Date.now() - start > 4000;
      pieces.forEach(function (p) { p.y += p.vy; p.x += p.vx; p.rot += p.vr; p.el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px) rotate(' + p.rot + 'deg)'; });
      if (done) { pieces.forEach(function (p) { p.el.remove(); }); return; }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initObservers() {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    app.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    var bar = document.getElementById('scrollbar');
    var ticking = false;
    function onScroll() {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + '%';
        ticking = false;
      });
    }
    window.__thinkScroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.documentElement.setAttribute('data-skin', state.skin);
  render();
})();
