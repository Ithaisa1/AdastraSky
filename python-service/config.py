import os
import sys
from pathlib import Path

# Configuración raíz del proyecto
ROOT_DIR = Path(__file__).parent.parent

class Config:
    """Configuración base"""
    DEBUG = False
    TESTING = False
    
class DevelopmentConfig(Config):
    """Configuración de desarrollo"""
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    """Configuración de producción"""
    DEBUG = False
    
class TestingConfig(Config):
    """Configuración de pruebas"""
    TESTING = True

# Seleccionar configuración por entorno
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
current_config = config[ENVIRONMENT]
