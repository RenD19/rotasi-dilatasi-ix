/* ==========================================================================
   komponen.js · KOMPONEN BERSAMA
   Dipakai oleh semua tab. Tidak berisi logika khusus satu tab.
   - PL.U        : utilitas kecil (pilih elemen, format angka)
   - PL.Bidang   : bidang koordinat (titik, bangun, garis, busur rotasi); satu instans per tab
   - PL.Plus     : maskot Plus (berbicara, menunjuk elemen atau titik bidang)
   - PL.Math     : perender rumus KaTeX dengan teks cadangan
   - PL.Langkah  : penampil langkah soal; dipakai Latihan Mandiri dan Kuis dengan opsi berbeda
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U={};
var $=U.$=function(s,r){return (r||document).querySelector(s);};
U.$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
U.esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
U.nm=CORE.nm;U.rp=CORE.rp;U.ptS=CORE.ptS;U.ineqS=CORE.ineqS;U.eqS=CORE.eqS;U.lin=CORE.lin;U.Lq=CORE.L;U.zeroS=CORE.zeroS;U.ymS=CORE.ymS;
U.frac=CORE.nm;   /* ½, ⅓, 2,5, −4 */
U.seed=function(){return Math.floor(Math.random()*2147483646)+1;};
var esc=U.esc,nm=U.nm,ptS=U.ptS,lin=U.lin,Lq=U.Lq,frac=U.frac;
var COL=PL.COL=['#1d4ed8','#c2410c','#7e22ce','#0f766e'];
function modeNow(){return document.body.dataset.mode||'belajar';}
PL.mode=modeNow;

/* ---------- PL.Bidang: bidang koordinat berskala ----------
   var b=PL.Bidang(svgEl, capEl);  b.gambar(V);  b.klik(e) → {mx,my,vx,vy};  b.tempel(c) → titik kisi
   V = {B (kotak bidang), mk:[{x,y,c,l,h}], poly:[{p:[[x,y]…],c,l:[nama titik]}], seg:[{a:[x,y],b:[x,y],c,d}],
        arc:{c:[x,y],a:[x,y],deg,col}, circ:{c:[x,y],r}, ln:[{a,b,c,col,l}], ctr:{x,y,l},
        sel:[titik terpilih], pick:titik, click:bool, cap:teks}
   Kode warna: a = asal (biru), b = bayangan (jingga), m = antara (ungu), k = hitam, g = hijau, r = merah. */
var KC={a:'#1d4ed8',b:'#c2410c',m:'#7e22ce',k:'#1b2a41',g:'#15803d',r:'#b91c1c',o:'#b45309',c:'#92400e'};
var KF={a:'rgba(29,78,216,.13)',b:'rgba(194,65,12,.16)',m:'rgba(126,34,206,.14)',k:'rgba(27,42,65,.08)',g:'rgba(21,128,61,.16)'};
var CAP_BAWAAN='Biru = asal, jingga = bayangan.';
PL.Bidang=function(svg,cap){
  var N=460,MG=30,PB=CORE.FULL,PK=(N-2*MG)/20;
  function setBox(B){PB=B;PK=(N-2*MG)/(B.x1-B.x0);}
  function sx(x){return MG+(x-PB.x0)*PK;}
  function sy(y){return N-MG-(y-PB.y0)*PK;}
  function f1(v){return (+v).toFixed(1);}
  function lineEnds(q,B){
    var pts=[],u=[],e=1e-9;
    if(q.b!==0)[B.x0,B.x1].forEach(function(x){var y=(q.c-q.a*x)/q.b;if(y>=B.y0-e&&y<=B.y1+e)pts.push([x,y]);});
    if(q.a!==0)[B.y0,B.y1].forEach(function(y){var x=(q.c-q.b*y)/q.a;if(x>=B.x0-e&&x<=B.x1+e)pts.push([x,y]);});
    pts.forEach(function(p){if(!u.some(function(r){return Math.abs(r[0]-p[0])<1e-6&&Math.abs(r[1]-p[1])<1e-6;}))u.push(p);});
    return u.length>=2?[u[0],u[1]]:null;
  }
  function polyS(poly){return poly.map(function(p){return f1(sx(p[0]))+','+f1(sy(p[1]));}).join(' ');}
  function teks(X,Y,t,col,anc){return '<text class="lbl" x="'+f1(X)+'" y="'+f1(Y)+'" text-anchor="'+(anc||'start')+'" style="fill:'+col+'">'+esc(t)+'</text>';}
  function ptLbl(p,t,col){var X=sx(p.x),Y=sy(p.y),rt=X>330,up=Y>40;return teks(rt?X-10:X+10,up?Y-10:Y+20,t,col,rt?'end':'start');}
  function warna(c){return KC[c]||KC.k;}
  function gambar(V){
    V=V||{};var B=V.B||CORE.FULL;setBox(B);
    var s='',i,g=B.g||1,lb=B.lb||g,id=svg.id;
    s+='<defs>'+['k','a','b','m'].map(function(c){return '<marker id="ar'+c+'-'+id+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="'+warna(c)+'"/></marker>';}).join('')+'</defs>';
    s+='<rect width="'+N+'" height="'+N+'" fill="#fff"/><g stroke="#dbe4f3" stroke-width="1">';
    for(i=Math.ceil(B.x0/g)*g;i<=B.x1+1e-9;i+=g)s+='<line x1="'+f1(sx(i))+'" y1="'+f1(sy(B.y0))+'" x2="'+f1(sx(i))+'" y2="'+f1(sy(B.y1))+'"/>';
    for(i=Math.ceil(B.y0/g)*g;i<=B.y1+1e-9;i+=g)s+='<line x1="'+f1(sx(B.x0))+'" y1="'+f1(sy(i))+'" x2="'+f1(sx(B.x1))+'" y2="'+f1(sy(i))+'"/>';
    s+='</g>';
    s+='<line x1="'+f1(sx(B.x0)-4)+'" y1="'+f1(sy(0))+'" x2="'+f1(sx(B.x1)+14)+'" y2="'+f1(sy(0))+'" stroke="#1b2a41" stroke-width="2" marker-end="url(#ark-'+id+')"/>';
    s+='<line x1="'+f1(sx(0))+'" y1="'+f1(sy(B.y0)+4)+'" x2="'+f1(sx(0))+'" y2="'+f1(sy(B.y1)-14)+'" stroke="#1b2a41" stroke-width="2" marker-end="url(#ark-'+id+')"/>';
    s+='<text class="lbl" x="'+f1(sx(B.x1)+10)+'" y="'+f1(sy(0)+20)+'" style="font-style:italic">x</text><text class="lbl" x="'+f1(sx(0)+9)+'" y="'+f1(sy(B.y1)-4)+'" style="font-style:italic">y</text>';
    for(i=Math.ceil(B.x0/lb)*lb;i<=B.x1-1e-9;i+=lb){if(i===0)continue;s+='<text class="tick" x="'+f1(sx(i))+'" y="'+f1(sy(0)+16)+'" text-anchor="middle">'+nm(i)+'</text>';}
    for(i=Math.ceil(B.y0/lb)*lb;i<=B.y1-1e-9;i+=lb){if(i===0)continue;s+='<text class="tick" x="'+f1(sx(0)-6)+'" y="'+f1(sy(i)+4)+'" text-anchor="end">'+nm(i)+'</text>';}
    s+='<text class="tick" x="'+f1(sx(0)-6)+'" y="'+f1(sy(0)+16)+'" text-anchor="end">0</text>';
    /* lingkaran lintasan */
    if(V.circ){var cc=V.circ;s+='<circle cx="'+f1(sx(cc.c[0]))+'" cy="'+f1(sy(cc.c[1]))+'" r="'+f1(cc.r*PK)+'" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 6"/>';}
    /* bangun */
    (V.poly||[]).forEach(function(P){
      var col=warna(P.c);
      s+='<polygon points="'+polyS(P.p)+'" fill="'+(KF[P.c]||KF.k)+'" stroke="'+col+'" stroke-width="3" stroke-linejoin="round"/>';
      P.p.forEach(function(q,j){
        s+='<circle cx="'+f1(sx(q[0]))+'" cy="'+f1(sy(q[1]))+'" r="4.5" fill="'+col+'" stroke="#fff" stroke-width="1.5"/>';
        if(P.l&&P.l[j]){
          /* label di luar bangun: menjauh dari titik tengah */
          var cx=0,cy=0;P.p.forEach(function(r){cx+=r[0];cy+=r[1];});cx/=P.p.length;cy/=P.p.length;
          var dx=q[0]-cx,dy=q[1]-cy,L=Math.sqrt(dx*dx+dy*dy)||1,X=sx(q[0])+dx/L*15,Y=sy(q[1])-dy/L*15+5;
          s+=teks(X,Y,P.l[j],col,'middle');
        }
      });
    });
    /* garis */
    (V.ln||[]).forEach(function(Ln){
      var e=lineEnds(Ln,B);if(!e)return;var col=warna(Ln.col);
      s+='<line x1="'+f1(sx(e[0][0]))+'" y1="'+f1(sy(e[0][1]))+'" x2="'+f1(sx(e[1][0]))+'" y2="'+f1(sy(e[1][1]))+'" stroke="'+col+'" stroke-width="3.5" stroke-linecap="round"'+(Ln.d?' stroke-dasharray="10 7"':'')+'/>';
      if(Ln.l){
        var E=e[0][1]>e[1][1]||(e[0][1]===e[1][1]&&e[0][0]>e[1][0])?e[0]:e[1],O=E===e[0]?e[1]:e[0];
        var lx=sx(E[0]+0.08*(O[0]-E[0])),ly=sy(E[1]+0.08*(O[1]-E[1])),rt=lx>300;
        s+=teks(rt?lx-6:lx+7,ly+(ly<30?16:-6),Ln.l,col,rt?'end':'start');
      }
    });
    /* ruas bantu */
    (V.seg||[]).forEach(function(G){
      s+='<line x1="'+f1(sx(G.a[0]))+'" y1="'+f1(sy(G.a[1]))+'" x2="'+f1(sx(G.b[0]))+'" y2="'+f1(sy(G.b[1]))+'" stroke="'+warna(G.c)+'" stroke-width="2"'+(G.d?' stroke-dasharray="5 5"':'')+' opacity=".75"/>';
    });
    /* busur rotasi: dari titik a, mengelilingi pusat c sejauh deg (positif = berlawanan arah jarum jam) */
    if(V.arc){
      var A=V.arc,C=A.c,dx0=A.a[0]-C[0],dy0=A.a[1]-C[1],r=Math.sqrt(dx0*dx0+dy0*dy0);
      if(r>0){
        var a0=Math.atan2(dy0,dx0),tot=A.deg*Math.PI/180,n=Math.max(12,Math.ceil(Math.abs(A.deg)/6)),d='',rr=Math.max(r*0.55,Math.min(r,1.6));
        for(i=0;i<=n;i++){var t=a0+tot*i/n;d+=(i?'L':'M')+f1(sx(C[0]+rr*Math.cos(t)))+' '+f1(sy(C[1]+rr*Math.sin(t)));}
        var ac=A.col||'k';
        s+='<path d="'+d+'" fill="none" stroke="'+warna(ac)+'" stroke-width="2.5" marker-end="url(#ar'+ac+'-'+id+')"/>';
        var tm=a0+tot/2,lr=rr*PK+16;
        s+=teks(sx(C[0])+lr*Math.cos(tm),sy(C[1])-lr*Math.sin(tm)+5,Math.abs(A.deg)+'°'+(A.deg<0?' ↻':''),warna(ac),'middle');
      }
    }
    /* pusat */
    if(V.ctr){var Ct=V.ctr,X0=sx(Ct.x),Y0=sy(Ct.y);
      s+='<rect x="'+f1(X0-5)+'" y="'+f1(Y0-5)+'" width="10" height="10" fill="#1b2a41" stroke="#fff" stroke-width="2" transform="rotate(45 '+f1(X0)+' '+f1(Y0)+')"/>';
      if(Ct.l&&!(Ct.x===0&&Ct.y===0&&Ct.l==='O'))s+=ptLbl(Ct,Ct.l,'#1b2a41');}
    /* titik */
    (V.mk||[]).forEach(function(m){
      var col=warna(m.c),X=sx(m.x),Y=sy(m.y);
      s+='<circle cx="'+f1(X)+'" cy="'+f1(Y)+'" r="'+(m.h?6:5.5)+'" fill="'+(m.h?'#fff':col)+'" stroke="'+(m.h?col:'#fff')+'" stroke-width="'+(m.h?3:2)+'"/>';
      if(m.l)s+=ptLbl(m,m.l,col);
    });
    /* titik yang dipilih siswa (langkah pilih beberapa titik) */
    (V.sel||[]).forEach(function(p){
      var X=sx(p.x),Y=sy(p.y);
      s+='<circle cx="'+f1(X)+'" cy="'+f1(Y)+'" r="13" fill="rgba(245,158,11,.22)" stroke="#f59e0b" stroke-width="3"/><circle cx="'+f1(X)+'" cy="'+f1(Y)+'" r="5" fill="#b45309" stroke="#fff" stroke-width="2"/>'+ptLbl(p,ptS(p),'#b45309');
    });
    if(V.pick){var P=V.pick,X2=sx(P.x),Y2=sy(P.y);s+='<circle cx="'+f1(X2)+'" cy="'+f1(Y2)+'" r="14" fill="rgba(245,158,11,.25)" stroke="#f59e0b" stroke-width="3"/><circle cx="'+f1(X2)+'" cy="'+f1(Y2)+'" r="5.5" fill="#b45309" stroke="#fff" stroke-width="2"/>'+ptLbl(P,ptS(P),'#b45309');}
    svg.innerHTML=s;
    svg.classList.toggle('pickable',!!V.click);
    if(cap)cap.innerHTML=esc(V.cap||CAP_BAWAAN)+(V.click?' <b>Ketuk bidang untuk memilih titik.</b>':'');
  }
  return {
    gambar:gambar,
    /* posisi klik → koordinat bidang */
    klik:function(e){var r=svg.getBoundingClientRect();var vx=(e.clientX-r.left)/r.width*N,vy=(e.clientY-r.top)/r.height*N;return {vx:vx,vy:vy,mx:PB.x0+(vx-MG)/PK,my:PB.y0+(N-MG-vy)/PK};},
    /* titik kisi terdekat */
    tempel:function(c){var g=PB.g||1,x=Math.round(c.mx/g)*g,y=Math.round(c.my/g)*g;return {x:Math.max(PB.x0,Math.min(PB.x1,x))+0,y:Math.max(PB.y0,Math.min(PB.y1,y))+0};},
    /* koordinat bidang → piksel di layar (untuk penunjuk Plus) */
    layar:function(x,y){var mm=svg.getScreenCTM();if(!mm)return null;var p=svg.createSVGPoint();p.x=sx(x);p.y=sy(y);p=p.matrixTransform(mm);return {x:p.x,y:p.y};},
    vx:sx,vy:sy,svg:svg,N:N
  };
};
/* ---------- Maskot "Plus" ---------- */
/* Tampilan maskot (SVG) disisipkan di sini agar index.html dan kuis.html tidak perlu
   memuat salinan yang sama. Harus terjadi sebelum #plusToggle diberi perilaku di bawah. */
if(!$('#plusWrap'))document.body.insertAdjacentHTML('beforeend',''
  +'<div id="plusWrap" data-mood="normal">'
  +'<div id="plusBubble" role="status" aria-live="polite"></div>'
  +'<div id="plusBody">'
  +'<svg viewBox="0 0 140 130" aria-hidden="true" focusable="false">'
  +'<ellipse cx="70" cy="122" rx="30" ry="4" fill="#1b2a41" opacity=".13"/>'
  +'<g id="plusChar">'
  +'<g id="armL"><line x1="30" y1="64" x2="15" y2="85" stroke="#1d4ed8" stroke-width="6" stroke-linecap="round"/><circle cx="15" cy="85" r="7.5" fill="#e0ecff" stroke="#1d4ed8" stroke-width="3"/></g>'
  +'<g id="armR"><line x1="110" y1="64" x2="125" y2="85" stroke="#1d4ed8" stroke-width="6" stroke-linecap="round"/><circle cx="125" cy="85" r="7.5" fill="#e0ecff" stroke="#1d4ed8" stroke-width="3"/></g>'
  +'<polygon points="49,34 91,34 91,51 108,51 108,93 91,93 91,110 49,110 49,93 32,93 32,51 49,51" fill="#1d4ed8" stroke="#1d4ed8" stroke-width="8" stroke-linejoin="round"/>'
  +'<circle cx="47" cy="82" r="4.5" fill="#f9a8d4" opacity=".75"/><circle cx="93" cy="82" r="4.5" fill="#f9a8d4" opacity=".75"/>'
  +'<g class="eye"><circle cx="59" cy="70" r="9" fill="#fff"/><circle cx="59" cy="71.5" r="4.8" fill="#1b2a41"/><circle cx="60.8" cy="69.5" r="1.5" fill="#fff"/></g>'
  +'<g class="eye"><circle cx="81" cy="70" r="9" fill="#fff"/><circle cx="81" cy="71.5" r="4.8" fill="#1b2a41"/><circle cx="82.8" cy="69.5" r="1.5" fill="#fff"/></g>'
  +'<path class="eyeH" d="M51 72Q59 61 67 72M73 72Q81 61 89 72" stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none"/>'
  +'<path class="brow" d="M50 58L68 53M72 53L90 58" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none"/>'
  +'<path class="mN" d="M63 82Q70 90 77 82" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none"/>'
  +'<path class="mH" d="M62 80Q70 97 78 80Z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>'
  +'<path class="mS" d="M63 88Q70 80 77 88" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none"/>'
  +'</g>'
  +'</svg>'
  +'<div id="plusConf"></div>'
  +'</div>'
  +'</div>'
  +'<button id="plusToggle" type="button" title="Sembunyikan Plus" aria-label="Sembunyikan Plus">✕</button>');
var PLUS={
  benar:['Hebat! Kamu benar!','Mantap, lanjut terus!','Tepat sekali! Keren!','Yeay, jawabanmu benar!','Pintar! Pertahankan ya!'],
  salah:['Belum tepat, coba lagi ya!','Tenang, kamu pasti bisa!','Hampir! Ayo coba sekali lagi!','Salah itu bagian belajar!','Jangan menyerah, semangat!'],
  sapaL:['Halo! Aku Plus, ayo berputar dan membesar!','Hai! Pilih soal, lalu mulai ya!'],
  sapaP:['Siap kuis? Semangat ya!','Ayo, kamu pasti bisa!'],
  petunjuk:['Baca petunjuk di panel ya!','Petunjuknya ada di sini, lho!'],
  selesai:['Yeay, soal ini selesai!','Kerja bagus! Kamu hebat!','Keren! Satu soal tuntas!']
};
var plusTb=null,plusTa=null;
function plusReduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
function plusPick(a){return a[Math.floor(Math.random()*a.length)];}
/* pesan pengarah (hanya Latihan Mandiri): sejalan dengan petunjuk yang sudah ada, tanpa membocorkan jawaban */
/* pesan pengarah: disediakan oleh tab yang aktif (PL.Plus.panduan) */
function plusGuide(){return PL.Plus.panduan?PL.Plus.panduan():plusPick(PLUS.salah);}
function plusSay(text){
  var b=$('#plusBubble');if(!b)return;
  b.textContent=text;b.classList.add('show');
  clearTimeout(plusTb);plusTb=setTimeout(function(){b.classList.remove('show');},4800);
}
function plusState(mood,act,ms){
  var w=$('#plusWrap');if(!w)return;
  w.removeAttribute('data-act');void w.offsetWidth;
  w.setAttribute('data-mood',mood);
  if(act)w.setAttribute('data-act',act);
  clearTimeout(plusTa);
  plusTa=setTimeout(function(){w.removeAttribute('data-act');w.setAttribute('data-mood','normal');},ms);
}
function plusConfetti(){
  if(plusReduced())return;
  var box=$('#plusConf');if(!box)return;
  var cols=['#f59e0b','#15803d','#c2410c','#7e22ce','#1d4ed8','#ec4899'];
  for(var i=0;i<16;i++){
    var p=document.createElement('i'),a=-Math.PI*(0.12+0.76*Math.random()),r=50+Math.random()*45;
    p.style.setProperty('--dx',Math.round(Math.cos(a)*r)+'px');
    p.style.setProperty('--dy',Math.round(Math.sin(a)*r)+'px');
    p.style.setProperty('--rot',Math.round(Math.random()*540-270)+'deg');
    p.style.background=cols[i%cols.length];
    p.style.animationDelay=(Math.random()*.15)+'s';
    box.appendChild(p);
    (function(el){setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},1800);})(p);
  }
}
/* jenis: 'sapa' | 'benar' | 'salah' | 'petunjuk' | 'selesai' | 'skor' (extra = persen) */
function mascotSay(kind,extra){
  if(!$('#plusWrap')||document.body.classList.contains('plus-off'))return;
  var learn=modeNow()==='latihan',msg,mood='normal',act='',ms=1500;
  if(kind==='benar'){msg=plusPick(PLUS.benar);mood='happy';act='cheer';ms=1500;}
  else if(kind==='salah'){msg=(learn&&Math.random()<.6)?plusGuide():plusPick(PLUS.salah);mood='sad';act='shake';ms=1200;}
  else if(kind==='petunjuk'){msg=plusPick(PLUS.petunjuk);act='point';ms=1900;}
  else if(kind==='selesai'){msg=plusPick(PLUS.selesai);mood='happy';act='spin';ms=1700;plusConfetti();}
  else if(kind==='skor'){
    if(extra>=70){msg='Luar biasa! Skor kamu tinggi!';mood='happy';act='spin';ms=1700;plusConfetti();}
    else{msg='Tidak apa-apa, ayo coba lagi!';act='wave';ms=2300;}
  }else{msg=plusPick(modeNow()!=='kuis'?PLUS.sapaL:PLUS.sapaP);act='wave';ms=2300;}
  plusSay(msg);plusState(mood,act,ms);
}
function setPlusOff(off,save){
  var t=$('#plusToggle');
  document.body.classList.toggle('plus-off',off);
  t.textContent=off?'👋 Plus':'✕';
  t.title=off?'Munculkan Plus':'Sembunyikan Plus';
  t.setAttribute('aria-label',off?'Munculkan Plus':'Sembunyikan Plus');
  if(off){var b=$('#plusBubble');if(b)b.classList.remove('show');}
  if(save){try{localStorage.setItem('plusOff',off?'1':'0');}catch(_){}}
}
$('#plusToggle').onclick=function(){
  var off=!document.body.classList.contains('plus-off');
  setPlusOff(off,true);
  if(!off)mascotSay('sapa');
};
try{setPlusOff(localStorage.getItem('plusOff')==='1',false);}catch(_){}


/* ---------- Plus berpindah dan menunjuk ---------- */
var plusAt=null,plusTf=null,plusTh=null;
function fxEnsure(){
  var f=$('#plusFx');if(f)return f;
  f=document.createElementNS('http://www.w3.org/2000/svg','svg');f.id='plusFx';f.setAttribute('aria-hidden','true');
  f.innerHTML='<defs><marker id="fxArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="#f59e0b"/></marker></defs>'
    +'<rect class="ring" id="fxRing" x="0" y="0" width="0" height="0"/><path class="beam" id="fxBeam" d=""/>';
  document.body.appendChild(f);return f;
}
function exBarH(){return parseFloat(document.documentElement.style.getPropertyValue('--exbar-h'))||0;}
/* gulir otomatis: hanya sebagai respons atas aksi navigasi (plusGo), seminimal mungkin, dan di atas bar */
var plusTouch=false;
['touchstart'].forEach(function(n){document.addEventListener(n,function(){plusTouch=true;},{passive:true});});
['touchend','touchcancel'].forEach(function(n){document.addEventListener(n,function(){plusTouch=false;},{passive:true});});
function plusReveal(b){
  if(plusTouch)return;
  var m=12,vh=window.innerHeight-exBarH(),dy;
  if(b.top>=m&&b.bottom<=vh-m)return;
  dy=(b.height>vh-2*m||b.top<m)?b.top-m:b.bottom-(vh-m);
  if(dy)window.scrollBy(0,dy);
}
/* mengubah target (titik bidang, garis, atau elemen) menjadi kotak pada layar */
function plusRect(t,reveal){
  if(!t)return null;
  var rad=16,e;
  if(t.pt){
    var bd=PL.Plus.bidang;if(!bd)return null;
    rad=t.r||16;
    var scr=function(){var s2=bd.layar(t.pt[0],t.pt[1]);return s2?{x:s2.x-rad,y:s2.y-rad,w:rad*2,h:rad*2,round:true}:null;};
    var rr=scr();if(rr&&reveal){plusReveal({top:rr.y,bottom:rr.y+rr.h,height:rr.h});rr=scr();}
    return rr;
  }
  if(t.el){
    e=typeof t.el==='string'?document.querySelector(t.el):t.el;if(!e)return null;
    var r0=e.getBoundingClientRect();
    if(!r0.width&&!r0.height)return null;
    if(reveal){plusReveal({top:r0.top,bottom:r0.bottom,height:r0.height});r0=e.getBoundingClientRect();}
    return {x:r0.left-4,y:r0.top-3,w:r0.width+8,h:r0.height+6,round:false};
  }
  return null;
}
function plusFxClear(){
  var rg=$('#fxRing'),bm=$('#fxBeam');
  if(rg){rg.setAttribute('width',0);rg.setAttribute('height',0);}
  if(bm)bm.setAttribute('d','');
}
function plusPlace(reveal){
  var a=plusAt;if(!a)return;
  fxEnsure();
  var r=plusRect(a.t,reveal);
  if(!r){plusFxClear();return;}
  var rg=$('#fxRing'),bm=$('#fxBeam');
  rg.setAttribute('x',r.x);rg.setAttribute('y',r.y);rg.setAttribute('width',r.w);rg.setAttribute('height',r.h);rg.setAttribute('rx',r.round?r.w/2:10);
  bm.setAttribute('d','');
  var w=$('#plusWrap');
  if(!w||document.body.classList.contains('plus-off'))return;
  var vw=document.documentElement.clientWidth,vh=window.innerHeight-exBarH();
  var bw=$('#plusBody').offsetWidth,bh=$('#plusBody').offsetHeight,ww=w.offsetWidth,wh=w.offsetHeight;
  var hx=vw-8-ww,hy=vh-8-wh,m=16,tcx=r.x+r.w/2,tcy=r.y+r.h/2;
  var yMid=tcy-(wh-bh/2);
  var right={side:'r',X:r.x+r.w+m,Y:yMid},left={side:'l',X:r.x-m-ww,Y:yMid};
  var vc=function(side,Y){var X=side==='r'?tcx-bw/2:tcx-(ww-bw/2);X=Math.min(Math.max(4,X),vw-4-ww);return {side:side,X:X,Y:Y,cx:X+(side==='r'?bw/2:ww-bw/2)};};
  var vb=[vc('r',r.y+r.h+m),vc('l',r.y+r.h+m)],va=[vc('r',r.y-m-wh),vc('l',r.y-m-wh)];
  var byC=function(p,q){return Math.abs(p.cx-tcx)-Math.abs(q.cx-tcx);};vb.sort(byC);va.sort(byC);
  var cs=(tcx>vw/2?[left,right]:[right,left]).concat(tcy>vh/2?va.concat(vb):vb.concat(va));
  var fits=function(c){return c.X>=4&&c.Y>=4&&c.X+ww<=vw-4&&c.Y+wh<=vh-4;};
  var ex0=r.x-4,ey0=r.y-4,ew=r.w+8,eh=r.h+8;
  var clash=function(c){return !(c.X+ww<=ex0||c.X>=ex0+ew||c.Y+wh<=ey0||c.Y>=ey0+eh);};
  var pk=null,i;
  for(i=0;i<cs.length;i++)if(fits(cs[i])&&!clash(cs[i])){pk=cs[i];break;}
  if(!pk)for(i=0;i<cs.length;i++)if(fits(cs[i])){pk=cs[i];break;}
  if(!pk){pk={side:cs[0].side,X:Math.min(Math.max(4,cs[0].X),vw-4-ww),Y:Math.min(Math.max(4,cs[0].Y),vh-4-wh)};}
  w.setAttribute('data-side',pk.side);w.classList.add('go');
  w.style.transform='translate('+Math.round(pk.X-hx)+'px,'+Math.round(pk.Y-hy)+'px)';
  var S={x:pk.X+(pk.side==='r'?bw/2:ww-bw/2),y:pk.Y+wh-bh/2},C={x:tcx,y:tcy};
  clearTimeout(plusTf);
  plusTf=setTimeout(function(){
    if(!plusAt)return;
    var dx=C.x-S.x,dy=C.y-S.y,L=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/L,uy=dy/L;
    var t1=Math.min((r.w/2+6)/(Math.abs(ux)||1e-6),(r.h/2+6)/(Math.abs(uy)||1e-6));
    var s0=bw*.42;if(L<=s0+t1+8){bm.setAttribute('d','');return;}
    bm.setAttribute('d','M'+(S.x+ux*s0)+' '+(S.y+uy*s0)+' L'+(C.x-ux*t1)+' '+(C.y-uy*t1));
  },plusReduced()?0:680);
}
function plusGo(t,text,auto){
  plusAt={t:t};clearTimeout(plusTh);
  if(text){var b=$('#plusBubble');if(b){b.textContent=text;b.classList.add('show');clearTimeout(plusTb);}}
  plusPlace(true);
  if(!document.body.classList.contains('plus-off'))plusState('normal','point',1900);
  if(auto)plusTh=setTimeout(plusHome,auto);
}
function plusHome(){
  plusAt=null;clearTimeout(plusTf);clearTimeout(plusTh);
  var w=$('#plusWrap');if(w){w.style.transform='';w.removeAttribute('data-side');}
  plusFxClear();
  var b=$('#plusBubble');if(b)b.classList.remove('show');
}
var plusRaf=0;
function plusRefresh(){if(!plusAt||plusRaf)return;plusRaf=requestAnimationFrame(function(){plusRaf=0;plusPlace();});}
var MQ_SMALL=window.matchMedia?window.matchMedia('not all and (min-width:860px) and (min-height:500px)'):null;
function barSync(){if(PL.barSync)PL.barSync();}
window.addEventListener('resize',barSync);
window.addEventListener('resize',plusRefresh);
if(MQ_SMALL&&MQ_SMALL.addEventListener)MQ_SMALL.addEventListener('change',function(){barSync();plusRefresh();});
window.addEventListener('scroll',plusRefresh,{passive:true});
document.addEventListener('scroll',plusRefresh,{passive:true,capture:true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')plusHome();});

var MATH_FB=(typeof WeakMap==='function')?new WeakMap():null;
var MATH_OPT={throwOnError:false,displayMode:false,output:'htmlAndMathml',strict:'ignore',trust:false};
var MATH_CSS_OK=false;
function mathCss(){
  var l=document.getElementById('katexCss'),okc=MATH_CSS_OK;
  if(!l||!l.sheet)return false;
  try{okc=l.sheet.cssRules.length>0;}catch(e){}
  if(!okc)return false;
  if(l.media!=='all')l.media='all';
  return true;
}
function mathReady(){return !!(MATH_FB&&window.katex&&typeof window.katex.render==='function'&&mathCss());}
function renderMath(root){
  if(!root||!mathReady())return 0;
  var list=[].slice.call(root.querySelectorAll?root.querySelectorAll('[data-tex]'):[]);
  if(root.nodeType===1&&root.hasAttribute('data-tex'))list.unshift(root);
  var c=0;
  list.forEach(function(el){
    if(el.querySelector('.katex'))return;
    var tex=el.getAttribute('data-tex'),tmp;
    try{
      tmp=document.createElement('span');
      window.katex.render(tex,tmp,MATH_OPT);
      if(!tmp.querySelector('.katex')||tmp.querySelector('.katex-error'))return;
    }catch(e){return;}
    MATH_FB.set(el,el.innerHTML);
    el.innerHTML='';
    while(tmp.firstChild)el.appendChild(tmp.firstChild);
    c++;
  });
  if(c){plusRefresh();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(plusRefresh);}
  return c;
}
function mathBoot(){if(mathReady())renderMath(document);}
['katexJs','katexCss'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('load',function(){if(id==='katexCss')MATH_CSS_OK=true;mathBoot();});});
window.addEventListener('load',mathBoot);
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',plusRefresh);

PL.Plus={panduan:null,bidang:null,say:mascotSay,ucap:plusSay,go:plusGo,home:plusHome,refresh:plusRefresh,aktif:function(){return !!plusAt;}};
PL.Math={render:renderMath};

/* ---------- PL.Langkah: penampil langkah soal ----------
   var L=PL.Langkah(sectionEl,{petunjuk:bool, diManaSalah:bool, periksa:fn(a,r), aksi:fn(nama,tombol), meta:fn(),
                               pratinjau:bool, ubahPetunjuk:fn(teks), petunjukLanjut:fn(Q,s,St), gerbangPetunjuk:n})
   pratinjau    : tampilkan "Persamaanmu" (rumus KaTeX) di samping isian a, b, c
   ubahPetunjuk : mengubah teks petunjuk sebelum ditampilkan (CORE tidak ikut berubah)
   Bentuk langkah dari CORE: form (isian pg, num, eq; lay 'koor' = pasangan koordinat), pt (ketuk satu titik),
   pts (ketuk beberapa titik; ketuk lagi untuk membatalkan).
   Wadah di dalam section: .meta .ask (kartu soal), .prog .steptext (progres), .panel, svg.bidang, .cap
   Semua tombol memakai data-aksi; satu pendengar klik per panel (event delegation). */
/* bilangan untuk isian: bulat → "3"; desimal pendek → "2,5"; pecahan berulang → "−1/3" */
function teksIsian(v){
  if(Math.floor(v)===v)return String(v).replace('-','−');
  for(var d=2;d<=12;d++){var n=v*d;if(Math.abs(n-Math.round(n))<1e-9){var dec=String(Math.round(v*1000)/1000);
    if(Math.abs(+dec-v)<1e-9)return dec.replace('.',',').replace('-','−');return (n<0?'−':'')+Math.abs(Math.round(n))+'/'+d;}}
  return String(Math.round(v*1000)/1000).replace('.',',').replace('-','−');
}
U.teksIsian=teksIsian;
PL.Langkah=function(sec,opsi){
  var q=function(s){return sec.querySelector(s);};
  var el={meta:q('.meta'),ask:q('.ask'),prog:q('.prog'),stepText:q('.steptext'),panel:q('.panel'),svg:q('svg.bidang'),cap:q('.cap')};
  var bidang=PL.Bidang(el.svg,el.cap);
  var S={Q:null,s:0,ans:[],lock:[],pt:null,sel:[],tries:0,solved:false,hints:0,lw:null,tahap:'kerja',selesai:false};
  var pq=function(s){return el.panel.querySelector(s);};
  function curS(){return S.Q&&S.Q.st[S.s];}
  function reset(){
    var St=curS();S.ans=[];S.lock=[];S.pt=null;S.sel=[];S.tries=0;S.solved=false;S.hints=0;S.lw=null;
    if(St&&St.k==='form')St.it.forEach(function(it){S.ans.push(it.t==='eq'?['','','']:it.t==='num'?'':null);S.lock.push(false);});
  }
  function muat(Q,s){S.Q=Q;S.s=s||0;reset();}

  /* ---- membaca jawaban ---- */
  function parseNum(s,isRp){
    s=String(s==null?'':s).trim().replace(/[−–]/g,'-').replace(/\s/g,'');
    if(isRp)s=s.replace(/^rp/i,'');
    if(isRp||/^-?\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
    s=s.replace(/,/g,'.');
    var m=/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(s);   /* pecahan, mis. -1/3 */
    if(m){var d=+m[2];return d===0?NaN:(+m[1])/d;}
    if(!/^-?\d+(\.\d+)?$/.test(s))return NaN;
    return +s;
  }
  function collect(){
    var St=curS();
    if(St.k==='pt')return S.pt?{x:S.pt.x,y:S.pt.y}:null;
    if(St.k==='pts')return S.sel.length?S.sel.map(function(p){return {x:p.x,y:p.y};}):null;
    var out=[],bad=false;
    St.it.forEach(function(it,i){
      var a=S.ans[i];
      if(it.t==='pg'){if(a===null)bad=true;out.push(a);}
      else if(it.t==='num'){var v=parseNum(a,it.u==='rp');if(isNaN(v))bad=true;out.push(v);}
      else{var arr=a.slice(0,3).map(function(x){return parseNum(x,false);});if(arr.some(isNaN))bad=true;out.push(arr);}
    });
    return bad?null:out;
  }

  /* ---- tampilan langkah ---- */
  function optKind(o){var m=Math.max.apply(null,o.map(function(x){return x.length;}));return m<=3?'op':m<=40?'seg':'sol';}
  function inpNum(i,aria,extra){
    var lk=S.lock[i],dis=lk||S.solved?' disabled':'',it=curS().it[i];
    return '<input class="num vin'+(lk?' ok':'')+(extra||'')+'" data-i="'+i+'" inputmode="text" autocomplete="off" spellcheck="false" value="'+esc(S.ans[i])+'"'+dis+' aria-label="'+esc(aria||it.lab)+'">';
  }
  function itemHTML(it,i,St){
    var lk=S.lock[i],dis=lk||S.solved?' disabled':'',a=S.ans[i];
    if(it.t==='pg'){
      var kind=optKind(it.o),b='';
      it.o.forEach(function(o,j){
        var on=a===j;
        if(kind==='op')b+='<button class="btn relb opb'+(on?' sel':'')+'" data-i="'+i+'" data-j="'+j+'"'+dis+'>'+esc(o)+'</button> ';
        else if(kind==='seg')b+='<button class="segb'+(on?' on':'')+'" data-i="'+i+'" data-j="'+j+'"'+dis+'>'+esc(o)+'</button>';
        else b+='<button class="sol'+(on?' on':'')+'" data-i="'+i+'" data-j="'+j+'"'+dis+'>'+esc(o)+'</button>';
      });
      return '<div class="trow'+(lk?' ok':'')+'" data-i="'+i+'"><p>'+esc(it.lab)+'</p><div class="'+(kind==='sol'?'sols':'seg')+'">'+b+'</div></div>';
    }
    if(it.t==='num'){
      return '<div class="trow'+(lk?' ok':'')+'" data-i="'+i+'"><label class="nrow"><span>'+esc(it.lab)+'</span> <span class="nin">'+(it.u==='rp'?'Rp ':'')+inpNum(i)+(it.u&&it.u!=='rp'?' <span class="sat">'+esc(it.u)+'</span>':'')+'</span></label></div>';
    }
    var inp=function(j,ph){return '<input class="num" data-i="'+i+'" data-j="'+j+'" inputmode="text" autocomplete="off" value="'+esc(a[j])+'" placeholder="'+ph+'"'+dis+' aria-label="'+ph+'">';};
    var baris='<div class="eqin">'+inp(0,'a')+'<i>x</i> + '+inp(1,'b')+'<i>y</i> <b>=</b> '+inp(2,'c')+'</div>';
    if(opsi.pratinjau)baris='<div class="eqwrap">'+baris+'<div class="pratinjau" data-pr="'+i+'"><small>Persamaanmu</small><span class="pr-isi"></span></div></div>';
    return '<div class="trow'+(lk?' ok':'')+'" data-i="'+i+'"><p>'+esc(it.lab)+'</p>'+baris+'</div>';
  }
  /* pasangan koordinat: label ( x , y ) */
  function koorHTML(St){
    var h='';
    for(var i=0;i+1<St.it.length;i+=2){
      var ok=S.lock[i]&&S.lock[i+1];
      h+='<div class="trow koor'+(ok?' ok':'')+'" data-i="'+i+'" data-k="'+i+'"><span class="klab">'+esc(St.it[i].lab)+'</span>'
        +'<span class="kin"><span class="kur">(</span>'+inpNum(i,St.it[i].lab+', nilai x')+'<span class="kom">,</span>'+inpNum(i+1,St.it[i].lab+', nilai y')+'<span class="kur">)</span></span></div>';
    }
    return h;
  }
  function selText(){return S.sel.length?'Titik yang dipilih: <b>'+S.sel.map(ptS).join(', ')+'</b>':'<span class="muted">Belum ada titik yang dipilih.</span>';}
  /* ---- pratinjau "Persamaanmu": isian a, b, c ditampilkan sebagai rumus (aktif bila opsi.pratinjau) ---- */
  function bentukPratinjau(a){
    var bag=[0,1,2].map(function(j){var s=String(a[j]==null?'':a[j]).trim();if(s==='')return {k:'kosong'};var v=parseNum(s,false);return isNaN(v)?{k:'salah'}:{k:'ok',v:v};});
    var angT=function(v){return teksIsian(Math.abs(v)).replace(',','{,}');},angP=function(v){return teksIsian(Math.abs(v));};
    var KOSONG_T='\\square',SALAH_T='{\\color{#b91c1c}?}';
    var tex='',teks='',ada=false;
    function suku(p,vr){
      if(p.k==='ok'&&p.v===0)return;
      var neg=p.k==='ok'&&p.v<0,satu=p.k==='ok'&&Math.abs(p.v)===1;
      var kT=p.k==='kosong'?KOSONG_T+' ':p.k==='salah'?SALAH_T:satu?'':angT(p.v);
      var kP=p.k==='kosong'?'□':p.k==='salah'?'?':satu?'':angP(p.v);
      if(!ada){tex+=(neg?'-':'')+kT+vr;teks+=(neg?'−':'')+kP+vr;}
      else{tex+=(neg?' - ':' + ')+kT+vr;teks+=(neg?' − ':' + ')+kP+vr;}
      ada=true;
    }
    suku(bag[0],'x');suku(bag[1],'y');
    if(!ada){tex='0';teks='0';}
    var c=bag[2];
    var cT=c.k==='kosong'?KOSONG_T:c.k==='salah'?SALAH_T:(c.v<0?'-':'')+angT(c.v);
    var cP=c.k==='kosong'?'□':c.k==='salah'?'?':(c.v<0?'−':'')+angP(c.v);
    return {tex:tex+' = '+cT,teks:teks+' = '+cP};
  }
  function pratinjau(i){
    if(!opsi.pratinjau)return;
    var St=curS(),it=St&&St.it&&St.it[i],box=pq('.pratinjau[data-pr="'+i+'"] .pr-isi');
    if(!box||!it||it.t!=='eq')return;
    var b=bentukPratinjau(S.ans[i]);
    box.textContent=b.teks;
    box.setAttribute('data-tex',b.tex);
    PL.Math.render(box);
  }
  function pratinjauSemua(){var St=curS();if(!opsi.pratinjau||!St||St.k!=='form')return;St.it.forEach(function(it,i){pratinjau(i);});}
  function panelLangkah(){
    var St=curS(),h='';
    h+='<h2>Langkah '+(S.s+1)+' · '+esc(St.nm)+'</h2><p>'+St.q+'</p>';
    if(St.k==='form'){
      if(St.lay==='koor')h+=koorHTML(St);
      else h+=St.it.map(function(it,i){return itemHTML(it,i,St);}).join('');
      if(St.it.some(function(it){return it.t==='eq';}))h+='<p class="muted">Tulis koefisien negatif dengan tanda minus, misalnya −3. Bentuk yang dikalikan atau disederhanakan juga diterima.</p>';
      else if(St.it.some(function(it){return it.t==='num';}))h+='<p class="muted">Bilangan negatif ditulis dengan tanda minus, misalnya −4. Pecahan boleh ditulis 1/3 atau 0,5.</p>';
    }else if(St.k==='pt')h+='<p class="state ptstate">Titik pilihanmu '+(S.pt?'<b>'+ptS(S.pt)+'</b>':'<span class="muted">belum ada</span>')+'</p><p class="muted">Ketuk satu titik kisi pada bidang koordinat.</p>';
    else h+='<p class="state selstate">'+selText()+'</p><p class="muted">Ketuk titik kisi pada bidang untuk memilih. Ketuk lagi titik yang sama untuk membatalkan.</p>';
    h+='<ul class="hints" hidden></ul><div class="fb" hidden></div><div class="actions row">'+(opsi.petunjuk?'<button class="btn ghost" data-aksi="petunjuk">💡 Petunjuk</button>':'')+'<button class="btn primary" data-aksi="periksa">Periksa</button></div>';
    el.panel.innerHTML=h;
    renderHints();
    pratinjauSemua();
  }

  /* ---- satu pendengar untuk seluruh panel ---- */
  el.panel.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||b.disabled||!el.panel.contains(b))return;
    if(b.dataset.j!==undefined&&b.dataset.i!==undefined){
      var i=+b.dataset.i;if(S.lock[i]||S.solved)return;S.ans[i]=+b.dataset.j;
      var row=b.closest('.trow');row.classList.remove('bad');
      row.querySelectorAll('[data-j]').forEach(function(x){var o=+x.dataset.j===S.ans[i];x.classList.toggle('on',o);x.classList.toggle('sel',o);});
      return;
    }
    var a=b.dataset.aksi;if(!a)return;
    if(a==='periksa')periksa();
    else if(a==='petunjuk')tambahPetunjuk(true);
    else if(a==='dimana')diMana();
    else if(opsi.aksi)opsi.aksi(a,b);
  });
  el.panel.addEventListener('input',function(e){
    var inp=e.target;
    if(!inp.classList.contains('num')||inp.dataset.i===undefined)return;
    var i=+inp.dataset.i;
    if(inp.dataset.j!==undefined){S.ans[i][+inp.dataset.j]=inp.value;pratinjau(i);}else S.ans[i]=inp.value;
    var r=inp.closest('.trow');if(r)r.classList.remove('bad');inp.classList.remove('bad');
  });
  el.panel.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.classList.contains('num'))periksa();});
  el.svg.addEventListener('click',function(e){
    if(!S.Q||S.tahap!=='kerja'||S.solved||S.selesai)return;
    if(opsi.bolehKlik&&!opsi.bolehKlik())return;
    var St=curS(),c=bidang.klik(e);
    if(St.k==='pt'){S.pt=bidang.tempel(c);var ps=pq('.ptstate');if(ps)ps.innerHTML='Titik pilihanmu <b>'+ptS(S.pt)+'</b>';var f=pq('.fb');if(f&&f.classList.contains('info'))f.hidden=true;renderBidang();}
    else if(St.k==='pts'){
      var p=bidang.tempel(c),ix=-1;
      S.sel.forEach(function(r,i){if(r.x===p.x&&r.y===p.y)ix=i;});
      if(ix>=0)S.sel.splice(ix,1);else if(S.sel.length<16)S.sel.push(p);
      var ss=pq('.selstate');if(ss)ss.innerHTML=selText();renderBidang();
    }
  });

  /* ---- umpan balik ---- */
  function fb(kind,html){var e=pq('.fb');if(!e)return;e.hidden=false;e.className='fb '+kind;e.innerHTML=html;}
  /* ---- petunjuk bertahap ----
     opsi.petunjukLanjut(Q,s,St) : petunjuk tambahan yang tampil setelah petunjuk CORE
     opsi.gerbangPetunjuk = n     : petunjuk ke-(n+1) dan seterusnya baru terbuka setelah
                                    siswa mencoba menjawab minimal sekali pada langkah itu */
  function daftarPetunjuk(){
    var St=curS();if(!St)return [];
    var x=[];
    if(opsi.petunjukLanjut){try{x=opsi.petunjukLanjut(S.Q,S.s,St)||[];}catch(err){if(window.console)console.warn('petunjukLanjut',err);x=[];}}
    return St.h.concat(x);
  }
  function gerbangTertutup(){var g=opsi.gerbangPetunjuk;return g!=null&&S.hints>=g&&S.tries<1;}
  function tambahPetunjuk(sapa){var l=daftarPetunjuk();if(!l.length||S.hints>=l.length||gerbangTertutup())return;S.hints++;renderHints();if(sapa)PL.Plus.say('petunjuk');}
  function bukaSemuaPetunjuk(){if(!opsi.petunjuk)return;S.hints=daftarPetunjuk().length;renderHints();}
  function renderHints(){
    var box=pq('.hints');if(!box)return;
    var St=curS(),l=daftarPetunjuk(),n0=St?St.h.length:0;
    box.innerHTML=l.slice(0,S.hints).map(function(h,i){
      var isi=opsi.ubahPetunjuk?opsi.ubahPetunjuk(h):h,kls=i>=n0?' rinci':'';
      return '<li class="baru'+kls+'">'+isi+'</li>';
    }).join('');
    box.hidden=!S.hints||!opsi.petunjuk;
    var tb=pq('[data-aksi="petunjuk"]');
    if(tb){
      var habis=S.hints>=l.length,tutup=!habis&&gerbangTertutup();
      tb.hidden=!l.length;tb.disabled=habis||tutup;
      tb.textContent=habis?'💡 Semua petunjuk sudah dibuka'
        :tutup?'💡 Coba jawab dulu untuk membuka petunjuk berikutnya'
        :!S.hints?'💡 Petunjuk':'💡 Petunjuk lebih rinci ('+(S.hints+1)+' dari '+l.length+')';
    }
  }
  function tandai(r){
    var St=curS();if(St.k!=='form')return;
    r.items.forEach(function(ok,i){
      if(ok)S.lock[i]=true;
      var inps=el.panel.querySelectorAll('[data-i="'+i+'"]');
      inps.forEach(function(x){
        if(x.tagName==='INPUT'){x.classList.toggle('ok',ok);x.classList.toggle('bad',!ok);if(ok)x.disabled=true;}
        else if(x.classList.contains('trow')&&St.lay!=='koor'){x.classList.toggle('ok',ok);x.classList.toggle('bad',!ok);if(ok)x.querySelectorAll('button,input').forEach(function(y){y.disabled=true;});}
      });
    });
    if(St.lay==='koor')el.panel.querySelectorAll('.trow.koor').forEach(function(row){
      var i=+row.dataset.k,ok=r.items[i]&&r.items[i+1];row.classList.toggle('ok',ok);row.classList.toggle('bad',!ok);
    });
  }
  function kunciSemua(){el.panel.querySelectorAll('.trow button, .trow input').forEach(function(x){x.disabled=true;});var b=pq('[data-aksi="periksa"]');if(b)b.disabled=true;}
  function isiKunci(){
    var St=curS(),k=CORE.keyAns(S.Q,S.s);
    if(St.k==='pt')S.pt=k;
    else if(St.k==='pts')S.sel=k;
    else St.it.forEach(function(it,i){S.ans[i]=it.t==='pg'?k[i]:it.t==='num'?(it.u==='rp'?nm(k[i]):teksIsian(k[i])):k[i].map(teksIsian);S.lock[i]=true;});
  }
  function teksKunci(){
    var St=curS(),k=CORE.keyAns(S.Q,S.s);
    if(St.k==='pt')return ptS(k);
    if(St.k==='pts')return k.map(ptS).join(', ');
    if(St.lay==='koor'){var o=[];for(var i=0;i+1<St.it.length;i+=2)o.push(esc(St.it[i].lab)+' = '+ptS({x:k[i],y:k[i+1]}));return o.join(' ; ');}
    return St.it.map(function(it,i){var a=k[i];
      if(it.t==='pg')return esc(it.o[a]);
      if(it.t==='num')return esc(it.lab)+' '+(it.u==='rp'?U.rp(a):nm(a))+(it.u&&it.u!=='rp'?' '+esc(it.u):'');
      return U.eqS(Lq(a[0],a[1],a[2],'='));}).join(' ; ');
  }
  function tombol(html){var a=pq('.actions');if(a){a.innerHTML=html;var b=a.querySelector('.btn.primary');if(b&&b.focus)b.focus({preventScroll:true});}}
  function tambahTombol(html){var a=pq('.actions');if(a)a.insertAdjacentHTML('beforeend',html);}
  function periksa(){
    if(S.solved)return;
    var a=collect(),St=curS();
    if(a===null||!CORE.valid(S.Q,S.s,a)){fb('info',St.k==='pt'?'Ketuk satu titik pada bidang dulu.':St.k==='pts'?'Pilih titik pada bidang dulu.':'Lengkapi semua isian dulu. Pastikan isinya bilangan, misalnya −3, 2,5, atau 1/3.');return;}
    opsi.periksa(a,CORE.judge(S.Q,S.s,a));
  }

  /* ---- "Di mana salahku?" ----
     Menunjukkan bagian yang salah dan jenis kesalahannya tanpa memberi jawaban. */
  function tombolDiMana(){
    if(!opsi.diManaSalah||!S.lw)return;
    var e=pq('.fb');if(!e||e.hidden)return;
    e.insertAdjacentHTML('beforeend','<div class="whereBox"><button class="btn ghost" data-aksi="dimana" type="button">📍 Di mana salahku?</button> <span class="whereTxt" role="status"></span></div>');
  }
  /* membandingkan pasangan (x, y) jawaban dengan kunci: jenis kesalahan yang umum */
  function polaKoor(p,k){
    if(p.x===k.x&&p.y===k.y)return '';
    if(p.x===k.y&&p.y===k.x)return 'Nilai x dan y tertukar posisinya.';
    if(p.x===-k.x&&p.y===-k.y)return 'Tanda kedua koordinat terbalik.';
    if(p.x===k.x)return 'Nilai x sudah tepat. Periksa nilai y'+(p.y===-k.y?', tandanya terbalik.':'.');
    if(p.y===k.y)return 'Nilai y sudah tepat. Periksa nilai x'+(p.x===-k.x?', tandanya terbalik.':'.');
    if(Math.abs(p.x)===Math.abs(k.y)&&Math.abs(p.y)===Math.abs(k.x))return 'Posisi x dan y sudah ditukar dengan benar. Periksa tandanya.';
    return 'Kedua koordinat belum tepat. Tulis aturannya dulu, lalu substitusikan satu per satu.';
  }
  function diMana(){
    var w=S.lw;if(!w)return;
    var St=curS(),t=null,msg='';
    if(St.k==='form'){
      var i=w.r.items.indexOf(false),it=St.it[i],a=w.a[i];
      t={el:el.panel.querySelector('[data-i="'+(St.lay==='koor'?i-(i%2):i)+'"]')};
      if(St.lay==='koor'){
        var j=i-(i%2),pa={x:w.a[j],y:w.a[j+1]},pk={x:St.it[j].key,y:St.it[j+1].key};
        msg=esc(St.it[j].lab)+': '+polaKoor(pa,pk);
      }else if(it.t==='eq'){
        var k=it.key,sb=Math.abs(a[0]*k.b-a[1]*k.a)<1e-9;
        msg=sb?'Koefisien x dan y sudah sebanding dengan jawaban, tetapi ruas kanan (c) belum tepat.':'Koefisien x dan y belum tepat. Periksa tanda setelah substitusi.';
      }else if(it.t==='num'){
        if(a===-it.key)msg='Nilainya sudah benar, tetapi tandanya terbalik.';
        else if(Math.abs(it.key)>0&&Math.abs(a*it.key-1)<1e-9)msg='Kamu membalik pembagiannya. Bagi bayangan dengan asal, bukan sebaliknya.';
        else msg='Nilai pada isian ini belum tepat. Hitung ulang pelan-pelan.';
      }
      else msg='Pilihan pada baris ini belum tepat. Baca lagi soalnya.';
    }else if(St.k==='pt'){
      var p=w.a,kk=St.cond.p[0];t={pt:[p.x,p.y]};
      msg='Titik '+ptS(p)+' bukan titik yang dimaksud. '+polaKoor(p,kk);
    }else{
      var n=St.key.length;
      if(w.r.lebih.length){var ex=w.r.lebih[0];t={pt:[ex.x,ex.y]};msg='Titik '+ptS(ex)+' bukan titik yang dimaksud. Ketuk titik itu lagi untuk membatalkan.';}
      else msg='Titik yang kamu pilih sudah benar, tetapi masih kurang. Seharusnya ada '+n+' titik.';
    }
    var wt=pq('.whereTxt');if(wt)wt.textContent=msg;
    if(t)PL.Plus.go(t,msg,9000);
  }

  /* ---- kartu soal, progres, bidang ---- */
  function renderKartu(){
    if(!S.Q)return;
    el.ask.innerHTML=S.Q.soal;
    el.meta.innerHTML=opsi.meta?opsi.meta():esc(S.Q.jd+' · '+S.Q.lv);
  }
  function renderProgres(intro){
    if(!S.Q)return;
    var items=[{l:'Soal',d:!intro,c:!!intro}];
    S.Q.st.forEach(function(St,i){var done=S.selesai||(!intro&&(i<S.s||(i===S.s&&S.solved)));items.push({l:St.nm,d:done,c:!intro&&!S.selesai&&i===S.s&&!S.solved});});
    el.prog.innerHTML=items.map(function(it,i){return '<li class="'+(it.d?'done':it.c?'cur':'')+'"><span>'+(it.d?'✓':i+1)+'</span><em>'+esc(it.l)+'</em></li>';}).join('');
    el.stepText.textContent=intro?'Baca soal, lalu mulai':S.selesai?'Selesai 🎉':'Langkah '+(S.s+1)+' dari '+S.Q.st.length+' · '+S.Q.st[S.s].nm;
  }
  function qView(spec,extra){
    var V={};spec=spec||{};
    for(var k in spec)V[k]=spec[k];
    V.B=S.Q.pl;
    if(extra)for(var k2 in extra)V[k2]=extra[k2];
    return V;
  }
  function renderBidang(mode){
    if(!S.Q)return kosong();
    if(mode==='akhir'||S.selesai)return bidang.gambar(qView(S.Q.vz));
    if(mode==='awal')return bidang.gambar(qView(S.Q.st[0].v));
    var St=curS(),ex={};
    /* setelah langkah selesai, tampilkan jawaban pada bidang */
    if(St.k==='pt'){ex.pick=S.pt;ex.click=!S.solved;}
    if(St.k==='pts'){ex.sel=S.sel;ex.click=!S.solved;}
    bidang.gambar(qView(St.v,ex));
  }
  function kosong(cap){bidang.gambar({B:CORE.FULL,cap:cap||'Bidang koordinat akan menampilkan soal.'});}

  return {S:S,el:el,bidang:bidang,curS:curS,muat:muat,reset:reset,collect:collect,parseNum:parseNum,
    panelLangkah:panelLangkah,renderKartu:renderKartu,renderProgres:renderProgres,renderBidang:renderBidang,kosong:kosong,
    fb:fb,tandai:tandai,kunciSemua:kunciSemua,isiKunci:isiKunci,teksKunci:teksKunci,tombol:tombol,tambahTombol:tambahTombol,
    tambahPetunjuk:tambahPetunjuk,renderHints:renderHints,bukaSemuaPetunjuk:bukaSemuaPetunjuk,tombolDiMana:tombolDiMana,periksa:periksa,
    panduan:function(){var St=curS();if(!St)return null;return St.k==='pt'?'Hitung koordinatnya dulu, ya':St.k==='pts'?'Periksa lagi titik-titik pilihanmu, ya':'Periksa isian yang berwarna merah, ya';}};
};
})(window.PL=window.PL||{});
