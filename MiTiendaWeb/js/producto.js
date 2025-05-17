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

async function cargarDetallesProducto(id) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        const producto = productos.find(p => (p._id || p.id_original || p.id) === id);
        
        if (!producto) {
            throw new Error('Producto no encontrado');
        }

        return {
            id: producto._id || producto.id_original || producto.id,
            nombre: producto.nombre,
            marca: producto.marca,
            precio: producto.precio,
            categoria: producto.categoria,
            img: producto.img || producto.imagen,
            tallas: producto.tallas
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = urlParams.get('id');
    
    if (idProducto) {
        const producto = await cargarDetallesProducto(idProducto);
        if (producto) {
            mostrarDetallesProducto(producto);
        } else {
            mostrarError('Producto no encontrado');
        }
    } else {
        mostrarError('ID de producto no especificado');
    }
});
