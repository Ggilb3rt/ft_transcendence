FROM node:latest AS start

WORKDIR /app
COPY package.json .

FROM start AS dev-installation

RUN npm install

FROM dev-installation AS dev

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "start"]
