from flask import Flask, request, jsonify, render_template, send_from_directory, session, redirect, url_for
import os
import json
from werkzeug.utils import secure_filename
from datetime import datetime
from functools import wraps
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId
from config import *

app = Flask(__name__, 
    static_folder='static',
    template_folder='templates',
    static_url_path='/static')

# Configurar CORS para permitir todas las origenes en desarrollo
CORS(app, resources={r"/*": {"origins": "*"}})

# Configurar la aplicación
app.config['SECRET_KEY'] = SECRET_KEY
app.config['DEBUG'] = True
app.config['JSON_AS_ASCII'] = False

# Inicializar MongoDB con manejo de errores
try:
    # Intentar conectar a MongoDB
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    client.server_info()
    db = client[MONGO_DB_NAME]
    pedidos_collection = db.pedidos
    print("✅ Conexión exitosa a MongoDB")
except Exception as e:
    print("⚠️ No se pudo conectar a MongoDB, usando archivo JSON como respaldo")
    db = None
    pedidos_collection = None

app.secret_key = os.urandom(24)  # Clave secreta para las sesiones

# Obtener la ruta absoluta del directorio actual
current_dir = os.path.dirname(os.path.abspath(__file__))
productos_file_path = os.path.join(current_dir, 'productos.json')
admins_file_path = os.path.join(current_dir, 'admins.json')
imagenes_folder = os.path.join(current_dir, 'static', 'img', 'productos')

# Asegurarse de que exista el directorio de imágenes
os.makedirs(imagenes_folder, exist_ok=True)

# Decorador para proteger rutas que requieren autenticación
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Recurso no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500

def leer_productos():
    try:
        if not os.path.exists(productos_file_path):
            print(f"El archivo no existe en: {productos_file_path}")
            return []
            
        with open(productos_file_path, 'r', encoding='utf-8') as f:
            contenido = f.read()
            if not contenido.strip():
                return []
            try:
                return json.loads(contenido)
            except json.JSONDecodeError as e:
                print(f"Error al decodificar JSON: {e}")
                print(f"Contenido del archivo: {contenido}")
                return []
    except Exception as e:
        print(f"Error al leer productos: {e}")
        return []

def guardar_productos(productos):
    try:
        with open(productos_file_path, 'w', encoding='utf-8') as f:
            json.dump(productos, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"Error al guardar productos: {e}")
        return False

def leer_admins():
    try:
        if not os.path.exists(admins_file_path):
            return []
        with open(admins_file_path, 'r', encoding='utf-8') as f:
            return json.load(f).get('admins', [])
    except Exception as e:
        print(f"Error al leer administradores: {e}")
        return []

def guardar_admins(admins):
    try:
        with open(admins_file_path, 'w', encoding='utf-8') as f:
            json.dump({'admins': admins}, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"Error al guardar administradores: {e}")
        return False

@app.route('/login', methods=['GET'])
def login():
    if 'admin_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    try:
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Datos incompletos'}), 400

        admins = leer_admins()
        admin = next((a for a in admins if a['username'] == data['username'] and a['password'] == data['password']), None)

        if admin:
            # Actualizar último acceso
            admin['ultimo_acceso'] = datetime.now().isoformat()
            guardar_admins(admins)
            
            # Guardar en sesión
            session['admin_id'] = admin['id']
            session['admin_nombre'] = admin['nombre']
            session['admin_rol'] = admin['rol']
            
            return jsonify({'mensaje': 'Login exitoso'}), 200
        else:
            return jsonify({'error': 'Usuario o contraseña incorrectos'}), 401

    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "ok", "message": "Servidor funcionando"})

@app.route('/')
@login_required
def dashboard():
    return render_template('indexDash.html')

@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    try:
        if db is not None:
            productos = list(db.productos.find())
            for producto in productos:
                producto['_id'] = str(producto['_id'])
        else:
            productos = leer_productos()
        return jsonify(productos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    try:
        datos = request.json
        # Validar datos requeridos
        campos_requeridos = ['nombre', 'marca', 'precio', 'categoria', 'img', 'tallas']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400

        # Crear nuevo producto
        producto = {
            'id': int(datetime.utcnow().timestamp() * 1000),  # ID único basado en timestamp
            'nombre': datos['nombre'],
            'marca': datos['marca'],
            'precio': float(datos['precio']),
            'categoria': datos['categoria'],
            'img': datos['img'],
            'tallas': datos['tallas']
        }

        if db is not None:
            resultado = db.productos.insert_one(producto)
            producto['_id'] = str(resultado.inserted_id)
        else:
            productos = leer_productos()
            productos.append(producto)
            if not guardar_productos(productos):
                raise Exception("Error al guardar el producto")
            producto['_id'] = str(producto['id'])

        return jsonify(producto), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/productos/<id>', methods=['PUT'])
def actualizar_producto(id):
    try:
        datos = request.json
        # Validar datos requeridos
        campos_requeridos = ['nombre', 'marca', 'precio', 'categoria', 'img', 'tallas']
        for campo in campos_requeridos:
            if campo not in datos:
                return jsonify({'error': f'Campo requerido: {campo}'}), 400

        if db is not None:
            if not ObjectId.is_valid(id):
                return jsonify({'error': 'ID de producto inválido'}), 400

            actualizacion = {
                'nombre': datos['nombre'],
                'marca': datos['marca'],
                'precio': float(datos['precio']),
                'categoria': datos['categoria'],
                'img': datos['img'],
                'tallas': datos['tallas']
            }

            resultado = db.productos.update_one(
                {'_id': ObjectId(id)},
                {'$set': actualizacion}
            )

            if resultado.matched_count == 0:
                return jsonify({'error': 'Producto no encontrado'}), 404

            producto_actualizado = db.productos.find_one({'_id': ObjectId(id)})
            producto_actualizado['_id'] = str(producto_actualizado['_id'])
        else:
            productos = leer_productos()
            producto = next((p for p in productos if str(p['id']) == id), None)
            if not producto:
                return jsonify({'error': 'Producto no encontrado'}), 404

            producto.update({
                'nombre': datos['nombre'],
                'marca': datos['marca'],
                'precio': float(datos['precio']),
                'categoria': datos['categoria'],
                'img': datos['img'],
                'tallas': datos['tallas']
            })

            if not guardar_productos(productos):
                raise Exception("Error al guardar el producto")
            producto_actualizado = producto

        return jsonify(producto_actualizado)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/productos/<id>', methods=['DELETE'])
def eliminar_producto(id):
    try:
        if db is not None:
            if not ObjectId.is_valid(id):
                return jsonify({'error': 'ID de producto inválido'}), 400

            resultado = db.productos.delete_one({'_id': ObjectId(id)})
            if resultado.deleted_count == 0:
                return jsonify({'error': 'Producto no encontrado'}), 404
        else:
            productos = leer_productos()
            producto = next((p for p in productos if str(p['id']) == id), None)
            if not producto:
                return jsonify({'error': 'Producto no encontrado'}), 404

            productos.remove(producto)
            if not guardar_productos(productos):
                raise Exception("Error al guardar los productos")

        return jsonify({'mensaje': 'Producto eliminado correctamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/img/productos/<path:filename>')
def servir_imagen(filename):
    try:
        if filename.startswith(("http://", "https://")):
            return jsonify({"error": "No se pueden servir URLs externas"}), 400
        return send_from_directory(imagenes_folder, filename)
    except Exception as e:
        return jsonify({"error": f"Error al servir imagen: {str(e)}"}), 500

# Endpoints para pedidos
@app.route('/api/pedidos', methods=['GET'])
def obtener_pedidos():
    try:
        if pedidos_collection is not None:
            pedidos = list(pedidos_collection.find().sort('fecha', -1))
            for pedido in pedidos:
                pedido['_id'] = str(pedido['_id'])
            return jsonify(pedidos)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pedidos/<numero_pedido>', methods=['GET'])
def obtener_pedido(numero_pedido):
    try:
        if pedidos_collection is not None:
            pedido = pedidos_collection.find_one({'numero_pedido': numero_pedido})
            if pedido:
                pedido['_id'] = str(pedido['_id'])
                return jsonify(pedido)
            return jsonify({'error': 'Pedido no encontrado'}), 404
        else:
            return jsonify({'error': 'Base de datos no disponible'}), 503
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pedidos', methods=['POST'])
def crear_pedido():
    try:
        datos = request.json
        print("Datos recibidos en /api/pedidos:", datos)  # Debug
        if pedidos_collection is None:
            return jsonify({'error': 'Base de datos no disponible'}), 503

        # Permitir ambos formatos de campo para numero de pedido
        numero_pedido = datos.get('numeroPedido') or datos.get('numero_pedido')
        if not numero_pedido:
            print("Falta el campo requerido: numeroPedido")
            return jsonify({'error': 'Campo requerido: numeroPedido'}), 400

        # Validar los demás campos
        for campo in ['total', 'cliente', 'entrega', 'items']:
            if campo not in datos:
                print(f"Falta el campo requerido: {campo}")
                return jsonify({'error': f'Campo requerido: {campo}'}), 400

        # Aceptar total como string o número
        if isinstance(datos['total'], str):
            total = float(datos['total'].replace('$', '').replace('MXN', '').replace(',', '').strip())
        else:
            total = float(datos['total'])

        pedido = {
            'numero_pedido': numero_pedido,
            'fecha': datetime.utcnow(),
            'estado': 'pending',
            'total': total,
            'cliente': datos['cliente'],
            'entrega': datos['entrega'],
            'items': datos['items']
        }

        resultado = pedidos_collection.insert_one(pedido)
        pedido['_id'] = str(resultado.inserted_id)

        # RESTAR STOCK DE CADA PRODUCTO Y TALLA
        if db is not None:
            for item in datos['items']:
                producto_id = item.get('_id') or item.get('id_original') or item.get('id')
                talla = item.get('tallaSeleccionada')
                if producto_id and talla:
                    # Buscar el producto por _id o id_original
                    prod_query = {'_id': ObjectId(producto_id)} if ObjectId.is_valid(str(producto_id)) else {'id_original': str(producto_id)}
                    producto_db = db.productos.find_one(prod_query)
                    if producto_db and 'tallas' in producto_db and talla in producto_db['tallas']:
                        nuevo_stock = max(0, int(producto_db['tallas'][talla]) - 1)
                        db.productos.update_one(prod_query, {'$set': {f'tallas.{talla}': nuevo_stock}})

        return jsonify(pedido), 201
    except Exception as e:
        print("Error en /api/pedidos:", e)  # Debug
        return jsonify({'error': str(e)}), 500

@app.route('/api/pedidos/<numero_pedido>', methods=['PATCH'])
def actualizar_pedido(numero_pedido):
    try:
        if pedidos_collection is None:
            return jsonify({'error': 'Base de datos no disponible'}), 503

        datos = request.json
        if 'estado' in datos:
            estados_validos = ['pending', 'processing', 'completed', 'cancelled']
            if datos['estado'] not in estados_validos:
                return jsonify({'error': 'Estado no válido'}), 400

            resultado = pedidos_collection.update_one(
                {'numero_pedido': numero_pedido},
                {'$set': {'estado': datos['estado']}}
            )

            if resultado.matched_count == 0:
                return jsonify({'error': 'Pedido no encontrado'}), 404

            pedido = pedidos_collection.find_one({'numero_pedido': numero_pedido})
            pedido['_id'] = str(pedido['_id'])
            return jsonify(pedido)

        return jsonify({'error': 'No se proporcionaron datos para actualizar'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pedidos/<numero_pedido>', methods=['DELETE'])
def eliminar_pedido(numero_pedido):
    try:
        if pedidos_collection is None:
            return jsonify({'error': 'Base de datos no disponible'}), 503

        resultado = pedidos_collection.delete_one({'numero_pedido': numero_pedido})
        if resultado.deleted_count == 0:
            return jsonify({'error': 'Pedido no encontrado'}), 404

        return jsonify({'mensaje': 'Pedido eliminado exitosamente'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Agregar una ruta de prueba para verificar la conexión
@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        if db is not None:
            db.command('ping')
            return jsonify({
                'status': 'success',
                'message': 'Conexión a MongoDB establecida correctamente',
                'database': MONGO_DB_NAME,
                'collections': db.list_collection_names()
            })
        else:
            return jsonify({
                'status': 'warning',
                'message': 'Usando archivo JSON como respaldo',
                'database': 'N/A',
                'collections': []
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error al conectar con MongoDB: {str(e)}'
        }), 500

if __name__ == '__main__':
    try:
        print("🚀 Iniciando servidor en http://127.0.0.1:3000")
        app.run(
            debug=True,
            port=3000,
            host='127.0.0.1',  # Usar 127.0.0.1 en lugar de localhost
            use_reloader=False  # Desactivar el reloader automático
        )
    except Exception as e:
        print(f"❌ Error al iniciar el servidor: {str(e)}")
