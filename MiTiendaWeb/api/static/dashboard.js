// Funciones para manejar la navegación y modales
function mostrarModalAgregar() {
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    // Mostrar la sección de nuevo producto
    document.getElementById('nuevo-producto-section').classList.add('active');
}

function mostrarModalCategorias() {
    // TODO: Implementar modal de categorías
    alert('Funcionalidad de categorías en desarrollo');
}

function mostrarSeccionPedidos() {
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    // Mostrar la sección de pedidos
    document.getElementById('pedidos-section').classList.add('active');
    // Cargar pedidos si es necesario
    if (typeof cargarPedidos === 'function') {
        cargarPedidos();
    }
}

// Función para volver a la sección de productos
function volverAProductos() {
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('productos-section').classList.add('active');
}

// Configurar eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el botón de limpiar filtros
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener('click', function() {
            document.getElementById('buscador-input').value = '';
            document.getElementById('filtro-categoria').value = 'todas';
            document.getElementById('filtro-marca').value = 'todas';
            document.getElementById('filtro-precio').value = 'todos';
            if (typeof cargarProductos === 'function') {
                cargarProductos();
            }
        });
    }

    // Configurar el buscador
    const buscadorInput = document.getElementById('buscador-input');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', function() {
            if (typeof filtrarProductos === 'function') {
                filtrarProductos();
            }
        });
    }

    // Configurar los selectores de filtro
    const filtros = ['filtro-categoria', 'filtro-marca', 'filtro-precio'];
    filtros.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', function() {
                if (typeof filtrarProductos === 'function') {
                    filtrarProductos();
                }
            });
        }
    });

    // Función para actualizar el campo de imagen
    function actualizarCampoImagen(url) {
        const imagenInput = document.getElementById('imagen');
        if (imagenInput) {
            imagenInput.value = url;
            // Mostrar vista previa
            const preview = document.getElementById('imagen-preview');
            if (preview) {
                preview.innerHTML = `<img src="${url}" alt="Vista previa" onerror="this.src='/static/img/no-image.svg'">`;
            }
        }
    }

    // Agregar evento al botón de buscar imágenes
    const buscarImagenesBtn = document.getElementById('buscar-imagenes');
    if (buscarImagenesBtn) {
        buscarImagenesBtn.addEventListener('click', function() {
            const imagenesResultados = document.getElementById('imagenes-resultados');
            if (imagenesResultados) {
                imagenesResultados.style.display = 'block';
            }
        });
    }

    // Modificar la función de selección de imagen
    window.seleccionarImagen = function(url) {
        actualizarCampoImagen(url);
        const imagenesResultados = document.getElementById('imagenes-resultados');
        if (imagenesResultados) {
            imagenesResultados.style.display = 'none';
        }
        mostrarNotificacion('Imagen seleccionada correctamente', 'success');
    };

    // Configurar el formulario de nuevo producto
    const formProducto = document.getElementById('producto-form');
    if (formProducto) {
        formProducto.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const tallas = {};
            document.querySelectorAll('#tallas-container .talla-item').forEach(item => {
                const talla = item.querySelector('input[name="talla"]').value;
                const stock = parseInt(item.querySelector('input[name="stock"]').value);
                if (talla && !isNaN(stock)) {
                    tallas[talla] = stock;
                }
            });

            const imagenUrl = document.getElementById('imagen').value;
            if (!imagenUrl) {
                mostrarNotificacion('Por favor, selecciona una imagen para el producto', 'error');
                return;
            }

            const producto = {
                nombre: document.getElementById('nombre').value,
                marca: document.getElementById('marca').value,
                precio: parseFloat(document.getElementById('precio').value),
                categoria: document.getElementById('categoria').value,
                img: imagenUrl,
                tallas: tallas
            };

            try {
                const response = await fetch('/api/productos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(producto)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al crear el producto');
                }

                const nuevoProducto = await response.json();
                if (typeof cargarProductos === 'function') {
                    cargarProductos();
                }
                volverAProductos();
                mostrarNotificacion('Producto creado exitosamente', 'success');
                formProducto.reset();
                // Limpiar vista previa de imagen
                const preview = document.getElementById('imagen-preview');
                if (preview) {
                    preview.innerHTML = '';
                }
            } catch (error) {
                console.error('Error:', error);
                mostrarNotificacion(error.message || 'Error al crear el producto', 'error');
            }
        });
    }

    // Configurar el botón de agregar talla
    const btnAgregarTalla = document.getElementById('add-talla');
    if (btnAgregarTalla) {
        btnAgregarTalla.addEventListener('click', function() {
            const container = document.getElementById('tallas-container');
            const div = document.createElement('div');
            div.className = 'talla-item';
            div.innerHTML = `
                <div class="talla-input">
                    <i class="fas fa-ruler"></i>
                    <input type="text" name="talla" placeholder="Talla" required>
                </div>
                <div class="stock-input">
                    <i class="fas fa-box"></i>
                    <input type="number" name="stock" placeholder="Stock" min="0" required>
                </div>
                <button type="button" onclick="this.parentElement.remove()" class="action-button btn-eliminar">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(div);
        });
    }

    // Lógica para mostrar/ocultar campo de nueva marca y agregarla
    const selectMarca = document.getElementById('marca');
    const nuevaMarcaContainer = document.getElementById('nueva-marca-container');
    const nuevaMarcaInput = document.getElementById('nueva-marca');
    const agregarMarcaBtn = document.getElementById('agregar-marca');

    if (selectMarca && nuevaMarcaContainer && nuevaMarcaInput && agregarMarcaBtn) {
        selectMarca.addEventListener('change', function() {
            if (this.value === 'otra') {
                nuevaMarcaContainer.style.display = 'flex';
                nuevaMarcaInput.focus();
            } else {
                nuevaMarcaContainer.style.display = 'none';
                nuevaMarcaInput.value = '';
            }
        });

        agregarMarcaBtn.addEventListener('click', function() {
            const nuevaMarca = nuevaMarcaInput.value.trim();
            if (nuevaMarca) {
                // Verifica que no exista ya la marca
                let existe = false;
                for (let i = 0; i < selectMarca.options.length; i++) {
                    if (selectMarca.options[i].value.toLowerCase() === nuevaMarca.toLowerCase()) {
                        existe = true;
                        break;
                    }
                }
                if (!existe) {
                    // Crea la nueva opción y la selecciona
                    const option = document.createElement('option');
                    option.value = nuevaMarca;
                    option.textContent = nuevaMarca;
                    // Inserta antes de la opción 'otra'
                    selectMarca.insertBefore(option, selectMarca.querySelector('option[value="otra"]'));
                    selectMarca.value = nuevaMarca;
                } else {
                    selectMarca.value = nuevaMarca;
                }
                nuevaMarcaContainer.style.display = 'none';
                nuevaMarcaInput.value = '';
            }
        });
    }

    const modal = document.getElementById('modal-pedido');
    const cerrar = document.querySelector('#modal-pedido .cerrar-modal');
    if (cerrar && modal) {
        cerrar.onclick = function() {
            modal.style.display = 'none';
            modal.classList.remove('active');
        };
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        };
    }
});

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.textContent = mensaje;
    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.remove();
    }, 3000);
}

// Estado global para pedidos
let pedidos = [];
let pedidosFiltrados = [];
let paginaActualPedidos = 1;
const pedidosPorPagina = 10;

// Si no hay backend, usar localStorage como fallback
async function cargarPedidos() {
    try {
        let pedidosLocal = localStorage.getItem('pedidos');
        if (pedidosLocal) {
            pedidos = JSON.parse(pedidosLocal);
            pedidosFiltrados = [...pedidos];
            actualizarResumenPedidos();
            actualizarTablaPedidos();
            actualizarPaginacionPedidos();
            console.log('Pedidos cargados desde localStorage:', pedidos);
            return;
        }
        // Si no hay en localStorage, intentar cargar del backend
        const response = await fetch('/api/pedidos');
        pedidos = await response.json();
        pedidosFiltrados = [...pedidos];
        actualizarResumenPedidos();
        actualizarTablaPedidos();
        actualizarPaginacionPedidos();
        console.log('Pedidos cargados desde backend:', pedidos);
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarNotificacion('Error al cargar los pedidos', 'error');
    }
}

// Actualizar resumen de pedidos
function actualizarResumenPedidos() {
    const totalPedidos = pedidos.length;
    const pedidosPendientes = pedidos.filter(p => p.estado === 'pending' || !p.estado).length;
    let ingresosTotales = 0;

    pedidos.forEach(pedido => {
        let monto = 0;
        if (typeof pedido.total === 'number') {
            monto = pedido.total;
        } else if (typeof pedido.total === 'string') {
            monto = parseFloat(pedido.total.replace(/[^0-9.-]+/g, ''));
        }
        ingresosTotales += isNaN(monto) ? 0 : monto;
    });

    document.getElementById('total-pedidos').textContent = totalPedidos;
    document.getElementById('pedidos-pendientes').textContent = pedidosPendientes;
    document.getElementById('ingresos-totales').textContent = `$${ingresosTotales.toFixed(2)} MXN`;
}

// Actualizar tabla de pedidos
function actualizarTablaPedidos() {
    const inicio = (paginaActualPedidos - 1) * pedidosPorPagina;
    const fin = inicio + pedidosPorPagina;
    const pedidosPaginados = pedidosFiltrados.slice(inicio, fin);

    const tbody = document.getElementById('pedidos-tabla-body');
    tbody.innerHTML = pedidosPaginados.map(pedido => {
        const numPedido = pedido.numeroPedido || pedido.numero_pedido;
        return `
            <tr>
                <td>${numPedido}</td>
                <td>${new Date(pedido.fecha).toLocaleString('es-MX')}</td>
                <td>${pedido.cliente.nombre}</td>
                <td>${pedido.total}</td>
                <td>
                    <span class="estado-badge estado-${pedido.estado || 'pending'}">
                        ${obtenerEstadoTexto(pedido.estado)}
                    </span>
                </td>
                <td>${pedido.entrega.metodo === 'pickup' ? 'Pickup en Tienda' : 'Envío a Domicilio'}</td>
                <td>
                    <div class="acciones-pedido">
                        <button class="btn-accion btn-ver" onclick="verDetallesPedido('${numPedido}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-accion btn-editar" onclick="editarEstadoPedido('${numPedido}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarPedido('${numPedido}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Actualizar paginación de pedidos
function actualizarPaginacionPedidos() {
    const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
    const paginaActualElem = document.getElementById('pagina-actual-pedidos');
    const totalPaginasElem = document.getElementById('total-paginas-pedidos');
    const btnPrev = document.getElementById('btn-prev-pedidos');
    const btnNext = document.getElementById('btn-next-pedidos');

    if (paginaActualElem) paginaActualElem.textContent = paginaActualPedidos;
    if (totalPaginasElem) totalPaginasElem.textContent = totalPaginas;

    if (btnPrev) {
        btnPrev.disabled = paginaActualPedidos === 1;
        btnPrev.onclick = () => {
            if (paginaActualPedidos > 1) {
                paginaActualPedidos--;
                actualizarTablaPedidos();
                actualizarPaginacionPedidos();
            }
        };
    }

    if (btnNext) {
        btnNext.disabled = paginaActualPedidos === totalPaginas;
        btnNext.onclick = () => {
            if (paginaActualPedidos < totalPaginas) {
                paginaActualPedidos++;
                actualizarTablaPedidos();
                actualizarPaginacionPedidos();
            }
        };
    }
}

// Ver detalles del pedido
function verDetallesPedido(numeroPedido) {
    console.log('Abriendo modal para pedido:', numeroPedido);
    const numerosPedidos = pedidos.map(p => p.numeroPedido || p.numero_pedido);
    console.log('Números de pedido disponibles:', numerosPedidos);
    if (pedidos.length > 0) {
        console.log('Primer pedido:', pedidos[0]);
    }
    const pedido = pedidos.find(p => 
        String(p.numero_pedido || p.numeroPedido).trim() === String(numeroPedido).trim()
    );
    if (!pedido) return;

    const modal = document.getElementById('modal-pedido');
    const detalles = document.getElementById('detalles-pedido');

    // Dirección
    let direccionHTML = '';
    if (pedido.entrega.metodo === 'pickup') {
        direccionHTML = `<p><strong>Método:</strong> Pickup en Tienda</p><p><strong>Ubicación:</strong> ${obtenerUbicacionPickup(pedido.entrega.direccion)}</p>`;
    } else if (typeof pedido.entrega.direccion === 'object') {
        direccionHTML = `
            <p><strong>Método:</strong> Envío a Domicilio</p>
            <p><strong>Dirección:</strong> ${pedido.entrega.direccion.calle}</p>
            <p><strong>Ciudad:</strong> ${pedido.entrega.direccion.ciudad}</p>
            <p><strong>Estado:</strong> ${pedido.entrega.direccion.estado}</p>
            <p><strong>Código Postal:</strong> ${pedido.entrega.direccion.cp}</p>
        `;
    } else {
        direccionHTML = `<p><strong>Dirección:</strong> ${pedido.entrega.direccion}</p>`;
    }

    // Productos
    const productosHTML = pedido.items.map(item => `
        <div class="item-pedido" style="display:flex;gap:1rem;align-items:center;background:#222;padding:10px;border-radius:8px;margin-bottom:10px;">
            <img src="${item.imagen || item.img || '../images/file.png'}" alt="${item.nombre}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;background:#fff;">
            <div style="flex:1;">
                <h4 style="margin:0 0 5px 0;color:#fff;">${item.nombre}</h4>
                <p style="margin:0;color:#ccc;">Talla: <strong>${item.tallaSeleccionada || '-'}</strong></p>
                <p style="margin:0;color:#ccc;">Cantidad: <strong>${item.cantidad || 1}</strong></p>
                <p style="margin:0;color:#ccc;">Precio: <strong>$${item.precio ? item.precio.toLocaleString('es-MX') : ''} MXN</strong></p>
                <p style="margin:0;color:#ccc;">Subtotal: <strong>$${((item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-MX')} MXN</strong></p>
            </div>
        </div>
    `).join('');

    detalles.innerHTML = `
        <div class="detalle-seccion">
            <h3>Información del Pedido</h3>
            <p><strong>Número de Pedido:</strong> ${pedido.numeroPedido || pedido.numero_pedido}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString('es-MX')}</p>
            <p><strong>Estado:</strong> ${obtenerEstadoTexto(pedido.estado)}</p>
            <p><strong>Total:</strong> $${pedido.total.toLocaleString('es-MX')} MXN</p>
        </div>
        <div class="detalle-seccion">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${pedido.cliente.nombre}</p>
            <p><strong>Email:</strong> ${pedido.cliente.email}</p>
            <p><strong>Teléfono:</strong> ${pedido.cliente.telefono}</p>
        </div>
        <div class="detalle-seccion">
            <h3>Información de Entrega</h3>
            ${direccionHTML}
        </div>
        <div class="detalle-seccion">
            <h3>Productos</h3>
            <div class="items-pedido">
                ${productosHTML}
            </div>
        </div>
    `;

    modal.style.display = 'block';
    modal.classList.add('active');
}

// Editar estado del pedido
async function editarEstadoPedido(numeroPedido) {
    const pedido = pedidos.find(p => (p.numeroPedido || p.numero_pedido) === numeroPedido);
    if (!pedido) return;

    const nuevoEstado = prompt(
        'Selecciona el nuevo estado del pedido:\n' +
        '1. Pendiente\n' +
        '2. En proceso\n' +
        '3. Completado\n' +
        '4. Cancelado',
        obtenerEstadoTexto(pedido.estado)
    );

    if (nuevoEstado) {
        const estados = {
            'Pendiente': 'pending',
            'En proceso': 'processing',
            'Completado': 'completed',
            'Cancelado': 'cancelled'
        };

        const estadoSeleccionado = estados[nuevoEstado];
        if (estadoSeleccionado) {
            try {
                const response = await fetch(`/api/pedidos/${numeroPedido}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ estado: estadoSeleccionado })
                });

                if (response.ok) {
                    pedido.estado = estadoSeleccionado;
                    actualizarTablaPedidos();
                    actualizarResumenPedidos();
                    mostrarNotificacion('Estado del pedido actualizado', 'success');
                } else {
                    throw new Error('Error al actualizar el estado');
                }
            } catch (error) {
                console.error('Error al actualizar el estado:', error);
                mostrarNotificacion('Error al actualizar el estado del pedido', 'error');
            }
        }
    }
}

// Eliminar pedido
async function eliminarPedido(numeroPedido) {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
        try {
            const response = await fetch(`/api/pedidos/${numeroPedido}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                pedidos = pedidos.filter(p => (p.numeroPedido || p.numero_pedido) !== numeroPedido);
                pedidosFiltrados = pedidosFiltrados.filter(p => (p.numeroPedido || p.numero_pedido) !== numeroPedido);
                actualizarTablaPedidos();
                actualizarResumenPedidos();
                actualizarPaginacionPedidos();
                mostrarNotificacion('Pedido eliminado exitosamente', 'success');
            } else {
                throw new Error('Error al eliminar el pedido');
            }
        } catch (error) {
            console.error('Error al eliminar el pedido:', error);
            mostrarNotificacion('Error al eliminar el pedido', 'error');
        }
    }
}

// Inicializar filtros de pedidos
function inicializarFiltrosPedidos() {
    const buscador = document.getElementById('pedidos-buscador');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroFechaDesde = document.getElementById('filtro-fecha-desde');
    const filtroFechaHasta = document.getElementById('filtro-fecha-hasta');
    const btnLimpiar = document.getElementById('btn-limpiar-filtros-pedidos');

    // Función para aplicar filtros
    const aplicarFiltros = () => {
        const busqueda = buscador.value.toLowerCase();
        const estado = filtroEstado.value;
        const fechaDesde = filtroFechaDesde.value ? new Date(filtroFechaDesde.value) : null;
        const fechaHasta = filtroFechaHasta.value ? new Date(filtroFechaHasta.value) : null;

        pedidosFiltrados = pedidos.filter(pedido => {
            const numPedido = pedido.numeroPedido || pedido.numero_pedido;
            const coincideBusqueda = numPedido && numPedido.toLowerCase().includes(busqueda);
            const coincideEstado = estado === 'todos' || pedido.estado === estado;
            const fechaPedido = new Date(pedido.fecha);
            const coincideFecha = (!fechaDesde || fechaPedido >= fechaDesde) &&
                                (!fechaHasta || fechaPedido <= fechaHasta);

            return coincideBusqueda && coincideEstado && coincideFecha;
        });

        paginaActualPedidos = 1;
        actualizarTablaPedidos();
        actualizarPaginacionPedidos();
    };

    // Event listeners para los filtros
    buscador.addEventListener('input', aplicarFiltros);
    filtroEstado.addEventListener('change', aplicarFiltros);
    filtroFechaDesde.addEventListener('change', aplicarFiltros);
    filtroFechaHasta.addEventListener('change', aplicarFiltros);

    // Limpiar filtros
    btnLimpiar.addEventListener('click', () => {
        buscador.value = '';
        filtroEstado.value = 'todos';
        filtroFechaDesde.value = '';
        filtroFechaHasta.value = '';
        aplicarFiltros();
    });
}

// Utilidades
function obtenerEstadoTexto(estado) {
    const estados = {
        'pending': 'Pendiente',
        'processing': 'En proceso',
        'completed': 'Completado',
        'cancelled': 'Cancelado'
    };
    return estados[estado] || 'Pendiente';
}

function obtenerUbicacionPickup(locationId) {
    const ubicaciones = {
        'san-patricio': 'Avenida Batallón De San Patricio #1000, Residencial San Agustín, Zona San Agustín, 66260 Monterrey, N.L.',
        'insurgentes': 'Av Insurgentes 2500, Sin Nombre de Col 31, 64620 Monterrey, N.L.'
    };
    return ubicaciones[locationId] || locationId;
}

window.verDetallesPedido = verDetallesPedido;
window.editarEstadoPedido = editarEstadoPedido;
window.eliminarPedido = eliminarPedido; 