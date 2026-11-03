/* ==========================================================================
   latihan.js · TAB LATIHAN MANDIRI
   Wadah: <section id="tab-latihan">. Soal dibangkitkan acak oleh CORE,
   dinilai langsung di halaman, tidak dikirim ke server.
   Opsi khusus tab ini: petunjuk bertahap, "Di mana salahku?", percobaan tanpa batas,
   tombol "Lihat jawaban" setelah dua kali salah.
   Pemilih soal: bagian materi (A–E), level (LOTS/MOTS/HOTS), lalu tipe (1–24) atau acak.
   ========================================================================== */
(function(PL){
'use strict';
var U=PL.U,$=U.$,esc=U.esc;
var sec,L,pick={b:'C',l:'C',t:'C'},tahap='intro';

/* ---------- Petunjuk ----------
   Teks petunjuk lanjutan khusus Latihan ada di js/petunjuk.js (PL.Petunjuk), bila dimuat.
   Petunjuk ke-3 dan seterusnya baru terbuka setelah siswa mencoba menjawab minimal
   sekali pada langkah itu (GERBANG_PETUNJUK). */
var GERBANG_PETUNJUK=2;
function petunjukLanjut(Q,s,St){return PL.Petunjuk?PL.Petunjuk.lanjut(Q,s,St):[];}
function namaRumus(h){return PL.Petunjuk&&PL.Petunjuk.namaRumus?PL.Petunjuk.namaRumus(h):h;}

/* ---------- pemilih soal ---------- */
var BAGIAN_PILIH=[['ROT','A · Rotasi'],['DIL','B · Dilatasi'],['GRS','C · Persamaan garis'],['BONE','D · Konteks Bone'],['KOMP','E · Komposisi'],['C','Campuran']];
var LEVEL_PILIH=[['L','LOTS'],['M','MOTS'],['H','HOTS'],['C','Campuran']];
function semuaTipe(){var o=[];for(var t=1;t<=24;t++)o.push(t);return o;}
function cocok(t){return (pick.b==='C'||CORE.BG_TIPE[t]===pick.b)&&(pick.l==='C'||CORE.levels(t).indexOf(pick.l)>=0);}
function calonTipe(){return semuaTipe().filter(cocok);}
function acakDari(a){return a[Math.floor(Math.random()*a.length)];}
function soalBaru(){
  var calon=pick.t==='C'?calonTipe():[pick.t];
  if(!calon.length){pick.l='C';calon=calonTipe();}
  var t=acakDari(calon),lv=CORE.levels(t).filter(function(l){return pick.l==='C'||l===pick.l;});
  var l=acakDari(lv.length?lv:CORE.levels(t));
  L.muat(CORE.gen(t,l,Math.random,true),0);L.S.selesai=false;tahap='intro';render();
}
function render(){
  L.S.tahap=tahap==='kerja'?'kerja':'lain';
  sec.dataset.tahap=tahap;
  L.renderKartu();
  if(tahap==='intro'){L.renderProgres(true);panelIntro();L.renderBidang('awal');}
  else if(tahap==='selesai'){L.S.selesai=true;L.renderProgres();panelSelesai();L.renderBidang('akhir');}
  else{L.renderProgres();L.panelLangkah();L.renderBidang();}
  if(PL.kuis)PL.kuis.pendNotice(L.el.panel);
}
function chips(aksi,daftar,nilai,mati){
  return '<div class="chips">'+daftar.map(function(o){var m=mati&&mati(o[0]);return '<button class="chip'+(String(nilai)===o[0]?' on':'')+'" data-aksi="'+aksi+'" data-v="'+o[0]+'"'+(m?' disabled title="Tidak ada soal untuk pilihan ini"':'')+'>'+esc(o[1])+'</button>';}).join('')+'</div>';
}
function panelIntro(){
  var Q=L.S.Q,h='<h2>Pilih soal</h2><p class="muted">Pilih bagian dan level, lalu tipe soal. Setiap tekan 🎲 menghasilkan soal baru.</p>';
  h+='<div class="lvl"><b>Bagian</b>'+chips('bagian',BAGIAN_PILIH,pick.b)+'</div>';
  h+='<div class="lvl"><b>Level</b>'+chips('level',LEVEL_PILIH,pick.l,function(v){
    if(v==='C')return false;return !semuaTipe().some(function(t){return (pick.b==='C'||CORE.BG_TIPE[t]===pick.b)&&CORE.levels(t).indexOf(v)>=0;});})+'</div>';
  var daftar=calonTipe();
  h+='<div class="lvl"><label for="pilihTipe"><b>Tipe soal</b></label><select id="pilihTipe" class="pilih-tipe" data-aksi="tipe"><option value="C"'+(pick.t==='C'?' selected':'')+'>Acak dari '+daftar.length+' tipe</option>'
    +daftar.map(function(t){return '<option value="'+t+'"'+(pick.t===t?' selected':'')+'>Tipe '+t+' · '+esc(CORE.TIPE[t])+' ('+CORE.levels(t).map(function(l){return CORE.LEVEL[l];}).join('/')+')</option>';}).join('')+'</select></div>';
  h+='<div class="row"><button class="btn" data-aksi="acak">🎲 Soal acak</button></div>';
  h+='<div class="note"><p>Soal di atas termasuk <b>'+esc(Q.jd+' · '+Q.lv)+'</b> dengan kata kerja <i>'+esc(Q.kko)+'</i>.</p><p>Di Latihan kamu boleh mencoba berulang kali, membuka 💡 Petunjuk, dan memakai 📍 Di mana salahku?</p></div>';
  h+='<div class="row"><button class="btn primary" data-aksi="mulai">Mulai ➜</button></div>';
  L.el.panel.innerHTML=h;
}
function panelSelesai(){
  L.el.panel.innerHTML='<h2>🎉 Soal selesai</h2><h3>Pembahasan</h3><ol class="sum">'+L.S.Q.bahas.map(function(b){return '<li>'+esc(b)+'</li>';}).join('')+'</ol>'
    +'<div class="row"><button class="btn primary" data-aksi="acak">Soal berikutnya ➜</button><button class="btn" data-aksi="ulangi">↺ Ulangi soal ini</button><button class="btn ghost" data-aksi="ke-kuis">Kuis ➜</button></div>';
  if(PL.Math)PL.Math.render(L.el.panel);
}
/* ---------- Penyelesaian bertahap ----------
   Setelah jawaban benar atau 🔑 Lihat jawaban, langkah yang memerlukan perhitungan ditampilkan
   lengkap. Isinya dari js/penyelesaian.js (PL.Penyelesaian), bila dimuat. */
function tampilPenyelesaian(){
  var pn=L.el.panel,lama=pn.querySelector('.penyelesaian');if(lama)lama.remove();
  if(!PL.Penyelesaian)return;
  var bl;try{bl=PL.Penyelesaian.langkah(L.S.Q,L.S.s);}catch(err){if(window.console)console.warn('penyelesaian',err);return;}
  if(!bl||!bl.length)return;
  var fb=pn.querySelector('.fb');if(!fb)return;
  fb.insertAdjacentHTML('afterend',PL.Penyelesaian.html(bl));
  var box=pn.querySelector('.penyelesaian');if(box&&PL.Math)PL.Math.render(box);
}
function periksa(a,r){
  var S=L.S,akhir=S.s>=S.Q.st.length-1;
  if(r.ok){
    S.solved=true;L.tandai(r);L.kunciSemua();
    var hh=L.el.panel.querySelector('.hints');if(hh)hh.hidden=true;
    L.fb('ok','Tepat! '+(akhir?'Soal ini selesai.':'Lanjut ke langkah berikutnya.'));
    tampilPenyelesaian();
    PL.Plus.say(akhir?'selesai':'benar');
    L.tombol('<button class="btn primary" data-aksi="lanjut">'+(akhir?'Lihat pembahasan ➜':'Langkah berikutnya ➜')+'</button>');
    L.renderBidang();L.renderProgres();
  }else{
    S.tries++;L.tandai(r);S.lw={a:a,r:r};
    var St=L.curS(),sebagian=St.k==='form'&&r.items.some(Boolean)&&r.items.length>1;
    L.fb('bad','Belum tepat. '+(sebagian?'Isian yang hijau sudah benar. ':'')+(St.k==='pts'&&r.lebih&&!r.lebih.length?'Titik pilihanmu benar, tetapi masih kurang. ':'')+'Baca petunjuk, lalu coba lagi.');
    if(S.hints<2)L.tambahPetunjuk(false);else L.renderHints();
    L.tombolDiMana();
    if(S.tries>=2&&!L.el.panel.querySelector('[data-aksi="kunci"]'))L.tambahTombol('<button class="btn ghost" data-aksi="kunci">🔑 Lihat jawaban</button>');
    PL.Plus.say('salah');
  }
}
function lihatKunci(){
  var S=L.S,akhir=S.s>=S.Q.st.length-1;L.isiKunci();S.solved=true;L.panelLangkah();L.kunciSemua();
  L.bukaSemuaPetunjuk();
  L.fb('info','🔑 Jawaban yang benar: <b>'+L.teksKunci()+'</b>. Pelajari, lalu lanjutkan.');
  tampilPenyelesaian();
  L.tombol('<button class="btn primary" data-aksi="lanjut">'+(akhir?'Lihat pembahasan ➜':'Langkah berikutnya ➜')+'</button>');L.renderBidang();
}
function lanjut(){var S=L.S;if(S.s<S.Q.st.length-1){S.s++;L.reset();render();}else{tahap='selesai';render();PL.Plus.say('selesai');}}
function aksi(a,b){
  if(a==='bagian'){pick.b=b.dataset.v;pick.t='C';if(!calonTipe().length)pick.l='C';soalBaru();}
  else if(a==='level'){pick.l=b.dataset.v;pick.t='C';soalBaru();}
  else if(a==='acak')soalBaru();
  else if(a==='mulai'){tahap='kerja';L.S.s=0;L.reset();render();PL.Plus.say('sapa');}
  else if(a==='lanjut')lanjut();
  else if(a==='kunci')lihatKunci();
  else if(a==='ulangi'){tahap='kerja';L.S.selesai=false;L.S.s=0;L.reset();render();}
  else if(a==='ke-kuis')PL.pindahTab('kuis');
}
PL.TAB=PL.TAB||{};
PL.TAB.latihan={
  init:function(){
    sec=$('#tab-latihan');
    L=PL.Langkah(sec,{petunjuk:true,diManaSalah:true,pratinjau:true,ubahPetunjuk:namaRumus,petunjukLanjut:petunjukLanjut,gerbangPetunjuk:GERBANG_PETUNJUK,periksa:periksa,aksi:aksi,
      meta:function(){var Q=L.S.Q;return esc(Q.jd+' · '+Q.lv);}});
    this.bidang=L.bidang;this.panduan=L.panduan;this.L=L;
    /* pemilih tipe (select) */
    L.el.panel.addEventListener('change',function(e){if(e.target.id==='pilihTipe'){var v=e.target.value;pick.t=v==='C'?'C':+v;soalBaru();}});
    /* tombol di kartu soal (di luar panel) */
    sec.querySelector('.kartu').addEventListener('click',function(e){
      var b=e.target.closest('[data-aksi]');if(!b)return;
      if(b.dataset.aksi==='ulangi'&&tahap!=='intro')aksi('ulangi');
      else if(b.dataset.aksi==='acak')soalBaru();
    });
    soalBaru();
  },
  tampil:function(){render();},
  sembunyi:function(){return true;}
};
})(window.PL);
