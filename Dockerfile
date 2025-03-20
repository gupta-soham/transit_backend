# Use a lightweight Node.js image
FROM node:22-slim

WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy package files first (for better Docker caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the port your application runs on
EXPOSE 8000

# Run the application
CMD ["npm", "start"]
