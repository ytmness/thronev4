# Configuración de MongoDB
MONGO_URI = 'mongodb://localhost:27017/'  # URL base de MongoDB
MONGO_DB_NAME = 'mitienda'  # Nombre de la base de datos

# Configuración de la aplicación
SECRET_KEY = 'tu_clave_secreta_aqui'  # Cambiar en producción
DEBUG = True

# Configuración de CORS
CORS_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
]

# Configuración de la API
API_VERSION = 'v1'
API_PREFIX = '/api'

# Configuración de pedidos
ESTADOS_PEDIDO = {
    'pending': 'Pendiente',
    'processing': 'En proceso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
}

METODOS_ENTREGA = {
    'pickup': 'Pickup en Tienda',
    'delivery': 'Envío a Domicilio'
}

UBICACIONES_PICKUP = {
    'san-patricio': {
        'nombre': 'San Patricio',
        'direccion': 'Avenida Batallón De San Patricio #1000, Residencial San Agustín, Zona San Agustín, 66260 Monterrey, N.L.'
    },
    'insurgentes': {
        'nombre': 'Insurgentes',
        'direccion': 'Av Insurgentes 2500, Sin Nombre de Col 31, 64620 Monterrey, N.L.'
    }
} 