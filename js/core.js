/* core.js · CORE BERSAMA — dipakai halaman siswa DAN ditempel utuh ke file core.gs di Apps Script. Jangan disunting sebagian; setelah mengubahnya, tempel ulang seluruh isi ke core.gs. */
/* ============================================================
   CORE BERSAMA · TRANSFORMASI GEOMETRI: ROTASI DAN DILATASI
   Pembangkit soal (24 tipe) dan penilai. Dipakai persis sama oleh
   halaman siswa dan server. Server menolak halaman yang "cek"-nya
   berbeda.
   Bentuk langkah: 'form' (isian pg / num / eq), 'pt' (klik satu titik),
   'pts' (klik beberapa titik). Tampilan bidang tiap langkah ada di St.v:
     {mk:[titik], poly:[bangun], seg:[ruas], arc:busur, circ:lingkaran,
      ln:[garis], ctr:pusat, cap:keterangan}
   Q.m menyimpan bilangan pembentuk soal (titik, sudut, k, garis) untuk petunjuk.js dan penyelesaian.js.
   Kode warna: 'a' asal (biru), 'b' bayangan (jingga), 'm' antara (ungu),
               'k' hitam, 'g' hijau.
   ============================================================ */
var CORE=(function(){
'use strict';
var VERSI='2026-11-02.2';
var OPS=['<','≤','>','≥'];
var MAKS_COBA=2;           /* percobaan per langkah di Kuis: benar ke-1 = 2 poin, ke-2 = 1 poin, salah dua kali = 0 */
var NSOAL=12,NLANGKAH=6;   /* NLANGKAH = banyak langkah paling banyak per soal (Tipe 15) */
var TIPE={
  1:'Rotasi titik 90°',2:'Rotasi titik 180°',3:'Rotasi 90° searah jarum jam',4:'Rotasi segitiga',
  5:'Menentukan sudut rotasi',6:'Mencari titik asal',7:'Rotasi dengan pusat P(a, b)',
  8:'Dilatasi, k bulat positif',9:'Dilatasi, k pecahan',10:'Dilatasi, k negatif',11:'Menentukan faktor skala',
  12:'Dilatasi bangun dan luas',13:'Foto diperbesar',14:'Dilatasi dengan pusat P(a, b)',
  15:'Rotasi garis, metode dua titik',16:'Rotasi garis, metode substitusi',17:'Rotasi garis 180°',
  18:'Dilatasi garis, k positif',19:'Dilatasi garis, k negatif/pecahan',
  20:'Bianglala pasar malam Watampone',21:"Motif garis lipa' sabbe",22:'Denah dermaga Pelabuhan Bajoe',
  23:'Jalan Watampone–Bajoe pada peta',24:'Komposisi rotasi dan dilatasi'
};
var LEVEL={L:'LOTS',M:'MOTS',H:'HOTS'};
/* level yang tersedia untuk setiap tipe */
var LV_TIPE={1:'L',2:'L',3:'M',4:'M',5:'H',6:'H',7:'H',8:'L',9:'L',10:'M',11:'M',12:'M',13:'M',14:'H',
  15:'M',16:'H',17:'MH',18:'M',19:'H',20:'M',21:'H',22:'M',23:'H',24:'H'};
/* bagian materi (rincian skor) */
var BAGIAN={ROT:'Rotasi',DIL:'Dilatasi',GRS:'Persamaan garis',BONE:'Konteks Bone',KOMP:'Komposisi'};
var BG_TIPE={1:'ROT',2:'ROT',3:'ROT',4:'ROT',5:'ROT',6:'ROT',7:'ROT',8:'DIL',9:'DIL',10:'DIL',11:'DIL',12:'DIL',
  13:'BONE',14:'DIL',15:'GRS',16:'GRS',17:'GRS',18:'GRS',19:'GRS',20:'BONE',21:'BONE',22:'BONE',23:'BONE',24:'KOMP'};
var RINCI=['ROT','DIL','GRS','BONE','KOMP','LOTS','MOTS','HOTS'];
var RLAB={ROT:'Rotasi (Tipe 1–7)',DIL:'Dilatasi (Tipe 8–12, 14)',GRS:'Persamaan garis (Tipe 15–19)',
  BONE:'Konteks Bone (Tipe 13, 20–23)',KOMP:'Komposisi (Tipe 24)',LOTS:'LOTS',MOTS:'MOTS',HOTS:'HOTS'};
var FULL={x0:-10,y0:-10,x1:10,y1:10,g:1,lb:2};

var isNum=function(v){return typeof v==='number'&&isFinite(v);};
var isInt=function(v){return isNum(v)&&Math.floor(v)===v;};
var gcd=function(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a;};
var holds=function(v,c,op){return op==='<'?v<c:op==='≤'?v<=c:op==='>'?v>c:op==='≥'?v>=c:v===c;};
var isSolid=function(op){return op!=='<'&&op!=='>';};
var flipOp=function(op){return op==='<'?'>':op==='>'?'<':op==='≤'?'≥':op==='≥'?'≤':op;};
function rnd(v){var r=Math.round(v*1e9)/1e9;return r===0?0:r;}

/* ---------- bilangan acak berbenih ---------- */
function mulberry32(seed){
  var a=seed>>>0;
  return function(){
    a=(a+0x6D2B79F5)>>>0;
    var t=a;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return((t^(t>>>14))>>>0)/4294967296;
  };
}
function ri(rng,a,b){return Math.floor(rng()*(b-a+1))+a;}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuffle(arr,rng){
  for(var i=arr.length-1;i>0;i--){var j=Math.floor(rng()*(i+1));var t=arr[i];arr[i]=arr[j];arr[j]=t;}
  return arr;
}
/* bilangan bulat acak dari [a, b] selain 0 */
function rnz(rng,a,b){var v=0;while(v===0)v=ri(rng,a,b);return v;}
function sgn(rng){return rng()<0.5?-1:1;}

/* ---------- penulisan bilangan dan bentuk aljabar ---------- */
function ribu(s){return s.replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
var PECAHAN={'0.5':'½','0.333':'⅓','0.667':'⅔','0.25':'¼','0.75':'¾','0.111':'1/9','0.2':'⅕'};
/* bilangan: bulat → 1.250; pecahan biasa < 1 → ½, ⅓, ¼; lainnya → desimal berkoma (2,5) */
function nm(v){
  v=rnd(v);
  var s=v<0?'−':'',a=Math.abs(v);
  if(isInt(a))return s+ribu(String(a));
  var k=(Math.round(a*1000)/1000).toString();
  if(a<1&&PECAHAN[k])return s+PECAHAN[k];
  return s+String(Math.round(a*1000)/1000).replace('.',',');
}
function rp(v){return (v<0?'−':'')+'Rp'+ribu(String(Math.abs(v)));}
function ptS(p){return '('+nm(p.x)+', '+nm(p.y)+')';}
/* jumlah suku [[koefisien, peubah], …]; peubah '' = konstanta */
function sum(su){
  var t='';
  su.forEach(function(x){
    var c=rnd(x[0]),v=x[1];if(!c)return;
    var m=Math.abs(c),badan=v?(m===1?'':nm(m))+v:nm(m);
    t+=t===''?(c<0?'−':'')+badan:(c<0?' − ':' + ')+badan;
  });
  return t===''?'0':t;
}
function lin(a,b){return sum([[a,'x'],[b,'y']]);}
function eqS(q){return lin(q.a,q.b)+' = '+nm(q.c);}
function ineqS(q){return lin(q.a,q.b)+' '+q.op+' '+nm(q.c);}
/* ax + by + c = 0 */
function zeroS(a,b,c){return sum([[a,'x'],[b,'y'],[c,'']])+' = 0';}
/* y = mx + n */
function ymS(m,n){return 'y = '+sum([[m,'x'],[n,'']]);}
function L(a,b,c,op){return {a:a,b:b,c:c,op:op||'='};}
/* garis disederhanakan: FPB = 1, koefisien x positif */
function norm(a,b,c){var g=gcd(gcd(a,b),c)||1;a/=g;b/=g;c/=g;if(a<0||(a===0&&b<0)){a=-a;b=-b;c=-c;}return L(a+0,b+0,c+0);}

/* ---------- transformasi ---------- */
var O0={x:0,y:0};
function P2(x,y){return {x:rnd(x),y:rnd(y)};}
function rot(P,d,C){
  C=C||O0;d=((d%360)+360)%360;var x=P.x-C.x,y=P.y-C.y,r;
  if(d===90)r=[-y,x];else if(d===180)r=[-x,-y];else if(d===270)r=[y,-x];else r=[x,y];
  return P2(r[0]+C.x,r[1]+C.y);
}
function dil(P,k,C){C=C||O0;return P2(C.x+k*(P.x-C.x),C.y+k*(P.y-C.y));}
/* garis ax + by = c dirotasi atau didilatasi dengan pusat O */
function rotLn(q,d){d=((d%360)+360)%360;return d===90?L(-q.b,q.a,q.c):d===180?L(q.a,q.b,-q.c):d===270?L(q.b,-q.a,q.c):L(q.a,q.b,q.c);}
function dilLn(q,k){return L(q.a,q.b,rnd(k*q.c));}
var ATURAN={90:'(−y, x)',180:'(−x, −y)',270:'(y, −x)'};
var HUBUNGAN={90:'x′ = −y dan y′ = x',180:'x′ = −x dan y′ = −y',270:'x′ = y dan y′ = −x'};
var SUBST={90:'x = y′, y = −x′',180:'x = −x′, y = −y′',270:'x = −y′, y = x′'};
function degS(d){return nm(d)+'°';}

/* ---------- penilaian satu langkah ---------- */
function propEq(k,a,b,c){
  if(!isNum(a)||!isNum(b)||!isNum(c)||(a===0&&b===0))return false;
  var e=1e-9;
  return Math.abs(k.a*b-a*k.b)<e&&Math.abs(k.a*c-a*k.c)<e&&Math.abs(k.b*c-b*k.c)<e;
}
function judgeItem(it,a){
  if(it.t==='pg')return a===it.key;
  if(it.t==='num')return isNum(a)&&Math.abs(a-it.key)<1e-6;
  if(it.t==='eq')return Array.isArray(a)&&a.length===3&&propEq(it.key,a[0],a[1],a[2]);
  return false;
}
function validItem(it,a){
  if(it.t==='pg')return isInt(a)&&a>=0&&a<it.o.length;
  if(it.t==='num')return isNum(a)&&Math.abs(a)<1e9;
  if(it.t==='eq')return Array.isArray(a)&&a.length===3&&a.every(function(v){return isNum(v)&&Math.abs(v)<1e9;});
  return false;
}
function inBox(p,B){return !!p&&typeof p==='object'&&isInt(p.x)&&isInt(p.y)&&p.x>=B.x0&&p.x<=B.x1&&p.y>=B.y0&&p.y<=B.y1;}
function samePt(p,q){return p.x===q.x&&p.y===q.y;}
function uniq(arr){var o=[];arr.forEach(function(p){if(!o.some(function(r){return samePt(r,p);}))o.push(p);});return o;}
/* jawaban mentah sah? (jika tidak, peristiwa diabaikan dan tidak dihitung sebagai percobaan) */
function valid(Q,s,a){
  var S=Q.st[s];if(!S)return false;
  if(S.k==='form')return Array.isArray(a)&&a.length===S.it.length&&S.it.every(function(it,i){return validItem(it,a[i]);});
  if(S.k==='pt')return inBox(a,Q.pl);
  if(S.k==='pts'){
    if(!Array.isArray(a)||a.length<1||a.length>16)return false;
    if(!a.every(function(p){return inBox(p,Q.pl);}))return false;
    return uniq(a.slice()).length===a.length;
  }
  return false;
}
function judgePt(c,p){return c.k==='at'&&c.p.some(function(q){return samePt(q,p);});}
/* hasil: {ok, items:[bool]} untuk form; {ok} untuk pt; {ok, kurang, lebih} untuk pts */
function judge(Q,s,a){
  var S=Q.st[s];
  if(S.k==='form'){var r=S.it.map(function(it,i){return judgeItem(it,a[i]);});return {ok:r.every(Boolean),items:r};}
  if(S.k==='pt')return {ok:judgePt(S.cond,a)};
  var kurang=S.key.filter(function(p){return !a.some(function(q){return samePt(p,q);});});
  var lebih=a.filter(function(p){return !S.key.some(function(q){return samePt(p,q);});});
  return {ok:!kurang.length&&!lebih.length,kurang:kurang,lebih:lebih};
}
/* jawaban kunci untuk satu langkah */
function keyAns(Q,s){
  var S=Q.st[s];
  if(S.k==='form')return S.it.map(function(it){return it.t==='eq'?[it.key.a,it.key.b,it.key.c]:it.key;});
  if(S.k==='pt')return {x:S.cond.p[0].x,y:S.cond.p[0].y};
  return S.key.map(function(p){return {x:p.x,y:p.y};});
}
/* jawaban salah yang sah (untuk cek()) */
function wrongAns(Q,s){
  var S=Q.st[s],a=keyAns(Q,s);
  if(S.k==='form'){
    var it=S.it[0],w=a.slice();
    if(it.t==='pg')w[0]=(it.key+1)%it.o.length;
    else if(it.t==='num')w[0]=it.key+1;
    else w[0]=[it.key.a,it.key.b,it.key.c+1];
    return w;
  }
  var geser=function(p){return {x:p.x===Q.pl.x1?p.x-1:p.x+1,y:p.y};};
  if(S.k==='pt')return geser(a);
  var g=geser(a[0]);
  return a.slice(1).filter(function(p){return !samePt(p,g);}).concat([g]);
}

/* ---------- pembentuk langkah ---------- */
function F(nm_,q,it,h,v,lay){return {nm:nm_,k:'form',q:q,it:it,h:h||[],v:v||{},lay:lay||''};}
function PT(nm_,q,p,h,v){return {nm:nm_,k:'pt',q:q,cond:{k:'at',p:[{x:p.x,y:p.y}]},h:h||[],v:v||{}};}
function PS(nm_,q,key,h,v){return {nm:nm_,k:'pts',q:q,key:key.map(function(p){return {x:p.x,y:p.y};}),h:h||[],v:v||{}};}
function pg(lab,o,key){return {t:'pg',lab:lab,o:o,key:key};}
function num(lab,key,u){return {t:'num',lab:lab,key:rnd(key),u:u||''};}
function eqI(lab,k,pts){return {t:'eq',lab:lab,key:{a:k.a,b:k.b,c:k.c},pts:pts||[]};}
/* pilihan ganda: jawaban + paling banyak 3 pengecoh (pengecoh yang sama dengan jawaban atau kembar dibuang) */
function pgS(rng,lab,key,dis){
  var d=[];dis.forEach(function(x){if(x!==key&&d.indexOf(x)<0&&d.length<3)d.push(x);});
  var o=shuffle([key].concat(d),rng);return pg(lab,o,o.indexOf(key));
}
/* sepasang isian koordinat (x, y) dengan layout 'koor' */
function kr(lab,P){return [{t:'num',lab:lab,key:rnd(P.x),u:'',ax:'x'},{t:'num',lab:'',key:rnd(P.y),u:'',ax:'y'}];}
function FK(nm_,q,pairs,h,v){var it=[];pairs.forEach(function(p){it=it.concat(kr(p[0],p[1]));});return F(nm_,q,it,h,v,'koor');}

/* ---------- pembentuk tampilan bidang ---------- */
function mk(P,c,l){return {x:P.x,y:P.y,c:c||'k',l:l===undefined?'':l};}
function mkN(P,c,nama){return mk(P,c,nama+ptS(P));}
function poly(ps,c,nama){return {p:ps.map(function(P){return [P.x,P.y];}),c:c,l:nama||[]};}
function seg(A,B,c,dash){return {a:[A.x,A.y],b:[B.x,B.y],c:c||'k',d:dash?1:0};}
function arc(C,A,deg,c){return {c:[C.x,C.y],a:[A.x,A.y],deg:deg,col:c||'k'};}
function lnV(q,c,lbl){return {a:q.a,b:q.b,c:q.c,col:c||'a',l:lbl===undefined?'':lbl};}
function ctr(P,l){return {x:P.x,y:P.y,l:l===undefined?((P.x||P.y)?'P'+ptS(P):'O'):l};}
function mkQ(t,l,v,o){
  return {t:t,l:l,v:v,bg:BG_TIPE[t],jd:'Tipe '+t+' · '+TIPE[t],lv:LEVEL[l],kko:o.kko,soal:o.soal,pl:o.pl||FULL,
    st:o.st||[],vz:o.vz||{},bahas:o.bahas||[],m:o.m||{}};
}
/* gabungan tampilan: salin lalu timpa */
function V(){var r={};for(var i=0;i<arguments.length;i++){var o=arguments[i]||{};for(var k in o)if(o[k]!==undefined&&o[k]!==null)r[k]=o[k];}return r;}
var CAP_R='Biru = asal, jingga = bayangan. Panah melengkung menunjukkan arah putaran.';
var CAP_D='Biru = asal, jingga = bayangan. Garis putus-putus melewati pusat dilatasi.';
var CAP_G='Garis biru = garis asal, garis jingga = garis bayangan.';

/* ================= A. ROTASI TITIK DAN BANGUN (Tipe 1–7) ================= */
/* titik acak dengan koordinat bulat dari [-m, m] selain 0 */
function titik(rng,m,syarat){
  for(var i=0;i<200;i++){var P={x:rnz(rng,-m,m),y:rnz(rng,-m,m)};if(!syarat||syarat(P))return P;}
  return {x:2,y:1};
}
function vRot(A,nA,d,o){
  o=o||{};var C=o.C||O0,mks=[mkN(A,'a',nA)];
  if(o.B)mks.push(mkN(o.B,'b',nA+'′'));
  return V({mk:mks,ctr:ctr(C),seg:o.B?[seg(C,A,'a',1),seg(C,o.B,'b',1)]:[seg(C,A,'a',1)],
    arc:o.B?arc(C,A,o.arah||d,'b'):undefined,cap:CAP_R});
}
var DIS_ATURAN={90:['(y, −x)','(−x, −y)','(y, x)'],180:['(−y, x)','(x, −y)','(−x, y)'],270:['(−y, x)','(−x, −y)','(x, −y)']};
function hAturan(d){
  return [d===180?'Rotasi 180° membalik tanda kedua koordinat, tetapi posisinya tidak bertukar.':'Rotasi '+degS(d)+' menukar posisi x dan y, lalu satu tanda berubah.',
    'Uji dengan titik (1, 0): diputar '+degS(d)+' berlawanan arah jarum jam, titik itu berpindah ke '+ptS(rot({x:1,y:0},d))+'.'];
}

function g1(rng){
  var A=titik(rng,6,function(P){return P.x!==P.y;}),B=rot(A,90),v0=vRot(A,'A',90);
  return mkQ(1,'L','a',{m:{A:A,B:B,d:90},kko:'menentukan',
    soal:'Titik <b>A'+ptS(A)+'</b> dirotasi <b>90°</b> dengan pusat O. Tentukan koordinat A′.',
    st:[
      F('Aturan','Aturan pemetaan rotasi 90° dengan pusat O adalah …',[pgS(rng,'(x, y) dipetakan ke',ATURAN[90],DIS_ATURAN[90])],hAturan(90),v0),
      F('Nilai x′','Dengan aturan (−y, x), hitung x′.',[num('x′ =',B.x)],['x′ = −y. Ganti y dengan '+nm(A.y)+', lalu ubah tandanya.'],v0),
      F('Nilai y′','Hitung y′.',[num('y′ =',B.y)],['y′ = x, jadi y′ sama dengan absis titik A.'],v0),
      PT('Letak A′','Ketuk letak A′ pada bidang koordinat.',B,['A′'+ptS(B)+' berarti '+nm(B.x)+' satuan ke '+(B.x<0?'kiri':'kanan')+', lalu '+nm(Math.abs(B.y))+' satuan ke '+(B.y<0?'bawah':'atas')+'.'],v0)],
    vz:vRot(A,'A',90,{B:B}),
    bahas:['Rotasi 90° dengan pusat O: (x, y) → (−y, x).','x′ = −('+nm(A.y)+') = '+nm(B.x)+' dan y′ = '+nm(A.x)+'.','Jadi A′'+ptS(B)+'.']});
}
function g2(rng){
  var A=titik(rng,8),B=rot(A,180),v0=vRot(A,'B',180);
  return mkQ(2,'L','a',{m:{A:A,B:B,d:180},kko:'menentukan',
    soal:'Titik <b>B'+ptS(A)+'</b> dirotasi <b>180°</b> dengan pusat O. Tentukan B′.',
    st:[
      F('Aturan','Aturan pemetaan rotasi 180° dengan pusat O adalah …',[pgS(rng,'(x, y) dipetakan ke',ATURAN[180],DIS_ATURAN[180])],hAturan(180),v0),
      FK('Koordinat B′','Tulis koordinat B′.',[['B′',B]],['Ubah tanda kedua koordinat B: x′ = −x dan y′ = −y.'],v0),
      PT('Letak B′','Ketuk letak B′ pada bidang koordinat.',B,['B′ berada di seberang O, segaris dengan B dan O.'],v0)],
    vz:vRot(A,'B',180,{B:B}),
    bahas:['Rotasi 180°: (x, y) → (−x, −y).','B′ = (−('+nm(A.x)+'), −('+nm(A.y)+')) = '+ptS(B)+'.']});
}
function g3(rng,v){
  var A=titik(rng,7),B=rot(A,270),sud=v==='a'?'90° searah jarum jam':v==='b'?'−90°':'270°',v0=vRot(A,'C',270);
  var s1=v==='c'
    ?F('Arah setara','Rotasi 270° (berlawanan arah jarum jam) setara dengan …',[pgS(rng,'Setara dengan','90° searah jarum jam',['90° berlawanan arah jarum jam','180°'])],
        ['Putaran penuh 360°. Memutar 270° ke satu arah sama dengan memutar 360° − 270° = 90° ke arah sebaliknya.'],v0)
    :F('Arah setara','Rotasi '+sud+' setara dengan …',[pgS(rng,'Setara dengan','270° berlawanan arah jarum jam',['90° berlawanan arah jarum jam','180°'])],
        ['Sudut negatif berarti searah jarum jam. 90° searah jarum jam = 360° − 90° berlawanan arah jarum jam.'],v0);
  return mkQ(3,'M',v,{m:{A:A,B:B,d:270},kko:'membedakan',
    soal:'Titik <b>C'+ptS(A)+'</b> dirotasi <b>'+sud+'</b> dengan pusat O. Tentukan C′.',
    st:[s1,
      F('Aturan','Aturan pemetaan yang dipakai adalah …',[pgS(rng,'(x, y) dipetakan ke',ATURAN[270],['(−y, x)','(−x, −y)'])],hAturan(270),v0),
      FK('Koordinat C′','Tulis koordinat C′.',[['C′',B]],['Dengan (y, −x): x′ = '+nm(A.y)+', y′ = −('+nm(A.x)+').'],v0),
      PT('Letak C′','Ketuk letak C′ pada bidang koordinat.',B,['Titik C diputar seperempat putaran searah jarum jam.'],v0)],
    vz:vRot(A,'C',270,{B:B,arah:v==='c'?270:-90}),
    bahas:['Rotasi '+sud+' = rotasi 90° searah jarum jam = rotasi 270° berlawanan arah jarum jam.','Aturannya (x, y) → (y, −x).','C′ = '+ptS(B)+'.']});
}
function g4(rng,v){
  var d=v==='a'?90:v==='b'?180:270,w=ri(rng,2,4),h=ri(rng,2,4),x0,y0;
  do{x0=ri(rng,0,6-w);y0=ri(rng,0,6-h);}while(x0===0&&y0===0);
  var P={x:x0,y:y0},Qp={x:x0+w,y:y0},R={x:x0,y:y0+h},T=[P,Qp,R],B=T.map(function(X){return rot(X,d);});
  var nama=['P','Q','R'],asal=poly(T,'a',nama);
  var vw=function(n){var o={poly:[asal],ctr:ctr(O0),cap:CAP_R};if(n>0)o.mk=B.slice(0,n).map(function(X,i){return mkN(X,'b',nama[i]+'′');});if(n===3){o.poly=[asal,poly(B,'b',['P′','Q′','R′'])];delete o.mk;o.arc=arc(O0,P,d,'k');}return V(o);};
  return mkQ(4,'M',v,{m:{T:T,B:B,d:d},kko:'menerapkan',
    soal:'Segitiga PQR dengan <b>P'+ptS(P)+', Q'+ptS(Qp)+', R'+ptS(R)+'</b> dirotasi <b>'+degS(d)+'</b> dengan pusat O. Gambarlah bayangannya.',
    st:[PT('Letak P′','Ketuk letak P′.',B[0],['Gunakan aturan '+ATURAN[d]+' untuk titik P'+ptS(P)+'.'],vw(0)),
      PT('Letak Q′','Ketuk letak Q′.',B[1],['Gunakan aturan yang sama untuk Q'+ptS(Qp)+'.'],vw(1)),
      PT('Letak R′','Ketuk letak R′.',B[2],['Gunakan aturan yang sama untuk R'+ptS(R)+'.'],vw(2)),
      F('Hubungan','Bagaimana hubungan segitiga PQR dan P′Q′R′?',[pgS(rng,'Segitiga P′Q′R′','kongruen',['sebangun tetapi lebih besar','berbeda bentuk'])],
        ['Rotasi tidak mengubah jarak antartitik, jadi panjang sisi-sisinya tetap.'],vw(3))],
    vz:vw(3),
    bahas:['Aturan rotasi '+degS(d)+': (x, y) → '+ATURAN[d]+'.','P′'+ptS(B[0])+', Q′'+ptS(B[1])+', R′'+ptS(B[2])+'.','Rotasi tidak mengubah ukuran, jadi P′Q′R′ kongruen dengan PQR.']});
}
function g5(rng,v){
  var d=v==='a'?90:v==='b'?180:270,A=titik(rng,6,function(P){return Math.abs(P.x)!==Math.abs(P.y);}),B=rot(A,d);
  var vw=V({mk:[mkN(A,'a','K'),mkN(B,'b','K′')],ctr:ctr(O0),seg:[seg(O0,A,'a',1),seg(O0,B,'b',1)],cap:CAP_R});
  var rel=HUBUNGAN[d],dis=[90,180,270].filter(function(x){return x!==d;}).map(function(x){return HUBUNGAN[x];});
  return mkQ(5,'H',v,{m:{A:A,B:B,d:d},kko:'menganalisis',
    soal:'Titik <b>K'+ptS(A)+'</b> dirotasi dengan pusat O sehingga bayangannya <b>K′'+ptS(B)+'</b>. Berapa sudut rotasinya?',
    st:[F('Hubungan koordinat','Bandingkan koordinat K dan K′. Hubungan yang benar adalah …',[pgS(rng,'Hubungan',rel,dis)],
        ['Periksa dulu: apakah x dan y bertukar posisi? Lalu periksa tandanya.','Bandingkan x′ = '+nm(B.x)+' dengan x = '+nm(A.x)+' dan y = '+nm(A.y)+'.'],vw),
      F('Sudut rotasi','Besar sudut rotasinya adalah …',[pgS(rng,'Sudut (berlawanan arah jarum jam)',degS(d),['90°','180°','270°'])],
        ['Cocokkan hubungan tadi dengan tabel: (−y, x) = 90°, (−x, −y) = 180°, (y, −x) = 270°.'],vw)],
    vz:V(vw,{arc:arc(O0,A,d,'b')}),
    bahas:['K'+ptS(A)+' → K′'+ptS(B)+' memenuhi '+rel+'.','Hubungan itu adalah aturan rotasi '+degS(d)+'.']});
}
function g6(rng,v){
  var d=v==='a'?90:v==='b'?180:270,B=titik(rng,6),A=rot(B,360-d);
  var vw=V({mk:[mkN(B,'b','D′')],ctr:ctr(O0),cap:CAP_R});
  var st2,st3;
  if(d===90){st2=F('Nilai y','Dari −y = x′, tentukan nilai y.',[num('y =',A.y)],['−y = '+nm(B.x)+', jadi y adalah lawan dari '+nm(B.x)+'.'],vw);
    st3=F('Nilai x','Dari x = y′, tentukan nilai x.',[num('x =',A.x)],['x langsung sama dengan y′ = '+nm(B.y)+'.'],vw);}
  else if(d===270){st2=F('Nilai y','Dari y = x′, tentukan nilai y.',[num('y =',A.y)],['y langsung sama dengan x′ = '+nm(B.x)+'.'],vw);
    st3=F('Nilai x','Dari −x = y′, tentukan nilai x.',[num('x =',A.x)],['−x = '+nm(B.y)+', jadi x adalah lawan dari '+nm(B.y)+'.'],vw);}
  else{st2=F('Nilai x','Dari −x = x′, tentukan nilai x.',[num('x =',A.x)],['−x = '+nm(B.x)+', jadi x adalah lawan dari '+nm(B.x)+'.'],vw);
    st3=F('Nilai y','Dari −y = y′, tentukan nilai y.',[num('y =',A.y)],['−y = '+nm(B.y)+', jadi y adalah lawan dari '+nm(B.y)+'.'],vw);}
  return mkQ(6,'H',v,{m:{A:A,B:B,d:d},kko:'menganalisis',
    soal:'Titik D dirotasi <b>'+degS(d)+'</b> dengan pusat O menghasilkan <b>D′'+ptS(B)+'</b>. Tentukan koordinat D.',
    st:[F('Aturan','Aturan rotasi '+degS(d)+' adalah …',[pgS(rng,'(x, y) dipetakan ke',ATURAN[d],DIS_ATURAN[d])],hAturan(d),vw),
      st2,st3,
      PT('Letak D','Ketuk letak D pada bidang koordinat.',A,['Periksa: bila D diputar '+degS(d)+', hasilnya harus D′'+ptS(B)+'.'],vw)],
    vz:V({mk:[mkN(A,'a','D'),mkN(B,'b','D′')],ctr:ctr(O0),seg:[seg(O0,A,'a',1),seg(O0,B,'b',1)],arc:arc(O0,A,d,'b'),cap:CAP_R}),
    bahas:['Aturan rotasi '+degS(d)+': (x, y) → '+ATURAN[d]+'.','Samakan dengan D′'+ptS(B)+', lalu selesaikan untuk x dan y.','Jadi D'+ptS(A)+'. Cara lain: putar D′ sebesar '+degS(d)+' ke arah sebaliknya.']});
}
function g7(rng,v){
  var d=v==='a'?90:v==='b'?180:270,C,D;
  do{C={x:ri(rng,-3,3),y:ri(rng,-3,3)};}while(C.x===0&&C.y===0);
  D={x:rnz(rng,-4,4),y:rnz(rng,-4,4)};
  var A=P2(C.x+D.x,C.y+D.y),RD=rot(D,d),B=P2(C.x+RD.x,C.y+RD.y);
  var vw=V({mk:[mkN(A,'a','A')],ctr:ctr(C),seg:[seg(C,A,'a',1)],cap:CAP_R});
  return mkQ(7,'H',v,{m:{A:A,C:C,D:D,RD:RD,B:B,d:d},kko:'menerapkan',
    soal:'Titik <b>A'+ptS(A)+'</b> dirotasi <b>'+degS(d)+'</b> dengan pusat <b>P'+ptS(C)+'</b>. Tentukan A′.',
    st:[FK('Geser ke O','Hitung selisih terhadap pusat: (x − a, y − b).',[['(x − a, y − b)',D]],['x − a = '+nm(A.x)+' − ('+nm(C.x)+') dan y − b = '+nm(A.y)+' − ('+nm(C.y)+').'],vw),
      FK('Rotasi '+degS(d),'Rotasikan hasil tadi sebesar '+degS(d)+' dengan pusat O.',[['Hasil rotasi',RD]],['Gunakan aturan '+ATURAN[d]+' pada '+ptS(D)+'.'],vw),
      FK('Geser kembali','Tambahkan kembali (a, b) = '+ptS(C)+'.',[['A′',B]],['Jumlahkan: '+ptS(RD)+' + '+ptS(C)+'.'],vw),
      PT('Letak A′','Ketuk letak A′ pada bidang koordinat.',B,['Jarak A′ ke P harus sama dengan jarak A ke P.'],vw)],
    vz:V(vw,{mk:[mkN(A,'a','A'),mkN(B,'b','A′')],seg:[seg(C,A,'a',1),seg(C,B,'b',1)],arc:arc(C,A,d,'b')}),
    bahas:['Selisih terhadap pusat: '+ptS(D)+'.','Dirotasi '+degS(d)+' menjadi '+ptS(RD)+'.','Ditambah '+ptS(C)+' menjadi A′'+ptS(B)+'.']});
}

/* ================= B. DILATASI TITIK DAN BANGUN (Tipe 8–14) ================= */
function vDil(A,nA,C,B){
  C=C||O0;var mks=[mkN(A,'a',nA)],sg=[];
  if(B){mks.push(mkN(B,'b',nA+'′'));sg.push(seg(C,(Math.abs(B.x-C.x)+Math.abs(B.y-C.y)>Math.abs(A.x-C.x)+Math.abs(A.y-C.y))?B:A,'k',1));
    if((B.x-C.x)*(A.x-C.x)+(B.y-C.y)*(A.y-C.y)<0)sg=[seg(C,A,'a',1),seg(C,B,'b',1)];}
  else sg.push(seg(C,A,'a',1));
  return V({mk:mks,ctr:ctr(C),seg:sg,cap:CAP_D});
}
var DIS_DIL=['(x + k, y + k)','(kx, y)','(x, ky)'];
function hDil(){return ['Dilatasi [O, k] mengalikan kedua koordinat dengan k.','Hati-hati: koordinat dikalikan k, bukan ditambah k.'];}
function g8(rng){
  var k=pick(rng,[2,3]),A=titik(rng,3),B=dil(A,k),v0=vDil(A,'A');
  return mkQ(8,'L','a',{m:{A:A,B:B,k:k},kko:'menentukan',
    soal:'Titik <b>A'+ptS(A)+'</b> didilatasi dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan A′.',
    st:[F('Aturan','Aturan pemetaan dilatasi [O, k] adalah …',[pgS(rng,'(x, y) dipetakan ke','(kx, ky)',DIS_DIL)],hDil(),v0),
      FK('Koordinat A′','Tulis koordinat A′.',[['A′',B]],['x′ = '+nm(k)+' × '+nm(A.x)+' dan y′ = '+nm(k)+' × '+nm(A.y)+'.'],v0),
      PT('Letak A′','Ketuk letak A′ pada bidang koordinat.',B,['A′ terletak pada garis yang melalui O dan A, '+nm(k)+' kali lebih jauh dari O.'],v0)],
    vz:vDil(A,'A',O0,B),
    bahas:['Dilatasi [O, '+nm(k)+']: (x, y) → ('+nm(k)+'x, '+nm(k)+'y).','A′ = ('+nm(k)+' × '+nm(A.x)+', '+nm(k)+' × '+nm(A.y)+') = '+ptS(B)+'.']});
}
function g9(rng){
  var n=pick(rng,[2,3,4]),k=1/n,m=Math.floor(9/n),A={x:n*rnz(rng,-m,m),y:n*rnz(rng,-m,m)},B=dil(A,k),v0=vDil(A,'B');
  return mkQ(9,'L','a',{m:{A:A,B:B,k:k},kko:'menentukan',
    soal:'Titik <b>B'+ptS(A)+'</b> didilatasi dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan B′.',
    st:[F('Jenis dilatasi','Dilatasi ini termasuk …',[pgS(rng,'Jenis','pengecilan',['perbesaran','tetap'])],['Bandingkan k dengan 1. Jika 0 < k < 1, bayangan lebih dekat ke O.'],v0),
      FK('Koordinat B′','Tulis koordinat B′.',[['B′',B]],['Mengalikan dengan '+nm(k)+' sama dengan membagi '+nm(n)+'.'],v0),
      PT('Letak B′','Ketuk letak B′ pada bidang koordinat.',B,['B′ terletak di antara O dan B.'],v0)],
    vz:vDil(A,'B',O0,B),
    bahas:['k = '+nm(k)+' berada di antara 0 dan 1, jadi pengecilan.','B′ = ('+nm(k)+' × '+nm(A.x)+', '+nm(k)+' × '+nm(A.y)+') = '+ptS(B)+'.']});
}
function g10(rng){
  var k=pick(rng,[-1,-2,-3,-0.5]),A=k===-0.5?{x:2*sgn(rng),y:2*sgn(rng)}:titik(rng,3),B=dil(A,k),v0=vDil(A,'C');
  return mkQ(10,'M','a',{m:{A:A,B:B,k:k},kko:'membedakan',
    soal:'Titik <b>C'+ptS(A)+'</b> didilatasi dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan C′.',
    st:[F('Letak bayangan','Bagaimana letak bayangan terhadap pusat O?',[pgS(rng,'C′ terletak','berlawanan pihak dengan titik asal',['sepihak dengan titik asal'])],['Tanda negatif pada k membuat bayangan pindah ke seberang pusat.'],v0),
      FK('Koordinat C′','Tulis koordinat C′.',[['C′',B]],['Kalikan kedua koordinat dengan '+nm(k)+'. Perhatikan tandanya.'],v0),
      PT('Letak C′','Ketuk letak C′ pada bidang koordinat.',B,['C′ segaris dengan C dan O, tetapi di seberang O.'],v0)],
    vz:vDil(A,'C',O0,B),
    bahas:['k negatif → bayangan berlawanan pihak dengan titik asal terhadap O.','C′ = ('+nm(k)+' × '+nm(A.x)+', '+nm(k)+' × '+nm(A.y)+') = '+ptS(B)+'.',
      Math.abs(k)>1?'|k| > 1, jadi bayangan juga diperbesar.':Math.abs(k)<1?'|k| < 1, jadi bayangan juga diperkecil.':'|k| = 1, jadi ukurannya tetap (sama dengan rotasi 180°).']});
}
function jenisK(k){return (Math.abs(k)>1?'perbesaran':'pengecilan')+', '+(k>0?'sepihak':'berlawanan pihak');}
function g11(rng){
  var k=pick(rng,[-3,-2,-0.5,0.5,2,3]),A;
  if(Math.abs(k)===0.5)A={x:2*rnz(rng,-4,4),y:2*rnz(rng,-4,4)};else{var m=Math.floor(9/Math.abs(k));A=titik(rng,m);}
  var B=dil(A,k),vw=V({mk:[mkN(A,'a','P'),mkN(B,'b','P′')],ctr:ctr(O0),cap:CAP_D});
  var opsi=['perbesaran, sepihak','pengecilan, sepihak','perbesaran, berlawanan pihak','pengecilan, berlawanan pihak'];
  return mkQ(11,'M','a',{m:{A:A,B:B,k:k},kko:'menganalisis',
    soal:'Titik <b>P'+ptS(A)+'</b> didilatasi dengan pusat O menghasilkan <b>P′'+ptS(B)+'</b>. Tentukan faktor skalanya.',
    st:[F('x′ : x','Hitung x′ : x.',[num('x′ : x =',k)],['Bagi '+nm(B.x)+' dengan '+nm(A.x)+'. Boleh ditulis sebagai pecahan, misalnya −1/2.'],vw),
      F('y′ : y','Hitung y′ : y.',[num('y′ : y =',k)],['Bagi '+nm(B.y)+' dengan '+nm(A.y)+'. Hasilnya harus sama dengan x′ : x.'],vw),
      F('Jenis dilatasi','Jadi k = '+nm(k)+'. Dilatasi ini termasuk …',[pgS(rng,'Jenis',jenisK(k),opsi)],['Besar-kecil dilihat dari |k|; tanda k menentukan pihak.'],vw)],
    vz:V(vw,{seg:[seg(O0,A,'a',1),seg(O0,B,'b',1)]}),
    bahas:['k = x′ : x = '+nm(B.x)+' : '+nm(A.x)+' = '+nm(k)+'.','y′ : y = '+nm(B.y)+' : '+nm(A.y)+' = '+nm(k)+' (sama).','|k| '+(Math.abs(k)>1?'> 1 → perbesaran':'< 1 → pengecilan')+'; k '+(k>0?'positif → sepihak':'negatif → berlawanan pihak')+'.']});
}
/* pilihan perbandingan luas: k², |k|, 2|k| (bila 2|k| = k², diganti |k| + 1) */
function opsiLuas(k){
  var a=Math.abs(k),k2=rnd(k*k),d2=rnd(2*a)===k2?['|k| + 1 = '+nm(a+1)]:['2|k| = '+nm(2*a)];
  return {key:'k² = '+nm(k2),dis:['|k| = '+nm(a)].concat(d2)};
}
function persegi(x0,y0,w,h){return [{x:x0,y:y0},{x:x0+w,y:y0},{x:x0+w,y:y0+h},{x:x0,y:y0+h}];}
function g12(rng,v){
  var k=v==='b'?-2:pick(rng,[2,3]),a=Math.abs(k),m=Math.floor(9/a),w=ri(rng,2,3),h=ri(rng,1,w-1);
  var x0=ri(rng,-m,m-w),y0=ri(rng,-m,m-h),T=persegi(x0,y0,w,h),B=T.map(function(X){return dil(X,k);});
  var nm4=['A','B','C','D'],ol=opsiLuas(k);
  var v0=V({poly:[poly(T,'a',nm4)],ctr:ctr(O0),cap:'Biru = persegi panjang asal. Satu kotak = 1 satuan.'});
  var vw=V({poly:[poly(T,'a',nm4),poly(B,'b',['A′','B′','C′','D′'])],ctr:ctr(O0),cap:CAP_D+' Satu kotak = 1 satuan.'});
  return mkQ(12,'M',v,{m:{T:T,B:B,k:k,w:w,h:h},kko:'menghitung',
    soal:'Persegi panjang ABCD dengan <b>A'+ptS(T[0])+', B'+ptS(T[1])+', C'+ptS(T[2])+', D'+ptS(T[3])+'</b> didilatasi dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan luas bayangannya.',
    st:[F('Panjang A′B′','Hitung panjang A′B′.',[num('A′B′ =',a*w)],['AB = '+nm(w)+'. Panjang sisi bayangan = |k| × panjang sisi asal.'],v0),
      F('Lebar B′C′','Hitung lebar B′C′.',[num('B′C′ =',a*h)],['BC = '+nm(h)+'. Kalikan dengan |k| = '+nm(a)+'.'],v0),
      F('Luas bayangan','Hitung luas A′B′C′D′.',[num('Luas =',a*a*w*h)],['Luas persegi panjang = panjang × lebar.'],v0),
      F('Perbandingan luas','Luas bayangan : luas asal sama dengan …',[pgS(rng,'Perbandingan',ol.key,ol.dis)],['Luas asal = '+nm(w*h)+'. Bagi luas bayangan dengan luas asal.'],vw)],
    vz:vw,
    bahas:['A′B′ = '+nm(a)+' × '+nm(w)+' = '+nm(a*w)+' dan B′C′ = '+nm(a)+' × '+nm(h)+' = '+nm(a*h)+'.','Luas bayangan = '+nm(a*w)+' × '+nm(a*h)+' = '+nm(a*a*w*h)+'.','Luas asal '+nm(w*h)+', jadi perbandingannya '+nm(a*a)+' = k².']});
}
var OBJEK_BONE=[['foto Rumah Adat Bola Soba','mading sekolah'],['foto Museum Lapawawoi','mading sekolah'],['foto Masjid Raya Watampone','buletin OSIS'],['foto Tugu Arung Palakka','papan pengumuman']];
function g13(rng){
  var k,w,h;
  for(var i=0;i<100;i++){k=pick(rng,[1.5,2,2.5,3,0.5]);w=ri(rng,2,10);h=ri(rng,2,10);
    if(w<h&&isInt(k*w)&&isInt(k*h)&&k*h<=30)break;}
  if(!(w<h&&isInt(k*w)&&isInt(k*h)))k=2,w=4,h=6;
  var ob=pick(rng,OBJEK_BONE),W=k*w,H=k*h,mx=Math.max(h,H),g=mx>16?2:1,top=Math.ceil((mx+1)/g)*g+g;
  var pl={x0:-g,y0:-g,x1:top,y1:top,g:g,lb:g*((top/g)>12?2:1)};
  var O=O0,R0=persegi(0,0,w,h),R1=persegi(0,0,W,H);
  var kot=g>1?' Satu kotak = '+g+' cm.':' Satu kotak = 1 cm.';
  var v0=V({poly:[poly(R0,'a',[])],ctr:ctr(O,'O'),cap:'Biru = foto lama (satuan cm).'+kot});
  var vw=V({poly:[poly(R0,'a',[]),poly(R1,'b',[])],ctr:ctr(O,'O'),seg:[seg(O,{x:W,y:H},'k',1)],cap:'Biru = foto lama, jingga = foto baru (satuan cm). Pusat dilatasi di pojok kiri bawah foto.'+kot});
  var verb=k<1?'diperkecil':'diperbesar';
  return mkQ(13,'M','a',{m:{k:k,w:w,h:h,W:W,H:H},kko:'menerapkan',pl:pl,
    soal:'OSIS SMA di Watampone akan memajang '+ob[0]+' di '+ob[1]+'. Foto berukuran <b>'+nm(w)+' cm × '+nm(h)+' cm</b> '+verb+' dengan faktor skala <b>'+nm(k)+'</b>. Tentukan ukuran foto hasil '+(k<1?'pengecilan':'perbesaran')+'.',
    st:[F('Lebar baru','Hitung lebar foto baru.',[num('Lebar =',W,'cm')],['Lebar baru = k × lebar lama = '+nm(k)+' × '+nm(w)+'.'],v0),
      F('Panjang baru','Hitung panjang foto baru.',[num('Panjang =',H,'cm')],['Panjang baru = '+nm(k)+' × '+nm(h)+'.'],v0),
      F('Foto baru','Foto baru dibandingkan foto lama …',[pgS(rng,'Kedua foto','sebangun',['kongruen','tidak sebangun'])],['Dilatasi mengubah ukuran tetapi tidak mengubah bentuk.'],vw)],
    vz:vw,
    bahas:['Lebar baru = '+nm(k)+' × '+nm(w)+' = '+nm(W)+' cm.','Panjang baru = '+nm(k)+' × '+nm(h)+' = '+nm(H)+' cm.','Ukuran berubah tetapi perbandingan sisi tetap, jadi kedua foto sebangun.']});
}
function g14(rng){
  var k=pick(rng,[-2,-1,2,0.5]),C,D,A,B;
  for(var i=0;i<200;i++){
    C={x:ri(rng,-3,3),y:ri(rng,-3,3)};if(C.x===0&&C.y===0)continue;
    D=k===0.5?{x:2*rnz(rng,-2,2),y:2*rnz(rng,-2,2)}:{x:rnz(rng,-4,4),y:rnz(rng,-4,4)};
    A=P2(C.x+D.x,C.y+D.y);B=dil(A,k,C);
    if(Math.max(Math.abs(A.x),Math.abs(A.y),Math.abs(B.x),Math.abs(B.y))<=9)break;
  }
  var KD=P2(k*D.x,k*D.y),vw=V({mk:[mkN(A,'a','A')],ctr:ctr(C),seg:[seg(C,A,'a',1)],cap:CAP_D});
  return mkQ(14,'H','a',{m:{A:A,C:C,D:D,KD:KD,B:B,k:k},kko:'menerapkan',
    soal:'Titik <b>A'+ptS(A)+'</b> didilatasi dengan pusat <b>P'+ptS(C)+'</b> dan faktor skala <b>'+nm(k)+'</b>. Tentukan A′.',
    st:[FK('Selisih','Hitung selisih terhadap pusat: (x − a, y − b).',[['(x − a, y − b)',D]],['Kurangkan koordinat pusat dari koordinat A.'],vw),
      FK('Kali k','Kalikan selisih itu dengan k = '+nm(k)+'.',[['k(x − a, y − b)',KD]],['Kalikan kedua koordinat '+ptS(D)+' dengan '+nm(k)+'.'],vw),
      FK('Tambah pusat','Tambahkan kembali (a, b) = '+ptS(C)+'.',[['A′',B]],['Jumlahkan '+ptS(KD)+' dengan '+ptS(C)+'.'],vw),
      PT('Letak A′','Ketuk letak A′ pada bidang koordinat.',B,['A′ segaris dengan P dan A.'],vw)],
    vz:vDil(A,'A',C,B),
    bahas:['Selisih: '+ptS(D)+'.','Dikali '+nm(k)+': '+ptS(KD)+'.','Ditambah '+ptS(C)+': A′'+ptS(B)+'.']});
}

/* ================= C. ROTASI DAN DILATASI PERSAMAAN GARIS (Tipe 15–19) ================= */
/* ax + by = c dari y = mx + n */
function dariYM(m,n){return L(-m,1,n);}
function g15(rng){
  var m=pick(rng,[-3,-2,-1,1,2,3]),n=ri(rng,-3,3),P1={x:0,y:n},P2_={x:1,y:m+n},B1=rot(P1,90),B2=rot(P2_,90);
  var q=dariYM(m,n),qb=rotLn(q,90),grad=-1/m;
  /* bayangan: x + my + n = 0 */
  var key=zeroS(1,m,n),dis=[zeroS(1,-m,n),zeroS(m,1,n),zeroS(1,m,-n),zeroS(-m,1,n)];
  var la=lnV(q,'a',ymS(m,n)),v0=V({ln:[la],ctr:ctr(O0),cap:CAP_G});
  var v1=V(v0,{mk:[mkN(P1,'a',''),mkN(P2_,'a','')]}),v2=V(v1,{mk:[mk(P1,'a',ptS(P1)),mk(P2_,'a',ptS(P2_)),mk(B1,'b',ptS(B1)),mk(B2,'b',ptS(B2))],seg:[seg(O0,P1,'a',1),seg(O0,B1,'b',1)]});
  return mkQ(15,'M','a',{m:{m:m,n:n,P1:P1,P2:P2_,B1:B1,B2:B2,q:q,qb:qb,grad:grad},kko:'menerapkan',
    soal:'Garis <b>'+ymS(m,n)+'</b> dirotasi <b>90°</b> dengan pusat O. Tentukan persamaan bayangannya.',
    st:[PS('Dua titik','Ketuk dua titik pada garis asal: titik dengan x = 0 dan titik dengan x = 1.',[P1,P2_],['Substitusikan x = 0 dan x = 1 ke '+ymS(m,n)+' untuk mendapat nilai y.'],v0),
      FK('Bayangan titik 1','Tentukan bayangan titik '+ptS(P1)+' oleh rotasi 90°.',[['Bayangan',B1]],['Rotasi 90°: (x, y) → (−y, x).'],v1),
      FK('Bayangan titik 2','Tentukan bayangan titik '+ptS(P2_)+' oleh rotasi 90°.',[['Bayangan',B2]],['Gunakan aturan (−y, x) yang sama.'],v1),
      PS('Letak bayangan','Ketuk kedua titik bayangan pada bidang.',[B1,B2],['Kedua titik bayangan yang kamu hitung tadi.'],V(v0,{mk:[mk(P1,'a',ptS(P1)),mk(P2_,'a',ptS(P2_))]})),
      F('Gradien','Hitung gradien garis bayangan. Boleh ditulis pecahan, misalnya −1/2.',[num('m =',grad)],['m = (y₂ − y₁) : (x₂ − x₁) memakai '+ptS(B1)+' dan '+ptS(B2)+'.'],v2),
      F('Persamaan bayangan','Persamaan garis bayangan adalah …',[pgS(rng,'Garis bayangan',key,dis.slice(0,6))],['Garis melalui '+ptS(B1)+' dengan gradien '+nm(grad)+'. Susun y − y₁ = m(x − x₁), lalu pindahkan semua suku ke ruas kiri.'],V(v2,{ln:[la,lnV(qb,'b','')]}))],
    vz:V(v2,{ln:[la,lnV(qb,'b',key)]}),
    bahas:['Titik pada garis: '+ptS(P1)+' dan '+ptS(P2_)+'.','Bayangannya oleh rotasi 90°: '+ptS(B1)+' dan '+ptS(B2)+'.','Gradien '+nm(grad)+', persamaan bayangan '+key+'.']});
}
/* hasil substitusi dalam peubah beraksen, mis. "2y′ + x′ = 4" */
function subPrim(suku,c){return sum(suku)+' = '+nm(c);}
function acakGaris(rng,cNol){
  for(var i=0;i<200;i++){var q=norm(rnz(rng,-3,3),rnz(rng,-3,3),cNol?0:rnz(rng,-6,6));
    if(gcd(q.a,q.b)===1&&(cNol||q.c!==0))return q;}
  return L(2,-1,4);
}
var KED=['tegak lurus','sejajar','berimpit'];
function g16(rng,v){
  var d=v==='b'?270:90,q=acakGaris(rng),qr=rotLn(q,d),qb=norm(qr.a,qr.b,qr.c),la=lnV(q,'a',eqS(q)),v0=V({ln:[la],ctr:ctr(O0),cap:CAP_G});
  /* 90°: x = y′, y = −x′ → a·y′ − b·x′ = c ; 270°: x = −y′, y = x′ → −a·y′ + b·x′ = c
     pilihan ditulis dengan suku y′ lebih dulu; pengecoh dibedakan menurut nilai koefisien, bukan urutan tulisan */
  var s=d===90?1:-1,Y=s*q.a,X=-s*q.b,tulis=function(p){return subPrim([[p[0],'y′'],[p[1],'x′']],q.c);};
  var key=tulis([Y,X]),dis=[];
  [[Y,-X],[-Y,X],[-Y,-X],[X,Y],[-X,Y]].forEach(function(p){var t=tulis(p);if((p[0]!==Y||p[1]!==X)&&dis.indexOf(t)<0&&t!==key)dis.push(t);});
  var src=d===90?'x′ = −y dan y′ = x':'x′ = y dan y′ = −x';
  return mkQ(16,'H',v,{m:{q:q,qb:qb,d:d},kko:'menerapkan',
    soal:'Garis <b>'+eqS(q)+'</b> dirotasi <b>'+degS(d)+'</b> dengan pusat O. Tentukan persamaan bayangannya.',
    st:[F('Nyatakan x dan y','Dari '+src+', nyatakan x dan y dalam x′ dan y′.',[pgS(rng,'Substitusi',SUBST[d],[SUBST[d===90?270:90],'x = x′, y = −y′'])],['Balik hubungannya: dari '+src+', cari x lalu y.'],v0),
      F('Substitusi','Substitusikan ke '+eqS(q)+'. Hasilnya …',[pgS(rng,'Hasil substitusi',key,dis)],['Ganti x dengan '+(d===90?'y′':'−y′')+' dan y dengan '+(d===90?'−x′':'x′')+'. Perhatikan tanda.'],v0),
      F('Persamaan bayangan','Tulis persamaan bayangan dalam bentuk ax + by = c (hapus tanda aksen).',[eqI('Garis bayangan',qb,[])],['Susun ulang hasil substitusi: suku x di depan, lalu suku y.'],v0),
      F('Kedudukan','Kedudukan garis bayangan terhadap garis asal adalah …',[pgS(rng,'Kedudukan','tegak lurus',KED)],['Rotasi 90° atau 270° memutar arah garis seperempat putaran.'],V(v0,{ln:[la,lnV(qb,'b',eqS(qb))]}))],
    vz:V(v0,{ln:[la,lnV(qb,'b',eqS(qb))]}),
    bahas:['Substitusi: '+SUBST[d]+'.','Hasil: '+key+', jadi bayangannya '+eqS(qb)+'.','Rotasi '+degS(d)+' menghasilkan garis yang tegak lurus garis asal.']});
}
function g17(rng,v){
  var nol=v==='b',q=acakGaris(rng,nol),qb=rotLn(q,180),la=lnV(q,'a',eqS(q)),v0=V({ln:[la],ctr:ctr(O0),cap:CAP_G});
  var hasil=subPrim([[-q.a,'x′'],[-q.b,'y′']],q.c);
  return mkQ(17,nol?'H':'M',v,{m:{q:q,qb:qb},kko:'membandingkan',
    soal:'Garis <b>'+eqS(q)+'</b> dirotasi <b>180°</b> dengan pusat O. Tentukan persamaan bayangannya.',
    st:[F('Substitusi','Substitusi yang dipakai untuk rotasi 180° adalah …',[pgS(rng,'Substitusi',SUBST[180],[SUBST[90],'x = −x′, y = y′'])],['Rotasi 180°: x′ = −x dan y′ = −y.'],v0),
      F('Nilai c','Hasil substitusi: '+hasil+'. Ubah ke bentuk '+lin(q.a,q.b)+' = c. Berapa c?',[num('c =',-q.c)],['Kalikan kedua ruas dengan −1, lalu hapus tanda aksen.'],v0),
      F('Kedudukan','Kedudukan garis bayangan terhadap garis asal adalah …',[pgS(rng,'Kedudukan',nol?'berimpit':'sejajar',KED)],
        nol?['Garis asal melalui O. Bayangan titik O oleh rotasi 180° adalah O sendiri.']:['Bandingkan koefisien x dan y kedua garis. Apakah gradiennya sama?'],V(v0,{ln:[la,lnV(qb,'b',nol?'':eqS(qb))]}))],
    vz:V(v0,{ln:[la,lnV(qb,'b',nol?'':eqS(qb))]}),
    bahas:['Substitusi x = −x′, y = −y′ memberi '+hasil+'.','Dikalikan −1: '+eqS(qb)+'.',nol?'Karena c = 0, garis melalui O sehingga bayangannya berimpit.':'Gradiennya sama, jadi kedua garis sejajar.']});
}
function g18(rng){
  var k=pick(rng,[2,3]),ab=pick(rng,[[1,1],[1,2],[2,1]]),a=ab[0],b=ab[1],cs=[];
  for(var c=1;c<=9;c++)if(c%a===0&&c%b===0&&k*c/a<=9&&k*c/b<=9)cs.push(c);
  var c0=pick(rng,cs),q=L(a,b,c0),qb=dilLn(q,k),X={x:k*c0/a,y:0},Y={x:0,y:k*c0/b};
  var la=lnV(q,'a',eqS(q)),v0=V({ln:[la],ctr:ctr(O0),cap:CAP_G});
  return mkQ(18,'M','a',{m:{q:q,qb:qb,k:k,X:X,Y:Y},kko:'menerapkan',
    soal:'Garis <b>'+eqS(q)+'</b> didilatasi dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan persamaan bayangannya.',
    st:[F('Substitusi','Substitusi yang dipakai adalah …',[pgS(rng,'Substitusi','x = x′/'+nm(k)+', y = y′/'+nm(k),['x = '+nm(k)+'x′, y = '+nm(k)+'y′','x = x′ − '+nm(k)+', y = y′ − '+nm(k)])],['Dari x′ = '+nm(k)+'x, nyatakan x dalam x′.'],v0),
      F('Nilai c','Hasil substitusi dikalikan '+nm(k)+' menjadi '+lin(a,b)+' = c. Berapa c?',[num('c =',k*c0)],['Ruas kanan '+nm(c0)+' ikut dikalikan '+nm(k)+'.'],v0),
      PS('Titik potong','Ketuk titik potong garis bayangan dengan sumbu-x dan sumbu-y.',[X,Y],['Pada garis '+eqS(qb)+', substitusikan y = 0, lalu x = 0.'],v0),
      F('Kedudukan','Kedudukan garis bayangan terhadap garis asal adalah …',[pgS(rng,'Kedudukan','sejajar',KED)],['Koefisien x dan y tidak berubah, hanya ruas kanan yang berubah.'],V(v0,{ln:[la,lnV(qb,'b',eqS(qb))]}))],
    vz:V(v0,{ln:[la,lnV(qb,'b',eqS(qb))],mk:[mk(X,'b',ptS(X)),mk(Y,'b',ptS(Y))]}),
    bahas:['Substitusi x = x′/'+nm(k)+', y = y′/'+nm(k)+'.','Dikalikan '+nm(k)+': '+eqS(qb)+'.','Titik potong '+ptS(X)+' dan '+ptS(Y)+'. Gradien sama, jadi sejajar.']});
}
/* koefisien substitusi x = (1/k)x′ */
function subK(f){return 'x = '+sum([[f,'x′']])+', y = '+sum([[f,'y′']]);}
function g19(rng){
  var k,q,x0,ok=false;
  for(var i=0;i<300&&!ok;i++){
    k=pick(rng,[-2,-1,-0.5,0.5]);var a=ri(rng,1,3),b=rnz(rng,-3,3);if(gcd(a,b)!==1)continue;
    x0=rnz(rng,-8,8);var c=a*x0;
    if(Math.abs(k*x0)>9||!isInt(k*c)||!isInt(k*x0))continue;
    q=L(a,b,c);ok=true;
  }
  if(!ok){k=-0.5;q=L(1,-2,6);x0=6;}
  var qb=dilLn(q,k),X0={x:x0,y:0},XB={x:rnd(k*x0),y:0},f=1/k;
  var key=subK(f),dis=[subK(k),subK(-f),subK(-k),'x = x′ − 1, y = y′ − 1'];
  var hasil=subPrim([[q.a*f,'x′'],[q.b*f,'y′']],q.c);
  var la=lnV(q,'a',eqS(q)),v0=V({ln:[la],ctr:ctr(O0),cap:CAP_G});
  var neg=k<0,letak=neg?'sejajar, di pihak berlawanan dari O':'sejajar, di pihak yang sama dari O';
  return mkQ(19,'H','a',{m:{q:q,qb:qb,k:k,X0:X0,XB:XB},kko:'menganalisis',
    soal:'Garis <b>'+eqS(q)+'</b> didilatasi dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan persamaan bayangannya.',
    st:[F('Substitusi','Substitusi yang dipakai adalah …',[pgS(rng,'Substitusi',key,dis)],['Dari x′ = '+nm(k)+'x, maka x = x′ : ('+nm(k)+').'],v0),
      F('Nilai c','Hasil substitusi '+hasil+' disederhanakan menjadi '+lin(q.a,q.b)+' = c. Berapa c?',[num('c =',k*q.c)],['Kalikan kedua ruas dengan '+nm(k)+' agar koefisiennya kembali '+lin(q.a,q.b)+'.'],v0),
      PT('Bayangan titik','Ketuk bayangan titik '+ptS(X0)+' oleh dilatasi ini.',XB,['Kalikan koordinat '+ptS(X0)+' dengan k = '+nm(k)+'.'],V(v0,{mk:[mk(X0,'a',ptS(X0))]})),
      F('Letak garis','Letak garis bayangan terhadap garis asal adalah …',[pgS(rng,'Garis bayangan',letak,[neg?'sejajar, di pihak yang sama dari O':'sejajar, di pihak berlawanan dari O','tegak lurus'])],['Bandingkan titik potong sumbu-x: '+ptS(X0)+' dan '+ptS(XB)+'. Apakah keduanya di sisi yang sama dari O?'],V(v0,{ln:[la,lnV(qb,'b',eqS(qb))],mk:[mk(X0,'a',ptS(X0)),mk(XB,'b',ptS(XB))]}))],
    vz:V(v0,{ln:[la,lnV(qb,'b',eqS(qb))],mk:[mk(X0,'a',ptS(X0)),mk(XB,'b',ptS(XB))]}),
    bahas:['Substitusi '+key+' memberi '+hasil+'.','Dikalikan '+nm(k)+': '+eqS(qb)+'.','Titik '+ptS(X0)+' berpindah ke '+ptS(XB)+'; garis bayangan '+letak+'.']});
}

/* ================= D. SOAL CERITA KONTEKS BONE (Tipe 20–23) ================= */
function g20(rng,v){
  var d=v==='a'?90:v==='b'?180:270,tr=pick(rng,[[3,4],[4,3],[6,8],[8,6]]),G={x:sgn(rng)*tr[0],y:sgn(rng)*tr[1]},r=tr[0]===3||tr[0]===4?5:10;
  var B=rot(G,d),circ={c:[0,0],r:r,c2:'k'};
  var v0=V({mk:[mkN(G,'a','G')],ctr:ctr(O0),circ:circ,seg:[seg(O0,G,'a',1)],cap:'Lingkaran putus-putus = lintasan kabin bianglala (satuan meter).'});
  return mkQ(20,'M',v,{m:{A:G,B:B,d:d,r:r},kko:'menerapkan',
    soal:'Di pasar malam Lapangan Merdeka Watampone ada bianglala dengan pusat putaran di O(0, 0), satuan meter. Sebuah kabin berada di <b>G'+ptS(G)+'</b>. Bianglala berputar <b>'+degS(d)+'</b> berlawanan arah jarum jam. Tentukan posisi kabin sekarang.',
    st:[F('Aturan','Aturan pemetaan rotasi '+degS(d)+' adalah …',[pgS(rng,'(x, y) dipetakan ke',ATURAN[d],DIS_ATURAN[d])],hAturan(d),v0),
      FK('Posisi G′','Tulis posisi kabin G′.',[['G′',B]],['Gunakan aturan '+ATURAN[d]+' pada G'+ptS(G)+'.'],v0),
      PT('Letak G′','Ketuk letak G′ pada bidang.',B,['Kabin tetap berada pada lingkaran lintasan.'],v0),
      F('Jarak ke pusat','Berapa jarak kabin ke pusat putaran sesudah berputar?',[num('Jarak =',r,'m')],['Jarak = √(x² + y²). Rotasi tidak mengubah jarak ke pusat.'],V(v0,{mk:[mkN(G,'a','G'),mkN(B,'b','G′')],seg:[seg(O0,G,'a',1),seg(O0,B,'b',1)]}))],
    vz:V(v0,{mk:[mkN(G,'a','G'),mkN(B,'b','G′')],seg:[seg(O0,G,'a',1),seg(O0,B,'b',1)],arc:arc(O0,G,d,'b')}),
    bahas:['Rotasi '+degS(d)+': (x, y) → '+ATURAN[d]+', jadi G′'+ptS(B)+'.','Jarak sebelum = √('+nm(G.x)+'² + '+nm(G.y)+'²) = '+nm(r)+' m.','Jarak sesudah juga '+nm(r)+' m, karena rotasi tidak mengubah jarak ke pusat.']});
}
function g21(rng,v){
  var d=v==='b'?270:90,m=pick(rng,[1,2,-1]),n;
  do{n=rnz(rng,-4,4);}while(m===2&&n%2!==0);
  var P1={x:0,y:n},P2_={x:rnd(-n/m),y:0},B1=rot(P1,d),B2=rot(P2_,d),q=dariYM(m,n),qb=rotLn(q,d),mb=rnd(-1/m),nb=rnd(d===90?-n/m:n/m);
  var la=lnV(q,'a',ymS(m,n)),v0=V({ln:[la],ctr:ctr(O0),cap:'Garis biru = garis motif asal, garis jingga = garis motif hasil rotasi.'});
  var v1=V(v0,{mk:[mk(P1,'a',ptS(P1)),mk(P2_,'a',ptS(P2_))]});
  return mkQ(21,'H',v,{m:{m:m,n:n,P1:P1,P2:P2_,B1:B1,B2:B2,mb:mb,nb:nb,d:d},kko:'menganalisis',
    soal:"Seorang penenun lipa' sabbe (sarung sutra Bugis) di Bone merancang motif pada kertas berpetak. Satu garis motif mengikuti persamaan <b>"+ymS(m,n)+'</b>. Untuk membuat motif silang, garis itu dirotasi <b>'+degS(d)+'</b> dengan pusat O. Tentukan persamaan garis bayangannya.',
    st:[PS('Dua titik','Ketuk titik potong garis motif dengan sumbu-y dan sumbu-x.',[P1,P2_],['Substitusikan x = 0 untuk titik potong sumbu-y, lalu y = 0 untuk titik potong sumbu-x.'],v0),
      FK('Bayangan titik','Tentukan bayangan kedua titik itu oleh rotasi '+degS(d)+'.',[['Bayangan '+ptS(P1),B1],['Bayangan '+ptS(P2_),B2]],['Gunakan aturan '+ATURAN[d]+'.'],v1),
      F('Persamaan bayangan','Tulis persamaan bayangan dalam bentuk y = mx + n.',[num('m =',mb),num('n =',nb)],['m = (y₂ − y₁) : (x₂ − x₁) memakai kedua titik bayangan. n adalah ordinat titik potong dengan sumbu-y.'],V(v1,{mk:[mk(P1,'a',ptS(P1)),mk(P2_,'a',ptS(P2_)),mk(B1,'b',ptS(B1)),mk(B2,'b',ptS(B2))]})),
      F('Kedudukan','Kedudukan kedua garis motif adalah …',[pgS(rng,'Kedua garis','tegak lurus, karena m₁ × m₂ = −1',['sejajar, karena gradiennya sama','berimpit'])],['Hitung m₁ × m₂ = '+nm(m)+' × ('+nm(mb)+').'],V(v1,{ln:[la,lnV(qb,'b',ymS(mb,nb))]}))],
    vz:V(v0,{ln:[la,lnV(qb,'b',ymS(mb,nb))],mk:[mk(B1,'b',ptS(B1)),mk(B2,'b',ptS(B2))]}),
    bahas:['Titik potong: '+ptS(P1)+' dan '+ptS(P2_)+'.','Bayangannya '+ptS(B1)+' dan '+ptS(B2)+', sehingga garis bayangan '+ymS(mb,nb)+'.','m₁ × m₂ = '+nm(m)+' × ('+nm(mb)+') = −1, jadi kedua garis motif tegak lurus.']});
}
function g22(rng){
  var n=pick(rng,[2,3,1]),k=n===1?2:1/n,T,w,h;
  for(var i=0;i<200;i++){
    var lim=n===1?4:9,st=n===1?1:n;
    var x1=st*ri(rng,Math.ceil(-lim/st),Math.floor(lim/st)),x2=st*ri(rng,Math.ceil(-lim/st),Math.floor(lim/st));
    var y1=st*ri(rng,Math.ceil(-lim/st),Math.floor(lim/st)),y2=st*ri(rng,Math.ceil(-lim/st),Math.floor(lim/st));
    if(x2<=x1||y2<=y1)continue;w=x2-x1;h=y2-y1;if(w<h||w===h)continue;
    if(n!==1&&w*k<2)continue;
    T=persegi(x1,y1,w,h);break;
  }
  if(!T){k=0.5;T=persegi(-4,-2,8,4);w=8;h=4;}
  var B=T.map(function(X){return dil(X,k);}),W=rnd(w*k),H=rnd(h*k),ol=opsiLuas(k);
  var nmA=['P','Q','R','S'],nmB=['P′','Q′','R′','S′'],pa=poly(T,'a',nmA);
  var v0=V({poly:[pa],ctr:ctr(O0),cap:'Biru = denah pada spanduk, jingga = denah pada '+(k<1?'brosur':'baliho')+'.'}),v1=V(v0,{poly:[pa,poly(B,'b',nmB)]});
  var verb=k<1?'dikecilkan':'diperbesar',md=k<1?'brosur':'baliho';
  return mkQ(22,'M','a',{m:{T:T,B:B,k:k,w:w,h:h,W:W,H:H},kko:'menghitung',
    soal:'Denah dermaga Pelabuhan Bajoe pada spanduk berbentuk persegi panjang dengan titik sudut <b>P'+ptS(T[0])+', Q'+ptS(T[1])+', R'+ptS(T[2])+', S'+ptS(T[3])+'</b>. Untuk brosur, denah '+verb+' dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan luas denah pada '+md+'.',
    st:[PS('Titik bayangan','Ketuk keempat titik sudut denah pada '+md+' (P′, Q′, R′, S′).',B,['Kalikan setiap koordinat titik sudut dengan '+nm(k)+'.'],v0),
      F('Panjang P′Q′','Hitung panjang P′Q′.',[num('P′Q′ =',W)],['Hitung selisih absis P′ dan Q′.'],v1),
      F('Lebar Q′R′','Hitung lebar Q′R′.',[num('Q′R′ =',H)],['Hitung selisih ordinat Q′ dan R′.'],v1),
      F('Luas '+md,'Hitung luas denah pada '+md+' (satuan luas).',[num('Luas =',W*H)],['Luas = panjang × lebar.'],v1),
      F('Perbandingan luas','Luas pada '+md+' : luas pada spanduk sama dengan …',[pgS(rng,'Perbandingan',ol.key,ol.dis)],['Luas pada spanduk = '+nm(w)+' × '+nm(h)+' = '+nm(w*h)+'.'],v1)],
    vz:v1,
    bahas:['Titik sudut pada '+md+': '+B.map(ptS).join(', ')+'.','Panjang '+nm(W)+', lebar '+nm(H)+', luas '+nm(W*H)+' satuan luas.','Luas spanduk '+nm(w*h)+'; perbandingannya '+nm(rnd(W*H/(w*h)))+' = k².']});
}
function g23(rng){
  var k=pick(rng,[2,3]),X0,Y0;
  do{X0=rnz(rng,-3,3);Y0=rnz(rng,-3,3);}while(Math.abs(k*X0)>9||Math.abs(k*Y0)>9);
  var g=gcd(X0,Y0),a=Y0/g,b=X0/g,c=-X0*Y0/g;if(a<0){a=-a;b=-b;c=-c;}
  var q=L(a,b,-c),qb=dilLn(q,k),PX={x:X0,y:0},PY={x:0,y:Y0},BX={x:k*X0,y:0},BY={x:0,y:k*Y0};
  var la=lnV(q,'a','jalan asal'),v0=V({ln:[la],ctr:ctr(O0,'O'),cap:'Garis biru = jalan pada peta, garis jingga = jalan pada poster. O = Lapangan Merdeka.'});
  return mkQ(23,'H','a',{m:{a:a,b:b,c:c,k:k,PX:PX,PY:PY,BX:BX,BY:BY},kko:'menyelesaikan',
    soal:'Peta Kota Watampone digambar pada bidang kartesius dengan O di Lapangan Merdeka. Jalan lurus menuju Pelabuhan Bajoe digambarkan oleh garis <b>'+zeroS(a,b,c)+'</b>. Agar jelas di poster, peta diperbesar dengan pusat O dan faktor skala <b>'+nm(k)+'</b>. Tentukan persamaan jalan pada poster.',
    st:[FK('Titik potong','Tentukan titik potong jalan asal dengan sumbu-x dan sumbu-y.',[['Dengan sumbu-x',PX],['Dengan sumbu-y',PY]],['Sumbu-x: substitusikan y = 0. Sumbu-y: substitusikan x = 0.'],v0),
      PS('Bayangan titik potong','Ketuk bayangan kedua titik potong itu pada poster.',[BX,BY],['Kalikan koordinat '+ptS(PX)+' dan '+ptS(PY)+' dengan '+nm(k)+'.'],V(v0,{mk:[mk(PX,'a',ptS(PX)),mk(PY,'a',ptS(PY))]})),
      F('Persamaan poster','Persamaan jalan pada poster berbentuk '+sum([[a,'x'],[b,'y']])+' + c = 0. Berapa c?',[num('c =',k*c)],['Substitusikan salah satu titik bayangan, misalnya '+ptS(BX)+', ke '+sum([[a,'x'],[b,'y']])+' + c = 0.'],V(v0,{mk:[mk(BX,'b',ptS(BX)),mk(BY,'b',ptS(BY))]})),
      F('Kedudukan','Kedudukan jalan pada poster terhadap jalan asal (digambar di bidang yang sama) adalah …',[pgS(rng,'Kedudukan','sejajar',KED)],['Dilatasi dengan pusat O tidak mengubah gradien garis.'],V(v0,{ln:[la,lnV(qb,'b','jalan poster')]}))],
    vz:V(v0,{ln:[la,lnV(qb,'b','jalan poster')],mk:[mk(BX,'b',ptS(BX)),mk(BY,'b',ptS(BY))]}),
    bahas:['Titik potong jalan asal: '+ptS(PX)+' dan '+ptS(PY)+'.','Bayangannya '+ptS(BX)+' dan '+ptS(BY)+', sehingga jalan pada poster '+zeroS(a,b,k*c)+'.','Gradiennya tetap, jadi jalan pada poster sejajar dengan jalan asal.']});
}

/* ================= E. KOMPOSISI (Tipe 24) ================= */
function g24(rng,v){
  var d=pick(rng,[90,180,270]),k=pick(rng,[-2,2,0.5]),A=k===0.5?{x:2*rnz(rng,-2,2),y:2*rnz(rng,-2,2)}:titik(rng,4);
  var duluRot=v!=='b',M=duluRot?rot(A,d):dil(A,k),B=duluRot?dil(M,k):rot(M,d);
  var t1=duluRot?'dirotasi '+degS(d)+' dengan pusat O':'didilatasi dengan pusat O dan faktor skala '+nm(k);
  var t2=duluRot?'didilatasi dengan pusat O dan faktor skala '+nm(k):'dirotasi '+degS(d)+' dengan pusat O';
  var v0=V({mk:[mkN(A,'a','A')],ctr:ctr(O0),cap:'Biru = titik asal, ungu = bayangan pertama, jingga = bayangan akhir.'});
  var v1=V(v0,{mk:[mkN(A,'a','A'),mkN(M,'m','A′')]});
  return mkQ(24,'H',v,{m:{A:A,M:M,B:B,d:d,k:k,dr:duluRot},kko:'menyelesaikan',
    soal:'Titik <b>A'+ptS(A)+'</b> '+t1+', kemudian '+t2+'. Tentukan bayangan akhirnya.',
    st:[FK('Bayangan pertama','Tentukan bayangan A setelah '+(duluRot?'rotasi':'dilatasi')+' (A′).',[['A′',M]],[duluRot?'Rotasi '+degS(d)+': (x, y) → '+ATURAN[d]+'.':'Dilatasi: kalikan kedua koordinat dengan '+nm(k)+'.'],v0),
      PT('Letak A′','Ketuk letak A′.',M,['A′ adalah hasil langkah sebelumnya.'],v0),
      FK('Bayangan akhir','Tentukan bayangan A′ setelah '+(duluRot?'dilatasi':'rotasi')+' (A″).',[['A″',B]],['Bayangan pertama menjadi titik asal untuk transformasi kedua.',duluRot?'Kalikan kedua koordinat A′ dengan '+nm(k)+'.':'Gunakan aturan '+ATURAN[d]+' pada A′.'],v1),
      PT('Letak A″','Ketuk letak A″.',B,['A″ adalah hasil langkah sebelumnya.'],v1)],
    vz:V(v1,{mk:[mkN(A,'a','A'),mkN(M,'m','A′'),mkN(B,'b','A″')]}),
    bahas:[(duluRot?'Rotasi '+degS(d):'Dilatasi k = '+nm(k))+': A'+ptS(A)+' → A′'+ptS(M)+'.',(duluRot?'Dilatasi k = '+nm(k):'Rotasi '+degS(d))+': A′'+ptS(M)+' → A″'+ptS(B)+'.','Karena kedua transformasi berpusat di O, urutannya boleh dibalik dan hasilnya sama.']});
}

/* ---------- pemilih pembangkit ---------- */
var GEN={1:g1,2:g2,3:g3,4:g4,5:g5,6:g6,7:g7,8:g8,9:g9,10:g10,11:g11,12:g12,13:g13,14:g14,
  15:g15,16:g16,17:g17,18:g18,19:g19,20:g20,21:g21,22:g22,23:g23,24:g24};
var VARS={
  '1L':['a'],'2L':['a'],'3M':['a','b','c'],'4M':['a','b','c'],'5H':['a','b','c'],'6H':['a','b','c'],'7H':['a','b','c'],
  '8L':['a'],'9L':['a'],'10M':['a'],'11M':['a'],'12M':['a','b'],'13M':['a'],'14H':['a'],
  '15M':['a'],'16H':['a','b'],'17M':['a'],'17H':['b'],'18M':['a'],'19H':['a'],
  '20M':['a','b','c'],'21H':['a','b'],'22M':['a'],'23H':['a'],'24H':['a','b']
};
var VARS_LATIHAN={};   /* varian khusus Latihan Mandiri (belum ada) */
function levels(t){return (LV_TIPE[t]||'').split('');}
function variants(t,l,latihan){var k=t+l;return (VARS[k]||[]).concat(latihan&&VARS_LATIHAN[k]?VARS_LATIHAN[k]:[]);}
function gen(t,l,rng,latihan,v){
  if(!l||levels(t).indexOf(l)<0)l=levels(t)[0];
  if(!v)v=pick(rng,variants(t,l,latihan));
  return GEN[t](rng,v);
}

/* Satu "paket kuis" ditentukan sepenuhnya oleh benih (seed): 12 soal sesuai SUSUNAN_KUIS.
   Varian setiap soal dipilih acak dari benih yang sama. */
var SUSUNAN_KUIS=[[1,'L'],[3,'M'],[5,'H'],[6,'H'],[9,'L'],[10,'M'],[12,'M'],[16,'H'],[18,'M'],[20,'M'],[22,'M'],[24,'H']];
function buildPack(seed){
  var rng=mulberry32(seed),set=[];
  SUSUNAN_KUIS.forEach(function(x){set.push(gen(x[0],x[1],rng,false,x[2]));});
  return {seed:seed,set:set};
}

/* ---------- penilai jejak jawaban ----------
   jejak = daftar peristiwa {p,s,a,t}: p = nomor soal, s = nomor langkah, a = jawaban mentah,
   t = waktu (ms sejak mulai). Hanya jawaban mentah yang dipercaya; benar-salahnya dihitung ulang di sini.
   Setiap langkah paling banyak MAKS_COBA percobaan: benar ke-1 = 2 poin, benar ke-2 = 1 poin, salah dua kali = 0.
   Jawaban berformat tidak sah diabaikan, tidak dihitung percobaan. */
function posLangkah(Qs,c){
  for(var p=0;p<Qs.length;p++){if(c<Qs[p].st.length)return {p:p,s:c};c-=Qs[p].st.length;}
  return {p:Qs.length,s:0};
}
function gradeTrace(pack,trace){
  var Qs=pack.set,ev=Array.isArray(trace)?trace:[],total=0;
  Qs.forEach(function(Q){total+=Q.st.length;});
  var c=0,tries=0,score=0,ignored=0,steps=[],missed={},lastT=0,mono=true,rinci={};
  RINCI.forEach(function(k){rinci[k]=[0,0];});
  Qs.forEach(function(Q){rinci[Q.bg][1]+=2*Q.st.length;rinci[LEVEL[Q.l]][1]+=2*Q.st.length;});
  function close(pts){
    var ps=posLangkah(Qs,c),Q=Qs[ps.p],S=Q.st[ps.s];
    steps.push(pts);score+=pts;rinci[Q.bg][0]+=pts;rinci[LEVEL[Q.l]][0]+=pts;
    if(pts<2){var k='Tipe '+Q.t+' · '+S.nm;missed[k]=(missed[k]||0)+1;}
    c++;tries=0;
  }
  for(var k=0;k<ev.length;k++){
    var e=ev[k];
    if(!e||typeof e!=='object'){ignored++;continue;}
    if(isNum(e.t)){if(e.t<lastT)mono=false;else lastT=e.t;}
    if(c>=total){ignored++;continue;}
    var ps=posLangkah(Qs,c),p=ps.p,s=ps.s;
    if(e.p!==p||e.s!==s||!valid(Qs[p],s,e.a)){ignored++;continue;}
    tries++;
    if(judge(Qs[p],s,e.a).ok)close(tries===1?2:1);
    else if(tries>=MAKS_COBA)close(0);
  }
  var now=posLangkah(Qs,c);
  return {score:score,max:total*2,done:c,total:total,p:now.p,s:now.s,complete:c===total,tries:tries,ignored:ignored,steps:steps,missed:missed,rinci:rinci,monotonic:mono,lastT:lastT};
}

/* ---------- sidik jari kode: halaman dan server harus menghasilkan nilai yang sama ---------- */
function djb2(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(16);}
function semuaVarian(){var o=[];for(var t=1;t<=24;t++)levels(t).forEach(function(l){variants(t,l,true).forEach(function(v){o.push([t,l,v]);});});return o;}
function cek(){
  var pk=buildPack(20261102),rng=mulberry32(7),vs=[],sm=[],t=0;
  semuaVarian().forEach(function(x){vs.push(gen(x[0],x[1],rng,true,x[2]));});
  pk.set.forEach(function(Q,p){
    for(var s=0;s<Q.st.length;s++){
      var m=(p+s)%3;
      if(m===0){sm.push({p:p,s:s,a:wrongAns(Q,s),t:++t});sm.push({p:p,s:s,a:keyAns(Q,s),t:++t});}
      else if(m===1){sm.push({p:p,s:s,a:null,t:++t});sm.push({p:p,s:s,a:keyAns(Q,s),t:++t});}
      else{sm.push({p:p,s:s,a:wrongAns(Q,s),t:++t});sm.push({p:p,s:s,a:wrongAns(Q,s),t:++t});}
    }
  });
  sm.push({p:99,s:9,a:1,t:++t});
  var vj=vs.map(function(Q){return Q.st.map(function(S,s){return [judge(Q,s,keyAns(Q,s)).ok,judge(Q,s,wrongAns(Q,s)).ok];});});
  return VERSI+':'+djb2(JSON.stringify({pk:pk,vs:vs,vj:vj,g:gradeTrace(pk,sm)}));
}

/* ---------- uji mandiri: CORE.uji() di konsol ----------
   Membangkitkan setiap varian berkali-kali dan memeriksa: kunci dinilai benar, jawaban salah dinilai salah,
   titik jawaban di dalam bidang, pilihan ganda tanpa opsi kembar, dan tidak ada NaN/undefined pada teks. */
function uji(n){
  n=n||300;var lap=[],rng=mulberry32(2026);
  semuaVarian().forEach(function(x){
    for(var i=0;i<n;i++){
      var Q=gen(x[0],x[1],rng,true,x[2]),id='T'+x[0]+x[1]+x[2]+'#'+i;
      if(/NaN|undefined|Infinity|null/.test(JSON.stringify(Q)))lap.push(id+' teks tidak sah');
      Q.st.forEach(function(S,s){
        var ka=keyAns(Q,s),wa=wrongAns(Q,s);
        if(!valid(Q,s,ka))lap.push(id+' L'+(s+1)+' kunci tidak sah '+JSON.stringify(ka));
        else if(!judge(Q,s,ka).ok)lap.push(id+' L'+(s+1)+' kunci dinilai salah');
        if(valid(Q,s,wa)&&judge(Q,s,wa).ok)lap.push(id+' L'+(s+1)+' jawaban salah dinilai benar');
        if(S.k==='form')S.it.forEach(function(it){
          if(it.t==='pg'){if(it.o.length<2)lap.push(id+' L'+(s+1)+' opsi kurang');if(it.o.some(function(o,j){return it.o.indexOf(o)!==j;}))lap.push(id+' L'+(s+1)+' opsi kembar');}
        });
      });
    }
  });
  return lap.length?lap.slice(0,40):'Semua soal aman.';
}

return {VERSI:VERSI,OPS:OPS,MAKS_COBA:MAKS_COBA,NSOAL:NSOAL,NLANGKAH:NLANGKAH,TIPE:TIPE,LEVEL:LEVEL,LV_TIPE:LV_TIPE,
  BAGIAN:BAGIAN,BG_TIPE:BG_TIPE,RINCI:RINCI,RLAB:RLAB,FULL:FULL,
  isSolid:isSolid,holds:holds,flipOp:flipOp,gcd:gcd,mulberry32:mulberry32,
  nm:nm,rp:rp,lin:lin,eqS:eqS,ineqS:ineqS,zeroS:zeroS,ymS:ymS,sum:sum,ptS:ptS,L:L,norm:norm,
  rot:rot,dil:dil,rotLn:rotLn,dilLn:dilLn,ATURAN:ATURAN,SUBST:SUBST,
  levels:levels,variants:variants,gen:gen,buildPack:buildPack,posLangkah:posLangkah,SUSUNAN_KUIS:SUSUNAN_KUIS,
  valid:valid,judge:judge,judgePt:judgePt,keyAns:keyAns,wrongAns:wrongAns,gradeTrace:gradeTrace,cek:cek,uji:uji};
})();
