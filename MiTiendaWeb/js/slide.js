// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slider .slide');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

// Mostrar la primera diapositiva
showSlide(currentSlide);

// Cambiar las diapositivas cada 5 segundos
setInterval(nextSlide, 5000);
