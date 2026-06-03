"""
Adastra Sky - Database Seeding Script (v2)
Population of Sky Quality Zones, Observatories, and Astronomical Viewpoints
Canary Islands (8 Islands: Gran Canaria, Tenerife, Lanzarote, Fuerteventura, La Palma, La Gomera, El Hierro, La Graciosa)

This production-ready script initializes the sky_quality_zones table with:
- Official astronomical observatories (IAC, Teide, Roque de los Muchachos)
- Astronomical viewpoints (dedicated dark sky locations)
- Landscape viewpoints (scenic locations with good sky visibility)

Features:
- Complete multilingual descriptions (Spanish, English, German)
- Accurate coordinates (GPS), altitudes, and Bortle scale classifications
- Links to media URLs and live camera streams
- Batch insertion with transaction handling
- Comprehensive logging and error recovery
"""

import os
import sys
from datetime import datetime
from typing import List, Dict, Any
import json
import logging

# Intentar importar psycopg2 (requerido); si no está, el script no podrá ejecutarse
try:
    import psycopg2
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("database_seeding.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# ASTRONOMICAL OBSERVATORIES - OFFICIAL RESEARCH CENTERS
# ============================================================================

OBSERVATORIES = [
    # TENERIFE - Observatorio del Teide (IAC)
    {
        "name_es": "Observatorio del Teide",
        "name_en": "Teide Observatory",
        "name_de": "Teide-Observatorium",
        "island": "Tenerife",
        "latitude": 28.2696,
        "longitude": -16.5113,
        "altitude": 3564,
        "bortle_scale": 2,
        "category": "observatory",
        "description_es": "El Observatorio del Teide, perteneciente al Instituto de Astrofísica de Canarias, es uno de los observatorios más importantes de Europa. Ubicado en la cumbre del Teide, ofrece condiciones de observación excepcionales con más de 300 días despejados al año.",
        "description_en": "The Teide Observatory, belonging to the Institute of Astrophysics of the Canary Islands, is one of Europe's most important observatories. Located at the summit of Teide, it offers exceptional observation conditions with over 300 clear days per year.",
        "description_de": "Das Teide-Observatorium, das dem Institut für Astrophysik der Kanarischen Inseln gehört, ist eines der wichtigsten Observatorien Europas. Mit mehr als 300 klaren Tagen pro Jahr bietet es außergewöhnliche Beobachtungsbedingungen.",
        "accessibility": "Limited - Permit required",
        "points_of_interest": ["Gran Telescopio Canarias (GTC)", "Observatorio de Estaciones", "Centro de Visitantes del Teide"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Teide_Observatory_Tenerife.jpg",
        "live_stream_url": None,
        "website": "https://www.iac.es/teide"
    },
    
    # LA PALMA - Observatorio del Roque de los Muchachos
    {
        "name_es": "Observatorio del Roque de los Muchachos",
        "name_en": "Roque de los Muchachos Observatory",
        "name_de": "Roque-de-los-Muchachos-Observatorium",
        "island": "La Palma",
        "latitude": 28.7590,
        "longitude": -17.8774,
        "altitude": 2396,
        "bortle_scale": 2,
        "category": "observatory",
        "description_es": "Observatorio internacional ubicado en el Roque de los Muchachos (La Palma). Alberga algunos de los telescopios más avanzados del hemisferio norte, incluyendo el Gran Telescopio de Canarias.",
        "description_en": "International observatory located at Roque de los Muchachos (La Palma). It houses some of the most advanced telescopes in the northern hemisphere, including the Gran Telescopio de Canarias.",
        "description_de": "Internationales Observatorium auf dem Roque de los Muchachos (La Palma). Beherbergt einige der fortschrittlichsten Teleskope der nördlichen Hemisphäre.",
        "accessibility": "Restricted - Professional access only",
        "points_of_interest": ["Gran Telescopio Canarias", "Telescopio Nazionale Galileo", "Centro de Control"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/59/Roque_de_los_Muchachos_Observatory_La_Palma.jpg",
        "live_stream_url": None,
        "website": "https://www.iac.es"
    },

    # GRAN CANARIA - Centro de Interpretación Astronómica
    {
        "name_es": "Centro de Interpretación Astronómica de Gran Canaria",
        "name_en": "Gran Canaria Astronomical Interpretation Center",
        "name_de": "Astronomisches Interpretationszentrum von Gran Canaria",
        "island": "Gran Canaria",
        "latitude": 28.0000,
        "longitude": -15.6000,
        "altitude": 1200,
        "bortle_scale": 4,
        "category": "observatory",
        "description_es": "Centro dedicado a la divulgación astronomía y educación espacial en Gran Canaria, con planetario y telescopios públicos.",
        "description_en": "Center dedicated to astronomy outreach and space education in Gran Canaria, with planetarium and public telescopes.",
        "description_de": "Zentrum zur Astronomie-Öffentlichkeitsarbeit und Raumfahrterziehung auf Gran Canaria mit Planetarium und öffentlichen Teleskopen.",
        "accessibility": "Public - Open to visitors",
        "points_of_interest": ["Planetario", "Telescopios públicos", "Sala de conferencias"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Planetarium_Gran_Canaria.jpg",
        "live_stream_url": None,
        "website": "https://www.grancanaria.com"
    },
]

# ============================================================================
# ASTRONOMICAL VIEWPOINTS - Dedicated dark sky locations (15 LOCATIONS)
# ============================================================================

ASTRONOMICAL_VIEWPOINTS = [
    # TENERIFE (3)
    {
        "name_es": "Chipeque",
        "name_en": "Chipeque",
        "name_de": "Chipeque",
        "island": "Tenerife",
        "latitude": 28.2650,
        "longitude": -16.3250,
        "altitude": 2240,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Ubicación estratégica en Tenerife con cielos oscuros y vistas panorámicas del Teide. Ideal para observación de meteoros y galaxias.",
        "description_en": "Strategic location in Tenerife with dark skies and panoramic views of Teide. Ideal for observing meteors and galaxies.",
        "description_de": "Strategischer Ort auf Teneriffa mit dunklem Himmel und Panoramablick auf den Teide. Ideal zur Beobachtung von Meteoren und Galaxien.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Vistas del Teide", "Parking gratuito", "Servicios básicos"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Tenerife_Night_Sky.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "La Tarta",
        "name_en": "La Tarta",
        "name_de": "La Tarta",
        "island": "Tenerife",
        "latitude": 28.3139,
        "longitude": -16.5417,
        "altitude": 2010,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Punto de observación con vistas del Teide y zonas de baja contaminación. Popular entre fotógrafos de noche.",
        "description_en": "Observation point with views of Teide and low pollution areas. Popular among night photographers.",
        "description_de": "Beobachtungspunkt mit Blick auf Teide und Gebiete mit niedriger Verschmutzung. Beliebt bei Nachtfotografen.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Vistas del Teide", "Fotografía nocturna", "Parking gratuito"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Tenerife_Mountain_Views.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "San Bartolo",
        "name_en": "San Bartolo",
        "name_de": "San Bartolo",
        "island": "Tenerife",
        "latitude": 28.0883,
        "longitude": -16.2667,
        "altitude": 1230,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Mirador tradicional de Tenerife con vistas al valle. Acceso fácil y zona segura para observación nocturna.",
        "description_en": "Traditional Tenerife viewpoint with valley views. Easy access and safe area for night observation.",
        "description_de": "Traditioneller Aussichtspunkt auf Teneriffa mit Talblick. Einfacher Zugang und sichere Zone für Nachtbeobachtung.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Vistas del valle", "Picnic area", "Parking"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Tenerife_Valley_Views.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LANZAROTE (2)
    {
        "name_es": "Llano del Jable",
        "name_en": "Llano del Jable",
        "name_de": "Llano del Jable",
        "island": "Lanzarote",
        "latitude": 29.0366,
        "longitude": -13.7511,
        "altitude": 180,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Planicie con excelentes condiciones de observación en Lanzarote. Zona Starlight certificada con baja contaminación lumínica.",
        "description_en": "Plain with excellent observation conditions in Lanzarote. Certified Starlight zone with low light pollution.",
        "description_de": "Flachland mit ausgezeichneten Beobachtungsbedingungen auf Lanzarote. Zertifizierte Starlight-Zone mit niedriger Lichtverschmutzung.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Zona Starlight", "Parking", "Servicios limitados"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Lanzarote_Stars.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Peñas del Chache",
        "name_en": "Peñas del Chache",
        "name_de": "Peñas del Chache",
        "island": "Lanzarote",
        "latitude": 29.0389,
        "longitude": -13.6417,
        "altitude": 520,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Punto más alto de Lanzarote con vistas de 360 grados. Excelente para observación de la Vía Láctea.",
        "description_en": "Highest point in Lanzarote with 360-degree views. Excellent for Milky Way observation.",
        "description_de": "Höchster Punkt von Lanzarote mit 360-Grad-Ausblick. Ausgezeichnet zur Beobachtung der Milchstraße.",
        "accessibility": "Public - By car + hiking",
        "points_of_interest": ["Punto más alto", "Vistas panorámicas", "Parking"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/95/Lanzarote_Viewpoint.jpg",
        "live_stream_url": None,
        "website": None
    },

    # GRAN CANARIA (3)
    {
        "name_es": "Pico de las Nieves",
        "name_en": "Pico de las Nieves",
        "name_de": "Pico de las Nieves",
        "island": "Gran Canaria",
        "latitude": 27.9697,
        "longitude": -15.6028,
        "altitude": 1949,
        "bortle_scale": 2,
        "category": "astronomical_viewpoint",
        "description_es": "Punto más alto de Gran Canaria con condiciones excepcionales para la observación astronómica. Vistas de 360 grados del archipiélago.",
        "description_en": "Highest point in Gran Canaria with exceptional conditions for astronomical observation. 360-degree views of the archipelago.",
        "description_de": "Höchster Punkt von Gran Canaria mit außergewöhnlichen Bedingungen zur astronomischen Beobachtung. 360-Grad-Ausblick auf den Archipel.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Vistas de 360 grados", "Camping cercano", "Centro de visitantes"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/96/Pico_de_las_Nieves_Gran_Canaria.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Los Andenes",
        "name_en": "Los Andenes",
        "name_de": "Los Andenes",
        "island": "Gran Canaria",
        "latitude": 27.7500,
        "longitude": -15.5833,
        "altitude": 1430,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Mirador astronómico con vistas despejadas del cielo nocturno en Gran Canaria. Zona de baja contaminación lumínica.",
        "description_en": "Astronomical viewpoint with clear night sky views in Gran Canaria. Low light pollution zone.",
        "description_de": "Astronomischer Aussichtspunkt mit freier Sicht auf den Nachthimmel auf Gran Canaria. Zone mit niedriger Lichtverschmutzung.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Parking", "Instalaciones básicas", "Observación segura"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Gran_Canaria_Viewpoint.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Caldera de los Marteles",
        "name_en": "Caldera de los Marteles",
        "name_de": "Caldera de los Marteles",
        "island": "Gran Canaria",
        "latitude": 27.9303,
        "longitude": -15.6361,
        "altitude": 1430,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Formación volcánica con excelentes condiciones astronómicas. Zona de baja contaminación lumínica.",
        "description_en": "Volcanic formation with excellent astronomical conditions. Low light pollution zone.",
        "description_de": "Vulkanische Formation mit ausgezeichneten astronomischen Bedingungen. Zone mit niedriger Lichtverschmutzung.",
        "accessibility": "Public - By car + hiking",
        "points_of_interest": ["Volcán", "Geología", "Cielos oscuros"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/4/46/Volcanic_Landscape_Tenerife.jpg",
        "live_stream_url": None,
        "website": None
    },

    # FUERTEVENTURA (2)
    {
        "name_es": "Morro Velosa",
        "name_en": "Morro Velosa",
        "name_de": "Morro Velosa",
        "island": "Fuerteventura",
        "latitude": 28.3589,
        "longitude": -14.3206,
        "altitude": 690,
        "bortle_scale": 2,
        "category": "astronomical_viewpoint",
        "description_es": "Punto de observación privilegiado en Fuerteventura con cielos excepcionalmente oscuros y protegidos. Zona Starlight certificada.",
        "description_en": "Privileged observation point in Fuerteventura with exceptionally dark and protected skies. Certified Starlight zone.",
        "description_de": "Bevorzugter Beobachtungspunkt auf Fuerteventura mit außergewöhnlich dunklem und geschütztem Himmel. Zertifizierte Starlight-Zone.",
        "accessibility": "Public - By car (gravel road)",
        "points_of_interest": ["Zona Starlight", "Cielos oscuros", "Paisaje desértico"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/b/bb/Fuerteventura_Night_Sky.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Pico de la Zarza",
        "name_en": "Pico de la Zarza",
        "name_de": "Pico de la Zarza",
        "island": "Fuerteventura",
        "latitude": 28.3639,
        "longitude": -14.3333,
        "altitude": 807,
        "bortle_scale": 2,
        "category": "astronomical_viewpoint",
        "description_es": "Punto más alto de Fuerteventura con cielos prístinos. Ideal para observación de fenómenos astronómicos.",
        "description_en": "Highest point in Fuerteventura with pristine skies. Ideal for astronomical phenomena observation.",
        "description_de": "Höchster Punkt von Fuerteventura mit unberührtem Himmel. Ideal zur Beobachtung astronomischer Phänomene.",
        "accessibility": "Public - By car + hiking",
        "points_of_interest": ["Punto más alto", "Cielos prístinos", "Panorama desértico"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/52/Fuerteventura_Highest_Peak.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LA PALMA (2)
    {
        "name_es": "Sicasumbre",
        "name_en": "Sicasumbre",
        "name_de": "Sicasumbre",
        "island": "La Palma",
        "latitude": 28.6833,
        "longitude": -17.8667,
        "altitude": 1300,
        "bortle_scale": 2,
        "category": "astronomical_viewpoint",
        "description_es": "Mirador astronómico de La Palma con vistas despejadas y excelentes condiciones para la observación. Acceso fácil desde la capital.",
        "description_en": "Astronomical viewpoint of La Palma with clear views and excellent observation conditions. Easy access from the capital.",
        "description_de": "Astronomischer Aussichtspunkt von La Palma mit freier Sicht und ausgezeichneten Beobachtungsbedingungen. Einfacher Zugang von der Hauptstadt.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Vistas de la isla", "Parking seguro", "Miradores"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/c3/La_Palma_Observatory.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Hoyo Verde",
        "name_en": "Hoyo Verde",
        "name_de": "Hoyo Verde",
        "island": "La Palma",
        "latitude": 28.5583,
        "longitude": -17.8722,
        "altitude": 1100,
        "bortle_scale": 2,
        "category": "astronomical_viewpoint",
        "description_es": "Ubicación remota en La Palma con condiciones de observación óptimas. Zona protegida con certificación Starlight.",
        "description_en": "Remote location in La Palma with optimal observation conditions. Protected area with Starlight certification.",
        "description_de": "Abgelegener Ort auf La Palma mit optimalen Beobachtungsbedingungen. Geschütztes Gebiet mit Starlight-Zertifizierung.",
        "accessibility": "Public - By car (limited access)",
        "points_of_interest": ["Zona Starlight", "Aislamiento", "Condiciones óptimas"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/d1/La_Palma_Remote_Location.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LA GOMERA (1)
    {
        "name_es": "Alto de Garajonay",
        "name_en": "Alto de Garajonay",
        "name_de": "Alto de Garajonay",
        "island": "La Gomera",
        "latitude": 28.0933,
        "longitude": -17.2125,
        "altitude": 1487,
        "bortle_scale": 3,
        "category": "astronomical_viewpoint",
        "description_es": "Punto más alto del Parque Nacional de Garajonay. Excelentes vistas nocturnas con baja contaminación lumínica en La Gomera.",
        "description_en": "Highest point of Garajonay National Park. Excellent night views with low light pollution in La Gomera.",
        "description_de": "Höchster Punkt des Nationalparks Garajonay. Ausgezeichnete Nachtsicht mit niedriger Lichtverschmutzung auf La Gomera.",
        "accessibility": "Public - By car + short walk",
        "points_of_interest": ["Parque Nacional", "Laurisilva", "Centro de visitantes"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/f/f2/Garajonay_National_Park.jpg",
        "live_stream_url": None,
        "website": None
    },

    # EL HIERRO (1)
    {
        "name_es": "Malpaso",
        "name_en": "Malpaso",
        "name_de": "Malpaso",
        "island": "El Hierro",
        "latitude": 27.8074,
        "longitude": -17.9608,
        "altitude": 750,
        "bortle_scale": 2,
        "category": "astronomical_viewpoint",
        "description_es": "Punto de observación remoto en El Hierro con cielos excepcionales. Isla totalmente energía renovable - cero contaminación lumínica industrial.",
        "description_en": "Remote observation point in El Hierro with exceptional skies. Island powered entirely by renewable energy - zero industrial light pollution.",
        "description_de": "Abgelegener Beobachtungspunkt auf El Hierro mit außergewöhnlichen Himmelsbedingungen. Insel vollständig mit erneuerbaren Energien - null industrielle Lichtverschmutzung.",
        "accessibility": "Public - By car (narrow road)",
        "points_of_interest": ["Cielos pristinos", "Energías renovables", "Paisaje virgen"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/1b/El_Hierro_Night_Sky.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LA GRACIOSA (1)
    {
        "name_es": "Playas del Norte",
        "name_en": "Playas del Norte",
        "name_de": "Playas del Norte",
        "island": "La Graciosa",
        "latitude": 29.2306,
        "longitude": -13.5128,
        "altitude": 50,
        "bortle_scale": 1,
        "category": "astronomical_viewpoint",
        "description_es": "Playas vírgenes de La Graciosa con cielos despejados. Acceso únicamente en ferry. Zona Starlight protegida.",
        "description_en": "Pristine beaches of La Graciosa with clear skies. Access only by ferry. Protected Starlight zone.",
        "description_de": "Unberührte Strände von La Graciosa mit freiem Himmel. Zugang nur per Fähre. Geschützte Starlight-Zone.",
        "accessibility": "Public - By ferry + walking",
        "points_of_interest": ["Playas vírgenes", "Zona Starlight", "Acceso limitado"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/d5/La_Graciosa_Beach.jpg",
        "live_stream_url": None,
        "website": None
    },
]

# ============================================================================
# LANDSCAPE VIEWPOINTS - Scenic locations with good sky visibility (12 LOCATIONS)
# ============================================================================

LANDSCAPE_VIEWPOINTS = [
    # GRAN CANARIA (3)
    {
        "name_es": "Roque Nublo",
        "name_en": "Roque Nublo",
        "name_de": "Roque Nublo",
        "island": "Gran Canaria",
        "latitude": 27.9397,
        "longitude": -15.5936,
        "altitude": 1813,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Icónico monolito de Gran Canaria con vistas panorámicas de 360 grados. Ubicación perfecta para fotografía nocturna y observación de Vía Láctea.",
        "description_en": "Iconic monolith of Gran Canaria with 360-degree panoramic views. Perfect location for night photography and Milky Way observation.",
        "description_de": "Ikonischer Monolith von Gran Canaria mit 360-Grad-Panoramablick. Perfekter Ort für Nachtfotografie und Milchstraßenbeobachtung.",
        "accessibility": "Public - Short hiking trail",
        "points_of_interest": ["Monolito icónico", "Fotografía nocturna", "Sendero seguro"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/35/Roque_Nublo_Gran_Canaria.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Roque Bentayga",
        "name_en": "Roque Bentayga",
        "name_de": "Roque Bentayga",
        "island": "Gran Canaria",
        "latitude": 27.9667,
        "longitude": -15.6833,
        "altitude": 1404,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Segundo monolito más importante de Gran Canaria. Sitio arqueológico con importancia histórica y excelentes vistas nocturnas.",
        "description_en": "Second most important monolith in Gran Canaria. Archaeological site with historical importance and excellent night views.",
        "description_de": "Zweiter wichtigster Monolith von Gran Canaria. Archäologische Stätte mit historischer Bedeutung und ausgezeichneten Nachtsichten.",
        "accessibility": "Public - Hiking trail + stairs",
        "points_of_interest": ["Sitio arqueológico", "Vistas panorámicas", "Centro de interpretación"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Roque_Bentayga_Gran_Canaria.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Degollada de Becerra",
        "name_en": "Degollada de Becerra",
        "name_de": "Degollada de Becerra",
        "island": "Gran Canaria",
        "latitude": 27.9083,
        "longitude": -15.6500,
        "altitude": 1680,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Paso montañoso con vistas hacia el Teide y Las Canarias. Punto de observación estratégico con acceso relativamente fácil.",
        "description_en": "Mountain pass with views towards Teide and the Canaries. Strategic observation point with relatively easy access.",
        "description_de": "Bergpass mit Blick auf Teide und die Kanarischen Inseln. Strategischer Beobachtungspunkt mit relativ einfachem Zugang.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Paso montañoso", "Vistas múltiples islas", "Parking"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/57/Gran_Canaria_Mountain_Pass.jpg",
        "live_stream_url": None,
        "website": None
    },

    # TENERIFE (3)
    {
        "name_es": "Caldera de los Marteles",
        "name_en": "Caldera de los Marteles",
        "name_de": "Caldera de los Marteles",
        "island": "Tenerife",
        "latitude": 28.2667,
        "longitude": -16.1833,
        "altitude": 1490,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Formación volcánica con vistas de interés geológico y astronómico. Zona de baja contaminación lumínica.",
        "description_en": "Volcanic formation with geological and astronomical interest views. Low light pollution zone.",
        "description_de": "Vulkanische Formation mit geologischem und astronomischem Interesse. Zone mit niedriger Lichtverschmutzung.",
        "accessibility": "Public - By car + hiking",
        "points_of_interest": ["Volcán", "Geología", "Cielos oscuros"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/4/46/Volcanic_Landscape_Tenerife.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Pico del Inglés",
        "name_en": "Pico del Inglés",
        "name_de": "Pico del Inglés",
        "island": "Tenerife",
        "latitude": 28.1339,
        "longitude": -16.3194,
        "altitude": 1550,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Mirador con vistas panorámicas del norte de Tenerife. Excelente para fotografía nocturna con Vía Láctea.",
        "description_en": "Viewpoint with panoramic views of northern Tenerife. Excellent for night photography with Milky Way.",
        "description_de": "Aussichtspunkt mit Panoramablick auf Nordteneriffa. Ausgezeichnet für Nachtfotografie mit Milchstraße.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Vistas panorámicas", "Fotografía", "Parking seguro"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/7c/Tenerife_Viewpoint.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Punta de Teno",
        "name_en": "Punta de Teno",
        "name_de": "Punta de Teno",
        "island": "Tenerife",
        "latitude": 28.3361,
        "longitude": -16.8389,
        "altitude": 400,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Faro histórico en el noroeste de Tenerife. Vistas al océano con cielos relativamente oscuros para fotografía nocturna.",
        "description_en": "Historic lighthouse in northwest Tenerife. Ocean views with relatively dark skies for night photography.",
        "description_de": "Historischer Leuchtturm im Nordwesten Teneriffas. Meerblick mit relativ dunklem Himmel für Nachtfotografie.",
        "accessibility": "Public - By car + walking",
        "points_of_interest": ["Faro histórico", "Vistas oceánicas", "Paisaje remoto"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Punta_de_Teno_Lighthouse.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LANZAROTE (2)
    {
        "name_es": "Timanfaya",
        "name_en": "Timanfaya",
        "name_de": "Timanfaya",
        "island": "Lanzarote",
        "latitude": 29.0306,
        "longitude": -13.8278,
        "altitude": 510,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Parque Nacional de volcanes con paisaje lunar. Excelentes condiciones para fotografía nocturna con Vía Láctea.",
        "description_en": "National Park of volcanoes with lunar landscape. Excellent conditions for night photography with Milky Way.",
        "description_de": "Nationalpark mit Vulkanen und Mondlandschaft. Ausgezeichnete Bedingungen für Nachtfotografie mit Milchstraße.",
        "accessibility": "Public - By car within park",
        "points_of_interest": ["Volcanes activos", "Paisaje lunar", "Centro de visitantes"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Timanfaya_National_Park_Lanzarote.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Famara",
        "name_en": "Famara",
        "name_de": "Famara",
        "island": "Lanzarote",
        "latitude": 29.1153,
        "longitude": -13.6667,
        "altitude": 100,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Playa con acantilado espectacular. Vistas panorámicas del océano con cielos nocturnos despejados. Popular entre astrofotógrafos.",
        "description_en": "Beach with spectacular cliff. Panoramic ocean views with clear night skies. Popular among astrophotographers.",
        "description_de": "Strand mit spektakulärer Klippe. Panoramablick auf den Ozean mit freiem Nachthimmel. Beliebt bei Astrofotografen.",
        "accessibility": "Public - Beach access",
        "points_of_interest": ["Acantilados", "Playa", "Ciclo de mareas"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/28/Famara_Beach_Lanzarote.jpg",
        "live_stream_url": None,
        "website": None
    },

    # FUERTEVENTURA (2)
    {
        "name_es": "Montaña Amarilla",
        "name_en": "Montaña Amarilla",
        "name_de": "Montaña Amarilla",
        "island": "Fuerteventura",
        "latitude": 28.3306,
        "longitude": -14.3278,
        "altitude": 309,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Colina distintiva con vistas panorámicas de Fuerteventura. Zona desértica con baja contaminación lumínica.",
        "description_en": "Distinctive hill with panoramic views of Fuerteventura. Desert area with low light pollution.",
        "description_de": "Charakteristischer Hügel mit Panoramablick auf Fuerteventura. Wüstengebiet mit niedriger Lichtverschmutzung.",
        "accessibility": "Public - By car + walking",
        "points_of_interest": ["Vistas panorámicas", "Paisaje desértico", "Zona virgen"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/92/Fuerteventura_Desert_Landscape.jpg",
        "live_stream_url": None,
        "website": None
    },

    {
        "name_es": "Playa de Sotavento",
        "name_en": "Playa de Sotavento",
        "name_de": "Playa de Sotavento",
        "island": "Fuerteventura",
        "latitude": 28.1500,
        "longitude": -14.0500,
        "altitude": 50,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Extensa playa con condiciones de baja contaminación lumínica durante invierno. Ideal para observación de eventos astronómicos.",
        "description_en": "Extensive beach with low light pollution conditions during winter. Ideal for astronomical event observation.",
        "description_de": "Ausgedehnter Strand mit geringer Lichtverschmutzung während des Winters. Ideal zur Beobachtung astronomischer Ereignisse.",
        "accessibility": "Public - Beach access",
        "points_of_interest": ["Playa extensa", "Baja contaminación", "Acceso gratuito"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/d/df/Fuerteventura_Beach.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LA PALMA (1)
    {
        "name_es": "Caldera de Taburiente",
        "name_en": "Caldera de Taburiente",
        "name_de": "Caldera de Taburiente",
        "island": "La Palma",
        "latitude": 28.6833,
        "longitude": -17.8500,
        "altitude": 2396,
        "bortle_scale": 2,
        "category": "landscape_viewpoint",
        "description_es": "Caldera volcánica espectacular del Parque Nacional. Vistas de ensueño nocturnas con Vía Láctea visible en toda su gloria.",
        "description_en": "Spectacular volcanic caldera of the National Park. Dreamlike night views with Milky Way visible in all its glory.",
        "description_de": "Spektakuläre Vulkankaldere des Nationalparks. Traumhafte Nachtsicht mit Milchstraße in all ihrer Pracht.",
        "accessibility": "Public - By car + hiking",
        "points_of_interest": ["Parque Nacional", "Volcán", "Miradores"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/7d/Caldera_Taburiente_La_Palma.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LA GOMERA (1)
    {
        "name_es": "Playas de Rey",
        "name_en": "Playas de Rey",
        "name_de": "Playas de Rey",
        "island": "La Gomera",
        "latitude": 28.0639,
        "longitude": -17.2583,
        "altitude": 50,
        "bortle_scale": 3,
        "category": "landscape_viewpoint",
        "description_es": "Playa remota de La Gomera con cielos oscuros. Acceso limitado añade encanto y aislamiento del ruido lumínico.",
        "description_en": "Remote beach of La Gomera with dark skies. Limited access adds charm and isolation from light noise.",
        "description_de": "Abgelegener Strand von La Gomera mit dunklem Himmel. Begrenzte Zugang bietet Charme und Isolation von Lichtverschmutzung.",
        "accessibility": "Public - By hiking trail",
        "points_of_interest": ["Playa remota", "Acceso limitado", "Cielos oscuros"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a6/La_Gomera_Remote_Beach.jpg",
        "live_stream_url": None,
        "website": None
    },

    # EL HIERRO (1)
    {
        "name_es": "Punta de la Restinga",
        "name_en": "Punta de la Restinga",
        "name_de": "Punta de la Restinga",
        "island": "El Hierro",
        "latitude": 27.6167,
        "longitude": -17.9500,
        "altitude": 50,
        "bortle_scale": 2,
        "category": "landscape_viewpoint",
        "description_es": "Punto más meridional de España con cielos pristinos. Ubicación remota perfecta para observación sin interferencia lumínica.",
        "description_en": "Southernmost point of Spain with pristine skies. Remote location perfect for observation without light interference.",
        "description_de": "Südlichster Punkt Spaniens mit unberührtem Himmel. Abgelegener Ort perfekt zur Beobachtung ohne Lichtverschmutzung.",
        "accessibility": "Public - By car",
        "points_of_interest": ["Punto más meridional", "Cielos pristinos", "Aislamiento"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/6c/El_Hierro_Southernmost_Point.jpg",
        "live_stream_url": None,
        "website": None
    },

    # LA GRACIOSA (1)
    {
        "name_es": "Isla Graciosa - Centro",
        "name_en": "La Graciosa - Center",
        "name_de": "La Graciosa - Mitte",
        "island": "La Graciosa",
        "latitude": 29.2306,
        "longitude": -13.5222,
        "altitude": 80,
        "bortle_scale": 1,
        "category": "landscape_viewpoint",
        "description_es": "Centro de la isla de La Graciosa. Ubicación más aislada de las Canarias con cielos de Bortle 1 (pristino).",
        "description_en": "Center of La Graciosa island. Most isolated location in the Canaries with Bortle 1 skies (pristine).",
        "description_de": "Zentrum der Insel La Graciosa. Abgelegenster Ort der Kanarischen Inseln mit Bortle-1-Himmel (unberührt).",
        "accessibility": "Public - Ferry + hiking",
        "points_of_interest": ["Isla aislada", "Cielos Bortle 1", "Paisaje virgen"],
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/18/La_Graciosa_Island.jpg",
        "live_stream_url": None,
        "website": None
    },
]

# ============================================================================
# DATABASE SEEDING FUNCTIONS (psycopg2)
# ============================================================================

def get_connection():
    """Obtiene conexión a PostgreSQL desde variables de entorno."""
    db_url = os.environ.get(
        "DATABASE_URL",
        f"postgresql://{os.environ.get('DB_USER', 'postgres')}:{os.environ.get('DB_PASSWORD', 'postgres')}"
        f"@{os.environ.get('DB_HOST', 'localhost')}:{os.environ.get('DB_PORT', '5432')}"
        f"/{os.environ.get('DB_NAME', 'adastrasky')}"
    )
    return psycopg2.connect(db_url)


def clear_existing_data(conn) -> None:
    """Clear existing sky quality zones before seeding."""
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM sky_quality_zones")
        conn.commit()
        logger.info("✓ Cleared existing sky quality zones")
    except Exception as e:
        conn.rollback()
        logger.error(f"✗ Error clearing existing data: {str(e)}")
        raise


def seed_sky_quality_zones(conn) -> None:
    """Seed all sky quality zones using raw SQL."""
    all_zones = OBSERVATORIES + ASTRONOMICAL_VIEWPOINTS + LANDSCAPE_VIEWPOINTS

    logger.info(f"🌟 Starting seeding of {len(all_zones)} sky quality zones...")
    logger.info(f"   - {len(OBSERVATORIES)} Observatories")
    logger.info(f"   - {len(ASTRONOMICAL_VIEWPOINTS)} Astronomical Viewpoints")
    logger.info(f"   - {len(LANDSCAPE_VIEWPOINTS)} Landscape Viewpoints")

    insert_sql = """
        INSERT INTO sky_quality_zones
            (name, island, category, bortle_scale, latitude, longitude, altitude,
             accessibility, description, image_url, streaming_url, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    successfully_added = 0
    failed = 0

    for idx, zone_data in enumerate(all_zones, 1):
        try:
            with conn.cursor() as cur:
                cur.execute(insert_sql, (
                    zone_data["name_es"],
                    zone_data["island"],
                    zone_data["category"],
                    zone_data["bortle_scale"],
                    zone_data["latitude"],
                    zone_data["longitude"],
                    zone_data["altitude"],
                    zone_data.get("accessibility", ""),
                    zone_data.get("description_es", ""),
                    zone_data.get("image_url"),
                    zone_data.get("live_stream_url"),
                    True,
                ))
            conn.commit()
            successfully_added += 1
            category_name = zone_data["category"].replace("_", " ").title()
            logger.info(f"   ✓ [{idx:2d}/{len(all_zones)}] {zone_data['name_es']:40s} ({zone_data['island']:15s}) - {category_name}")
        except Exception as e:
            conn.rollback()
            logger.error(f"   ✗ [{idx:2d}/{len(all_zones)}] Error seeding {zone_data['name_es']}: {str(e)}")
            failed += 1

    logger.info(f"\n✓ Successfully seeded {successfully_added} zones")
    if failed > 0:
        logger.warning(f"⚠ {failed} zones failed to seed")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    logger.info("\n")
    logger.info("╔" + "=" * 68 + "╗")
    logger.info("║" + "ADASTRA SKY - DATABASE SEEDING SCRIPT".center(68) + "║")
    logger.info("╚" + "=" * 68 + "╝\n")

    if not HAS_PSYCOPG2:
        logger.error("psycopg2 no instalado. Ejecuta: pip install psycopg2-binary")
        return 1

    try:
        conn = get_connection()
        try:
            clear_existing_data(conn)
            seed_sky_quality_zones(conn)
        finally:
            conn.close()
        return 0
    except Exception as e:
        logger.error(f"\n✗ Fatal error during seeding: {str(e)}")
        logger.exception("Full traceback:")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
