FROM node:latest

RUN apt-get update

COPY ./run.sh /run.sh

ENTRYPOINT ["/bin/bash", "/run.sh"]
