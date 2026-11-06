const {Plugin,ItemView,PluginSettingTab,Setting,TFile,Notice}=require('obsidian');
const VIEW='vault-dimensions-view';
const LEVELS=['Home / hubs','Maps of maps','Maps of content','Linked notes','Unlinked notes'];
const NS={area:'area/',topic:'topic/',method:'method/'};
const MAPR=[6.5,6,5.5];
function dotR(rec,max){return rec.level<=2?MAPR[rec.level]:1.8+1.1*Math.sqrt(Math.log1p(rec.total)/Math.log1p(max))}
function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return (h>>>0)/4294967295}
function tagPalette(records,ns){const vals=[...new Set([...records.values()].flatMap(r=>r.tags.filter(t=>t.startsWith(ns))))].sort();const m=new Map();vals.forEach((v,i)=>m.set(v,`hsl(${Math.round(i*360/Math.max(1,vals.length))} 62% 52%)`));return m}
async function build(app,settings){
 const files=app.vault.getMarkdownFiles().filter(f=>!settings.exclude.split(',').some(p=>p.trim()&&(f.path===p.trim()||f.path.startsWith(p.trim()+'/'))));
 const records=new Map(files.map(f=>{const fm=app.metadataCache.getFileCache(f)?.frontmatter||{};const d=String(fm.created||'').match(/^\d{4}-\d{2}(?:-\d{2})?/);const name=f.basename.match(/^\d{4}-\d{2}-\d{2}/);return [f.path,{file:f,fm,folder:f.path.includes('/')?f.path.split('/')[0]:'(root)',date:d?d[0].slice(0,7):name?name[0].slice(0,7):null,out:new Set(),incoming:new Set()}]}));
 for(const [source,targets] of Object.entries(app.metadataCache.resolvedLinks)){const a=records.get(source);if(!a)continue;for(const target of Object.keys(targets)){const b=records.get(target);if(b&&a!==b){a.out.add(target);b.incoming.add(source)}}}
 for(const a of records.values()){a.total=new Set([...a.out,...a.incoming]).size;a.map=a.fm.type==='moc'||a.file.path.startsWith(settings.mapFolder.replace(/\/$/,'')+'/');a.children=new Set();}
 const BODY_PARENT=/^\s*\*\*Parent:\*\*\s*\[\[([^\]|#]+)/m;
 const UPLINK=/^\s*\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]\s*$/;
 for(const a of records.values()){
  let value=a.fm.parent,source='frontmatter';
  if(Array.isArray(value))value=value[0];
  if(typeof value!=='string'||!value.trim()){
   source='body';
   try{
    const text=await app.vault.cachedRead(a.file);
    const m=BODY_PARENT.exec(text);
    if(m)value=m[1];
    else{const body=text.replace(/^---\n[\s\S]*?\n---\n?/,''),first=body.split('\n').find(l=>l.trim()),u=first?UPLINK.exec(first):null;if(u){value=u[1];source='uplink'}else value=null}
   }catch(e){value=null}
  }
  if(typeof value!=='string'||!value.trim())continue;
  value=value.replace(/^\[\[/,'').replace(/\]\]$/,'').split('|')[0].split('#')[0].trim();
  const parent=app.metadataCache.getFirstLinkpathDest(value,a.file.path);
  if(parent&&records.has(parent.path)&&parent.path!==a.file.path){records.get(parent.path).children.add(a.file.path);a.parent=parent.path;a.parentSource=source}
 }
 const hubs=new Set(settings.hubs.split(',').map(s=>s.trim()).filter(Boolean));
 for(const a of records.values()){const count=[...a.children].filter(p=>records.get(p)?.map).length;if(hubs.has(a.file.path)){a.level=0;a.reason='Configured home or hub'}else if(a.map&&count>=settings.threshold){a.level=1;a.reason=`${count} declared child maps`}else if(a.map){a.level=2;a.reason='MOC type or navigation folder'}else if(a.total){a.level=3;a.reason=`${a.total} distinct neighbors`}else{a.level=4;a.reason='No resolved note links'}}
 for(const a of records.values()){
  const raw=a.fm.tags;
  a.tags=(Array.isArray(raw)?raw:(typeof raw==='string'?raw.split(/[,\s]+/):[])).map(t=>String(t).replace(/^#/,'').trim()).filter(Boolean);
  a.xfolder=a.folder;a.territory=null;
  if(!a.map)continue;
  const seen=new Set(),stack=[...a.children];
  while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);const r=records.get(id);if(r)for(const c of r.children)stack.push(c)}
  const tally=new Map();let total=0;
  for(const id of seen){const r=records.get(id);if(!r||r.map)continue;tally.set(r.folder,(tally.get(r.folder)||0)+1);total++}
  let best=null,bn=0;for(const [f,c] of tally)if(c>bn){bn=c;best=f}
  a.xfolder=(best&&bn/total>=.6)?best:null;
  if(best)a.territory=`${best}, ${Math.round(bn*100/total)}% of ${total} descendants`;
  if(!a.xfolder){const want=a.file.basename.toLowerCase();for(const f of new Set([...records.values()].filter(r=>!r.map).map(r=>r.folder)))if(f.toLowerCase().replace(/^\d+\.\s*/,'').trim()===want){a.xfolder=f;a.territory=`${f}, matched by name`;break}}
 }
 return records;
}
function neighborhood(records,start,steps){const seen=new Set(start?[start]:[]);let frontier=[...seen];for(let i=0;i<steps;i++){const next=[];for(const id of frontier){const n=records.get(id);if(!n)continue;for(const p of [...n.out,...n.incoming])if(!seen.has(p)){seen.add(p);next.push(p)}}frontier=next}return seen}
class DimensionsView extends ItemView{
 constructor(leaf,plugin){super(leaf);this.plugin=plugin;this.selected=null;this.buildToken=0;this.colorMode='graph';this.axis='folder';this.focus=false;this.steps=1;this.zoom=1;this.query='';this.folder='';this.records=new Map();this.panX=0;this.panY=0;this.viewScale=1;this.colorGroups=[]}
 getViewType(){return VIEW} getDisplayText(){return 'Vault Dimensions'} getIcon(){return 'layout-dashboard'}
 async onOpen(){await this.loadColors();await this.refresh();this.registerDomEvent(this.containerEl.ownerDocument,'keydown',evt=>{if(evt.key.toLowerCase()!=='f'||evt.ctrlKey||evt.metaKey||evt.altKey||this.app.workspace.activeLeaf!==this.leaf)return;const target=evt.target;if(target?.closest?.('input,textarea,select,[contenteditable=true]')||target?.isContentEditable||!this.selected)return;evt.preventDefault();this.focus=!this.focus;this.draw()});this.registerEvent(this.app.workspace.on('active-leaf-change',()=>{if(this.app.workspace.activeLeaf===this.leaf)this.loadColors().then(()=>this.renderMap())}));this.resizeObserver=new ResizeObserver(()=>{if(this.mapWrap&&this.mapWrap.isConnected)this.renderMap()});this.resizeObserver.observe(this.contentEl);this.register(()=>this.resizeObserver.disconnect());this.registerEvent(this.app.metadataCache.on('resolved',()=>this.refresh()));this.registerEvent(this.app.vault.on('rename',()=>this.refresh()));this.registerEvent(this.app.workspace.on('css-change',()=>this.draw()));}
 async loadColors(){try{const raw=await this.app.vault.adapter.read(this.app.vault.configDir+'/graph.json');const data=JSON.parse(raw);this.colorGroups=(data.colorGroups||[]).map(g=>{const match=String(g.query||'').trim().match(/^path:\s*(?:"([^"]+)"|(\S+))\s*$/i);if(!match||!Number.isInteger(g.color?.rgb))return null;return {path:(match[1]||match[2]).toLowerCase(),color:'#'+(g.color.rgb&0xffffff).toString(16).padStart(6,'0'),alpha:typeof g.color.a==='number'?Math.max(0,Math.min(1,g.color.a)):1}}).filter(Boolean)}catch(e){this.colorGroups=[]}}
 async refresh(){const token=++this.buildToken;const records=await build(this.app,this.plugin.settings);if(token!==this.buildToken)return;this.records=records;if(this.selected&&!this.records.has(this.selected))this.selected=null;this.draw()}
 draw(){const root=this.contentEl;root.empty();root.addClass('dimensions');const bar=root.createDiv({cls:'dim-bar'});const title=bar.createEl('strong',{text:'Vault Dimensions'});const axis=bar.createEl('select');for(const [v,t] of [['folder','Hierarchy by folder'],['date','Hierarchy by created date']])axis.createEl('option',{value:v,text:t});axis.value=this.axis;axis.onchange=()=>{this.axis=axis.value;this.draw()};const cmode=bar.createEl('select');for(const [v,t] of [['graph','Folder colors'],['area','Color by area/'],['topic','Color by topic/'],['method','Color by method/']])cmode.createEl('option',{value:v,text:t});cmode.value=this.colorMode;cmode.onchange=()=>{this.colorMode=cmode.value;this.renderMap()};const folder=bar.createEl('select');folder.createEl('option',{value:'',text:'All folders'});for(const f of [...new Set([...this.records.values()].map(n=>n.folder))].sort())folder.createEl('option',{value:f,text:f});folder.value=this.folder;folder.onchange=()=>{this.folder=folder.value;this.draw()};const search=bar.createEl('input',{attr:{placeholder:'Find title or alias'}});search.value=this.query;search.oninput=()=>{this.query=search.value;this.renderMap()};const label=bar.createEl('label',{text:' Focus '});const focus=label.createEl('input',{attr:{type:'checkbox'}});focus.checked=this.focus;focus.onchange=()=>{this.focus=focus.checked;this.draw()};const steps=bar.createEl('select');for(let i=1;i<=3;i++)steps.createEl('option',{value:String(i),text:`${i} step${i>1?'s':''}`});steps.value=String(this.steps);steps.onchange=()=>{this.steps=Number(steps.value);this.draw()};{const b=bar.createEl('button',{text:'Fit'});b.onclick=()=>{this.viewScale=1;this.panX=0;this.panY=0;this.renderMap()}}
 this.legend=root.createDiv({cls:'dim-legend'}); const main=root.createDiv({cls:'dim-main'});this.mapWrap=main.createDiv({cls:'dim-map-wrap'});this.detail=main.createDiv({cls:'dim-detail'});const pane=this.mapWrap;let drag=null,frame=0;const apply=()=>{const svg=pane.querySelector('svg');if(svg){const w=Number(svg.getAttribute('width')),h=Number(svg.getAttribute('height'));svg.setAttribute('viewBox',`${-this.panX/this.viewScale} ${-this.panY/this.viewScale} ${w/this.viewScale} ${h/this.viewScale}`);this.updateAxes?.();this.updateSymbols?.()}};pane.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('circle'))return;drag={x:e.clientX,y:e.clientY,px:this.panX,py:this.panY};pane.setPointerCapture(e.pointerId);pane.addClass('is-dragging')});pane.addEventListener('pointermove',e=>{if(!drag)return;this.panX=drag.px+e.clientX-drag.x;this.panY=drag.py+e.clientY-drag.y;apply()});const end=e=>{if(drag&&e.type==='pointerup'&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<4){this.selected=null;this.focus=false;this.draw()}drag=null;pane.removeClass('is-dragging')};pane.addEventListener('pointerup',end);pane.addEventListener('pointercancel',end);pane.addEventListener('wheel',e=>{e.preventDefault();const rect=pane.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,old=this.viewScale,next=Math.max(.4,Math.min(6,old*Math.exp(-e.deltaY*.0015)));this.panX=x-(x-this.panX)*next/old;this.panY=y-(y-this.panY)*next/old;this.viewScale=next;cancelAnimationFrame(frame);frame=requestAnimationFrame(apply)},{passive:false});this.renderMap()}
 renderMap(){const wrap=this.mapWrap;wrap.empty();const all=[...this.records.values()],near=this.focus?neighborhood(this.records,this.selected,this.steps):null;const q=this.query.toLowerCase();const shown=all.filter(n=>(!near||near.has(n.file.path))&&(!this.folder||this.folder===n.folder)&&(!q||[n.file.basename,n.file.path,...(Array.isArray(n.fm.aliases)?n.fm.aliases:[n.fm.aliases||''])].join(' ').toLowerCase().includes(q)));const folders=[...new Set(all.filter(n=>!n.map).map(n=>n.folder))].sort();const folderSet=new Set(folders);const dates=[...new Set(all.map(n=>n.date).filter(Boolean))].sort();if(all.some(n=>!n.date))dates.push('Unknown');const keys=this.axis==='folder'?folders:dates;const width=Math.max(300,wrap.clientWidth||800),height=Math.max(250,wrap.clientHeight||550),left=160,right=30,top=40,row=(height-110)/5,step=(width-left-right)/Math.max(keys.length,1);const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('width',width);svg.setAttribute('height',height);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('viewBox',`0 0 ${width} ${height}`);wrap.appendChild(svg);svg.setAttribute('viewBox',`${-this.panX/this.viewScale} ${-this.panY/this.viewScale} ${width/this.viewScale} ${height/this.viewScale}`);const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text)e.textContent=text;svg.appendChild(e);return e};LEVELS.forEach((level,i)=>{let y=top+i*row;add('line',{x1:left,y1:y+row,x2:width-right,y2:y+row,class:'dim-grid'});add('text',{x:left-10,y:y+row/2,'text-anchor':'end',class:'dim-axis'},level)});for(let i=0;i<=keys.length;i++)add('line',{x1:left+i*step,y1:top,x2:left+i*step,y2:top+5*row,class:'dim-sep'});keys.forEach((k,i)=>{const x=left+(i+.5)*step;if(step>35||i%Math.ceil(45/step)===0)add('text',{x,y:height-45,'text-anchor':'middle',class:'dim-axis'},k)});
 const overlay=document.createElementNS(ns,'svg');overlay.setAttribute('class','dim-axes-overlay');wrap.appendChild(overlay);this.updateAxes=()=>{overlay.replaceChildren();const vw=wrap.clientWidth||width,vh=wrap.clientHeight||height;overlay.setAttribute('viewBox',`0 0 ${vw} ${vh}`);const axisText=(x,y,label,anchor)=>{const e=document.createElementNS(ns,'text');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('text-anchor',anchor);e.setAttribute('class','dim-axis');e.textContent=label;overlay.appendChild(e)};const leftBg=document.createElementNS(ns,'rect');leftBg.setAttribute('x',0);leftBg.setAttribute('y',0);leftBg.setAttribute('width',155);leftBg.setAttribute('height',vh);leftBg.setAttribute('class','dim-axis-bg');overlay.appendChild(leftBg);const bottomBg=document.createElementNS(ns,'rect');bottomBg.setAttribute('x',0);bottomBg.setAttribute('y',Math.max(0,vh-32));bottomBg.setAttribute('width',vw);bottomBg.setAttribute('height',32);bottomBg.setAttribute('class','dim-axis-bg');overlay.appendChild(bottomBg);LEVELS.forEach((label,i)=>{const y=(top+(i+.5)*row)*this.viewScale+this.panY;if(y>12&&y<vh-34)axisText(145,y+4,label,'end')});keys.forEach((label,i)=>{const x=(left+(i+.5)*step)*this.viewScale+this.panX;if(x>160&&x<vw-20&&(step*this.viewScale>55||i%Math.ceil(55/(step*this.viewScale))===0))axisText(x,vh-11,label,'middle')})};this.updateAxes();
 const SPAN='\u0000span';const positions=new Map(),buckets=new Map();
 for(const n of all){const xkey=this.axis==='folder'?(n.map?((n.xfolder&&folderSet.has(n.xfolder))?n.xfolder:SPAN):n.folder):(n.date||'Unknown');const key=n.level+'\u0001'+xkey;if(!buckets.has(key))buckets.set(key,{level:n.level,xkey,items:[]});buckets.get(key).items.push(n)}
 for(const {level,xkey,items:group} of buckets.values()){
  group.sort((a,b)=>a.file.path.localeCompare(b.file.path));
  const band=top+(Number(level)+.5)*row;
  if(xkey===SPAN){const usable=width-left-right;group.forEach((n,i)=>{positions.set(n.file.path,{x:left+usable*((i+.5)/group.length),y:band+(hash('y|'+n.file.path)-.5)*Math.min(18,row*.4)})});continue}
  const n0=group.length,cx=left+(keys.indexOf(xkey)+.5)*step,cy=band,
   fill=Math.max(.34,Math.min(1,Math.sqrt(n0/26))),
   w=(step-10)*fill,h=(row-18)*fill,x0=cx-w/2,y0=cy-h/2;
  group.forEach(n=>{
   if(n0<2){positions.set(n.file.path,{x:cx,y:cy});return}
   positions.set(n.file.path,{x:x0+hash('x|'+n.file.path)*w,y:y0+hash('y|'+n.file.path)*h})})
 }
 for(const lvl of [0,1,2]){
  const tier=all.filter(n=>n.level===lvl);
  if(!tier.length)continue;
  const band=top+(lvl+.5)*row;
  if(tier.length===1){const q=positions.get(tier[0].file.path);positions.set(tier[0].file.path,{x:q.x,y:band});continue}
  tier.sort((x,y)=>positions.get(x.file.path).x-positions.get(y.file.path).x||x.file.basename.localeCompare(y.file.basename));
  const lanes=2,cursor=new Array(lanes).fill(left+12),gap=n=>Math.max(40,n.file.basename.length*5.6+22),limit=width-right-12,xs=[];
  const room=(limit-left-12)/tier.length,minGap=Math.max(26,Math.min(54,room));let gcur=left+12;
  tier.forEach((n,i)=>{const L=i%lanes,want=positions.get(n.file.path).x,x=Math.max(want,cursor[L],gcur);cursor[L]=x+gap(n);gcur=x+minGap;xs.push(x)});
  if(Math.max(...xs)>limit){const back=new Array(lanes).fill(limit);for(let i=tier.length-1;i>=0;i--){const L=i%lanes;xs[i]=Math.min(xs[i],back[L]);back[L]=xs[i]-gap(tier[i])}}
  tier.forEach((n,i)=>positions.set(n.file.path,{x:xs[i],y:band+((i%lanes)?13:-13)}));
 }
 const selected=this.records.get(this.selected),visible=new Set(shown.map(n=>n.file.path));if(selected&&visible.has(this.selected)){
  const drawn=new Set(),reached=new Set([this.selected]);let frontier=[this.selected],budget=2000;
  for(let d=0;d<this.steps&&budget>0;d++){
   const next=[];
   for(const id of frontier){
    const rec=this.records.get(id),a=positions.get(id);
    if(!rec||!a)continue;
    for(const [ids,dashed] of [[rec.out,false],[rec.incoming,true]])for(const tgt of ids){
     if(!visible.has(tgt))continue;
     const b=positions.get(tgt);if(!b)continue;
     const key=id<tgt?id+'\u0001'+tgt:tgt+'\u0001'+id;
     if(!drawn.has(key)&&budget>0){
      drawn.add(key);budget--;
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,k=Math.min(70,L*.2);
      const e=add('path',{d:`M${a.x} ${a.y} Q${mx-dy/L*k} ${my+dx/L*k} ${b.x} ${b.y}`,fill:'none',class:'dim-edge'+(dashed?' incoming':'')});
      e.style.opacity=String(Math.max(.14,.62-d*.2));
     }
     if(!reached.has(tgt)){reached.add(tgt);next.push(tgt)}
    }
   }
   frontier=next;
  }
 }
 const tns=NS[this.colorMode]||null,palette=tns?tagPalette(this.records,tns):null;
 if(this.legend){this.legend.empty();if(palette&&palette.size){for(const [tv,col] of palette){const k=this.legend.createSpan({cls:'dim-key'});k.createSpan({cls:'dim-swatch'}).style.background=col;k.createSpan({text:tv.slice(tns.length)})}const bare=[...this.records.values()].filter(r=>!r.tags.some(x=>x.startsWith(tns))).length;if(bare)this.legend.createSpan({cls:'dim-muted',text:`${bare} untagged`})}else if(tns){this.legend.createSpan({cls:'dim-muted',text:'No tags in this namespace'})}}
 const max=Math.max(1,...all.map(n=>n.total));const labels=[];for(const n of shown){const p=positions.get(n.file.path),r=dotR(n,max),circle=add('circle',{cx:p.x,cy:p.y,r,class:'dim-dot'+(n.file.path===this.selected?' selected':''),tabindex:'0',role:'button','aria-label':`${n.file.basename}, ${LEVELS[n.level]}, ${n.total} neighbors`});const tv=palette?n.tags.find(x=>x.startsWith(tns)):null;if(tv){circle.style.fill=palette.get(tv);circle.style.fillOpacity='.9'}else if(!palette){const group=this.colorGroups.find(g=>n.file.path.toLowerCase().includes(g.path));if(group){circle.style.fill=group.color;circle.style.fillOpacity=String(group.alpha)}}if(n.level>2)circle.style.strokeWidth='.6';circle.dataset.baseRadius=String(r);circle.appendChild(document.createElementNS(ns,'title')).textContent=n.file.basename;const select=()=>{this.selected=n.file.path;this.renderMap()};circle.addEventListener('click',select);circle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select()}})}
 {const near=new Set(selected?[...selected.out,...selected.incoming]:[]);const candidates=[...(selected?[selected]:[]),...shown.filter(n=>n.file.path!==this.selected&&n.level<=2).sort((a,b)=>a.level-b.level||b.total-a.total),...shown.filter(n=>n.file.path!==this.selected&&n.level>2&&near.has(n.file.path)).sort((a,b)=>b.total-a.total),...shown.filter(n=>n.file.path!==this.selected&&n.level>2&&!near.has(n.file.path)).sort((a,b)=>b.total-a.total)];for(const n of candidates){if(!visible.has(n.file.path))continue;const p=positions.get(n.file.path),lr=dotR(n,max),text=add('text',{x:p.x+lr+5,y:p.y+3.8,class:'dim-label'},n.file.basename);text.dataset.anchorX=String(p.x);text.dataset.anchorY=String(p.y);text.dataset.anchorR=String(lr);text.dataset.selected=n===selected?'true':'false';text.dataset.tier=n.level<=2?'true':'false';text.dataset.minScale=(n.level>2&&!near.has(n.file.path)&&n.file.path!==this.selected)?'2.2':''}}
 this.updateSymbols=()=>{const scale=this.viewScale;for(const c of svg.querySelectorAll('.dim-dot'))c.setAttribute('r',String(Number(c.dataset.baseRadius)/Math.pow(scale,.7)));const boxes=[];const vw=wrap.clientWidth||width,vh=wrap.clientHeight||height;for(const label of svg.querySelectorAll('.dim-label')){label.style.display='';const ms=Number(label.dataset.minScale||0);if(ms&&scale<ms){label.style.display='none';continue}const sx=Number(label.dataset.anchorX)*scale+this.panX,sy=Number(label.dataset.anchorY)*scale+this.panY;if(sx<-80||sy<-40||sx>vw+40||sy>vh+20){label.style.display='none';continue}label.style.fontSize=(11/scale)+'px';label.style.strokeWidth=(4/scale)+'px';label.setAttribute('x',String(Number(label.dataset.anchorX)+Number(label.dataset.anchorR||0)/Math.pow(scale,.7)+5/scale));label.setAttribute('y',String(Number(label.dataset.anchorY)+3.8/scale));const box=label.getBBox(),overlap=boxes.some(b=>box.x<b.x+b.width+(label.dataset.tier==='true'?1:4)/scale&&box.x+box.width+(label.dataset.tier==='true'?1:4)/scale>b.x&&box.y<b.y+b.height+(label.dataset.tier==='true'?1:4)/scale&&box.y+box.height+(label.dataset.tier==='true'?1:4)/scale>b.y);if(overlap&&label.dataset.selected!=='true')label.style.display='none';else boxes.push(box)}};this.updateSymbols();
 this.detail.empty();if(!selected)return;this.detail.createEl('h3',{text:selected.file.basename});this.detail.createEl('p',{text:selected.file.path,cls:'dim-muted'});this.detail.createEl('p',{text:`${LEVELS[selected.level]} · ${selected.reason}`});if(selected.territory)this.detail.createEl('p',{text:`Governs: ${selected.territory}`,cls:'dim-muted'});if(selected.tags.length)this.detail.createEl('p',{text:selected.tags.join(', '),cls:'dim-muted'});if(selected.parent){const pn=this.records.get(selected.parent);if(pn)this.detail.createEl('p',{text:`Parent: ${pn.file.basename} (declared in ${selected.parentSource})`,cls:'dim-muted'})}this.detail.createEl('p',{text:`Created: ${selected.date||'Unknown'} · ${selected.incoming.size} incoming · ${selected.out.size} outgoing · ${selected.total} neighbors`});const open=this.detail.createEl('button',{text:'Open note'});open.onclick=()=>this.app.workspace.getLeaf('tab').openFile(selected.file);for(const [heading,links] of [['Linked from',selected.incoming],['Links to',selected.out]]){this.detail.createEl('h4',{text:heading});for(const path of links){const n=this.records.get(path);if(!n)continue;const b=this.detail.createEl('button',{text:n.file.basename,cls:'dim-list-item'});b.onclick=()=>{this.selected=path;this.renderMap()}}}}
}
module.exports=class DimensionsPlugin extends Plugin{async onload(){this.settings=Object.assign({hubs:'MOCs/Dashboard.md',mapFolder:'MOCs',exclude:'Templates',threshold:2},await this.loadData());this.registerView(VIEW,leaf=>new DimensionsView(leaf,this));this.addCommand({id:'open-dimensions',name:'Open dimensions',callback:()=>this.open()});this.addRibbonIcon('layout-dashboard','Open dimensions',()=>this.open());this.addSettingTab(new class extends PluginSettingTab{display(){const el=this.containerEl;el.empty();el.createEl('h2',{text:'Vault Dimensions'});for(const [key,name] of [['hubs','Home and hub paths (comma-separated)'],['mapFolder','Maps folder'],['exclude','Excluded folders (comma-separated)']])new Setting(el).setName(name).addText(t=>t.setValue(this.plugin.settings[key]).onChange(async v=>{this.plugin.settings[key]=v;await this.plugin.saveData(this.plugin.settings)}));new Setting(el).setName('Child maps required for maps of maps').addText(t=>t.setValue(String(this.plugin.settings.threshold)).onChange(async v=>{this.plugin.settings.threshold=Math.max(1,parseInt(v)||2);await this.plugin.saveData(this.plugin.settings)}))}}(this.app,this))}async open(){let leaf=this.app.workspace.getLeavesOfType(VIEW)[0];if(!leaf){leaf=this.app.workspace.getLeaf('tab');await leaf.setViewState({type:VIEW,active:true})}this.app.workspace.revealLeaf(leaf)}};
