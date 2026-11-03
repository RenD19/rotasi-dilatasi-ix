/* ==========================================================================
   penyelesaian.js · PENYELESAIAN BERTAHAP (TAB LATIHAN MANDIRI)
   Setelah siswa menjawab benar (Periksa) atau menekan 🔑 Lihat jawaban, langkah yang
   memerlukan perhitungan (substitusi aturan, perkalian k, gradien, persamaan garis)
   ditampilkan sebagai perhitungan lengkap yang dirender KaTeX.

   PL.Penyelesaian.langkah(Q, s) → [{judul, tex:[baris…]}, …] atau [] bila langkah itu
   tidak memerlukan perhitungan.
   Semua angka dihitung dari Q.m (bilangan pembentuk soal di core.js).
   Muat setelah core.js dan komponen.js (memakai PL.U.esc), sebelum latihan.js.
   ========================================================================== */
(function(PL){
'use strict';
var C=CORE,esc=PL.U.esc,ptS=C.ptS;

/* ---------- penulisan bilangan dan bentuk aljabar dalam TeX ---------- */
function tn(v){
  v=Math.round(v*1e9)/1e9;if(v===0)return '0';
  var neg=v<0,a=Math.abs(v),s;
  if(Math.floor(a)===a)s=String(a).replace(/\B(?=(\d{3})+(?!\d))/g,'{.}');
  else{
    s=null;
    for(var d=2;d<=12&&!s;d++){var n=a*d;if(Math.abs(n-Math.round(n))<1e-9&&a<1)s='\\tfrac{'+Math.round(n)+'}{'+d+'}';}
    if(!s)s=String(Math.round(a*1000)/1000).replace('.','{,}');
  }
  return (neg?'-':'')+s;
}
/* koefisien di depan kurung: 1 → kosong, −1 → tanda minus */
function koef(v){return v===1?'':v===-1?'-':tn(v);}
function tk(v){return v<0?'('+tn(v)+')':tn(v);}
function P(Q){return '('+tn(Q.x)+',\\ '+tn(Q.y)+')';}
function teks(s){return '\\text{'+String(s).replace(/[\\{}]/g,'')+'}';}
/* jumlah suku [[koefisien, peubah TeX], …] */
function ex(su){
  var t='';
  su.forEach(function(x){
    var c=Math.round(x[0]*1e9)/1e9,v=x[1];if(!c)return;
    var m=Math.abs(c),badan=v?(m===1?'':tn(m))+v:tn(m);
    t+=t===''?(c<0?'-':'')+badan:(c<0?' - ':' + ')+badan;
  });
  return t===''?'0':t;
}
function lin(a,b,p){p=p||'';return ex([[a,'x'+p],[b,'y'+p]]);}
function eqT(q,p){return lin(q.a,q.b,p)+' &= '+tn(q.c);}
var ATURAN_T={90:'(-y,\\ x)',180:'(-x,\\ -y)',270:'(y,\\ -x)'};

/* ---------- blok-blok perhitungan ---------- */
/* rotasi titik A dengan pusat O */
function blokRot(A,d,nama,B){
  B=B||C.rot(A,d);
  var e=d===90?'\\left(-'+tk(A.y)+',\\ '+tn(A.x)+'\\right)':d===180?'\\left(-'+tk(A.x)+',\\ -'+tk(A.y)+'\\right)':'\\left('+tn(A.y)+',\\ -'+tk(A.x)+'\\right)';
  return {judul:'Rotasi '+d+'° titik '+(nama||'')+ptS(A),tex:[(nama?nama+"'":'')+'(x\',\\ y\') &= '+ATURAN_T[d],'&= '+e,'&= '+P(B)]};
}
/* dilatasi titik A dengan pusat O */
function blokDil(A,k,nama){
  var B=C.dil(A,k);
  return {judul:'Dilatasi titik '+(nama||'')+ptS(A)+', k = '+C.nm(k),tex:[(nama?nama+"'":'')+'(x\',\\ y\') &= (kx,\\ ky)','&= ('+tn(k)+' \\cdot '+tk(A.x)+',\\ '+tn(k)+' \\cdot '+tk(A.y)+')','&= '+P(B)]};
}
/* selisih terhadap pusat */
function blokSelisih(A,Cn){
  return {judul:'Selisih terhadap pusat '+ptS(Cn),tex:['(x - a,\\ y - b) &= ('+tn(A.x)+' - '+tk(Cn.x)+',\\ '+tn(A.y)+' - '+tk(Cn.y)+')','&= '+P({x:A.x-Cn.x,y:A.y-Cn.y})]};
}
function blokTambah(R,Cn,nama){
  return {judul:'Tambahkan kembali pusat '+ptS(Cn),tex:[nama+" &= ("+tn(R.x)+' + '+tk(Cn.x)+',\\ '+tn(R.y)+' + '+tk(Cn.y)+')','&= '+P({x:R.x+Cn.x,y:R.y+Cn.y})]};
}
function blokKali(D,k){
  return {judul:'Kalikan dengan k = '+C.nm(k),tex:['k(x - a,\\ y - b) &= ('+tn(k)+' \\cdot '+tk(D.x)+',\\ '+tn(k)+' \\cdot '+tk(D.y)+')','&= '+P({x:k*D.x,y:k*D.y})]};
}
function blokGradien(A,B){
  var dy=B.y-A.y,dx=B.x-A.x;
  return {judul:'Gradien garis melalui '+ptS(A)+' dan '+ptS(B),tex:['m &= \\frac{y_2 - y_1}{x_2 - x_1}','&= \\frac{'+tn(B.y)+' - '+tk(A.y)+'}{'+tn(B.x)+' - '+tk(A.x)+'}','&= \\frac{'+tn(dy)+'}{'+tn(dx)+'}'+(C.gcd(dy,dx)===1&&dx>0&&dx!==1?'':' = '+tn(dy/dx))]};
}

/* ---------- penyelesaian per tipe: PY[t](m, s) → [blok] atau null ---------- */
var PY={
1:function(m,s){var A=m.A;return [null,
  [{judul:'Nilai x′',tex:["x' &= -y","&= -"+tk(A.y),'&= '+tn(-A.y)]}],
  [{judul:'Nilai y′',tex:["y' &= x","&= "+tn(A.x)]}],null][s];},
2:function(m,s){return s===1?[blokRot(m.A,180,'B')]:null;},
3:function(m,s){return s===2?[blokRot(m.A,270,'C')]:null;},
4:function(m,s){return s<3?[blokRot(m.T[s],m.d,'PQR'[s])]:null;},
5:function(m,s){var A=m.A,B=m.B;return s===0?[{judul:'Bandingkan K'+ptS(A)+' dan K′'+ptS(B),tex:['-y &= -'+tk(A.y)+' = '+tn(-A.y),'-x &= -'+tk(A.x)+' = '+tn(-A.x),"x' &= "+tn(B.x)+',\\quad y\' = '+tn(B.y)]}]:null;},
6:function(m,s){var B=m.B,d=m.d,A=m.A;if(s!==1&&s!==2)return null;
  var L;
  if(d===90)L=s===1?['-y &= '+tn(B.x),'y &= '+tn(A.y)]:['x &= y\'','x &= '+tn(A.x)];
  else if(d===270)L=s===1?['y &= x\'','y &= '+tn(A.y)]:['-x &= '+tn(B.y),'x &= '+tn(A.x)];
  else L=s===1?['-x &= '+tn(B.x),'x &= '+tn(A.x)]:['-y &= '+tn(B.y),'y &= '+tn(A.y)];
  return [{judul:'Dari aturan '+C.ATURAN[d]+' = '+ptS(B),tex:L}];},
7:function(m,s){return [[blokSelisih(m.A,m.C)],[blokRot(m.D,m.d,'',m.RD)],[blokTambah(m.RD,m.C,"A'")],null][s];},
8:function(m,s){return s===1?[blokDil(m.A,m.k,'A')]:null;},
9:function(m,s){return s===1?[blokDil(m.A,m.k,'B')]:null;},
10:function(m,s){return s===1?[blokDil(m.A,m.k,'C')]:null;},
11:function(m,s){var A=m.A,B=m.B;return [
  [{judul:'Faktor skala dari absis',tex:['k &= \\frac{x\'}{x} = \\frac{'+tn(B.x)+'}{'+tn(A.x)+'}','&= '+tn(m.k)]}],
  [{judul:'Faktor skala dari ordinat',tex:['k &= \\frac{y\'}{y} = \\frac{'+tn(B.y)+'}{'+tn(A.y)+'}','&= '+tn(m.k)]}],null][s];},
12:function(m,s){var a=Math.abs(m.k),W=a*m.w,H=a*m.h;return [
  [{judul:'Panjang A′B′',tex:["A'B' &= |k| \\times AB",'&= '+tn(a)+' \\times '+tn(m.w)+' = '+tn(W)]}],
  [{judul:'Lebar B′C′',tex:["B'C' &= |k| \\times BC",'&= '+tn(a)+' \\times '+tn(m.h)+' = '+tn(H)]}],
  [{judul:'Luas bayangan',tex:["L' &= A'B' \\times B'C'",'&= '+tn(W)+' \\times '+tn(H)+' = '+tn(W*H)]}],
  [{judul:'Perbandingan luas',tex:["\\frac{L'}{L} &= \\frac{"+tn(W*H)+'}{'+tn(m.w*m.h)+'} = '+tn(a*a),'k^2 &= '+tk(m.k)+'^2 = '+tn(m.k*m.k)]}]][s];},
13:function(m,s){return [
  [{judul:'Lebar foto baru',tex:['\\text{lebar baru} &= k \\times \\text{lebar lama}','&= '+tn(m.k)+' \\times '+tn(m.w)+' = '+tn(m.W)+'\\ \\text{cm}']}],
  [{judul:'Panjang foto baru',tex:['\\text{panjang baru} &= '+tn(m.k)+' \\times '+tn(m.h)+' = '+tn(m.H)+'\\ \\text{cm}']}],
  [{judul:'Perbandingan sisi',tex:['\\frac{'+tn(m.w)+'}{'+tn(m.h)+'} &= \\frac{'+tn(m.W)+'}{'+tn(m.H)+'}']}]][s];},
14:function(m,s){return [[blokSelisih(m.A,m.C)],[blokKali(m.D,m.k)],[blokTambah(m.KD,m.C,"A'")],null][s];},
15:function(m,s){var mm=m.m,n=m.n,B1=m.B1;return [
  [{judul:'Dua titik pada garis asal',tex:['x = 0 &\\Rightarrow y = '+tn(mm)+' \\cdot 0 + '+tk(n)+' = '+tn(n),'x = 1 &\\Rightarrow y = '+tn(mm)+' \\cdot 1 + '+tk(n)+' = '+tn(mm+n)]}],
  [blokRot(m.P1,90)],[blokRot(m.P2,90)],null,
  [blokGradien(m.B1,m.B2)],
  [{judul:'Persamaan garis bayangan',tex:['y - y_1 &= m(x - x_1)','y - '+tk(B1.y)+' &= '+koef(m.grad)+'\\left(x - '+tk(B1.x)+'\\right)',
    ex([[mm,'y']])+' &= -\\left(x '+(B1.x<0?'+ '+tn(-B1.x):'- '+tn(B1.x))+'\\right)\\quad'+teks('(kedua ruas dikali '+C.nm(mm)+')'),
    ex([[1,'x'],[mm,'y'],[n,'']])+' &= 0']}]][s];},
16:function(m,s){var q=m.q,d=m.d,qb=m.qb,sg=d===90?1:-1;return [null,
  [{judul:'Substitusi ke '+C.eqS(q),tex:[tn(q.a)+'('+(d===90?"y'":"-y'")+') + '+tk(q.b)+'('+(d===90?"-x'":"x'")+') &= '+tn(q.c),ex([[sg*q.a,"y'"],[-sg*q.b,"x'"]])+' &= '+tn(q.c)]}],
  [{judul:'Hapus tanda aksen dan susun ulang',tex:[ex([[-sg*q.b,'x'],[sg*q.a,'y']])+' &= '+tn(q.c),eqT(qb)]}],
  [{judul:'Hasil kali gradien',tex:['m_1 &= -\\frac{a}{b} = '+tn(-q.a/q.b),'m_2 &= '+tn(-qb.a/qb.b),'m_1 \\times m_2 &= -1']}]][s];},
17:function(m,s){var q=m.q;return [null,
  [{judul:'Substitusi x = −x′, y = −y′',tex:[tn(q.a)+'(-x\') + '+tk(q.b)+'(-y\') &= '+tn(q.c),ex([[-q.a,"x'"],[-q.b,"y'"]])+' &= '+tn(q.c)+'\\quad \\lvert \\times (-1)',eqT(m.qb,"'"),eqT(m.qb)]}],null][s];},
18:function(m,s){var q=m.q,k=m.k,qb=m.qb;return [null,
  [{judul:'Substitusi x = x′/'+k+', y = y′/'+k,tex:[ex([[q.a,"\\frac{x'}{"+k+'}']])+' + '+ex([[q.b,"\\frac{y'}{"+k+'}']])+' &= '+tn(q.c)+'\\quad \\lvert \\times '+tn(k),eqT(qb)]}],
  [{judul:'Titik potong garis '+C.eqS(qb),tex:['y = 0 &\\Rightarrow '+lin(qb.a,0)+' = '+tn(qb.c)+' \\Rightarrow x = '+tn(m.X.x),'x = 0 &\\Rightarrow '+lin(0,qb.b)+' = '+tn(qb.c)+' \\Rightarrow y = '+tn(m.Y.y)]}],null][s];},
19:function(m,s){var q=m.q,k=m.k,f=1/k;return [null,
  [{judul:'Substitusi x = '+C.sum([[f,'x′']])+', y = '+C.sum([[f,'y′']]),tex:[tn(q.a)+'\\left('+ex([[f,"x'"]])+'\\right) + '+tk(q.b)+'\\left('+ex([[f,"y'"]])+'\\right) &= '+tn(q.c),
    ex([[q.a*f,"x'"],[q.b*f,"y'"]])+' &= '+tn(q.c)+'\\quad \\lvert \\times '+tk(k),eqT(m.qb)]}],
  [blokDil(m.X0,k)],null][s];},
20:function(m,s){var A=m.A;return [null,[blokRot(A,m.d,'G')],null,
  [{judul:'Jarak kabin ke pusat',tex:['r &= \\sqrt{x^2 + y^2}','&= \\sqrt{'+tk(A.x)+'^2 + '+tk(A.y)+'^2}','&= \\sqrt{'+tn(A.x*A.x+A.y*A.y)+'} = '+tn(m.r)]}]][s];},
21:function(m,s){return [
  [{judul:'Titik potong dengan sumbu',tex:['x = 0 &\\Rightarrow y = '+tn(m.n),'y = 0 &\\Rightarrow 0 = '+ex([[m.m,'x'],[m.n,'']])+' \\Rightarrow x = '+tn(m.P2.x)]}],
  [blokRot(m.P1,m.d),blokRot(m.P2,m.d)],
  [blokGradien(m.B1,m.B2),{judul:'Nilai n',tex:['n &= '+teks('ordinat titik pada sumbu-y')+' = '+tn(m.nb),'y &= '+ex([[m.mb,'x'],[m.nb,'']])]}],
  [{judul:'Hasil kali gradien',tex:['m_1 \\times m_2 &= '+tn(m.m)+' \\times '+tk(m.mb)+' = -1']}]][s];},
22:function(m,s){var k=m.k,B=m.B;return [
  [{judul:'Kalikan setiap titik sudut dengan k = '+C.nm(k),tex:m.T.map(function(Q,i){return "PQRS"[i]+"' &= ("+tn(k)+' \\cdot '+tk(Q.x)+',\\ '+tn(k)+' \\cdot '+tk(Q.y)+') = '+P(B[i]);})}],
  [{judul:'Panjang P′Q′',tex:["P'Q' &= "+tn(B[1].x)+' - '+tk(B[0].x)+' = '+tn(m.W)]}],
  [{judul:'Lebar Q′R′',tex:["Q'R' &= "+tn(B[2].y)+' - '+tk(B[1].y)+' = '+tn(m.H)]}],
  [{judul:'Luas',tex:["L' &= "+tn(m.W)+' \\times '+tn(m.H)+' = '+tn(m.W*m.H)]}],
  [{judul:'Perbandingan luas',tex:["\\frac{L'}{L} &= \\frac{"+tn(m.W*m.H)+'}{'+tn(m.w*m.h)+'} = '+tn(k*k),'k^2 &= '+tn(k)+'^2 = '+tn(k*k)]}]][s];},
23:function(m,s){var a=m.a,b=m.b,c=m.c,k=m.k;return [
  [{judul:'Titik potong jalan asal',tex:['y = 0 &\\Rightarrow '+ex([[a,'x'],[c,'']])+' = 0 \\Rightarrow x = '+tn(m.PX.x),'x = 0 &\\Rightarrow '+ex([[b,'y'],[c,'']])+' = 0 \\Rightarrow y = '+tn(m.PY.y)]}],
  [blokDil(m.PX,k),blokDil(m.PY,k)],
  [{judul:'Substitusi '+ptS(m.BX)+' ke '+C.sum([[a,'x'],[b,'y']])+' + c = 0',tex:[tn(a)+' \\cdot '+tk(m.BX.x)+' + '+tn(b)+' \\cdot 0 + c &= 0','c &= '+tn(k*c),ex([[a,'x'],[b,'y'],[k*c,'']])+' &= 0']}],null][s];},
24:function(m,s){var r=m.dr;
  var b1=r?blokRot(m.A,m.d,'A',m.M):blokDil(m.A,m.k,'A'),b2=r?blokDil(m.M,m.k,"A'"):blokRot(m.M,m.d,"A'",m.B);
  if(!r)b2.judul='Rotasi '+m.d+'° titik A′'+ptS(m.M);else b2.judul='Dilatasi titik A′'+ptS(m.M)+', k = '+C.nm(m.k);
  b2.tex[0]=b2.tex[0].replace(/^A''/,"A''").replace(/^A'\(/,"A''(");
  return [[b1],null,[b2],null][s];}
};

function langkah(Q,s){
  var f=PY[Q.t];if(!f||!Q.m)return [];
  var r=f(Q.m,s);if(!r)return [];
  return r.filter(function(b){return b&&b.tex&&b.tex.length;}).map(function(b){
    /* baris yang sama berturut-turut cukup ditulis sekali */
    var t=[];b.tex.forEach(function(x){if(!t.length||t[t.length-1]!==x)t.push(x);});
    return {judul:b.judul,tex:t};
  });
}

/* teks cadangan bila KaTeX belum siap */
function polos(t){
  return t.replace(/\\t?frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)').replace(/\\text\{([^{}]*)\}/g,'$1').replace(/\\sqrt\{([^{}]*)\}/g,'√$1')
    .replace(/\\left|\\right/g,'').replace(/\\le/g,'≤').replace(/\\ge/g,'≥').replace(/\\cdot/g,'·').replace(/\\div/g,':').replace(/\\times/g,'×')
    .replace(/\\Rightarrow/g,'⇒').replace(/\\lvert/g,'|').replace(/\\quad|\\ /g,' ').replace(/\{\.\}/g,'.').replace(/\{,\}/g,',')
    .replace(/_1/g,'₁').replace(/_2/g,'₂').replace(/\^2/g,'²').replace(/''/g,'″').replace(/'/g,'′').replace(/&/g,'').replace(/[{}]/g,'')
    .replace(/-/g,'−').replace(/\s+/g,' ').trim();
}
function html(bl){
  return '<div class="penyelesaian"><b>📝 Penyelesaian</b>'+bl.map(function(b){
    var tex='\\begin{aligned}'+b.tex.join(' \\\\ ')+'\\end{aligned}';
    return '<div class="py-blok"><p>'+esc(b.judul)+'</p><div class="py-tex" data-tex="'+esc(tex)+'">'+b.tex.map(function(t){return esc(polos(t));}).join('<br>')+'</div></div>';
  }).join('')+'</div>';
}

/* uji mandiri: PL.Penyelesaian.uji() di konsol */
function uji(n){
  n=n||40;var lap=[],rng=C.mulberry32(2026);
  for(var t=1;t<=24;t++)C.levels(t).forEach(function(l){C.variants(t,l,true).forEach(function(v){
    for(var i=0;i<n;i++){
      var Q=C.gen(t,l,rng,true,v);
      Q.st.forEach(function(St,s){
        try{langkah(Q,s).forEach(function(b){b.tex.forEach(function(x){
          if(/NaN|undefined|null|Infinity/.test(x))lap.push(t+l+v+' langkah '+(s+1)+' '+x);
          var d=0;for(var j=0;j<x.length;j++){if(x[j]==='{')d++;else if(x[j]==='}')d--;if(d<0)break;}
          if(d!==0)lap.push(t+l+v+' langkah '+(s+1)+' kurung kurawal tidak seimbang: '+x);});});}
        catch(e){lap.push(t+l+v+' langkah '+(s+1)+' galat '+e.message);}
      });
    }
  });});
  return lap.length?lap.slice(0,30):'Semua penyelesaian aman.';
}

PL.Penyelesaian={langkah:langkah,html:html,uji:uji,PY:PY};
})(window.PL=window.PL||{});
