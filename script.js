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