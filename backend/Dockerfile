FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=5000
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --chown=node:node . .
RUN mkdir -p uploads && chown node:node uploads
USER node

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" >/dev/null || exit 1

CMD ["node", "server.js"]
