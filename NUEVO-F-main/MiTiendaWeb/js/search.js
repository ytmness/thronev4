console.log("search.js cargado correctamente");

// Función de búsqueda
function buscarProducto() {
    const input = document.getElementById('search-input').value.toLowerCase(); // Obtener lo que el usuario busca

    if (input) {
        // Mostrar pantalla de carga
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            
            // Animación de puntos suspensivos
            let dots = 0;
            const dotsElement = document.getElementById('dots');
            const dotsInterval = setInterval(() => {
                dots = (dots + 1) % 4;
                if (dotsElement) {
                    dotsElement.textContent = '.'.repeat(dots);
                }
            }, 500);

            // Redirigir a la página de resultados con el término de búsqueda
            setTimeout(() => {
                clearInterval(dotsInterval);
                window.location.href = `resultados.html?query=${encodeURIComponent(input)}`;
            }, 800); // Tiempo del retraso antes de la redirección
        } else {
            // Si no hay pantalla de carga, redirigir inmediatamente
            window.location.href = `resultados.html?query=${encodeURIComponent(input)}`;
        }
    } else {
        alert('Por favor ingresa un término de búsqueda.');
    }
}

// Asegurarse de que el botón de búsqueda active la función al hacer clic
const searchButton = document.getElementById('search-button');
if (searchButton) {
    searchButton.addEventListener('click', buscarProducto); // Cuando se haga clic, ejecuta la función de búsqueda
}

// También agregar un evento para que el buscador funcione al presionar Enter
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') { // Si se presiona Enter, busca
            buscarProducto();
        }
    });
}
