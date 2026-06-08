/* ============================================
   MOBILE NAV
   ============================================ */
function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('open');
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});

/* ============================================
   BACK TO TOP
   ============================================ */
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  backToTopBtn.style.display = window.scrollY > 400 ? 'block' : 'none';
});

/* ============================================
   SOUNDBITE PLAYER (full-screen moment)
   ============================================ */
window.addEventListener('load', () => {
  const CLIP_START = 21;
  const CLIP_END   = 32.27;

  const btn    = document.getElementById('soundbite-btn');
  const bars   = document.getElementById('waveform-bars');
  const audio  = new Audio('audio/soundcite.mp3');
  let playing  = false;
  let checkRaf = null;

  function stopSoundbite() {
    playing = false;
    audio.pause();
    audio.currentTime = CLIP_START;
    btn.classList.remove('playing');
    btn.querySelector('.play-icon').textContent = '▶';
    bars.classList.remove('active');
    if (checkRaf) { cancelAnimationFrame(checkRaf); checkRaf = null; }
  }

  function tick() {
    if (audio.currentTime >= CLIP_END) { stopSoundbite(); return; }
    checkRaf = requestAnimationFrame(tick);
  }

  btn && btn.addEventListener('click', () => {
    if (playing) {
      stopSoundbite();
    } else {
      audio.currentTime = CLIP_START;
      audio.play().then(() => {
        playing = true;
        btn.classList.add('playing');
        btn.querySelector('.play-icon').textContent = '■';
        bars.classList.add('active');
        checkRaf = requestAnimationFrame(tick);
      }).catch(() => {});
    }
  });

  /* INLINE lyric player (body text) */
  const lyricBtn  = document.getElementById('lyric-btn');
  const lyricText = document.getElementById('lyric-text');

  if (lyricBtn && lyricText) {
    const lyricAudio = new Audio('audio/soundcite.mp3');
    let lyricPlaying = false;
    let lyricRaf     = null;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;background:rgba(118,156,203,0.3);pointer-events:none;z-index:9999;border-radius:2px;display:none;width:0;transition:none;';
    document.body.appendChild(overlay);

    function stopLyric() {
      lyricPlaying = false;
      lyricAudio.pause();
      lyricAudio.currentTime = CLIP_START;
      lyricBtn.textContent = '▶';
      overlay.style.display = 'none';
      overlay.style.width = '0';
      if (lyricRaf) { cancelAnimationFrame(lyricRaf); lyricRaf = null; }
    }

    function lyricTick() {
      if (lyricAudio.currentTime >= CLIP_END) { stopLyric(); return; }
      const elapsed   = Math.max(0, lyricAudio.currentTime - CLIP_START);
      const duration  = CLIP_END - CLIP_START;
      const rects     = Array.from(lyricText.getClientRects());
      const n         = rects.length;
      if (!n) { lyricRaf = requestAnimationFrame(lyricTick); return; }
      const timePerLine   = duration / n;
      const currentLine   = Math.min(n - 1, Math.floor(elapsed / timePerLine));
      const progress      = (elapsed - currentLine * timePerLine) / timePerLine;
      const r             = rects[currentLine];
      overlay.style.display = 'block';
      overlay.style.left   = r.left + 'px';
      overlay.style.top    = r.top  + 'px';
      overlay.style.height = r.height + 'px';
      overlay.style.width  = (r.width * progress) + 'px';
      lyricRaf = requestAnimationFrame(lyricTick);
    }

    lyricBtn.addEventListener('click', () => {
      if (lyricPlaying) {
        stopLyric();
      } else {
        lyricAudio.currentTime = CLIP_START;
        lyricAudio.play().then(() => {
          lyricPlaying = true;
          lyricBtn.textContent = '■';
          lyricRaf = requestAnimationFrame(lyricTick);
        }).catch(() => {});
      }
    });
  }
});


/* ============================================
   FULLSCREEN CAROUSEL
   ============================================ */
let carouselIndex = 0;

function fitOverlayToImage(slide) {
  const img = slide.querySelector('.carousel-img');
  const overlay = slide.querySelector('.carousel-overlay');
  if (!img || !overlay || !img.naturalWidth) return;
  const slideW = slide.offsetWidth;
  const imgH = img.offsetHeight;
  const aspect = img.naturalWidth / img.naturalHeight;
  const renderedW = (aspect >= slideW / imgH) ? slideW : Math.round(imgH * aspect);
  overlay.style.width = renderedW + 'px';
}

function changeCarousel(dir) {
  const slides = document.querySelectorAll('.carousel-slide');
  slides[carouselIndex].classList.remove('active');
  carouselIndex = (carouselIndex + dir + slides.length) % slides.length;
  slides[carouselIndex].classList.add('active');
  document.getElementById('carousel-current').textContent = carouselIndex + 1;
  fitOverlayToImage(slides[carouselIndex]);
}

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.carousel-slide');
  document.getElementById('carousel-total').textContent = slides.length;

  // Fit overlay width to image on load for all slides
  slides.forEach(slide => {
    const img = slide.querySelector('.carousel-img');
    if (img && img.complete) {
      fitOverlayToImage(slide);
    } else if (img) {
      img.addEventListener('load', () => fitOverlayToImage(slide));
    }
  });

  // Re-fit on window resize
  window.addEventListener('resize', () => fitOverlayToImage(slides[carouselIndex]));

  // Touch/swipe for carousel
  const carousel = document.querySelector('.fullscreen-carousel');
  if (carousel) {
    let startX = 0;
    carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) changeCarousel(dx < 0 ? 1 : -1);
    });
  }
});

/* ============================================
   AUDIO BOARD (click-to-play speakers)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const thumbs = document.querySelectorAll('.audio-thumb');

  thumbs.forEach(thumb => {
    const speaker = thumb.closest('.audio-speaker');
    const audio   = speaker.querySelector('audio');
    const start   = parseFloat(thumb.dataset.start) || 0;
    const end     = parseFloat(thumb.dataset.end) || null;

    thumb.addEventListener('click', () => {
      // Stop all others
      document.querySelectorAll('.scene-audio').forEach(a => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
        }
      });
      document.querySelectorAll('.audio-thumb').forEach(t => t.classList.remove('playing'));

      if (!audio.paused) {
        audio.pause();
        audio.currentTime = start;
        thumb.classList.remove('playing');
      } else {
        audio.currentTime = start;
        audio.play().catch(() => {});
        thumb.classList.add('playing');

        if (end) {
          const check = setInterval(() => {
            if (audio.currentTime >= end) {
              audio.pause();
              audio.currentTime = start;
              thumb.classList.remove('playing');
              clearInterval(check);
            }
          }, 100);
        }
      }
    });
  });
});

/* ============================================
   EL TORO — VIDEO REVEAL
   ============================================ */
function startElToroReveal() {
  const cta      = document.getElementById('eltoro-cta');
  const video    = document.getElementById('eltoro-video');
  const matador  = document.getElementById('eltoro-matador');

  cta.style.display = 'none';
  if (matador) matador.style.display = 'none';
  video.play().catch(() => {});
}

/* prevent multiple audio clips playing */
document.addEventListener('play', e => {
  document.querySelectorAll('audio, video').forEach(el => {
    if (el !== e.target) el.pause();
  });
}, true);
