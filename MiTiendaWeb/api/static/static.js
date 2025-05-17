// Variables globales
let productos = [];
let productosFiltrados = [];
let productoEditando = null;
let paginaActual = 1;
const productosPorPagina = 32;

// Elementos del DOM
const productosContainer = document.getElementById('productos-container');
const buscadorInput = document.getElementById('buscador-input');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroMarca = document.getElementById('filtro-marca');
const filtroPrecio = document.getElementById('filtro-precio');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const modalEdicion = document.getElementById('modal-edicion');
const formEdicion = document.getElementById('form-edicion');
const cerrarModal = document.querySelector('.cerrar-modal');
const navButtons = document.querySelectorAll('.nav-button');
const sections = document.querySelectorAll('.dashboard-section');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const paginaActualSpan = document.getElementById('pagina-actual');
const totalPaginasSpan = document.getElementById('total-paginas');

// Funciones de navegación
function cambiarSeccion(seccionId) {
    // Actualizar botones
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === seccionId);
    });

    // Actualizar secciones
    sections.forEach(section => {
        section.classList.toggle('active', section.id === `${seccionId}-section`);
    });
}

// Funciones de utilidad
function mostrarMensaje(mensaje, tipo = 'info') {
    const iconos = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };

    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo}`;
    alerta.innerHTML = `
        <i class="${iconos[tipo]}"></i>
        <span>${mensaje}</span>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => {
        alerta.style.opacity = '0';
        alerta.style.transform = 'translateX(100%)';
        setTimeout(() => alerta.remove(), 300);
    }, 3000);
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(precio);
}

// Función para calcular el total de páginas
function calcularTotalPaginas() {
    return Math.ceil(productosFiltrados.length / productosPorPagina);
}

// Función para actualizar la paginación
function actualizarPaginacion() {
    const totalPaginas = calcularTotalPaginas();
    paginaActualSpan.textContent = paginaActual;
    totalPaginasSpan.textContent = totalPaginas;
    
    btnPrev.disabled = paginaActual === 1;
    btnNext.disabled = paginaActual === totalPaginas;
}

// Función para obtener los productos de la página actual
function obtenerProductosPagina() {
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    return productosFiltrados.slice(inicio, fin);
}

// Funciones de filtrado
function filtrarProductos() {
    const busqueda = buscadorInput.value.toLowerCase();
    const categoria = filtroCategoria.value;
    const marca = filtroMarca.value;
    const rangoPrecio = filtroPrecio.value;

    productosFiltrados = productos.filter(producto => {
        const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda);
        const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;
        const coincideMarca = marca === 'todas' || producto.marca === marca;
        
        let coincidePrecio = true;
        if (rangoPrecio !== 'todos') {
            const precio = producto.precio;
            switch(rangoPrecio) {
                case '0-5000':
                    coincidePrecio = precio < 5000;
                    break;
                case '5000-10000':
                    coincidePrecio = precio >= 5000 && precio < 10000;
                    break;
                case '10000-20000':
                    coincidePrecio = precio >= 10000 && precio < 20000;
                    break;
                case '20000+':
                    coincidePrecio = precio >= 20000;
                    break;
            }
        }

        return coincideBusqueda && coincideCategoria && coincideMarca && coincidePrecio;
    });

    // Resetear a la primera página al filtrar
    paginaActual = 1;
    mostrarProductos();
}

// Función para mostrar productos actualizada
function mostrarProductos() {
    const productosGrid = document.getElementById('productos');
    productosGrid.innerHTML = '';
    
    if (productosFiltrados.length === 0) {
        productosGrid.innerHTML = `
            <div class="no-productos">
                <i class="fas fa-box-open"></i>
                <p>No se encontraron productos</p>
            </div>
        `;
        actualizarPaginacion();
        return;
    }

    const productosPagina = obtenerProductosPagina();
    actualizarPaginacion();

    productosPagina.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <div class="producto-imagen-container">
                <img src="${producto.imagen || producto.img}" alt="${producto.nombre}" class="producto-imagen" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+imagen'">
                <div class="producto-overlay">
                    <button onclick="editarProducto(${producto.id})" class="action-button btn-editar">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                </div>
            </div>
            <div class="producto-info">
                <div class="producto-header">
                    <h3>${producto.nombre}</h3>
                    <span class="producto-marca">${producto.marca}</span>
                </div>
                <p class="producto-precio">${formatearPrecio(producto.precio)}</p>
                <p class="producto-categoria">${producto.categoria}</p>
                <div class="producto-tallas">
                    ${Object.entries(producto.tallas).map(([talla, stock]) => 
                        `<span class="talla-item ${stock > 0 ? 'en-stock' : 'sin-stock'}">
                            <i class="fas fa-ruler"></i>
                            ${talla}: ${stock}
                        </span>`
                    ).join(' ')}
                </div>
            </div>
            <div class="producto-acciones">
                <button onclick="editarProducto(${producto.id})" class="action-button btn-editar">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button onclick="eliminarProducto(${producto.id})" class="action-button btn-eliminar">
                    <i class="fas fa-trash"></i>
                    Eliminar
                </button>
            </div>
        `;
        productosGrid.appendChild(card);
    });
}

// Función para cargar productos
async function cargarProductos() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        productos = await response.json();
        productosFiltrados = [...productos];
        mostrarProductos();
        
        // Definir todas las categorías disponibles
        const categoriasDisponibles = ['Tenis', 'Ropa', 'Accesorios', 'Retail'];
        
        // Obtener marcas únicas
        const marcasDisponibles = [...new Set(productos.map(p => p.marca))];
        
        // Actualizar opciones de categorías en el filtro
        filtroCategoria.innerHTML = `
            <option value="todas">Todas las categorías</option>
            ${categoriasDisponibles.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        `;

        // Actualizar opciones de marcas en el filtro
        filtroMarca.innerHTML = `
            <option value="todas">Todas las marcas</option>
            ${marcasDisponibles.map(marca => `<option value="${marca}">${marca}</option>`).join('')}
        `;

        // Asegurarnos de que el select de nuevo producto también tenga todas las categorías
        const categoriaSelect = document.getElementById('categoria');
        if (categoriaSelect) {
            categoriaSelect.innerHTML = categoriasDisponibles.map(cat => 
                `<option value="${cat}">${cat}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar productos', 'error');
    }
}

// Funciones de edición
function editarProducto(id) {
    productoEditando = productos.find(p => p.id === id);
    if (!productoEditando) return;

    // Llenar el formulario
    document.getElementById('edit-nombre').value = productoEditando.nombre;
    document.getElementById('edit-marca').value = productoEditando.marca;
    document.getElementById('edit-precio').value = productoEditando.precio;
    document.getElementById('edit-categoria').value = productoEditando.categoria;
    document.getElementById('edit-imagen').value = productoEditando.imagen || productoEditando.img;
    
    // Mostrar imagen actual
    const preview = document.getElementById('edit-imagen-preview');
    preview.innerHTML = `<img src="${productoEditando.imagen || productoEditando.img}" alt="Vista previa" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+imagen'">`;
    
    // Llenar tallas
    const tallasContainer = document.getElementById('edit-tallas-container');
    tallasContainer.innerHTML = '';
    Object.entries(productoEditando.tallas).forEach(([talla, stock]) => {
        agregarTallaEdicion(talla, stock);
    });

    modalEdicion.style.display = 'block';
}

async function guardarEdicion(event) {
    event.preventDefault();
    if (!productoEditando) return;

    const tallas = {};
    document.querySelectorAll('#edit-tallas-container .talla-item').forEach(item => {
        const talla = item.querySelector('input[name="talla"]').value;
        const stock = parseInt(item.querySelector('input[name="stock"]').value);
        if (talla && !isNaN(stock)) {
            tallas[talla] = stock;
        }
    });

    const datosActualizados = {
        ...productoEditando,
        nombre: document.getElementById('edit-nombre').value,
        marca: document.getElementById('edit-marca').value,
        precio: parseFloat(document.getElementById('edit-precio').value),
        categoria: document.getElementById('edit-categoria').value,
        imagen: document.getElementById('edit-imagen').value,
        tallas
    };

    try {
        const response = await fetch(`/api/productos/${productoEditando.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });

        if (!response.ok) throw new Error('Error al actualizar el producto');

        const productoActualizado = await response.json();
        const index = productos.findIndex(p => p.id === productoEditando.id);
        productos[index] = productoActualizado;
        productosFiltrados = [...productos];
        
        mostrarProductos();
        cerrarModalEdicion();
        mostrarMensaje('Producto actualizado correctamente', 'success');
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al actualizar el producto', 'error');
    }
}

function cerrarModalEdicion() {
    modalEdicion.style.display = 'none';
    formEdicion.reset();
    productoEditando = null;
}

// Funciones para manejar tallas en edición
function agregarTallaEdicion(talla = '', stock = 0) {
    const container = document.getElementById('edit-tallas-container');
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
        <button type="button" onclick="eliminarTallaEdicion(this)" class="action-button btn-eliminar">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(div);
}

function eliminarTallaEdicion(button) {
    button.parentElement.remove();
}

// Funciones para manejar marcas
function actualizarSelectoresMarca(nuevaMarca) {
    const selectores = ['marca', 'edit-marca'];
    selectores.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        // Verificar si la marca ya existe
        const existe = Array.from(selector.options).some(option => 
            option.value.toLowerCase() === nuevaMarca.toLowerCase()
        );
        
        if (!existe) {
            // Insertar la nueva marca antes de la opción "otra"
            const optionOtra = Array.from(selector.options).find(opt => opt.value === 'otra');
            const nuevaOption = document.createElement('option');
            nuevaOption.value = nuevaMarca;
            nuevaOption.textContent = nuevaMarca;
            selector.insertBefore(nuevaOption, optionOtra);
        }
    });
}

function mostrarInputNuevaMarca(selectorId, containerId) {
    const selector = document.getElementById(selectorId);
    const container = document.getElementById(containerId);
    
    if (selector.value === 'otra') {
        container.style.display = 'block';
        selector.value = ''; // Resetear el valor del select
    } else {
        container.style.display = 'none';
    }
}

function agregarNuevaMarca(inputId, containerId, selectorId) {
    const input = document.getElementById(inputId);
    const nuevaMarca = input.value.trim();
    
    if (nuevaMarca) {
        actualizarSelectoresMarca(nuevaMarca);
        
        // Seleccionar la nueva marca en el selector correspondiente
        const selector = document.getElementById(selectorId);
        selector.value = nuevaMarca;
        
        // Limpiar y ocultar el input
        input.value = '';
        document.getElementById(containerId).style.display = 'none';
        
        mostrarMensaje('Marca agregada correctamente', 'success');
    } else {
        mostrarMensaje('Por favor ingresa una marca válida', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicialización de filtros con debounce
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const buscadorInput = document.getElementById('buscador-input');
    const filtroCategoria = document.getElementById('filtro-categoria');
    const filtroMarca = document.getElementById('filtro-marca');
    const filtroPrecio = document.getElementById('filtro-precio');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

    if (buscadorInput && filtroCategoria && filtroMarca && filtroPrecio && btnLimpiarFiltros) {
        buscadorInput.addEventListener('input', debounce(filtrarProductos, 300));
        filtroCategoria.addEventListener('change', filtrarProductos);
        filtroMarca.addEventListener('change', filtrarProductos);
        filtroPrecio.addEventListener('change', filtrarProductos);

        btnLimpiarFiltros.addEventListener('click', () => {
            buscadorInput.value = '';
            filtroCategoria.value = 'todas';
            filtroMarca.value = 'todas';
            filtroPrecio.value = 'todos';
            filtrarProductos();
            mostrarMensaje("Filtros limpiados", "info");
        });
    }

    // Cargar productos iniciales
    cargarProductos();
    
    // Navegación entre secciones con animación
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const seccionId = btn.dataset.section;
            cambiarSeccion(seccionId);
            
            // Actualizar URL sin recargar la página
            history.pushState(null, '', `#${seccionId}`);
        });
    });

    // Manejar navegación con el historial
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.slice(1) || 'productos';
        cambiarSeccion(hash);
    });

    // Inicializar sección basada en el hash de la URL
    const hash = window.location.hash.slice(1) || 'productos';
    cambiarSeccion(hash);
    
    // Modal de edición mejorado
    const modalEdicion = document.getElementById('modal-edicion');
    const formEdicion = document.getElementById('form-edicion');
    const cerrarModal = document.querySelector('.cerrar-modal');
    
    if (modalEdicion && formEdicion && cerrarModal) {
        cerrarModal.addEventListener('click', cerrarModalEdicion);
        
        window.addEventListener('click', (e) => {
            if (e.target === modalEdicion) {
                cerrarModalEdicion();
            }
        });

        formEdicion.addEventListener('submit', guardarEdicion);
    }

    // Event Listeners para la paginación
    btnPrev.addEventListener('click', () => irAPagina(paginaActual - 1));
    btnNext.addEventListener('click', () => irAPagina(paginaActual + 1));
});

document.getElementById("producto-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", document.getElementById("nombre").value.trim());
    formData.append("marca", document.getElementById("marca").value.trim());
    formData.append("precio", document.getElementById("precio").value.trim());
    formData.append("categoria", document.getElementById("categoria").value.trim());
    formData.append("tallas", JSON.stringify(obtenerTallas()));

    const imagenSeleccionada = document.querySelector("input[name='imagenSeleccionada']");
    if (imagenSeleccionada) {
        formData.append("img", imagenSeleccionada.value);
    } else {
        const imagenArchivo = document.getElementById("imagen").files[0];
        if (imagenArchivo) {
            formData.append("img", imagenArchivo);
        } else {
            alert("Por favor, selecciona o sube una imagen antes de guardar el producto.");
            return;
        }
    }

    fetch("/api/productos", {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.mensaje) {
                alert(data.mensaje);
                document.getElementById("producto-form").reset();
                document.getElementById("tallas-container").innerHTML = "";
                cargarProductos();
            }
        })
        .catch((error) => {
            console.error("Error al guardar producto:", error);
            alert("Error al guardar el producto. Por favor, intenta nuevamente.");
        });
});

document.getElementById("add-talla").addEventListener("click", () => {
    const container = document.getElementById("tallas-container");
    const div = document.createElement("div");
    div.innerHTML = `
        <input type="text" placeholder="Talla" class="talla" required>
        <input type="number" placeholder="Stock" class="stock" required>
        <button type="button" class="action-button delete-button" onclick="this.parentElement.remove()">Eliminar talla</button>
    `;
    container.appendChild(div);
});

function obtenerTallas() {
    const tallas = {};
    document.querySelectorAll(".talla").forEach((input, index) => {
        const stock = document.querySelectorAll(".stock")[index].value;
        if (input.value && stock) {
            tallas[input.value] = parseInt(stock, 10);
        }
    });
    return tallas;
}

// Función para manejar la búsqueda de imágenes mejorada
document.getElementById("buscar-imagenes").addEventListener("click", async function () {
    if (!validarConfiguracion()) {
        mostrarMensaje("La configuración de la API no está completa. Por favor, contacta al administrador.", "error");
        return;
    }

    const nombreProducto = document.getElementById("nombre").value;
    const imagenesOpciones = document.getElementById("imagenes-opciones");
    const imagenesResultados = document.getElementById("imagenes-resultados");

    if (!nombreProducto) {
        mostrarMensaje("Por favor, escribe un nombre para el producto.", "error");
        return;
    }

    // Mostrar indicador de carga
    imagenesOpciones.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Buscando imágenes...</p>
        </div>
    `;
    imagenesResultados.style.display = "block";

    try {
        const query = `StockX ${nombreProducto}`;
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${API_CONFIG.cx}&key=${API_CONFIG.apiKey}&searchType=${API_CONFIG.searchType}`);
        
        if (!response.ok) {
            throw new Error(`Error de la API: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error("No se encontraron imágenes");
        }

        imagenesOpciones.innerHTML = "";
        const imagenes = data.items.slice(0, API_CONFIG.maxResults);
        
        imagenes.forEach((imagen, index) => {
            const imgContainer = document.createElement("div");
            imgContainer.className = "imagen-opcion";
            
            const imgElement = document.createElement("img");
            imgElement.src = imagen.link;
            imgElement.alt = `Opción ${index + 1}`;
            imgElement.loading = "lazy";

            imgElement.addEventListener("click", () => seleccionarImagen(imagen.link));
            
            imgContainer.appendChild(imgElement);
            imagenesOpciones.appendChild(imgContainer);
        });

    } catch (error) {
        console.error("Error:", error);
        imagenesOpciones.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-circle"></i>
                <p>${error.message}</p>
            </div>
        `;
    }
});

// Función para seleccionar imagen mejorada
function seleccionarImagen(url) {
    const inputHidden = document.querySelector('input[name="imagenSeleccionada"]') || 
        (() => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = "imagenSeleccionada";
            document.getElementById("producto-form").appendChild(input);
            return input;
        })();
    
    inputHidden.value = url;
    
    mostrarMensaje("Imagen seleccionada correctamente", "success");
    
    const imagenesResultados = document.getElementById("imagenes-resultados");
    setTimeout(() => {
        imagenesResultados.style.display = "none";
    }, 1000);
}

// Función para navegar a una página específica
function irAPagina(pagina) {
    const totalPaginas = calcularTotalPaginas();
    if (pagina >= 1 && pagina <= totalPaginas) {
        paginaActual = pagina;
        mostrarProductos();
        // Scroll suave hacia arriba
        window.scrollTo({
            top: productosContainer.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

