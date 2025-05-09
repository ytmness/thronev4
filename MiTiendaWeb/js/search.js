console.log("search.js cargado correctamente");

// Función de búsqueda
function buscarProducto() {
    const input = document.getElementById('search-input').value.toLowerCase(); // Obtener lo que el usuario busca

    if (input) {
        // Mostrar pantalla de carga
        document.getElementById('loading-screen').style.display = 'flex';

        // Redirigir a la página de resultados con el término de búsqueda
        setTimeout(() => {
            window.location.href = `resultados.html?query=${encodeURIComponent(input)}`;
        }, 500); // Tiempo del retraso antes de la redirección para mostrar la pantalla de carga
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
