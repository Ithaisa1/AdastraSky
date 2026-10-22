# Feedback de tu proyecto final — AdAstra Sky

Hola Ithaisa:

AdAstra Sky es un proyecto que se nota cuidado de principio a fin. No solo cumple: tiene mapas de calidad de cielo, un Sky Score calculado, eventos astronómicos, soporte trilingüe real (español, inglés y alemán) y un asistente IA apoyado en documentos del Instituto de Astrofísica de Canarias. Que esté desplegado en tres servicios, internacionalizado y con una documentación tan completa habla de tu madurez como desarrolladora. Y hay un detalle que me llamó especialmente la atención: tu historial de git cuenta la historia de alguien que se peleó con problemas reales de producción y los resolvió.

## Lo que más destaca

- **Tu agente está construido para no caerse.** En `ai-service/agent/agent.py` montas una cadena de fallback de modelos (Groq, luego OpenAI, luego HuggingFace), una caché de respuestas con TTL, un fast-path para saludos que evita llamar al LLM, e incluso un modo offline que responde solo con el RAG si no hay ningún modelo disponible. Esa obsesión por la resiliencia es justo lo que diferencia un proyecto de clase de uno pensado para usuarios reales.
- **Es un agente de verdad.** A diferencia de un pipeline fijo, usas `bind_tools`, un nodo de tools y aristas condicionales (`should_continue`): el modelo decide cuándo tirar del RAG, del clima, del observatorio o del Sky Score. La estructura agéntica está bien resuelta.
- **Trilingüe en serio.** Los prompts, las guardas, los mensajes de error y el RAG funcionan en ES/EN/DE de forma coherente. Mantener esa consistencia en tres idiomas no es trivial.
- **Guardas de seguridad pensadas.** El agente reconduce con educación los mensajes ofensivos, rechaza temas fuera de la astronomía y no revela su prompt. Eso es diseño de producto, no solo código.
- **Tu git habla bien de ti.** Commits como "fix: AI saturation - smaller Groq model, HF fallback, concurrency limit" demuestran que enfrentaste la saturación del servicio y la atacaste con varias estrategias a la vez. Es exactamente el tipo de experiencia que se valora.

## Nivel de madurez por área

El suelo es "Sólido" porque tu proyecto está aprobado y funciona; "Avanzado" y "Experto" marcan el camino.

| Área | Nivel | Comentario |
|------|-------|------------|
| Arquitectura y organización | Avanzado | Tres servicios; el ai-service especialmente bien organizado. |
| Backend y API | Avanzado | Express + Sequelize con middlewares y API key entre servicios. |
| Modelo de datos | Avanzado | 7 modelos coherentes con el dominio. |
| Autenticación y seguridad | Avanzado | JWT, requireAdmin, apiKeyAuth y guardas en el agente. |
| Agente IA | Avanzado | Agéntico y muy resiliente; falta cerrar la memoria. |
| RAG | Avanzado | TF-IDF multilingüe con citación de fuentes. |
| Frontend y UX | Avanzado | Leaflet, i18n trilingüe, framer-motion, Sky Score. |
| Automatización N8N | Avanzado | 2 workflows, uno programado y otro con nodo IF. |
| Despliegue y producción | Avanzado | Front + backend + ai-service en producción con Docker. |
| Documentación | Experto | README extenso, 13 docs, Postman y auditorías propias. |
| Testing y calidad de código | Sólido | Backend y front con tests; el ai-service sin cubrir. |

## Próximos pasos para subir de nivel

1. **Dale memoria de verdad a AdAstra.** Este es el punto con más recorrido. En `routers/chat.py` pasas `config={"configurable": {"thread_id": session_id}}`, pero `build_agent()` compila el grafo sin checkpointer, así que ese `thread_id` no hace nada; y al invocar solo envías el mensaje nuevo. El resultado es que el agente no ve los turnos anteriores: si el usuario pregunta "¿y desde el Teide?" tras hablar del Roque, AdAstra no tiene contexto. Guardas el historial en `ChatHistory` para mostrarlo, pero no se lo das al agente. Tienes dos caminos limpios: añadir un checkpointer de LangGraph (MemorySaver para empezar, Postgres para producción) o cargar el historial de `ChatHistory` dentro de `messages` antes de `ainvoke`. Cerrar esto eleva mucho la calidad conversacional.
2. **Pon tests en el ai-service.** Tienes 24 tests en el backend, pero la parte más sofisticada (la cadena de fallback, la caché, los guardas y la citación del RAG) no tiene ninguno. Una suite pytest que verifique que un fallo de Groq cae a OpenAI, que una pregunta fuera de tema se rechaza y que la respuesta cita la fuente blindaría justo tu mayor activo.
3. **Unifica la estrategia de RAG.** Ahora buscas en el RAG de forma proactiva dentro de `call_model` y, a la vez, ofreces `search_rag_documents` como tool. Funciona, pero duplica la recuperación. Decidir cuándo va cada vía hará el flujo más claro y más barato en tokens.
4. **Plantéate embeddings semánticos (sin prisa).** Elegir TF-IDF para mantener el servicio ligero fue una decisión sensata y consciente. Si en algún momento quieres mejorar el recall, sobre todo en consultas que mezclan idiomas, migrar a embeddings con pgvector daría un salto de calidad en la recuperación. Es un upgrade opcional, no una corrección.
5. **Suaviza las listas hardcodeadas de insultos y keywords.** Solo entran en juego cuando todos los modelos caen, así que es baja prioridad, pero mantener listas fijas de palabras envejece mal. Si el LLM está disponible, deja que él haga ese filtrado.

## Un reto si te animas

Tienes el Sky Score, los datos de zonas de cielo y un agente que ya entiende clima y observatorios. El siguiente paso natural es un planificador de observación: que el usuario diga "quiero ver Saturno este finde cerca de mi casa" y AdAstra combine la fecha, el Sky Score de las zonas próximas, el clima previsto y los eventos astronómicos para recomendarle dónde y cuándo ir, citando las fuentes. Eso convertiría tu chat en una herramienta que la gente abriría de verdad antes de salir a mirar el cielo.

Tampoco recuerdo ahora, pero no estás vinculada a Stellarium, lo cual podría ser interesante porque es la aplicación que se usa (o se usaba cuando cursé física) por profesionales y aficionados. Igual por ahí puedes rascar algo. 

## Para cerrar

Has demostrado dos cosas difíciles de enseñar: sensibilidad de producto (la internacionalización, las guardas, el cuidado de la UX) y temple de ingeniera (cómo atacaste la saturación del servicio). Cerrar la memoria conversacional y poner tests donde más importa te dejaría un proyecto verdaderamente redondo. Enhorabuena por el nivel, y no lo abandones: AdAstra tiene madera de producto real.
