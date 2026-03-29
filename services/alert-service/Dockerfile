FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S datasonar && \
    adduser -S datasonar -u 1001

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER datasonar

EXPOSE 8003

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8003/health || exit 1

CMD ["node", "dist/index.js"]
