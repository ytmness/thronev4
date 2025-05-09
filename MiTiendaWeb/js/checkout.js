// checkout.js

// Función para mostrar el resumen de la compra (puedes adaptarla según tu implementación)
function mostrarResumenCompra() {
    const resumenDiv = document.getElementById("checkout-resumen");
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  
    if (carrito.length === 0) {
      resumenDiv.innerHTML = "<p>Tu carrito está vacío.</p>";
      return;
    }
  
    let html = "<ul>";
    let total = 0;
    carrito.forEach((producto) => {
      html += `<li>${producto.nombre} (${producto.tallaSeleccionada || "Sin talla"}) - $${producto.precio.toFixed(2)} MXN</li>`;
      total += producto.precio;
    });
    html += "</ul>";
    html += `<p>Total: $${total.toFixed(2)} MXN</p>`;
    resumenDiv.innerHTML = html;
  }
  
  // Función para manejar el comportamiento del checkbox de "misma dirección"
  function manejarCheckbox() {
    const checkbox = document.getElementById("mismo-direccion");
    const facturacionSection = document.getElementById("facturacion-section");
  
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        // Opción 1: Ocultar la sección de facturación
        facturacionSection.classList.add("hidden");
  
        // Opción 2: Copiar los valores de envío a facturación (opcional)
        document.getElementById("facturacion-nombre").value = document.getElementById("envio-nombre").value;
        document.getElementById("facturacion-direccion").value = document.getElementById("envio-direccion").value;
        document.getElementById("facturacion-ciudad").value = document.getElementById("envio-ciudad").value;
        document.getElementById("facturacion-estado").value = document.getElementById("envio-estado").value;
        document.getElementById("facturacion-codigo").value = document.getElementById("envio-codigo").value;
        document.getElementById("facturacion-pais").value = document.getElementById("envio-pais").value;
      } else {
        // Mostrar la sección de facturación nuevamente
        facturacionSection.classList.remove("hidden");
      }
    });
  }
  
  // Función para procesar el checkout (incluyendo la actualización del stock a través de la API)
  function procesarCheckout(event) {
    event.preventDefault();
  
    // Aquí puedes obtener los datos del formulario de envío y facturación
    const envioNombre = document.getElementById("envio-nombre").value;
    const envioDireccion = document.getElementById("envio-direccion").value;
    // ... obtén los demás campos de envío
  
    let facturacionNombre, facturacionDireccion;
    // Si el checkbox está marcado, las direcciones de facturación son iguales a las de envío
    if (document.getElementById("mismo-direccion").checked) {
      facturacionNombre = envioNombre;
      facturacionDireccion = envioDireccion;
      // ... asigna los demás campos de facturación según los de envío
    } else {
      facturacionNombre = document.getElementById("facturacion-nombre").value;
      facturacionDireccion = document.getElementById("facturacion-direccion").value;
      // ... obtén los demás campos de facturación
    }
  
    // Aquí podrías enviar el formulario a tu API para procesar el pago, actualizar stock, etc.
    // Por ejemplo, actualizar el stock mediante tu API (similar a lo visto en finalizarCompra())
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  
    const actualizarStockPromises = carrito.map(producto => {
      const datos = {
        id: producto.id,
        talla: producto.tallaSeleccionada,
        cantidad: 1  // Ajusta si manejas cantidades mayores
      };
  
      return fetch("https://tu-dominio.com/api/actualizarStock", {
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
        alert("¡Compra realizada con éxito!");
        localStorage.removeItem("carrito");
        window.location.href = "index.html";
      })
      .catch(error => {
        console.error("Error al actualizar el stock:", error);
        alert("Hubo un problema al procesar la compra. Intenta de nuevo.");
      });
  }
  
  // Inicialización cuando el DOM esté listo
  document.addEventListener("DOMContentLoaded", function () {
    mostrarResumenCompra();
    manejarCheckbox();
  
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", procesarCheckout);
    }
  });
  