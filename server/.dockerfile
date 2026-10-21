# Usa una imagen ligera de Node
FROM node:22-alpine

# Crea el directorio de trabajo
WORKDIR /app

# Copia solo los archivos de dependencias primero (para aprovechar la caché)
COPY package*.json ./

# Instala dependencias (usando npm ci si tienes package-lock.json)
RUN npm install

# Copia el resto del código
COPY . .

# Compila TypeScript
RUN npm run build

# Expone el puerto (ej. 3000, verifica el tuyo)
EXPOSE 3000

# Comando para iniciar la app compilada
CMD ["npm", "start"]