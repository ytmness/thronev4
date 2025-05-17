// Configuración de la API
const API_CONFIG = {
    // Reemplaza estos valores con tus credenciales
    apiKey: "AIzaSyCKPDwsQyTPgplbuXt_Qqs1JxmlY6kDKiw", // API key actualizada
    cx: "c035a2fd286be495b", // ID del motor de búsqueda actualizado
    maxResults: 3,
    searchType: "image"
};

// Función para validar la configuración
function validarConfiguracion() {
    if (!API_CONFIG.apiKey || API_CONFIG.apiKey === "TU_NUEVA_API_KEY") {
        console.error("API key no configurada");
        return false;
    }
    if (!API_CONFIG.cx || API_CONFIG.cx === "TU_NUEVO_CX") {
        console.error("ID de motor de búsqueda no configurado");
        return false;
    }
    return true;
}

// Función para verificar el estado de la API
async function verificarEstadoAPI() {
    try {
        const url = new URL("https://www.googleapis.com/customsearch/v1");
        url.searchParams.append("q", "test");
        url.searchParams.append("cx", API_CONFIG.cx);
        url.searchParams.append("key", API_CONFIG.apiKey);
        url.searchParams.append("searchType", API_CONFIG.searchType);
        url.searchParams.append("num", 1);

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("Error en la verificación de la API:", data);
            if (data.error?.status === "RESOURCE_EXHAUSTED") {
                throw new Error("Límite de cuota excedido. Por favor, verifica tu cuota en Google Cloud Console.");
            } else if (data.error?.status === "INVALID_ARGUMENT") {
                throw new Error("Configuración inválida. Verifica el ID del motor de búsqueda.");
            } else if (data.error?.status === "PERMISSION_DENIED") {
                throw new Error("API no habilitada o key sin permisos. Verifica en Google Cloud Console.");
            }
            throw new Error(`Error de la API: ${data.error?.message || 'Error desconocido'}`);
        }
        return true;
    } catch (error) {
        console.error("Error al verificar la API:", error);
        return false;
    }
}

document.getElementById("buscar-imagenes").addEventListener("click", async function () {
    if (!validarConfiguracion()) {
        alert("La configuración de la API no está completa. Por favor, contacta al administrador.");
        return;
    }

    const nombreProducto = document.getElementById("nombre").value;
    const imagenesOpciones = document.getElementById("imagenes-opciones");
    const imagenesResultados = document.getElementById("imagenes-resultados");

    if (!nombreProducto) {
        alert("Por favor, escribe un nombre para el producto.");
        return;
    }

    // Mostrar indicador de carga
    imagenesOpciones.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 10px;">Verificando configuración de la API...</p>
        </div>
    `;
    imagenesResultados.style.display = "block";

    // Verificar el estado de la API primero
    const apiOk = await verificarEstadoAPI();
    if (!apiOk) {
        imagenesOpciones.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #e84141; margin-bottom: 15px;">
                    Error al conectar con la API de Google
                </p>
                <p style="margin-bottom: 15px;">
                    Por favor, verifica que:
                </p>
                <ul style="text-align: left; margin: 0 auto; max-width: 400px;">
                    <li>La Custom Search API esté habilitada en Google Cloud Console</li>
                    <li>La API key tenga los permisos correctos</li>
                    <li>El ID del motor de búsqueda sea válido</li>
                </ul>
            </div>
        `;
        return;
    }

    // Continuar con la búsqueda si la API está OK
    imagenesOpciones.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 10px;">Buscando imágenes...</p>
        </div>
    `;

    try {
        const query = `StockX ${nombreProducto}`;
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${API_CONFIG.cx}&key=${API_CONFIG.apiKey}&searchType=${API_CONFIG.searchType}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Detalles del error:", errorData);
            throw new Error(
                `Error de la API: ${response.status} ${response.statusText}\n` +
                `Detalles: ${errorData.error?.message || 'Sin detalles adicionales'}`
            );
        }

        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            throw new Error("No se encontraron imágenes");
        }

        imagenesOpciones.innerHTML = "";
        const imagenes = data.items.slice(0, API_CONFIG.maxResults);
        
        imagenes.forEach((imagen, index) => {
            const imgContainer = document.createElement("div");
            imgContainer.className = "imagen-opcion";
            
            const imgElement = document.createElement("img");
            imgElement.src = imagen.link;
            imgElement.alt = `Opción ${index + 1}`;
            imgElement.style.width = "150px";
            imgElement.style.height = "150px";
            imgElement.style.objectFit = "cover";
            imgElement.style.margin = "10px";
            imgElement.style.cursor = "pointer";
            imgElement.style.borderRadius = "8px";
            imgElement.style.border = "2px solid #ddd";
            imgElement.style.transition = "all 0.3s ease";

            imgElement.addEventListener("mouseover", () => {
                imgElement.style.transform = "scale(1.05)";
                imgElement.style.borderColor = "#e84141";
            });

            imgElement.addEventListener("mouseout", () => {
                imgElement.style.transform = "scale(1)";
                imgElement.style.borderColor = "#ddd";
            });

            imgElement.addEventListener("click", () => seleccionarImagen(imagen.link));
            
            imgContainer.appendChild(imgElement);
            imagenesOpciones.appendChild(imgContainer);
        });

    } catch (error) {
        console.error("Error al buscar imágenes:", error);
        
        // Mostrar mensaje de error amigable
        imagenesOpciones.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #e84141; margin-bottom: 15px;">
                    No pudimos cargar las imágenes automáticamente.
                </p>
                <p style="margin-bottom: 15px;">
                    Por favor, sube una imagen manualmente usando el botón "Seleccionar archivo" de abajo.
                </p>
                <p style="font-size: 0.9em; color: #666;">
                    (Error: ${error.message})
                </p>
            </div>
        `;
    }
});

function seleccionarImagen(url) {
    // Crear o actualizar el input hidden
    let inputHidden = document.querySelector('input[name="imagenSeleccionada"]');
    if (!inputHidden) {
        inputHidden = document.createElement("input");
        inputHidden.type = "hidden";
        inputHidden.name = "imagenSeleccionada";
        document.getElementById("producto-form").appendChild(inputHidden);
    }
    
    inputHidden.value = url;
    
    // Mostrar confirmación visual
    const mensaje = document.createElement("div");
    mensaje.style.color = "#4CAF50";
    mensaje.style.padding = "10px";
    mensaje.style.marginTop = "10px";
    mensaje.style.textAlign = "center";
    mensaje.textContent = "✓ Imagen seleccionada correctamente";
    
    const imagenesResultados = document.getElementById("imagenes-resultados");
    imagenesResultados.appendChild(mensaje);
    
    // Ocultar después de 2 segundos
    setTimeout(() => {
        imagenesResultados.style.display = "none";
        mensaje.remove();
    }, 2000);
}

