document.addEventListener("DOMContentLoaded", function () {
    const carouselTrack = document.querySelector(".carousel-track");

    // Función para barajar productos (algoritmo Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Cargar productos desde el JSON
    fetch("../api/productos.json")
        .then((response) => response.json())
        .then((productos) => {
            // Barajar los productos
            const productosAleatorios = shuffleArray(productos);

            // Renderizar los productos en el carrusel
            productosAleatorios.forEach((producto) => {
                // Verifica si la imagen es externa o local
                const esURLExterna = producto.img.startsWith("http") || producto.img.startsWith("https");
                const rutaImagen = esURLExterna ? producto.img : `/images/${producto.img}`;

                // Crear el elemento del producto
                const productItem = document.createElement("div");
                productItem.classList.add("product-item");

                productItem.innerHTML = `
                    <img src="${rutaImagen}" alt="${producto.nombre}" style="width: 100%; height: auto; border-radius: 8px;">
                    <h3>${producto.nombre}</h3>
                    <p>$${producto.precio.toFixed(2)} MXN</p>
                `;

                // Agregar evento de clic para ver detalles
                productItem.addEventListener("click", function () {
                    verDetalles(producto.id);
                });

                carouselTrack.appendChild(productItem);
            });

            // Inicializa el carrusel
            initializeCarousel();
        })
        .catch((error) => console.error("Error al cargar productos:", error));
});

// Función para redirigir a la página de detalles
function verDetalles(productoId) {
    fetch("../api/productos.json")
        .then((response) => response.json())
        .then((productos) => {
            const productoSeleccionado = productos.find((prod) => prod.id === productoId);
            if (productoSeleccionado) {
                localStorage.setItem("producto", JSON.stringify(productoSeleccionado));
                window.location.href = "producto.html";
            } else {
                console.error("Producto no encontrado.");
            }
        })
        .catch((error) => console.error("Error al cargar los productos:", error));
}

// Función para inicializar el carrusel
function initializeCarousel() {
    const track = document.querySelector(".carousel-track");
    const items = document.querySelectorAll(".product-item");
    let currentIndex = 0;

    function moveCarousel() {
        const itemWidth = items[0].offsetWidth;
        const trackWidth = track.offsetWidth;
        const visibleItems = Math.floor(trackWidth / itemWidth);

        currentIndex = (currentIndex + 1) % (items.length - visibleItems + 1);
        const translateX = -currentIndex * itemWidth;

        track.style.transform = `translateX(${translateX}px)`;
    }

    setInterval(moveCarousel, 3000); // Cambiar cada 3 segundos
}
