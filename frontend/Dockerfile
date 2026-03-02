# Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Build argument for backend URL
ARG REACT_APP_BACKEND_URL=http://localhost

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variable for build
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build the app
RUN yarn build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
