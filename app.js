/* ==========================================================================
   硅基导航（nav.html）交互逻辑 · v2
   --------------------------------------------------------------------------
   布局：搜索框 / 左栏（分类 + 热门标签）/ 右栏（子分类 chips + 卡片网格）
   状态：{ cat, type, tag, q } 四维过滤，全部即时生效。
   快捷键："/" 聚焦搜索，Esc 清空。
   数据：data.js 提供 cards / catMeta / catOrder。
   语言与明暗主题统一由 brand.js 处理（存储键 specul-lang / specul-theme）。
   ========================================================================== */
(function () {
  var searchInput = document.getElementById('searchInput');
  var content = document.getElementById('content');
  var navCategories = document.getElementById('navCategories');
  var subNav = document.getElementById('subNav');
  var sideTags = document.getElementById('sideTags');
  var dirStat = document.getElementById('dirStat');
  var contentTitle = document.getElementById('contentTitle');
  var contentSub = document.getElementById('contentSub');
  var toTop = document.getElementById('toTop');

  if (!content || !navCategories) return;

  var state = { cat: 'all', type: null, tag: null, q: '' };
  var searchTimer = null;

  /* ---------- 统计 ---------- */
  var catCounts = {};
  var tagCounts = {};
  cards.forEach(function (c) {
    catCounts[c.c] = (catCounts[c.c] || 0) + 1;
    String(c.tag).split('·').forEach(function (t) {
      var v = t.trim();
      if (v) tagCounts[v] = (tagCounts[v] || 0) + 1;
    });
  });
  var topTags = Object.keys(tagCounts)
    .sort(function (a, b) { return tagCounts[b] - tagCounts[a]; })
    .slice(0, 14);

  if (dirStat) {
    dirStat.textContent =
      cards.length + ' 个资源 · ' + catOrder.length + ' 个分类 · ' +
      Object.keys(tagCounts).length + ' 个标签 · 持续精选维护';
  }

  /* ---------- 分类轨 + 标签轨 ---------- */
  function catItem(key, ic, name, count) {
    return '<a class="rail-cat' + (state.cat === key ? ' active' : '') +
      '" data-cat="' + key + '" href="' + (key === 'all' ? '#' : '#cat-' + key) + '">' +
      '<span class="rail-cat-ic">' + ic + '</span>' +
      name +
      '<span class="rail-cat-count">' + count + '</span></a>';
  }

  function renderRails() {
    var h = '<span class="rail-label">分类</span>' +
      catItem('all', '🗂️', '全部', cards.length);
    catOrder.forEach(function (key) {
      var m = catMeta[key] || { emoji: '📦', name: key };
      h += catItem(key, m.emoji, m.name, catCounts[key] || 0);
    });
    navCategories.innerHTML = h;

    if (sideTags) {
      sideTags.innerHTML = '<span class="rail-label">标签</span>' + topTags.map(function (t) {
        return '<a class="rail-tag' + (state.tag === t ? ' active' : '') +
          '" data-tag="' + t + '" href="#">' + t +
          '<span class="rail-tag-count">' + tagCounts[t] + '</span></a>';
      }).join('');
    }
  }

  /* ---------- 过滤 ---------- */
  function cardMatches(c) {
    if (state.cat !== 'all' && c.c !== state.cat) return false;
    if (state.type && c.t !== state.type) return false;
    if (state.tag &&
        String(c.tag).split('·').map(function (s) { return s.trim(); })
          .indexOf(state.tag) === -1) return false;
    if (state.q) {
      var hay = (c.n + ' ' + c.d + ' ' + c.tag + ' ' + c.t + ' ' +
        ((catMeta[c.c] || {}).name || '')).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  /* ---------- 右栏 ---------- */
  function renderTypeChips() {
    if (!subNav) return;
    if (state.cat === 'all') { subNav.innerHTML = ''; return; }
    var types = [];
    var seen = {};
    var counts = {};
    cards.forEach(function (c) {
      if (c.c !== state.cat) return;
      counts[c.t] = (counts[c.t] || 0) + 1;
      if (!seen[c.t]) { seen[c.t] = true; types.push(c.t); }
    });
    subNav.innerHTML = types.map(function (t) {
      return '<button class="sub-chip' + (state.type === t ? ' active' : '') +
        '" type="button" data-type="' + t + '">' + t +
        '<span class="sub-chip-count">' + counts[t] + '</span></button>';
    }).join('');
  }

  function renderCard(c) {
    return '<a class="dcard" href="' + c.u + '" target="_blank" rel="noopener noreferrer">' +
      '<div class="dcard-top"><span class="dcard-ic">' + (c.ic || '🔗') + '</span>' +
      '<span class="dcard-name">' + c.n + '<i class="dcard-ext">↗</i></span></div>' +
      '<p class="dcard-desc">' + c.d + '</p>' +
      '<div class="dcard-foot"><span class="dcard-type">' + c.t + '</span>' +
      '<span class="dcard-tags">' + c.tag + '</span></div></a>';
  }

  function render() {
    var list = cards.filter(cardMatches);
    renderTypeChips();

    var m = catMeta[state.cat];
    var hasFilters = !!(state.type || state.tag || state.q);
    if (contentTitle) {
      contentTitle.textContent = state.cat === 'all' ? '全部资源' : (m ? m.name : state.cat);
    }
    if (contentSub) {
      contentSub.innerHTML =
        '<span>' + list.length + ' 个资源</span>' +
        (hasFilters
          ? '<button class="dir-clear" id="clearFilters" type="button">清除筛选 ×</button>'
          : '');
    }

    if (!list.length) {
      content.innerHTML =
        '<div class="dir-empty"><div class="dir-empty-ic">🔍</div>' +
        '<p>没有找到匹配的资源，换个关键词或清除筛选试试</p>' +
        '<button class="dir-clear" id="clearFilters" type="button">清除全部筛选</button></div>';
      return;
    }

    if (state.cat === 'all' && !hasFilters) {
      // 全部视图：按分类分组，便于扫读
      content.innerHTML = catOrder.map(function (key) {
        var cm = catMeta[key] || { emoji: '📦', name: key };
        var cc = list.filter(function (c) { return c.c === key; });
        if (!cc.length) return '';
        return '<section class="cat-section">' +
          '<div class="cat-head"><span class="cat-head-ic">' + cm.emoji + '</span>' +
          '<h3 class="cat-head-name">' + cm.name + '</h3>' +
          '<span class="cat-head-count">' + cc.length + ' 个</span></div>' +
          '<div class="card-grid">' + cc.map(renderCard).join('') + '</div></section>';
      }).join('');
    } else {
      content.innerHTML =
        '<div class="card-grid">' + list.map(renderCard).join('') + '</div>';
    }
  }

  function clearFilters() {
    state.type = null; state.tag = null; state.q = '';
    if (searchInput) searchInput.value = '';
    renderRails();
    render();
  }

  /* ---------- 事件 ---------- */
  navCategories.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('.rail-cat') : null;
    if (!el) return;
    e.preventDefault();
    // 切换分类 = 全新上下文：清掉子分类与标签过滤（保留搜索词）
    state.cat = el.getAttribute('data-cat');
    state.type = null;
    state.tag = null;
    renderRails();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (sideTags) {
    sideTags.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('.rail-tag') : null;
      if (!el) return;
      e.preventDefault();
      var t = el.getAttribute('data-tag');
      state.tag = state.tag === t ? null : t;
      renderRails();
      render();
    });
  }

  if (subNav) {
    subNav.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('.sub-chip') : null;
      if (!el) return;
      var t = el.getAttribute('data-type');
      state.type = state.type === t ? null : t;
      render();
    });
  }

  // 「清除筛选」按钮渲染在动态区域，统一委托到 document
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'clearFilters') clearFilters();
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.q = searchInput.value.trim().toLowerCase();
        render();
      }, 160);
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        state.q = '';
        searchInput.blur();
        render();
      }
    });
    // "/" 聚焦搜索（焦点不在输入控件时）
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      var ae = document.activeElement;
      if (ae && ae.tagName && /^(input|textarea|select)$/i.test(ae.tagName)) return;
      e.preventDefault();
      searchInput.focus();
    });
  }

  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('visible', window.scrollY > 300);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 初始化（支持 #cat-xxx 深链） ---------- */
  var hashCat = (location.hash || '').replace(/^#cat-/, '');
  if (hashCat && catMeta[hashCat]) state.cat = hashCat;
  renderRails();
  render();
})();
