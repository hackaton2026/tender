# Base stage for shared setup
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
ENV NODE_ENV=development
EXPOSE 8081
CMD ["npm", "run", "web"]

# Builder stage for production
FROM base AS builder
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npx expo export -p web

# Production stage serving static files with Nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]