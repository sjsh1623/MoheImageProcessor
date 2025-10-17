FROM node:18-alpine

WORKDIR /app

COPY package.json package.json

RUN npm install --omit=dev

COPY src src
COPY images images

EXPOSE 5200

CMD ["npm", "start"]
