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
            if (orderDate) {
                const fecha = new Date(pedido.fecha);
                orderDate.textContent = fecha.toLocaleString('es-MX', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true
                });
            }

            const orderTotal = document.getElementById('order-total');
            if (orderTotal) orderTotal.textContent = `$${pedido.total.toLocaleString('es-MX')} MXN`;

            // Mostrar información del cliente
            const customerDetails = document.getElementById('customer-details');
            if (customerDetails) {
                customerDetails.innerHTML = `
                    <div class="info-group">
                        <p><strong>Nombre completo:</strong> ${pedido.cliente.nombre}</p>
                        <p><strong>Correo electrónico:</strong> ${pedido.cliente.email}</p>
                        <p><strong>Teléfono:</strong> ${pedido.cliente.telefono}</p>
                    </div>
                `;
            }

            // Mostrar información de entrega
            const deliveryDetails = document.getElementById('delivery-details');
            if (deliveryDetails) {
                if (pedido.entrega.metodo === 'pickup') {
                    deliveryDetails.innerHTML = `
                        <div class="info-group">
                            <p><strong>Método de entrega:</strong> Pickup en tienda</p>
                            <p><strong>Ubicación:</strong> ${pedido.entrega.direccion}</p>
                        </div>
                    `;
                } else {
                    deliveryDetails.innerHTML = `
                        <div class="info-group">
                            <p><strong>Método de entrega:</strong> Envío a domicilio</p>
                            <p><strong>Dirección:</strong> ${pedido.entrega.direccion.calle}</p>
                            <p><strong>Ciudad:</strong> ${pedido.entrega.direccion.ciudad}</p>
                            <p><strong>Estado:</strong> ${pedido.entrega.direccion.estado}</p>
                            <p><strong>Código Postal:</strong> ${pedido.entrega.direccion.cp}</p>
                        </div>
                    `;
                }
            }

            // Mostrar productos
            const itemsList = document.getElementById('order-items-list');
            if (itemsList) {
                itemsList.innerHTML = pedido.items.map(item => `
                    <div class="order-item">
                        <img src="${item.img || item.imagen || '../images/file.png'}" alt="${item.nombre}" class="item-image">
                        <div class="item-details">
                            <h4>${item.nombre}</h4>
                            <p><strong>Talla:</strong> ${item.tallaSeleccionada || 'Sin talla'}</p>
                            <p><strong>Cantidad:</strong> ${item.cantidad || 1}</p>
                            <p><strong>Precio unitario:</strong> $${item.precio.toLocaleString('es-MX')} MXN</p>
                            <p><strong>Subtotal:</strong> $${((item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-MX')} MXN</p>
                        </div>
                    </div>
                `).join('');
            }

            // Mostrar método de pago
            const paymentMethod = document.getElementById('payment-method');
            if (paymentMethod) {
                let metodoPagoTexto = '';
                switch(pedido.metodo_pago) {
                    case 'transferencia':
                        metodoPagoTexto = 'Transferencia bancaria';
                        break;
                    case 'efectivo':
                        if (pedido.entrega.metodo === 'pickup') {
                            metodoPagoTexto = 'Pago en efectivo al recoger';
                        } else {
                            metodoPagoTexto = 'Pago en efectivo';
                        }
                        break;
                    default:
                        metodoPagoTexto = 'Método de pago no especificado';
                }
                paymentMethod.textContent = metodoPagoTexto;
            }
        })
        .catch(error => {
            document.body.innerHTML = `<div style='text-align:center;padding:40px;'><h2>Error al cargar el pedido</h2><p>${error}</p></div>`;
        });
}); 