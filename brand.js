/* Specul shared runtime. Run before styles to apply preferences before paint.
 * Language is decided by the path: /en/... is English, everything else is Chinese.
 * Site home pages may auto-show English when the browser prefers English and the
 * visitor has not chosen Chinese before; deep pages stay on their URL language.
 * No ?lang= or ?theme= is written into links or the address bar.
 */
(function () {
  'use strict';
  if (window.Specul) return;
  var root = document.documentElement;
  var path = location.pathname;
  var isEnPath = /^\/en(?:\/|$)/.test(path);
  var isHome = path === '/' || path === '/index.html';
  var cookieEnabled = /(^|\.)specul\.com$/.test(location.hostname) && location.protocol === 'https:';
  var validLang = function (v) { return /^(zh|en)$/.test(v || ''); };
  var validTheme = function (v) { return /^(light|dark)$/.test(v || ''); };
  function stored(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function shared() {
    try {
      var match = /(?:^|;\s*)specul-ui=(zh|en)\.(light|dark)(?:;|$)/.exec(document.cookie);
      return match ? { lang: match[1], theme: match[2] } : {};
    } catch (_) { return {}; }
  }
  function browserLang() { return /^zh\b/i.test((navigator.languages || [navigator.language])[0] || 'zh') ? 'zh' : 'en'; }
  function systemTheme() { return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
  var common = cookieEnabled ? shared() : {};
  var chosen = common.lang || stored('specul-lang');
  var lang = isEnPath ? 'en' : (isHome && (chosen ? chosen === 'en' : browserLang() === 'en') ? 'en' : 'zh');
  var theme = (common.theme || stored('specul-theme') || systemTheme());
  function rememberLang(value) {
    if (!validLang(value)) return;
    try { localStorage.setItem('specul-lang', value); } catch (_) {}
    if (cookieEnabled) try { document.cookie = 'specul-ui=' + value + '.' + theme + '; Domain=specul.com; Path=/; Max-Age=31536000; SameSite=Lax; Secure'; } catch (_) {}
  }
  function persistTheme() {
    try { localStorage.setItem('specul-theme', theme); } catch (_) {}
    if (cookieEnabled) try { document.cookie = 'specul-ui=' + lang + '.' + theme + '; Domain=specul.com; Path=/; Max-Age=31536000; SameSite=Lax; Secure'; } catch (_) {}
  }
  function paint() {
    root.lang = lang === 'en' ? 'en' : 'zh-CN';
    root.dataset.lang = lang;
    if (theme === 'light') root.dataset.theme = 'light'; else root.removeAttribute('data-theme');
    root.style.colorScheme = theme;
  }
  paint(); persistTheme(); root.classList.add('js-on'); root.dataset.speculBoot = document.readyState;
  function labels() {
    var en = lang === 'en', button = document.getElementById('langBtn');
    if (button) {
      button.textContent = en ? '中' : 'EN';
      button.title = en ? 'Switch to Chinese' : '切换到英文';
      button.setAttribute('aria-label', button.title);
    }
    button = document.getElementById('themeBtn');
    if (button) {
      button.textContent = theme === 'light' ? '☀' : '☾';
      button.title = en ? (theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme') : (theme === 'light' ? '切换到深色' : '切换到浅色');
      button.setAttribute('aria-label', button.title);
    }
    var name = document.getElementById('markName');
    if (name) name.textContent = (en ? name.dataset.enName : name.dataset.zhName) || name.textContent;
    document.querySelectorAll('#markSub, .nav-drawer .brand-sub').forEach(function (s) {
      var text = en ? (s.dataset.enSub || '') : (s.dataset.zhSub || ''); s.textContent = text; s.hidden = !text;
    });
    document.querySelectorAll('.nav-links, .nav-drawer').forEach(function (n) { n.setAttribute('aria-label', en ? 'Site navigation' : '站点导航'); });
    var close = document.querySelector('.nav-dclose');
    if (close) close.setAttribute('aria-label', en ? 'Close menu' : '关闭菜单');
    var burger = document.querySelector('.nav-burger');
    if (burger) burger.setAttribute('aria-label', burger.getAttribute('aria-expanded') === 'true' ? (en ? 'Close menu' : '关闭菜单') : (en ? 'Open menu' : '打开菜单'));
    var commonLabels = { '关闭':'Close', '打开菜单':'Open menu', '关闭菜单':'Close menu', '快捷导航':'Quick navigation', '页脚导航':'Footer navigation', '法律':'Legal', '站点导航':'Site navigation', '搜索':'Search', '搜索名词':'Search terms', '排布方式':'Arrange terms', '上一篇 / 下一篇':'Previous and next', '面包屑':'Breadcrumb', '站内大类':'Tool categories' };
    document.querySelectorAll('[aria-label]').forEach(function (el) {
      var original = el.getAttribute('data-ui-aria-label-zh') || el.getAttribute('aria-label');
      if (commonLabels[original]) { el.setAttribute('data-ui-aria-label-zh', original); el.setAttribute('data-ui-aria-label-en', commonLabels[original]); }
    });
    ['placeholder', 'aria-label', 'title'].forEach(function (attribute) {
      document.querySelectorAll('[data-ui-' + attribute + '-zh]').forEach(function (el) {
        var text = el.getAttribute('data-ui-' + attribute + '-' + lang);
        if (text !== null) el.setAttribute(attribute, text);
      });
    });
    document.querySelectorAll('[data-ui-text-zh]').forEach(function (el) {
      var text = el.getAttribute('data-ui-text-' + lang); if (text !== null) el.textContent = text;
    });
    [['.foot-links','Footer navigation','页脚导航'],['.foot-legal-links','Legal','法律'],['.nav-tabbar','Quick navigation','快捷导航']].forEach(function (item) {
      document.querySelectorAll(item[0]).forEach(function (el) { el.setAttribute('aria-label', en ? item[1] : item[2]); });
    });
    var home = document.querySelector('.site-header .brand');
    if (home) { home.title = en ? 'Specul home' : '投机取巧首页'; home.setAttribute('aria-label', home.title); }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim();
  }
  function updateTheme(nextTheme) {
    if (!validTheme(nextTheme)) return;
    theme = nextTheme; paint(); persistTheme(); labels();
    document.dispatchEvent(new CustomEvent('specul:preferences', { detail: { lang: lang, theme: theme } }));
  }
  window.Specul = Object.freeze({
    get lang() { return lang; }, get theme() { return theme; },
    setLanguage: function (value) {
      var btn = document.getElementById('langBtn');
      if (btn && btn.tagName === 'A' && btn.href) { rememberLang(value); location.href = btn.href; }
    },
    setTheme: function (value) { updateTheme(value); },
    syncLinks: function () {}
  });
  function init() {
    labels();
    var langButton = document.getElementById('langBtn'), themeButton = document.getElementById('themeBtn');
    if (langButton && langButton.tagName === 'A') {
      langButton.addEventListener('click', function () {
        rememberLang(lang === 'en' ? 'zh' : 'en');
      });
    }
    if (themeButton) themeButton.addEventListener('click', function () { updateTheme(theme === 'light' ? 'dark' : 'light'); });
    window.addEventListener('storage', function (e) {
      if (e.key === 'specul-theme') updateTheme(stored('specul-theme'));
    });
    setupDrawer();
  }
  function setupDrawer() {
    var burger = document.querySelector('.nav-burger'), drawer = document.querySelector('.nav-drawer');
    if (!burger || !drawer) return;
    var scrim = document.querySelector('.nav-scrim'), close = document.querySelector('.nav-dclose');
    var more = document.querySelector('.nav-tabbar [aria-controls]'), previousFocus, previousOverflow, open = false;
    root.classList.add('js-on'); drawer.inert = true; drawer.setAttribute('role', 'dialog');
    function set(value, trigger) {
      if (value === open) return;
      open = value;
      if (open) { previousFocus = trigger || document.activeElement; previousOverflow = document.body.style.overflow; }
      drawer.inert = !open; drawer.classList.toggle('open', open);
      if (scrim) scrim.classList.toggle('open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      if (open) drawer.setAttribute('aria-modal', 'true'); else drawer.removeAttribute('aria-modal');
      burger.setAttribute('aria-expanded', String(open));
      if (more) more.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : (previousOverflow || ''); labels();
      if (open && close) close.focus({ preventScroll: true });
      else if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    }
    burger.addEventListener('click', function () { set(!open, burger); });
    if (more) more.addEventListener('click', function () { set(!open, more); });
    if (close) close.addEventListener('click', function () { set(false); });
    if (scrim) scrim.addEventListener('click', function () { set(false); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      if (e.key === 'Escape') { e.preventDefault(); set(false); }
      if (e.key !== 'Tab') return;
      var nodes = Array.from(drawer.querySelectorAll('a[href], button:not([disabled])')).filter(function (el) { return el.getClientRects().length > 0; });
      var first = nodes[0], last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    matchMedia('(min-width: 901px)').addEventListener('change', function (e) { if (e.matches) set(false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
