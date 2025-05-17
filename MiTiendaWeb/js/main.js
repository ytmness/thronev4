console.log("Main.js cargado correctamente");

async function cargarProductos() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        return data.map(producto => ({
            id: producto._id || producto.id_original || producto.id,
            nombre: producto.nombre,
            marca: producto.marca,
            precio: producto.precio,
            categoria: producto.categoria,
            img: producto.img || producto.imagen,
            tallas: producto.tallas
        }));
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function renderizarCarrusel(productos) {
    const carousel = document.getElementById("carousel");
    if (!carousel) return;

    const carouselTrack = carousel.querySelector(".carousel-track");
    if (!carouselTrack) return;

    carouselTrack.innerHTML = productos
        .slice(0, 10) // Mostrar solo los primeros 10 productos
        .map(producto => {
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
                    <img src="${imgSrc}" alt="${producto.nombre}" onerror="this.src='../images/file.png'">
                    <h3>${producto.nombre}</h3>
                    <p>$${producto.precio.toFixed(2)} MXN</p>
                </div>
            `;
        })
        .join('');

    // Inicializar controles del carrusel
    const btnLeft = carousel.querySelector('.carousel-btn.left');
    const btnRight = carousel.querySelector('.carousel-btn.right');
    const track = carouselTrack;

    if (btnLeft && btnRight && track) {
        btnLeft.addEventListener('click', () => {
            track.scrollBy({ left: -300, behavior: 'smooth' });
        });

        btnRight.addEventListener('click', () => {
            track.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

function actualizarContadores(productos) {
    // Actualizar contadores de productos por categoría
    const contadores = {
        'tenis': document.getElementById('contador-tenis'),
        'ropa': document.getElementById('contador-ropa'),
        'accesorios': document.getElementById('contador-accesorios'),
        'retail': document.getElementById('contador-retail')
    };

    const categorias = {
        'Tenis': 'tenis',
        'Ropa': 'ropa',
        'Accesorios': 'accesorios',
        'Retail': 'retail'
    };

    // Contar productos por categoría
    const conteo = {};
    productos.forEach(producto => {
        const categoria = categorias[producto.categoria];
        if (categoria) {
            conteo[categoria] = (conteo[categoria] || 0) + 1;
        }
    });

    // Actualizar los contadores en el DOM
    Object.entries(contadores).forEach(([categoria, elemento]) => {
        if (elemento) {
            elemento.textContent = conteo[categoria] || 0;
        }
    });
}

function inicializarPagina() {
    const searchButton = document.getElementById("search-button");
    if (searchButton) {
        searchButton.addEventListener("click", buscarProducto);
    }

    const currentPage = document.body.className;
    if (currentPage === "tenis-page") filtrarProductosPorCategoria("Tenis");
    if (currentPage === "ropa-page") filtrarProductosPorCategoria("Ropa");
    if (currentPage === "accesorios-page") filtrarProductosPorCategoria("Accesorios");
    if (currentPage === "retail-page") filtrarProductosPorCategoria("Retail");
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const productos = await cargarProductos();
        if (productos.length > 0) {
            // Inicializar el carrusel si existe en la página
            if (document.getElementById("carousel")) {
                renderizarCarrusel(productos);
            }
            actualizarContadores(productos);
            inicializarPagina();
        } else {
            console.warn('No se encontraron productos para mostrar');
        }
    } catch (error) {
        console.error('Error al inicializar la página:', error);
    }
});

// Función para la búsqueda de productos
function buscarProducto() {
    const input = document.getElementById('search-input')?.value.toLowerCase();
    if (!input) return;

    const productos = document.querySelectorAll('.product-item');
    productos.forEach(producto => {
        const nombre = producto.querySelector('h3')?.innerText.toLowerCase();
        producto.style.display = nombre?.includes(input) ? 'block' : 'none';
    });
}
