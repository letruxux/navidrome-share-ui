FROM oven/bun:1 AS frontend
WORKDIR /app
COPY client/package.json client/bun.lock ./
RUN bun install --frozen-lockfile
COPY client/ ./client/
COPY types.ts tsconfig.json ./
RUN cd client && bun run build

FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY index.ts types.ts tsconfig.json ./
COPY --from=frontend /app/client/dist ./client/dist

EXPOSE 3006
CMD ["bun", "run", "index.ts"]
