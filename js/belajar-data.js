/* ==========================================================================
   belajar-data.js · ISI TAB BELAJAR
   Bersumber dari dokumen "Rangkuman Materi Rotasi dan Dilatasi (Fase D, Kelas IX)".
   Untuk mengubah teks materi, sunting file ini saja.
   Setiap layar = {t, jd (judul), src (sumber), parts:[HTML], beats:[{show, say, v, at, alat}]}
     show : bagian (parts) terakhir yang ditampilkan pada langkah itu
     say  : ucapan Plus;  v : tampilan bidang (format sama dengan CORE, lihat komponen.js)
     alat : alat interaktif {j:'rot'|'dil'|'grs', …} yang dikendalikan slider .alatR (lihat belajar.js)
   Layar dikelompokkan menjadi bagian A–E dan penutup (PL.EXG).
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U,nm=U.nm,ptS=U.ptS,esc=U.esc;
var C=CORE,FULL=C.FULL;

/* ---------- pembentuk tampilan bidang (format sama dengan CORE) ---------- */
function P(x,y){return {x:x,y:y};}
function mk(Q,c,l){return {x:Q.x,y:Q.y,c:c||'k',l:l===undefined?ptS(Q):l};}
function mkN(Q,c,n){return mk(Q,c,n+ptS(Q));}
function poly(ps,c,nama){return {p:ps.map(function(Q){return [Q.x,Q.y];}),c:c,l:nama||[]};}
function seg(A,B,c,d){return {a:[A.x,A.y],b:[B.x,B.y],c:c||'k',d:d===undefined?1:d};}
function arc(Cn,A,deg,c){return {c:[Cn.x,Cn.y],a:[A.x,A.y],deg:deg,col:c||'b'};}
function ctr(Q,l){return {x:Q.x,y:Q.y,l:l===undefined?((Q.x||Q.y)?'P'+ptS(Q):'O'):l};}
function lnV(q,c,l){return {a:q.a,b:q.b,c:q.c,col:c||'a',l:l===undefined?C.eqS(q):l};}
function V(o){var r={B:FULL};for(var k in o)r[k]=o[k];return r;}
var O=P(0,0);
var CR='Biru = asal, jingga = bayangan. Panah melengkung = arah putaran.';
var CD='Biru = asal, jingga = bayangan. Garis putus-putus melewati pusat dilatasi.';
var CG='Garis biru = garis asal, garis jingga = garis bayangan.';
/* tampilan rotasi satu titik */
function vRot(A,nA,d,o){
  o=o||{};var Cn=o.C||O,B=C.rot(A,d,Cn),m=[mkN(A,'a',nA)],s=[seg(Cn,A,'a')];
  if(!o.tanpa){m.push(mkN(B,'b',nA+'′'));s.push(seg(Cn,B,'b'));}
  return V({mk:m,seg:s,ctr:ctr(Cn),arc:o.tanpa?undefined:arc(Cn,A,o.arah||d),cap:CR});
}
function vDil(A,nA,k,Cn){
  Cn=Cn||O;var B=C.dil(A,k,Cn),far=(Math.abs(k)>=1?B:A);
  return V({mk:[mkN(A,'a',nA),mkN(B,'b',nA+'′')],seg:k<0?[seg(Cn,A,'a'),seg(Cn,B,'b')]:[seg(Cn,far,'k')],ctr:ctr(Cn),cap:CD});
}

/* ---------- pembentuk HTML ---------- */
function ingat(h){return '<div class="rule"><b>INGAT!</b> '+h+'</div>';}
function ul(a){return '<ul class="exl">'+a.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';}
function ol(a){return '<ol class="exl">'+a.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol>';}
/* rumus KaTeX dengan teks cadangan */
function tex(t,cadangan,blok){return '<'+(blok?'p class="eq rumus"':'span class="eq"')+' data-tex="'+esc(t)+'">'+esc(cadangan)+'</'+(blok?'p':'span')+'>';}
function tblE(head,rows,cls){
  return '<div class="tscroll"><table class="ext'+(cls?' '+cls:'')+'"><tr>'+head.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr>'
    +rows.map(function(r){return '<tr'+(r.pt?' class="tpt" data-x="'+r.pt[0]+'" data-y="'+r.pt[1]+'" data-ok="'+(r.ok?1:0)+'" data-l="'+esc(r.l||'')+'" tabindex="0"':'')+'>'+r.c.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')+'</table></div>';
}
function contoh(judul,isi){return '<div class="exbox"><b>'+judul+'</b><p>'+isi+'</p></div>';}
function kes(a,b,c){return '<div class="exbox why"><b>Kesalahan</b><br>'+a+'<br><b>Contoh jawaban keliru</b><br>'+b+'</div><div class="exbox fix"><b>Cara menghindari</b><br>'+c+'</div>';}
/* kotak alat interaktif; yang aktif hanya kotak pada bagian (part) langkah saat ini */
function alat(judul,label,o){
  var pre=(o.pre||[]).map(function(v){return '<button class="chip" type="button" data-aksi="alat-set" data-v="'+v+'">'+esc(o.fmt?o.fmt(v):String(v))+'</button>';}).join('');
  return '<div class="gsbox alatbox"><b>'+judul+'</b><label><span>'+label+': <b class="alatV"></b></span>'
    +'<input type="range" class="alatR" min="'+o.min+'" max="'+o.max+'" step="'+o.step+'" value="'+o.v0+'"></label>'
    +(pre?'<div class="chips">'+pre+'</div>':'')
    +'<p class="alatT" role="status"></p>'+(o.geser?'<p class="muted">Ketuk bidang untuk memindahkan titik asal.</p>':'')+'</div>';
}
function degF(v){return nm(+v)+'°';}
function kF(v){return nm(+v);}
var ALAT_ROT={min:-360,max:360,step:15,pre:[-90,90,180,270],fmt:degF};
var ALAT_DIL={min:-3,max:3,step:0.25,pre:[-2,-1,-0.5,0.5,1,2,3],fmt:kF};

/* satu layar: items = [[htmlBagian | null, ucapan Plus, tampilan, tambahan]] */
function scr(t,jd,src,items,go){
  var parts=[],beats=[],last=null;
  items.forEach(function(it){
    if(it[0]!==null)parts.push(it[0]);
    if(it[2])last=it[2];
    var b={show:parts.length-1,say:it[1],v:last};
    if(it[3])for(var k in it[3])b[k]=it[3][k];
    beats.push(b);
  });
  return {t:t,jd:jd,src:src,parts:parts,beats:beats,go:!!go};
}
var SRC='Rangkuman Materi Rotasi dan Dilatasi';

/* ============================ A. ROTASI ============================ */
var A1=P(3,-2),B1=P(-4,5),C1=P(5,1);
var TRI=[P(1,2),P(4,2),P(1,5)],TRI90=TRI.map(function(Q){return C.rot(Q,90);});
var EXA=[
scr('a0','Pengantar dan konvensi',SRC+', pengantar',[
 ['<p>Transformasi memindahkan setiap titik sebuah bangun menurut aturan tertentu. Di sini dipelajari dua transformasi: <b>rotasi</b> (perputaran) dan <b>dilatasi</b> (perbesaran atau pengecilan).</p>'
  +'<p>Konvensi yang dipakai di seluruh materi:</p>'+ul(['Sudut <b>positif</b> berarti berlawanan arah jarum jam; sudut <b>negatif</b> berarti searah jarum jam.','Pusat rotasi atau dilatasi adalah O(0, 0), kecuali disebut lain.','Titik asal ditulis A(x, y), bayangannya A′(x′, y′).']),
  'Halo! Kita mulai dari tiga kesepakatan penulisan.',vRot(P(4,0),'A',90)],
 [tblE(['Bagian','Isi','Tipe soal'],[{c:['A. Rotasi','Rotasi titik dan bangun, menentukan sudut, mencari titik asal, pusat P(a, b)','1–7']},{c:['B. Dilatasi','Faktor skala bulat, pecahan, negatif; menentukan k; luas; pusat P(a, b)','8–12, 14']},
  {c:['C. Persamaan garis','Metode dua titik, metode substitusi, kedudukan garis bayangan','15–19']},{c:['D. Komposisi','Rotasi dilanjutkan dilatasi','24']},{c:['E. Konteks Bone','Bianglala, lipa′ sabbe, foto Bola Soba, denah Bajoe, peta jalan','13, 20–23']}]),
  'Setiap bagian ditutup contoh yang mirip soal di Latihan Mandiri.'],
 [alat('Coba sendiri: putar titik','Sudut rotasi',{min:-360,max:360,step:15,v0:0,pre:[-90,90,180,270],fmt:degF,geser:true}),
  'Geser slider. Sudut positif memutar berlawanan arah jarum jam.',null,{alat:{j:'rot',pts:[P(4,0)],nama:['A'],C:O,v:0,geser:true},at:{el:'alat'}}]]),

scr('a1','A1 · Aturan pemetaan rotasi pusat O',SRC+', bagian A.1 (Tipe 1, 2, 3)',[
 ['<p>Rotasi memutar setiap titik terhadap satu pusat sebesar sudut tertentu. Jarak titik ke pusat tidak berubah, jadi bayangan selalu <b>kongruen</b> (sama bentuk dan ukuran) dengan bangun asal.</p>'
  +tblE(['Rotasi','Arah lain yang setara','(x, y) dipetakan ke'],[{c:['90°','−270°','<b>(−y, x)</b>']},{c:['180°','−180°','<b>(−x, −y)</b>']},{c:['270°','−90° atau 90° searah jarum jam','<b>(y, −x)</b>']}]),
  'Ini tabel yang paling sering dipakai. Simpan baik-baik, ya.',vRot(P(1,0),'',90)],
 ['<p>Cara mengingat: pada rotasi 90° dan 270°, x dan y <b>bertukar tempat</b>, lalu satu tanda berubah. Pada rotasi 180°, posisinya tidak bertukar, keduanya berganti tanda.</p>'
  +ingat('Untuk memeriksa tanda, bayangkan titik (1, 0). Diputar 90° berlawanan arah jarum jam, titik itu naik ke (0, 1). Diputar 90° searah jarum jam, titik itu turun ke (0, −1).'),
  'Uji tanda dengan titik (1, 0).',V({mk:[mk(P(1,0),'a','(1, 0)'),mk(P(0,1),'b','(0, 1)'),mk(P(0,-1),'m','(0, −1)')],arc:arc(O,P(1,0),90),ctr:ctr(O),cap:'Jingga = diputar 90° berlawanan arah jarum jam; ungu = diputar 90° searah jarum jam.'})],
 [contoh('Contoh (Tipe 1)','A(3, −2) dirotasi 90°. Dengan (−y, x): x′ = −(−2) = 2 dan y′ = 3, jadi <b>A′(2, 3)</b>.'),'Rotasi 90°: x′ = −y, y′ = x.',vRot(A1,'A',90)],
 [contoh('Contoh (Tipe 2)','B(−4, 5) dirotasi 180°. Dengan (−x, −y): <b>B′(4, −5)</b>.'),'Rotasi 180°: kedua tanda berubah.',vRot(B1,'B',180)],
 [contoh('Contoh (Tipe 3)','C(5, 1) dirotasi 90° searah jarum jam. Rotasi ini sama dengan 270°, jadi dipakai (y, −x): <b>C′(1, −5)</b>.'),'90° searah jarum jam sama dengan 270°.',vRot(C1,'C',270,{arah:-90})],
 [alat('Coba sendiri: aturan pemetaan','Sudut rotasi',{min:-360,max:360,step:15,v0:90,pre:[-90,90,180,270],fmt:degF,geser:true}),
  'Pindahkan titik dengan mengetuk bidang, lalu cocokkan hasilnya dengan tabel.',null,{alat:{j:'rot',pts:[A1],nama:['A'],C:O,v:90,geser:true},at:{el:'alat'}}]]),

scr('a2','A2 · Rotasi bangun datar',SRC+', bagian A.2 (Tipe 4)',[
 ['<p>Rotasikan setiap titik sudut satu per satu, lalu hubungkan bayangannya dengan urutan yang sama.</p>',
  'Bangun diputar dengan memutar setiap titik sudutnya.',V({poly:[poly(TRI,'a',['P','Q','R'])],ctr:ctr(O),cap:'Segitiga PQR.'})],
 [tblE(['Titik','Rotasi 90° → (−y, x)','Bayangan'],TRI.map(function(Q,i){var n='PQR'[i];return {pt:[TRI90[i].x,TRI90[i].y],ok:1,l:n+'′',c:[n+ptS(Q),'(−('+nm(Q.y)+'), '+nm(Q.x)+')',n+'′'+ptS(TRI90[i])]};}))
  +'<p class="muted">Ketuk satu baris untuk melihat titik bayangannya.</p>',
  'Ketuk baris tabel untuk melihat titiknya.',V({poly:[poly(TRI,'a',['P','Q','R']),poly(TRI90,'b',['P′','Q′','R′'])],ctr:ctr(O),arc:arc(O,TRI[1],90),cap:CR})],
 ['<p>Segitiga P′Q′R′ <b>kongruen</b> dengan PQR: panjang sisi dan besar sudutnya tetap, hanya posisinya yang berubah.</p>',
  'Bayangan hasil rotasi selalu kongruen.'],
 [alat('Coba sendiri: putar segitiga','Sudut rotasi',{min:-360,max:360,step:15,v0:90,pre:[-90,90,180,270],fmt:degF}),
  'Geser slider dan perhatikan bentuk segitiga yang tidak berubah.',null,{alat:{j:'rot',pts:TRI,nama:['P','Q','R'],poly:true,C:O,v:90},at:{el:'alat'}}]]),

scr('a3','A3 · Menentukan sudut rotasi',SRC+', bagian A.3 (Tipe 5)',[
 ['<p>Bandingkan koordinat asal dan bayangan, lalu cocokkan dengan tabel aturan pemetaan.</p>'
  +ul(['Jika x′ = −y dan y′ = x → rotasi <b>90°</b>.','Jika x′ = −x dan y′ = −y → rotasi <b>180°</b>.','Jika x′ = y dan y′ = −x → rotasi <b>270°</b>.']),
  'Cari dulu: apakah x dan y bertukar posisi?',V({mk:[mkN(P(2,-3),'a','K'),mkN(P(3,2),'b','K′')],ctr:ctr(O),seg:[seg(O,P(2,-3),'a'),seg(O,P(3,2),'b')],cap:'Berapa derajat K diputar menjadi K′?'})],
 [contoh('Contoh','K(2, −3) → K′(3, 2). Terlihat x′ = 3 = −y dan y′ = 2 = x, jadi sudutnya <b>90°</b>.'),
  'x′ = −y dan y′ = x, jadi rotasi 90°.',vRot(P(2,-3),'K',90)],
 [ingat('Pilih titik dengan |x| ≠ |y|. Jika |x| = |y|, beberapa hubungan bisa tampak cocok sekaligus.'),'Hati-hati bila |x| sama dengan |y|.']]),

scr('a4','A4 · Mencari titik asal dari bayangan',SRC+', bagian A.4 (Tipe 6)',[
 ['<p>Tulis aturan pemetaan sebagai persamaan, lalu selesaikan untuk x dan y. Cara lain: rotasikan bayangan dengan sudut yang sama ke arah berlawanan.</p>',
  'Kali ini yang diketahui bayangannya.',V({mk:[mkN(P(-1,4),'b','D′')],ctr:ctr(O),cap:'D′ diketahui. Di mana D?'})],
 [contoh('Contoh','Rotasi 270° menghasilkan D′(−1, 4). Aturan (y, −x) memberi y = x′ = −1 dan −x = y′ = 4, jadi x = −4. Titik asalnya <b>D(−4, −1)</b>.'),
  'Dari y = x′ dan −x = y′, diperoleh D(−4, −1).',vRot(P(-4,-1),'D',270)],
 [ingat('Periksa jawaban: putar D(−4, −1) sebesar 270°. Hasilnya harus D′(−1, 4).'),'Selalu periksa dengan memutar balik.']]),

scr('a5','A5 · Rotasi dengan pusat P(a, b)',SRC+', bagian A.5 (Tipe 7, pengayaan)',[
 ['<p>Gunakan tiga langkah: geser ke pusat O, rotasikan, lalu geser kembali.</p>'+ol(['Hitung selisih terhadap pusat: (x − a, y − b).','Rotasikan selisih itu dengan aturan pusat O.','Tambahkan kembali (a, b).']),
  'Pusatnya bukan O, jadi geser dulu.',V({mk:[mkN(P(5,3),'a','A')],ctr:ctr(P(2,1)),seg:[seg(P(2,1),P(5,3),'a')],cap:'Pusat rotasi P(2, 1).'})],
 [contoh('Contoh','A(5, 3) dirotasi 90° dengan pusat P(2, 1). Selisih (3, 2), dirotasi 90° menjadi (−2, 3), ditambah (2, 1) menjadi <b>A′(0, 4)</b>.'),
  'Selisih (3, 2) diputar menjadi (−2, 3), lalu ditambah (2, 1).',vRot(P(5,3),'A',90,{C:P(2,1)})],
 [alat('Coba sendiri: pusat P(2, 1)','Sudut rotasi',{min:-360,max:360,step:15,v0:90,pre:[-90,90,180,270],fmt:degF,geser:true}),
  'Perhatikan: titik berputar mengelilingi P, bukan O.',null,{alat:{j:'rot',pts:[P(5,3)],nama:['A'],C:P(2,1),v:90,geser:true},at:{el:'alat'}}]])
];

/* ============================ B. DILATASI ============================ */
var RECT=[P(1,1),P(3,1),P(3,2),P(1,2)],RECT3=RECT.map(function(Q){return C.dil(Q,3);});
var EXB=[
scr('b1','B1 · Aturan dilatasi [O, k]',SRC+', bagian B.1 (Tipe 8)',[
 ['<p>Dilatasi memperbesar atau memperkecil bangun terhadap satu pusat dengan faktor skala k. Bayangan selalu <b>sebangun</b> dengan bangun asal: bentuknya sama, ukurannya bisa berbeda.</p>'
  +tex('(x,\\ y) \\xrightarrow{[O,\\ k]} (kx,\\ ky)','(x, y) → (kx, ky)',true)+'<p>Kedua koordinat <b>dikalikan</b> k, bukan ditambah k.</p>',
  'Dilatasi: kalikan kedua koordinat dengan k.',vDil(P(2,-1),'A',3)],
 [contoh('Contoh (Tipe 8)','A(2, −1) dengan k = 3 menjadi <b>A′(6, −3)</b>.'),'A′ segaris dengan O dan A, tiga kali lebih jauh dari O.'],
 [alat('Coba sendiri: ubah faktor skala','Faktor skala k',{min:-3,max:3,step:0.25,v0:3,pre:[-2,-1,-0.5,0.5,1,2,3],fmt:kF,geser:true}),
  'Geser k dan perhatikan letak A′ pada garis putus-putus.',null,{alat:{j:'dil',pts:[P(2,-1)],nama:['A'],C:O,v:3,geser:true},at:{el:'alat'}}]]),

scr('b2','B2 · Makna nilai k',SRC+', bagian B.2 (Tipe 9, 10)',[
 [tblE(['Nilai k','Ukuran bayangan','Letak bayangan terhadap pusat'],[{c:['k > 1','diperbesar','sepihak dengan titik asal']},{c:['0 < k < 1','diperkecil','sepihak dengan titik asal']},{c:['k = 1','tetap (berimpit)','sama dengan titik asal']},
  {c:['−1 < k < 0','diperkecil','berlawanan pihak']},{c:['k = −1','tetap ukurannya','berlawanan pihak (sama dengan rotasi 180°)']},{c:['k < −1','diperbesar','berlawanan pihak']}])
  +'<p>Yang menentukan besar atau kecil adalah <b>|k|</b>. Tanda negatif hanya membuat bayangan pindah ke seberang pusat.</p>',
  'Lihat |k| untuk ukuran, lihat tanda k untuk pihak.',vDil(P(8,-4),'B',0.5)],
 [contoh('Contoh (Tipe 9)','B(8, −4) dengan k = ½ menjadi <b>B′(4, −2)</b>. Ini pengecilan.'),'k = ½: bayangan di antara O dan B.',vDil(P(8,-4),'B',0.5)],
 [contoh('Contoh (Tipe 10)','C(3, 2) dengan k = −2 menjadi <b>C′(−6, −4)</b>. Bayangan dua kali lebih jauh dari O dan berada di seberang O.'),'k negatif: bayangan pindah ke seberang O.',vDil(P(3,2),'C',-2)],
 [alat('Coba sendiri: k positif dan negatif','Faktor skala k',{min:-3,max:3,step:0.25,v0:-2,pre:[-2,-1,-0.5,0.5,1,2,3],fmt:kF}),
  'Coba k = −1. Hasilnya sama dengan rotasi 180°!',null,{alat:{j:'dil',pts:[P(3,2),P(4,2),P(3,4)],nama:['P','Q','R'],poly:true,C:O,v:-2},at:{el:'alat'}}]]),

scr('b3','B3 · Menentukan faktor skala',SRC+', bagian B.3 (Tipe 11)',[
 ['<p>Bagi koordinat bayangan dengan koordinat asal. Hasil kedua pembagian harus sama.</p>'+tex("k = \\frac{x'}{x} = \\frac{y'}{y}","k = x′ : x = y′ : y",true),
  'k = bayangan dibagi asal.',V({mk:[mkN(P(-2,6),'a','P'),mkN(P(1,-3),'b','P′')],ctr:ctr(O),cap:'Berapa faktor skala yang memetakan P ke P′?'})],
 [contoh('Contoh','P(−2, 6) → P′(1, −3). Diperoleh 1 : (−2) = −½ dan −3 : 6 = −½, jadi <b>k = −½</b>. Artinya pengecilan dan bayangan berlawanan pihak.'),
  'k = −½: pengecilan, berlawanan pihak.',vDil(P(-2,6),'P',-0.5)]]),

scr('b4','B4 · Panjang dan luas bayangan',SRC+', bagian B.4 (Tipe 12)',[
 ['<p>Panjang sisi bayangan sama dengan |k| kali panjang sisi asal. Luas bayangan sama dengan k² kali luas asal.</p>'+tex("L' = k^2 \\times L","L′ = k² × L",true),
  'Panjang dikali |k|, luas dikali k².',V({poly:[poly(RECT,'a',['A','B','C','D'])],ctr:ctr(O),cap:'Persegi panjang 2 × 1, luas 2.'})],
 [contoh('Contoh','Persegi panjang 2 × 1 (luas 2) didilatasi dengan k = 3. Ukuran bayangan 6 × 3, luas 18. Perbandingan luas 18 : 2 = 9 = 3².'),
  'Luas 2 menjadi 18, yaitu 9 kali = 3².',V({poly:[poly(RECT,'a',['A','B','C','D']),poly(RECT3,'b',['A′','B′','C′','D′'])],ctr:ctr(O),seg:[seg(O,RECT3[2],'k')],cap:CD+' Satu kotak = 1 satuan.'})],
 [alat('Coba sendiri: luas bayangan','Faktor skala k',{min:-3,max:3,step:0.25,v0:3,pre:[-2,-0.5,0.5,2,3],fmt:kF}),
  'Perhatikan perbandingan luas pada keterangan di bawah slider.',null,{alat:{j:'dil',pts:RECT,nama:['A','B','C','D'],poly:true,C:O,v:3,luas:true},at:{el:'alat'}}]]),

scr('b5','B5 · Dilatasi dengan pusat P(a, b)',SRC+', bagian B.5 (Tipe 14)',[
 ['<p>Langkahnya mirip rotasi dengan pusat P: hitung selisih, kalikan k, lalu tambahkan pusat.</p>'+tex("(x,\\ y) \\xrightarrow{[P(a,\\,b),\\ k]} \\big(a + k(x - a),\\ b + k(y - b)\\big)",'(x, y) → (a + k(x − a), b + k(y − b))',true),
  'Pusatnya P, jadi hitung selisih terhadap P dulu.',V({mk:[mkN(P(4,5),'a','A')],ctr:ctr(P(1,2)),seg:[seg(P(1,2),P(4,5),'a')],cap:'Pusat dilatasi P(1, 2).'})],
 [contoh('Contoh','A(4, 5), pusat P(1, 2), k = 2. Selisih (3, 3), dikali 2 menjadi (6, 6), ditambah (1, 2) menjadi <b>A′(7, 8)</b>.'),
  'Selisih (3, 3) dikali 2, lalu ditambah (1, 2).',vDil(P(4,5),'A',2,P(1,2))],
 [alat('Coba sendiri: pusat P(1, 2)','Faktor skala k',{min:-3,max:3,step:0.25,v0:2,pre:[-1,0.5,2],fmt:kF,geser:true}),
  'Garis putus-putus selalu melewati P.',null,{alat:{j:'dil',pts:[P(4,5)],nama:['A'],C:P(1,2),v:2,geser:true},at:{el:'alat'}}]])
];

/* ============================ C. PERSAMAAN GARIS ============================ */
var g15=C.L(-2,1,1),g15b=C.L(1,2,-1);       /* y = 2x + 1 → x + 2y + 1 = 0 */
var EXC=[
scr('c1','C1 · Metode dua titik',SRC+', bagian C.1 (Tipe 15)',[
 ['<p>Bayangan sebuah garis tetap berupa garis. Ada dua cara mencari persamaannya: <b>metode dua titik</b> (lebih visual) dan <b>metode substitusi</b> (lebih cepat).</p>'
  +ol(['Pilih dua titik pada garis asal, misalnya titik dengan x = 0 dan x = 1.','Tentukan bayangan kedua titik itu.','Hitung gradien: m = (y₂ − y₁) : (x₂ − x₁).','Susun persamaan garis y − y₁ = m(x − x₁).']),
  'Garis cukup diwakili dua titiknya.',V({ln:[lnV(g15,'a','y = 2x + 1')],mk:[mk(P(0,1),'a'),mk(P(1,3),'a')],ctr:ctr(O),cap:CG})],
 [contoh('Contoh','Garis y = 2x + 1 dirotasi 90°. Titik (0, 1) dan (1, 3) berpindah ke (−1, 0) dan (−3, 1).'),
  'Putar dua titik itu sebesar 90°.',V({ln:[lnV(g15,'a','y = 2x + 1')],mk:[mk(P(0,1),'a'),mk(P(1,3),'a'),mk(P(-1,0),'b'),mk(P(-3,1),'b')],seg:[seg(O,P(1,3),'a'),seg(O,P(-3,1),'b')],arc:arc(O,P(1,3),90),ctr:ctr(O),cap:CG})],
 ['<p>Gradiennya 1 : (−2) = −½. Garis melalui (−1, 0): y = −½(x + 1), atau <b>x + 2y + 1 = 0</b>.</p>',
  'Gradien −½, jadi bayangannya x + 2y + 1 = 0.',V({ln:[lnV(g15,'a','y = 2x + 1'),lnV(g15b,'b','x + 2y + 1 = 0')],mk:[mk(P(-1,0),'b'),mk(P(-3,1),'b')],ctr:ctr(O),cap:CG})]]),

scr('c2','C2 · Metode substitusi',SRC+', bagian C.2 (Tipe 16–19)',[
 [ol(['Tulis aturan pemetaan, lalu nyatakan x dan y dalam x′ dan y′ (lihat tabel).','Substitusikan ke persamaan garis asal.','Sederhanakan, lalu hapus tanda aksen.'])
  +tblE(['Transformasi','Substitusikan','Garis ax + by = c menjadi'],[{c:['Rotasi 90°','x = y′, y = −x′','−bx + ay = c']},{c:['Rotasi 180°','x = −x′, y = −y′','ax + by = −c']},{c:['Rotasi 270°','x = −y′, y = x′','bx − ay = c']},{c:['Dilatasi [O, k]','x = x′/k, y = y′/k','ax + by = kc']}]),
  'Substitusi bekerja langsung pada persamaan.',V({ln:[lnV(C.L(2,-1,4),'a')],ctr:ctr(O),cap:CG})],
 [contoh('Contoh (Tipe 16)','2x − y = 4 dirotasi 90°. Substitusi x = y′, y = −x′ memberi 2y′ + x′ = 4, jadi <b>x + 2y = 4</b>.'),'Rotasi 90°: garis bayangan tegak lurus garis asal.',V({ln:[lnV(C.L(2,-1,4),'a'),lnV(C.L(1,2,4),'b')],ctr:ctr(O),cap:CG})],
 [contoh('Contoh (Tipe 17)','3x − y = 6 dirotasi 180°. Substitusi memberi −3x′ + y′ = 6, jadi <b>3x − y = −6</b>.'),'Rotasi 180°: garis bayangan sejajar.',V({ln:[lnV(C.L(3,-1,6),'a'),lnV(C.L(3,-1,-6),'b')],ctr:ctr(O),cap:CG})],
 [contoh('Contoh (Tipe 18)','2x + y = 4 didilatasi k = 2. Substitusi memberi x′ + ½y′ = 4; dikali 2 menjadi <b>2x + y = 8</b>.'),'Dilatasi: koefisien tetap, ruas kanan dikali k.',V({ln:[lnV(C.L(2,1,4),'a'),lnV(C.L(2,1,8),'b')],ctr:ctr(O),cap:CG})],
 [contoh('Contoh (Tipe 19)','x − 2y = 6 didilatasi k = −½. Substitusi x = −2x′, y = −2y′ memberi −2x′ + 4y′ = 6, disederhanakan menjadi <b>x − 2y = −3</b>.'),'k = −½: garis bayangan pindah ke seberang O.',V({ln:[lnV(C.L(1,-2,6),'a'),lnV(C.L(1,-2,-3),'b')],mk:[mk(P(6,0),'a'),mk(P(-3,0),'b')],ctr:ctr(O),cap:CG})]]),

scr('c3','C3 · Kedudukan garis bayangan',SRC+', bagian C.3',[
 [tblE(['Transformasi','Kedudukan','Alasan'],[{c:['Rotasi 90° atau 270°','tegak lurus','m₁ × m₂ = −1']},{c:['Rotasi 180°','sejajar; berimpit jika garis melalui O (c = 0)','gradien sama']},{c:['Dilatasi pusat O','sejajar; berimpit jika garis melalui O','gradien sama']}])
  +'<p>Pada dilatasi dengan k negatif, garis bayangan sejajar tetapi berada di pihak berlawanan dari O. Contohnya x − 2y = 6 memotong sumbu-x di (6, 0), sedangkan bayangannya x − 2y = −3 memotong di (−3, 0).</p>',
  'Rotasi 90° membuat tegak lurus; 180° dan dilatasi membuat sejajar.',V({ln:[lnV(C.L(1,-2,6),'a'),lnV(C.L(1,-2,-3),'b')],mk:[mk(P(6,0),'a'),mk(P(-3,0),'b')],ctr:ctr(O),cap:CG})],
 [alat('Coba sendiri: putar garis','Sudut rotasi',{min:-360,max:360,step:15,v0:90,pre:[-90,90,180,270],fmt:degF}),
  'Putar garisnya. Kapan garis bayangan tegak lurus? Kapan sejajar?',null,{alat:{j:'grs',q:C.L(1,-2,6),mode:'rot',v:90},at:{el:'alat'}}],
 [alat('Coba sendiri: dilatasi garis','Faktor skala k',{min:-3,max:3,step:0.25,v0:-0.5,pre:[-2,-1,-0.5,0.5,2],fmt:kF}),
  'Dilatasi tidak mengubah gradien. Perhatikan titik potong dengan sumbu-x.',null,{alat:{j:'grs',q:C.L(1,-2,6),mode:'dil',v:-0.5},at:{el:'alat'}}]])
];

/* ============================ D. KOMPOSISI ============================ */
var EXD=[
scr('d1','D · Rotasi dilanjutkan dilatasi',SRC+', bagian D (Tipe 24)',[
 ['<p>Kerjakan transformasi satu per satu sesuai urutan soal. Bayangan pertama menjadi titik asal untuk transformasi kedua.</p><p><b>Contoh.</b> A(2, 3) dirotasi 90°, lalu didilatasi [O, 2].</p>',
  'Dua transformasi dikerjakan berurutan.',V({mk:[mkN(P(2,3),'a','A')],ctr:ctr(O),cap:'Biru = asal, ungu = bayangan pertama, jingga = bayangan akhir.'})],
 ['<div class="exstep"><b class="lkh">1</b> Rotasi 90°: (−y, x) memberi A′(−3, 2).</div>','Langkah 1: putar 90°.',V({mk:[mkN(P(2,3),'a','A'),mkN(P(-3,2),'m','A′')],arc:arc(O,P(2,3),90,'m'),seg:[seg(O,P(2,3),'a'),seg(O,P(-3,2),'m')],ctr:ctr(O),cap:'Biru = asal, ungu = bayangan pertama, jingga = bayangan akhir.'})],
 ['<div class="exstep"><b class="lkh">2</b> Dilatasi k = 2: (2 × (−3), 2 × 2) memberi <b>A″(−6, 4)</b>.</div>','Langkah 2: kalikan A′ dengan 2.',V({mk:[mkN(P(2,3),'a','A'),mkN(P(-3,2),'m','A′'),mkN(P(-6,4),'b','A″')],seg:[seg(O,P(-6,4),'k')],ctr:ctr(O),cap:'Biru = asal, ungu = bayangan pertama, jingga = bayangan akhir.'})],
 [ingat('Jika kedua transformasi berpusat di O, urutan rotasi dan dilatasi boleh dibalik dan hasilnya sama. Jika pusatnya berbeda, urutan bisa mengubah hasil, jadi tetap ikuti urutan soal.'),'Pusat sama di O? Urutan boleh dibalik.']])
];

/* ============================ E. KONTEKS BONE ============================ */
var G=P(3,-4),G90=C.rot(G,90);
var FOTO={x0:-2,y0:-2,x1:16,y1:16,g:1,lb:2};
var DEN=[P(-4,-2),P(4,-2),P(4,2),P(-4,2)],DENb=DEN.map(function(Q){return C.dil(Q,0.5);});
var EXE=[
scr('e1','E1 · Kata kunci dan bianglala Watampone',SRC+', bagian E (Tipe 20)',[
 ['<p>Soal cerita memakai konsep yang sama dengan bagian A–C. Kuncinya adalah mengenali jenis transformasi dari kata kunci.</p>'
  +tblE(['Kata kunci dalam soal','Transformasi','Konsep yang dipakai'],[{c:['berputar, diputar, motif silang','rotasi','aturan pemetaan; garis bayangan tegak lurus (90°/270°)']},{c:['diperbesar, diperkecil, dikecilkan, skala','dilatasi','(kx, ky); panjang × k; luas × k²']},{c:['jarak ke pusat putaran','rotasi','jarak tidak berubah']}]),
  'Kenali transformasinya dari kata kunci.',V({ctr:ctr(O),circ:{c:[0,0],r:5},cap:'Lingkaran putus-putus = lintasan kabin bianglala.'})],
 [contoh('Bianglala pasar malam Watampone (Tipe 20)','Kabin di G(3, −4) berputar 90° berlawanan arah jarum jam ke <b>G′(−4, 3)</b>. Jarak ke pusat sebelum dan sesudah sama, yaitu √(3² + 4²) = 5 m.'),
  'Kabin berputar, tetapi tetap 5 m dari pusat.',V({mk:[mkN(G,'a','G'),mkN(G90,'b','G′')],seg:[seg(O,G,'a'),seg(O,G90,'b')],arc:arc(O,G,90),ctr:ctr(O),circ:{c:[0,0],r:5},cap:'Lingkaran putus-putus = lintasan kabin (satuan meter).'})],
 [alat('Coba sendiri: putar bianglala','Sudut putaran',{min:-360,max:360,step:15,v0:90,pre:[90,180,270],fmt:degF}),
  'Seberapa pun diputar, kabin tetap di lingkaran.',null,{alat:{j:'rot',pts:[G],nama:['G'],C:O,v:90,circ:5},at:{el:'alat'}}]]),

scr('e2',"E2 · Motif garis lipa' sabbe",SRC+', bagian E (Tipe 21)',[
 [contoh("Motif garis lipa' sabbe (Tipe 21)",'Garis y = x + 2 dirotasi 90° menjadi <b>y = −x − 2</b>. Gradiennya 1 dan −1, hasil kalinya −1, sehingga kedua garis membentuk motif silang yang tegak lurus.'),
  'Rotasi 90° menghasilkan motif silang.',V({ln:[lnV(C.L(-1,1,2),'a','y = x + 2'),lnV(C.L(1,1,-2),'b','y = −x − 2')],mk:[mk(P(0,2),'a'),mk(P(-2,0),'a'),mk(P(0,-2),'b')],ctr:ctr(O),cap:'Garis biru = motif asal, garis jingga = motif hasil rotasi.'})],
 [alat('Coba sendiri: putar garis motif','Sudut rotasi',{min:-360,max:360,step:15,v0:90,pre:[90,180,270],fmt:degF}),
  'Coba 180°. Apakah motifnya masih silang?',null,{alat:{j:'grs',q:C.L(-1,1,2),mode:'rot',v:90},at:{el:'alat'}}]]),

scr('e3','E3 · Foto Rumah Adat Bola Soba',SRC+', bagian E (Tipe 13)',[
 [contoh('Foto Rumah Adat Bola Soba (Tipe 13)','Foto 4 cm × 6 cm diperbesar dengan k = 2,5 menjadi <b>10 cm × 15 cm</b>. Foto baru sebangun dengan foto lama.'),
  'Lebar dan panjang sama-sama dikali 2,5.',{B:FOTO,poly:[poly([P(0,0),P(4,0),P(4,6),P(0,6)],'a',[]),poly([P(0,0),P(10,0),P(10,15),P(0,15)],'b',[])],seg:[seg(O,P(10,15),'k')],ctr:ctr(O),cap:'Biru = foto lama, jingga = foto baru (satuan cm). Pusat di pojok kiri bawah.'}],
 [ingat('Sebangun berarti bentuknya sama dan perbandingan sisinya tetap: 4 : 6 = 10 : 15. Kongruen berarti bentuk dan ukurannya sama.'),'Diperbesar berarti sebangun, bukan kongruen.']]),

scr('e4','E4 · Denah dermaga Pelabuhan Bajoe',SRC+', bagian E (Tipe 22)',[
 [contoh('Denah dermaga Pelabuhan Bajoe (Tipe 22)','Denah 8 × 4 (luas 32) dikecilkan dengan k = ½ menjadi 4 × 2 (luas 8). Perbandingan luasnya 8 : 32 = ¼ = (½)².'),
  'Luas mengecil menjadi seperempatnya.',V({poly:[poly(DEN,'a',['P','Q','R','S']),poly(DENb,'b',['P′','Q′','R′','S′'])],ctr:ctr(O),cap:'Biru = denah pada spanduk, jingga = denah pada brosur.'})],
 [alat('Coba sendiri: skala denah','Faktor skala k',{min:-3,max:3,step:0.25,v0:0.5,pre:[0.5,1,2],fmt:kF}),
  'Perhatikan perbandingan luasnya.',null,{alat:{j:'dil',pts:DEN,nama:['P','Q','R','S'],poly:true,C:O,v:0.5,luas:true},at:{el:'alat'}}]]),

scr('e5','E5 · Jalan Watampone–Bajoe pada peta',SRC+', bagian E (Tipe 23)',[
 [contoh('Jalan Watampone–Bajoe pada peta (Tipe 23)','Garis x − 2y + 2 = 0 memotong sumbu di (−2, 0) dan (0, 1). Setelah diperbesar dengan k = 2, titik potongnya (−4, 0) dan (0, 2), sehingga persamaan jalan pada poster <b>x − 2y + 4 = 0</b>. Garis ini sejajar dengan jalan asal.'),
  'Dilatasi menggandakan titik potong, gradiennya tetap.',V({ln:[lnV(C.L(1,-2,-2),'a','jalan asal'),lnV(C.L(1,-2,-4),'b','jalan poster')],mk:[mk(P(-2,0),'a'),mk(P(0,1),'a'),mk(P(-4,0),'b'),mk(P(0,2),'b')],ctr:ctr(O,'O'),cap:'O = Lapangan Merdeka. Biru = jalan pada peta, jingga = jalan pada poster.'})]])
];

/* ============================ PENUTUP ============================ */
var EXZ=[
scr('z1','Kesalahan umum dan cara menghindarinya',SRC+', kesalahan umum',[
 [kes('Tertukar aturan 90° dan 270°','Rotasi 90° dipakai (y, −x)','Uji dengan titik (1, 0): rotasi 90° membawanya ke (0, 1)'),'Kesalahan pertama: aturan 90° dan 270° tertukar.',V({mk:[mk(P(1,0),'a'),mk(P(0,1),'b'),mk(P(0,-1),'r','(0, −1) salah')],arc:arc(O,P(1,0),90),ctr:ctr(O),cap:CR})],
 [kes('Menganggap "90° searah jarum jam" sama dengan 90°','C(5, 1) → (−1, 5)','Ubah dulu: 90° searah jarum jam = 270°'),'90° searah jarum jam adalah 270°.',vRot(P(5,1),'C',270,{arah:-90})],
 [kes('Tidak menukar x dan y pada rotasi 90° atau 270°','(x, y) → (−x, y)','Ingat: 90° dan 270° menukar posisi, 180° tidak'),'Rotasi 90° dan 270° selalu menukar x dan y.'],
 [kes('Menambah k, bukan mengalikan','(x + k, y + k)','Dilatasi selalu (kx, ky)')+kes('Hanya satu koordinat dikali k','(kx, y)','Kedua koordinat dikali k'),'Dilatasi: kedua koordinat dikalikan k.',vDil(P(2,-1),'A',3)],
 [kes('Mengira k negatif berarti pengecilan','k = −2 disebut pengecilan','Besar-kecil dilihat dari |k|; tanda menentukan pihak'),'|k| menentukan ukuran.',vDil(P(3,2),'C',-2)],
 [kes('Luas dikali k','Luas bayangan = 3 × luas asal','Luas dikali k², panjang dikali |k|'),'Luas dikali k², bukan k.',V({poly:[poly(RECT,'a',[]),poly(RECT3,'b',[])],ctr:ctr(O),cap:'Luas 2 menjadi 18 = 3² × 2.'})],
 [kes('Substitusi dibalik pada dilatasi garis','x = 2x′ untuk k = 2',"Untuk k = 2, x′ = 2x, jadi x = x′/2")+kes('Rotasi pusat P langsung memakai aturan pusat O','A(5, 3) → (−3, 5)','Geser ke O, rotasi, lalu geser kembali'),'Hati-hati dengan arah substitusi dan pusat rotasi.',vRot(P(5,3),'A',90,{C:P(2,1)})],
 ['<p class="ans">Siap berlatih! Kerjakan soal di Latihan Mandiri.</p>','Siap berlatih? Ayo ke Latihan Mandiri!']],true)
];

PL.EXG=[{lab:'A · Rotasi',list:EXA},{lab:'B · Dilatasi',list:EXB},{lab:'C · Persamaan garis',list:EXC},{lab:'D · Komposisi',list:EXD},{lab:'E · Konteks Bone',list:EXE},{lab:'Penutup',list:EXZ}];
PL.EX=[].concat(EXA,EXB,EXC,EXD,EXE,EXZ);
PL.belajarAlat={P:P,V:V,mk:mk,poly:poly,seg:seg,arc:arc,ctr:ctr,lnV:lnV};
})(window.PL);
