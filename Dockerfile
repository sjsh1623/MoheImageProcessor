FROM node:18-alpine

WORKDIR /app

COPY package.json package.json

RUN npm install --omit=dev

COPY src src
COPY images images

EXPOSE 3000

CMD ["npm", "start"]
