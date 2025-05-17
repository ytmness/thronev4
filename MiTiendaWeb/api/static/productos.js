// Variables globales
let productos = [];
let productosFiltrados = [];
let productoEditando = null;
let paginaActual = 1;
const productosPorPagina = 32;

// Referencias a elementos del DOM
let buscadorInput;
let filtroCategoria;
let filtroMarca;
let filtroPrecio;
let btnLimpiarFiltros;

// Inicializar referencias al DOM
function inicializarReferencias() {
    buscadorInput = document.getElementById('buscador-input');
    filtroCategoria = document.getElementById('filtro-categoria');
    filtroMarca = document.getElementById('filtro-marca');
    filtroPrecio = document.getElementById('filtro-precio');
    btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

    // Verificar que todos los elementos existan
    if (!buscadorInput || !filtroCategoria || !filtroMarca || !filtroPrecio || !btnLimpiarFiltros) {
        console.error('No se encontraron algunos elementos del DOM necesarios');
        return false;
    }
    return true;
}

// Funciones para productos
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productos = await response.json();
        productosFiltrados = [...productos];
        
        if (inicializarReferencias()) {
            cargarOpcionesFiltros();
            configurarEventListeners();
            mostrarProductos();
            actualizarPaginacion();
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los productos');
    }
}

// Configurar event listeners
function configurarEventListeners() {
    if (buscadorInput) {
        buscadorInput.addEventListener('input', debounce(filtrarProductos, 300));
    }
    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', filtrarProductos);
    }
    if (filtroMarca) {
        filtroMarca.addEventListener('change', filtrarProductos);
    }
    if (filtroPrecio) {
        filtroPrecio.addEventListener('change', filtrarProductos);
    }
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
    }
}

function mostrarProductos() {
    const productosContainer = document.getElementById('productos');
    productosContainer.innerHTML = '';
    
    // Calcular el rango de productos a mostrar
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosAMostrar = productosFiltrados.slice(inicio, fin);
    
    if (productosAMostrar.length === 0) {
        productosContainer.innerHTML = `
            <div class="no-productos">
                <i class="fas fa-box-open"></i>
                <h3>No se encontraron productos</h3>
                <p>No hay productos que coincidan con los filtros seleccionados.</p>
            </div>
        `;
        return;
    }

    productosAMostrar.forEach(producto => {
        const urlImagen = producto.img || producto.imagen || '/static/img/no-image.svg';
        const precioFormateado = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(producto.precio);

        productosContainer.innerHTML += `
            <div class="producto-card">
                <img src="${urlImagen}" alt="${producto.nombre}" class="producto-imagen" onerror="this.src='/static/img/no-image.svg'">
                <div class="producto-info">
                    <div class="producto-header">
                        <h3>${producto.nombre}</h3>
                        <span class="producto-marca">${producto.marca}</span>
                    </div>
                    <div class="producto-precio">${precioFormateado}</div>
                    <span class="producto-categoria">${producto.categoria}</span>
                    <div class="producto-tallas">
                        ${Object.entries(producto.tallas || {}).map(([talla, stock]) => `
                            <span class="talla-item ${stock > 0 ? 'en-stock' : 'sin-stock'}">
                                <i class="fas ${stock > 0 ? 'fa-check' : 'fa-times'}"></i>
                                ${talla}: ${stock}
                            </span>
                        `).join('')}
                    </div>
                    <div class="producto-acciones">
                        <button onclick="editarProducto('${producto._id || producto.id}')" class="btn-editar">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button onclick="eliminarProducto('${producto._id || producto.id}')" class="btn-eliminar">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    const paginacion = document.querySelector('.paginacion');
    
    if (totalPaginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botón anterior
    html += `
        <button class="paginacion-button" ${paginaActual === 1 ? 'disabled' : ''} id="btn-prev">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        if (
            i === 1 || 
            i === totalPaginas || 
            (i >= paginaActual - 1 && i <= paginaActual + 1)
        ) {
            html += `
                <button class="paginacion-button ${i === paginaActual ? 'active' : ''}" data-pagina="${i}">
                    ${i}
                </button>
            `;
        } else if (
            i === paginaActual - 2 || 
            i === paginaActual + 2
        ) {
            html += '<span class="paginacion-ellipsis">...</span>';
        }
    }
    
    // Botón siguiente
    html += `
        <button class="paginacion-button" ${paginaActual === totalPaginas ? 'disabled' : ''} id="btn-next">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginacion.innerHTML = html;

    // Agregar event listeners a los botones
    document.getElementById('btn-prev').onclick = () => {
        if (paginaActual > 1) {
            paginaActual--;
            mostrarProductos();
            actualizarPaginacion();
        }
    };

    document.getElementById('btn-next').onclick = () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarProductos();
            actualizarPaginacion();
        }
    };

    // Agregar event listeners a los botones de página
    document.querySelectorAll('.paginacion-button[data-pagina]').forEach(btn => {
        btn.onclick = () => {
            const nuevaPagina = parseInt(btn.dataset.pagina);
            if (nuevaPagina !== paginaActual) {
                paginaActual = nuevaPagina;
                mostrarProductos();
                actualizarPaginacion();
            }
        };
    });
}

async function editarProducto(id) {
    try {
        const producto = productos.find(p => (p._id || p.id) == id);
        if (!producto) {
            mostrarError('Producto no encontrado');
            return;
        }

        // Guardar el ID del producto que estamos editando
        productoEditando = id;

        // Obtener el modal y el formulario
        const modal = document.getElementById('modal-edicion');
        const form = document.getElementById('form-edicion');
        
        if (!modal || !form) {
            mostrarError('Error al cargar el formulario de edición');
            return;
        }

        // Obtener los campos del formulario
        const nombreInput = document.getElementById('nombre-edicion');
        const marcaInput = document.getElementById('marca-edicion');
        const precioInput = document.getElementById('precio-edicion');
        const categoriaInput = document.getElementById('categoria-edicion');
        const imagenInput = document.getElementById('imagen-edicion');
        const preview = document.getElementById('imagen-preview');
        const tallasContainer = document.getElementById('tallas-container-edicion');

        // Verificar que todos los elementos existan
        if (!nombreInput || !marcaInput || !precioInput || !categoriaInput || !imagenInput || !preview || !tallasContainer) {
            mostrarError('Error: algunos elementos del formulario no están disponibles');
            return;
        }

        // Llenar los campos del formulario
        nombreInput.value = producto.nombre;
        marcaInput.value = producto.marca;
        precioInput.value = producto.precio;
        categoriaInput.value = producto.categoria;
        imagenInput.value = producto.img || producto.imagen || '';

        // Mostrar imagen actual
        let imagenUrl = producto.img || producto.imagen;
        if (!imagenUrl || imagenUrl === 'undefined') {
            imagenUrl = '/static/img/no-image.svg';
        }
        preview.innerHTML = `<img src="${imagenUrl}" alt="Vista previa" onerror="this.src='/static/img/no-image.svg'">`;

        // Limpiar y llenar el contenedor de tallas
        tallasContainer.innerHTML = '';
        Object.entries(producto.tallas || {}).forEach(([talla, stock]) => {
            agregarTallaEdicion(talla, stock);
        });

        // Mostrar el modal
        modal.style.display = 'block';
        modal.classList.add('active');

    } catch (error) {
        console.error('Error al editar producto:', error);
        mostrarError('Error al cargar el formulario de edición');
    }
}

async function guardarEdicion(e) {
    e.preventDefault();
    
    if (!productoEditando) {
        mostrarError('No hay producto seleccionado para editar');
        return;
    }

    try {
        const tallas = {};
        document.querySelectorAll('#tallas-container-edicion .talla-item').forEach(item => {
            const talla = item.querySelector('input[name="talla"]').value;
            const stock = parseInt(item.querySelector('input[name="stock"]').value);
            if (talla && !isNaN(stock)) {
                tallas[talla] = stock;
            }
        });

        const productoActualizado = {
            nombre: document.getElementById('nombre-edicion').value,
            marca: document.getElementById('marca-edicion').value,
            precio: parseFloat(document.getElementById('precio-edicion').value),
            categoria: document.getElementById('categoria-edicion').value,
            img: document.getElementById('imagen-edicion').value,
            tallas: tallas
        };

        const response = await fetch(`/api/productos/${productoEditando}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoActualizado)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al actualizar el producto');
        }

        await cargarProductos();
        cerrarModalEdicion();
        mostrarNotificacion('Producto actualizado exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al actualizar el producto');
    }
}

function cerrarModalEdicion() {
    const modal = document.getElementById('modal-edicion');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    const form = document.getElementById('form-edicion');
    if (form) {
        form.reset();
    }
    productoEditando = null;
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`/api/productos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar el producto');

        productos = productos.filter(p => p._id !== id);
        productosFiltrados = productosFiltrados.filter(p => p._id !== id);
        mostrarProductos();
        actualizarPaginacion();
        mostrarNotificacion('Producto eliminado exitosamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error al eliminar el producto', 'error');
    }
}

function agregarTallaEdicion(talla = '', stock = 0) {
    const container = document.getElementById('tallas-container-edicion');
    if (!container) {
        console.error('Contenedor de tallas no encontrado');
        return;
    }

    const div = document.createElement('div');
    div.className = 'talla-item';
    div.innerHTML = `
        <div class="talla-input">
            <i class="fas fa-ruler"></i>
            <input type="text" name="talla" placeholder="Talla" value="${talla}" required>
        </div>
        <div class="stock-input">
            <i class="fas fa-box"></i>
            <input type="number" name="stock" placeholder="Stock" value="${stock}" min="0" required>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="action-button btn-eliminar">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar productos inicialmente
    cargarProductos();

    // Configurar el formulario de edición
    const formEdicion = document.getElementById('form-edicion');
    if (formEdicion) {
        formEdicion.addEventListener('submit', guardarEdicion);
    }

    // Configurar el botón de cerrar modal
    const cerrarModal = document.querySelector('.cerrar-modal');
    if (cerrarModal) {
        cerrarModal.onclick = cerrarModalEdicion;
    }

    // Cerrar modal al hacer clic fuera
    window.onclick = function(event) {
        const modal = document.getElementById('modal-edicion');
        if (event.target === modal) {
            cerrarModalEdicion();
        }
    }

    // Configurar el botón de agregar talla
    const btnAgregarTalla = document.getElementById('btn-agregar-talla');
    if (btnAgregarTalla) {
        btnAgregarTalla.onclick = () => agregarTallaEdicion();
    }
});

// Función para filtrar productos
function filtrarProductos() {
    const busqueda = buscadorInput.value.toLowerCase().trim();
    const categoria = filtroCategoria.value;
    const marca = filtroMarca.value;
    const precio = filtroPrecio.value;

    productosFiltrados = productos.filter(producto => {
        // Filtro por búsqueda
        const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda) ||
                                producto.marca.toLowerCase().includes(busqueda) ||
                                producto.categoria.toLowerCase().includes(busqueda);

        // Filtro por categoría
        const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;

        // Filtro por marca
        const coincideMarca = marca === 'todas' || producto.marca === marca;

        // Filtro por precio
        let coincidePrecio = true;
        if (precio !== 'todos') {
            const precioProducto = parseFloat(producto.precio);
            switch (precio) {
                case '0-5000':
                    coincidePrecio = precioProducto <= 5000;
                    break;
                case '5000-10000':
                    coincidePrecio = precioProducto > 5000 && precioProducto <= 10000;
                    break;
                case '10000-20000':
                    coincidePrecio = precioProducto > 10000 && precioProducto <= 20000;
                    break;
                case '20000+':
                    coincidePrecio = precioProducto > 20000;
                    break;
            }
        }

        return coincideBusqueda && coincideCategoria && coincideMarca && coincidePrecio;
    });

    paginaActual = 1; // Resetear a la primera página
    mostrarProductos();
    actualizarPaginacion();
}

// Función para limpiar filtros
function limpiarFiltros() {
    buscadorInput.value = '';
    filtroCategoria.value = 'todas';
    filtroMarca.value = 'todas';
    filtroPrecio.value = 'todos';
    filtrarProductos();
}

// Función debounce para optimizar el buscador
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para cargar las opciones de filtros
function cargarOpcionesFiltros() {
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const marcas = [...new Set(productos.map(p => p.marca))];

    // Cargar categorías
    filtroCategoria.innerHTML = '<option value="todas">Todas las categorías</option>';
    categorias.forEach(categoria => {
        filtroCategoria.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });

    // Cargar marcas
    filtroMarca.innerHTML = '<option value="todas">Todas las marcas</option>';
    marcas.forEach(marca => {
        filtroMarca.innerHTML += `<option value="${marca}">${marca}</option>`;
    });
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alerta alerta-error';
    alerta.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${mensaje}</span>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
} 