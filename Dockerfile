FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json tsconfig.json

COPY src src

COPY grpc grpc

RUN npm install

RUN npm run build-grpc

RUN npm run build

CMD [ "node", "./grpc/index.js" ]
