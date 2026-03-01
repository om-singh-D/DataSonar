FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma/ ./prisma/

RUN npm ci
RUN npx prisma generate

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# --- Production stage ---
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S datasonar && \
    adduser -S datasonar -u 1001

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --only=production && npx prisma generate && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER datasonar

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]