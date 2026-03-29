# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY prisma ./prisma/
COPY src ./src/

# Generate Prisma client then compile TypeScript
RUN npx prisma generate && npm run build

# Stage 2: Production image
FROM node:20-alpine

# Create non-root user for security
RUN addgroup -S datasonar && adduser -S datasonar -G datasonar

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output and Prisma artifacts from build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY prisma ./prisma/

# Own files as non-root user
RUN chown -R datasonar:datasonar /app
USER datasonar

EXPOSE 3000

# Apply migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
