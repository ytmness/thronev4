function crearTarjetaProducto(producto) {
    const esURLExterna = producto.img.startsWith("http");
    const rutaImagen = esURLExterna ? producto.img : `/images/${producto.img}`;
  
    const div = document.createElement("div");
    div.classList.add("product-item");
    div.innerHTML = `
      <img src="${rutaImagen}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>${producto.categoria}</p>
      <p>$${producto.precio.toFixed(2)} MXN</p>
      <button onclick="verDetalles(${producto.id})">Ver Detalles</button>
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
    fetch("../api/productos.json")
      .then(res => res.json())
      .then(data => renderizarCatalogo(data))
      .catch(error => console.error("Error al cargar el catálogo:", error));
  }
  
  cargarCatalogo();
  