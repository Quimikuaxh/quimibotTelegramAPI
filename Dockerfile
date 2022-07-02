FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npx tsc
ENTRYPOINT ["node", "build/bot.js"]