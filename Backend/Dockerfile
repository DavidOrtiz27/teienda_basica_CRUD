# Imagen oficial de Deno
FROM denoland/deno:alpine-1.42.4

# Establece el directorio de trabajo
WORKDIR /app

# Copia el código fuente
COPY . .

# Exponer el puerto de la API
EXPOSE 8000

# Comando para ejecutar la app con los permisos necesarios
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "--watch", "app.ts"] 