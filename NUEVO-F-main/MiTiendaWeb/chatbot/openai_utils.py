import openai
from config import OPENAI_API_KEY, SYSTEM_PROMPT, MAX_CONTEXT_MESSAGES
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear cliente OpenAI
client = openai.OpenAI(api_key=OPENAI_API_KEY)

class OpenAIManager:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT

    def get_response(self, user_message, context=None):
        """
        Obtiene una respuesta de OpenAI basada en el mensaje del usuario y el contexto
        """
        try:
            # Preparar mensajes para OpenAI
            messages = [{"role": "system", "content": self.system_prompt}]
            
            # Agregar contexto si existe
            if context:
                # Limitar el contexto a los últimos N mensajes
                context = context[-MAX_CONTEXT_MESSAGES:]
                messages.extend(context)
            
            # Agregar el mensaje actual del usuario
            messages.append({"role": "user", "content": user_message})

            # Obtener respuesta de OpenAI
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=150
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error al obtener respuesta de OpenAI: {e}")
            return "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo."

    def extract_product_query(self, message):
        """
        Extrae información relevante para búsqueda de productos del mensaje
        Retorna un diccionario con los criterios de búsqueda
        """
        try:
            # Usar OpenAI para extraer información relevante
            prompt = f"""
            Eres un asistente especializado en extraer información de búsqueda para Throne Kicks, una tienda de sneakers y ropa de lujo.

            Extrae información relevante para buscar productos del siguiente mensaje.
            Retorna un JSON con los siguientes campos si están presentes:
            - categoria: categoría del producto (ej: "Ropa", "Sneakers")
            - nombre: nombre o palabras clave del producto
            - marca: marca del producto (ej: "Bape", "Nike", "Adidas")
            - precio_max: precio máximo (si se menciona, en formato numérico sin símbolos)
            - talla: talla mencionada (si aplica)

            Ejemplos de extracción:
            - "quiero una camisa de Bape" -> {{"marca": "Bape", "categoria": "Ropa"}}
            - "busco sneakers de Nike por menos de 10000" -> {{"marca": "Nike", "precio_max": 10000, "categoria": "Sneakers"}}
            - "tienes Bape Full Zip" -> {{"marca": "Bape", "nombre": "Full Zip"}}
            - "muéstrame las zapatillas que tienen" -> {{"categoria": "Sneakers"}}

            IMPORTANTE:
            - Solo extrae información relevante para Throne Kicks
            - Ignora referencias a otras tiendas
            - Si el mensaje no es relevante para nuestra tienda, retorna un objeto vacío {{}}

            Mensaje: {message}

            Retorna solo el JSON, sin texto adicional.
            """

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Eres un asistente especializado en extraer información de búsqueda para Throne Kicks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=150
            )

            # Procesar la respuesta para obtener el JSON
            import json
            try:
                query = json.loads(response.choices[0].message.content)
                
                # Asegurarse de que precio_max sea un número si existe
                if 'precio_max' in query:
                    try:
                        query['precio_max'] = float(str(query['precio_max']).replace('$', '').replace(',', ''))
                    except:
                        del query['precio_max']
                
                # Normalizar categorías
                if 'categoria' in query:
                    categoria = query['categoria'].lower()
                    if 'zapatilla' in categoria or 'sneaker' in categoria or 'tenis' in categoria:
                        query['categoria'] = 'Sneakers'
                    elif 'ropa' in categoria or 'camisa' in categoria or 'hoodie' in categoria:
                        query['categoria'] = 'Ropa'
                
                return query
            except:
                return {}

        except Exception as e:
            logger.error(f"Error al extraer query de productos: {e}")
            return {}

# Instancia global del manejador de OpenAI
openai_manager = OpenAIManager() 