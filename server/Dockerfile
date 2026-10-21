FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm install tsx typescript

COPY . .

RUN mkdir -p data uploads

EXPOSE 3000

CMD ["node", "--import", "tsx/esm", "src/server.ts"]
