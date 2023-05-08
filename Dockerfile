FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json tsconfig.json

COPY src src/

RUN npm install

RUN npm run build

WORKDIR /app/grpc-wrapper

COPY grpc-wrapper/package*.json ./

COPY grpc-wrapper/wallet-manager.proto wallet-manager.proto

COPY grpc-wrapper/index.js index.js

COPY grpc-wrapper/service.js service.js

RUN npm install

RUN npm run build

CMD [ "npm", "run", "start" ]
