# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create media directory for static files
RUN mkdir -p media

# Expose the port
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=PRODUCTION
ENV PORT=5001

# Start the application
CMD ["pnpm", "start"]