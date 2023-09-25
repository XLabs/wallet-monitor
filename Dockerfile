FROM node:18-alpine

RUN apk --no-cache add build-base python3

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json tsconfig.json

COPY src src/

RUN npm ci

RUN npm run build-grpc

RUN npm run build

CMD [ "npm", "run", "start-service" ]
