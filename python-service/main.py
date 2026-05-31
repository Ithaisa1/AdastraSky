"""
Sky Engine - API Flask
Microservicio responsable de cálculos astronómicos
"""

from flask import Flask, request, jsonify
from config import current_config
from scoring.sky_score import SkyScoreAlgorithm

app = Flask(__name__)
app.config.from_object(current_config)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RUTAS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'AdAstraSky Sky Engine',
        'version': '1.0.0'
    }), 200

@app.route('/api/sky-score', methods=['POST'])
def calculate_sky_score():
    """
    Calcula el Sky Score basado en condiciones atmosféricas
    
    Request:
    {
        "cloudiness": 0.12,
        "light_pollution": 0.15,
        "moon_phase": 0.43,
        "wind": 5,
        "humidity": 0.45,
        "transparency": 0.8
    }
    
    Response:
    {
        "sky_score": 8.9,
        "factors": {...},
        "recommendation": "..."
    }
    """
    try:
        data = request.get_json()
        
        # Validar datos
        required_fields = ['cloudiness', 'light_pollution', 'moon_phase', 'wind', 'humidity']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Calcular Sky Score
        algorithm = SkyScoreAlgorithm()
        sky_score = algorithm.calculate_sky_score(data)
        
        return jsonify({
            'sky_score': sky_score,
            'factors': data,
            'recommendation': get_recommendation(sky_score)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/what-to-see', methods=['GET'])
def what_to_see():
    """
    Obtiene objetos astronómicos visibles en una ubicación y momento
    
    Query parameters:
    - latitude: float
    - longitude: float
    - date: YYYY-MM-DD (opcional)
    - time: HH:MM (opcional)
    """
    try:
        latitude = request.args.get('latitude', type=float)
        longitude = request.args.get('longitude', type=float)
        date = request.args.get('date')
        time = request.args.get('time')
        
        if latitude is None or longitude is None:
            return jsonify({'error': 'latitude and longitude are required'}), 400
        
        # TODO: Implementar lógica
        return jsonify({
            'location': {'latitude': latitude, 'longitude': longitude},
            'visible_objects': {
                'planets': ['Jupiter', 'Venus', 'Saturn'],
                'constellations': ['Orión', 'Osa Mayor', 'Vía Láctea'],
                'moon_phase': 0.43
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Obtiene eventos astronómicos próximos"""
    try:
        days_ahead = request.args.get('days_ahead', default=30, type=int)
        
        # TODO: Implementar lógica
        return jsonify({
            'events': [
                {
                    'name': 'Lluvia de Perseidas',
                    'date': '2024-08-12',
                    'type': 'meteor_shower',
                    'visibility_score': 9
                }
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FUNCIONES AUXILIARES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def get_recommendation(sky_score):
    """Genera recomendación basada en Sky Score"""
    if sky_score >= 8.5:
        return 'Excelente noche para observar. ¡Sal ahora!'
    elif sky_score >= 7:
        return 'Buena noche para observar.'
    elif sky_score >= 5:
        return 'Condiciones aceptables. Puedes intentarlo.'
    else:
        return 'No es buena noche. Espera condiciones mejores.'

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MANEJO DE ERRORES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not Found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal Server Error'}), 500

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PUNTO DE ENTRADA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=app.config['DEBUG']
    )
