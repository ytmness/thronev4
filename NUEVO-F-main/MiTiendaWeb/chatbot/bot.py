import logging
from telegram import Update
from telegram.ext import Updater, MessageHandler, Filters, CallbackContext
from config import TELEGRAM_TOKEN, WELCOME_MESSAGE
from db import db
from openai_utils import openai_manager
import re

# Configurar logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Diccionario para mantener el contexto de cada usuario
user_contexts = {}

def start(update: Update, context: CallbackContext):
    """Maneja el primer mensaje del usuario"""
    user_id = update.effective_user.id
    user_contexts[user_id] = []  # Inicializar contexto vacío
    update.message.reply_text(WELCOME_MESSAGE)

def construir_regex_nombre(nombre):
    # Reemplaza espacios por \s* y rodea con \b para palabra completa
    nombre_regex = r'\b' + re.sub(r'\s+', r'\\s*', nombre.strip()) + r'\b'
    return re.compile(nombre_regex, re.IGNORECASE)

def buscar_productos_flexible(user_message, search_params):
    filtro = {}
    # Filtros principales usando $regex
    if 'nombre' in search_params and search_params['nombre']:
        # Regex estricto: palabra completa, flexible con espacios
        nombre_regex = r'\b' + re.sub(r'\s+', r'\\s*', search_params['nombre'].strip()) + r'\b'
        filtro['nombre'] = {'$regex': nombre_regex, '$options': 'i'}
    if 'marca' in search_params and search_params['marca']:
        filtro['marca'] = {'$regex': search_params['marca'], '$options': 'i'}
    if 'categoria' in search_params and search_params['categoria']:
        filtro['categoria'] = {'$regex': search_params['categoria'], '$options': 'i'}
    if 'precio_max' in search_params:
        filtro['precio'] = {'$lte': float(search_params['precio_max'])}
    if 'talla' in search_params and search_params['talla']:
        talla = str(search_params['talla']).strip()
        filtro[f'tallas.{talla}'] = {'$gt': 0}
    if 'tags' in search_params and search_params['tags']:
        filtro['tags'] = {'$in': [re.compile(tag, re.IGNORECASE) for tag in search_params['tags']]}
    productos = db.buscar_productos(filtro, limit=20)
    if productos:
        return productos

    # Búsqueda progresiva: si no hay resultados, relajar filtros
    # 1. Buscar por frase completa en nombre, marca o categoría
    filtro = {
        "$or": [
            {"nombre": {'$regex': user_message, '$options': 'i'}},
            {"marca": {'$regex': user_message, '$options': 'i'}},
            {"categoria": {'$regex': user_message, '$options': 'i'}}
        ]
    }
    productos = db.buscar_productos(filtro, limit=20)
    if productos:
        return productos

    # 2. Buscar por cada palabra clave individualmente
    keywords = re.findall(r'\w+', user_message.lower())
    for kw in keywords:
        filtro = {
            "$or": [
                {"nombre": {'$regex': kw, '$options': 'i'}},
                {"marca": {'$regex': kw, '$options': 'i'}},
                {"categoria": {'$regex': kw, '$options': 'i'}}
            ]
        }
        productos = db.buscar_productos(filtro, limit=20)
        if productos:
            return productos
    return []

def handle_message(update: Update, context: CallbackContext):
    """Maneja todos los mensajes de texto"""
    user_id = update.effective_user.id
    user_message = update.message.text

    # Si es el primer mensaje del usuario, enviar mensaje de bienvenida
    if user_id not in user_contexts:
        start(update, context)
        return

    # Obtener respuesta de OpenAI
    context_hist = user_contexts.get(user_id, [])
    response = openai_manager.get_response(user_message, context_hist)

    # Actualizar contexto
    user_contexts[user_id].extend([
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": response}
    ])

    # Extraer parámetros de búsqueda
    search_params = openai_manager.extract_product_query(user_message)
    productos = buscar_productos_flexible(user_message, search_params)

    if productos:
        product_response = "🔍 *Productos encontrados:*\n\n"
        for prod in productos:
            precio_formateado = f"${prod['precio']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            product_response += f"*{prod['nombre']}*\n"
            product_response += f"🏷️ Marca: {prod.get('marca', 'No especificada')}\n"
            product_response += f"💰 Precio: {precio_formateado}\n"
            product_response += f"📦 Categoría: {prod.get('categoria', 'No especificada')}\n"
            # Mostrar tallas disponibles si existen
            if 'tallas' in prod and isinstance(prod['tallas'], dict):
                tallas_disponibles = []
                for talla, stock in prod['tallas'].items():
                    if stock > 0:
                        tallas_disponibles.append(f"{talla} ({stock})")
                if tallas_disponibles:
                    product_response += f"📏 Tallas disponibles: {', '.join(tallas_disponibles)}\n"
            if 'imagen' in prod and prod['imagen']:
                product_response += f"🖼️ [Ver imagen]({prod['imagen']})\n"
            product_response += "\n"
        update.message.reply_text(
            f"{response}\n\n{product_response}", 
            parse_mode='Markdown',
            disable_web_page_preview=True
        )
    else:
        update.message.reply_text(
            f"{response}\n\nNo encontré productos que coincidan con tu búsqueda. ¿Podrías ser más específico?"
        )

def main():
    """Función principal que inicia el bot"""
    try:
        # Crear el updater
        updater = Updater(TELEGRAM_TOKEN)

        # Obtener el dispatcher para registrar handlers
        dispatcher = updater.dispatcher

        # Agregar handler para todos los mensajes de texto
        dispatcher.add_handler(MessageHandler(Filters.text, handle_message))

        # Iniciar el bot
        logger.info("🚀 Iniciando bot...")
        updater.start_polling()
        updater.idle()

    except Exception as e:
        logger.error(f"Error al iniciar el bot: {e}")

if __name__ == '__main__':
    main() 