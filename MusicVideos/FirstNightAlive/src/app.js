// ============================================================
// app.js — player UI, audio clock, local caching, main loop
// ============================================================
(function () {
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), glc = $('#gl'), gate = $('#gate'), dropz = $('#drop');
  const playBtn = $('#play'), timeEl = $('#time'), seek = $('#seek'), chapEl = $('#chap'), fsBtn = $('#fs'), loadBtn = $('#load');
  const fileIn = $('#file'), chooseBtn = $('#choose'), silentBtn = $('#silent'), readyEl = $('#ready'), gateMsg = $('#gatemsg'), flashCb = $('#reduce');
  const fill = $('#fill'), ticks = $('#ticks'), chips = $('#chapters'), syncEl = $('#sync');
  const CHAPTERS = [[0, 'Boot'], [14.11, 'Anomaly'], [28.95, 'Streets'], [56.36, 'Lock-on'], [70.48, 'The Board'], [82.48, 'Overload'], [107.5, 'Signal'],
    [134.96, 'Halls'], [162.62, 'Assembly'], [174.92, 'The Ask'], [186.14, 'First Night'], [214.04, 'Lift'], [268.25, 'Rewind'], [280.7, 'Deep Time'],
    [326.89, 'Alive'], [412.6, 'Return'], [416.2, 'Giants'], [453.0, 'Constellations'], [472.9, 'Orbit'], [534.06, 'Azazil'], [592.0, 'Dawn']];
  const fmt = s => { s = Math.max(0, s); return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };

  // ---------- renderer ----------
  const over = document.createElement('canvas');
  let ok = false;
  try { ok = GLR.init(glc); } catch (e) { console.error(e); ok = false; }
  if (!ok) { gateMsg.textContent = 'This video needs WebGL 2, which this browser or device has turned off. Try a current version of Chrome, Edge, Firefox or Safari.'; chooseBtn.disabled = true; silentBtn.disabled = true; }
  Engine.init(over);
  let scale = 1, slow = 0, fast = 0;
  function resize() {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = Math.round(r.width * dpr * scale), h = Math.round(r.height * dpr * scale);
    const maxPx = 1920 * 1080; if (w * h > maxPx) { const k = Math.sqrt(maxPx / (w * h)); w = Math.round(w * k); h = Math.round(h * k); }
    w = Math.max(320, w); h = Math.max(180, h);
    if (glc.width !== w || glc.height !== h) { glc.width = w; glc.height = h; over.width = w; over.height = h; GLR.resize(w, h); }
  }

  // ---------- clock ----------
  const audio = new Audio(); audio.preload = 'auto';
  let mode = 'idle', silentT = 0, silentAt = 0, silentPlaying = false, syncMs = 0;
  let lastAT = -1, lastPerf = 0;
  try { syncMs = +(localStorage.getItem('fna-sync') || 0) || 0; } catch (e) { }
  function now() {
    if (mode === 'audio') {
      const at = audio.currentTime, p = performance.now();
      if (at !== lastAT) { lastAT = at; lastPerf = p; return at + syncMs / 1000; }
      return (audio.paused ? at : at + Math.min(.1, (p - lastPerf) / 1000)) + syncMs / 1000;
    }
    if (mode === 'silent') return silentPlaying ? silentT + (performance.now() - silentAt) / 1000 : silentT;
    return 0;
  }
  const playing = () => mode === 'audio' ? !audio.paused : mode === 'silent' && silentPlaying;
  function setPlaying(p) {
    if (mode === 'audio') { if (p) audio.play().catch(() => { }); else audio.pause(); }
    else if (mode === 'silent') { if (p && !silentPlaying) { silentAt = performance.now(); silentPlaying = true; } else if (!p && silentPlaying) { silentT = now(); silentPlaying = false; } }
    playBtn.textContent = p ? 'Pause' : 'Play'; playBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
  }
  function seekTo(s) {
    s = clamp(s, 0, SONG_LEN);
    if (mode === 'audio') audio.currentTime = s; else if (mode === 'silent') { silentT = s; silentAt = performance.now(); }
    GLR.clearFeedback();
  }
  audio.addEventListener('ended', () => { playBtn.textContent = 'Replay'; });
  audio.addEventListener('play', () => { playBtn.textContent = 'Pause'; });
  audio.addEventListener('pause', () => { if (!audio.ended) playBtn.textContent = 'Play'; });

  // ---------- loading the track ----------
  const DB = {
    open() { return new Promise((res, rej) => { try { const r = indexedDB.open('first-night-alive', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } }); },
    async put(v) { try { const db = await this.open(); await new Promise((res, rej) => { const tx = db.transaction('f', 'readwrite'); tx.objectStore('f').put(v, 'track'); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); } catch (e) { } },
    async get() { try { const db = await this.open(); return await new Promise((res) => { const tx = db.transaction('f', 'readonly'); const q = tx.objectStore('f').get('track'); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch (e) { return null; } },
  };
  let url = null;
  function useBlob(blob, name, cached) {
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob); audio.src = url; mode = 'audio';
    audio.addEventListener('loadedmetadata', () => {
      const d = audio.duration; const off = Math.abs(d - SONG_LEN) > 2;
      readyEl.textContent = off ? `Loaded "${name}" (${fmt(d)}). The video is timed to the 10:05 album version, so this file may drift.` : `Ready: "${name}"${cached ? ' (saved in this browser)' : ''}.`;
    }, { once: true });
    readyEl.textContent = `Loading "${name}"…`;
    chooseBtn.textContent = 'Play';
    chooseBtn.onclick = start;
    loadBtn.hidden = false;
  }
  function start() { gate.hidden = true; seekTo(0); setPlaying(true); stage.focus(); }
  function handleFile(f) {
    if (!f) return;
    if (!/audio|mpeg|mp3|wav|ogg|flac|m4a|aac/i.test(f.type + f.name)) { readyEl.textContent = 'That file is not audio. Choose the MP3 of the track.'; return; }
    useBlob(f, f.name, false); DB.put({ blob: f, name: f.name });
    gate.hidden = false;
  }
  chooseBtn.onclick = () => fileIn.click();
  loadBtn.onclick = () => fileIn.click();
  fileIn.onchange = () => handleFile(fileIn.files[0]);
  silentBtn.onclick = () => { if (mode !== 'audio') mode = 'silent'; gate.hidden = true; seekTo(0); setPlaying(true); };
  ['dragenter', 'dragover'].forEach(ev => stage.addEventListener(ev, e => { e.preventDefault(); dropz.hidden = false; }));
  ['dragleave', 'drop'].forEach(ev => stage.addEventListener(ev, e => { e.preventDefault(); if (ev === 'dragleave' && stage.contains(e.relatedTarget)) return; dropz.hidden = true; }));
  stage.addEventListener('drop', e => { const f = e.dataTransfer && e.dataTransfer.files[0]; handleFile(f); });
  // running from disk or a local server: pick up the viewer's own copy saved next to this page
  function tryLocal() {
    if (!(location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname))) return;
    const probe = new Audio(); probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => {
      if (mode !== 'idle') return;
      audio.src = probe.src; mode = 'audio';
      readyEl.textContent = 'Ready: first-night-alive.mp3 (found next to this page).';
      chooseBtn.textContent = 'Play'; chooseBtn.onclick = start; loadBtn.hidden = false;
    }, { once: true });
    probe.src = 'first-night-alive.mp3';
  }
  DB.get().then(v => { if (v && v.blob && mode === 'idle') useBlob(v.blob, v.name || 'track', true); else tryLocal(); });

  // ---------- controls ----------
  playBtn.onclick = () => {
    if (mode === 'idle') { silentBtn.onclick(); return; }
    if (mode === 'audio' && audio.ended) { seekTo(0); setPlaying(true); return; }
    gate.hidden = true; setPlaying(!playing());
  };
  seek.max = SONG_LEN; seek.step = .01;
  let scrubbing = false;
  seek.addEventListener('input', () => { scrubbing = true; if (mode === 'idle') mode = 'silent'; gate.hidden = true; seekTo(+seek.value); });
  seek.addEventListener('change', () => { scrubbing = false; });
  fsBtn.onclick = () => { const el = stage; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); else (el.requestFullscreen ? el.requestFullscreen() : Promise.reject()).catch(() => { }); };
  flashCb.onchange = () => { Engine.reduceFlash = flashCb.checked; try { localStorage.setItem('fna-reduce', flashCb.checked ? '1' : '0'); } catch (e) { } };
  try { if (localStorage.getItem('fna-reduce') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches) { flashCb.checked = true; Engine.reduceFlash = true; } } catch (e) { }
  const showSync = () => { syncEl.textContent = syncMs ? `sync ${syncMs > 0 ? '+' : ''}${syncMs} ms` : ''; };
  showSync();
  window.addEventListener('keydown', e => {
    if (e.target && (e.target.tagName === 'INPUT' && e.target.type !== 'range' || e.target.tagName === 'BUTTON' && e.key === ' ')) { if (e.key === ' ') { e.preventDefault(); playBtn.click(); } return; }
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); playBtn.click(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); seekTo(now() + 5); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo(now() - 5); }
    else if (e.key === 'f') fsBtn.click();
    else if (e.key === '[' || e.key === ']') { syncMs += e.key === ']' ? 20 : -20; try { localStorage.setItem('fna-sync', String(syncMs)); } catch (er) { } showSync(); }
  });
  // chapters
  CHAPTERS.forEach(([t0, name], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.id = 'ch-' + i;
    b.innerHTML = `<span class="ct">${fmt(t0)}</span>${name}`;
    b.onclick = () => { if (mode === 'idle') mode = 'silent'; gate.hidden = true; seekTo(t0 + .01); if (!playing()) setPlaying(true); };
    chips.appendChild(b);
    const tk = document.createElement('i'); tk.style.left = (t0 / SONG_LEN * 100) + '%'; ticks.appendChild(tk);
  });
  let lastChap = -1;
  function ui(t) {
    timeEl.textContent = `${fmt(t)} / ${fmt(SONG_LEN)}`;
    if (!scrubbing) seek.value = t;
    fill.style.width = (t / SONG_LEN * 100) + '%';
    let ci = 0; for (let i = 0; i < CHAPTERS.length; i++) if (t >= CHAPTERS[i][0]) ci = i;
    if (ci !== lastChap) { chapEl.textContent = CHAPTERS[ci][1]; if (lastChap >= 0) $('#ch-' + lastChap).classList.remove('on'); $('#ch-' + ci).classList.add('on'); lastChap = ci; }
  }

  // ---------- main loop ----------
  let prevPerf = performance.now(), ftAvg = 16;
  function render(t) {
    resize();
    const F = Engine.frame(t);
    GLR.uploadOverlay(over);
    GLR.render(F);
  }
  function loop() {
    requestAnimationFrame(loop);
    if (!ok) return;
    const p = performance.now(); const ft = p - prevPerf; prevPerf = p; ftAvg = lerp(ftAvg, ft, .05);
    if (ftAvg > 40) { if (++slow > 50 && scale > .55) { scale *= .85; slow = 0; ftAvg = 30; } } else slow = 0;
    if (ftAvg < 19) { if (++fast > 240 && scale < 1) { scale = Math.min(1, scale / .85); fast = 0; } } else fast = 0;
    let t;
    if (mode === 'idle' || !gate.hidden && !playing()) t = mode === 'idle' ? 1.2 + ((p / 1000) % 11.5) : 1.2 + ((p / 1000) % 11.5);
    else t = clamp(now(), 0, SONG_LEN);
    if (mode === 'silent' && silentPlaying && t >= SONG_LEN) { setPlaying(false); playBtn.textContent = 'Replay'; silentT = 0; }
    render(t);
    ui(gate.hidden ? t : 0);
  }
  // test hook: render a specific moment (used for thumbnails / checks)
  window.FNA = { renderAt(t, warm = 6) { for (let i = warm; i >= 0; i--) render(Math.max(0, t - i / 30)); }, scenes: SCENES };
  const fontsReady = Promise.race([Promise.all([`20px "DotGothic16"`, `40px "Dela Gothic One"`].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]);
  fontsReady.then(() => { if (!window.FNA_NO_LOOP) requestAnimationFrame(loop); });
})();
