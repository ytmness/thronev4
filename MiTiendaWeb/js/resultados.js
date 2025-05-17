console.log("Resultados.js cargado correctamente");

async function buscarProductos(termino) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        
        return productos
            .map(producto => ({
                id: producto._id || producto.id_original || producto.id,
                nombre: producto.nombre,
                marca: producto.marca,
                precio: producto.precio,
                categoria: producto.categoria,
                img: producto.img || producto.imagen,
                tallas: producto.tallas
            }))
            .filter(producto => 
                producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                producto.marca.toLowerCase().includes(termino.toLowerCase()) ||
                producto.categoria.toLowerCase().includes(termino.toLowerCase())
            );
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const termino = urlParams.get('q');
    
    if (termino) {
        const productos = await buscarProductos(termino);
        mostrarResultados(productos, termino);
    } else {
        mostrarError('No se especificó un término de búsqueda');
    }
});

function mostrarResultados(productos, termino) {
    console.log("Productos disponibles:", productos);  // Verifica que los productos estén disponibles

    // Filtrar los productos que coinciden con el término de búsqueda
    const productosFiltrados = productos.filter(producto => 
        producto.nombre.toLowerCase().includes(termino.toLowerCase())
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
}

function mostrarError(mensaje) {
    console.error(mensaje);
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = `<p class="error">${mensaje}</p>`;
}
