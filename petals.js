/* petals.js — 粉紅主題卡片效果(v1.0-002:MPFx 四選一 光影/櫻花/流動背景/關閉;v1.0-001 飄櫻花)
   支數記錄卡片首頁、員工專區「我的」共用。純 JS + CSS,iOS 12 以上可用(不用 cqh / color-mix / translate 屬性)。
   用法:MPPetals.on()  開始;MPPetals.off() 移除;MPPetals.enabled() / MPPetals.setEnabled(bool) 讀寫設定(localStorage mp-petals,'0'=關)。
   省電:花瓣 15 片、無陰影、只動 transform/opacity(交給 GPU);切到背景時暫停;系統「減少動態效果」時不播。
   可調 CSS 變數:--pt-c1/--pt-c2 顏色、--pt-k 速度倍率、--pt-d 大小倍率、--pt-o 透明度。 */
(function(w){
  var CSS=''+
  '.mp-petals{position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden;z-index:60;'+
    '--pt-c1:#fbcfe8;--pt-c2:#f472b6;--pt-k:1;--pt-d:1;--pt-o:.9}'+
  '.mp-petals.mp-pause *{-webkit-animation-play-state:paused!important;animation-play-state:paused!important}'+
  '.mp-petals b{position:absolute;top:-6vh;display:block;width:var(--sw);'+                                   /* 外層:左右搖擺 */
    '-webkit-animation:mp-pt-s var(--s) ease-in-out infinite alternate;animation:mp-pt-s var(--s) ease-in-out infinite alternate;'+
    '-webkit-animation-delay:var(--dl);animation-delay:var(--dl)}'+
  '.mp-petals i{display:block;width:calc(var(--sz) * var(--pt-d));height:calc(var(--sz) * var(--pt-d));opacity:var(--pt-o);'+ /* 內層:落下+3D翻轉 */
    'border-radius:150% 0 150% 0;background:linear-gradient(135deg,var(--pt-c1),var(--pt-c2));will-change:transform;'+
    '-webkit-animation:mp-pt-f var(--t) linear infinite;animation:mp-pt-f var(--t) linear infinite;'+
    '-webkit-animation-delay:var(--dl);animation-delay:var(--dl)}'+
  '.mp-petals b:nth-child(odd) i{border-radius:0 150% 0 150%}'+
  '@-webkit-keyframes mp-pt-f{from{-webkit-transform:translate3d(0,0,0) rotate3d(1,1,0,0deg)}to{-webkit-transform:translate3d(0,115vh,0) rotate3d(1,1,0,720deg)}}'+
  '@keyframes mp-pt-f{from{transform:translate3d(0,0,0) rotate3d(1,1,0,0deg)}to{transform:translate3d(0,115vh,0) rotate3d(1,1,0,720deg)}}'+
  '@-webkit-keyframes mp-pt-s{from{-webkit-transform:translate3d(-100%,0,0)}to{-webkit-transform:translate3d(100%,0,0)}}'+   /* 擺幅=外層寬度(--sw),keyframes 內不用變數,舊 Safari 也穩 */
  '@keyframes mp-pt-s{from{transform:translate3d(-100%,0,0)}to{transform:translate3d(100%,0,0)}}'+
  '@media (prefers-reduced-motion:reduce){.mp-petals{display:none}}';
  // 取自參考設計的前 15 片(位置/週期/延遲/大小/擺幅),週期已含速度 1x
  var P=[[0.0,17.9,-4.9,12.2,42.1],[63.4,10.7,-17.4,20.7,26.3],[87.4,18.5,-11.2,16.3,37.6],[30.7,15.3,-6.8,20.4,67.1],[36.9,12.2,-18.3,21.3,31.6],
         [18.5,10.5,-15.4,13.6,62.6],[5.4,15.4,-11.0,11.1,39.4],[44.2,18.4,-5.6,17.3,23.7],[87.0,12.3,-15.9,11.8,53.3],[19.8,17.9,-18.5,22.0,30.1],
         [72.6,10.2,-9.2,11.2,60.4],[32.6,14.1,-9.9,10.1,53.2],[80.5,12.0,-14.3,10.4,40.6],[73.5,17.1,-19.8,18.4,32.2],[54.0,14.0,-4.1,16.1,64.5]];
  var el=null,css=null;
  function onVis(){if(el)el.classList[document.hidden?'add':'remove']('mp-pause');}
  function enabled(){try{return localStorage.getItem('mp-petals')!=='0';}catch(e){return true;}}
  function on(opt){
    if(el)return;opt=opt||{};
    if(!css){css=document.createElement('style');css.id='mp-petals-css';css.textContent=CSS;document.head.appendChild(css);}
    var k=opt.speed||1,h='';
    for(var i=0;i<P.length;i++){var p=P[i];
      h+='<b style="left:'+p[0]+'%;--s:'+(p[1]/4/k).toFixed(2)+'s;--dl:'+p[2]+'s;--sw:'+p[4]+'px"><i style="--t:'+(p[1]/k).toFixed(2)+'s;--sz:'+p[3]+'px;--dl:'+p[2]+'s"></i></b>';}
    el=document.createElement('div');el.className='mp-petals';el.setAttribute('aria-hidden','true');el.innerHTML=h;
    if(opt.opacity!=null)el.style.setProperty('--pt-o',opt.opacity);if(opt.scale!=null)el.style.setProperty('--pt-d',opt.scale);
    document.body.appendChild(el); // 疊在最上層,pointer-events:none 不擋點擊
    document.addEventListener('visibilitychange',onVis);onVis();
  }
  function off(){if(!el)return;document.removeEventListener('visibilitychange',onVis);if(el.parentNode)el.parentNode.removeChild(el);el=null;}
  function setEnabled(v){try{localStorage.setItem('mp-petals',v?'1':'0');}catch(e){}if(!v)off();}
  w.MPPetals={on:on,off:off,enabled:enabled,setEnabled:setEnabled};
})(window);
/* 流動背景(Mesh gradient):5 團柔和色塊慢慢漂移、互相融合。放在所有內容後面(z-index:-1)。
   省電/相容:用 radial-gradient 代替 mask、混色在 JS 先算好(不用 color-mix)、只動 transform。
   MPMesh.on({c1,c2,c3,speed,scale,opacity}) / MPMesh.off() */
(function(w){
  var CSS='.mp-mesh{position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden;z-index:-1}'+
  '.mp-mesh.mp-pause *{-webkit-animation-play-state:paused!important;animation-play-state:paused!important}'+
  '.mp-mesh i{position:absolute;display:block;width:calc(90vmax * var(--d,1));height:calc(90vmax * var(--d,1));opacity:var(--o,1);will-change:transform;'+
    '-webkit-animation:mp-mesh-a var(--t) ease-in-out infinite alternate;animation:mp-mesh-a var(--t) ease-in-out infinite alternate}'+
  '.mp-mesh i:nth-child(1){left:-25vmax;top:-30vmax}'+
  '.mp-mesh i:nth-child(2){right:-25vmax;top:5vh;-webkit-animation-name:mp-mesh-b;animation-name:mp-mesh-b}'+
  '.mp-mesh i:nth-child(3){left:5vw;bottom:-45vmax;-webkit-animation-name:mp-mesh-c;animation-name:mp-mesh-c}'+
  '.mp-mesh i:nth-child(4){right:-10vw;bottom:-30vmax;-webkit-animation-direction:alternate-reverse;animation-direction:alternate-reverse}'+
  '.mp-mesh i:nth-child(5){left:30vw;top:28vh;width:calc(34vmax * var(--d,1));height:calc(34vmax * var(--d,1));-webkit-animation-name:mp-mesh-b;animation-name:mp-mesh-b}'+
  '@-webkit-keyframes mp-mesh-a{0%{-webkit-transform:translate3d(0,0,0) scale(1)}50%{-webkit-transform:translate3d(30%,20%,0) scale(1.2)}100%{-webkit-transform:translate3d(-10%,40%,0) scale(.9)}}'+
  '@keyframes mp-mesh-a{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(30%,20%,0) scale(1.2)}100%{transform:translate3d(-10%,40%,0) scale(.9)}}'+
  '@-webkit-keyframes mp-mesh-b{0%{-webkit-transform:translate3d(0,0,0) scale(1)}50%{-webkit-transform:translate3d(-35%,25%,0) scale(.85)}100%{-webkit-transform:translate3d(-10%,-20%,0) scale(1.15)}}'+
  '@keyframes mp-mesh-b{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-35%,25%,0) scale(.85)}100%{transform:translate3d(-10%,-20%,0) scale(1.15)}}'+
  '@-webkit-keyframes mp-mesh-c{0%{-webkit-transform:translate3d(0,0,0) scale(1.1)}50%{-webkit-transform:translate3d(25%,-30%,0) scale(.9)}100%{-webkit-transform:translate3d(45%,-5%,0) scale(1.2)}}'+
  '@keyframes mp-mesh-c{0%{transform:translate3d(0,0,0) scale(1.1)}50%{transform:translate3d(25%,-30%,0) scale(.9)}100%{transform:translate3d(45%,-5%,0) scale(1.2)}}'+
  '@media (prefers-reduced-motion:reduce){.mp-mesh i{-webkit-animation:none!important;animation:none!important}}'; // 減少動態:色塊停在原位(畫面一樣,只是不動)
  function hex(c){c=String(c).replace('#','');return [parseInt(c.substr(0,2),16),parseInt(c.substr(2,2),16),parseInt(c.substr(4,2),16)];}
  function mix(a,b,p){var x=hex(a),y=hex(b);return 'rgb('+[0,1,2].map(function(i){return Math.round(x[i]*p+y[i]*(1-p));}).join(',')+')';}
  function blob(c){return 'radial-gradient(closest-side,'+c+',rgba(255,255,255,0))';}
  var el=null,css=null;
  function onVis(){if(el)el.classList[document.hidden?'add':'remove']('mp-pause');}
  function on(o){o=o||{};off();
    if(!css){css=document.createElement('style');css.id='mp-mesh-css';css.textContent=CSS;document.head.appendChild(css);}
    var c1=o.c1||'#0071e3',c2=o.c2||'#8b5cf6',c3=o.c3||'#14b8a6',k=o.speed||1;
    var cols=[c1,c2,c3,mix(c1,c2,.5),mix(c3,'#ffffff',.7)],dur=[20,20,24,20,16],h='';
    for(var i=0;i<5;i++){var cc=cols[i].charAt(0)==='#'?'rgb('+hex(cols[i]).join(',')+')':cols[i];h+='<i style="background:'+blob(cc)+';--t:'+(dur[i]/k).toFixed(2)+'s"></i>';}
    el=document.createElement('div');el.className='mp-mesh';el.setAttribute('aria-hidden','true');el.innerHTML=h;
    el.style.setProperty('--o',o.opacity!=null?o.opacity:1);el.style.setProperty('--d',o.scale||1);
    var par=o.parent&&document.querySelector(o.parent);if(par){el.style.position='absolute';par.appendChild(el);}else document.body.insertBefore(el,document.body.firstChild); // parent:放進頁面自己的背景層(例如 .ch-bg)
    document.addEventListener('visibilitychange',onVis);onVis();
  }
  function off(){if(!el)return;document.removeEventListener('visibilitychange',onVis);if(el.parentNode)el.parentNode.removeChild(el);el=null;}
  w.MPMesh={on:on,off:off};
})(window);

/* MPFx:卡片效果四選一(不可同時開)。localStorage mp-fx = glow | petals | mesh | off,預設 petals(櫻花)。
   支數記錄卡片首頁、員工專區「我的」共用;設定頁呼叫 MPFx.set(v),會發 window 事件 'mp-fx' 讓頁面重新套用。
   光影(glow)是支數記錄卡片自己的 CSS,這裡只切 html.mp-fx-glow class;「我的」沒有光影,選光影時那頁不顯示效果。 */
(function(w){
  var KEY='mp-fx',OPTS=['glow','petals','mesh','off'];
  function get(){var v='';try{v=localStorage.getItem(KEY)||'';}catch(e){}return OPTS.indexOf(v)>=0?v:'petals';}
  function clear(){if(w.MPPetals)w.MPPetals.off();if(w.MPMesh)w.MPMesh.off();document.documentElement.classList.remove('mp-fx-glow');}
  function apply(o){o=o||{};clear();var v=get();
    if(v==='glow')document.documentElement.classList.add('mp-fx-glow');
    else if(v==='petals'&&w.MPPetals)w.MPPetals.on();
    else if(v==='mesh'&&w.MPMesh)w.MPMesh.on({c1:'#f9a8d4',c2:'#f472b6',c3:'#fde68a',opacity:.7,parent:o.meshParent}); // 粉色版
  }
  function set(v){if(OPTS.indexOf(v)<0)return;try{localStorage.setItem(KEY,v);}catch(e){}try{w.dispatchEvent(new Event('mp-fx'));}catch(e){}}
  w.MPFx={get:get,set:set,apply:apply,clear:clear,options:OPTS};
})(window);
