// Función para redirigir a la página de detalles y mostrar la pantalla de carga
function verDetalles(productoId) {
    // Mostrar pantalla de carga
    document.getElementById('loading-screen').style.display = 'flex';

    fetch('../api/productos.json')
        .then(response => response.json())
        .then(productos => {
            const productoSeleccionado = productos.find(prod => prod.id === productoId);
            if (productoSeleccionado) {
                // Almacenar el producto en localStorage
                localStorage.setItem('producto', JSON.stringify(productoSeleccionado));

                // Redirigir a la página de detalles después de un pequeño retraso para mostrar la pantalla de carga
                setTimeout(function () {
                    window.location.href = 'producto.html';
                }, 500); // Ajusta el retraso si es necesario
            } else {
                console.error("Producto no encontrado.");
            }
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
            // Ocultar pantalla de carga en caso de error
            document.getElementById('loading-screen').style.display = 'none';
        });
}
