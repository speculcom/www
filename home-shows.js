(function () {
  'use strict';
  var grid = document.getElementById('homeShows');
  if (!grid) return;

  var shows = [
    { id: 'kimi', img: 'home-shots/show-kimi-3d.webp', href: 'https://demos.specul.com/works/2026-11-kimi-k3-1-pro-3d.html', model: 'Kimi K3.1 Pro', zh: '把一段文字变成 3D 世界', en: 'Text to a 3D world', alt: 'Kimi K3.1 Pro 3D work preview' },
    { id: 'gemini', img: 'home-shots/show-gemini-omni.webp', href: 'https://demos.specul.com/works/2026-11-gemini-omni-1-2-flash.html', model: 'Gemini Omni 1.2 Flash', zh: '15 秒视频，还能接着改', en: 'A 15-second video you can keep editing', alt: 'Gemini Omni 1.2 Flash video work preview' },
    { id: 'hy4', img: 'home-shots/show-hy4-office.webp', href: 'https://demos.specul.com/works/2026-11-hy4-flash-workbuddy.html', model: 'Hy4 flash', zh: '150+ tok/s 的办公任务界面', en: 'An office-task interface at 150+ tok/s', alt: 'Hy4 flash office task work preview' },
    { id: 'lunar', img: 'home-shots/show-lunar-lander.webp', href: 'https://demos.specul.com/works/claude-fable-5-2-016-vector-lunar-descent.html', model: 'Claude Fable 5.2', zh: 'Descent — 一个矢量着陆游戏', en: 'Descent — a vector lander', alt: 'Descent — a vector lander preview' },
    { id: 'primes', img: 'home-shots/show-prime-spiral.webp', href: 'https://demos.specul.com/works/claude-fable-5-2-014-ulam-prime-spiral.html', model: 'Claude Fable 5.2', zh: '素数落在哪里', en: 'Where the primes fall', alt: 'Where the primes fall data work preview' },
    { id: 'drum', img: 'home-shots/show-drum-machine.webp', href: 'https://demos.specul.com/works/claude-fable-5-2-019-bauhaus-drum-machine.html', model: 'Claude Fable 5.2', zh: 'Rhythmus — 一台包豪斯鼓机', en: 'Rhythmus — a Bauhaus drum machine', alt: 'Rhythmus — a Bauhaus drum machine preview' },
    { id: 'croissant', img: 'home-shots/show-croissant.webp', href: 'https://demos.specul.com/works/claude-fable-5-2-003-anatomy-of-a-croissant.html', model: 'Claude Fable 5.2', zh: '一只可颂的解剖图', en: 'The anatomy of a croissant', alt: 'The anatomy of a croissant preview' },
    { id: 'bicycles', img: 'home-shots/show-bicycles.webp', href: 'https://demos.specul.com/works/claude-fable-5-2-036-kestrel-frameworks-bicycles.html', model: 'Claude Fable 5.2', zh: '按尺寸画的自行车', en: 'Bicycles drawn to measure', alt: 'Bicycles drawn to measure preview' },
    { id: 'peach', img: 'home-shots/show-peach-pit.webp', href: 'https://demos.specul.com/works/gpt-6-2-sol-003-peach-pit-press.html', model: 'GPT-6.2 Sol', zh: 'Peach Pit Press — 一张橙色的店页', en: 'Peach Pit Press — an orange shop page', alt: 'Peach Pit Press shop page preview' },
    { id: 'slit', img: 'home-shots/show-double-slit.webp', href: 'https://demos.specul.com/works/gemini4-neon-double-slit.html', model: 'Gemini 4 Neon', zh: '双缝干涉实验台', en: 'Double-slit lab', alt: 'Double-slit lab preview' },
    { id: 'forage', img: 'home-shots/show-forage-guide.webp', href: 'https://demos.specul.com/works/grok47-forage-field-guide.html', model: 'Grok 4.7', zh: '不存在的真菌图鉴', en: 'A field guide to species that are not real', alt: 'A field guide to species that are not real preview' },
    { id: 'pendulum', img: 'home-shots/show-double-pendulum.webp', href: 'https://demos.specul.com/works/haiku55-double-pendulum.html', model: 'Claude Haiku 5.5', zh: '双摆混沌实验台', en: 'Double pendulum lab', alt: 'Double pendulum lab preview' }
  ];

  var last = [];
  try { last = JSON.parse(sessionStorage.getItem('specul-home-shows') || '[]'); } catch (e) {}
  if (!Array.isArray(last)) last = [];

  var chosen = shows.slice(0, 3);
  var tries = 0;
  do {
    var pool = shows.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    chosen = pool.slice(0, 3);
    tries++;
  } while (last.length === 3 && chosen.some(function (x) { return last.indexOf(x.id) !== -1; }) && tries < 24);

  try {
    sessionStorage.setItem('specul-home-shows', JSON.stringify(chosen.map(function (x) { return x.id; })));
  } catch (e) {}

  function card(x) {
    var a = document.createElement('a');
    a.className = 'hm-show';
    a.href = x.href;
    var img = document.createElement('img');
    img.src = x.img;
    img.alt = x.alt;
    img.width = 960;
    img.height = 540;
    img.loading = 'lazy';
    img.decoding = 'async';
    var cap = document.createElement('span');
    cap.className = 'hm-show-cap';
    var small = document.createElement('small');
    small.textContent = x.model;
    var b = document.createElement('b');
    var zh = document.createElement('span');
    zh.setAttribute('data-zh', '');
    zh.textContent = x.zh;
    var en = document.createElement('span');
    en.setAttribute('data-en', '');
    en.textContent = x.en;
    b.appendChild(zh);
    b.appendChild(en);
    cap.appendChild(small);
    cap.appendChild(b);
    a.appendChild(img);
    a.appendChild(cap);
    return a;
  }

  grid.textContent = '';
  chosen.forEach(function (x) { grid.appendChild(card(x)); });
})();
