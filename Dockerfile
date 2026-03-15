# Stage 1: Build the Expo Web app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (use npm ci for reliable builds)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the web version of the Expo app (outputs to the 'dist' folder)
# We pass environment variables here if needed for the build process
RUN npx expo export -p web

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the built files from the builder stage to Nginx's default public directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if you need client-side routing support (like Expo Router on web)
# Since Expo Router relies on HTML5 history mode, we must configure Nginx to fallback to index.html
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $$uri $$uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]