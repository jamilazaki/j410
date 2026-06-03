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
   SOUNDCITE LINE-BY-LINE HIGHLIGHT
   Single overlay div sweeps one line at a time.
   Pause/resume tracked via MutationObserver on
   the soundcite-playing class.
   ============================================ */

window.addEventListener('load', function() {
    var CLIP_DURATION = 11.3;

    var soundciteSpan = document.querySelector('.soundcite');
    if (!soundciteSpan) return;

    var rafId         = null;
    var elapsed       = 0;
    var lastTimestamp = null;
    var overlay       = document.createElement('div');
    overlay.style.cssText = 'position:fixed;background:rgba(0,0,0,0.25);pointer-events:none;z-index:9999;border-radius:2px;display:none;width:0';
    document.body.appendChild(overlay);

    function pause() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        lastTimestamp = null;
    }

    function reset() {
        pause();
        elapsed = 0;
        overlay.style.display = 'none';
        overlay.style.width   = '0';
    }

    function tick(now) {
        if (lastTimestamp !== null) elapsed += (now - lastTimestamp) / 1000;
        lastTimestamp = now;

        if (elapsed >= CLIP_DURATION) { reset(); return; }

        var rects = Array.from(soundciteSpan.getClientRects());
        var n     = rects.length;
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

    new MutationObserver(function() {
        if (soundciteSpan.classList.contains('soundcite-playing')) {
            if (!rafId) rafId = requestAnimationFrame(tick);
        } else {
            if (elapsed > 0) pause();
            else reset();
        }
    }).observe(soundciteSpan, { attributes: true, attributeFilter: ['class'] });
});

