FROM node:latest AS start

WORKDIR /app
COPY package.json .
COPY run.sh .

FROM start AS dev-installation

RUN npm install

FROM dev-installation AS dev

COPY . .

CMD ["bash", "run.sh"]
