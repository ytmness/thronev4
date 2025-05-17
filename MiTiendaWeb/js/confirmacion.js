document.addEventListener('DOMContentLoaded', function() {
    // Obtener el número de pedido de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const numeroPedido = urlParams.get('pedido');

    if (!numeroPedido) {
        window.location.href = 'index.html';
        return;
    }

    // Obtener el pedido desde el backend
    fetch(`http://127.0.0.1:3000/api/pedidos/${numeroPedido}`)
        .then(response => response.json())
        .then(pedido => {
            if (pedido.error) {
                document.body.innerHTML = `<div style='text-align:center;padding:40px;'><h2>No se encontró el pedido</h2><p>${pedido.error}</p></div>`;
                return;
            }
            // Mostrar información del pedido
            const orderNumber = document.getElementById('order-number');
            if (orderNumber) orderNumber.textContent = pedido.numero_pedido;
            const orderDate = document.getElementById('order-date');
            if (orderDate) orderDate.textContent = new Date(pedido.fecha).toLocaleString('es-MX');
            const orderTotal = document.getElementById('order-total');
            if (orderTotal) orderTotal.textContent = `$${pedido.total.toLocaleString('es-MX')} MXN`;

            // Mostrar información del cliente
            const customerDetails = document.getElementById('customer-details');
            if (customerDetails) {
                customerDetails.innerHTML = `
                    <p><strong>Nombre:</strong> ${pedido.cliente.nombre}</p>
                    <p><strong>Email:</strong> ${pedido.cliente.email}</p>
                    <p><strong>Teléfono:</strong> ${pedido.cliente.telefono}</p>
                `;
            }

            // Mostrar información de entrega
            const deliveryDetails = document.getElementById('delivery-details');
            if (deliveryDetails) {
                if (pedido.entrega.metodo === 'pickup') {
                    deliveryDetails.innerHTML = `<p><strong>Método:</strong> Pickup en tienda</p><p><strong>Ubicación:</strong> ${pedido.entrega.direccion}</p>`;
                } else if (typeof pedido.entrega.direccion === 'object') {
                    deliveryDetails.innerHTML = `
                        <p><strong>Método:</strong> Envío a domicilio</p>
                        <p><strong>Dirección:</strong> ${pedido.entrega.direccion.calle}</p>
                        <p><strong>Ciudad:</strong> ${pedido.entrega.direccion.ciudad}</p>
                        <p><strong>Estado:</strong> ${pedido.entrega.direccion.estado}</p>
                        <p><strong>Código Postal:</strong> ${pedido.entrega.direccion.cp}</p>
                    `;
                } else {
                    deliveryDetails.innerHTML = `<p><strong>Dirección:</strong> ${pedido.entrega.direccion}</p>`;
                }
            }

            // Mostrar productos
            const itemsList = document.getElementById('order-items');
            if (itemsList) {
                itemsList.innerHTML = pedido.items.map(item => `
                    <div class="order-item">
                        <span>${item.nombre || item.name}</span>
                        <span>Cantidad: ${item.cantidad || 1}</span>
                        <span>Precio: $${item.precio ? item.precio.toLocaleString('es-MX') : ''} MXN</span>
                    </div>
                `).join('');
            }
        })
        .catch(error => {
            document.body.innerHTML = `<div style='text-align:center;padding:40px;'><h2>Error al cargar el pedido</h2><p>${error}</p></div>`;
        });
}); 