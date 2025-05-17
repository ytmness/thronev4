function crearTarjetaProducto(producto) {
    // Manejar diferentes formatos de imagen
    const imagenUrl = producto.img || producto.imagen || '/static/img/no-image.svg';
    const esURLExterna = imagenUrl.startsWith('http');
    const rutaImagen = esURLExterna ? imagenUrl : `/static/img/productos/${imagenUrl}`;

    // Formatear el precio
    const precioFormateado = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(producto.precio);

    // Crear el elemento
    const div = document.createElement("div");
    div.classList.add("product-item");
    div.innerHTML = `
        <div class="producto-imagen-container">
            <img src="${rutaImagen}" alt="${producto.nombre}" onerror="this.src='/static/img/no-image.svg'" />
        </div>
        <div class="producto-info">
            <h3>${producto.nombre}</h3>
            <span class="producto-marca">${producto.marca}</span>
            <p class="producto-categoria">${producto.categoria}</p>
            <p class="producto-precio">${precioFormateado}</p>
            <div class="producto-tallas">
                ${Object.entries(producto.tallas || {}).map(([talla, stock]) => `
                    <span class="talla-item ${stock > 0 ? 'en-stock' : 'sin-stock'}">
                        ${talla}: ${stock}
                    </span>
                `).join('')}
            </div>
            <button class="btn-ver-detalles" onclick="verDetalles('${producto.id}')">
                Ver Detalles
            </button>
        </div>
    `;
    return div;
}
  
function renderizarCatalogo(productos) {
    const contenedor = document.getElementById("productos");
    if (!contenedor) {
      console.warn("No se encontró el contenedor con id 'productos'");
      return;
    }
  
    contenedor.innerHTML = "";
    productos.forEach((producto) => {
      const tarjeta = crearTarjetaProducto(producto);
      contenedor.appendChild(tarjeta);
    });
  }
  
function cargarCatalogo() {
    fetch("/api/productos")
        .then(res => res.json())
        .then(data => {
            // Asegurarnos de que los productos tengan el formato correcto
            const productosFormateados = data.map(producto => ({
                id: producto._id || producto.id_original || producto.id,
                nombre: producto.nombre,
                marca: producto.marca,
                precio: producto.precio,
                categoria: producto.categoria,
                img: producto.img || producto.imagen,
                tallas: producto.tallas
            }));
            renderizarCatalogo(productosFormateados);
        })
        .catch(error => {
            console.error("Error al cargar el catálogo:", error);
            // Mostrar mensaje de error al usuario
            const contenedor = document.getElementById("productos");
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="error-mensaje">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Error al cargar los productos. Por favor, intenta de nuevo más tarde.</p>
                    </div>
                `;
            }
        });
  }
  
cargarCatalogo();
  