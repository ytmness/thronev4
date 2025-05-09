console.log("Main.js cargado correctamente");

async function cargarProductos() {
    try {
        const response = await fetch("../api/productos.json");
        if (!response.ok) throw new Error(`Error al cargar JSON: ${response.status}`);
        const data = await response.json();
        window.productos = data; // Guardar productos globalmente
        console.log("Productos cargados:", productos);

        inicializarPagina();
    } catch (error) {
        console.error("Error al cargar productos:", error.message);
    }
}

function inicializarPagina() {
    if (document.getElementById("carousel")) {
        renderizarCarrusel(productos);
        iniciarCarrusel();
    }

    const searchButton = document.getElementById("search-button");
    if (searchButton) {
        searchButton.addEventListener("click", buscarProducto); // Aseguramos que el evento de búsqueda funcione
    }

    const currentPage = document.body.className;
    if (currentPage === "tenis-page") filtrarProductosPorCategoria("Tenis");
    if (currentPage === "ropa-page") filtrarProductosPorCategoria("Ropa");
    if (currentPage === "accesorios-page") filtrarProductosPorCategoria("Accesorios");
    if (currentPage === "retail-page") filtrarProductosPorCategoria("Retail");
}

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});

// Función para la búsqueda de productos
function buscarProducto() {
    const input = document.getElementById('search-input').value.toLowerCase(); // Obtener lo que el usuario busca
    const productos = document.querySelectorAll('.product-item'); // Todos los productos en la página

    productos.forEach(producto => {
        const nombre = producto.querySelector('h3').innerText.toLowerCase(); // Obtener el nombre del producto
        if (nombre.includes(input)) {
            producto.style.display = 'block'; // Mostrar productos que coincidan
        } else {
            producto.style.display = 'none'; // Ocultar productos que no coincidan
        }
    });
}
