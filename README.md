# Automatización Sofia

Esta herramienta automatiza la descarga y procesamiento de reportes de calificación en Sofía Plus y ahora incluye un servicio web para consultar las notificaciones enviadas a los instructores.

## Requisitos previos

- Node.js 18 o superior
- Una instancia accesible de MongoDB con la base de datos utilizada por la automatización

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las credenciales necesarias. Para ejecutar el servidor HTTP se utilizan principalmente las siguientes variables:

- `MONGO_URL`: URL de conexión a MongoDB (por defecto `mongodb://localhost:27017/adso076`).
- `PORT`: Puerto para exponer el servidor Express (opcional, por defecto `3000`).

Las demás variables ya existentes (`SOFIA_USER`, `SOFIA_PASS`, etc.) continúan vigentes para el proceso automático.

## Ejecutar el servidor de notificaciones

Instala las dependencias y ejecuta el servidor con:

```bash
npm install
node src/server.js
```

Al iniciar se establecerá la conexión con MongoDB y el servicio quedará disponible en `http://localhost:PORT`.

### Endpoints disponibles

- `GET /notifications/emails`: devuelve el listado de notificaciones enviadas a instructores. Se puede filtrar por:
  - `startDate` y/o `endDate` (formato ISO `YYYY-MM-DD`).
  - `ficheNumber` para buscar por número de ficha.

El servicio también expone los archivos estáticos del directorio `public`. Puedes abrir `http://localhost:PORT/notifications.html` en el navegador para utilizar la interfaz que consume el endpoint y filtra la información.