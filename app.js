(function() {
  var body = document.body;
  var searchInput = document.getElementById('searchInput');
  var content = document.getElementById('content');
  var navCategories = document.getElementById('navCategories');
  var subNav = document.getElementById('subNav');
  var toTop = document.getElementById('toTop');
  var themeToggle = document.getElementById('themeToggle');
  var activeCat = 'all';
  var selectedTag = null;
  var searchTimer;

  function getAllTags() {
    var map = {};
    cards.forEach(function(c) {
      c.tag.split('·').forEach(function(t) {
        var v = t.trim();
        if (v) map[v] = (map[v] || 0) + 1;
      });
    });
    return Object.keys(map).sort(function(a, b) {
      return map[b] - map[a];
    }).map(function(t) { return { name: t, count: map[t] }; });
  }

  function initTheme() {
    var saved = localStorage.getItem('tuiyan-theme');
    if (saved === 'dark') {
      body.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      body.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }

  themeToggle.addEventListener('click', function() {
    if (body.getAttribute('data-theme') === 'dark') {
      body.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
      localStorage.setItem('tuiyan-theme', 'light');
    } else {
      body.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
      localStorage.setItem('tuiyan-theme', 'dark');
    }
  });

  function buildNav() {
    var h = '<a href="#" class="nav-cat active" data-cat="all">📋 全部</a>';
    catOrder.forEach(function(key) {
      var m = catMeta[key];
      h += '<a href="#cat-' + key + '" class="nav-cat" data-cat="' + key + '">' + m.emoji + ' ' + m.name + '</a>';
    });
    h += '<a href="#" class="nav-cat nav-tags" data-cat="tags">🏷️ 标签</a>';
    navCategories.innerHTML = h;
  }

  function setActiveNav(cat) {
    navCategories.querySelectorAll('.nav-cat').forEach(function(el) {
      el.classList.toggle('active', el.getAttribute('data-cat') === cat);
    });
  }

  function getFilteredCards() {
    var filtered = cards;
    if (activeCat && activeCat !== 'all' && activeCat !== 'tags') {
      filtered = filtered.filter(function(c) { return c.c === activeCat; });
    }
    var q = searchInput.value.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(function(c) {
        return c.n.toLowerCase().indexOf(q) !== -1 ||
               c.d.toLowerCase().indexOf(q) !== -1 ||
               c.tag.toLowerCase().indexOf(q) !== -1 ||
               c.t.toLowerCase().indexOf(q) !== -1 ||
               (catMeta[c.c] && catMeta[c.c].name.toLowerCase().indexOf(q) !== -1);
      });
    }
    return filtered;
  }

  function groupByType(list) {
    var order = [];
    var groups = {};
    list.forEach(function(c) {
      if (!groups[c.t]) { groups[c.t] = []; order.push(c.t); }
      groups[c.t].push(c);
    });
    return order.map(function(t) { return { type: t, cards: groups[t] }; });
  }

  function subId(catKey, typeName) {
    return 'su-' + catKey + '-' + typeName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
  }

  function renderCard(c) {
    return '<a href="' + c.u + '" target="_blank" rel="noopener noreferrer" class="card">' +
      '<div class="card-top"><span class="card-icon">' + c.ic + '</span>' +
      '<div class="card-info"><span class="card-name">' + c.n + '</span>' +
      '<span class="card-desc">' + c.d + '</span></div></div>' +
      '<div class="card-tags"><span class="card-tag">' + c.t + '</span><span class="card-tag">' + c.tag + '</span></div>' +
      '<span class="card-link-hint">🔗 ' + c.u.replace(/https?:\/\//, '') + '</span></a>';
  }

  function renderTagsView(filtered) {
    var tags = getAllTags();
    if (!selectedTag) {
      var h = '<div class="section"><div class="section-header">';
      h += '<span class="section-icon">🏷️</span><h2 class="section-title">标签分类</h2>';
      h += '<span class="section-count">共 ' + tags.length + ' 个标签 · ' + cards.length + ' 个资源</span>';
      h += '</div><p style="color:var(--text-muted);font-size:11px;margin-bottom:6px">点击下方标签查看对应资源</p>';
      h += '<div class="tag-selector">';
      tags.forEach(function(t) {
        h += '<span class="tag-btn" data-tag="' + t.name + '">' + t.name + '<span class="btn-count">' + t.count + '</span></span>';
      });
      return h + '</div></div>';
    }
    var tagCards = filtered.filter(function(c) {
      return c.tag.split('·').map(function(t) { return t.trim(); }).indexOf(selectedTag) !== -1;
    });
    var grouped = {};
    tagCards.forEach(function(c) {
      if (!grouped[c.c]) grouped[c.c] = [];
      grouped[c.c].push(c);
    });
    var h = '<div class="section"><div class="tag-result-header">';
    h += '<span class="tag-result-title">' + selectedTag + '<span class="result-count">（' + tagCards.length + ' 个资源）</span></span>';
    h += '<button class="back-to-tags" id="backToTags">← 返回标签列表</button></div>';
    if (!tagCards.length) return h + '<div class="no-results">🔍 没有找到匹配的资源</div></div>';
    catOrder.forEach(function(key) {
      var cc = grouped[key];
      if (!cc || !cc.length) return;
      var m = catMeta[key];
      h += '<div class="sub-section"><h3 class="sub-heading">' + m.emoji + ' ' + m.name + '<span class="sub-count">（' + cc.length + '）</span></h3>';
      h += '<div class="card-grid">' + cc.map(renderCard).join('') + '</div></div>';
    });
    return h + '</div>';
  }

  function renderCategoryView(filtered, singleCat) {
    var cats = singleCat ? [singleCat] : catOrder;
    var h = '';
    cats.forEach(function(key) {
      var catCards = filtered.filter(function(c) { return c.c === key; });
      if (!catCards.length) return;
      var m = catMeta[key];
      var groups = groupByType(catCards);
      h += '<section class="section"><div class="section-header">';
      h += '<span class="section-icon">' + m.emoji + '</span><h2 class="section-title" id="cat-' + key + '">' + m.name + '</h2>';
      h += '<span class="section-count">' + catCards.length + ' 个资源</span></div>';
      groups.forEach(function(g) {
        var id = subId(key, g.type);
        h += '<div class="sub-section"><h3 class="sub-heading" id="' + id + '">📌 ' + g.type + '<span class="sub-count">（' + g.cards.length + '）</span></h3>';
        h += '<div class="card-grid">' + g.cards.map(renderCard).join('') + '</div></div>';
      });
      h += '</section>';
    });
    return h || '<div class="section"><div class="no-results">🔍 没有找到匹配的资源</div></div>';
  }

  function renderAll() {
    var filtered = getFilteredCards();
    if (activeCat === 'tags') {
      subNav.style.display = 'none';
      content.innerHTML = renderTagsView(filtered);
    } else {
      var single = activeCat !== 'all' ? activeCat : null;
      if (single) {
        var scCards = filtered.filter(function(c) { return c.c === single; });
        var groups = groupByType(scCards);
        subNav.style.display = '';
        subNav.innerHTML = groups.map(function(g) {
          var id = subId(single, g.type);
          return '<a href="#' + id + '" class="sub-nav-link" data-to="' + id + '">' + g.type + '<span class="sn-count">' + g.cards.length + '</span></a>';
        }).join('');
      } else {
        subNav.style.display = 'none';
      }
      content.innerHTML = renderCategoryView(filtered, single);
    }
    content.querySelectorAll('.section').forEach(function(s, i) {
      s.style.animationDelay = (i * 0.03) + 's';
    });
  }

  content.addEventListener('click', function(e) {
    var btn = e.target.closest('.tag-btn');
    if (btn) { selectedTag = btn.getAttribute('data-tag'); renderAll(); return; }
    var back = e.target.closest('#backToTags');
    if (back) { selectedTag = null; renderAll(); }
  });

  subNav.addEventListener('click', function(e) {
    var link = e.target.closest('.sub-nav-link');
    if (!link) return;
    e.preventDefault();
    var el = document.getElementById(link.getAttribute('data-to'));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  navCategories.addEventListener('click', function(e) {
    var t = e.target;
    if (!t.classList.contains('nav-cat')) return;
    e.preventDefault();
    var cat = t.getAttribute('data-cat');
    activeCat = cat;
    selectedTag = null;
    setActiveNav(cat);
    renderAll();
  });

  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
      var hasText = !!searchInput.value.trim();
      if (hasText) activeCat = null;
      else if (!activeCat) activeCat = 'all';
      setActiveNav(hasText ? 'all' : activeCat);
      renderAll();
    }, 200);
  });

  window.addEventListener('scroll', function() {
    toTop.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  toTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  initTheme();
  buildNav();
  renderAll();
})();