# Service frontend du gabarit : export statique de Next.js, servi par nginx sur le port 80.
# Nginx vient du paquet Alpine (apk), pas de l'image docker.io/library/nginx : le rate-limit
# anonyme de Docker Hub, partagé par la plateforme, bloquait ce pull pendant le hackathon.
FROM docker.io/library/node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM docker.io/library/node:24-alpine
RUN apk add --no-cache nginx
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
