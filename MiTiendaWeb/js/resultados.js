console.log("Resultados.js cargado correctamente");

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el término de búsqueda de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('query'); // Obtener el término de búsqueda de la URL

    console.log("Término de búsqueda:", searchTerm);  // Verificar que el término esté presente en la URL

    if (!searchTerm) {
        console.error("No se proporcionó un término de búsqueda.");
        return;  // Si no hay término de búsqueda, salir
    }

    // Si los productos no están disponibles globalmente, cargarlos desde el archivo JSON
    let productos = window.productos || [];
    if (productos.length === 0) {
        try {
            const response = await fetch("../api/productos.json");
            if (!response.ok) throw new Error(`Error al cargar JSON: ${response.status}`);
            productos = await response.json();
            window.productos = productos; // Guardamos los productos globalmente
            console.log("Productos cargados desde JSON:", productos);
        } catch (error) {
            console.error("Error al cargar productos:", error.message);
            return;  // Si hay error, salir
        }
    }

    console.log("Productos disponibles:", productos);  // Verifica que los productos estén disponibles

    // Filtrar los productos que coinciden con el término de búsqueda
    const productosFiltrados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log("Productos filtrados:", productosFiltrados); // Verifica si el filtro está funcionando correctamente

    // Mostrar los productos filtrados
    const resultsContainer = document.getElementById('search-results');
    if (productosFiltrados.length > 0) {
        productosFiltrados.forEach(producto => {
            const productoHTML = `
                <div class="product-item">
                    <img src="${producto.img}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>$${producto.precio} MXN</p>
                    <button onclick="agregarAlCarrito('${producto.nombre}', ${producto.precio})">Agregar al Carrito</button>
                </div>
            `;
            resultsContainer.innerHTML += productoHTML;
        });
    } else {
        resultsContainer.innerHTML = '<p>No se encontraron productos que coincidan con tu búsqueda.</p>';
    }
});
