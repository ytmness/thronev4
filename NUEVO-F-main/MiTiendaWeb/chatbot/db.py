from pymongo import MongoClient
from config import MONGO_URI, MONGO_DB_NAME
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[MONGO_DB_NAME]
            self.productos = self.db.productos
            self.pedidos = self.db.pedidos
            logger.info("✅ Conexión exitosa a MongoDB")
        except Exception as e:
            logger.error(f"❌ Error al conectar con MongoDB: {e}")
            raise

    def buscar_productos(self, query=None, limit=5):
        """
        Busca productos en la base de datos
        query: diccionario con criterios de búsqueda
        limit: número máximo de productos a retornar
        """
        try:
            if query is None:
                query = {}
            
            productos = list(self.productos.find(query).limit(limit))
            # Convertir ObjectId a string para serialización
            for producto in productos:
                producto['_id'] = str(producto['_id'])
            return productos
        except Exception as e:
            logger.error(f"Error al buscar productos: {e}")
            return []

    def buscar_por_categoria(self, categoria, limit=5):
        """Busca productos por categoría"""
        return self.buscar_productos({'categoria': categoria}, limit)

    def buscar_por_nombre(self, nombre, limit=5):
        """Busca productos por nombre (búsqueda parcial)"""
        return self.buscar_productos(
            {'nombre': {'$regex': nombre, '$options': 'i'}}, 
            limit
        )

    def obtener_categorias(self):
        """Obtiene lista de categorías únicas"""
        try:
            return self.productos.distinct('categoria')
        except Exception as e:
            logger.error(f"Error al obtener categorías: {e}")
            return []

    def verificar_stock(self, producto_id, talla):
        """Verifica el stock disponible de un producto"""
        try:
            producto = self.productos.find_one({'_id': producto_id})
            if producto and 'tallas' in producto:
                return producto['tallas'].get(talla, 0)
            return 0
        except Exception as e:
            logger.error(f"Error al verificar stock: {e}")
            return 0

# Instancia global de la base de datos
db = Database() 