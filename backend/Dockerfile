# ==========================================
# Stage 1: Build & Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json tsconfig.json ./

# Install all dependencies (including devDependencies for tsc)
RUN npm ci

# Copy source code files
COPY src ./src

# Build the project (compiles src/ to dist/)
RUN npm run build

# ==========================================
# Stage 2: Runtime Environment
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package descriptors
COPY package*.json ./

# Install ONLY production dependencies to optimize image size
RUN npm ci --only=production

# Copy compiled JavaScript output from build stage
COPY --from=builder /app/dist ./dist

# Create local data directory for file-based database fallback
RUN mkdir -p data

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "dist/index.js"]
