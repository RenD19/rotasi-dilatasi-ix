/* ==========================================================================
   belajar.js · TAB BELAJAR
   Wadah: <section id="tab-belajar">. Tidak menyentuh skor, jejak, atau server.
   Isi layar ada di js/belajar-data.js (PL.EXG, PL.EX).
   Alat interaktif (beat.alat) dikendalikan slider .alatR pada bagian (part) langkah aktif:
     j:'rot' → putar titik/bangun (pts, C, poly, circ, geser)   nilai = sudut (derajat)
     j:'dil' → dilatasi titik/bangun (pts, C, poly, luas, geser) nilai = faktor skala k
     j:'grs' → putar (mode 'rot') atau dilatasi (mode 'dil') garis q
   geser:true → siswa boleh mengetuk bidang untuk memindahkan titik asal.
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U,$=U.$,esc=U.esc,nm=U.nm,ptS=U.ptS,AL=PL.belajarAlat;
var EX=PL.EX,EXG=PL.EXG;
var sec,panel,bidang,ex={i:0,b:0,mark:null},alat=null;
var MQ=window.matchMedia?window.matchMedia('not all and (min-width:860px) and (min-height:500px)'):null;
var CR='Biru = asal, jingga = bayangan. Panah melengkung = arah putaran.';
var CD='Biru = asal, jingga = bayangan. Garis putus-putus melewati pusat dilatasi.';

/* ---------- hitungan alat ---------- */
function r1(v){var r=Math.round(v*100)/100;return r===0?0:r;}
function putar(Q,d,C){
  if(d%90===0)return CORE.rot(Q,d,C);
  var t=d*Math.PI/180,x=Q.x-C.x,y=Q.y-C.y;
  return {x:r1(C.x+x*Math.cos(t)-y*Math.sin(t)),y:r1(C.y+x*Math.sin(t)+y*Math.cos(t))};
}
function skala(Q,k,C){return CORE.dil(Q,k,C);}
function jarak(A,B){return Math.sqrt((A.x-B.x)*(A.x-B.x)+(A.y-B.y)*(A.y-B.y));}
function luasPoly(ps){var a=0;for(var i=0;i<ps.length;i++){var p=ps[i],q=ps[(i+1)%ps.length];a+=p.x*q.y-q.x*p.y;}return Math.abs(a)/2;}
function dua(q){var P1=q.b!==0?{x:0,y:q.c/q.b}:{x:q.c/q.a,y:0};return [P1,{x:P1.x+2*q.b,y:P1.y-2*q.a}];}
function garisMelalui(A,B){var a=A.y-B.y,b=B.x-A.x;return {a:a,b:b,c:a*A.x+b*A.y};}
function normal(q){var g=CORE.gcd(CORE.gcd(q.a,q.b),q.c)||1,a=q.a/g,b=q.b/g,c=q.c/g;if(a<0||(a===0&&b<0)){a=-a;b=-b;c=-c;}return CORE.L(a+0,b+0,c+0);}
function bulat(v){return Math.abs(v-Math.round(v))<1e-9;}

function viewAlat(){
  var a=alat,v=a.val,C=a.C||{x:0,y:0},ctr=AL.ctr(C),o={ctr:ctr};
  if(a.j==='rot'||a.j==='dil'){
    var img=a.pts.map(function(Q){return a.j==='rot'?putar(Q,v,C):skala(Q,v,C);});
    if(a.poly){o.poly=[AL.poly(a.pts,'a',a.nama),AL.poly(img,'b',a.nama.map(function(n){return n+'′';}))];}
    else{o.mk=[AL.mk(a.pts[0],'a',a.nama[0]+ptS(a.pts[0])),AL.mk(img[0],'b',a.nama[0]+'′'+ptS(img[0]))];}
    if(a.j==='rot'){
      o.seg=[AL.seg(C,a.pts[0],'a'),AL.seg(C,img[0],'b')];
      if(v)o.arc=AL.arc(C,a.pts[0],v,'b');
      if(a.circ)o.circ={c:[C.x,C.y],r:a.circ};
      o.cap=CR;
    }else{
      o.seg=a.pts.map(function(Q,i){var I=img[i];return v<0?AL.seg(I,Q,'k'):AL.seg(C,Math.abs(v)>=1?I:Q,'k');});
      if(a.poly&&v<0)o.seg=a.pts.map(function(Q,i){return AL.seg(Q,img[i],'k');});
      o.cap=CD;
    }
    a.img=img;
  }else{
    var q=a.q,qb;
    if(a.mode==='rot'){
      if(v%90===0)qb=normal(CORE.rotLn(q,v));
      else{var d=dua(q);qb=garisMelalui(putar(d[0],v,C),putar(d[1],v,C));}
      var f=dua(q)[0];o.arc=v?AL.arc(C,f,v,'b'):undefined;
      o.mk=[AL.mk(f,'a',''),AL.mk(putar(f,v,C),'b','')];
    }else{
      qb=CORE.L(q.a,q.b,r1(v*q.c));
      if(q.a){var X0={x:q.c/q.a,y:0},X1={x:r1(v*q.c/q.a),y:0};o.mk=[AL.mk(X0,'a'),AL.mk(X1,'b')];}
    }
    var bisa=(a.mode==='dil')||v%90===0;
    o.ln=[AL.lnV(q,'a',CORE.eqS(q)),{a:qb.a,b:qb.b,c:qb.c,col:'b',l:bisa&&[qb.a,qb.b,qb.c].every(bulat)?CORE.eqS(qb):'bayangan'}];
    o.cap='Garis biru = garis asal, garis jingga = garis bayangan.';
    a.qb=qb;
  }
  o.B=CORE.FULL;
  return o;
}
function statusAlat(){
  var a=alat,v=a.val,t='';
  if(a.j==='rot'){
    var A=a.pts[0],B=a.img[0],arah=v<0?' (searah jarum jam)':v>0?' (berlawanan arah jarum jam)':'';
    t='Rotasi '+nm(v)+'°'+arah+': '+a.nama[0]+ptS(A)+' → '+a.nama[0]+'′'+ptS(B)+'.';
    var d=((v%360)+360)%360;
    if(v%90===0&&d)t+=' Aturannya '+CORE.ATURAN[d]+'.';
    else if(v%90!==0)t+=' Koordinat dibulatkan; aturan sederhana hanya untuk kelipatan 90°.';
    t+=' Jarak ke pusat tetap '+nm(r1(jarak(A,a.C||{x:0,y:0})))+(a.circ?' m.':'.');
    if(a.poly)t+=' Bentuk dan ukuran tidak berubah (kongruen).';
  }else if(a.j==='dil'){
    var k=v,ak=Math.abs(k);
    if(k===0)t='k = 0: semua titik berimpit dengan pusat. Faktor skala tidak boleh 0.';
    else{
      t='k = '+nm(k)+': '+(ak>1?'diperbesar':ak<1?'diperkecil':'ukurannya tetap')+', '+(k>0?'sepihak dengan titik asal.':'berlawanan pihak dengan titik asal.');
      if(!a.poly)t+=' '+a.nama[0]+ptS(a.pts[0])+' → '+a.nama[0]+'′'+ptS(a.img[0])+'.';
      if(a.luas){var L0=luasPoly(a.pts),L1=luasPoly(a.img);t+=' Luas asal '+nm(L0)+', luas bayangan '+nm(r1(L1))+' = k² × '+nm(L0)+'.';}
      else if(a.poly)t+=' Bentuknya tetap (sebangun).';
    }
  }else{
    var qb=a.qb,q=a.q;
    if(a.mode==='rot'){
      var d2=((v%180)+180)%180;
      t='Garis diputar '+nm(v)+'°. ';
      if(v%90===0)t+=(d2===90?'Garis bayangan '+CORE.eqS(qb)+' tegak lurus garis asal.':(q.c===0?'Garis bayangan berimpit dengan garis asal.':'Garis bayangan '+CORE.eqS(qb)+' sejajar garis asal.'));
      else t+='Sudut antara kedua garis '+nm(Math.min(d2,180-d2))+'°.';
    }else{
      if(v===0)t='k = 0 tidak dipakai.';
      else t='k = '+nm(v)+': garis bayangan '+CORE.eqS(qb)+'. '+(q.c===0||v===1?'Berimpit dengan garis asal.':'Sejajar garis asal, '+(v<0?'di pihak berlawanan dari O.':'di pihak yang sama dari O.'));
    }
  }
  return t;
}

/* ---------- layar ---------- */
function beatNow(){var bs=EX[ex.i].beats;return bs[Math.min(ex.b,bs.length-1)];}
function tampilan(){
  var bt=beatNow(),V0=alat?viewAlat():(bt.v||{B:CORE.FULL}),W={};
  for(var k in V0)W[k]=V0[k];
  if(!W.B)W.B=CORE.FULL;
  if(alat&&alat.geser)W.click=true;
  if(ex.mark)W.mk=(W.mk||[]).concat([{x:ex.mark.x,y:ex.mark.y,c:'g',l:ex.mark.l}]);
  return W;
}
function q(s){return panel.querySelector(s);}
/* kotak alat pada bagian langkah aktif; kotak alat lain disembunyikan */
function kotakAlat(){var bt=beatNow();return panel.querySelector('[data-part="'+bt.show+'"] .alatbox');}
function qa(s){var k=kotakAlat();return k?k.querySelector(s):null;}
function renderLayar(){
  var sc=EX[ex.i],h='';
  var opt=function(g){return '<optgroup label="'+esc(g.lab)+'">'+g.list.map(function(s){var i=EX.indexOf(s);return '<option value="'+i+'"'+(i===ex.i?' selected':'')+'>'+esc(s.jd)+'</option>';}).join('')+'</optgroup>';};
  h+='<div class="exhd"><select class="exTopic" aria-label="Pilih topik">'+EXG.map(opt).join('')+'</select><small class="exPos"></small></div>';
  h+='<h2>'+esc(sc.jd)+'</h2>'+sc.parts.map(function(p,i){return '<div class="expart" data-part="'+i+'" hidden>'+p+'</div>';}).join('')+'<small class="exsrc">Sumber: '+esc(sc.src)+'</small>';
  h+='<div class="row'+(sc.go?'':' exempty')+'" id="exNav"><div id="exFloat"><span class="exfpos" aria-hidden="true"></span><button class="btn" id="exPrev" data-aksi="sebelum" type="button">◀ Sebelumnya</button><button class="btn primary" id="exNext" data-aksi="berikut" type="button">Berikutnya ▶</button><button class="btn ghost" id="exAgain" data-aksi="ulangi" type="button" aria-label="Ulangi">↺ <span class="lb">Ulangi</span></button></div>'+(sc.go?'<button class="btn primary" data-aksi="ke-latihan" type="button">Latihan Mandiri ➜</button>':'')+'</div>';
  panel.innerHTML=h;
  PL.Math.render(panel);
  langkah();
}
function aturAlat(){
  var bt=beatNow(),c=bt.alat;
  if(!c){alat=null;return;}
  if(!alat||alat.src!==c){
    alat={src:c,j:c.j,pts:(c.pts||[]).map(function(p){return {x:p.x,y:p.y};}),nama:c.nama||['A'],C:c.C||{x:0,y:0},poly:!!c.poly,luas:!!c.luas,circ:c.circ||0,geser:!!c.geser,q:c.q,mode:c.mode,val:c.v};
  }
  var s=qa('.alatR');if(s)s.value=alat.val;
}
function segarAlat(){
  if(!alat)return;
  bidang.gambar(tampilan());
  var lab=qa('.alatV'),t=qa('.alatT');
  if(lab)lab.textContent=alat.j==='dil'||(alat.j==='grs'&&alat.mode==='dil')?nm(alat.val):nm(alat.val)+'°';
  if(t)t.textContent=statusAlat();
  var k=kotakAlat();if(k)k.querySelectorAll('[data-aksi="alat-set"]').forEach(function(b){b.classList.toggle('on',+b.dataset.v===alat.val);});
}
function langkah(){
  var sc=EX[ex.i],bs=sc.beats,bt=beatNow();
  panel.querySelectorAll('.hit').forEach(function(e){e.classList.remove('hit');});
  panel.querySelectorAll('[data-part]').forEach(function(e){e.hidden=+e.dataset.part>bt.show;});
  var aktif=kotakAlat();panel.querySelectorAll('.alatbox').forEach(function(k){k.hidden=!bt.alat||k!==aktif;});
  aturAlat();
  var pos=q('.exPos'),fp=q('.exfpos'),txt='Layar '+(ex.i+1)+' dari '+EX.length+(bs.length>1?' · langkah '+(Math.min(ex.b,bs.length-1)+1)+' dari '+bs.length:'');
  if(pos)pos.textContent=txt;if(fp)fp.textContent=txt;
  var pv=q('[data-aksi="sebelum"]'),nx=q('[data-aksi="berikut"]'),gb=q('[data-aksi="ke-latihan"]');
  if(pv)pv.disabled=(ex.i===0&&ex.b===0);
  if(nx)nx.disabled=(ex.i===EX.length-1&&ex.b>=bs.length-1);
  if(gb)gb.hidden=ex.b<bs.length-1;
  bidang.gambar(tampilan());segarAlat();
  var part=q('[data-part="'+bt.show+'"]'),tgt=bt.at?{el:bt.at.el==='alat'?qa('.alatR'):bt.at.el?panel.querySelector(bt.at.el):null}:{el:part};
  if(part&&!bt.at)part.classList.add('hit');
  if(part&&part.scrollIntoView)try{part.scrollIntoView({block:'nearest'});}catch(_){}
  PL.barSync();
  PL.Plus.go(tgt,bt.say);
}
function berikut(){var nb=EX[ex.i].beats.length;ex.mark=null;if(ex.b<nb-1){ex.b++;langkah();return;}if(ex.i<EX.length-1){ex.i++;ex.b=0;alat=null;renderLayar();}}
function sebelum(){ex.mark=null;if(ex.b>0){ex.b--;langkah();return;}if(ex.i>0){ex.i--;ex.b=EX[ex.i].beats.length-1;alat=null;renderLayar();}}
function tandaiBaris(r){
  panel.querySelectorAll('tr.tpt').forEach(function(x){x.classList.remove('hit');});r.classList.add('hit');
  var x=+r.dataset.x,y=+r.dataset.y,l=r.dataset.l||'';ex.mark={x:x,y:y,l:(l?l:'')+ptS({x:x,y:y})};
  bidang.gambar(tampilan());
  PL.Plus.go({pt:[x,y]},'Ini titik '+ex.mark.l+'.',4000);
}

PL.TAB=PL.TAB||{};
PL.TAB.belajar={
  init:function(){
    sec=$('#tab-belajar');panel=sec.querySelector('.panel');
    bidang=PL.Bidang(sec.querySelector('svg.bidang'),sec.querySelector('.cap'));
    this.bidang=bidang;
    panel.addEventListener('click',function(e){
      var r=e.target.closest('tr.tpt');if(r){tandaiBaris(r);return;}
      var b=e.target.closest('[data-aksi]');if(!b||b.disabled)return;
      var a=b.dataset.aksi;
      if(a==='berikut')berikut();else if(a==='sebelum')sebelum();
      else if(a==='ulangi'){ex.b=0;ex.mark=null;alat=null;langkah();}
      else if(a==='ke-latihan')PL.pindahTab('latihan');
      else if(a==='alat-set'&&alat){alat.val=+b.dataset.v;var s=qa('.alatR');if(s)s.value=alat.val;segarAlat();}
    });
    panel.addEventListener('keydown',function(e){var r=e.target.closest('tr.tpt');if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();tandaiBaris(r);}});
    panel.addEventListener('change',function(e){if(e.target.classList.contains('exTopic')){ex.i=+e.target.value;ex.b=0;ex.mark=null;alat=null;renderLayar();}});
    panel.addEventListener('input',function(e){if(e.target.classList.contains('alatR')&&alat){alat.val=+e.target.value;segarAlat();}});
    /* ketuk bidang: memindahkan titik asal pada alat yang mengizinkan */
    bidang.svg.addEventListener('click',function(e){
      if(PL.mode()!=='belajar'||!alat||!alat.geser)return;
      var p=bidang.tempel(bidang.klik(e));
      if(Math.abs(p.x)>8||Math.abs(p.y)>8||(p.x===alat.C.x&&p.y===alat.C.y))return;
      alat.pts[0]=p;ex.mark=null;segarAlat();
    });
    document.addEventListener('keydown',function(e){
      if(PL.mode()!=='belajar')return;
      var tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;
      if(e.key==='ArrowRight')berikut();else if(e.key==='ArrowLeft')sebelum();
    });
  },
  tampil:function(){renderLayar();},
  sembunyi:function(){return true;},
  buka:function(i){ex.i=i||0;ex.b=0;ex.mark=null;alat=null;renderLayar();}
};
/* bar navigasi melayang di layar kecil (hanya tab Belajar) */
PL.barSync=function(){
  var f=document.getElementById('exFloat'),on=PL.mode()==='belajar'&&!!MQ&&MQ.matches&&!!f;
  document.body.classList.toggle('ex-bar',on);
  document.documentElement.style.setProperty('--exbar-h',(on?f.offsetHeight:0)+'px');
};
})(window.PL);
