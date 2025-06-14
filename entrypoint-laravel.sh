#!/bin/sh
# Ejecuta el script con la shell estándar del sistema.

set -e
# Hace que el script se detenga si ocurre cualquier error.

# Genera la clave de la aplicación.
php artisan key:generate

# Espera a que MySQL esté listo.
dockerize -wait tcp://mysql:3306 -timeout 60s

# Destruye las tablas existentes.
php artisan migrate:fresh

# Crea un enlace simbólico desde public/storage hacia storage/app/public para acceso público a archivos.
php artisan storage:link

# Ejecuta en segundo plano los procesos que manejan las colas de Laravel.
php artisan queue:listen --tries=1 &

# Inicia el servidor WebSocket de Reverb en segundo plano.
php artisan reverb:start &

# Ejecuta pail como usuario www-data para evitar problemas de permisos.
su -s /bin/sh www-data -c "php artisan pail --timeout=0" &

# Inicia Apache.
apache2-foreground