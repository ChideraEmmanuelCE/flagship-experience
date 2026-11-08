(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const video = $('#reveal-video');
  const filmWrap = $('#film-wrap');
  const replay = $('#replay');
  const playPause = $('#play-pause');
  const playState = $('#play-state');
  const pauseShape = $('#pause-shape');
  const sound = $('#sound');
  const soundLabel = $('#sound-label');
  const speakerCross = $('#speaker-cross');
  const progress = $('#progress');
  const fill = $('#progress-fill');
  const handle = $('#progress-handle');
  const phase = $('#film-phase');
  const timecode = $('#timecode');
  const prompt = $('#video-prompt');
  const promptPlay = $('#prompt-play');
  const mobileNav = $('#mobile-nav');
  const menuToggle = $('#menu-toggle');
  let scrubbing = false;
  let failed = false;
  const fallbackDuration = 10.8;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dur = () => Number.isFinite(video.duration) && video.duration > 0 ? video.duration : fallbackDuration;
  const clock = (seconds) => {
    const n = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
    return `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  };
  const updateProgress = () => {
    const t = video.currentTime || 0;
    const pct = Math.max(0, Math.min(100, 100 * t / dur()));
    fill.style.width = `${pct}%`;
    handle.style.left = `${pct}%`;
    progress.setAttribute('aria-valuenow', String(Math.round(pct)));
    progress.setAttribute('aria-valuetext', `${Math.round(t)} seconds of ${Math.round(dur())} seconds`);
    timecode.textContent = `${clock(t)} / ${clock(dur())}`;
    phase.textContent = t < 1.25 ? 'AWAKENING' : t < 3.9 ? 'EMERGENCE' : t < 7.2 ? 'ASSEMBLY' : 'THE ARRIVAL';
  };
  const updatePlaybackUI = () => {
    const paused = video.paused;
    playPause.setAttribute('aria-label', paused ? 'Play film' : 'Pause film');
    playState.textContent = paused ? 'PLAY' : 'PAUSE';
    pauseShape.setAttribute('d', paused ? 'm9 5 11 7-11 7V5Z' : 'M8 5v14M16 5v14');
  };
  const showPrompt = (retry = false) => {
    prompt.hidden = false;
    promptPlay.querySelector('span').textContent = retry ? 'Retry film' : 'Play film';
  };
  function start(at = null) {
    if (failed) {
      filmWrap.classList.remove('video-error');
      failed = false;
      video.load();
    }
    if (at !== null) {
      const seek = () => { try { video.currentTime = Math.min(Math.max(0, at), dur() - .06); } catch (_) {} updateProgress(); };
      if (video.readyState >= 1) seek();
      else video.addEventListener('loadedmetadata', seek, { once: true });
    }
    const promise = video.play();
    if (promise && typeof promise.then === 'function') promise.then(() => { prompt.hidden = true; updatePlaybackUI(); }).catch(() => { showPrompt(); updatePlaybackUI(); });
    else { prompt.hidden = true; updatePlaybackUI(); }
  }
  function pause() { video.pause(); updatePlaybackUI(); }
  function seekFromPointer(e) {
    if (failed || video.readyState < 1) return;
    const rect = progress.getBoundingClientRect();
    if (!rect.width) return;
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    try { video.currentTime = fraction * dur(); } catch (_) {}
    updateProgress();
  }
  replay.addEventListener('click', () => start(0));
  playPause.addEventListener('click', () => video.paused ? start(video.ended ? 0 : null) : pause());
  promptPlay.addEventListener('click', () => start(video.ended ? 0 : null));
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    video.volume = .7;
    const on = !video.muted;
    soundLabel.textContent = on ? 'SOUND ON' : 'SOUND OFF';
    sound.setAttribute('aria-pressed', String(on));
    sound.setAttribute('aria-label', on ? 'Mute sound' : 'Enable sound');
    speakerCross.style.display = on ? 'none' : '';
  });
  progress.addEventListener('pointerdown', (e) => { scrubbing = true; progress.setPointerCapture?.(e.pointerId); seekFromPointer(e); });
  progress.addEventListener('pointermove', (e) => { if (scrubbing) seekFromPointer(e); });
  progress.addEventListener('pointerup', (e) => { if (scrubbing) seekFromPointer(e); scrubbing = false; });
  progress.addEventListener('pointercancel', () => { scrubbing = false; });
  progress.addEventListener('keydown', (e) => {
    const k = e.key;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(k)) return;
    e.preventDefault();
    if (video.readyState < 1) return;
    video.currentTime = k === 'Home' ? 0 : k === 'End' ? dur() - .02 : Math.max(0, Math.min(dur() - .02, video.currentTime + (k === 'ArrowRight' ? 1 : -1)));
    updateProgress();
  });
  video.addEventListener('loadedmetadata', updateProgress);
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('playing', () => { prompt.hidden = true; updatePlaybackUI(); });
  video.addEventListener('pause', updatePlaybackUI);
  video.addEventListener('ended', () => { updateProgress(); updatePlaybackUI(); });
  video.addEventListener('error', () => { failed = true; filmWrap.classList.add('video-error'); showPrompt(true); updatePlaybackUI(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && !video.paused) pause(); });
  video.muted = true;
  video.playsInline = true;
  video.volume = .7;
  if (reducedMotion) {
    pause();
    showPrompt();
  } else {
    start();
  }
  updateProgress();
  updatePlaybackUI();

  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-open');
  };
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu();
    else {
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close navigation');
      mobileNav.hidden = false;
      document.body.classList.add('menu-open');
    }
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 801px)').addEventListener('change', e => { if (e.matches) closeMenu(); });

  document.querySelectorAll('[data-time]').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('experience').scrollIntoView({ behavior: 'instant' });
      requestAnimationFrame(() => start(Number(card.dataset.time)));
    });
  });
  $('#final-replay').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('experience').scrollIntoView({ behavior: 'instant' });
    requestAnimationFrame(() => start(0));
  });
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target.id === 'experience' && !entry.isIntersecting && !video.paused) pause();
    }
  }, { threshold: 0.02 });
  observer.observe($('#experience'));
})();

