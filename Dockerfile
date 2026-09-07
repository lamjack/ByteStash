# Build stage for client
# Pin to the native build platform: the client build emits arch-independent
# static assets, so building under QEMU emulation for arm/v7 is wasteful and
# OOMs Node's ~1GB 32-bit heap cap. Build once natively for every target arch.
FROM --platform=$BUILDPLATFORM node:22-alpine AS client-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --workspace client
COPY client/ ./client/
WORKDIR /app/client
RUN npm run build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

# Copy server source and dependencies
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN apk add --no-cache --virtual .build-deps python3 make g++ gcc && \
      npm ci --omit=dev --workspace server && \
      apk del .build-deps

COPY server/src ./src
COPY server/docs ./docs

# Copy client build
COPY --from=client-build /app/client/build /client/build

# Create output directory
RUN mkdir -p ./data/snippets

EXPOSE 5000

CMD ["node", "src/app.js"]
