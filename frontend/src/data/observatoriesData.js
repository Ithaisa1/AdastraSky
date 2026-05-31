/**
 * AdastraSky Frontend - Datos de Observatorios
 * Información detallada de los observatorios en las Islas Canarias
 */

export const observatoriesData = [
  {
    id: 'obs-1',
    name: 'Observatorio del Teide',
    island: 'Tenerife',
    latitude: 28.2917,
    longitude: -16.5111,
    altitude: 2390,
    bortle_scale: 2,
    description: 'El Observatorio del Teide es uno de los observatorios más importantes del mundo, situado en el Parque Nacional del Teide. Su ubicación a 2.390 metros de altitud y su clima excepcional lo convierten en un lugar ideal para la observación astronómica.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    established: 1985,
    institution: 'Instituto de Astrofísica de Canarias (IAC)',
    telescopes: [
      'Telescopio Carlos Sánchez',
      'Telescopio IAC80',
      'Telescopio THEMIS',
      'Telescopio Solar GREGOR'
    ],
    research_areas: ['Física Solar', 'Astrofísica Estelar', 'Cosmología'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '10:00 - 18:00',
      guided_tours: true,
      reservation_required: true
    }
  },
  {
    id: 'obs-2',
    name: 'Observatorio del Roque de los Muchachos',
    island: 'La Palma',
    latitude: 28.7567,
    longitude: -17.8778,
    altitude: 2426,
    bortle_scale: 1,
    description: 'El Observatorio del Roque de los Muchachos es considerado uno de los mejores lugares del mundo para la observación astronómica debido a su estabilidad atmosférica y oscuridad del cielo. Alberga el Gran Telescopio Canarias (GTC), el telescopio óptico más grande del mundo.',
    image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=1000&auto=format&fit=crop',
    established: 1985,
    institution: 'Instituto de Astrofísica de Canarias (IAC)',
    telescopes: [
      'Gran Telescopio Canarias (GTC)',
      'Telescopio William Herschel (WHT)',
      'Telescopio Isaac Newton (INT)',
      'Telescopio Nordic Optical Telescope (NOT)'
    ],
    research_areas: ['Cosmología', 'Astrofísica Extragaláctica', 'Planetología'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '09:00 - 17:00',
      guided_tours: true,
      reservation_required: true
    }
  },
  {
    id: 'obs-3',
    name: 'Observatorio de Izaña',
    island: 'Tenerife',
    latitude: 28.3083,
    longitude: -16.4992,
    altitude: 2367,
    bortle_scale: 2,
    description: 'El Observatorio de Izaña se especializa en la observación solar y atmosférica. Realiza mediciones continuas de la radiación solar, ozono y otros parámetros atmosféricos, siendo fundamental para el estudio del cambio climático.',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop',
    established: 1916,
    institution: 'Agencia Estatal de Meteorología (AEMET)',
    telescopes: [
      'Telescopio Solar Kodaikanal',
      'Telescopio Solar VTT',
      'Instrumentos de Medición Atmosférica'
    ],
    research_areas: ['Física Solar', 'Atmósfera Terrestre', 'Climatología'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '10:00 - 16:00',
      guided_tours: false,
      reservation_required: false
    }
  },
  {
    id: 'obs-4',
    name: 'Centro de Astrofísica de La Palma',
    island: 'La Palma',
    latitude: 28.6833,
    longitude: -17.8667,
    altitude: 420,
    bortle_scale: 3,
    description: 'Centro de divulgación científica y educativo situado en Breña Baja. Ofrece actividades de divulgación astronómica para el público general y escuelas, con planetario y talleres interactivos.',
    image: 'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=1000&auto=format&fit=crop',
    established: 1992,
    institution: 'Instituto de Astrofísica de Canarias (IAC)',
    telescopes: [
      'Planetario Digital',
      'Telescopio Educativo',
      'Telescopio Solar Portátil'
    ],
    research_areas: ['Divulgación Científica', 'Educación', 'Astronomía Amateur'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '10:00 - 20:00',
      guided_tours: true,
      reservation_required: false
    }
  },
  {
    id: 'obs-5',
    name: 'Observatorio de Pico de las Nieves',
    island: 'Gran Canaria',
    latitude: 27.9667,
    longitude: -15.5667,
    altitude: 1949,
    bortle_scale: 2,
    description: 'Observatorio situado en el punto más alto de Gran Canaria. Realiza investigaciones sobre la atmósfera terrestre y fenómenos meteorológicos, además de ofrecer instalaciones para la observación astronómica.',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop',
    established: 1975,
    institution: 'Instituto Nacional de Meteorología',
    telescopes: [
      'Telescopio Meteorológico',
      'Instrumentos de Medición Atmosférica',
      'Estación de Seguimiento Satelital'
    ],
    research_areas: ['Meteorología', 'Atmósfera Terrestre', 'Climatología'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '08:00 - 18:00',
      guided_tours: false,
      reservation_required: false
    }
  },
  {
    id: 'obs-6',
    name: 'Observatorio de Lanzarote',
    island: 'Lanzarote',
    latitude: 29.0333,
    longitude: -13.6667,
    altitude: 400,
    bortle_scale: 3,
    description: 'Centro de observación astronómica situado en Lanzarote, especializado en la divulgación científica y la observación del cielo nocturno. Ofrece talleres y actividades para familias y grupos.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop',
    established: 2005,
    institution: 'Cabildo de Lanzarote',
    telescopes: [
      'Telescopio Newtoniano 200mm',
      'Telescopio Refractor 100mm',
      'Telescopio Solar'
    ],
    research_areas: ['Divulgación Científica', 'Astronomía Amateur', 'Educación'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '19:00 - 23:00',
      guided_tours: true,
      reservation_required: true
    }
  }
];

export const observatoryIslands = [
  { id: 'all', label: 'Todas' },
  { id: 'Tenerife', label: 'Tenerife' },
  { id: 'La Palma', label: 'La Palma' },
  { id: 'Gran Canaria', label: 'Gran Canaria' },
  { id: 'Lanzarote', label: 'Lanzarote' },
  { id: 'Fuerteventura', label: 'Fuerteventura' },
  { id: 'La Gomera', label: 'La Gomera' },
  { id: 'El Hierro', label: 'El Hierro' },
  { id: 'La Graciosa', label: 'La Graciosa' }
];
