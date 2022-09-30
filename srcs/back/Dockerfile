FROM node:latest AS start

WORKDIR /app
COPY package.json .
COPY run.sh .
COPY webpack-hmr.config.js /app/

FROM start AS dev-installation

RUN npm install
RUN npm install @nestjs/websockets @nestjs/platform-socket.io

FROM dev-installation AS dev

COPY . .


CMD ["bash", "run.sh"]
