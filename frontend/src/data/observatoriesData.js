import roqueImg from '../assets/Observacion_estrellas_roque_muchachos_isla_bonita_tours.jpg';
import teideImg from '../assets/observatorio-teide.jpg';

export const observatoriesData = [
  {
    id: 'obs-1',
    name: 'Observatorio del Roque de los Muchachos',
    island: 'La Palma',
    latitude: 28.7567,
    longitude: -17.8778,
    altitude: 2426,
    bortle_scale: 1,
    description: 'Considerado uno de los mejores cielos del mundo para astronomía profesional. Alberga el Gran Telescopio Canarias (GTC/GRANTECAN) de 10.4 m, el mayor telescopio óptico del mundo, junto a telescopios de múltiples países europeos. Su seeing excepcional de 0.4-0.8 arcsec lo sitúa entre los mejores observatorios globales.',
    image: roqueImg,
    established: 1985,
    institution: 'Instituto de Astrofísica de Canarias (IAC) / GRANTECAN',
    telescopes: [
      'Gran Telescopio Canarias GTC (10.4 m)',
      'Telescopio William Herschel WHT (4.2 m)',
      'Telescopio Isaac Newton INT (2.5 m)',
      'Nordic Optical Telescope NOT (2.56 m)',
      'Telescopio Nazionale Galileo TNG (3.58 m)',
      'Mercator Telescope (1.2 m)',
      'Liverpool Telescope (2.0 m)',
      'Telescopio Cherenkov LST-1',
      'MAGIC Telescopes (I+II)'
    ],
    research_areas: ['Cosmología', 'Astrofísica Extragaláctica', 'Astropartículas', 'Exoplanetas', 'Evolución Estelar'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '09:00 - 17:00',
      guided_tours: true,
      reservation_required: true
    }
  },
  {
    id: 'obs-2',
    name: 'Observatorio del Teide',
    island: 'Tenerife',
    latitude: 28.3017,
    longitude: -16.5092,
    altitude: 2390,
    bortle_scale: 2,
    description: 'Operado por el Instituto de Astrofísica de Canarias (IAC), es uno de los observatorios solares más importantes del mundo. Alberga telescopios como GREGOR (el mayor solar de Europa), THEMIS y el IAC-80. Su ubicación a 2.390 m sobre el nivel del mar y la estabilidad atmosférica lo hacen excepcional para física solar.',
    image: teideImg,
    established: 1964,
    institution: 'Instituto de Astrofísica de Canarias (IAC)',
    telescopes: [
      'Telescopio Solar GREGOR (1.5 m)',
      'Telescopio THEMIS (90 cm)',
      'Telescopio IAC-80 (80 cm)',
      'Telescopio Carlos Sánchez (1.5 m)',
      'Telescopio Solar VTT (70 cm)',
      'Telescopio OGS (1 m)'
    ],
    research_areas: ['Física Solar', 'Astrofísica Estelar', 'Heliosismología', 'Física Atmosférica'],
    visitor_info: {
      open_to_public: true,
      visiting_hours: '10:00 - 18:00',
      guided_tours: true,
      reservation_required: true
    }
  }
];

export const observatoryIslands = [
  { id: 'all', label: 'Todas' },
  { id: 'Tenerife', label: 'Tenerife' },
  { id: 'La Palma', label: 'La Palma' }
];
