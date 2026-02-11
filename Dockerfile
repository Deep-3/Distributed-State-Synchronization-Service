# Use a lightweight Node.js image for building
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml before running install
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# Use a lightweight Node.js image for production
FROM node:20-alpine AS runtime

# Set the working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

RUN apk add --no-cache curl


# Set the command to run the application
CMD ["node", "dist/main.js"]