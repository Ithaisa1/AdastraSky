import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const faqData = [
  {
    category: 'General',
    items: [
      {
        q: '¿Qué es Adastra Sky?',
        a: 'Adastra Sky es una plataforma de astroturismo para las Islas Canarias que te permite descubrir y explorar santuarios estelares —puntos de observación astronómica con condiciones privilegiadas para la contemplación del cielo nocturno.'
      },
      {
        q: '¿Qué es un Santuario Estelar?',
        a: 'Un Santuario Estelar es un punto de observación astronómica certificado por su baja contaminación lumínica, altitud, accesibilidad y calidad del cielo. En Adastra Sky encontrarás observatorios, miradores astronómicos y paisajísticos repartidos por las 8 islas del archipiélago canario.'
      },
      {
        q: '¿Cómo se calcula la escala Bortle?',
        a: 'La escala Bortle mide la calidad del cielo nocturno en una escala del 1 al 9, donde 1 representa un cielo totalmente oscuro y 9 un cielo urbano muy contaminado. En Canarias, muchos santuarios tienen valores entre 1 y 4, ofreciendo algunas de las mejores condiciones del mundo para la observación.'
      }
    ]
  },
  {
    category: 'Uso de la Plataforma',
    items: [
      {
        q: '¿Cómo explorar los santuarios?',
        a: 'Usa el mapa interactivo en la sección "Sky Map" para ver todos los puntos de interés. Puedes filtrar por isla, tipo de santuario o escala Bortle. Cada punto incluye información detallada: altitud, coordenadas, mejores horas de observación y servicios disponibles.'
      },
      {
        q: '¿Cómo funciona Adastra?',
        a: 'Adastra es el asistente astronómico inteligente de la plataforma, entrenado con datos astronómicos de Canarias. Puedes preguntarle sobre fases lunares, visibilidad de planetas, condiciones meteorológicas para observación, o recomendaciones personalizadas de santuarios según tus preferencias.'
      },
      {
        q: '¿Puedo guardar mis santuarios favoritos?',
        a: 'Actualmente puedes explorar y descubrir santuarios. La funcionalidad de lista de favoritos estará disponible en una próxima actualización.'
      }
    ]
  },
  {
    category: 'Astronomía en Canarias',
    items: [
      {
        q: '¿Por qué Canarias es un destino privilegiado?',
        a: 'El archipiélago canario es uno de los mejores lugares del mundo para la observación astronómica gracias a su ubicación subtropical, baja contaminación lumínica, estabilidad atmosférica y la presencia de dos de los observatorios más importantes del mundo: el Observatorio del Roque de los Muchachos (La Palma) y el Observatorio del Teide (Tenerife).'
      },
      {
        q: '¿Cuál es la mejor época para observar?',
        a: 'Aunque Canarias ofrece buenas condiciones todo el año, los meses de verano (junio a septiembre) suelen tener cielos más despejados. El invierno ofrece noches más largas pero con más probabilidad de nubes. Consulta la sección de eventos astronómicos para planificar tu visita.'
      },
      {
        q: '¿Necesito equipo especial?',
        a: 'No necesariamente. Muchos santuarios son ideales para la observación a simple vista. Para una experiencia más completa, recomendamos prismáticos o un telescopio portátil. Los miradores astronómicos suelen estar equipados con paneles informativos y zonas de descanso.'
      }
    ]
  },
  {
    category: 'Puntuaciones y Métricas',
    items: [
      {
        q: '¿Qué es el Sky Score Global?',
        a: 'El Sky Score Global es un indicador general de la calidad del cielo nocturno en todo el archipiélago canario. Se calcula a partir de la media ponderada de las escalas Bortle de todos los santuarios estelares registrados, ofreciendo una puntuación del 0 al 10 que refleja las condiciones astronómicas generales de las Islas Canarias en tiempo real.'
      },
      {
        q: '¿Qué es la Puntuación AdAstraSky?',
        a: 'La Puntuación AdAstraSky es un sistema de valoración propio que combina múltiples factores —altitud, escala Bortle, accesibilidad, servicios disponibles y calidad histórica del seeing— para asignar a cada santuario una puntuación única del 0 al 100. Esta puntuación permite comparar rápidamente la calidad de los diferentes puntos de observación del archipiélago.'
      },
      {
        q: '¿Qué significan las categorías Astro, Photo, Turismo y Global?',
        a: 'Son los distintos perfiles de puntuación de cada santuario: — Astro: valora la calidad para observación visual del cielo nocturno (baja contaminación lumínica, seeing estable). — Photo: valora las condiciones para astrofotografía (nitidez atmosférica, ausencia de turbulencia). — Turismo: valora la accesibilidad, servicios e infraestructura para visitantes. — Global: es la media ponderada de las tres puntuaciones anteriores, ofreciendo una valoración integral del santuario.'
      }
    ]
  },
  {
    category: 'Técnico',
    items: [
      {
        q: '¿Cómo actualizar mi perfil?',
        a: 'Ve a la sección "Settings" desde el menú lateral. Allí podrás modificar tu nombre, email, biografía y ubicación. Los cambios se guardan automáticamente en tu cuenta.'
      },
      {
        q: '¿Cómo cambiar el idioma?',
        a: 'En la sección Settings, pestaña "Configuración", puedes seleccionar entre Español, English y Deutsch. El cambio de idioma se aplica inmediatamente a toda la interfaz.'
      },
      {
        q: '¿Qué hago si olvido mi contraseña?',
        a: 'Contacta con el equipo de soporte a través de la sección "Contacto" para gestionar el restablecimiento de tu contraseña.'
      }
    ]
  }
];

const FAQPage = () => {
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = faqData.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen w-full flex bg-deepSpace">
      <Sidebar />
      <main className="flex-1 p-3">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-astroAccent/20 to-cosmicPurple/20 border border-astroAccent/20 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-astroAccent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Preguntas Frecuentes</h1>
              <p className="text-sm text-gray-400">Todo lo que necesitas saber sobre Adastra Sky</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar preguntas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-astroCard/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-astroAccent focus:outline-none transition-colors"
            />
          </div>

          {filtered.map((cat, catIdx) => (
            <div key={cat.category} className="bg-astroCard/50 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">{cat.category}</h2>
              </div>
              <div className="divide-y divide-white/5">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = openItems[key];
                  return (
                    <div key={itemIdx}>
                      <button
                        onClick={() => toggleItem(catIdx, itemIdx)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-white font-medium pr-4">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-astroAccent flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-300 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FAQPage;
