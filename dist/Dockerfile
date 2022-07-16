FROM node:16-alpine

ENV HOST=0.0.0.0 ROOT=/app/public PORT=8011

WORKDIR /app
COPY . /app

RUN apk --update add git less openssh && \
    rm -rf /var/lib/apt/lists/* && \
    rm /var/cache/apk/* && \
    cd /app && \
    yarn install


EXPOSE 8011

CMD yarn service