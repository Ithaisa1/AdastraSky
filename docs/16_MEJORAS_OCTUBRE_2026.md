# 16 · Evolución del proyecto (octubre 2026)

Rama: `mejoras/evolucion-tfm`. Sin push ni despliegue: todo está en local para revisarlo.

## Resultados de las pruebas (ejecutadas el 22/10/2026)

| Suite | Antes | Después |
|---|---|---|
| ai-service (pytest, con Python 3.14 y 3.11 en Docker) | 0 tests | **162 pasan** |
| Backend (Jest) con PostgreSQL 18 (`npm run test:db`) | 19/24 (5 fallaban sin BD) | **58/58** |
| Backend sin BD (`npm test`) | 5 fallos | 39 pasan, 19 omitidos (necesitan BD) |
| Frontend (Vitest) | No arrancaba (faltaba `jsdom`) | **33/33**, linter limpio, build correcto |
| RAG (36 consultas es/en/de) | dato encontrado en el top-3: 56 % | **94 %** |
| Pila completa (`docker-compose.yml`) | — | Verificada de extremo a extremo |

Ninguna prueba usa proveedores de IA reales: todo está simulado, sin gastar cuota. Por eso no está verificado con Groq, OpenAI ni HuggingFace reales.

## 1. Memoria conversacional (prioridad 1)

**Problema confirmado:**

- El grafo se compilaba sin checkpointer y solo recibía el mensaje nuevo.
- El frontend **no enviaba `session_id`**.
- El backend guardaba un `session_id` distinto del que usaba el ai-service.

**Solución:** el backend carga los últimos 6 turnos de `chat_history`, filtrados por el `user_id` del JWT y por la sesión, y los envía al ai-service, que sigue sin estado.

**Por qué no un checkpointer de LangGraph:**

- Duplicaría `chat_history`.
- Obligaría a dar acceso a la BD al ai-service.
- `MemorySaver` se pierde en cada reinicio.
- El ai-service no puede comprobar el `user_id`.

**Detalles:**

- El historial se recorta por turnos y caracteres.
- Se evita duplicar el mensaje actual.
- Se descartan roles no válidos.
- La caché se desactiva cuando hay historial.
- En preguntas cortas de seguimiento, el RAG combina la pregunta actual con la anterior.

**Frontend:**

- Guarda la sesión y la recupera al volver.
- Botón «Nueva conversación».
- Lista de conversaciones con opción de borrarlas.
- Endpoints nuevos: `GET /api/chat/sessions` y `DELETE /api/chat/history/:id`.

**Pruebas:** «Roque de los Muchachos» → «¿Y desde el Teide?» (en el ai-service, el backend con BD real y el frontend), aislamiento entre usuarios y sesiones, conversación nueva, historial vacío, límites y cambio de idioma.

## 2. Fallos corregidos en el ai-service

- La caché guardaba `""` cuando el modelo pedía una herramienta, así que la siguiente vez respondía en blanco.
- Tras usar una herramienta, el RAG buscaba con la salida de la herramienta.
- Las fuentes nunca llegaban al frontend (`str(list)` en vez de JSON).
- El atajo de saludo se comía preguntas («Hola, ¿cuándo son las Perseidas?»).
- `/debug/config` era público y mostraba fragmentos de las claves: **eliminado**.
- `/api/chat` no tenía autenticación: ahora exige `X-API-Key` si se define `AI_SERVICE_API_KEY`.
- `get_observatory_info` y `get_constellation_info` consultaban columnas y tablas inexistentes.
- El clima sin clave devolvía **valores inventados**: ahora usa Open-Meteo o indica «no disponible».
- `/what-to-see` y `/events` devolvían listas fijas: ahora se calculan con efemérides reales.
- Tiempos de espera en los LLM y en el chat.
- Límite de pasos del agente.
- Caché del RAG acotada.
- Fecha del sistema localizada.
- Dependencias con rangos de versiones y sin paquetes no usados.
- Dockerfile con usuario no root y señales correctas.

## 3. RAG (prioridades 3 y 4)

**Estrategia:**

- **Recuperación proactiva una vez por pregunta**: es local y barata (~ms) y garantiza contexto citable.
- **Herramienta RAG** solo para buscar con otras palabras: no repite fragmentos ya entregados.
- No se vuelve a recuperar tras usar una herramienta.

**Índice:**

- Fragmentos por sección con el título del documento.
- Sin tildes ni palabras vacías (es/en/de).
- Palabras + n-gramas de caracteres.
- Prioridad al idioma del usuario.
- Umbral mínimo de relevancia.

Se mide con `ai-service/scripts/eval_rag.py`:

| | Documento correcto el primero | Entre los 3 primeros | Dato encontrado (top-3) |
|---|---|---|---|
| Antes | 69 % | 89 % | 56 % |
| Después | 78 % | 94 % | 94 % |

**Embeddings y pgvector: no recomendados por ahora.**

- Con 96 fragmentos, el margen de mejora es pequeño.
- Añadirían coste (API o modelo de ~1 GB en RAM, que no cabe en planes gratuitos de 512 MB), latencia y una dependencia más.
- Revisarlo si el corpus crece a cientos de documentos. El conjunto de evaluación ya está listo para comparar.

## 4. Guardas (prioridad 5)

- Las reglas viven en `ai-service/agent/rules/guard_rules.json`, separadas del código.
- Se comparan por palabra completa y con texto normalizado (tildes, leet, letras repetidas).
- Cubren inyección en es/en/de, insultos y saludos.
- Se aplican **antes** del LLM y funcionan sin ningún proveedor.
- Se corrigieron falsos positivos («soldado» contaba como astronomía por «sol»; «¿cuáles son las instrucciones para visitar…?» se tomaba como inyección).
- Un insulto acompañado de una pregunta astronómica se responde con educación.

## 5. Planificador astronómico (prioridad 6)

`POST /api/planner` en el backend y en el ai-service, página `/planner` y herramienta `plan_observation` del agente.

**Combina:**

- Efemérides reales (Astronomy Engine, MIT).
- Crepúsculo según el objeto: Mercurio y Venus solo se ven en el crepúsculo.
- Previsión horaria de nubes por capas (Open-Meteo), descontando el mar de nubes en miradores de más de 1800 m.
- Luna (fase y altura).
- Bortle, distancia y acceso de las zonas.

**Explica:**

- Ventana horaria en hora canaria, altura máxima y dirección.
- Brillo, nubes, Luna y advertencias.
- Nivel de **confianza** y **limitaciones**.
- Fuentes.

**Comportamiento honesto:**

- No recomienda objetos cercanos al Sol; por ejemplo, Venus a finales de octubre de 2026.
- Si no hay previsión, lo dice y baja la confianza.

## 6. Datos astronómicos corregidos

**Antes:**

- Las oposiciones se calculaban con el periodo orbital en vez del sinódico.
- Había eclipses que no existen (18/09 y 02/10/2026), un **cometa inventado** («C/2026 A3») y conjunciones con fechas erróneas.
- El «próximo evento» del panel era siempre el primero de la lista.

**Ahora:** backend, ai-service y frontend usan eventos calculados, e indican si un eclipse se ve desde Canarias.

## 7. Backend

- **Fotos de experiencias en PostgreSQL**: antes se guardaban en el disco efímero de Render y se perdían. Se redimensionan a WebP y se borran junto con la experiencia.
- **Borrado de cuenta real**: antes solo cerraba sesión. Ahora pide contraseña y borra conversaciones, experiencias e imágenes. El borrado desde administración ya no falla por la clave foránea.
- **Guardar el perfil** fallaba si la biografía o la ubicación estaban vacías.
- **Login**: ya no exige la política de contraseñas fuertes a cuentas existentes.
- Conexión configurable (SSL, pool) para Neon, Supabase o PostgreSQL local.
- Timeout en la API de la NASA.
- Las guardas de contenido se centralizan en el ai-service.

## 8. Frontend (prioridad 8)

- Chat: memoria, fuentes visibles, Markdown seguro, accesibilidad, errores traducidos y botón «Enviar» corregido.
- Traducciones en `src/locales/*.json`, con un test que obliga a que los 3 idiomas tengan las mismas claves. Traducidos la barra lateral, las FAQ (corrigiendo 3 respuestas inexactas), el perfil, contacto, datos, administración y el resto de componentes.
- Contacto: eliminados un teléfono ficticio, correos de un dominio no propio y la dirección del IAC.
- Ficha de santuario: no inventa el clima, y se corrigen erratas («半», «Zodiacaal»).
- Notificaciones y modo oscuro, que no funcionaban, se sustituyen por un aviso de «próximamente».
- Carga diferida por página: el bloque inicial pasa de 774 KB a 360 KB.
- Test que renderiza las 15 páginas.
- **Mapa con cartografía oficial de Canarias (GRAFCAN / IDECanarias)**. El fondo anterior de CARTO ahora exige clave y mostraba «API KEY REQUIRED» en lugar de las islas.
  - Se abre con las 7 islas encuadradas y no deja salir del archipiélago.
  - Al filtrar por isla, el mapa la encuadra.
  - Fondos disponibles: Mapa Topográfico Integrado, ortofoto y una versión «Nocturno» del topográfico con los colores invertidos.
  - Servicios WMS públicos y sin clave: `idecan2.grafcan.es/ServicioWMS/MTI` e `idecan1.grafcan.es/ServicioWMS/OrtoExpress`.
  - Condiciones de GRAFCAN: «Acceso libre. Prohibido el uso comercial y la descarga masiva». Si el proyecto pasa a ser comercial, hay que pedir licencia a GRAFCAN o cambiar de fondo.

## 8 bis. Mejoras para la observación (segunda tanda)

- **Visión nocturna en rojo**: botón del ojo en la barra lateral. Pasa la app a escala de grises y la tiñe de rojo, que es lo que usan los astrónomos para no perder la adaptación a la oscuridad. El mapa topográfico se oscurece automáticamente. Se recuerda entre visitas.
- **«Planificar observación aquí»** en la ficha de cada mirador del mapa: abre el planificador con ese lugar ya elegido.
- **Uso sin cobertura**:
  - La app se puede instalar en el móvil (PWA, con `vite-plugin-pwa`) y la interfaz funciona sin conexión.
  - El último plan calculado se guarda en el dispositivo y se muestra si no hay red.
  - Del mapa solo se guardan las teselas ya vistas, nunca descargas masivas, por las condiciones de GRAFCAN.
- **Fotos de los miradores**: de 19 MB a 1,5 MB (máximo 1600 px, JPEG al 82 %). Los originales siguen en el historial de Git.
- **Tests en GitHub** (`.github/workflows/tests.yml`): servicio de IA, backend con PostgreSQL 18, frontend, linter y compilación. Los mismos pasos se han ejecutado en local y pasan.

## 9. Despliegue y control

- `docker-compose.yml`: pila completa autoalojable (ver `14_MIGRACION_BASE_DE_DATOS.md`).
- Herramientas de inventario, exportación, importación y verificación de la BD de Render.
- **Estado de producción (22/10/2026):** el backend no responde o está suspendido y el Space de HF no tiene código. El workflow de sincronización falla desde junio, probablemente por el `HF_TOKEN`.

## Para desplegar (cuando lo decidas)

1. Exportar la BD de Render (doc. 14) y crear la de destino.
2. Generar `AI_SERVICE_API_KEY` y ponerla **igual** en el ai-service y en el backend. Si se usa n8n, también en su variable `AI_SERVICE_API_KEY`.
3. Backend: `DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL` y `AI_SERVICE_API_KEY`.
4. ai-service: claves de LLM, `AI_SERVICE_API_KEY` y `BACKEND_URL`.
5. Frontend: `VITE_API_URL` (y `VITE_CONTACT_EMAIL` si quieres mostrar un correo).
6. HF Spaces: renovar el secreto `HF_TOKEN` del repositorio (permiso de escritura en el Space).

## Limitaciones y siguientes pasos

- No verificado con proveedores de IA reales ni en producción.
- El contenido de las 88 constelaciones de la página «Datos» (mitología y descripciones) sigue solo en español; las etiquetas sí están traducidas.
- Mapa del cielo propio con las efemérides (doc. 15).
- Considerar Neon como BD de producción y copias periódicas programadas en tu máquina.
