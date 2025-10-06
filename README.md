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

## Instalación

Instala las dependencias del proyecto una sola vez con:

```bash
npm install
```

## Ejecutar el servidor de notificaciones

Inicia el servidor HTTP con:

```bash
npm run start
```

Durante el desarrollo puedes mantenerlo con recarga automática utilizando Nodemon:

```bash
npm run dev
```

Al iniciar se establecerá la conexión con MongoDB y el servicio quedará disponible en `http://localhost:PORT`.

### Endpoints disponibles

- `GET /notifications/emails`: devuelve el listado de notificaciones enviadas a instructores. Se puede filtrar por:
  - `startDate` y/o `endDate` (formato ISO `YYYY-MM-DD`).
  - `ficheNumber` para buscar por número de ficha.

El servicio también expone los archivos estáticos del directorio `public`. Puedes abrir `http://localhost:PORT/notifications.html` en el navegador para utilizar la interfaz que consume el endpoint y filtra la información.

## Ejecutar el procesamiento automático de horarios

El job que descarga reportes y notifica a los instructores se ejecuta bajo demanda con:

```bash
npm run process:schedules
```

Este comando reutiliza el mismo archivo `.env` para conectarse a MongoDB y a Sofía Plus, inicia sesión en el portal, descarga los reportes pendientes, analiza los resultados y envía correos a los instructores cuando corresponde. Cada ejecución deja un registro en la colección `dailyprocessinglogs` para su seguimiento desde el servidor de notificaciones.

## Pruebas manuales del cliente Sofía Plus

El cliente Playwright que automatiza Sofía Plus se puede reutilizar de forma aislada para validar credenciales o descargar un reporte puntual. La secuencia básica consiste en iniciar sesión una vez y reutilizar la misma página para generar los reportes necesarios:

```js
import SofiaPlusClient from './src/clients/sofiaPlusClient.js';

const client = new SofiaPlusClient({ headless: false, slowMo: 250 });

await client.login();
await client.selectRole();
await client.navigateToReport();

const pathToReport = await client.downloadReport('1234567');
console.log(pathToReport);

await client.close();
```

Puedes configurar el modo `headless` y el retardo (`slowMo`) mediante los parámetros del constructor o las variables de entorno `HEADLESS` y `SLOWMO`. Los archivos descargados se guardan en el directorio configurado en `cfg.outputDir`.