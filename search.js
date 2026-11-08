/* Static lexical search. The index is fetched once; filtering stays in the browser. */
(()=>{'use strict';
 const form=document.getElementById('search-form');if(!form)return;
 const q=document.getElementById('search-query'),scope=document.getElementById('search-scope'),status=document.getElementById('search-status'),list=document.getElementById('search-results'),more=document.getElementById('search-more'),fallback=document.getElementById('browse-index');
 const tr=(a,b)=>document.documentElement.lang.startsWith('en')?b:a;
 const labels={www:['主站','Home'],learn:['学 AI','Learn'],agent:['AI 工具','Tools'],models:['AI 模型','Models'],demos:['作品库','Demos'],hardware:['AI 硬件','Hardware'],papers:['论文','Papers'],chain:['链 × AI','Chain × AI'],nav:['AI 导航','Directory']};
 const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const text=(tag,value,cls)=>{const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e;};
 let entries=[],matches=[],limit=40,ready=false;
 const params=new URLSearchParams(location.search);q.value=(params.get('q')||'').slice(0,300);scope.value=labels[params.get('site')]?params.get('site'):'all';
 function tokens(value){const query=normalize(value);const terms=new Set(query.match(/[\p{Script=Latin}\p{N}][\p{Script=Latin}\p{N}]*/gu)||[]);for(const run of query.replace(/怎么|如何|我想|我要|请问|可以|一个|一下|进行|做成|是否|使用|把/g,'').match(/\p{Script=Han}+/gu)||[]){if(run.length===1)terms.add(run);else for(let i=0;i<run.length-1;i++)terms.add(run.slice(i,i+2));}return{query,terms:[...terms]};}
 function score(e,parts){const corpus=[e._title,e._aliases,e._keywords,e._summary].join(' '),stop=new Set(['a','the','to','of','and','for','with','how','do','can','i','my','on','in']);const latin=parts.terms.filter(t=>! /\p{Script=Han}/u.test(t)&&!stop.has(t)),han=parts.terms.filter(t=>/\p{Script=Han}/u.test(t));if(latin.some(t=>!corpus.includes(t)))return 0;if(han.length&&han.filter(t=>corpus.includes(t)).length<Math.min(2,han.length))return 0;let n=0;const fields=[[e._title,12],[e._aliases,7],[e._keywords,9],[e._summary,2]];for(const[t,w]of fields){if(t.includes(parts.query))n+=w*5;for(const word of parts.terms)if(t.includes(word))n+=w;}if(e._title===parts.query)n+=120;return n;}
 function updateUrl(){try{const u=new URL(location.href);for(const[key,value]of[['q',q.value.trim()],['site',scope.value==='all'?'':scope.value]]){if(value)u.searchParams.set(key,value);else u.searchParams.delete(key);}history.replaceState(null,'',u);}catch{}}
 function render(reset=true){if(!ready)return;if(reset)limit=40;const parts=tokens(q.value);matches=entries.filter(e=>scope.value==='all'||e.site===scope.value).map(e=>({e,score:parts.query?score(e,parts):e.keywords?1:0})).filter(x=>!parts.query||x.score>0).sort((a,b)=>b.score-a.score||a.e.url.localeCompare(b.e.url));list.replaceChildren();
  for(const{e}of matches.slice(0,limit)){const li=document.createElement('li'),h=document.createElement('h2'),a=text('a',tr(e.zh,e.en)||e.zh);a.href=e.url;h.append(a);li.append(h,text('p',tr(...labels[e.site])+(e.kind==='resource'?tr(' · 导航条目',' · Directory entry'):''),'search-site'));const summary=tr(e.summaryZh,e.summaryEn);if(summary)li.append(text('p',summary));list.append(li);}
  status.textContent=matches.length?tr(`找到 ${matches.length} 项，已显示 ${Math.min(limit,matches.length)} 项。`,`Found ${matches.length} records; showing ${Math.min(limit,matches.length)}.`):tr('没有匹配。试试产品名、任务词，或取消站点筛选。','No matches. Try a product name, task phrase or all sites.');more.hidden=matches.length<=limit;more.textContent=tr('再显示 40 项','Show 40 more');updateUrl();
 }
 form.addEventListener('submit',e=>{e.preventDefault();render();});q.addEventListener('input',()=>render());scope.addEventListener('change',()=>render());form.addEventListener('reset',()=>{setTimeout(()=>{q.value='';scope.value='all';render();q.focus();},0);});more.addEventListener('click',()=>{limit+=40;render(false);});
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)&&!document.activeElement?.isContentEditable){e.preventDefault();q.focus();}});
 new MutationObserver(()=>render(false)).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 fetch(form.dataset.index,{cache:'default'}).then(r=>{if(!r.ok)throw Error('index');return r.json();}).then(data=>{
  if(data.schema!==1||!Array.isArray(data.entries))throw Error('schema');
  entries=data.entries.filter(e=>labels[e.site]&&/^https:\/\/(?:specul\.com|(?:learn|tools|models|demos|hardware|papers|chain|nav)\.specul\.com)\//.test(e.url)).map(e=>({...e,_title:normalize(e.zh+' '+e.en),_aliases:normalize(e.aliases),_keywords:normalize(e.keywords),_summary:normalize(e.summaryZh+' '+e.summaryEn)}));
  ready=true;fallback.hidden=true;render();
 }).catch(()=>{status.textContent=tr('搜索索引未加载，请使用下方完整目录。','The search index did not load. Use the complete directory below.');more.hidden=true;fallback.hidden=false;});
})();
