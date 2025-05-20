// Variables globales
const productosPorPagina = 49;
let paginaActual = 1;
let productosRopa = [];
let productosFiltrados = [];

// Función para generar los filtros dinámicamente
function generarFiltros(productos) {
    // Obtener marcas únicas
    const todasLasMarcas = [...new Set(productos.map(p => p.marca))].sort();
    const marcasContainer = document.querySelector('.facet-group[data-tipo="marca"] .facet-values');
    
    if (marcasContainer) {
        marcasContainer.innerHTML = `
            <button class="facet-value active" data-marca="">
                <span class="facet-checkbox"></span>
                <span class="facet-label">Todas las marcas</span>
                <span class="facet-count">${productos.length}</span>
            </button>
            ${todasLasMarcas.map(marca => {
                const count = productos.filter(p => p.marca === marca).length;
                return `
                    <button class="facet-value" data-marca="${marca}">
                        <span class="facet-checkbox"></span>
                        <span class="facet-label">${marca}</span>
                        <span class="facet-count">${count}</span>
                    </button>
                `;
            }).join('')}
        `;
    }

    // Generar filtros de precios
    const precios = productos.map(p => p.precio);
    const minPrecio = Math.floor(Math.min(...precios) / 1000) * 1000;
    const maxPrecio = Math.ceil(Math.max(...precios) / 1000) * 1000;
    const rangosPrecio = [];
    
    // Generar rangos de precio más precisos
    for (let i = minPrecio; i < maxPrecio; i += 1000) {
        const count = productos.filter(p => p.precio >= i && p.precio < i + 1000).length;
        if (count > 0) { // Solo agregar rangos que tengan productos
            rangosPrecio.push({
                min: i,
                max: i + 1000,
                count: count
            });
        }
    }
    
    // Agregar rango final si hay productos
    const countFinal = productos.filter(p => p.precio >= maxPrecio).length;
    if (countFinal > 0) {
        rangosPrecio.push({
            min: maxPrecio,
            max: null,
            count: countFinal
        });
    }

    const preciosContainer = document.querySelector('.facet-group[data-tipo="precio"] .facet-values');
    if (preciosContainer) {
        preciosContainer.innerHTML = `
            <button class="facet-value active" data-precio="">
                <span class="facet-checkbox"></span>
                <span class="facet-label">Todos los precios</span>
                <span class="facet-count">${productos.length}</span>
            </button>
            ${rangosPrecio.map(rango => {
                const label = rango.max 
                    ? `$${rango.min.toLocaleString()} - $${rango.max.toLocaleString()}`
                    : `Más de $${rango.min.toLocaleString()}`;
                return `
                    <button class="facet-value" data-precio="${rango.min}-${rango.max || ''}">
                        <span class="facet-checkbox"></span>
                        <span class="facet-label">${label}</span>
                        <span class="facet-count">${rango.count}</span>
                    </button>
                `;
            }).join('')}
        `;
    }

    // Generar filtros de tallas basados en las tallas reales disponibles
    const tallasDisponibles = new Set();
    productos.forEach(producto => {
        if (producto.tallas) {
            Object.keys(producto.tallas).forEach(talla => {
                if (producto.tallas[talla] > 0) { // Solo agregar tallas con stock
                    tallasDisponibles.add(talla);
                }
            });
        }
    });

    // Convertir a array y ordenar las tallas
    const tallasOrdenadas = Array.from(tallasDisponibles).sort((a, b) => {
        // Ordenar tallas numéricas primero
        if (!isNaN(a) && !isNaN(b)) {
            return Number(a) - Number(b);
        }
        // Luego ordenar tallas de letras (S, M, L, etc.)
        const ordenTallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNICA'];
        const indexA = ordenTallas.indexOf(a.toUpperCase());
        const indexB = ordenTallas.indexOf(b.toUpperCase());
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        // Si no está en la lista de orden, mantener el orden alfabético
        return a.localeCompare(b);
    });

    const tallasContainer = document.querySelector('.facet-group[data-tipo="talla"] .facet-values');
    if (tallasContainer) {
        tallasContainer.innerHTML = `
            <button class="facet-value active" data-talla="">
                <span class="facet-checkbox"></span>
                <span class="facet-label">Todas las tallas</span>
                <span class="facet-count">${productos.length}</span>
            </button>
            ${tallasOrdenadas.map(talla => {
                const count = productos.filter(p => p.tallas && p.tallas[talla] > 0).length;
                return `
                    <button class="facet-value" data-talla="${talla}">
                        <span class="facet-checkbox"></span>
                        <span class="facet-label">${talla}</span>
                        <span class="facet-count">${count}</span>
                    </button>
                `;
            }).join('')}
        `;
    }

    // Inicializar los event listeners después de generar los filtros
    agregarEventListenersFiltros();
    inicializarGruposFiltros();
}

function agregarEventListenersFiltros() {
    document.querySelectorAll('.facet-value').forEach(value => {
        value.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const group = value.closest('.facet-group');
            const groupValues = group.querySelectorAll('.facet-value');
            const allButton = group.querySelector('[data-marca=""], [data-precio=""], [data-talla=""]');
            
            // Si se hace clic en "Todos"
            if (value.dataset.marca === '' || value.dataset.precio === '' || value.dataset.talla === '') {
                groupValues.forEach(v => v.classList.remove('active'));
                if (!value.classList.contains('active')) {
                    value.classList.add('active');
                }
                return;
            }
            
            // Si se hace clic en un filtro específico
            if (allButton) {
                allButton.classList.remove('active');
            }
            
            value.classList.toggle('active');
            
            // Si no hay filtros activos, activar "Todos"
            const hasActive = Array.from(groupValues).some(v => v.classList.contains('active'));
            if (!hasActive && allButton) {
                allButton.classList.add('active');
            }
        });
    });
}

function inicializarGruposFiltros() {
    document.querySelectorAll('.facet-group__title').forEach(title => {
        // Establecer estado inicial como cerrado
        title.setAttribute('aria-expanded', 'false');
        const content = title.nextElementSibling;
        content.classList.remove('active');

        // Agregar event listener
        title.addEventListener('click', () => {
            const isExpanded = title.getAttribute('aria-expanded') === 'true';
            
            // Actualizar estado
            title.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle la clase active
            if (!isExpanded) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    });
}

function actualizarContadoresFiltros() {
    // Actualizar contadores de marcas
    document.querySelectorAll('.facet-group[data-tipo="marca"] .facet-value').forEach(value => {
        const marca = value.dataset.marca;
        if (marca === '') {
            value.querySelector('.facet-count').textContent = productosFiltrados.length;
        } else {
            const count = productosFiltrados.filter(p => p.marca === marca).length;
            value.querySelector('.facet-count').textContent = count;
        }
    });

    // Actualizar contadores de precios
    document.querySelectorAll('.facet-group[data-tipo="precio"] .facet-value').forEach(value => {
        const rango = value.dataset.precio;
        if (rango === '') {
            value.querySelector('.facet-count').textContent = productosFiltrados.length;
        } else {
            const [min, max] = rango.split('-').map(Number);
            const count = productosFiltrados.filter(p => {
                if (max) {
                    return p.precio >= min && p.precio < max;
                } else {
                    return p.precio >= min;
                }
            }).length;
            value.querySelector('.facet-count').textContent = count;
        }
    });

    // Actualizar contadores de tallas
    document.querySelectorAll('.facet-group[data-tipo="talla"] .facet-value').forEach(value => {
        const talla = value.dataset.talla;
        if (talla === '') {
            value.querySelector('.facet-count').textContent = productosFiltrados.length;
        } else {
            const count = productosFiltrados.filter(p => p.tallas && p.tallas[talla] > 0).length;
            value.querySelector('.facet-count').textContent = count;
        }
    });
}

// Función para aplicar los filtros
function aplicarFiltros(filtrosActivos) {
    productosFiltrados = productosRopa.filter(producto => {
        const cumpleMarca = filtrosActivos.marcas.length === 0 || filtrosActivos.marcas.includes(producto.marca);
        const cumplePrecio = filtrosActivos.precios.length === 0 || filtrosActivos.precios.some(rango => {
            const [min, max] = rango.split('-').map(Number);
            if (max) {
                return producto.precio >= min && producto.precio < max;
            } else {
                return producto.precio >= min;
            }
        });
        const cumpleTalla = filtrosActivos.tallas.length === 0 || filtrosActivos.tallas.some(talla => 
            producto.tallas && producto.tallas[talla] > 0
        );

        return cumpleMarca && cumplePrecio && cumpleTalla;
    });

    paginaActual = 1;
    mostrarPagina(paginaActual);
    construirPaginacion(productosFiltrados.length);
    actualizarContadorProductos();
    actualizarContadoresFiltros();
}

// Función para limpiar los filtros
function limpiarFiltros() {
    // Desactivar todos los filtros
    document.querySelectorAll('.facet-value').forEach(value => {
        value.classList.remove('active');
    });
    
    // Activar solo los botones "Todos"
    document.querySelectorAll('.facet-value[data-marca=""], .facet-value[data-precio=""], .facet-value[data-talla=""]')
        .forEach(value => value.classList.add('active'));
    
    // Restaurar todos los productos
    productosFiltrados = [...productosRopa];
    
    // Actualizar la visualización
    paginaActual = 1;
    mostrarPagina(paginaActual);
    construirPaginacion(productosRopa.length);
    actualizarContadorProductos();
    actualizarContadoresFiltros();
}

// Función para actualizar el contador de productos
function actualizarContadorProductos() {
    const contador = document.getElementById('ProductCountMobile');
    if (contador) {
        contador.textContent = `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`;
    }
}

// Función para mostrar la página actual
function mostrarPagina(pagina) {
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosGrid = document.getElementById('productos-grid');
    productosGrid.innerHTML = '';
    
    if (productosFiltrados.length === 0) {
        productosGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <h3 style="color: #666; margin-bottom: 10px;">No se encontraron productos</h3>
            <p style="color: #888;">No hay productos que coincidan con los filtros seleccionados.</p>
            <button onclick="limpiarFiltros()" style="margin-top: 20px; padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">Limpiar filtros</button>
        </div>`;
        document.getElementById('paginacion').innerHTML = '';
        return;
    }

    productosFiltrados.slice(inicio, fin).forEach(producto => {
        const imgSrc = producto.img.startsWith('http') ? producto.img : `/images/${producto.img}`;
        const item = document.createElement('div');
        item.classList.add('product-item');
        item.innerHTML = `
            <img src="${imgSrc}" alt="${producto.nombre}" />
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toFixed(2)} MXN</p>
        `;
        item.addEventListener('click', () => verDetalles(producto.id));
        productosGrid.appendChild(item);
    });
}

function construirPaginacion(totalProductos) {
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.toggle('active', i === paginaActual);
        btn.addEventListener('click', () => {
            paginaActual = i;
            mostrarPagina(paginaActual);
            construirPaginacion(productosFiltrados.length);
        });
        paginacion.appendChild(btn);
    }
}

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
document.addEventListener('DOMContentLoaded', () => {
    const mobileFacets = document.getElementById('mobile-facets');
    const toggleButton = document.getElementById('toggle-filtros');
    const closeButton = document.getElementById('close-filters');
    const overlay = document.getElementById('overlay');
    const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
    const limpiarFiltrosBtn = document.getElementById('limpiar-filtros');

    // Cargar productos al inicio
    cargarProductos()
        .then(productos => {
            console.log('Total de productos cargados:', productos.length);
            
            // Filtrar solo productos de ropa
            productosRopa = productos.filter(p => p.categoria === "Ropa");
            console.log('Productos de ropa encontrados:', productosRopa.length);
            
            if (productosRopa.length === 0) {
                console.error("No se encontraron productos de ropa");
                document.getElementById("productos-grid").innerHTML = 
                    "<p style='grid-column: 1/-1; text-align: center; padding: 20px;'>No hay productos de ropa disponibles en este momento.</p>";
                return;
            }

            // Inicializar con todos los productos
            productosFiltrados = [...productosRopa];
            
            // Generar filtros y mostrar productos
            generarFiltros(productosRopa);
            mostrarPagina(1);
            construirPaginacion(productosRopa.length);
            actualizarContadorProductos();
        })
        .catch(err => {
            console.error("Error al cargar productos:", err);
            document.getElementById("productos-grid").innerHTML = 
                "<p style='grid-column: 1/-1; text-align: center; padding: 20px;'>Error al cargar los productos. Por favor, intenta de nuevo más tarde.</p>";
        });

    // Event listeners para los filtros
    toggleButton.addEventListener('click', () => {
        mobileFacets.classList.add('active');
        overlay.classList.add('active');
    });

    function closePanel() {
        mobileFacets.classList.remove('active');
        overlay.classList.remove('active');
    }

    closeButton.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    aplicarFiltrosBtn.addEventListener('click', () => {
        const activeFilters = {
            marcas: Array.from(document.querySelectorAll('.facet-value[data-marca].active'))
                .map(el => el.dataset.marca)
                .filter(marca => marca !== ''),
            precios: Array.from(document.querySelectorAll('.facet-value[data-precio].active'))
                .map(el => el.dataset.precio)
                .filter(precio => precio !== ''),
            tallas: Array.from(document.querySelectorAll('.facet-value[data-talla].active'))
                .map(el => el.dataset.talla)
                .filter(talla => talla !== '')
        };

        console.log('Aplicando filtros:', activeFilters);
        aplicarFiltros(activeFilters);
        closePanel();
    });

    limpiarFiltrosBtn.addEventListener('click', () => {
        limpiarFiltros();
        closePanel();
    });
}); 