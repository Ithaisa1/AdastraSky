# 📚 API Documentation

## Base URL

```
http://localhost:5000/api
```

---

## 🌌 SKY TODAY

### Get Sky Data for Location

```
GET /sky/today?lat={latitude}&lng={longitude}
```

**Parameters:**
- `lat` (float, required): Latitude
- `lng` (float, required): Longitude

**Response:**
```json
{
  "status": "success",
  "data": {
    "location": {
      "latitude": 28.3301,
      "longitude": -16.4923,
      "place_name": "Tenerife"
    },
    "sky_score": 8.9,
    "weather": {
      "cloudiness": 0.12,
      "wind_speed": 5,
      "humidity": 0.45,
      "temperature": 18
    },
    "moon": {
      "phase": 0.43,
      "phase_name": "Creciente",
      "illumination": 43,
      "rise_time": "2024-05-26T05:30:00Z",
      "set_time": "2024-05-26T14:45:00Z"
    },
    "best_time": {
      "start": "23:30",
      "end": "04:00",
      "duration_hours": 4.5
    },
    "recommendation": "Excellent night for observation"
  }
}
```

---

## 🧠 SKY SCORE

### Calculate Sky Score

```
POST /sky/score
```

**Body:**
```json
{
  "latitude": 28.3301,
  "longitude": -16.4923,
  "cloudiness": 0.12,
  "wind_speed": 5,
  "humidity": 0.45,
  "light_pollution": 0.15,
  "moon_phase": 0.43
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "sky_score": 8.9,
    "factors": {
      "cloudiness_factor": 8.8,
      "light_pollution_factor": 8.5,
      "moon_factor": 6.5,
      "wind_factor": 8,
      "humidity_factor": 5.5,
      "transparency_factor": 8
    },
    "weights": {
      "cloudiness": 0.30,
      "light_pollution": 0.30,
      "moon_phase": 0.15,
      "wind": 0.10,
      "humidity": 0.10,
      "transparency": 0.05
    }
  }
}
```

---

## 📍 SKY ZONES

### Get All Sky Zones

```
GET /zones
```

**Query Parameters:**
- `island` (string, optional): Filter by island
- `sort` (string, optional): 'score_desc' | 'score_asc' | 'name'
- `limit` (integer, optional): Results per page (default: 20)
- `page` (integer, optional): Page number (default: 1)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Mirador de Chipeque",
      "latitude": 28.3301,
      "longitude": -16.4923,
      "altitude": 2200,
      "island": "tenerife",
      "sky_score": 9.2,
      "light_pollution": 0.10,
      "description": "Excelente miradorastronómico",
      "last_updated": "2024-05-25T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "pages": 3,
    "current_page": 1,
    "per_page": 20
  }
}
```

### Get Zone by ID

```
GET /zones/:id
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Mirador de Chipeque",
    "latitude": 28.3301,
    "longitude": -16.4923,
    "altitude": 2200,
    "island": "tenerife",
    "sky_score": 9.2,
    "light_pollution": 0.10,
    "weather": {
      "cloudiness": 0.12,
      "wind_speed": 5,
      "humidity": 0.45
    },
    "recent_history": [...]
  }
}
```

---

## 🪐 WHAT TO SEE

### Get Visible Objects Tonight

```
GET /what-to-see?lat={lat}&lng={lng}&date={date}&time={time}
```

**Parameters:**
- `lat` (float, required): Latitude
- `lng` (float, required): Longitude
- `date` (string, optional): YYYY-MM-DD (default: today)
- `time` (string, optional): HH:MM (default: 22:00)

**Response:**
```json
{
  "status": "success",
  "data": {
    "location": {
      "latitude": 28.3301,
      "longitude": -16.4923
    },
    "observation_time": "2024-05-26T22:00:00Z",
    "planets": [
      {
        "name": "Jupiter",
        "visible": true,
        "altitude": 45,
        "azimuth": 180,
        "magnitude": -2.1,
        "rise_time": "2024-05-26T19:30:00Z",
        "set_time": "2024-05-27T05:30:00Z"
      }
    ],
    "constellations": [
      {
        "name": "Orión",
        "visible": true,
        "altitude": 30,
        "key_stars": ["Betelgeuse", "Rigel"],
        "difficulty": "easy"
      }
    ],
    "milky_way": {
      "visible": true,
      "altitude": 60,
      "quality": "excellent"
    },
    "events": [
      {
        "name": "Meteor from Perseids",
        "time": "23:45",
        "altitude": 70
      }
    ]
  }
}
```

---

## 📅 EVENTS

### Get Astronomical Events

```
GET /events?days_ahead={days}
```

**Parameters:**
- `days_ahead` (integer, optional): Days to look ahead (default: 30)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Lluvia de Perseidas",
      "type": "meteor_shower",
      "start_date": "2024-08-11T00:00:00Z",
      "end_date": "2024-08-13T23:59:59Z",
      "peak_date": "2024-08-12T03:00:00Z",
      "description": "Lluvia de meteoros activa...",
      "visibility_score": 9,
      "best_locations": ["Tenerife", "Gran Canaria"],
      "frequency_per_hour": 50
    }
  ]
}
```

---

## 🗺️ MAP

### Get Map Data for Island

```
GET /map/:island
```

**Parameters:**
- `island` (string): Island code (tenerife, gran_canaria, etc.)

**Response:**
```json
{
  "status": "success",
  "data": {
    "island": "tenerife",
    "zones": [...],
    "bounds": {
      "north": 28.56,
      "south": 28.04,
      "east": -15.97,
      "west": -16.87
    },
    "light_pollution_layers": [...]
  }
}
```

---

## 🔐 AUTHENTICATION

### Register

```
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

### Login

```
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "status": "fail",
  "error": "Validation Error",
  "message": "Invalid parameters"
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "error": "Unauthorized",
  "message": "Invalid token or credentials"
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## 📝 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - No access |
| 404 | Not Found - Resource missing |
| 500 | Server Error - Internal error |

---

**Last Updated**: May 25, 2024  
**API Version**: v1
