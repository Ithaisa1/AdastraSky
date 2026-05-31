/**
 * AdastraSky Backend - Controlador de Zonas de Cielo
 * Consulta de santuarios estelares y calidad del cielo
 */

import SkyQualityZone from '../models/SkyQualityZone.js';

/**
 * Obtener todas las zonas de calidad del cielo
 */
export const getAllZones = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({
      where: { is_active: true },
      order: [['island', 'ASC'], ['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      count: zones.length,
      data: { zones }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una zona específica por ID
 */
export const getZoneById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const zone = await SkyQualityZone.findByPk(id);

    if (!zone) {
      return res.status(404).json({
        status: 'error',
        code: 'ZONE_NOT_FOUND',
        message: 'Zona no encontrada'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { zone }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener zonas por isla específica
 */
export const getZonesByIsland = async (req, res, next) => {
  try {
    const { island } = req.params;
    const zones = await SkyQualityZone.findAll({
      where: { 
        island,
        is_active: true
      },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      count: zones.length,
      data: { zones }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener zonas por categoría
 */
export const getZonesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const zones = await SkyQualityZone.findAll({
      where: { 
        category,
        is_active: true
      },
      order: [['island', 'ASC'], ['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      count: zones.length,
      data: { zones }
    });
  } catch (error) {
    next(error);
  }
};
