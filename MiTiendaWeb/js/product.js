// product.js
document.addEventListener("DOMContentLoaded", function () {
    const producto = JSON.parse(localStorage.getItem("producto"));
    console.log("Producto recuperado del localStorage:", producto);
    
    if (producto) {
        // Verificar que el producto tenga las propiedades necesarias
        if (!producto.nombre || !producto.precio) {
            console.error("El producto no tiene las propiedades requeridas:", producto);
            alert("Error: El producto no tiene la información necesaria. Por favor, vuelve a la página anterior.");
            return;
        }

        document.getElementById("nombre-producto").textContent = producto.nombre;
        document.getElementById("precio-producto").textContent = `$${producto.precio.toFixed(2)} MXN`;
        
        // Procesar la URL de la imagen de manera más robusta
        let imgSrc;
        if (producto.img) {
            imgSrc = producto.img.startsWith("http") 
                ? producto.img 
                : `http://127.0.0.1:3000/static/img/productos/${producto.img}`;
        } else if (producto.imagen) {
            imgSrc = producto.imagen.startsWith("http")
                ? producto.imagen
                : `http://127.0.0.1:3000/static/img/productos/${producto.imagen}`;
        } else {
            console.warn("No se encontró URL de imagen en el producto:", producto);
            imgSrc = '../images/file.png'; // Usar el logo como placeholder
        }

        console.log("URL de imagen a cargar:", imgSrc);
        const imgElement = document.getElementById("imagen-producto");
        imgElement.src = imgSrc;
        imgElement.onerror = function() {
            console.error('Error al cargar la imagen:', imgSrc);
            this.src = '../images/file.png';
        };
  
        const tallaSelect = document.getElementById("talla-select");
        tallaSelect.innerHTML = ""; // Limpiar opciones previas

        if (producto.tallas && typeof producto.tallas === 'object') {
            for (const talla in producto.tallas) {
                const option = document.createElement("option");
                option.value = talla;
                option.textContent = `${talla} - Stock: ${producto.tallas[talla]}`;
                tallaSelect.appendChild(option);
            }
        } else {
            console.warn("No se encontraron tallas en el producto:", producto);
            const option = document.createElement("option");
            option.value = "default";
            option.textContent = "No hay tallas disponibles";
            tallaSelect.appendChild(option);
        }

    } else {
        console.error("No se encontró producto en el localStorage");
        alert("No se encontró el producto. Vuelve al listado y selecciona uno.");
    }
});
  