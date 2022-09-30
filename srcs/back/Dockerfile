FROM node:latest AS start

WORKDIR /app
COPY package.json .
COPY run.sh .
COPY webpack-hmr.config.js /app/

FROM start AS dev-installation

RUN npm install

FROM dev-installation AS dev

COPY . .


CMD ["bash", "run.sh"]
