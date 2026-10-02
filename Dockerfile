# syntax=docker/dockerfile:1.7
# The betting site: the Expo app exported for the web, served by unprivileged nginx behind the gateway.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx expo export --platform web --output-dir dist

FROM nginxinc/nginx-unprivileged:1.29-alpine
USER root
RUN apk upgrade --no-cache && apk add --no-cache --upgrade "pcre2>=10.49" && apk del --no-cache curl
USER 101
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
