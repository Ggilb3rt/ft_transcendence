FROM node:latest AS start

WORKDIR /app
COPY package.json .
COPY run.sh .
COPY webpack-hmr.config.js /app/

FROM start AS dev-installation

RUN npm install

FROM dev-installation AS dev

COPY . .
COPY security /app/

RUN chmod -R 755 /app/security
RUN openssl req -x509 -nodes -newkey rsa:2048 -keyout /app/security/keytmp.pem -out /app/security/cert.pem -subj "/C=FR/ST=PARIS/L=PARIS/O=42/OU=Stud/CN=localhost" -days 365
RUN openssl rsa -in /app/security/keytmp.pem -out /app/security/key.pem


CMD ["bash", "run.sh"]
