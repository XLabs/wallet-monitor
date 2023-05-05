FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY wallet-manager_pb.js wallet-manager_pb.js

COPY wallet-manager_grpc_pb.js wallet-manager_grpc_pb.js

COPY service.js service.js

RUN npm install

CMD [ "node", "./service.js" ]
