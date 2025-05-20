from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

try:
    # Intentar conectar a MongoDB
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
    # Verificar la conexión
    client.server_info()
    print("✅ Conexión exitosa a MongoDB")
    
    # Intentar crear/obtener la base de datos
    db = client['mitienda']
    print(f"✅ Base de datos 'mitienda' accesible")
    
    # Listar las colecciones existentes
    collections = db.list_collection_names()
    print(f"Colecciones existentes: {collections}")
    
except ConnectionFailure as e:
    print(f"❌ Error de conexión: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if 'client' in locals():
        client.close() 