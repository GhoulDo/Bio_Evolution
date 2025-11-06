/**
 * Datos mock de sitios de aprovechamiento para testing
 * Coordenadas en Bogotá (WGS84)
 */
export const mockSitiosAprovechamiento = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "nombre": "ECA Kennedy Central",
        "direccion": "Calle 6 Sur # 72F-35",
        "localidad": "KENNEDY",
        "tipo": "ECA",
        "estado": "Activo",
        "materiales_array": ["papel", "plástico", "vidrio", "metal"],
        "horario": "Lunes a Viernes 7:00-17:00, Sábados 8:00-14:00",
        "telefono": "601 234 5678"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-74.1398, 4.6126]
      }
    },
    {
      "type": "Feature", 
      "properties": {
        "nombre": "Punto Verde Suba Plaza",
        "direccion": "Calle 145 # 91-19",
        "localidad": "SUBA",
        "tipo": "Punto Verde",
        "estado": "Activo",
        "materiales_array": ["papel", "plástico", "RAEE"],
        "horario": "Todos los días 10:00-20:00",
        "telefono": "601 345 6789"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-74.0912, 4.7535]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "nombre": "ECA Usaquén Norte", 
        "direccion": "Carrera 7 # 127-35",
        "localidad": "USAQUÉN",
        "tipo": "ECA",
        "estado": "Activo",
        "materiales_array": ["papel", "plástico", "vidrio", "metal", "organico"],
        "horario": "Lunes a Viernes 8:00-16:00",
        "telefono": "601 456 7890"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-74.0307, 4.6977]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "nombre": "Centro de Acopio Chapinero",
        "direccion": "Carrera 13 # 63-24", 
        "localidad": "CHAPINERO",
        "tipo": "Planta",
        "estado": "Activo",
        "materiales_array": ["papel", "plástico"],
        "horario": "Lunes a Sábado 9:00-18:00",
        "telefono": "601 567 8901"
      },
      "geometry": {
        "type": "Point", 
        "coordinates": [-74.0669, 4.6533]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "nombre": "ECA Bosa Occidental",
        "direccion": "Calle 57C Sur # 78K-12",
        "localidad": "BOSA", 
        "tipo": "ECA",
        "estado": "Activo",
        "materiales_array": ["papel", "plástico", "vidrio", "metal", "organico"],
        "horario": "Lunes a Viernes 7:00-15:00",
        "telefono": "601 678 9012"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-74.1887, 4.5385]
      }
    }
  ]
}
