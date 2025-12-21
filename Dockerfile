FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN mkdir -p /app/data

ENV DB_STORAGE=/app/data/dev.sqlite
ENV NODE_ENV=production
ENV APP_PORT=8050
ENV DB_LOGGING=false

EXPOSE 8050

CMD ["npm", "start"]
