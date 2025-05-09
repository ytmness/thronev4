document.addEventListener("DOMContentLoaded", cargarProductos);

function cargarProductos() {
    fetch("/api/productos.json")
        .then((response) => response.json())
        .then((productos) => {
            const listaProductos = document.getElementById("productos");
            listaProductos.innerHTML = ""; // Limpiar lista
            productos.forEach((producto) => {
                const li = document.createElement("li");
                li.textContent = `${producto.nombre} - $${producto.precio} (${producto.categoria})`;

                const btnEliminar = document.createElement("button");
                btnEliminar.textContent = "Eliminar";
                btnEliminar.addEventListener("click", () => eliminarProducto(producto.id));
                li.appendChild(btnEliminar);

                listaProductos.appendChild(li);
            });
        })
        .catch((error) => console.error("Error al cargar productos:", error));
}

function eliminarProducto(id) {
    fetch(`/api/productos.json`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
    })
        .then((response) => response.json())
        .then(() => cargarProductos())
        .catch((error) => console.error("Error al eliminar producto:", error));
}

document.getElementById("producto-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", Date.now());
    formData.append("nombre", document.getElementById("nombre").value.trim());
    formData.append("precio", document.getElementById("precio").value.trim());
    formData.append("categoria", document.getElementById("categoria").value.trim());
    formData.append("tallas", JSON.stringify(obtenerTallas()));

    const imagenSeleccionada = document.querySelector("input[name='imagenSeleccionada']");
    if (imagenSeleccionada) {
        formData.append("img", imagenSeleccionada.value);
    } else {
        const imagenArchivo = document.getElementById("imagen").files[0];
        if (imagenArchivo) {
            formData.append("img", imagenArchivo);
        } else {
            alert("Por favor, selecciona o sube una imagen antes de guardar el producto.");
            return;
        }
    }

    fetch("/api/productos.json", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then(() => cargarProductos())
        .catch((error) => console.error("Error al guardar producto:", error));
});

document.getElementById("add-talla").addEventListener("click", () => {
    const container = document.getElementById("tallas-container");
    const div = document.createElement("div");
    div.innerHTML = `
        <input type="text" placeholder="Talla" class="talla" required>
        <input type="number" placeholder="Stock" class="stock" required>
    `;
    container.appendChild(div);
});

function obtenerTallas() {
    const tallas = {};
    document.querySelectorAll(".talla").forEach((input, index) => {
        const stock = document.querySelectorAll(".stock")[index].value;
        tallas[input.value] = parseInt(stock, 10);
    });
    return tallas;
}
