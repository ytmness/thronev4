function verDetallesPedido(numeroPedido) {
    console.log('Intentando abrir modal para pedido:', numeroPedido);
    console.log('Estado actual de pedidos:', pedidos);
    
    // Intentar encontrar el pedido de diferentes maneras
    const pedidoPorNumeroPedido = pedidos.find(p => p.numeroPedido === numeroPedido);
    const pedidoPorNumero_pedido = pedidos.find(p => p.numero_pedido === numeroPedido);
    console.log('Búsqueda por numeroPedido:', pedidoPorNumeroPedido);
    console.log('Búsqueda por numero_pedido:', pedidoPorNumero_pedido);
    
    const pedido = pedidoPorNumeroPedido || pedidoPorNumero_pedido;
    console.log('Pedido encontrado (combinado):', pedido);
    
    if (!pedido) {
        console.error('No se encontró el pedido con número:', numeroPedido);
        console.log('Lista completa de números de pedido disponibles:', 
            pedidos.map(p => ({ 
                numeroPedido: p.numeroPedido, 
                numero_pedido: p.numero_pedido 
            }))
        );
        return;
    }

    const modal = document.getElementById('modal-pedido');
    console.log('Modal encontrado:', modal);
    
    if (!modal) {
        console.error('No se encontró el elemento modal-pedido en el DOM');
        return;
    }

    const detalles = document.getElementById('detalles-pedido');
    console.log('Elemento detalles-pedido encontrado:', detalles);

    // ... existing code ...

    modal.style.display = 'block';
    console.log('Modal display establecido a block');
} 