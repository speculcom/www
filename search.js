/* Static lexical search. The index is fetched once; filtering stays in the browser. */
(()=>{'use strict';
 const form=document.getElementById('search-form');if(!form)return;
 const q=document.getElementById('search-query'),scope=document.getElementById('search-scope'),status=document.getElementById('search-status'),list=document.getElementById('search-results'),more=document.getElementById('search-more'),fallback=document.getElementById('browse-index');
 const tr=(a,b)=>document.documentElement.lang.startsWith('en')?b:a;
 const labels={www:['主站','Home'],learn:['学 AI','Learn'],agent:['工具','Tools'],models:['模型','Models'],demos:['作品库','Demos'],hardware:['硬件算力','Compute'],papers:['AI 论文','AI Papers'],chain:['链','Chain'],nav:['外部站点','External']};
 const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const text=(tag,value,cls)=>{const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e;};
 const facetBar=document.getElementById('search-domains');
 const facetButtons=facetBar?[...facetBar.querySelectorAll('[data-filter-domain]')]:[];
 const leads=facetBar?[...facetBar.querySelectorAll('[data-lead-for]')]:[];
 const shownCount=document.getElementById('search-domains-count');
 /* 主题域的中英标签直接从服务端渲染的胶囊上读，避免前端再抄一份词表。 */
 const domainLabel={};
 for(const b of facetButtons){const zh=b.querySelector('[data-zh]'),en=b.querySelector('[data-en]');domainLabel[b.dataset.filterDomain]=[zh?zh.textContent.trim():b.dataset.filterDomain,en?en.textContent.trim():b.dataset.filterDomain];}
 let entries=[],matches=[],limit=40,ready=false,domain='all';
 const params=new URLSearchParams(location.search);q.value=(params.get('q')||'').slice(0,300);scope.value=labels[params.get('site')]?params.get('site'):'all';
 if(params.get('domain')&&domainLabel[params.get('domain')])domain=params.get('domain');
 function tokens(value){const query=normalize(value);const terms=new Set(query.match(/[\p{Script=Latin}\p{N}][\p{Script=Latin}\p{N}]*/gu)||[]);for(const run of query.replace(/怎么|如何|我想|我要|请问|可以|一个|一下|进行|做成|是否|使用|把/g,'').match(/\p{Script=Han}+/gu)||[]){if(run.length===1)terms.add(run);else for(let i=0;i<run.length-1;i++)terms.add(run.slice(i,i+2));}return{query,terms:[...terms]};}
 function score(e,parts){const corpus=[e._title,e._aliases,e._keywords,e._summary].join(' '),stop=new Set(['a','the','to','of','and','for','with','how','do','can','i','my','on','in']);const latin=parts.terms.filter(t=>! /\p{Script=Han}/u.test(t)&&!stop.has(t)),han=parts.terms.filter(t=>/\p{Script=Han}/u.test(t));if(latin.some(t=>!corpus.includes(t)))return 0;if(han.length&&han.filter(t=>corpus.includes(t)).length<Math.min(2,han.length))return 0;let n=0;const fields=[[e._title,12],[e._aliases,7],[e._keywords,9],[e._summary,2]];for(const[t,w]of fields){if(t.includes(parts.query))n+=w*5;for(const word of parts.terms)if(t.includes(word))n+=w;}if(e._title===parts.query)n+=120;return n;}
 function updateUrl(){try{const u=new URL(location.href);for(const[key,value]of[['q',q.value.trim()],['site',scope.value==='all'?'':scope.value],['domain',domain==='all'?'':domain]]){if(value)u.searchParams.set(key,value);else u.searchParams.delete(key);}history.replaceState(null,'',u);}catch{}}
 /* 域内计数按「当前关键词 + 站点」重算，且不把已选的域算进分母——
    否则选了「基础与概念」以后其余域会全变 0，读者看不出「换一个域能看到多少」。 */
 function refreshFacets(){if(!facetBar)return;const parts=tokens(q.value);const inScope=entries.filter(e=>scope.value==='all'||e.site===scope.value);const pool=parts.query?inScope.filter(e=>score(e,parts)>0):inScope;let any=0;for(const b of facetButtons){const id=b.dataset.filterDomain;const n=id==='all'?pool.length:pool.filter(e=>(e.domains||[]).includes(id)).length;const badge=b.querySelector('.fx-n');if(badge)badge.textContent=String(n);b.setAttribute('aria-pressed',id===domain?'true':'false');if(id==='all')any=pool.length;}if(shownCount)shownCount.textContent=String(matches.length||any);for(const p of leads)p.hidden=p.dataset.leadFor!==domain;}
 function render(reset=true){if(!ready)return;if(reset)limit=40;const parts=tokens(q.value);matches=entries.filter(e=>(scope.value==='all'||e.site===scope.value)&&(domain==='all'||(e.domains||[]).includes(domain))).map(e=>({e,score:parts.query?score(e,parts):e.keywords?1:0})).filter(x=>!parts.query||x.score>0).sort((a,b)=>b.score-a.score||a.e.url.localeCompare(b.e.url));list.replaceChildren();
  for(const{e}of matches.slice(0,limit)){const li=document.createElement('li'),h=document.createElement('h2'),a=text('a',tr(e.zh,e.en)||e.zh);a.href=e.url;h.append(a);li.append(h);
   const meta=document.createElement('p');meta.className='search-site';
   for(const d of e.domains||[]){if(!domainLabel[d])continue;meta.append(text('span',tr(...domainLabel[d]),'search-domain'));}
   meta.append(text('span',tr(...labels[e.site])+(e.kind==='resource'?tr(' · 外部站点',' · External site'):'')));
   li.append(meta);
   const summary=tr(e.summaryZh,e.summaryEn);if(summary)li.append(text('p',summary));list.append(li);}
  status.textContent=matches.length?tr(`找到 ${matches.length} 项，已显示 ${Math.min(limit,matches.length)} 项。`,`Found ${matches.length} records; showing ${Math.min(limit,matches.length)}.`):tr('没有匹配。试试产品名、任务词，或取消站点与主题域筛选。','No matches. Try a product name, task phrase or clear the site and topic filters.');
  more.hidden=matches.length<=limit;more.textContent=tr('再显示 40 项','Show 40 more');refreshFacets();updateUrl();
 }
 form.addEventListener('submit',e=>{e.preventDefault();render();});q.addEventListener('input',()=>render());scope.addEventListener('change',()=>render());
 for(const b of facetButtons)b.addEventListener('click',()=>{domain=b.dataset.filterDomain;render();});
 form.addEventListener('reset',()=>{setTimeout(()=>{q.value='';scope.value='all';domain='all';render();q.focus();},0);});more.addEventListener('click',()=>{limit+=40;render(false);});
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable){e.preventDefault();q.focus();}});
 new MutationObserver(()=>render(false)).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 fetch(form.dataset.index,{cache:'default'}).then(r=>{if(!r.ok)throw Error('index');return r.json();}).then(data=>{
  if(data.schema!==1||!Array.isArray(data.entries))throw Error('schema');
  entries=data.entries.filter(e=>labels[e.site]&&/^https:\/\/(?:specul\.com|(?:learn|tools|models|demos|hardware|papers|chain|nav)\.specul\.com)\//.test(e.url)).map(e=>({...e,_title:normalize(e.zh+' '+e.en),_aliases:normalize(e.aliases),_keywords:normalize(e.keywords),_summary:normalize(e.summaryZh+' '+e.summaryEn)}));
  ready=true;fallback.hidden=true;render();
 }).catch(()=>{status.textContent=tr('搜索索引未加载，请使用下方完整目录。','The search index did not load. Use the complete directory below.');more.hidden=true;fallback.hidden=false;});
})();
