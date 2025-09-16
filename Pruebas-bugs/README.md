# Backend de la aplicación de programación de Horarios SENA

Este es un proyecto de Node.js que utiliza varias tecnologías populares como Express y Mongoose para crear una aplicación web que maneja la programación de horarios de las fichas del SENA.

## Requisitos

Antes de comenzar a usar este proyecto, asegúrese de tener instalado lo siguiente:

- Node.js
- npm

## Instalación

Para comenzar, clone este repositorio en su máquina local y luego ejecute el siguiente comando en la línea de comandos en el directorio raíz del proyecto:

- npm install

Esto instalará todas las dependencias necesarias para el proyecto.

## Uso

Para comenzar a usar la aplicación, primero configure las variables de entorno en un archivo `.env` en el directorio raíz del proyecto. Se deben configurar las siguientes variables:

- PORT: el puerto en el que se ejecutará la aplicación
- MONGO_URI: la URL de conexión para la base de datos MongoDB

Una vez que se han configurado las variables de entorno, puede iniciar la aplicación con el siguiente comando:

- npm run start

Esto iniciará la aplicación y la hará accesible en `http://localhost:puerto` , donde "puerto" es el número de puerto configurado en las variables de entorno.

## Contribución

Si desea contribuir a este proyecto, ¡estaremos encantados de aceptar solicitudes de extracción! Antes de hacerlo, asegúrese de seguir estas pautas:

1. Cree una rama de características a partir de la rama main.
2. Realice los cambios que desee agregar.
3. Asegúrese de que las pruebas pasen.
4. Cree una solicitud de extracción que explique los cambios que realizó.
