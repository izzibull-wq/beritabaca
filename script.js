const textarea = document.getElementById('teksBerita');
const tampil = document.getElementById('tampilKalimat');
const pilihSuara = document.getElementById('pilihSuara');
const kecepatanInput = document.getElementById('kecepatan');
const labelKecepatan = document.getElementById('labelKecepatan');
const statusEl = document.getElementById('status');
const progressBar = document.getElementById('progressBar');
const dukungan = document.getElementById('dukungan');

const CONTOH = [
`Pemerintah mengumumkan program baru untuk mendukung pelaku UMKM di seluruh Indonesia. Program ini memberikan pelatihan digital, akses permodalan, dan pendampingan usaha selama enam bulan. Para pelaku usaha kecil diharapkan dapat memperluas pasar mereka melalui platform digital. Selain itu, pemerintah juga membuka pusat layanan terpadu di berbagai kota agar pelaku usaha mudah mendapatkan informasi dan bantuan.`,
`Teknologi kini semakin dekat dengan dunia pendidikan di Indonesia. Banyak sekolah mulai menggunakan aplikasi belajar digital untuk membantu siswa memahami pelajaran dengan cara yang lebih menarik. Guru juga dapat membuat materi interaktif dan memantau perkembangan belajar siswa secara langsung. Dengan teknologi yang tepat, belajar tidak lagi terbatas pada ruang kelas saja, tetapi bisa dilakukan kapan pun dan di mana pun.`,
`Tim nasional Indonesia meraih kemenangan penting dalam pertandingan persahabatan di Jakarta. Ribuan pendukung memenuhi stadion dengan penuh semangat dan sportivitas. Pelatih mengatakan kemenangan ini adalah hasil kerja keras seluruh tim dan dukungan masyarakat. Selain prestasi di lapangan, kegiatan ini juga mengajak masyarakat untuk lebih peduli pada lingkungan dengan aksi bersih stadion setelah pertandingan selesai.`
];

const PRESET = {
  berita: { rate: 1.0, pitch: 1.0 },
  cerita: { rate: 0.9, pitch: 1.15 },
  santai: { rate: 0.85, pitch: 1.0 }
};

let kalimatList = [];
let currentIndex = 0;
let sedangMembaca = false;
let utterance = null;
let voices = [];

function dapatPreset(){
  const v = document.querySelector('input[name="preset"]:checked')?.value || 'berita';
  return PRESET[v];
}
function pecahKalimat(teks){
  const bersih = teks.trim().replace(/\s+/g,' ');
  if(!bersih) return [];
  const hasil = bersih.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/g);
  return (hasil||[]).map(s=>s.trim()).filter(Boolean);
}
function updateInfo(){
  const teks = textarea.value;
  const kata = teks.trim() ? teks.trim().split(/\s+/).length : 0;
  kalimatList = pecahKalimat(teks);
  document.getElementById('infoKata').textContent = kata + ' kata';
  document.getElementById('infoDurasi').textContent = 'Estimasi ' + Math.max(1, Math.ceil(kata/140)) + ' menit';
  document.getElementById('infoKalimat').textContent = kalimatList.length + ' kalimat';
  renderKalimat();
  updateProgress();
}
function renderKalimat(){
  if(!kalimatList.length){ tampil.innerHTML = '<p class="empty">Belum ada teks. Tempel berita di atas.</p>'; return; }
  tampil.innerHTML = '';
  kalimatList.forEach((k,i)=>{
    const p = document.createElement('p');
    p.textContent = k;
    if(i===currentIndex && sedangMembaca) p.classList.add('active');
    if(i<currentIndex) p.classList.add('done');
    p.addEventListener('click', ()=>{ berhenti(); currentIndex=i; putarDari(i); });
    tampil.appendChild(p);
  });
}
function updateProgress(){
  const total = kalimatList.length || 0;
  statusEl.textContent = total ? `Siap dibaca. Kalimat ${Math.min(currentIndex+1,total)} dari ${total}.` : 'Siap dibaca. Kalimat 0 dari 0.';
  progressBar.style.width = total ? (currentIndex/total*100)+'%' : '0%';
  if(sedangMembaca) statusEl.textContent = `Membaca... Kalimat ${currentIndex+1} dari ${total}.`;
}
function muatSuara(){
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const indo = voices.filter(v=> v.lang.toLowerCase().startsWith('id'));
  const daftar = indo.length ? indo : voices;
  pilihSuara.innerHTML = '';
  if(!daftar.length){ pilihSuara.innerHTML = '<option value="">Suara default perangkat</option>'; return; }
  daftar.forEach(v=>{
    const o = document.createElement('option');
    o.value = v.name; o.textContent = v.name + ' (' + v.lang + ')';
    pilihSuara.appendChild(o);
  });
  if(indo.length) pilihSuara.value = indo[0].name;
}
function simpanRiwayat(){
  const teks = textarea.value.trim();
  if(!teks) return;
  const judul = teks.split(' ').slice(0,6).join(' ') + '...';
  let list = JSON.parse(localStorage.getItem('beritabaca_history')||'[]');
  list = [{judul, teks, tanggal: new Date().toLocaleString('id-ID')}, ...list.filter(x=>x.teks!==teks)].slice(0,10);
  localStorage.setItem('beritabaca_history', JSON.stringify(list));
  renderRiwayat();
}
function renderRiwayat(){
  const list = JSON.parse(localStorage.getItem('beritabaca_history')||'[]');
  const wadah = document.getElementById('riwayat');
  if(!list.length){ wadah.innerHTML = '<p class="empty">Belum ada riwayat.</p>'; return; }
  wadah.innerHTML = '';
  list.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'riwayat-item';
    div.innerHTML = `<div><b>${item.judul}</b><br><small>${item.tanggal}</small></div><button type="button">Muat</button>`;
    div.querySelector('button').addEventListener('click', ()=>{ textarea.value=item.teks; updateInfo(); });
    wadah.appendChild(div);
  });
}
function putarDari(index){
  if(!('speechSynthesis' in window)){ dukungan.textContent = 'Browser ini belum mendukung Text-to-Speech. Coba Chrome / Edge di HP atau laptop.'; return; }
  if(!kalimatList.length){ alert('Tempel dulu teks beritanya.'); return; }
  window.speechSynthesis.cancel();
  currentIndex = index;
  sedangMembaca = true;
  simpanRiwayat();
  bacaKalimat();
}
function bacaKalimat(){
  if(currentIndex >= kalimatList.length){ sedangMembaca=false; currentIndex=0; renderKalimat(); updateProgress(); statusEl.textContent='Selesai dibaca.'; progressBar.style.width='100%'; return; }
  const preset = dapatPreset();
  utterance = new SpeechSynthesisUtterance(kalimatList[currentIndex]);
  utterance.lang = 'id-ID';
  utterance.rate = parseFloat(kecepatanInput.value) * preset.rate;
  utterance.rate = Math.min(1.5, Math.max(0.5, utterance.rate));
  utterance.pitch = preset.pitch;
  const dipilih = voices.find(v=>v.name===pilihSuara.value);
  if(dipilih) utterance.voice = dipilih;
  utterance.onend = ()=>{ currentIndex++; renderKalimat(); updateProgress(); if(sedangMembaca) setTimeout(bacaKalimat, 250); };
  utterance.onerror = ()=>{ sedangMembaca=false; };
  renderKalimat(); updateProgress();
  window.speechSynthesis.speak(utterance);
}
function berhenti(){
  if('speechSynthesis' in window) window.speechSynthesis.cancel();
  sedangMembaca=false; currentIndex=0; renderKalimat(); updateProgress();
}
textarea.addEventListener('input', updateInfo);
kecepatanInput.addEventListener('input', ()=>{ labelKecepatan.textContent = parseFloat(kecepatanInput.value).toFixed(1)+'x'; });
document.getElementById('btnPutar').addEventListener('click', ()=>{
  if(window.speechSynthesis && window.speechSynthesis.paused){ window.speechSynthesis.resume(); sedangMembaca=true; return; }
  putarDari(currentIndex===0?0:currentIndex);
});
document.getElementById('btnJeda').addEventListener('click', ()=>{ if(window.speechSynthesis) window.speechSynthesis.pause(); sedangMembaca=false; statusEl.textContent='Dijeda.'; });
document.getElementById('btnLanjut').addEventListener('click', ()=>{ if(window.speechSynthesis){ window.speechSynthesis.resume(); sedangMembaca=true; updateProgress(); } });
document.getElementById('btnBerhenti').addEventListener('click', berhenti);
document.getElementById('btnSalin').addEventListener('click', async()=>{ try{ await navigator.clipboard.writeText(textarea.value); alert('Teks tersalin.'); }catch(e){ textarea.select(); document.execCommand('copy'); } });
document.getElementById('btnHapus').addEventListener('click', ()=>{ berhenti(); textarea.value=''; updateInfo(); });
document.getElementById('btnHapusRiwayat').addEventListener('click', ()=>{ localStorage.removeItem('beritabaca_history'); renderRiwayat(); });
document.querySelectorAll('[data-sample]').forEach(btn=>{
  btn.addEventListener('click', ()=>{ textarea.value = CONTOH[Number(btn.dataset.sample)]; updateInfo(); });
});
document.getElementById('themeBtn').addEventListener('click', (e)=>{
  const gelap = document.body.classList.toggle('dark');
  e.target.textContent = gelap ? 'Mode Terang' : 'Mode Gelap';
});
if('speechSynthesis' in window){
  dukungan.textContent = 'Suara menggunakan Text-to-Speech perangkat. Untuk suara Indonesia yang natural, aktifkan suara Bahasa Indonesia di pengaturan perangkat / Chrome.';
  window.speechSynthesis.onvoiceschanged = muatSuara;
  muatSuara();
} else {
  dukungan.textContent = 'Browser ini belum mendukung Text-to-Speech.';
}
updateInfo(); renderRiwayat();
