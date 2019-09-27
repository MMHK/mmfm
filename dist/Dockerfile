FROM node:12-alpine

ENV HOST=0.0.0.0 ROOT=/app/public PORT=8011

WORKDIR /app
COPY . /app

RUN cd /app \
&& yarn install

EXPOSE 8011

CMD node ./service.js -b $HOST -d $ROOT -p $PORT