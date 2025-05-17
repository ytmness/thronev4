// Variables globales
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');
const carousels = {
    productos: {
        track: document.getElementById('productos-destacados'),
        btnLeft: document.getElementById('btn-left-productos'),
        btnRight: document.getElementById('btn-right-productos')
    },
    ropa: {
        track: document.getElementById('ropa-destacada'),
        btnLeft: document.getElementById('btn-left-ropa'),
        btnRight: document.getElementById('btn-right-ropa')
    },
    accesorios: {
        track: document.getElementById('accesorios-destacados'),
        btnLeft: document.getElementById('btn-left-accesorios'),
        btnRight: document.getElementById('btn-right-accesorios')
    }
};

// Función para obtener N elementos aleatorios de un array
function obtenerRandom(arr, n) {
    const copia = arr.slice();
    const resultado = [];
    const max = Math.min(n, copia.length);
    for (let i = 0; i < max; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        resultado.push(copia.splice(idx, 1)[0]);
    }
    return resultado;
}

// Función para cargar productos destacados
async function cargarProductosDestacados() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();

        // Normalizar los productos para asegurar consistencia
        const productosNormalizados = productos.map(p => ({
            id: p._id || p.id_original || p.id,
            nombre: p.nombre,
            marca: p.marca,
            precio: p.precio,
            categoria: p.categoria,
            img: p.img || p.imagen,
            tallas: p.tallas
        }));

        // Filtrar productos por categoría y tomar 20 random
        const productosTenis = obtenerRandom(productosNormalizados.filter(p => p.categoria === 'Tenis'), 20);
        const productosRopa = obtenerRandom(productosNormalizados.filter(p => p.categoria === 'Ropa'), 20);
        const productosAccesorios = obtenerRandom(productosNormalizados.filter(p => p.categoria === 'Accesorios'), 20);
        const productosRetail = obtenerRandom(productosNormalizados.filter(p => p.categoria === 'Retail'), 20);

        // Renderizar productos en sus respectivos carruseles
        renderizarProductos(productosTenis, carousels.productos.track);
        renderizarProductos(productosRopa, carousels.ropa.track);
        renderizarProductos(productosAccesorios, carousels.accesorios.track);
        renderizarProductos(productosRetail, document.getElementById('retail-destacado'));

        // Inicializar carruseles después de cargar los productos
        inicializarCarousels();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para renderizar productos
function renderizarProductos(productos, container) {
    if (!container) return;
    
    container.innerHTML = productos.map(producto => {
        // Normalizar la URL de la imagen
        let imgSrc;
        if (producto.img) {
            imgSrc = producto.img.startsWith("http") 
                ? producto.img 
                : `http://127.0.0.1:3000/static/img/productos/${producto.img}`;
        } else if (producto.imagen) {
            imgSrc = producto.imagen.startsWith("http")
                ? producto.imagen
                : `http://127.0.0.1:3000/static/img/productos/${producto.imagen}`;
        } else {
            imgSrc = '../images/file.png'; // Usar el logo como placeholder
        }

        return `
            <div class="product-item" onclick="verDetalles('${producto.id}')">
                <img src="${imgSrc}" 
                     alt="${producto.nombre}"
                     onerror="this.src='../images/file.png'">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio.toFixed(2)} MXN</p>
            </div>
        `;
    }).join('');
}

// Función para inicializar carruseles
function inicializarCarousels() {
    const carousels = [
        { track: document.getElementById('productos-destacados'), btnLeft: document.getElementById('btn-left-productos'), btnRight: document.getElementById('btn-right-productos') },
        { track: document.getElementById('ropa-destacada'), btnLeft: document.getElementById('btn-left-ropa'), btnRight: document.getElementById('btn-right-ropa') },
        { track: document.getElementById('accesorios-destacados'), btnLeft: document.getElementById('btn-left-accesorios'), btnRight: document.getElementById('btn-right-accesorios') },
        { track: document.getElementById('retail-destacado'), btnLeft: document.getElementById('btn-left-retail'), btnRight: document.getElementById('btn-right-retail') }
    ];
    carousels.forEach(({ track, btnLeft, btnRight }) => {
        if (!track || !btnLeft || !btnRight) return;
        const producto = track.querySelector('.product-item');
        let productoWidth = producto ? producto.offsetWidth : track.offsetWidth / 5;
        btnLeft.addEventListener('click', () => {
            track.scrollLeft = Math.max(0, track.scrollLeft - productoWidth);
            setTimeout(() => {
                btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
                btnRight.style.display = (track.scrollLeft + track.clientWidth >= track.scrollWidth - 1) ? 'none' : 'flex';
            }, 350);
        });
        btnRight.addEventListener('click', () => {
            track.scrollLeft = Math.min(track.scrollWidth - track.clientWidth, track.scrollLeft + productoWidth);
            setTimeout(() => {
                btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
                btnRight.style.display = (track.scrollLeft + track.clientWidth >= track.scrollWidth - 1) ? 'none' : 'flex';
            }, 350);
        });
        // Permitir scroll vertical, bloquear solo horizontal
        track.addEventListener('wheel', e => {
            if (e.deltaX !== 0) e.preventDefault();
        }, { passive: false });
        track.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
        track.style.overflowX = 'hidden';
        setTimeout(() => {
            btnLeft.style.display = track.scrollLeft <= 0 ? 'none' : 'flex';
            btnRight.style.display = (track.scrollLeft + track.clientWidth >= track.scrollWidth - 1) ? 'none' : 'flex';
        }, 100);
    });
}

// Función para ver detalles del producto
async function verDetalles(id) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        const producto = productos.find(p => (p._id || p.id_original || p.id) === id);
        
        if (producto) {
            // Normalizar el producto antes de guardarlo
            const productoNormalizado = {
                _id: producto._id || producto.id_original || producto.id,
                nombre: producto.nombre,
                marca: producto.marca,
                precio: producto.precio,
                categoria: producto.categoria,
                img: producto.img || producto.imagen,
                tallas: producto.tallas
            };
            localStorage.setItem('producto', JSON.stringify(productoNormalizado));
            window.location.href = 'producto.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para el hero slider
function iniciarHeroSlider() {
    const heroTrack = document.querySelector('.hero-track');
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroBtns = document.querySelectorAll('.hero-btn');
    let currentHeroSlide = 0;
    let heroInterval;

    function mostrarSlide(index) {
        if (!heroTrack || !heroSlides.length) return;
        
        currentHeroSlide = (index + heroSlides.length) % heroSlides.length;
        heroTrack.style.transform = `translateX(-${currentHeroSlide * 100}%)`;
        
        // Actualizar botones
        heroBtns.forEach((btn, i) => {
            btn.classList.toggle('active', i === currentHeroSlide);
        });
    }

    function siguienteSlide() {
        mostrarSlide(currentHeroSlide + 1);
    }

    // Event listeners para botones del hero
    heroBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            clearInterval(heroInterval);
            mostrarSlide(index);
            heroInterval = setInterval(siguienteSlide, 5000);
        });
    });

    // Iniciar autoplay
    heroInterval = setInterval(siguienteSlide, 5000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Ocultar pantalla de carga
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }

    // Inicializar componentes
    cargarProductosDestacados();
    iniciarHeroSlider();
    inicializarCarousels();
}); 