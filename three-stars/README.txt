three-stars —— 三颗星，一扇门 / Three stars, one door
Released 2026-11-06 · Specul · https://specul.com/topic-game.html

WHAT THIS IS / 这是什么
本站编写的浏览器小游戏与六阶段连续教学样例：收齐三颗星后走到 E。
A browser game and a six-stage teaching sample written for this site:
collect the three stars, then reach E.
无引擎、无账号、无后端、无网络请求；页面里出现的示例数值均为虚构。
No engine, account, backend or network call; every example value shown is
fictional.

HOW TO OPEN / 怎么打开
1) 解压到一个文件夹。 / Extract the archive into one folder.
2) 双击 index.html 就能玩：样式、脚本与品牌资源都在包内，不发请求。
   Double-click index.html and it plays: styles, scripts and brand assets
   are inside; nothing is requested.
3) 完整检查时再用本地静态服务打开一次。file:// 下的 localStorage 与站点来源的策略不同。
   For a full check, also serve the folder over http://localhost.
   localStorage under file:// is not governed
   like a site origin.

CONTROLS / 操作
方向键或 WASD 移动；P 暂停（阶段 2 起）；屏幕方向按钮（阶段 4 起）；窄棋盘开关（阶段 5 起）；
Arrows or WASD move; P pauses (from stage 2); on-screen direction buttons
appear from stage 4;
the narrow-board switch appears from stage 5; the save, load, delete,
download and import controls appear
保存到浏览器 / 载入 / 删除 / 下载 / 读入 在阶段 3 起出现。
from stage 3.
页面里的「阶段」选择器决定哪些控件可见 —— 那些控件就是这六个阶段的教学内容。
The stage selector decides which controls are visible; those controls are
the teaching content.

FILES / 文件
index.html            页面本体。六阶段说明是构建期内嵌的静态 HTML，关掉脚本也读得完整。
                      The page itself. The six stages are static HTML
                      inlined at build time,
                      readable with scripting off.
game.js · game.css    游戏逻辑与样式，构建时从源仓原样复制。
                      Game logic and styles, copied verbatim from the source
                      repository at build time.
brand.css · brand.js  站群共享外壳与明暗、语言切换（真相源 www.specul/）。
                      Shared shell plus theme and language switching (truth
                      source: www.specul/).
site.css 内容层排版（_sites/_template/site.css 与 _data/game/css/vg.css 拼接）。
                      Content-layer typography, assembled from
                      _sites/_template/site.css and vg.css.
asset-ledger.json 素材与许可台账，机读版。 / The machine-readable asset and licence
ledger.
manifest.json         包内逐文件字节数与 SHA-256（清单不记录自己的哈希）。
                      Per-file bytes and SHA-256 (the manifest does not hash
                      itself).
NOTICE.txt            许可与署名口径。 / Licence and attribution terms.

DATA / 数据
浏览器存档键名 specul-three-stars-v1，只写在本机；下载的 JSON 也在本机；不上传任何数据。
The browser save key is specul-three-stars-v1 and stays on your machine;
downloaded JSON stays too;
nothing is uploaded.
存档格式：schema 1、关卡 three-stars-1、坐标、步数、已收集星星。读入时校验字段、位置与关卡；
Save format: schema 1, level three-stars-1, coordinates, moves and collected
stars. On load the fields,
完成状态由位置与星星推出，不信任文件里的完成标记。本例只接受版本 1，不做版本迁移。
position and level are validated, and completion is derived rather than
trusted from a flag in the file.
Version 1 only; no migration is attempted.

LIMITS / 边界
本站在 2026-11-06 对这一份样例与这一个包做过清单式检查（通关、无效导入、存储受限、键盘与触屏、
320px 窄屏、明暗两主题、中英切换、无脚本可读、离线打开）。不覆盖其它浏览器、真机设备与其它来源
协议；不评价任何引擎或 AI 产品；不给通过率或正确率。玩法好不好玩，本包不作结论。
This site ran a checklist over this sample and this package on 2026-11-06
(completing the round, rejecting
invalid imports, blocked storage, keyboard and touch, a 320px screen, both
themes, both languages, reading
it without scripting, and opening the extracted files offline). Other
browsers, real devices and other
origins are not covered; no engine or AI product is evaluated; no pass rate
or accuracy figure is published.
Whether the loop is fun is outside the scope of this package.

许可文字见 NOTICE.txt；台账见 asset-ledger.json；条款原文 https://specul.com/legal.html#s1
Licence text: NOTICE.txt. Ledger: asset-ledger.json. Terms:
https://specul.com/legal.html#s1
