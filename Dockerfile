# Use a lightweight Node.js image
FROM node:22-slim

WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy package.json first (to optimize caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy Prisma schema BEFORE running `prisma generate`
COPY prisma ./prisma/

# Set Prisma schema location explicitly
ENV PRISMA_SCHEMA_PATH=/app/prisma/schema.prisma

# Generate Prisma client
RUN npx prisma generate --schema=$PRISMA_SCHEMA_PATH

# Copy the rest of the application
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
