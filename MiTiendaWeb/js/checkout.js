// checkout.js

// Función para mostrar el resumen de la compra (puedes adaptarla según tu implementación)
function mostrarResumenCompra() {
    const resumenDiv = document.getElementById("checkout-resumen");
    if (!resumenDiv) return; // Proteger si el elemento no existe
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
    if (!checkbox || !facturacionSection) return;
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
  
document.addEventListener('DOMContentLoaded', function() {
    // Cargar los items del carrito
    cargarItemsCarrito();
    
    // Calcular y mostrar los totales
    calcularTotales();
    
    // Manejar el envío del formulario
    const form = document.getElementById('shipping-form');
    if (form) {
        form.addEventListener('submit', manejarEnvioFormulario);
    }
});

function cargarItemsCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const checkoutItems = document.getElementById('checkout-items');
    if (!checkoutItems) return;
    if (carrito.length === 0) {
        checkoutItems.innerHTML = '<p>No hay productos en el carrito.</p>';
        return;
    }
    checkoutItems.innerHTML = '';
    carrito.forEach(producto => {
        let rutaImagen = '';
        if (producto.img && typeof producto.img === 'string' && (producto.img.startsWith('http') || producto.img.startsWith('https'))) {
            rutaImagen = producto.img;
        } else if (producto.img && typeof producto.img === 'string' && producto.img.trim() !== '' && producto.img !== 'undefined') {
            rutaImagen = `/static/img/productos/${producto.img}`;
        } else if (producto.imagen && typeof producto.imagen === 'string' && (producto.imagen.startsWith('http') || producto.imagen.startsWith('https'))) {
            rutaImagen = producto.imagen;
        } else if (producto.imagen && typeof producto.imagen === 'string' && producto.imagen.trim() !== '' && producto.imagen !== 'undefined') {
            rutaImagen = `/static/img/productos/${producto.imagen}`;
        } else {
            rutaImagen = '../images/file.png'; // Placeholder local
        }
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('checkout-item');
        itemDiv.innerHTML = `
            <img src="${rutaImagen}" alt="${producto.nombre}" class="checkout-item-image">
            <div class="checkout-item-details">
                <h4>${producto.nombre}</h4>
                <p>Talla: ${producto.tallaSeleccionada || 'Sin talla'}</p>
                <p>$${producto.precio.toFixed(2)} MXN</p>
            </div>
        `;
        checkoutItems.appendChild(itemDiv);
    });
}

function calcularTotales() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const subtotalElement = document.getElementById('subtotal-amount');
    const shippingElement = document.getElementById('shipping-amount');
    const totalElement = document.getElementById('total-amount');
    
    if (!subtotalElement || !shippingElement || !totalElement) return;
    
    // Calcular subtotal
    const subtotal = carrito.reduce((total, producto) => total + producto.precio, 0);
    
    // Calcular envío (ejemplo: envío gratis para compras mayores a $2000)
    const shipping = subtotal > 2000 ? 0 : 150;
    
    // Calcular total
    const total = subtotal + shipping;
    
    // Actualizar elementos en el DOM
    subtotalElement.textContent = `$${subtotal.toFixed(2)} MXN`;
    shippingElement.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)} MXN`;
    totalElement.textContent = `$${total.toFixed(2)} MXN`;
}

function manejarEnvioFormulario(evento) {
    evento.preventDefault();
    
    // Obtener los datos del formulario
    const formData = new FormData(evento.target);
    const datosEnvio = Object.fromEntries(formData.entries());
    
    // Obtener el método de pago seleccionado
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked')?.value;
    
    if (!metodoPago) {
        alert('Por favor, selecciona un método de pago');
        return;
    }
    
    // Obtener el carrito actual
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Crear el objeto de pedido
    const pedido = {
        datosEnvio,
        metodoPago,
        productos: carrito,
        fecha: new Date().toISOString(),
        total: carrito.reduce((total, producto) => total + producto.precio, 0) + (carrito.reduce((total, producto) => total + producto.precio, 0) > 2000 ? 0 : 150)
    };
    
    // Enviar el pedido al backend
    fetch('http://127.0.0.1:3000/api/pedidos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            numero_pedido: generarNumeroPedido(),
            total: pedido.total,
            cliente: {
                nombre: pedido.datosEnvio.nombre,
                email: pedido.datosEnvio.email,
                telefono: pedido.datosEnvio.telefono
            },
            entrega: {
                metodo: pedido.metodoPago,
                direccion: pedido.datosEnvio.direccion
            },
            items: pedido.productos
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al guardar el pedido');
        return response.json();
    })
    .then(data => {
        // Limpiar el carrito y redirigir solo si el pedido se guardó correctamente
        localStorage.removeItem('carrito');
        window.location.href = `confirmacion.html?pedido=${data.numero_pedido}`;
    })
    .catch(error => {
        alert('Hubo un problema al guardar el pedido. Intenta de nuevo.');
        console.error(error);
    });
}

// Función para generar número de pedido único
function generarNumeroPedido() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TK-${timestamp.slice(-6)}-${random}`;
}

// Manejar la visibilidad de las ubicaciones de pickup
document.addEventListener('DOMContentLoaded', function() {
    const metodoEntrega = document.querySelectorAll('input[name="metodo-entrega"]');
    const pickupLocations = document.getElementById('pickup-locations');
    const direccionInputs = document.querySelectorAll('#direccion, #ciudad, #estado, #cp');

    metodoEntrega.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'pickup') {
                pickupLocations.style.display = 'block';
                direccionInputs.forEach(input => {
                    input.required = false;
                    input.disabled = true;
                });
            } else {
                pickupLocations.style.display = 'none';
                direccionInputs.forEach(input => {
                    input.required = true;
                    input.disabled = false;
                });
            }
        });
    });

    // Manejar el envío del formulario
    const checkoutForm = document.getElementById('shipping-form');
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Obtener los datos del formulario
        const formData = new FormData(this);
        const numeroPedido = generarNumeroPedido();
        
        // Validar que metodo y direccion no estén vacíos
        const metodoEntrega = formData.get('metodo-entrega');
        let direccionEntrega = metodoEntrega === 'pickup'
            ? formData.get('pickup-location')
            : {
                calle: formData.get('direccion'),
                ciudad: formData.get('ciudad'),
                estado: formData.get('estado'),
                cp: formData.get('cp')
            };
        if (!metodoEntrega || !direccionEntrega) {
            alert('Por favor, completa los datos de entrega.');
            return;
        }
        // Obtener y limpiar el total para que sea un número
        let totalStr = document.getElementById('total-amount').textContent;
        let total = parseFloat(totalStr.replace(/[^0-9.]/g, ''));

        const pedidoData = {
            numeroPedido: numeroPedido, // Usar camelCase
            cliente: {
                nombre: formData.get('nombre'),
                email: formData.get('email'),
                telefono: formData.get('telefono')
            },
            entrega: {
                metodo: metodoEntrega,
                direccion: direccionEntrega
            },
            items: JSON.parse(localStorage.getItem('carrito')) || [],
            total: total // Enviar como número
        };

        // Enviar el pedido al backend
        fetch('http://127.0.0.1:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al guardar el pedido');
            return response.json();
        })
        .then(data => {
            // Limpiar el carrito y redirigir solo si el pedido se guardó correctamente
            localStorage.removeItem('carrito');
            window.location.href = `confirmacion.html?pedido=${data.numero_pedido || data.numeroPedido}`;
        })
        .catch(error => {
            alert('Hubo un problema al guardar el pedido. Intenta de nuevo.');
            console.error(error);
        });
    });
});

// Cargar items del carrito en el checkout
function cargarItemsCheckout() {
    const checkoutItems = document.getElementById('checkout-items');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let subtotal = 0;
    if (!checkoutItems) return;
    checkoutItems.innerHTML = carrito.map(item => {
        let rutaImagen = '';
        if (item.img && typeof item.img === 'string' && (item.img.startsWith('http') || item.img.startsWith('https'))) {
            rutaImagen = item.img;
        } else if (item.img && typeof item.img === 'string' && item.img.trim() !== '' && item.img !== 'undefined') {
            rutaImagen = `/static/img/productos/${item.img}`;
        } else if (item.imagen && typeof item.imagen === 'string' && (item.imagen.startsWith('http') || item.imagen.startsWith('https'))) {
            rutaImagen = item.imagen;
        } else if (item.imagen && typeof item.imagen === 'string' && item.imagen.trim() !== '' && item.imagen !== 'undefined') {
            rutaImagen = `/static/img/productos/${item.imagen}`;
        } else {
            rutaImagen = '../images/file.png'; // Placeholder local
        }
        subtotal += item.precio * (item.cantidad || 1);
        return `
            <div class="checkout-item">
                <img src="${rutaImagen}" alt="${item.nombre}" class="checkout-item-image">
                <div class="item-details">
                    <h4>${item.nombre}</h4>
                    <p>Cantidad: ${item.cantidad || 1}</p>
                    <p>Precio: $${item.precio.toFixed(2)} MXN</p>
                </div>
            </div>
        `;
    }).join('');
    // Actualizar totales
    const envio = subtotal > 0 ? 150 : 0; // Costo de envío fijo de $150
    const total = subtotal + envio;
    if(document.getElementById('subtotal-amount')) document.getElementById('subtotal-amount').textContent = `$${subtotal.toFixed(2)} MXN`;
    if(document.getElementById('shipping-amount')) document.getElementById('shipping-amount').textContent = `$${envio.toFixed(2)} MXN`;
    if(document.getElementById('total-amount')) document.getElementById('total-amount').textContent = `$${total.toFixed(2)} MXN`;
}

// Cargar items al iniciar la página
document.addEventListener('DOMContentLoaded', cargarItemsCheckout);
  