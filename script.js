/* ============================================
   SLIDESHOW NAVIGATION
   Controls the photo gallery prev/next buttons

   How it works:
   1. Finds all elements with class "slide"
   2. Hides all of them except the active one
   3. When prev/next is clicked, it moves to
      the previous or next slide
   4. Loops around at the beginning and end
   ============================================ */

let currentSlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');

    // Hide the current slide
    slides[currentSlide].classList.remove('active');

    // Calculate which slide comes next
    // The math makes it loop: last slide → first, first slide → last
    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    // Show the new slide
    slides[currentSlide].classList.add('active');

    // Update the "1 / 5" counter
    document.getElementById('current-slide').textContent = currentSlide + 1;
}

/* ============================================
   MOBILE NAVIGATION
   Controls the hamburger menu open/close

   How it works:
   1. Hamburger button calls toggleNav()
   2. Adds or removes the "open" class
   3. CSS uses "open" to expand the menu
   ============================================ */

function toggleNav() {
    document.querySelector('.nav-links').classList.toggle('open');
}

// Close the menu automatically when a nav link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelector('.nav-links').classList.remove('open');
    });
});

/* ============================================
   PAGE LOAD
   Runs once when the page finishes loading
   Sets the total slide count in the counter
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    const totalSlides = document.querySelectorAll('.slide').length;
    document.getElementById('total-slides').textContent = totalSlides;
});

/* ============================================
   AUDIO: PREVENT SIMULTANEOUS PLAYBACK
   Automatically pauses any other clip when
   a new one starts playing
   ============================================ */

document.addEventListener('play', function(e) {
    const audios = document.getElementsByTagName('audio');
    for (let i = 0; i < audios.length; i++) {
        if (audios[i] !== e.target) {
            audios[i].pause();
        }
    }
}, true);

/* ============================================
   BACK TO TOP BUTTON
   Shows the button after scrolling 300px,
   hides it again near the top
   ============================================ */

const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================
   CUSTOM LYRIC PLAYER
   Vanilla JS — no CDN, no external libraries.
   Play button spins while audio plays; single
   overlay div sweeps the lyric line by line.
   ============================================ */

window.addEventListener('load', function() {
    var CLIP_START    = 21;
    var CLIP_END      = 32.27;
    var CLIP_DURATION = CLIP_END - CLIP_START;

    var btn       = document.getElementById('lyric-btn');
    var lyricText = document.getElementById('lyric-text');
    if (!btn || !lyricText) return;

    var audio     = new Audio('audio/soundcite.mp3');
    var isPlaying = false;
    var rafId     = null;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;background:rgba(0,0,0,0.25);pointer-events:none;z-index:9999;border-radius:2px;display:none;width:0';
    document.body.appendChild(overlay);

    function stopPlayer() {
        isPlaying = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        overlay.style.display = 'none';
        overlay.style.width   = '0';
    }

    function tick() {
        if (audio.currentTime >= CLIP_END) {
            audio.pause();
            audio.currentTime = CLIP_START;
            stopPlayer();
            return;
        }

        var elapsed = Math.max(0, audio.currentTime - CLIP_START);
        var rects   = Array.from(lyricText.getClientRects());
        var n       = rects.length;
        if (!n) { rafId = requestAnimationFrame(tick); return; }

        var timePerLine = CLIP_DURATION / n;
        var currentLine = Math.min(n - 1, Math.floor(elapsed / timePerLine));
        var progress    = (elapsed - currentLine * timePerLine) / timePerLine;
        var r           = rects[currentLine];

        overlay.style.display = 'block';
        overlay.style.left    = r.left   + 'px';
        overlay.style.top     = r.top    + 'px';
        overlay.style.height  = r.height + 'px';
        overlay.style.width   = (r.width * progress) + 'px';

        rafId = requestAnimationFrame(tick);
    }

    btn.addEventListener('click', function() {
        if (isPlaying) {
            audio.pause();
            stopPlayer();
        } else {
            audio.currentTime = CLIP_START;
            var promise = audio.play();
            if (promise !== undefined) {
                promise.then(function() {
                    isPlaying = true;
                    rafId = requestAnimationFrame(tick);
                }).catch(function() {
                    stopPlayer();
                });
            } else {
                isPlaying = true;
                btn.classList.add('playing');
                rafId = requestAnimationFrame(tick);
            }
        }
    });
});

