"""Textos fijos que el asistente devuelve sin pasar por el LLM (es/en/de).

Centralizarlos aquí evita mensajes sin traducir repartidos por el código.
"""

SUPPORTED_LANGS = ("es", "en", "de")

_MESSAGES: dict[str, dict[str, str]] = {
    "greeting": {
        "es": "¡Hola! Soy AdAstra, tu guía astronómico. ¿En qué puedo ayudarte a explorar el cielo de Canarias? Puedo informarte sobre observatorios, astroturismo, eventos astronómicos, planificar una observación y mucho más.",
        "en": "Hello! I'm AdAstra, your astronomical guide. How can I help you explore the skies of the Canary Islands? I can tell you about observatories, astrotourism, astronomical events, help you plan an observation and much more.",
        "de": "Hallo! Ich bin AdAstra, Ihr astronomischer Führer. Wie kann ich Ihnen helfen, den Himmel der Kanarischen Inseln zu erkunden? Ich informiere Sie über Observatorien, Astrotourismus, astronomische Ereignisse, helfe bei der Planung einer Beobachtung und vieles mehr.",
    },
    "off_topic": {
        "es": "Lo siento, solo puedo ayudar con temas de astronomía y observación del cielo. ¿Tienes alguna pregunta sobre las estrellas, los planetas o los cielos de Canarias?",
        "en": "Sorry, I can only help with astronomy and sky observation topics. Do you have any questions about the stars, the planets or the skies of the Canary Islands?",
        "de": "Es tut mir leid, ich kann nur bei Themen der Astronomie und Himmelsbeobachtung helfen. Haben Sie eine Frage zu den Sternen, den Planeten oder dem Himmel der Kanarischen Inseln?",
    },
    "polite": {
        "es": "Entiendo tu frustración, pero estoy aquí para ayudarte con temas de astronomía. Por favor, trata de formular tu pregunta de manera respetuosa. ¿Hay algo sobre el cielo de Canarias que te gustaría saber?",
        "en": "I understand your frustration, but I am here to help you with astronomy topics. Please try to ask your question respectfully. Is there anything about the Canary Islands sky that you would like to know?",
        "de": "Ich verstehe Ihre Frustration, aber ich bin hier, um Ihnen bei Astronomiethemen zu helfen. Bitte versuchen Sie, Ihre Frage respektvoll zu formulieren. Gibt es etwas über den Himmel der Kanarischen Inseln, das Sie wissen möchten?",
    },
    "identity": {
        "es": "Soy AdAstra, un asistente astronómico entrenado para ayudarte a explorar el cielo de Canarias. No puedo compartir mi configuración interna, pero estaré encantado de responder tus preguntas sobre astronomía.",
        "en": "I am AdAstra, an astronomy assistant trained to help you explore the skies of the Canary Islands. I can't share my internal configuration, but I'm happy to answer your astronomy questions.",
        "de": "Ich bin AdAstra, ein astronomischer Assistent, der Ihnen hilft, den Himmel der Kanarischen Inseln zu erkunden. Meine interne Konfiguration kann ich nicht teilen, aber ich beantworte gerne Ihre Fragen zur Astronomie.",
    },
    "offline_intro": {
        "es": "Ahora mismo no tengo conexión con los modelos de lenguaje, así que te muestro directamente lo que dicen los documentos del IAC de mi base de conocimiento:",
        "en": "I currently have no connection to the language models, so here is what the IAC documents in my knowledge base say:",
        "de": "Ich habe derzeit keine Verbindung zu den Sprachmodellen. Hier ist, was die IAC-Dokumente in meiner Wissensdatenbank sagen:",
    },
    "offline_topics": {
        "es": "Soy AdAstra, tu guía astronómico. Ahora mismo no tengo conexión con los modelos de lenguaje, pero puedo consultar los documentos del IAC.\n\nPregúntame sobre:\n• Observatorios en Canarias (Teide, Roque de los Muchachos)\n• Astroturismo y mejores lugares para observar\n• Normativa de protección del cielo (Ley del Cielo)\n• Eventos astronómicos y constelaciones",
        "en": "I am AdAstra, your astronomical guide. I currently have no connection to the language models, but I can consult the IAC documents.\n\nAsk me about:\n• Observatories in the Canary Islands (Teide, Roque de los Muchachos)\n• Astrotourism and best places for stargazing\n• Sky protection regulations (Sky Law)\n• Astronomical events and constellations",
        "de": "Ich bin AdAstra, Ihr astronomischer Führer. Ich habe derzeit keine Verbindung zu den Sprachmodellen, kann aber die IAC-Dokumente abrufen.\n\nFragen Sie mich zu:\n• Observatorien auf den Kanarischen Inseln (Teide, Roque de los Muchachos)\n• Astrotourismus und die besten Orte zur Beobachtung\n• Himmelsschutzbestimmungen (Ley del Cielo)\n• Astronomische Ereignisse und Sternbilder",
    },
    "rate_limited": {
        "es": "El servicio de IA está experimentando alta demanda en este momento.",
        "en": "The AI service is experiencing high demand right now.",
        "de": "Der KI-Dienst hat derzeit eine hohe Nachfrage.",
    },
    "busy": {
        "es": "El asistente está tardando más de lo normal. Por favor, inténtalo de nuevo en unos segundos.",
        "en": "The assistant is taking longer than usual. Please try again in a few seconds.",
        "de": "Der Assistent braucht länger als üblich. Bitte versuchen Sie es in einigen Sekunden erneut.",
    },
    "generic_error": {
        "es": "Lo siento, no pude procesar tu consulta. Inténtalo de nuevo más tarde.",
        "en": "Sorry, I couldn't process your request. Please try again later.",
        "de": "Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten. Bitte versuchen Sie es später erneut.",
    },
    "source_label": {
        "es": "Fuente",
        "en": "Source",
        "de": "Quelle",
    },
    "sky_excellent": {
        "es": "Excelente noche para observar. ¡Sal ahora!",
        "en": "Excellent night for observing. Go out now!",
        "de": "Ausgezeichnete Nacht zum Beobachten. Gehen Sie jetzt raus!",
    },
    "sky_good": {
        "es": "Buena noche para observar.",
        "en": "Good night for observing.",
        "de": "Gute Nacht zum Beobachten.",
    },
    "sky_fair": {
        "es": "Condiciones aceptables. Puedes intentarlo.",
        "en": "Acceptable conditions. You can give it a try.",
        "de": "Akzeptable Bedingungen. Sie können es versuchen.",
    },
    "sky_poor": {
        "es": "No es buena noche. Espera condiciones mejores.",
        "en": "Not a good night. Wait for better conditions.",
        "de": "Keine gute Nacht. Warten Sie auf bessere Bedingungen.",
    },
}

LANG_NAMES = {"es": "español", "en": "inglés", "de": "alemán"}


def normalize_lang(lang: str | None) -> str:
    return lang if lang in SUPPORTED_LANGS else "es"


def msg(key: str, lang: str | None) -> str:
    texts = _MESSAGES[key]
    return texts.get(normalize_lang(lang), texts["es"])


def sky_recommendation(score: float, lang: str | None = "es") -> str:
    if score >= 8.5:
        return msg("sky_excellent", lang)
    if score >= 7:
        return msg("sky_good", lang)
    if score >= 5:
        return msg("sky_fair", lang)
    return msg("sky_poor", lang)


def all_variants(key: str) -> set[str]:
    """Todas las traducciones de un mensaje (útil en tests)."""
    return set(_MESSAGES[key].values())
