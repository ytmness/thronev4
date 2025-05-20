console.log("CategoryFilter.js cargado correctamente");

// Función para filtrar productos por categoría
function filtrarProductosPorCategoria(categoria) {
    const productosFiltrados = productos.filter(producto => producto.categoria === categoria);
    const gridContainer = document.getElementById("product-list");

    if (!gridContainer) return console.error("No se encontró el elemento 'product-list'.");

    gridContainer.innerHTML = ""; // Limpiar contenido actual
    productosFiltrados.forEach(producto => {
        const productoHTML = `
            <div class="product-item">
                <img src="${producto.img}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>$${producto.precio} MXN</p>
                <button onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio})">Agregar al Carrito</button>
            </div>
        `;
        gridContainer.innerHTML += productoHTML;
    });
}
