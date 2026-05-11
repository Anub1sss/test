FROM node:20-alpine AS fe-build
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=fe-build /fe/dist/frontend/browser /usr/share/nginx/html
