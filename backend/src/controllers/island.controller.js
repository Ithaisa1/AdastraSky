/**
 * AdastraSky Backend - Controlador de Islas
 * Información general de las islas del archipiélago canario
 */

// Datos estáticos de las islas (podrían moverse a base de datos en el futuro)
const ISLANDS_DATA = {
  'Gran Canaria': {
    name: 'Gran Canaria',
    description: 'Isla con diversidad de paisajes y excelentes condiciones para la observación astronómica.',
    capital: 'Las Palmas de Gran Canaria',
    area: 1560,
    population: 851000,
    astronomical_zones: 12
  },
  'Tenerife': {
    name: 'Tenerife',
    description: 'Hogar del Teide, el observatorio más importante del hemisferio norte.',
    capital: 'Santa Cruz de Tenerife',
    area: 2034,
    population: 948000,
    astronomical_zones: 15
  },
  'La Palma': {
    name: 'La Palma',
    description: 'La isla bonita, sede del Observatorio del Roque de los Muchachos.',
    capital: 'Santa Cruz de La Palma',
    area: 708,
    population: 83000,
    astronomical_zones: 10
  },
  'Lanzarote': {
    name: 'Lanzarote',
    description: 'Isla volcánica con cielos limpios y paisajes lunares.',
    capital: 'Arrecife',
    area: 845,
    population: 155000,
    astronomical_zones: 8
  },
  'Fuerteventura': {
    name: 'Fuerteventura',
    description: 'Isla con horizontes infinitos y excelente calidad del cielo.',
    capital: 'Puerto del Rosario',
    area: 1659,
    population: 119000,
    astronomical_zones: 7
  },
  'El Hierro': {
    name: 'El Hierro',
    description: 'La isla más joven y occidental, con cielos prístinos.',
    capital: 'Valverde',
    area: 278,
    population: 11000,
    astronomical_zones: 5
  },
  'La Gomera': {
    name: 'La Gomera',
    description: 'Isla de bosques laurisilva y cielos protegidos.',
    capital: 'San Sebastián de La Gomera',
    area: 370,
    population: 22000,
    astronomical_zones: 6
  },
  'La Graciosa': {
    name: 'La Graciosa',
    description: 'La isla más pequeña del archipiélago, con cielos virginales.',
    capital: 'Caleta de Sebo',
    area: 29,
    population: 700,
    astronomical_zones: 3
  }
};

/**
 * Obtener información de todas las islas
 */
export const getAllIslands = async (req, res, next) => {
  try {
    const islands = Object.values(ISLANDS_DATA);

    res.status(200).json({
      status: 'success',
      count: islands.length,
      data: { islands }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener información de una isla específica
 */
export const getIslandByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    
    // Normalizar el nombre (primera letra mayúscula, resto minúsculas)
    const normalizedName = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const island = ISLANDS_DATA[normalizedName];

    if (!island) {
      return res.status(404).json({
        status: 'error',
        code: 'ISLAND_NOT_FOUND',
        message: 'Isla no encontrada'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { island }
    });
  } catch (error) {
    next(error);
  }
};
