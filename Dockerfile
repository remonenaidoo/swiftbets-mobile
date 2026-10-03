# syntax=docker/dockerfile:1.7
# The betting site: the Expo app exported for the web, served by unprivileged nginx behind the gateway.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
ARG BRAND=swiftbets
ARG SITE_URL=https://swiftbets.swiftsoftwaresystems.co.za
ENV EXPO_PUBLIC_BRAND=$BRAND EXPO_PUBLIC_SITE_URL=$SITE_URL
COPY . .
RUN npx expo export --platform web --output-dir dist && node scripts/seo.mjs dist

FROM nginxinc/nginx-unprivileged:1.29-alpine
USER root
RUN apk upgrade --no-cache && apk add --no-cache --upgrade "pcre2>=10.49" && apk del --no-cache curl
USER 101
# Game provider origins the casino frames, space separated (e.g. "https://games.example.com"). Same-origin games need none.
ENV CASINO_FRAME_ORIGINS="" NGINX_ENVSUBST_OUTPUT_DIR=/tmp
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/frame-origins.conf.template /etc/nginx/templates/frame-origins.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
