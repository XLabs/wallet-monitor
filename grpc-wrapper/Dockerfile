FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY wallet-manager.proto wallet-manager.proto

COPY service.js service.js

RUN npm build

RUN npm install

CMD [ "node", "./service.js" ]
