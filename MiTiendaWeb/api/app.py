from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import json
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', template_folder='templates')

productos_file_path = os.path.join('api', 'productos.json')
imagenes_folder = 'images'

os.makedirs(imagenes_folder, exist_ok=True)

def leer_productos():
    if not os.path.exists(productos_file_path):
        return []
    with open(productos_file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def guardar_productos(productos):
    with open(productos_file_path, 'w', encoding='utf-8') as f:
        json.dump(productos, f, ensure_ascii=False, indent=4)

@app.route('/api/productos.json', methods=['GET', 'POST', 'DELETE'])
def manejar_productos():
    if request.method == 'GET':
        return jsonify(leer_productos())

    elif request.method == 'POST':
        data = request.form
        img = data.get('img')  # Puede ser una URL externa

        if not img:
            return jsonify({"message": "Se requiere una imagen"}), 400

        nuevo_producto = {
            "id": int(data['id']),
            "img": img,  # Puede ser una URL externa o un archivo local
            "nombre": data['nombre'],
            "precio": float(data['precio']),
            "categoria": data['categoria'],
            "tallas": json.loads(data['tallas']),
        }

        productos = leer_productos()
        productos.append(nuevo_producto)
        guardar_productos(productos)
        return jsonify({"message": "Producto agregado exitosamente"}), 201

    elif request.method == 'DELETE':
        data = request.get_json()
        productos = leer_productos()
        productos = [prod for prod in productos if prod['id'] != data['id']]
        guardar_productos(productos)
        return jsonify({"message": "Producto eliminado exitosamente"}), 200

@app.route('/images/<path:filename>')
def servir_imagen(filename):
    if filename.startswith("http") or filename.startswith("https"):
        return jsonify({"message": "No se pueden servir URLs externas desde /images"}), 400
    return send_from_directory(imagenes_folder, filename)

@app.route('/')
def dashboard():
    return render_template('indexDash.html')

if __name__ == '__main__':
    app.run(debug=True, port=3000)
