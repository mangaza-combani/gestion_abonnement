# Multi-stage build for React app
FROM node:18-alpine AS base

# Install dependencies needed for node-gyp
RUN apk add --no-cache python3 make g++

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built assets to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactuser -u 1001

# Set ownership
RUN chown -R reactuser:nodejs /usr/share/nginx/html
RUN chown -R reactuser:nodejs /var/cache/nginx
RUN chown -R reactuser:nodejs /var/log/nginx
RUN chown -R reactuser:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R reactuser:nodejs /var/run/nginx.pid

USER reactuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]