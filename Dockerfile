# Build stage
FROM node:22-alpine3.22 AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY rspack.config.js rspack.config.service.js ./
COPY public/ ./public/
COPY src/ ./src/
COPY .yarnrc.yml ./

RUN corepack enable && corepack install

RUN apk add --no-cache git ca-certificates

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn \
    yarn install

RUN yarn build
RUN yarn build:service

# Runtime stage
FROM node:22-alpine3.22

RUN apk add --no-cache \
    git \
    less \
    openssh \
    ffmpeg \
    python3 \
    uv \
    curl \
    unzip \
    deno

ENV VIRTUAL_ENV=/opt/venv PATH="/opt/venv/bin:$PATH"

RUN uv venv /opt/venv && \
    uv pip install --no-cache-dir -U "yt-dlp[default]" && \
    ln -s /opt/venv/bin/yt-dlp /usr/local/bin/yt-dlp

ENV PATH="/opt/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" HOST=0.0.0.0 WEBROOT=/app/public PORT=8011

WORKDIR /app

COPY --from=build /app/dist/service.js ./
COPY --from=build /app/dist/public ./public
COPY --from=build /app/dist/package.json ./
COPY --from=build /app/dist/swagger.json ./
COPY --from=build /app/.yarnrc.yml ./
COPY --from=build /app/yarn.lock ./

RUN corepack enable && corepack install

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn \
    yarn install

RUN chown -R node:node /app \
  && mkdir -p /app/public/cache/cookies

# USER node

EXPOSE 8011

ENTRYPOINT []
CMD ["/usr/local/bin/node", "service.js"]
