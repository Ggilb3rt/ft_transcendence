FROM node:13 AS start

WORKDIR /app
COPY package.json .

FROM start AS dev-installation

RUN npm install

FROM dev-installation AS dev

COPY . .
CMD ["npm", "run", "start"]
