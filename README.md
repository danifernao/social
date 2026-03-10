# Social

**Social** es una red social sencilla desarrollada con Laravel, Inertia.js y React, basada en la _starter kit_ oficial de Laravel 12. El proyecto busca ofrecer una experiencia minimalista y centrada en las interacciones básicas entre usuarios.

> **Estado del proyecto:** en desarrollo activo. Algunas funcionalidades están incompletas, en etapa de prueba o pendientes de implementación. Se esperan errores.

![Captura de pantalla de la aplicación](screenshot.png)

## Funcionalidades principales

- **Publicaciones y comentarios**
    - Permite dar formato a publicaciones y comentarios mediante Markdown.
    - Permite subir imágenes y videos desde el editor.
    - Permite mencionar a otros usuarios.
    - Premite usar _hashtags_.
    - Permite reaccionar con _emojis_.
    - Permite definir la visibilidad de las publicaciones: público, solo seguidos o privado.
    - Permite desactivar comentarios.
    - Permite desactivar notificaciones.
    - Perimte fijar un comentario en el hilo de la publicación.
- **Feed principal**
    - Permite ver las publicaciones recientes de los usuarios seguidos o de toda la red social.
    - Permite reportar publicaciones.
- **Perfiles**
    - Permite fijar un publicación.
    - Permite publicar de forma privada en el perfil de otro usuario.
- **Relaciones e interacciones**
    - Permite seguir y dejar de seguir a otros usuarios.
    - Permite ver la lista de seguidores y seguidos de cualquier usuario.
    - Permite bloquear usuarios.
    - Permite reportar usuarios.
- **Búsqueda**
    - Permite buscar publicaciones públicas o usuarios.
- **Notificaciones**
    - Notifica cuando alguien comenta en una publicación propia o en una en la que se ha participado.
    - Notifica cuando alguien menciona a un usuario.
    - Notifica cuando un usuario comienza a seguir a otro.
- **Panel de administración**
    - Permite desactivar el registro de usuarios y generar invitaciones.
    - Permite crear y gestionar páginas estáticas.
    - Permite gestionar la información de los usuarios registrados.
    - Permite gestionar los reportes rgistrados por los usuarios.
- **Multilenguaje**
    - Interfaz disponible en español e inglés.

## Instalación

### Instalación con Docker

1. Asegúrate de tener instalado [Docker](https://www.docker.com/products/docker-desktop/) y que el servicio esté en ejecución.
2. Descarga o clona este repositorio y accede a la carpeta del proyecto.
3. Renombra el archivo `.env.example` a `.env`.
4. Abre la terminal y ejecuta lo siguiente para instalar las dependencias y levantar los contenedores:

```
docker compose up --watch --build
```

5. Abre `http://localhost/` en tu navegador para ver la aplicación.
6. Abre `http://localhost:8025/` para acceder a MailHog.

### Instalación manual

#### Requisitos

- [PHP 8.3](https://www.php.net/downloads)
- [Composer](https://getcomposer.org/download/)
- Servidor [MySQL 9.3](https://dev.mysql.com/downloads/mysql/) iniciado con base de datos creada.
- [Node.js](https://nodejs.org/es/download)
- [MailHog 1.0.1](https://github.com/mailhog/MailHog/releases/tag/v1.0.1) en ejecución.

#### Instalación y configuración

1. Descarga o clona este repositorio y accede a la carpeta del proyecto.
2. Renombra el archivo `.env.example` a `.env`.
3. Abre el archivo `.env` y reemplaza el bloque `DB_` con tus datos:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=EL_NOMBRE_DE_LA_BASE_DE_DATOS
DB_USERNAME=EL_USUARIO_DE_LA_BASE_DE_DATOS
DB_PASSWORD=LA_CONTRASEÑA_DE_LA_BASE_DE_DATOS
```

4. Ajusta `APP_URL` para que coincida con el puerto usado por la aplicación:

```
APP_URL=http://localhost:8000
```

5. Ejecuta en la terminal lo siguiente para instalar las dependencias PHP:

```
composer install
```

6. Ejecuta lo siguiente para generar la clave de la aplicación:

```
php artisan key:generate
```

7. Ejecuta lo siguiente para crear el enlace simbólico para el acceso público a archivos:

```
php artisan storage:link
```

8. Ejecuta lo siguiente para realizar las migraciones:

```
php artisan migrate --seed
```

9. Ejecuta lo siguiente para instalar las dependencias JavaScript:

```
npm install
```

#### Visualización

1. En la raíz del proyecto, abre la terminal y ejecuta lo siguiente para iniciar las colas:

```
php artisan queue:listen
```

2. Abre otra terminal y ejecuta lo siguiente para iniciar el servidor WebSocket de Reverb:

```
php artisan reverb:start
```

3. En una tercera terminal, ejecuta lo siguiente para iniciar el servidor web:

```
php artisan serve
```

4. En otra terminal, ejecuta lo siguiente para iniciar el entorno de desarrollo de Vite:

```
npm run dev
```

5. Abre `http://localhost:8000/` en tu navegador para visualizar la aplicación.
6. Abre `http://localhost:8025/` para acceder a MailHog.

## Consideraciones

La **primera cuenta registrada** se asignará automáticamente con **rol de administrador**.
