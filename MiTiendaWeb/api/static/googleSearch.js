const apiKey = "AIzaSyD2Hnj5JkbMuRfE4dIZX9xSmbxGT6RkA3Q";
const cx = "c035a2fd286be495b";

document.getElementById("buscar-imagenes").addEventListener("click", function () {
    const nombreProducto = document.getElementById("nombre").value;

    if (!nombreProducto) {
        alert("Por favor, escribe un nombre para el producto.");
        return;
    }

    const query = `StockX ${nombreProducto}`;

    fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${cx}&key=${apiKey}&searchType=image`)
        .then((response) => response.json())
        .then((data) => {
            const imagenesOpciones = document.getElementById("imagenes-opciones");
            imagenesOpciones.innerHTML = "";

            const imagenes = data.items.slice(0, 3);
            imagenes.forEach((imagen, index) => {
                const imgElement = document.createElement("img");
                imgElement.src = imagen.link;
                imgElement.alt = `Opción ${index + 1}`;
                imgElement.style.width = "150px";
                imgElement.style.margin = "10px";
                imgElement.style.cursor = "pointer";

                imgElement.addEventListener("click", () => seleccionarImagen(imagen.link));
                imagenesOpciones.appendChild(imgElement);
            });

            document.getElementById("imagenes-resultados").style.display = "block";
        })
        .catch((error) => console.error("Error al buscar imágenes:", error));
});

function seleccionarImagen(url) {
    alert(`Has seleccionado esta imagen: ${url}`);
    const inputHidden = document.createElement("input");
    inputHidden.type = "hidden";
    inputHidden.name = "imagenSeleccionada";
    inputHidden.value = url;

    document.getElementById("producto-form").appendChild(inputHidden);
    document.getElementById("imagenes-resultados").style.display = "none";
}

