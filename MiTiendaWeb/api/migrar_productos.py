from pymongo import MongoClient
import json
import os
from datetime import datetime
from config import MONGO_URI, MONGO_DB_NAME

def migrar_productos():
    try:
        # Conectar a MongoDB
        client = MongoClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        productos_collection = db.productos

        # Obtener la ruta del archivo productos.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        productos_file_path = os.path.join(current_dir, 'productos.json')

        # Leer productos del archivo JSON
        if not os.path.exists(productos_file_path):
            print("No se encontró el archivo productos.json")
            return

        with open(productos_file_path, 'r', encoding='utf-8') as f:
            productos = json.load(f)

        if not productos:
            print("No hay productos para migrar")
            return

        # Preparar productos para MongoDB
        productos_mongo = []
        for producto in productos:
            # Convertir el ID numérico a string para mantener compatibilidad
            producto_mongo = {
                'nombre': producto['nombre'],
                'marca': producto['marca'],
                'precio': float(producto['precio']),
                'categoria': producto['categoria'],
                'imagen': producto.get('img', producto.get('imagen', '')),
                'tallas': producto['tallas'],
                'fecha_creacion': datetime.utcnow(),
                'id_original': str(producto['id'])  # Guardar el ID original como referencia
            }
            productos_mongo.append(producto_mongo)

        # Limpiar colección existente
        productos_collection.delete_many({})

        # Insertar productos en MongoDB
        if productos_mongo:
            resultado = productos_collection.insert_many(productos_mongo)
            print(f"✅ Se migraron {len(resultado.inserted_ids)} productos exitosamente")
        else:
            print("No se encontraron productos para migrar")

    except Exception as e:
        print(f"❌ Error durante la migración: {str(e)}")
    finally:
        client.close()

if __name__ == '__main__':
    print("Iniciando migración de productos a MongoDB...")
    migrar_productos()
    print("Proceso de migración completado") 