# 15 · Integración con Stellarium y alternativas de visualización

## Opciones estudiadas

| Opción | Cómo se integraría | Licencia | Valoración |
|---|---|---|---|
| **Stellarium (escritorio)** | Plugin *Remote Control*: API HTTP en la máquina del usuario (por defecto `localhost:8090`) para fijar fecha, ubicación y objeto. Documentación: <https://stellarium.org/doc/0.22/remoteControlApi.html> | GPL (programa independiente) | Útil solo si el usuario tiene Stellarium abierto en su ordenador. No funciona en móvil. Un navegador no puede llamar a `localhost` desde un sitio HTTPS sin configurar CORS en el plugin. |
| **Stellarium Web Engine** (incrustado) | Compilar el motor WebGL/WASM e incluirlo en el frontend | **AGPL-3.0** (`LICENSE-AGPL-3.0.txt` en <https://github.com/Stellarium/stellarium-web-engine>) | Al incrustarlo en un servicio web, la AGPL obliga a publicar el código de la aplicación que lo usa bajo AGPL. Además exige compilar con emscripten y servir catálogos pesados. **No recomendado** sin decidir antes la licencia del proyecto. |
| **Enlace a stellarium-web.org** | Abrir la web pública en otra pestaña | No incorpora código | Sin coste ni obligaciones de licencia. **No he podido verificar** que la web acepte parámetros de URL (fecha, latitud, objeto): no están documentados, así que el enlace no los usa. |
| **d3-celestial / VirtualSky / Aladin Lite** | Mapa del cielo dibujado en el frontend | Varían; **comprobar cada licencia antes de usarla** | Alternativas ligeras para un mapa propio. |

## Qué se ha implementado

Un enlace a **Stellarium Web** en los resultados del planificador («Para ver cómo estará el cielo en esa fecha y lugar…»). No incorpora código de terceros ni crea obligaciones de licencia.

## Propuesta para una siguiente fase

Dibujar un **mapa del cielo propio** (horizonte, puntos cardinales y posición del objeto) con las efemérides que ya calcula el ai-service (`sky_engine/ephemeris.py`: altura y azimut cada 30 min). Se puede hacer con SVG, sin dependencias nuevas:

- Funciona en móvil y no tiene problemas de licencia.
- Usa exactamente los mismos datos que el planificador, así que no puede contradecirlo.
- Coste estimado: 1-2 días (endpoint con la trayectoria del objeto + componente SVG + tests).

Solo merece la pena valorar Stellarium Web Engine si se decide publicar AdAstra Sky bajo AGPL-3.0.
