function crearItem(producto) {
  const esURLExterna = producto.img.startsWith("http");
  const rutaImagen = esURLExterna ? producto.img : `/images/${producto.img}`;

  const item = document.createElement("div");
  item.classList.add("product-item");
  item.innerHTML = `
      <img src="${rutaImagen}" alt="${producto.nombre}" />
      <h3>${producto.nombre}</h3>
      <p>${producto.categoria}</p>
      <p>$${producto.precio.toFixed(2)} MXN</p>
  `;
  return item;
}

function renderizarProductos(productos) {
  const tenisContenedor = document.getElementById("productos-destacados");
  const ropaContenedor = document.getElementById("ropa-destacada");

  if (tenisContenedor) tenisContenedor.innerHTML = "";
  if (ropaContenedor) ropaContenedor.innerHTML = "";

  productos.forEach((producto) => {
      const categoria = producto.categoria?.toLowerCase();
      const item = crearItem(producto);

      if (categoria === "tenis" && tenisContenedor) {
          tenisContenedor.appendChild(item);
      } else if (categoria === "ropa" && ropaContenedor) {
          ropaContenedor.appendChild(item);
      }
  });

  activarFlechas("btn-left", "btn-right", "productos-destacados");
  activarFlechas("btn-left-ropa", "btn-right-ropa", "ropa-destacada");
}

function activarFlechas(idLeft, idRight, trackId) {
  const left = document.getElementById(idLeft);
  const right = document.getElementById(idRight);
  const track = document.getElementById(trackId);

  if (left && right && track) {
      left.addEventListener("click", () => {
          track.scrollBy({ left: -250, behavior: "smooth" });
      });

      right.addEventListener("click", () => {
          track.scrollBy({ left: 250, behavior: "smooth" });
      });
  }
}

function cargarProductos() {
  fetch("../api/productos.json")
      .then(res => res.json())
      .then(productos => renderizarProductos(productos))
      .catch(err => console.error("Error al cargar productos:", err));
}

cargarProductos();

// Cargar productos de accesorios en carrusel
document.addEventListener("DOMContentLoaded", () => {
    fetch("../api/productos.json")
      .then(res => res.json())
      .then(data => {
        const accesorios = data.filter(p => p.categoria === "Accesorios");
        const contenedor = document.getElementById("accesorios-destacados");
  
        accesorios.forEach(p => {
          const img = p.img.startsWith("http") ? p.img : `/images/${p.img}`;
          const card = document.createElement("div");
          card.classList.add("product-item");
          card.innerHTML = `
            <img src="${img}" alt="${p.nombre}">
            <h3>${p.nombre}</h3>
            <p>$${p.precio.toFixed(2)} MXN</p>
          `;
          card.addEventListener("click", () => {
            localStorage.setItem("producto", JSON.stringify(p));
            window.location.href = "producto.html";
          });
          contenedor.appendChild(card);
        });
      });
  
    // Control de botones
    const track = document.getElementById("accesorios-destacados");
    document.getElementById("btn-left-accesorios").addEventListener("click", () => {
      track.scrollBy({ left: -300, behavior: "smooth" });
    });
    document.getElementById("btn-right-accesorios").addEventListener("click", () => {
      track.scrollBy({ left: 300, behavior: "smooth" });
    });
  });
  