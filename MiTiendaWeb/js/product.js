// product.js
document.addEventListener("DOMContentLoaded", function () {
    const producto = JSON.parse(localStorage.getItem("producto"));
    console.log("Producto recuperado:", producto);
    
    if (producto) {
      document.getElementById("nombre-producto").textContent = producto.nombre;
      document.getElementById("precio-producto").textContent = `$${producto.precio.toFixed(2)} MXN`;
      document.getElementById("imagen-producto").src = producto.img;
  
      const tallaSelect = document.getElementById("talla-select");
tallaSelect.innerHTML = ""; // Limpiar opciones previas

for (const talla in producto.tallas) {
  const option = document.createElement("option");
  option.value = talla;
  option.textContent = `${talla} - Stock: ${producto.tallas[talla]}`;
  tallaSelect.appendChild(option);
}

    } else {
      alert("No se encontró el producto. Vuelve al listado y selecciona uno.");
    }
  });
  