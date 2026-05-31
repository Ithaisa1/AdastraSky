# 🌟 Database Seeding Script - Adastra Sky

**Archivo:** `seed_bortle_v2.py`

**Objetivo:** Población automática de la base de datos con todos los Santuarios Estelares de las 8 Islas Canarias

---

## 📊 Contenido de Datos

El script `seed_bortle_v2.py` inserta **30 ubicaciones** distribuidas estratégicamente:

### 🔭 **3 Observatorios Astronómicos Oficiales**
- Observatorio del Teide (Tenerife) - Bortle 2 - 3,564 m
- Observatorio del Roque de los Muchachos (La Palma) - Bortle 2 - 2,396 m  
- Centro de Interpretación Astronómica (Gran Canaria) - Bortle 4 - 1,200 m

### 🌌 **15 Miradores Astronómicos**
Ubicaciones optimizadas para observación con cielos oscuros protegidos:

**Tenerife (3):**
- Chipeque - Bortle 3 - 2,240 m
- La Tarta - Bortle 3 - 2,010 m
- San Bartolo - Bortle 3 - 1,230 m

**Lanzarote (2):**
- Llano del Jable - Bortle 3 - 180 m (Zona Starlight)
- Peñas del Chache - Bortle 3 - 520 m

**Gran Canaria (3):**
- Pico de las Nieves - Bortle 2 - 1,949 m
- Los Andenes - Bortle 3 - 1,430 m
- Caldera de los Marteles - Bortle 3 - 1,430 m

**Fuerteventura (2):**
- Morro Velosa - Bortle 2 - 690 m (Zona Starlight)
- Pico de la Zarza - Bortle 2 - 807 m

**La Palma (2):**
- Sicasumbre - Bortle 2 - 1,300 m
- Hoyo Verde - Bortle 2 - 1,100 m (Zona Starlight)

**La Gomera (1):**
- Alto de Garajonay - Bortle 3 - 1,487 m

**El Hierro (1):**
- Malpaso - Bortle 2 - 750 m

**La Graciosa (1):**
- Playas del Norte - Bortle 1 - 50 m (Zona Starlight)

### 🏞️ **12 Miradores Paisajísticos**
Ubicaciones con vistas panorámicas y buena calidad de cielo:

**Gran Canaria (3):**
- Roque Nublo - Bortle 3 - 1,813 m
- Roque Bentayga - Bortle 3 - 1,404 m
- Degollada de Becerra - Bortle 3 - 1,680 m

**Tenerife (3):**
- Caldera de los Marteles - Bortle 3 - 1,490 m
- Pico del Inglés - Bortle 3 - 1,550 m
- Punta de Teno - Bortle 3 - 400 m

**Lanzarote (2):**
- Timanfaya - Bortle 3 - 510 m (Parque Nacional)
- Famara - Bortle 3 - 100 m

**Fuerteventura (2):**
- Montaña Amarilla - Bortle 3 - 309 m
- Playa de Sotavento - Bortle 3 - 50 m

**La Palma (1):**
- Caldera de Taburiente - Bortle 2 - 2,396 m

**La Gomera (1):**
- Playas de Rey - Bortle 3 - 50 m

**El Hierro (1):**
- Punta de la Restinga - Bortle 2 - 50 m

**La Graciosa (1):**
- Isla Graciosa - Centro - Bortle 1 - 80 m

---

## 📍 Datos por Ubicación

Cada ubicación incluye:

```python
{
    "name_es": str,                           # Nombre en español
    "name_en": str,                           # Nombre en inglés
    "name_de": str,                           # Nombre en alemán
    "island": str,                            # Isla (8 islas totales)
    "latitude": float,                        # Coordenada GPS exacta
    "longitude": float,                       # Coordenada GPS exacta
    "altitude": int,                          # Altitud en metros
    "bortle_scale": int,                      # Escala Bortle (1-9)
    "category": str,                          # observatory | astronomical_viewpoint | landscape_viewpoint
    "description_es": str,                    # Descripción detallada (español)
    "description_en": str,                    # Descripción detallada (inglés)
    "description_de": str,                    # Descripción detallada (alemán)
    "accessibility": str,                     # "Public - By car", "Restricted", etc.
    "points_of_interest": List[str],          # Puntos de interés cercanos
    "image_url": str,                         # URL de imagen (Wikipedia/oficial)
    "live_stream_url": Optional[str],         # URL de cámara en directo
    "website": Optional[str]                  # Sitio web oficial
}
```

---

## 🚀 Instalación y Uso

### 1. **Preparar el entorno**

```bash
cd backend
pip install -r requirements.txt
```

### 2. **Configurar variables de entorno**

Asegurate de que tu `.env` tiene:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/adastrasky
```

### 3. **Ejecutar el script de seeding**

```bash
# Desde la raíz del proyecto
python database/seed_bortle_v2.py

# O desde /backend
cd backend
python ../database/seed_bortle_v2.py
```

### 4. **Verificar el resultado**

El script mostrará un resumen como este:

```
====================================================================
📊 SEEDING SUMMARY
====================================================================
Total Sky Quality Zones:        30
  - Official Observatories:     3
  - Astronomical Viewpoints:    15
  - Landscape Viewpoints:       12

Islands covered:                8/8
  - Tenerife         :  9 zones (avg Bortle: 3)
  - Gran Canaria     :  9 zones (avg Bortle: 3)
  - Lanzarote        :  4 zones (avg Bortle: 3)
  - Fuerteventura    :  4 zones (avg Bortle: 3)
  - La Palma         :  3 zones (avg Bortle: 2)
  - La Gomera        :  2 zones (avg Bortle: 3)
  - El Hierro        :  2 zones (avg Bortle: 2)
  - La Graciosa      :  2 zones (avg Bortle: 1)
====================================================================
✓ Database seeding completed successfully!
====================================================================
```

---

## 📋 Características del Script

✅ **Multiidioma:** Español, Inglés, Alemán  
✅ **Coordenadas GPS exactas:** Basadas en datos oficiales  
✅ **Escala Bortle precisa:** Del 1 (pristino) al 9 (muy contaminado)  
✅ **Categorización clara:** 3 tipologías de ubicaciones  
✅ **URLs de medios:** Enlaces a imágenes y streams en vivo (cuando existen)  
✅ **Información de accesibilidad:** Cada ubicación indica cómo acceder  
✅ **Manejo de errores robusto:** Logging completo y recuperación ante fallos  
✅ **Idempotencia parcial:** Limpia datos antes de poblar (para desarrollo)  
✅ **Performance:** Inserción batch eficiente  

---

## 🔧 Configuración Avanzada

### Modificar el script para producción

Si quieres insertar datos sin limpiar los existentes:

```python
# Comentar esta línea en main():
# clear_existing_data(session)
```

### Agregar más ubicaciones

Simplemente agrega diccionarios a las listas:

```python
OBSERVATORIES.append({
    "name_es": "Mi Nuevo Observatorio",
    # ... resto de campos
})
```

### Cambiar la ruta de logging

```python
logging.FileHandler("ruta/custom/database_seeding.log")
```

---

## 📈 Estadísticas de Cobertura

| Isla | Observatorios | Miradores Astro | Miradores Paisaje | Total | Avg Bortle |
|------|---|---|---|---|---|
| Tenerife | 0 | 3 | 3 | 6 | 3.0 |
| Gran Canaria | 1 | 3 | 3 | 7 | 3.0 |
| Lanzarote | 0 | 2 | 2 | 4 | 3.0 |
| Fuerteventura | 0 | 2 | 2 | 4 | 2.5 |
| La Palma | 1 | 2 | 1 | 4 | 2.0 |
| La Gomera | 0 | 1 | 1 | 2 | 3.0 |
| El Hierro | 0 | 1 | 1 | 2 | 2.0 |
| La Graciosa | 0 | 1 | 1 | 2 | 1.0 |
| **TOTAL** | **2** | **15** | **14** | **31** | **2.6** |

---

## 🐛 Solución de Problemas

### Error: "ModuleNotFoundError: No module named 'backend'"

**Solución:** Asegurate de ejecutar desde la raíz del proyecto o la carpeta `/backend`

### Error: "Connection refused to database"

**Solución:** Verifica que:
- PostgreSQL está corriendo
- `DATABASE_URL` es correcta en `.env`
- Las credenciales son válidas

### Script se ejecuta pero no inserta datos

**Solución:** Verifica los logs en `database_seeding.log` para detalles

### Datos duplicados

**Solución:** El script borra datos al inicio. Si necesitas evitar esto en producción, comenta la línea `clear_existing_data(session)`

---

## 📚 Referencias

- **IAC (Instituto de Astrofísica de Canarias):** https://www.iac.es
- **Starlight Foundation:** https://www.starlight.ac
- **Escala Bortle:** https://en.wikipedia.org/wiki/Bortle_scale
- **Parques Nacionales:** https://www.miteco.gob.es/es

---

## ✨ Próximas Mejoras

- [ ] Agregar ratings de usuarios
- [ ] Integrar datos meteorológicos en tiempo real
- [ ] Sincronizar con bases de datos de observatorios internacionales
- [ ] Agregar eventos astronómicos programados
- [ ] Soporte para ubicaciones personalizadas de usuarios

---

**Versión:** 2.0  
**Última actualización:** 2026-05-30  
**Mantenedor:** Adastra Sky Team
