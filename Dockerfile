# Usar una imagen oficial de Node.js
FROM node:20

# Crear un directorio para la aplicación
WORKDIR /app

# Copiar los archivos de dependencias primero (para aprovechar el caché de Docker)
COPY package*.json tsconfig.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Compilar TypeScript (esto solo debe ocurrir una vez, al principio)
RUN npm run build  # Asumiendo que tienes un script de build que compila TS a JS

# Exponer el puerto (si es necesario)
EXPOSE 4000

# Comando de inicio: en desarrollo puedes usar tsc --watch
CMD ["npm", "run", "dev"]  # Esto usará ts-node o cualquier script de desarrollo
