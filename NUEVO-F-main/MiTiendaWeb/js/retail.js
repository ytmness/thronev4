// Variables globales
let productosPorPagina = 14;
let paginaActual = 1;
let productosRetail = [];
let productosFiltrados = [];

// Función para generar los filtros dinámicamente
function generarFiltros() {
    // Obtener marcas únicas
    const marcas = [...new Set(productosRetail.map(p => p.marca))].sort();
    const marcasContainer = document.querySelector('.facet-group[data-tipo="marca"] .facet-values');
    marcasContainer.innerHTML = `
        <button class="facet-value active" data-valor="" data-tipo="marca">
            <span class="facet-checkbox"></span>
            <span class="facet-label">Todas las marcas</span>
            <span class="facet-count">${productosRetail.length}</span>
        </button>
        ${marcas.map(marca => {
            const count = productosRetail.filter(p => p.marca === marca).length;
            return `
                <button class="facet-value" data-valor="${marca}" data-tipo="marca">
                    <span class="facet-checkbox"></span>
                    <span class="facet-label">${marca}</span>
                    <span class="facet-count">${count}</span>
                </button>
            `;
        }).join('')}
    `;

    // Obtener rangos de precios
    const precios = [...new Set(productosRetail.map(p => p.precio))].sort((a, b) => a - b);
    const preciosContainer = document.querySelector('.facet-group[data-tipo="precio"] .facet-values');
    preciosContainer.innerHTML = `
        <button class="facet-value active" data-valor="" data-tipo="precio">
            <span class="facet-checkbox"></span>
            <span class="facet-label">Todos los precios</span>
            <span class="facet-count">${productosRetail.length}</span>
        </button>
        ${precios.map(precio => {
            const count = productosRetail.filter(p => p.precio === precio).length;
            return `
                <button class="facet-value" data-valor="${precio}" data-tipo="precio">
                    <span class="facet-checkbox"></span>
                    <span class="facet-label">$${precio.toLocaleString('es-MX')}</span>
                    <span class="facet-count">${count}</span>
                </button>
            `;
        }).join('')}
    `;

    // Obtener tallas únicas - Solo para productos que tienen tallas
    const productosConTallas = productosRetail.filter(p => Array.isArray(p.tallas) && p.tallas.length > 0);
    if (productosConTallas.length > 0) {
        const tallas = [...new Set(productosConTallas.flatMap(p => p.tallas))].sort();
        const tallasContainer = document.querySelector('.facet-group[data-tipo="talla"] .facet-values');
        tallasContainer.innerHTML = `
            <button class="facet-value active" data-valor="" data-tipo="talla">
                <span class="facet-checkbox"></span>
                <span class="facet-label">Todas las tallas</span>
                <span class="facet-count">${productosConTallas.length}</span>
            </button>
            ${tallas.map(talla => {
                const count = productosConTallas.filter(p => p.tallas.includes(talla)).length;
                return `
                    <button class="facet-value" data-valor="${talla}" data-tipo="talla">
                        <span class="facet-checkbox"></span>
                        <span class="facet-label">${talla}</span>
                        <span class="facet-count">${count}</span>
                    </button>
                `;
            }).join('')}
        `;
    } else {
        // Si no hay productos con tallas, ocultar la sección de tallas
        const tallasGroup = document.querySelector('.facet-group[data-tipo="talla"]');
        if (tallasGroup) {
            tallasGroup.style.display = 'none';
        }
    }

    // Agregar event listeners a los botones de filtro
    agregarEventListenersFiltros();
}

// Función para agregar event listeners a los botones de filtro
function agregarEventListenersFiltros() {
    const facetValues = document.querySelectorAll('.facet-value');
    facetValues.forEach(button => {
        button.addEventListener('click', () => {
            const group = button.closest('.facet-group');
            const groupValues = group.querySelectorAll('.facet-value');
            const allButton = group.querySelector('[data-valor=""]');
            
            // Si se hace clic en "Todos"
            if (button.dataset.valor === '') {
                groupValues.forEach(v => v.classList.remove('active'));
                if (!button.classList.contains('active')) {
                    button.classList.add('active');
                }
                return;
            }
            
            // Si se hace clic en un filtro específico
            if (allButton) {
                allButton.classList.remove('active');
            }
            
            button.classList.toggle('active');
            
            // Si no hay filtros activos, activar "Todos"
            const hasActive = Array.from(groupValues).some(v => v.classList.contains('active'));
            if (!hasActive && allButton) {
                allButton.classList.add('active');
            }
            
            actualizarContadoresFiltros();
        });
    });
}

// Función para inicializar los grupos de filtros
function inicializarGruposFiltros() {
    const grupos = document.querySelectorAll('.facet-group');
    grupos.forEach(grupo => {
        const titulo = grupo.querySelector('.facet-group__title');
        const contenido = grupo.querySelector('.facet-group__content');
        
        // Inicialmente expandido
        titulo.setAttribute('aria-expanded', 'true');
        contenido.classList.add('active');
        
        titulo.addEventListener('click', () => {
            const isExpanded = titulo.getAttribute('aria-expanded') === 'true';
            titulo.setAttribute('aria-expanded', !isExpanded);
            contenido.classList.toggle('active');
        });
    });
}

// Función para actualizar los contadores de filtros
function actualizarContadoresFiltros() {
    const facetValues = document.querySelectorAll('.facet-value');
    facetValues.forEach(button => {
        const valor = button.dataset.valor;
        const tipo = button.dataset.tipo;
        let count;

        if (valor === '') {
            count = productosFiltrados.length;
        } else if (tipo === 'marca') {
            count = productosFiltrados.filter(p => p.marca === valor).length;
        } else if (tipo === 'precio') {
            count = productosFiltrados.filter(p => p.precio === parseFloat(valor)).length;
        } else if (tipo === 'talla') {
            const productosConTallas = productosFiltrados.filter(p => Array.isArray(p.tallas) && p.tallas.length > 0);
            count = productosConTallas.filter(p => p.tallas.includes(valor)).length;
        }

        const countElement = button.querySelector('.facet-count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Función para aplicar los filtros
function aplicarFiltros() {
    const filtrosActivos = {
        marcas: Array.from(document.querySelectorAll('.facet-value[data-tipo="marca"].active')).map(el => el.dataset.valor),
        precios: Array.from(document.querySelectorAll('.facet-value[data-tipo="precio"].active')).map(el => el.dataset.valor),
        tallas: Array.from(document.querySelectorAll('.facet-value[data-tipo="talla"].active')).map(el => el.dataset.valor)
    };

    productosFiltrados = productosRetail.filter(producto => {
        const cumpleMarca = filtrosActivos.marcas.includes('') || filtrosActivos.marcas.includes(producto.marca);
        const cumplePrecio = filtrosActivos.precios.includes('') || filtrosActivos.precios.includes(producto.precio.toString());
        
        // Solo aplicar filtro de tallas si el producto tiene tallas y hay filtros de talla activos
        const tieneTallas = Array.isArray(producto.tallas) && producto.tallas.length > 0;
        const cumpleTalla = !tieneTallas || filtrosActivos.tallas.includes('') || 
            producto.tallas.some(talla => filtrosActivos.tallas.includes(talla));

        return cumpleMarca && cumplePrecio && cumpleTalla;
    });

    paginaActual = 1;
    mostrarProductos();
    actualizarPaginacion();
    actualizarContadorProductos();
    cerrarFiltros();
}

// Función para limpiar los filtros
function limpiarFiltros() {
    document.querySelectorAll('.facet-value').forEach(button => {
        button.classList.remove('active');
    });
    
    // Activar el botón "Todos" en cada grupo
    document.querySelectorAll('.facet-group').forEach(grupo => {
        const allButton = grupo.querySelector('[data-valor=""]');
        if (allButton) {
            allButton.classList.add('active');
        }
    });
    
    productosFiltrados = [...productosRetail];
    paginaActual = 1;
    mostrarProductos();
    actualizarPaginacion();
    actualizarContadorProductos();
    cerrarFiltros();
}

// Función para ver detalles del producto
async function verDetalles(productoId) {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        const producto = productos.find(p => (p._id || p.id_original || p.id) === productoId);
        
        if (producto) {
            localStorage.setItem('producto', JSON.stringify(producto));
            window.location.href = 'producto.html';
        } else {
            alert("Producto no encontrado.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("Error al cargar el producto.");
    }
}

// Función para mostrar los productos
function mostrarProductos() {
    const grid = document.getElementById('productos-grid');
    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPaginados = productosFiltrados.slice(inicio, fin);

    if (productosFiltrados.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3 style="color: #666; margin-bottom: 10px;">No se encontraron productos</h3>
                <p style="color: #888;">No hay productos que coincidan con los filtros seleccionados.</p>
                <button onclick="limpiarFiltros()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #000;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                ">Limpiar filtros</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = productosPaginados.map(producto => {
        // Asegurarnos de que el ID existe y es válido
        const productoId = producto.id || producto._id || '';
        if (!productoId) {
            console.error('Producto sin ID:', producto);
            return '';
        }
        
        // Usar el campo img en lugar de imagen
        const imagenUrl = producto.img || '';
        
        return `
            <div class="product-item" data-id="${productoId}" onclick="verDetalles(${productoId})">
                <img src="${imagenUrl}" alt="${producto.nombre || 'Producto'}" onerror="this.src='../images/placeholder.jpg'">
                <h3>${producto.nombre || 'Sin nombre'}</h3>
                <p>$${(producto.precio || 0).toLocaleString('es-MX')}</p>
            </div>
        `;
    }).join('');
}

// Función para actualizar la paginación
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    const paginacion = document.getElementById('paginacion');
    
    if (totalPaginas <= 1) {
        paginacion.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botón anterior
    html += `
        <button class="pagination-button" ${paginaActual === 1 ? 'disabled' : ''} data-pagina="${paginaActual - 1}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6"/>
            </svg>
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
                <button class="pagination-button ${i === paginaActual ? 'active' : ''}" data-pagina="${i}">
                    ${i}
                </button>
            `;
        } else if (
            i === paginaActual - 2 || 
            i === paginaActual + 2
        ) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Botón siguiente
    html += `
        <button class="pagination-button" ${paginaActual === totalPaginas ? 'disabled' : ''} data-pagina="${paginaActual + 1}">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </button>
    `;
    
    paginacion.innerHTML = html;
    
    // Agregar event listeners a los botones de paginación
    document.querySelectorAll('.pagination-button').forEach(button => {
        button.addEventListener('click', () => {
            if (!button.disabled) {
                paginaActual = parseInt(button.dataset.pagina);
                mostrarProductos();
                actualizarPaginacion();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// Función para actualizar el contador de productos
function actualizarContadorProductos() {
    const contador = document.getElementById('ProductCountMobile');
    if (contador) {
        contador.textContent = `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`;
    }
}

// Función para abrir los filtros
function abrirFiltros() {
    document.getElementById('mobile-facets').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar los filtros
function cerrarFiltros() {
    document.getElementById('mobile-facets').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
}

async function cargarProductos() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const data = await response.json();
        return data.map(producto => ({
            id: producto._id || producto.id_original || producto.id,
            nombre: producto.nombre,
            marca: producto.marca,
            precio: producto.precio,
            categoria: producto.categoria,
            img: producto.img || producto.imagen,
            tallas: producto.tallas
        }));
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function filtrarProductos() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        const productos = await response.json();
        // Resto del código de filtrado...
    } catch (error) {
        console.error('Error:', error);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('../api/productos.json');
        const productos = await response.json();
        
        // Filtrar solo productos de retail
        productosRetail = productos.filter(p => p.categoria === 'Retail');
        productosFiltrados = [...productosRetail];
        
        if (productosRetail.length === 0) {
            console.error("No se encontraron productos de retail");
            document.getElementById("productos-grid").innerHTML = 
                "<p style='grid-column: 1/-1; text-align: center; padding: 20px;'>No hay productos de retail disponibles en este momento.</p>";
            return;
        }
        
        // Inicializar la interfaz
        generarFiltros();
        inicializarGruposFiltros();
        mostrarProductos();
        actualizarPaginacion();
        actualizarContadorProductos();
        
        // Event listeners para los botones de filtro
        document.getElementById('toggle-filtros').addEventListener('click', abrirFiltros);
        document.getElementById('close-filters').addEventListener('click', cerrarFiltros);
        document.getElementById('overlay').addEventListener('click', cerrarFiltros);
        document.getElementById('aplicar-filtros').addEventListener('click', aplicarFiltros);
        document.getElementById('limpiar-filtros').addEventListener('click', limpiarFiltros);
        
        // Ocultar pantalla de carga
        document.getElementById('loading-screen').style.display = 'none';
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        document.getElementById('loading-screen').style.display = 'none';
    }
}); 