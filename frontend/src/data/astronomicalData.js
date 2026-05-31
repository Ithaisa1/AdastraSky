/**
 * AdastraSky Frontend - Datos Astronómicos
 * Información de constelaciones y eventos astronómicos próximos
 */

export const constellationsData = [
  {
    id: 'const-1',
    name: 'Orión',
    latinName: 'Orion',
    season: 'Invierno',
    description: 'Una de las constelaciones más reconocibles del cielo nocturno, caracterizada por su cinturón de tres estrellas brillantes. Representa al cazador mitológico.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop',
    brightest_stars: ['Betelgeuse', 'Rigel', 'Bellatrix'],
    visible_from: 'Octubre - Marzo',
    mythology: 'En la mitología griega, Orión era un cazador gigante colocado en el cielo por Zeus tras su muerte.',
    best_viewing: 'Hemisferio Norte',
    area: '594 grados cuadrados'
  },
  {
    id: 'const-2',
    name: 'Osa Mayor',
    latinName: 'Ursa Major',
    season: 'Primavera',
    description: 'La tercera constelación más grande del cielo, contiene el asterismo del "Carro Mayor" o "Gran Osa". Es fundamental para la navegación.',
    image: 'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=1000&auto=format&fit=crop',
    brightest_stars: ['Polaris', 'Dubhe', 'Merak'],
    visible_from: 'Febrero - Septiembre',
    mythology: 'Representa a Calisto, una ninfa transformada en osa por Hera y colocada en el cielo por Zeus.',
    best_viewing: 'Hemisferio Norte',
    area: '1280 grados cuadrados'
  },
  {
    id: 'const-3',
    name: 'Escorpio',
    latinName: 'Scorpius',
    season: 'Verano',
    description: 'Una constelación del zodíaco que representa un escorpión. Contiene la estrella Antares, una de las más brillantes del cielo.',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop',
    brightest_stars: ['Antares', 'Shaula', 'Sargas'],
    visible_from: 'Mayo - Septiembre',
    mythology: 'El escorpión que mató a Orión según la mitología griega, colocado en el cielo opuesto a su enemigo.',
    best_viewing: 'Hemisferio Sur',
    area: '497 grados cuadrados'
  },
  {
    id: 'const-4',
    name: 'Casiopea',
    latinName: 'Cassiopeia',
    season: 'Otoño',
    description: 'Constelación fácilmente reconocible por su forma de "W" o "M". Representa a la reina Casiopea de la mitología griega.',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop',
    brightest_stars: ['Schedar', 'Caph', 'Gamma Cassiopeiae'],
    visible_from: 'Agosto - Enero',
    mythology: 'Reina etíope que fue castigada por Poseidón y colocada en el cielo sentada en su trono.',
    best_viewing: 'Hemisferio Norte',
    area: '598 grados cuadrados'
  },
  {
    id: 'const-5',
    name: 'Cruz del Sur',
    latinName: 'Crux',
    season: 'Primavera',
    description: 'La constelación más pequeña pero una de las más famosas del hemisferio sur. Esencial para la navegación en el hemisferio sur.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    brightest_stars: ['Acrux', 'Mimosa', 'Gacrux'],
    visible_from: 'Marzo - Agosto',
    mythology: 'Representa la cruz cristiana, visible solo en el hemisferio sur.',
    best_viewing: 'Hemisferio Sur',
    area: '68 grados cuadrados'
  },
  {
    id: 'const-6',
    name: 'Perseo',
    latinName: 'Perseus',
    season: 'Invierno',
    description: 'Constelación del hemisferio norte que representa al héroe griego Perseo. Contiene el cúmulo estelar doble de Perseo.',
    image: 'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?q=80&w=1000&auto=format&fit=crop',
    brightest_stars: ['Mirfak', 'Algol', 'Atik'],
    visible_from: 'Octubre - Marzo',
    mythology: 'Héroe griego que mató a la Medusa y salvó a Andrómeda del monstruo marino.',
    best_viewing: 'Hemisferio Norte',
    area: '615 grados cuadrados'
  }
];

export const astronomicalEvents = [
  {
    id: 'event-1',
    name: 'Lluvia de Estrellas Perseidas',
    type: 'meteor_shower',
    date: '2026-08-12',
    peak_date: '12-13 de Agosto',
    description: 'Una de las lluvias de meteoros más espectaculares del año, con hasta 100 meteoros por hora en su pico máximo.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop',
    parent_body: 'Cometa 109P/Swift-Tuttle',
    visibility: 'Hemisferio Norte',
    best_time: 'Después de medianoche',
    moon_phase: 'Cuarto menguante',
    tips: 'Busca la constelación de Perseo, el punto radiante de la lluvia.'
  },
  {
    id: 'event-2',
    name: 'Eclipse Lunar Total',
    type: 'eclipse',
    date: '2026-09-18',
    peak_date: '18 de Septiembre',
    description: 'Eclipse lunar total visible desde Europa, África y América. La Luna tomará un tono rojizo característico.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1000&auto=format&fit=crop',
    parent_body: 'Luna',
    visibility: 'Europa, África, América',
    best_time: 'Totalidad: 02:00 - 03:30 UTC',
    moon_phase: 'Luna llena',
    tips: 'No se necesita equipo especial, pero binoculares mejoran la experiencia.'
  },
  {
    id: 'event-3',
    name: 'Lluvia de Estrellas Gemínidas',
    type: 'meteor_shower',
    date: '2026-12-14',
    peak_date: '13-14 de Diciembre',
    description: 'La lluvia de meteoros más intensa del año, con hasta 150 meteoros por hora. Excelente visibilidad desde las Canarias.',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000&auto=format&fit=crop',
    parent_body: 'Asteroide 3200 Phaethon',
    visibility: 'Hemisferio Norte',
    best_time: 'Toda la noche',
    moon_phase: 'Luna nueva',
    tips: 'Las Gemínidas son meteoros lentos y brillantes, perfectos para fotografía.'
  },
  {
    id: 'event-4',
    name: 'Cometa C/2026 A3',
    type: 'comet',
    date: '2026-10-15',
    peak_date: '15-20 de Octubre',
    description: 'Cometa recientemente descubierto que podría ser visible a simple vista. Se espera que alcance magnitud 4.',
    image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=1000&auto=format&fit=crop',
    parent_body: 'Sistema Solar',
    visibility: 'Hemisferio Norte',
    best_time: 'Después del atardecer',
    moon_phase: 'Cuarto creciente',
    tips: 'Busca en la constelación de Hércules. Usa binoculares para mejor visibilidad.'
  },
  {
    id: 'event-5',
    name: 'Oposición de Júpiter',
    type: 'planetary_event',
    date: '2026-12-07',
    peak_date: '7 de Diciembre',
    description: 'Júpiter estará en oposición, lo que significa que estará más brillante y cercano a la Tierra. Ideal para observación.',
    image: 'https://images.unsplash.com/photo-1614730341194-75c60740a2d3?q=80&w=1000&auto=format&fit=crop',
    parent_body: 'Júpiter',
    visibility: 'Todo el mundo',
    best_time: 'Toda la noche',
    moon_phase: 'Cuarto menguante',
    tips: 'Con un telescopio pequeño podrás ver las bandas de nubes y las lunas galileanas.'
  },
  {
    id: 'event-6',
    name: 'Lluvia de Estrellas Cuádridas',
    type: 'meteor_shower',
    date: '2027-01-03',
    peak_date: '3-4 de Enero',
    description: 'Primera lluvia de meteoros del año, con hasta 40 meteoros por hora. Los meteoros son muy brillantes.',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000&auto=format&fit=crop',
    parent_body: 'Asteroide 2003 EH1',
    visibility: 'Hemisferio Norte',
    best_time: 'Después de medianoche',
    moon_phase: 'Luna nueva',
    tips: 'Los meteoros de las Cuádridas suelen dejar estelas persistentes.'
  }
];

export const eventCategories = [
  { id: 'all', label: 'Todos', icon: 'Star' },
  { id: 'meteor_shower', label: 'Lluvias de Estrellas', icon: 'Sparkles' },
  { id: 'eclipse', label: 'Eclipses', icon: 'Moon' },
  { id: 'comet', label: 'Cometas', icon: 'Comet' },
  { id: 'planetary_event', label: 'Eventos Planetarios', icon: 'Globe' }
];
