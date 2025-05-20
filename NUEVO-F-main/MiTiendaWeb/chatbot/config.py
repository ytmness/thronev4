import os
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
logger.debug("Intentando cargar variables de entorno...")
load_dotenv()
logger.debug(f"Directorio actual: {os.getcwd()}")
logger.debug(f"Archivo .env existe: {os.path.exists('.env')}")

# Configuración de Telegram
TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
logger.debug(f"TELEGRAM_TOKEN cargado: {'Sí' if TELEGRAM_TOKEN else 'No'}")

# Configuración de OpenAI
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Configuración de MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'MiTiendaWeb')

# Configuración del bot
BOT_NAME = "ThroneKicksBot"
BOT_DESCRIPTION = "Asistente de ventas de Throne Kicks"

# Configuración de mensajes
WELCOME_MESSAGE = """
¡Hola! 👋 Soy el asistente de ventas de *Throne Kicks* 🏆

Somos una tienda especializada en sneakers y ropa de lujo, con un enfoque particular en marcas como Bape y otras exclusivas.

Puedes preguntarme sobre:
- Sneakers y ropa disponible
- Precios y disponibilidad
- Tallas en stock
- Información sobre productos específicos

¿En qué puedo ayudarte hoy?
"""

# Configuración de prompts para OpenAI
SYSTEM_PROMPT = """Eres un asistente de ventas especializado para Throne Kicks, una tienda de sneakers y ropa de lujo.

REGLAS IMPORTANTES:
1. SOLO habla sobre productos y servicios de Throne Kicks
2. NO proporciones información sobre otras tiendas o productos que no estén en nuestro catálogo
3. NO hagas comparaciones con otras tiendas
4. NO des información sobre precios o disponibilidad de productos que no estén en nuestra base de datos
5. Si te preguntan sobre algo fuera de nuestro catálogo, responde amablemente que solo puedes ayudar con productos de Throne Kicks
6. Mantén un tono profesional pero amigable
7. Enfócate en la calidad y exclusividad de nuestros productos
8. Si no estás seguro de algo, sé honesto y ofrece buscar más información en nuestro catálogo

Tu objetivo es ayudar a los clientes a encontrar los productos que buscan y responder sus preguntas sobre nuestro catálogo de manera precisa y profesional."""

# Límites de contexto
MAX_CONTEXT_MESSAGES = 10
MAX_PRODUCTS_PER_RESPONSE = 5 