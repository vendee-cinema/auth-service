FROM node:24.12.0 AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y curl \
  && curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun prisma generate
RUN bun run build

FROM node:24.12.0 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
CMD ["node", "dist/src/main"]