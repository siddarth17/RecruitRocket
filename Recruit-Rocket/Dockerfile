FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from the previous stage
COPY --from=builder /app/dist ./dist

# Use non-root user
USER node

# Serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]
