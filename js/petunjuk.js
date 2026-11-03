/* ==========================================================================
   petunjuk.js · PETUNJUK LANJUTAN (TAB LATIHAN MANDIRI)
   Petunjuk dari core.js (St.h) tampil lebih dulu. Petunjuk di file ini menyusul,
   makin rinci, dan baru terbuka setelah siswa mencoba menjawab (gerbang di latihan.js).
   Semua bilangan diambil dari Q.m (bilangan pembentuk soal di core.js),
   jadi core.js dan server tidak perlu diubah bila teks petunjuk diubah.

   PL.Petunjuk.lanjut(Q, s, St) → [teks petunjuk, …]
   PL.Petunjuk.namaRumus(h)      → teks petunjuk dengan nama aturan ditulis eksplisit
   PL.Petunjuk.uji()             → pemeriksaan mandiri di konsol
   Muat setelah core.js dan komponen.js, sebelum latihan.js.
   ========================================================================== */
(function(PL){
'use strict';
var C=CORE,nm=C.nm,ptS=C.ptS,ATURAN=C.ATURAN;

/* ---------- pembantu teks ---------- */
function kr(v){return v<0?'('+nm(v)+')':nm(v);}          /* bilangan negatif diberi kurung */
function arah(v,pos,neg){return nm(Math.abs(v))+' satuan ke '+(v<0?neg:pos);}
/* langkah gerak dari O menuju titik P */
function gerak(P,nama){
  var b=[];if(P.x)b.push(arah(P.x,'kanan','kiri'));if(P.y)b.push(arah(P.y,'atas','bawah'));
  return (nama?nama+ptS(P)+': ':'')+(b.length?'dari O, gerak '+b.join(', lalu ')+'.':'titik itu tepat di O.');
}
/* substitusi aturan rotasi tanpa menyederhanakan tanda */
function subRot(A,d,nama){
  var e=d===90?['−'+kr(A.y),nm(A.x)]:d===180?['−'+kr(A.x),'−'+kr(A.y)]:[''+nm(A.y),'−'+kr(A.x)];
  return (nama?nama+ptS(A)+' → ':'')+'dengan '+ATURAN[d]+': x′ = '+e[0]+' dan y′ = '+e[1]+'. Sederhanakan tandanya.';
}
function subDil(A,k,nama){return (nama?nama+ptS(A)+' → ':'')+'x′ = '+nm(k)+' × '+kr(A.x)+' dan y′ = '+nm(k)+' × '+kr(A.y)+'.';}
function geserKe(A,Cn){return 'x − a = '+nm(A.x)+' − '+kr(Cn.x)+' dan y − b = '+nm(A.y)+' − '+kr(Cn.y)+'. Mengurangi bilangan negatif sama dengan menambah lawannya.';}
function tambah(P,Cn){return nm(P.x)+' + '+kr(Cn.x)+' dan '+nm(P.y)+' + '+kr(Cn.y)+'.';}
function gradien(q){return q.b?-q.a/q.b:null;}
var UJI_ATURAN='Uji dengan titik (1, 0): rotasi 90° membawanya ke (0, 1), rotasi 180° ke (−1, 0), rotasi 270° ke (0, −1). Pilih aturan yang memberi hasil itu.';
var SUB_BALIK={90:'Dari x′ = −y diperoleh y = −x′; dari y′ = x diperoleh x = y′.',180:'Dari x′ = −x diperoleh x = −x′; dari y′ = −y diperoleh y = −y′.',270:'Dari x′ = y diperoleh y = x′; dari y′ = −x diperoleh x = −y′.'};

/* ---------- petunjuk per tipe: H[t](m, s, Q) → [teks] ---------- */
var H={
1:function(m,s){var A=m.A;return [
  ['Rotasi 90° berlawanan arah jarum jam membawa titik di sumbu-x positif naik ke sumbu-y positif. '+UJI_ATURAN],
  ['x′ = −y. Nilai y pada A adalah '+nm(A.y)+', jadi x′ = −'+kr(A.y)+'.'],
  ['y′ = x. Nilai x pada A adalah '+nm(A.x)+', jadi y′ tinggal disalin.'],
  ['Koordinat A′ sudah kamu hitung pada langkah 2 dan 3.',gerak(m.B,'A′')]][s];},
2:function(m,s){return [
  ['Rotasi 180° adalah setengah putaran: titik pindah ke seberang O. Kedua tanda berubah, tetapi posisi x dan y tidak bertukar.'],
  [subRot(m.A,180,'B')],
  ['B′ segaris dengan B dan O, di sisi seberang O.',gerak(m.B,'B′')]][s];},
3:function(m,s,Q){return [
  ['Satu putaran penuh 360°. Memutar 90° ke satu arah sama dengan memutar 360° − 90° = 270° ke arah sebaliknya.'],
  ['Rotasi 270° (atau 90° searah jarum jam) membawa (1, 0) turun ke (0, −1). Aturan yang memberi (0, −1) dari (1, 0) adalah (y, −x).'],
  [subRot(m.A,270,'C')],
  [gerak(m.B,'C′')]][s];},
4:function(m,s){var n=['P','Q','R'];
  if(s<3)return [subRot(m.T[s],m.d,n[s]),gerak(m.B[s],n[s]+'′')];
  return ['Hitung panjang sisi siku-siku PQ dan P′Q′ dengan menghitung kotak. Rotasi tidak mengubah panjang sisi maupun besar sudut.'];},
5:function(m,s){var A=m.A,B=m.B;return [
  ['Hitung −y = '+nm(-A.y)+' dan −x = '+nm(-A.x)+'. Cocokkan dengan x′ = '+nm(B.x)+' dan y′ = '+nm(B.y)+'.','Jika x′ sama dengan y atau −y, posisi x dan y bertukar (90° atau 270°). Jika x′ sama dengan −x, posisinya tidak bertukar (180°).'],
  ['Hubungan '+C.ATURAN[m.d]+' adalah aturan rotasi '+m.d+'°.']][s];},
6:function(m,s){var B=m.B,d=m.d,b=[SUB_BALIK[d]];
  if(s===0)return [UJI_ATURAN];
  if(s===3)return ['Periksa: putar D'+ptS(m.A)+' sebesar '+d+'°, hasilnya harus D′'+ptS(B)+'.',gerak(m.A,'D')];
  if(d===180)return s===1?['−x = '+nm(B.x)+'. Kalikan kedua ruas dengan −1.']:['−y = '+nm(B.y)+'. Kalikan kedua ruas dengan −1.'];
  if(d===90)return s===1?['−y = '+nm(B.x)+'. Kalikan kedua ruas dengan −1.']:['x = y′ = '+nm(B.y)+'.'];
  return s===1?['y = x′ = '+nm(B.x)+'.']:['−x = '+nm(B.y)+'. Kalikan kedua ruas dengan −1.'];},
7:function(m,s){return [
  [geserKe(m.A,m.C)],
  [subRot(m.D,m.d)],
  ['Tambahkan pusat: '+tambah(m.RD,m.C)],
  ['Titik A′ dan A sama jauhnya dari P.',gerak(m.B,'A′')]][s];},
8:function(m,s){return [
  ['Dilatasi [O, k] berarti “kali k”. Uji dengan k = 2 pada (1, 1): hasilnya harus (2, 2), dua kali lebih jauh dari O.'],
  [subDil(m.A,m.k,'A')],
  [gerak(m.B,'A′')]][s];},
9:function(m,s){return [
  ['Bandingkan k = '+nm(m.k)+' dengan 1. Jika k di antara 0 dan 1, bayangan lebih dekat ke O daripada titik asal.'],
  [subDil(m.A,m.k,'B'),'Mengalikan dengan '+nm(m.k)+' sama dengan membagi dengan '+nm(1/m.k)+'.'],
  [gerak(m.B,'B′')]][s];},
10:function(m,s){return [
  ['Tanda negatif pada k membuat bayangan melewati O ke sisi seberang.'],
  [subDil(m.A,m.k,'C'),'Hasil kali dua bilangan berbeda tanda adalah negatif; dua bilangan negatif menghasilkan positif.'],
  [gerak(m.B,'C′')]][s];},
11:function(m,s){var A=m.A,B=m.B,k=m.k,ak=Math.abs(k);return [
  ['k = x′ : x = '+nm(B.x)+' : '+kr(A.x)+'. Pembagian dua bilangan berbeda tanda hasilnya negatif.','Jika hasilnya pecahan, tulis seperti 1/2 atau −1/2.'],
  ['k = y′ : y = '+nm(B.y)+' : '+kr(A.y)+'.'],
  ['|k| = '+nm(ak)+(ak>1?' lebih dari 1, jadi perbesaran. ':' kurang dari 1, jadi pengecilan. ')+'k '+(k<0?'negatif, jadi berlawanan pihak.':'positif, jadi sepihak.')]][s];},
12:function(m,s){var a=Math.abs(m.k);return [
  ['A′B′ = |k| × AB = '+nm(a)+' × '+nm(m.w)+'.'],
  ['B′C′ = |k| × BC = '+nm(a)+' × '+nm(m.h)+'.'],
  ['Luas = A′B′ × B′C′ = '+nm(a*m.w)+' × '+nm(a*m.h)+'.'],
  ['Luas asal = '+nm(m.w)+' × '+nm(m.h)+' = '+nm(m.w*m.h)+'. Luas bayangan : luas asal = '+nm(a*a*m.w*m.h)+' : '+nm(m.w*m.h)+'.','Bandingkan hasilnya dengan k² = '+nm(m.k*m.k)+'.']][s];},
13:function(m,s){return [
  ['Lebar baru = '+nm(m.k)+' × '+nm(m.w)+'.'],
  ['Panjang baru = '+nm(m.k)+' × '+nm(m.h)+'.'],
  ['Perbandingan lebar : panjang foto lama '+nm(m.w)+' : '+nm(m.h)+', foto baru '+nm(m.W)+' : '+nm(m.H)+'. Perbandingannya sama, tetapi ukurannya berbeda.']][s];},
14:function(m,s){return [
  [geserKe(m.A,m.C)],
  ['k(x − a, y − b) = ('+nm(m.k)+' × '+kr(m.D.x)+', '+nm(m.k)+' × '+kr(m.D.y)+').'],
  ['Tambahkan pusat: '+tambah(m.KD,m.C)],
  ['A′ segaris dengan P dan A.',gerak(m.B,'A′')]][s];},
15:function(m,s){var mm=m.m,n=m.n;return [
  ['Untuk x = 0: y = '+nm(mm)+' × 0 + '+kr(n)+'. Untuk x = 1: y = '+nm(mm)+' × 1 + '+kr(n)+'.','Ketuk kedua titik itu pada garis biru.'],
  [subRot(m.P1,90)],
  [subRot(m.P2,90)],
  ['Gunakan koordinat yang sudah kamu hitung pada langkah 2 dan 3.',gerak(m.B1,'Titik pertama')+' '+gerak(m.B2,'Titik kedua')],
  ['m = (y₂ − y₁) : (x₂ − x₁) = ('+nm(m.B2.y)+' − '+kr(m.B1.y)+') : ('+nm(m.B2.x)+' − '+kr(m.B1.x)+').','Cek: gradien garis bayangan rotasi 90° = −1 : m asal = −1 : '+kr(mm)+'.'],
  ['Masukkan titik '+ptS(m.B1)+' ke setiap pilihan. Persamaan yang benar menghasilkan 0 = 0. Ulangi dengan '+ptS(m.B2)+'.']][s];},
16:function(m,s){var q=m.q,d=m.d,qb=m.qb;return [
  [SUB_BALIK[d]],
  ['Tulis '+C.eqS(q)+' dengan x diganti '+(d===90?'(y′)':'(−y′)')+' dan y diganti '+(d===90?'(−x′)':'(x′)')+'.','Contoh bentuknya: a(…) + b(…) = c. Kalikan, lalu perhatikan tanda.'],
  ['Hapus tanda aksen, lalu tulis suku x lebih dulu. Persamaan yang setara (semua suku dikali bilangan yang sama) juga diterima.'],
  ['Gradien garis asal '+nm(gradien(q))+', gradien garis bayangan '+nm(gradien(qb))+'. Hitung hasil kalinya.']][s];},
17:function(m,s){var q=m.q;return [
  [SUB_BALIK[180]],
  ['Kalikan kedua ruas dengan −1: semua tanda berubah, termasuk ruas kanan '+nm(q.c)+'.'],
  [q.c===0?'Garis '+C.eqS(q)+' melalui O. Titik O diputar 180° tetap di O.':'Koefisien x dan y garis bayangan sama dengan garis asal, jadi gradiennya sama. Ruas kanannya berbeda.']][s];},
18:function(m,s){var q=m.q,k=m.k;return [
  ['Dari x′ = '+nm(k)+'x, bagi kedua ruas dengan '+nm(k)+'. Lakukan hal yang sama untuk y.'],
  ['Setelah dikali '+nm(k)+', ruas kiri kembali '+C.lin(q.a,q.b)+'. Ruas kanan menjadi '+nm(k)+' × '+nm(q.c)+'.'],
  ['Pada '+C.eqS(m.qb)+': sumbu-x berarti y = 0, sumbu-y berarti x = 0.',gerak(m.X,'Titik pertama')+' '+gerak(m.Y,'Titik kedua')],
  ['Bandingkan koefisien x dan y kedua garis.']][s];},
19:function(m,s){var q=m.q,k=m.k;return [
  ['Dari x′ = '+nm(k)+'x, maka x = x′ : '+kr(k)+' = '+nm(1/k)+'x′. Hal yang sama berlaku untuk y.'],
  ['Kalikan kedua ruas dengan '+kr(k)+'. Ruas kanan menjadi '+nm(k)+' × '+kr(q.c)+'.'],
  [subDil(m.X0,k),gerak(m.XB,'Bayangan')],
  ['Titik potong sumbu-x berpindah dari '+ptS(m.X0)+' ke '+ptS(m.XB)+'. Periksa apakah keduanya di sisi yang sama dari O.']][s];},
20:function(m,s){var A=m.A;return [
  [UJI_ATURAN],
  [subRot(A,m.d,'G')],
  ['Kabin tetap berada pada lingkaran putus-putus.',gerak(m.B,'G′')],
  ['Jarak = √(x² + y²) = √('+nm(A.x*A.x)+' + '+nm(A.y*A.y)+') = √'+nm(A.x*A.x+A.y*A.y)+'.']][s];},
21:function(m,s){return [
  ['Sumbu-y: x = 0, jadi y = '+nm(m.n)+'. Sumbu-x: y = 0, jadi 0 = '+nm(m.m)+'x + '+kr(m.n)+'.'],
  [subRot(m.P1,m.d)+' '+subRot(m.P2,m.d)],
  ['m = (y₂ − y₁) : (x₂ − x₁) memakai '+ptS(m.B1)+' dan '+ptS(m.B2)+'. Pecahan boleh ditulis −1/2.','n adalah ordinat titik bayangan yang terletak pada sumbu-y.'],
  ['m₁ × m₂ = '+nm(m.m)+' × '+kr(m.mb)+'.']][s];},
22:function(m,s){var k=m.k,T=m.T,B=m.B;return [
  ['Kalikan koordinat setiap titik sudut dengan '+nm(k)+'. Mulai dari P: '+subDil(T[0],k)],
  ['P′Q′ = selisih absis Q′ dan P′ = '+nm(B[1].x)+' − '+kr(B[0].x)+'.'],
  ['Q′R′ = selisih ordinat R′ dan Q′ = '+nm(B[2].y)+' − '+kr(B[1].y)+'.'],
  ['Luas = '+nm(m.W)+' × '+nm(m.H)+'.'],
  ['Luas spanduk = '+nm(m.w)+' × '+nm(m.h)+' = '+nm(m.w*m.h)+'. Bagi luas bayangan dengan luas spanduk.']][s];},
23:function(m,s){var a=m.a,b=m.b,c=m.c;return [
  ['Sumbu-x: y = 0, jadi '+C.sum([[a,'x'],[c,'']])+' = 0. Sumbu-y: x = 0, jadi '+C.sum([[b,'y'],[c,'']])+' = 0.'],
  [subDil(m.PX,m.k)+' '+subDil(m.PY,m.k)],
  ['Masukkan '+ptS(m.BX)+': '+nm(a)+' × '+kr(m.BX.x)+' + '+nm(b)+' × 0 + c = 0, lalu selesaikan untuk c.'],
  ['Dilatasi dengan pusat O tidak mengubah koefisien x dan y, jadi gradiennya sama.']][s];},
24:function(m,s){var r=m.dr;
  var t1=r?subRot(m.A,m.d,'A'):subDil(m.A,m.k,'A'),t2=r?subDil(m.M,m.k,'A′'):subRot(m.M,m.d,'A′');
  return [[t1],[gerak(m.M,'A′')],[t2],[gerak(m.B,'A″')]][s];}
};

function lanjut(Q,s){
  var f=H[Q.t];if(!f||!Q.m)return [];
  var r=f(Q.m,s,Q);
  return Array.isArray(r)?r.filter(Boolean):[];
}
/* nama aturan ditulis eksplisit: bila petunjuk hanya menyebut "(−y, x)" tanpa kata rotasi atau derajat,
   ditambahkan "(aturan rotasi 90°)" sekali */
function namaRumus(h){
  h=String(h);if(/rotasi|°/i.test(h))return h;
  var m=/\(−y, x\)|\(−x, −y\)|\(y, −x\)/.exec(h);if(!m)return h;
  var d=m[0]==='(−y, x)'?90:m[0]==='(−x, −y)'?180:270;
  return h.replace(m[0],m[0]+' (aturan rotasi '+d+'°)');
}
/* uji mandiri: PL.Petunjuk.uji() di konsol */
function uji(n){
  n=n||40;var lap=[],rng=C.mulberry32(11);
  for(var t=1;t<=24;t++)C.levels(t).forEach(function(l){C.variants(t,l,true).forEach(function(v){
    for(var i=0;i<n;i++){var Q=C.gen(t,l,rng,true,v);
      Q.st.forEach(function(St,s){var h;try{h=lanjut(Q,s,St);}catch(e){lap.push('T'+t+l+v+' L'+(s+1)+' galat '+e.message);return;}
        if(!h.length)lap.push('T'+t+l+v+' L'+(s+1)+' tanpa petunjuk lanjutan');
        h.forEach(function(x){if(/NaN|undefined|null|Infinity/.test(x))lap.push('T'+t+l+v+' L'+(s+1)+' '+x);});});}
  });});
  return lap.length?lap.slice(0,30):'Semua petunjuk lanjutan aman.';
}
PL.Petunjuk={lanjut:lanjut,namaRumus:namaRumus,uji:uji,H:H};
})(window.PL=window.PL||{});
