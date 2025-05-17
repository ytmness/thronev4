console.log("cart.js cargado correctamente");

// Si estamos en la página de producto (donde existe el botón "agregar-carrito")
const btnAgregar = document.getElementById("agregar-carrito");
if (btnAgregar) {
  console.log("Elemento agregar-carrito encontrado:", btnAgregar);
  btnAgregar.addEventListener("click", function () {
    const producto = JSON.parse(localStorage.getItem("producto"));
    console.log("Botón Agregar clickeado, producto:", producto);
    if (!producto) {
      alert("No se encontró el producto.");
      return;
    }
    const tallaSelect = document.getElementById("talla-select");
    const talla = tallaSelect.value;
    console.log("Talla seleccionada:", talla);
    if (!talla) {
      alert("Por favor, selecciona una talla.");
      return;
    }
    // Agregar la talla seleccionada al producto
    producto.tallaSeleccionada = talla;
    agregarAlCarrito(producto);
  });
}

// Función para agregar un producto al carrito
function agregarAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  console.log("Producto agregado al carrito:", producto);
  alert("Producto agregado al carrito");
}

// Función para actualizar y mostrar el carrito en la página de carrito
function actualizarCarrito() {
  const cartItems = document.getElementById("cart-items");
  const totalAmount = document.getElementById("total-amount");

  if (!cartItems || !totalAmount) {
    console.error("Elementos del carrito no encontrados en el DOM.");
    return;
  }

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    cartItems.innerHTML = "<p>Tu carrito está vacío.</p>";
    totalAmount.textContent = "0";
    return;
  }

  cartItems.innerHTML = "";
  let total = 0;

  carrito.forEach((producto, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");
    
    // Usar el campo correcto: producto.imagen
    let rutaImagen;
    if (producto.imagen && producto.imagen.startsWith("http")) {
      rutaImagen = producto.imagen;
    } else if (producto.imagen && producto.imagen.trim() !== "") {
      rutaImagen = `/static/img/${producto.imagen}`;
    } else {
      rutaImagen = '../images/file.png'; // Usar el logo local como placeholder
    }

    itemDiv.innerHTML = `
      <div class="cart-item-content">
        <img src="${rutaImagen}" alt="${producto.nombre}" class="cart-item-image">
        <div class="cart-item-details">
          <h4>${producto.nombre}</h4>
          <p>Talla: ${producto.tallaSeleccionada || "Sin talla"}</p>
          <p class="cart-item-price">$${producto.precio.toFixed(2)} MXN</p>
        </div>
      </div>
      <button class="delete-button" onclick="eliminarProducto(${index})">
        <i class="fas fa-trash"></i> Eliminar
      </button>
    `;
    cartItems.appendChild(itemDiv);
    total += producto.precio;
  });

  totalAmount.textContent = total.toFixed(2);
}

// Función para eliminar un producto del carrito
function eliminarProducto(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
}

// Función para finalizar la compra (incluye llamada a la API para actualizar stock)
function finalizarCompra() {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const actualizarStockPromises = carrito.map(producto => {
    const datos = {
      id: producto.id,
      talla: producto.tallaSeleccionada,
      cantidad: 1  // Ajusta si manejas cantidades mayores
    };

    return fetch("https://tu-dominio.com/api/actualizarStock", {  // Cambia la URL según corresponda
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al actualizar el stock del producto " + producto.id);
      }
      return response.json();
    })
    .then(data => {
      console.log("Stock actualizado para el producto", producto.id, data);
      return data;
    });
  });

  Promise.all(actualizarStockPromises)
    .then(() => {
      alert("¡Gracias por tu compra!");
      localStorage.removeItem("carrito");
      actualizarCarrito();
    })
    .catch(error => {
      console.error("Error al actualizar el stock:", error);
      alert("Hubo un problema al procesar la compra. Intenta de nuevo.");
    });
}

// Si estamos en la página del carrito (donde existe "cart-items"), actualizar la vista cuando el DOM esté listo
if (document.getElementById("cart-items")) {
  document.addEventListener("DOMContentLoaded", actualizarCarrito);
}
