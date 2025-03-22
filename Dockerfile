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

# Compilar TypeScript
RUN npm run build

# Exponer el puerto
EXPOSE 4000

# Comando de inicio - sin corchetes ni comas
CMD npm run dev